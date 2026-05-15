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
                circle.bindPopup(`<b>${z.nombre}</b><br>Riesgo: ${z.riesgo}`);
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
