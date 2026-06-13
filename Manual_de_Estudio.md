# 📖 GUÍA DE ESTUDIO EXHAUSTIVA: KOVA MAPS (DE INICIO A FIN)

Este documento es el análisis más profundo y detallado de tu proyecto. Aquí vamos a diseccionar cada archivo, cada función y la razón matemática e informática de cada línea de código para que domines el proyecto al 100%.

---

## 🏗️ 1. INTRODUCCIÓN Y ARQUITECTURA GENERAL
El proyecto **Kova Maps** es un Ruteador Logístico enfocado en transporte de carga. 
A diferencia de Google Maps (que solo te dice cómo llegar), este proyecto evalúa la viabilidad financiera, normativa y de seguridad de la ruta.

### Arquitectura Cliente-Servidor (API REST)
El sistema está dividido en dos grandes bloques que no se tocan entre sí, solo se comunican enviándose mensajes de texto (JSON) a través de la red:
1. **Frontend (El Cliente - Navegador):** Escrito en HTML, CSS y Javascript. Su trabajo es interactuar con el usuario, mostrar el mapa interactivo (usando la librería **Leaflet**), trazar calles consumiendo la API de **OSRM**, y mostrar los resultados visuales.
2. **Backend (El Servidor - Python):** Escrito en Python 3 utilizando el framework **Flask**. Su trabajo es recibir toda la ruta que dibujó el frontend, y aplicar matemática pura para deducir distancias, cobros de peaje, zonas rojas, y normativas de ley.

---

## 🐍 2. DESGLOSE DEL BACKEND (`app.py`) DE INICIO A FIN

El archivo `app.py` es el cerebro del proyecto. Se encarga de la lógica dura.

### A. Inicialización y Carga en Memoria (RAM)
Al inicio del archivo importamos librerías (`flask`, `json`, `math`). Luego inicializamos Flask y cargamos las casetas en memoria RAM:
```python
app = Flask(__name__, static_folder='static')

# Carga de la base de datos de Casetas
with open('casetas_mexico.json', 'r', encoding='utf-8') as f:
    casetas = json.load(f)
```
**¿Por qué en memoria?** Cargar el archivo JSON al iniciar el servidor hace que las casetas vivan en la memoria RAM de Python. Así, cuando el usuario pide 100 rutas, no tenemos que abrir y leer el archivo 100 veces del disco duro, lo cual sería lentísimo.

### B. El Motor Geométrico: La Distancia de Manhattan ($L_1$)
Esta es la función más importante del servidor. Recibe dos tuplas de coordenadas `(lat1, lon1)` y `(lat2, lon2)` y calcula la distancia entre ellas formando ángulos de 90° (como calles de cuadrícula).

```python
def distancia_manhattan(p1, p2):
    lat1, lon1 = p1
    lat2, lon2 = p2
    
    # Diferencia de latitud convertida a Kilómetros (1 grado = 111 km)
    km_lat = abs(lat1 - lat2) * 111
    
    # Diferencia de longitud convertida a Kilómetros (compensando la curvatura terrestre)
    km_lon = abs(lon1 - lon2) * 111 * cos(radians((lat1+lat2)/2))
    
    return km_lat + km_lon
```
**Defensa de la Fórmula:**
1. **`abs()` (Valor Absoluto):** Evita que las distancias salgan negativas si vas de norte a sur.
2. **`* 111`:** El planeta Tierra tiene unos 40,000 km de circunferencia, divididos en 360 grados. $40,000 / 360 \approx 111.1$ kilómetros. Esto convierte grados imaginarios en distancia real en el mundo.
3. **`cos(radians(...))`:** Los meridianos (norte a sur) siempre están paralelos, pero la longitud (este a oeste) se comprime en los polos. El coseno de la latitud promedio arregla esa distorsión.

### C. La API Open-Elevation (Desnivel Acumulado)
El servidor también castiga el uso de combustible si la ruta va de subida a una montaña.
```python
def obtener_desnivel_acumulado(ruta_muestra):
    # Toma 1 punto cada 20 para no saturar la API
    paso = max(1, len(ruta_muestra) // 20)
    puntos = ruta_muestra[::paso]
    
    # Llamada asíncrona a open-elevation.com
    # ...
    for i in range(len(elevaciones) - 1):
        dif = elevaciones[i+1] - elevaciones[i]
        if dif > 0: # Si la diferencia es positiva, fuimos de subida
            desnivel_positivo += dif
```
**Defensa del Código:** Hacemos **sub-muestreo** matemático (`[::paso]`). Si mandamos 5,000 puntos a la API pública nos bloqueará por saturación. Por eso sacamos una pequeña "muestra" de máximo 20 puntos a lo largo de toda la ruta para tener una idea general de si la ruta subió o bajó, sumando solo las variaciones positivas (`dif > 0`).

