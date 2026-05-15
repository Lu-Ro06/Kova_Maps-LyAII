    const capaNormal = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
    const capaOscura = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 });
    const capaGoogleHibrido = L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=es&x={x}&y={y}&z={z}', { maxZoom: 20 });

    let mapa = L.map('mapa', {
        center: [19.4326, -99.1332],
        zoom: 12,
        layers: [capaNormal],
        zoomControl: false // Ocultamos el zoom por defecto para que no estorbe
    });

    const toggleControl = L.control({position: 'topleft'});
    toggleControl.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'map-toggles');
        div.innerHTML = `
          <button id="btnModoNoche" class="btn-flotante-small" onclick="toggleModoNoche()" title="Alternar Modo Noche">
            <i class="bi bi-moon-fill" id="iconoModoNoche"></i>
          </button>
          <button id="btnSatelite" class="btn-flotante-small" onclick="toggleSatelite()" title="Alternar Satélite 3D">
            <i class="bi bi-globe-americas"></i>
          </button>
          <button id="btnClima" class="btn-flotante-small" onclick="toggleClima()" title="Radar de Lluvia (En Vivo)">
            <i class="bi bi-cloud-rain-fill" id="iconoClima"></i>
          </button>
        `;
        L.DomEvent.disableClickPropagation(div);
        return div;
    };
    toggleControl.addTo(mapa);

    // Agregamos el control de zoom después para que quede debajo de nuestros botones
    L.control.zoom({position: 'topleft'}).addTo(mapa);

    let modoNocheActivo = false;
    let modoSateliteActivo = false;

    // Convertí las funciones a globales exponiéndolas en window por si acaso
    window.toggleModoNoche = function() {
      if (modoNocheActivo) {
        mapa.removeLayer(capaOscura);
        if (!modoSateliteActivo) mapa.addLayer(capaNormal);
        document.getElementById('iconoModoNoche').className = 'bi bi-moon-fill';
        modoNocheActivo = false;
      } else {
        if (!modoSateliteActivo) mapa.removeLayer(capaNormal);
        mapa.addLayer(capaOscura);
        document.getElementById('iconoModoNoche').className = 'bi bi-sun-fill text-warning';
        modoNocheActivo = true;
      }
    };

    window.toggleSatelite = function() {
      if (modoSateliteActivo) {
        mapa.removeLayer(capaGoogleHibrido);
        if (modoNocheActivo) mapa.addLayer(capaOscura);
        else mapa.addLayer(capaNormal);
        modoSateliteActivo = false;
      } else {
        if (modoNocheActivo) mapa.removeLayer(capaOscura);
        else mapa.removeLayer(capaNormal);
        mapa.addLayer(capaGoogleHibrido);
        modoSateliteActivo = true;
      }
    };

    let capaClima = null;
    let modoClimaActivo = false;

    // Obtener la capa de clima de RainViewer (gratis, sin API key, en tiempo real)
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(data => {
        let latestTime = data.radar.past[data.radar.past.length - 1].time;
        capaClima = L.tileLayer(`https://tilecache.rainviewer.com/v2/radar/${latestTime}/256/{z}/{x}/{y}/2/1_1.png`, {
            opacity: 0.7,
            zIndex: 1000
        });
      });

    window.toggleClima = function() {
      if(!capaClima) {
         alert("Cargando datos del clima en vivo, intenta en unos segundos...");
         return;
      }
      if (modoClimaActivo) {
        mapa.removeLayer(capaClima);
        document.getElementById('iconoClima').className = 'bi bi-cloud-rain-fill';
        modoClimaActivo = false;
      } else {
        mapa.addLayer(capaClima);
        document.getElementById('iconoClima').className = 'bi bi-cloud-rain-fill text-info';
        modoClimaActivo = true;
      }
    };

    let controlRuta = null;
    let graficoDona = null;
    let puntosIntermedios = [];
    let marcadores = [];

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

    async function calcularRutaCompleta() {
      const inputs = document.querySelectorAll('.autocomplete-input');
      const lugares = [];
      inputs.forEach(inp => {
        if(inp.value.trim() !== '') lugares.push(inp.value.trim());
      });
      
      if(lugares.length < 2) {
        alert("Por favor ingresa al menos un Origen y un Destino.");
        return;
      }
      
      restaurarBuscador(false);
      
      for(let i=0; i < lugares.length; i++) {
         let ubicacion = lugares[i];
         try {
           let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${ubicacion}`);
           let data = await response.json();
           if(data && data.length > 0) {
             const latLng = L.latLng(data[0].lat, data[0].lon);
             puntosIntermedios.push({ nombre: ubicacion, latlng: latLng });
             agregarMarcador(latLng, ubicacion);
           } else {
             alert(`No se encontró la ubicación: ${ubicacion}`);
             return;
           }
         } catch(e) {
           console.error("Error geocodificando:", e);
         }
      }
      
      actualizarListaPuntos();
      actualizarRuta();
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
          showAlternatives: true,
          altLineOptions: { styles: [{color: 'white', opacity: 0.6, weight: 6}] },
          router: L.Routing.osrmv1({ language: 'es' }),
          createMarker: () => null,
          lineOptions: { styles: [{ color: '#448aff', opacity: 1, weight: 5 }] }
        }).on('routeselected', function (e) {
          const resumen = e.route.summary;
          const distancia = resumen.totalDistance / 1000;
          const tipoGasolina = document.getElementById('tipoGasolina').value;
          const cilindros = parseInt(document.getElementById('cilindros').value);
          const consumo = consumoPorCilindro[cilindros]; 
          const precioGas = preciosGasolina[tipoGasolina];

          const litros = distancia / consumo;
          const costoGasolina = litros * precioGas;

          const tiempoHoras = distancia / 70;
          const minutos = Math.round(tiempoHoras * 60);

          // Limpiar resultados previos
          document.getElementById('resultados').innerHTML = '';
          marcadoresCasetas.forEach(m => mapa.removeLayer(m));
          marcadoresCasetas = [];
          
          const coordsRutaCompleta = e.route.coordinates;
          const instrucciones = e.route.instructions;
          
          // Generar Indicaciones
          let htmlPasos = '';
          
          instrucciones.forEach((inst, index) => {
            let icon = 'bi-arrow-up-circle';
            if(inst.type === 'Turn') icon = inst.modifier.includes('Right') ? 'bi-arrow-right-circle' : 'bi-arrow-left-circle';
            else if(inst.type === 'DestinationReached') icon = 'bi-geo-alt-fill';
            else if(inst.type === 'Roundabout') icon = 'bi-arrow-repeat';
            
            let distStr = inst.distance > 1000 ? (inst.distance/1000).toFixed(1) + ' km' : inst.distance + ' m';
            
            htmlPasos += `
              <div class="indicacion-paso">
                <i class="bi ${icon} indicacion-icono"></i>
                <div class="indicacion-texto">${inst.text}</div>
                <div class="indicacion-dist">${distStr}</div>
              </div>
            `;
          });
          
          document.getElementById('listaIndicaciones').innerHTML = htmlPasos;
          document.getElementById('btnIndicaciones').style.display = 'block';
          
          // Helper para crear cards
          const addCard = (id, iconClass, label, value, delay, extraClass='') => {
            const container = document.getElementById('resultados');
            container.innerHTML += `
              <div class="resultado-card ${extraClass}" id="${id}" style="animation-delay: ${delay}s">
                <i class="bi ${iconClass}"></i>
                <div class="resultado-content">
                  <span class="resultado-label">${label}</span>
                  <span class="resultado-value">${value}</span>
                </div>
              </div>
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
              let listaCasetas = casetasCruzadas.map(c => `<div class="caseta-item">${c.nombre} <span class="float-end">$${c.costo}</span></div>`).join('');
              
              // Tarjeta 1: Lista de Casetas
              addCard('caseta_lista', 'bi-sign-intersection icon-toll', `Casetas Cruzadas`, `<div style="margin-top:5px; width:100%">${listaCasetas}</div>`, 0.4);
              
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
                marker.bindPopup(`<b>Caseta: ${c.nombre}</b><br>Costo: $${c.costo} MXN`);
                marcadoresCasetas.push(marker);
              });

            } else {
              addCard('caseta_total', 'bi-cash-coin icon-toll', 'Costo Peajes', '$0.00 MXN', 0.4);
            }
            
            const horasOp = Math.floor(tiempoOperador);
            const minOp = Math.round((tiempoOperador - horasOp) * 60);
            addCard('tiempo_operador', 'bi-person-workspace icon-op', 'Tiempo Operador (NOM-087)', `${horasOp}h ${minOp}m`, 0.5);
            
            const totalViaje = costoCaseta + costoGasolinaReal;
            addCard('total', 'bi-wallet2 icon-total', 'Gran Total del Viaje', `$${totalViaje.toFixed(2)} MXN`, 0.7, 'total-card');

            // --- Renderizar Gráfico de Dona ---
            document.getElementById('contenedorGrafico').style.display = 'block';
            const ctx = document.getElementById('costosChart').getContext('2d');
            
            if(graficoDona) { graficoDona.destroy(); }
            
            graficoDona = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Combustible', 'Peajes'],
                    datasets: [{
                        data: [costoGasolinaReal, costoCaseta],
                        backgroundColor: ['#60a5fa', '#c084fc'],
                        borderColor: 'transparent',
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#ffffff', font: {family: 'Inter'} } },
                        title: { display: true, text: 'Desglose de Costos', color: '#ffffff', font: {size: 14, family: 'Inter'} }
                    },
                    cutout: '70%'
                }
            });

          })
          .catch(e => {
            console.error("Error fetching analisis_ruta:", e);
            addCard('total', 'bi-wallet2 icon-total', 'Gran Total del Viaje', `$${costoGasolina.toFixed(2)} MXN`, 0.7, 'total-card');
          });
          // Animación del auto removida
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

    function restaurarBuscador(limpiarTodo = true) {
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



      document.getElementById('ordenPuntos').innerHTML = '';
      document.getElementById('resultados').innerHTML = '';
      document.getElementById('contenedorGrafico').style.display = 'none';
      if(graficoDona) { graficoDona.destroy(); graficoDona = null; }
      mapa.setView([19.4326, -99.1332], 12);
      
      if(limpiarTodo) {
        document.getElementById('origenLugar').value = '';
        document.getElementById('destinoLugar').value = '';
      }
    }




    mapa.on('click', function(e) {
      let nombre = `Sitio ${puntosIntermedios.length + 1}`;
      puntosIntermedios.push({ nombre: nombre, latlng: e.latlng });
      agregarMarcador(e.latlng, nombre);
      actualizarListaPuntos();
    });

    function inicializarAutocomplete(elemento) {
      elemento.autocomplete({
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
    }

    $(function() {
      inicializarAutocomplete($(".autocomplete-input"));
    });
