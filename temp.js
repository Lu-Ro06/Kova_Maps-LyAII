

    :root {
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --bg-glass: rgba(15, 23, 42, 0.75);
      --border-glass: rgba(255, 255, 255, 0.1);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #8b5cf6;
    }

    body {
      margin: 0;
      height: 100vh;
      font-family: 'Inter', sans-serif;
      background-color: #0f172a;
      display: flex;
      overflow: hidden;
    }

    #mapa {
      flex: 1;
      z-index: 0;
    }

    #sidebar {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 360px;
      background: var(--bg-glass);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      color: var(--text-main);
      padding: 1.5rem;
      border-radius: 16px;
      border: 1px solid var(--border-glass);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px inset rgba(255, 255, 255, 0.05);
      z-index: 1000;
      font-size: 0.95rem;
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 40px);
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--primary) transparent;
    }

    #sidebar::-webkit-scrollbar {
      width: 6px;
    }
    #sidebar::-webkit-scrollbar-thumb {
      background-color: var(--primary);
      border-radius: 10px;
    }

    #sidebar h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: transparent;
      background: linear-gradient(135deg, #60a5fa, #c084fc);
      -webkit-background-clip: text;
      background-clip: text;
      text-align: center;
      font-weight: 800;
      font-size: 1.8rem;
      letter-spacing: -0.5px;
    }

    .grupo-entrada {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin-bottom: 1.5rem;
    }

    input.entrada-ubicacion, select {
      padding: 0.7rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(0, 0, 0, 0.2);
      outline: none;
      font-size: 1rem;
      color: #fff;
      width: 100%;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
    }

    input.entrada-ubicacion:focus, select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
      background: rgba(0, 0, 0, 0.3);
    }

    select option {
      background: #1e293b;
      color: #fff;
    }

    button {
      cursor: pointer;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      padding: 0.7rem;
      color: white;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 100%;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
      filter: brightness(1.1);
    }

    button:active {
      transform: translateY(1px);
    }

    #resultados {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .resultado-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 0.8rem 1rem;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: fadeIn 0.4s ease forwards;
      opacity: 0;
      transform: translateY(10px);
    }

    @keyframes fadeIn {
      to { opacity: 1; transform: translateY(0); }
    }

    .resultado-card i {
      font-size: 1.3rem;
      width: 24px;
      text-align: center;
    }

    .resultado-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .resultado-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      margin-bottom: 2px;
    }

    .resultado-value {
      font-weight: 600;
      font-size: 0.95rem;
    }

    /* Colores específicos de icono */
    .icon-dist { color: #38bdf8; }
    .icon-time { color: #f472b6; }
    .icon-gas { color: #a3e635; }
    .icon-elev { color: #fbbf24; }
    .icon-toll { color: #facc15; }
    .icon-op { color: #818cf8; }
    .icon-alert { color: #f87171; }
    .icon-total { color: #34d399; font-size: 1.5rem !important; }

    #caseta {
      max-height: 140px;
      overflow-y: auto;
      scrollbar-width: thin;
    }
    
    #caseta::-webkit-scrollbar { width: 4px; }
    #caseta::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.2); }

    .caseta-item {
      font-size: 0.85rem;
      padding: 3px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .caseta-item:last-child { border-bottom: none; }

    .total-card {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3));
      border-color: rgba(16, 185, 129, 0.4);
      margin-top: 0.5rem;
    }
    .total-card .resultado-value {
      font-size: 1.2rem;
      color: #10b981;
    }

    #listaPuntos {
      margin-top: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid rgba(255,255,255,0.05);
    }
    
    .ui-autocomplete {
      position: absolute !important;
      z-index: 2000 !important;
      max-height: 200px;
      overflow-y: auto;
      background: var(--bg-glass) !important;
      backdrop-filter: blur(10px);
      border: 1px solid var(--primary) !important;
      border-radius: 8px;
      color: white !important;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .ui-autocomplete li:hover {
      background: var(--primary) !important;
      color: white !important;
      border: none;
    }

    .modal-glass {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
      z-index: 3000; display: flex; justify-content: center; align-items: center;
    }
    .modal-glass.d-none { display: none !important; }
    .modal-content-glass {
      background: var(--bg-glass); border: 1px solid var(--primary);
      border-radius: 16px; width: 90%; max-width: 500px; max-height: 85vh;
      display: flex; flex-direction: column; color: white;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .modal-header {
      padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header h4 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #60a5fa; }
    .btn-close-glass {
      background: transparent; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0; width: auto; box-shadow: none; transition: transform 0.2s;
    }
    .btn-close-glass:hover { transform: scale(1.2); box-shadow: none; color: #f87171;}
    .modal-body { padding: 1rem 1.5rem; overflow-y: auto; flex: 1; scrollbar-width: thin; }
    .modal-body::-webkit-scrollbar { width: 6px; }
    .modal-body::-webkit-scrollbar-thumb { background-color: var(--primary); border-radius: 10px; }
    
    .indicacion-paso {
      padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 15px; align-items: center;
    }
    .indicacion-icono { font-size: 1.5rem; color: var(--accent); }
    .indicacion-texto { flex: 1; font-size: 0.95rem; }
    .indicacion-dist { font-size: 0.85rem; color: #34d399; font-weight: bold; white-space: nowrap;}
    
    .btn-secundario {
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); box-shadow: none;
    }
    .btn-secundario:hover {
      background: rgba(255,255,255,0.2); box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }


      






    let mapa = L.map('mapa').setView([19.4326, -99.1332], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

    let controlRuta = null;
    let puntosIntermedios = [];
    let marcadores = [];
    let marcadorAuto = null;
    let animacionIntervalo = null;
    let capasZonas = []; 
    let marcadoresCasetas = []; 

    function mostrarIndicaciones() { document.getElementById('modalIndicaciones').classList.remove('d-none'); }
    function cerrarIndicaciones() { document.getElementById('modalIndicaciones').classList.add('d-none'); }

    const preciosGasolina = {
      magna: 23.49,
      premium: 25.99,
      diesel: 25.15
    };

    const consumoPorCilindro = {
      4: 10,
      6: 6,
      8: 4
    };

    function agregarRuta() {
      const entrada = document.getElementById('entradaLugar');
      const ubicacion = entrada.value.trim();
      if (!ubicacion) return;

      $.getJSON(`https://nominatim.openstreetmap.org/search?format=json&q=${ubicacion}`, function(data) {
        if (data && data.length > 0) {
          const latLng = L.latLng(data[0].lat, data[0].lon);
          puntosIntermedios.push({ nombre: ubicacion, latlng: latLng });
          agregarMarcador(latLng, ubicacion);
          actualizarListaPuntos();
        } else {
          alert('Ubicación no encontrada');
        }
      });
      entrada.value = '';
    }

    function agregarMarcador(latLng, texto) {
      const marcador = L.marker(latLng, { draggable: true }).addTo(mapa);
      marcador.bindPopup(texto).openPopup();
      marcador.on('dragend', () => {
        const idx = marcadores.indexOf(marcador);
        if (idx !== -1) {
          puntosIntermedios[idx].latlng = marcador.getLatLng();
          actualizarListaPuntos();
          if (controlRuta) actualizarRuta();
        }
      });
      marcadores.push(marcador);
    }

    function actualizarRuta() {
      if (controlRuta) {
        mapa.removeControl(controlRuta);
        controlRuta = null;
      }

      if (puntosIntermedios.length > 1) {
        controlRuta = L.Routing.control({
          waypoints: puntosIntermedios.map(p => p.latlng),
          routeWhileDragging: false,
          router: L.Routing.osrmv1({ language: 'es' }),
          createMarker: () => null,
          lineOptions: { styles: [{ color: '#448aff', opacity: 1, weight: 5 }] }
        }).on('routesfound', function (e) {
          const resumen = e.routes[0].summary;
          const distancia = resumen.totalDistance / 1000;
          const tipoGasolina = document.getElementById('tipoGasolina').value;
          const cilindros = parseInt(document.getElementById('cilindros').value);
          const consumo = consumoPorCilindro[cilindros]; // km por litro
          const precioGas = preciosGasolina[tipoGasolina];

          // Cálculo corregido
          const litros = distancia / consumo;
          const costoGasolina = litros * precioGas;

          const tiempoHoras = distancia / 70;
          const minutos = Math.round(tiempoHoras * 60);

          // Limpiar resultados previos
          document.getElementById('resultados').innerHTML = '';
          marcadoresCasetas.forEach(m => mapa.removeLayer(m));
          marcadoresCasetas = [];
          
          const coordsRutaCompleta = e.routes[0].coordinates;
          const instrucciones = e.routes[0].instructions;
          
          // Generar Indicaciones
          let htmlPasos = '';
          
          instrucciones.forEach((inst, index) => {
            let icon = 'bi-arrow-up-circle';
            if(inst.type === 'Turn') icon = inst.modifier.includes('Right') ? 'bi-arrow-right-circle' : 'bi-arrow-left-circle';
            else if(inst.type === 'DestinationReached') icon = 'bi-geo-alt-fill';
            else if(inst.type === 'Roundabout') icon = 'bi-arrow-repeat';
            
            let distStr = inst.distance > 1000 ? (inst.distance/1000).toFixed(1) + ' km' : inst.distance + ' m';
            
            htmlPasos += `
          });
          
          document.getElementById('listaIndicaciones').innerHTML = htmlPasos;
          document.getElementById('btnIndicaciones').style.display = 'block';
          
          // Helper para crear cards
          const addCard = (id, iconClass, label, value, delay, extraClass='') => {
            const container = document.getElementById('resultados');
            container.innerHTML += `
            `;
          };

          addCard('distancia', 'bi-signpost-split icon-dist', 'Distancia', `${distancia.toFixed(2)} km`, 0);
          addCard('tiempo', 'bi-clock-history icon-time', 'Tiempo Estimado', `${minutos} min`, 0.1);
          
          fetch('/analisis_ruta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ruta: coordsRutaCompleta.map(p => ({
                lat: p.lat,
                lon: p.lng
              })),
              tiempo_minutos: minutos
            })
          })
          .then(response => response.json())
          .then(data => {
            const costoCaseta = data.costo_casetas || 0;
            const tiempoOperador = data.tiempo_operador_horas || 0;
            const desnivel = data.desnivel_metros || 0;
            const zonas = data.zonas_criticas_detectadas || [];
            
            // Factor de desnivel
            const factorElevacion = 1 + ((desnivel / 100) * 0.01);
            const litrosReales = litros * factorElevacion;
            const costoGasolinaReal = litrosReales * precioGas;
            
            addCard('gasolina', 'bi-fuel-pump icon-gas', 'Combustible', `${litrosReales.toFixed(2)} L ($${costoGasolinaReal.toFixed(2)})`, 0.2);
            
            if (desnivel > 0) {
              addCard('desnivel', 'bi-moisture icon-elev', 'Desnivel Acumulado', `${desnivel.toFixed(0)}m (+${((factorElevacion-1)*100).toFixed(1)}% gas)`, 0.3);
            }

            const casetasCruzadas = data.casetas_cruzadas || [];
            
            if (casetasCruzadas.length > 0) {
              
              // Tarjeta 1: Lista de Casetas
              
              // Tarjeta 2: Total de Casetas Aparte
              addCard('caseta_total', 'bi-cash-coin icon-toll', `Costo Peajes`, `$${costoCaseta.toFixed(2)} MXN`, 0.45);

              // Agregar marcadores al mapa
              casetasCruzadas.forEach(c => {
                let iconoCaseta = L.icon({
                  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3214/3214532.png',
                  iconSize: [28, 28],
                  iconAnchor: [14, 28],
                  popupAnchor: [0, -28]
                });
                let marker = L.marker([c.lat, c.lon], { icon: iconoCaseta }).addTo(mapa);
                marcadoresCasetas.push(marker);
              });

            } else {
              addCard('caseta_total', 'bi-cash-coin icon-toll', 'Costo Peajes', '$0.00 MXN', 0.4);
            }
            
            const horasOp = Math.floor(tiempoOperador);
            const minOp = Math.round((tiempoOperador - horasOp) * 60);
            addCard('tiempo_operador', 'bi-person-workspace icon-op', 'Tiempo Operador (NOM-087)', `${horasOp}h ${minOp}m`, 0.5);
            
            if (zonas.length > 0) {
              addCard('zonas', 'bi-exclamation-triangle-fill icon-alert', 'Zonas Críticas (Riesgo)', zonas.join(', '), 0.6);
            }
            
            // Dibujar zonas en el mapa
            capasZonas.forEach(c => mapa.removeLayer(c));
            capasZonas = [];
            if (data.zonas_criticas_info) {
              data.zonas_criticas_info.forEach(z => {
                let circle = L.circle([z.lat, z.lon], {
                  color: z.riesgo === 'Alto' ? 'red' : (z.riesgo === 'Medio' ? 'orange' : 'yellow'),
                  fillColor: z.riesgo === 'Alto' ? '#f03' : '#f90',
                  fillOpacity: 0.2,
                  radius: z.radio_km * 1000 // Leaflet usa metros
                }).addTo(mapa);
                capasZonas.push(circle);
              });
            }

            const totalViaje = costoCaseta + costoGasolinaReal;
            addCard('total', 'bi-wallet2 icon-total', 'Gran Total del Viaje', `$${totalViaje.toFixed(2)} MXN`, 0.7, 'total-card');
          })
          .catch(e => {
            console.error("Error fetching analisis_ruta:", e);
            addCard('total', 'bi-wallet2 icon-total', 'Gran Total del Viaje', `$${costoGasolina.toFixed(2)} MXN`, 0.7, 'total-card');
          });

          iniciarAnimacionAuto(e.routes[0].coordinates);
        }).addTo(mapa);

        mapa.fitBounds(L.latLngBounds(puntosIntermedios.map(p => p.latlng)));
      }
    }

    function iniciarAnimacionAuto(coords) {
      if (marcadorAuto) mapa.removeLayer(marcadorAuto);
      if (animacionIntervalo) clearInterval(animacionIntervalo);
      if (!coords.length) return;

      let index = 0;
      marcadorAuto = L.marker(coords[0], {
        icon: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/3085/3085330.png',
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        })
      }).addTo(mapa);

      animacionIntervalo = setInterval(() => {
        index++;
        if (index >= coords.length) index = 0;
        marcadorAuto.setLatLng(coords[index]);
      }, 200);
    }

    function actualizarListaPuntos() {
      const lista = document.getElementById('ordenPuntos');
      lista.innerHTML = '';
      puntosIntermedios.forEach(p => {
        const item = document.createElement('li');
        item.textContent = `${p.nombre}: ${p.latlng.lat.toFixed(5)}, ${p.latlng.lng.toFixed(5)}`;
        lista.appendChild(item);
      });
      document.getElementById('listaPuntos').classList.remove('d-none');
    }

    function restaurarBuscador() {
      marcadores.forEach(m => mapa.removeLayer(m));
      marcadores = [];
      puntosIntermedios = [];
      if (controlRuta) {
        mapa.removeControl(controlRuta);
        controlRuta = null;
      }
      marcadoresCasetas.forEach(m => mapa.removeLayer(m));
      marcadoresCasetas = [];
      document.getElementById('btnIndicaciones').style.display = 'none';

      detenerAnimacionAuto();

      document.getElementById('ordenPuntos').innerHTML = '';
      document.getElementById('resultados').innerHTML = '';
      mapa.setView([19.4326, -99.1332], 12);
    }


    function detenerAnimacionAuto() {
      if (marcadorAuto) mapa.removeLayer(marcadorAuto);
      if (animacionIntervalo) clearInterval(animacionIntervalo);
    }

    mapa.on('click', function(e) {
      let nombre = `Sitio ${puntosIntermedios.length + 1}`;
      puntosIntermedios.push({ nombre: nombre, latlng: e.latlng });
      agregarMarcador(e.latlng, nombre);
      actualizarListaPuntos();
    });

    $(function() {
      $("#entradaLugar").autocomplete({
        source: function(request, response) {
          $.getJSON(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${request.term}`, function(data) {
            response(data.map(item => ({
              label: item.display_name,
              value: item.display_name
            })));
          });
        },
        minLength: 3,
        delay: 300
      });
    });