### D. El Endpoint Principal (`/analisis_ruta`)
Aquí ocurre el procesamiento pesado.
#### 1. El Filtro Espacial (Bounding Box)
```python
# Bounding Box Filter
min_lat = min(p['lat'] for p in ruta) - 0.05
max_lat = max(p['lat'] for p in ruta) + 0.05
# ...
casetas_candidatas = [c for c in casetas if min_lat <= c['lat'] <= max_lat ...]
```
**Defensa Computacional:** El algoritmo de fuerza bruta evaluaría cada punto del viaje contra cada caseta del país, resultando en una complejidad de $O(P \times C)$. El **Bounding Box** crea un rectángulo que envuelve el viaje del camión (con `0.05` grados de "colchón" de seguridad). Esto destruye la complejidad y la reduce a una simple pasada por las casetas que estén dentro del cuadro, haciendo que la respuesta de tu servidor sea ultra rápida (Optimización $O(N)$).

#### 2. Cálculo de Peajes (Casetas Cruzadas)
```python
for punto in ruta:
    for c in casetas_candidatas:
        caseta_punto = (c['lat'], c['lon'])
        if distancia_manhattan(caseta_punto, (punto['lat'], punto['lon'])) < 1.0: # A menos de 1km
            
            # Anti-Duplicidad
            duplicada = False
            for cruzada in casetas_cruzadas:
                if distancia_manhattan((cruzada['lat'], cruzada['lon']), caseta_punto) < 2.0:
                    duplicada = True
                    break
```
**Defensa del Cobro:** El algoritmo detecta que estamos a menos de 1 km de la coordenada de la caseta usando Manhattan. Si sí, revisa un arreglo llamado `casetas_cruzadas`. Si ya cobramos una caseta que estaba a menos de `2.0` kilómetros de esta, asume que es la **misma plaza de cobro física** y activa el candado anti-duplicidad (`duplicada = True`) para no cobrarle doble al cliente.

#### 3. Detección de Zonas Críticas
```python
for zona in zonas_criticas_candidatas:
    zona_punto = (zona['lat'], zona['lon'])
    for punto in ruta:
        if distancia_manhattan(zona_punto, p) <= zona['radio_km']:
            # Lanza alerta
```
**Defensa Métrica:** Compara el `punto` del camión contra el epicentro (`zona_punto`). Si la función `distancia_manhattan` escupe un número que es Menor o Igual (`<=`) al radio de peligro de esa zona, estamos dentro.

#### 4. Cálculos Normativos (Sueldo, Descansos y Desgaste)
```python
# NOM-087: Todo operador debe descansar 30 minutos por cada 14 horas manejadas.
horas_descanso = (horas_conduccion // 14.0) * 0.5
horas_totales_laboradas = horas_conduccion + horas_descanso
sueldo_operador = horas_totales_laboradas * 85.0 # Paga por hora
```

---

## 🖥️ 3. DESGLOSE DEL FRONTEND (`index.html`) DE INICIO A FIN

El frontend es el que gobierna la experiencia de usuario interactuando con la librería **Leaflet** (una de las librerías de mapas Open Source más potentes).

### A. Configuración de LRM (Leaflet Routing Machine)
```javascript
controlRuta = L.Routing.control({
  waypoints: puntosIntermedios.map(p => p.latlng),
  routeWhileDragging: false,
  showAlternatives: true,
  altLineOptions: { styles: [{color: 'transparent', opacity: 0, weight: 0}] },
  router: L.Routing.osrmv1({ language: 'es' }),
  lineOptions: { styles: [{ color: '#448aff', opacity: 0.6, weight: 5 }] }
})
```
**Defensa:** 
*   **`showAlternatives: true`:** Le pide a la API OSRM que nos calcule rutas extra en caso de bloqueos.
*   **`altLineOptions` a Transparente:** La librería dibuja líneas grises confusas para esas alternativas. Al ponerles opacidad cero, "engañamos" a la librería, ocultándolas de la vista del usuario para que nosotros las controlemos con el código del Botón.
*   **`L.Routing.osrmv1`:** Es el motor de ruteo que usamos, mantenido por OpenStreetMap. Es 100% gratuito, lo cual justifica económicamente este proyecto vs Google Maps Platform.

### B. Consumo de nuestra propia API REST (`fetch`)
Una vez que el mapa traza la calle, Leaflet nos regala un evento llamado `routeselected`. Cuando ocurre esto, JavaScript empaqueta los miles de puntitos y se los dispara a nuestro Python:
```javascript
fetch('/analisis_ruta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        ruta: coordsRutaCompleta,
        distancia_km: distancia,
        # ...
    })
})
.then(response => response.json())
.then(data => {
    // Renderizado visual...
})
```
**Defensa:** Se utiliza `fetch`, la API moderna de JavaScript para comunicación HTTP. Mandamos un "Payload" (carga) estructurada en JSON por el método `POST` (seguro y masivo) porque un URL `GET` no soportaría la cantidad bestial de coordenadas de la ruta.

### C. Los Círculos Rojos de Precaución (El Renderizado Permanente)
Al contestar el backend, el frontend pinta los círculos de peligro:
```javascript
const zonasInfo = data.zonas_criticas_info || [];
zonasInfo.forEach(info => {
    let circulo = L.circle([info.lat, info.lon], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.2,
        weight: 2,
        radius: info.radio_km * 1000
    }).addTo(mapa);
});
```
**Defensa:** Se movió este bloque a la raíz principal (sin condicionales) para que Leaflet **siempre** instancie (`L.circle`) y pinte las zonas de peligro al arrancar. El radio es convertido a metros multiplicando por 1000 obligatoriamente por la sintaxis estricta de Leaflet.

### D. La Magia Matemática del Botón "Cambio de Ruta"
```javascript
window.cambiarRuta = function() {
    if (rutasEncontradas.length > 1 && controlRuta) {
        indiceRutaActual = (indiceRutaActual + 1) % rutasEncontradas.length;
        
        // Disparar evento para forzar recalculo del backend
        controlRuta.fire('routeselected', {route: rutasEncontradas[indiceRutaActual]});
        
        // Pinta manualmente el nuevo camino
        if (window.rutaFalsa) mapa.removeLayer(window.rutaFalsa);
        window.rutaFalsa = L.polyline(rutasEncontradas[indiceRutaActual].coordinates, { color: '#448aff', weight: 5 }).addTo(mapa);
    }
};
```
**Defensa:**
1.  Esta función vive en el objeto Global `window` para que HTML pueda mandarla a llamar desde un botón sin importar dónde viva.
2.  Usa el operador módulo (`%`). Si el arreglo tiene tamaño 3, al llegar al índice 3 regresará al 0 automáticamente `(3 % 3 = 0)`.
3.  Usa el método `.fire()` que "simula" que el usuario hizo un clic físico en un botón oculto de Leaflet. Esto engaña al código de arriba (el `fetch`) para que se vuelva a ejecutar automáticamente y actualice todo tu panel derecho (Costos, Casetas) sin escribir código duplicado.

---

## 🧐 4. FAQ Y PREGUNTAS MORTALES DE EXAMEN

Para estar cubierto al 100%, memoriza o entiende estas justificaciones a preguntas difíciles que buscan tirar tu proyecto:

**1. "Veo que usas OSRM para trazar las calles azules. ¿Entonces para qué me sirvió enseñarte la distancia de Manhattan si no la usas en el mapa principal?"**
> **R:** "El mapa principal no usa Manhattan para las calles porque los camiones de carga de la vida real no pueden atravesar propiedades privadas para cumplir el ángulo de 90°. OSRM se usa porque requiere grafos del mundo real (calles, puentes, sentidos vehiculares). **PERO**, yo sí apliqué la distancia de Manhattan en el Servidor (Backend) para crear mi propio motor de detección de colisiones. La proximidad de las Casetas de Cobro y las Zonas Rojas está completamente validada en el backend usando única y exclusivamente la ecuación de Distancia de Manhattan ($L_1$), ahorrando poder de cómputo."

**2. "¿Cómo garantizas que el algoritmo de casetas no se confunda y te cobre dos veces la misma si el camión se frena ahí?"**
> **R:** "Programé una heurística de anti-duplicidad en `app.py`. Mantiene un historial de `casetas_cruzadas`. Cuando el camión registra una caseta, la guarda. Si en los siguientes metros intenta registrar una caseta, el sistema mide la distancia entre ambas con Manhattan. Si detecta que la nueva caseta está a menos de 2 kilómetros de la anterior, deduce lógicamente que se trata de la misma plaza de peaje física, cancela el cobro (Duplicada=True) y avanza."

**3. "¿Para qué rayos hiciste una arquitectura cliente-servidor si podías poner todo el código de Manhattan dentro del JavaScript del mapa?"**
> **R:** "Por escalabilidad y seguridad de la información. La lógica de cobros, sueldos y la base de datos oficial de casetas no debe vivir en el navegador del cliente porque podría ser hackeada o manipulada fácilmente desde la consola del navegador. Además, las matemáticas de iteración de miles de puntos bloquearían (congelarían) la pestaña del usuario por estar atascadas en el 'Event Loop' del V8 de JavaScript. Usando Python y Flask, derivo toda la computación pesada al núcleo del servidor."

**4. "¿Por qué tu programa le hace caso al 'Desnivel' si los camiones andan en carretera?"**
> **R:** "La resistencia aerodinámica y la gravedad impactan severamente los motores Diesel. Mandando una muestra reducida de la ruta a la API `Open-Elevation`, comparo la diferencia de altitud entre un punto y el siguiente. Si esa diferencia es positiva, se suma al 'Desnivel Acumulado'. Por cada 100 metros de ascenso total, mi algoritmo penaliza al sistema con un incremento del 1% en el consumo del tanque de combustible."
