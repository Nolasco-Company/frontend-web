document.addEventListener('DOMContentLoaded', function() {
    const mapa = L.map('mapaQueretaro').setView([20.58806, -100.38806], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    function simplificarDireccion(direccion) {
        let simplificada = direccion
            .replace(/Privada de |Colonia |C\.P\. \d+|,\s*/gi, ' ') 
            .replace(/\s{2,}/g, ' ') 
            .trim();
        
        const partes = direccion.split(',');
        if (partes.length >= 3) {
            simplificada = `${partes[0].trim()}, ${partes[partes.length-1].trim()}`;
        }
        
        return simplificada;
    }

    function extraerCiudad(direccion) {
        const match = direccion.match(/(\d{5})\s+([^,]+),\s*([A-Za-záéíóúüñÁÉÍÓÚÜÑ]+\.?)$/);
        return match ? `${match[2]}, ${match[3]}` : null;
    }

    function geocodificar(direccion) {
        return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&countrycodes=mx&limit=1`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    return {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                        direccion: data[0].display_name
                    };
                }
                return null;
            });
    }

    async function geocodificarRobusto(direccionOriginal) {
        const intentos = [
            direccionOriginal,
            simplificarDireccion(direccionOriginal), 
            extraerCiudad(direccionOriginal) 
        ];

        for (let intento of intentos) {
            if (!intento) continue;
            
            try {
                const resultado = await geocodificar(intento);
                if (resultado) {
                    return {
                        ...resultado,
                        direccionOriginal: direccionOriginal,
                        metodo: intento === direccionOriginal ? 'completa' : 
                                intento === simplificarDireccion(direccionOriginal) ? 'simplificada' : 'ciudad'
                    };
                }
            } catch (error) {
                console.warn(`Error en geocodificación (${intento}):`, error);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return null;
    }

    function crearMarcador(cliente, coordenadas) {
        const marcador = L.marker([coordenadas.lat, coordenadas.lng], {
            icon: L.divIcon({
                className: 'marcador-personalizado',
                html: '<div class="marcador-contenido">📍</div>',
                iconSize: [30, 30]
            })
        }).addTo(mapa);
        
        let popupContent = `
            <div class="popup-mapa">
                <h4>${cliente.nombre || 'Cliente'}</h4>
                <p><strong>Dirección:</strong> ${coordenadas.direccionOriginal}</p>`;
        
        if (coordenadas.metodo !== 'completa') {
            popupContent += `<p class="warning"><small>Ubicación ${coordenadas.metodo === 'ciudad' ? 'aproximada (ciudad)' : 'obtenida de versión simplificada'}</small></p>`;
        }
        
        if (cliente.telefono) popupContent += `<p><strong>Teléfono:</strong> ${cliente.telefono}</p>`;
        if (cliente.email) popupContent += `<p><strong>Email:</strong> ${cliente.email}</p>`;
        
        popupContent += `</div>`;
        
        marcador.bindPopup(popupContent);
        return marcador;
    }

    async function guardarCoordenadas(idCliente, coordenadas) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('crm', 1);
            
            request.onsuccess = function(event) {
                const db = event.target.result;
                const transaction = db.transaction(['clientes'], 'readwrite');
                const objectStore = transaction.objectStore('clientes');
                
                const getRequest = objectStore.get(idCliente);
                getRequest.onsuccess = function() {
                    const cliente = getRequest.result;
                    if (!cliente) {
                        reject('Cliente no encontrado');
                        return;
                    }
                    
                    cliente.coordenadas = {
                        lat: coordenadas.lat,
                        lng: coordenadas.lng,
                        direccionGeocodificada: coordenadas.direccion,
                        metodo: coordenadas.metodo
                    };
                    
                    const putRequest = objectStore.put(cliente);
                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => reject(putRequest.error);
                };
                
                getRequest.onerror = () => reject(getRequest.error);
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    async function cargarMarcadoresDesdeIndexedDB() {
        mostrarLoader(true);
        mostrarMensaje('');
        
        try {
            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open('crm', 1);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            if (!db.objectStoreNames.contains('clientes')) {
                mostrarMensaje('No se encontró la base de datos de clientes');
                return;
            }
            
            const clientes = await new Promise((resolve, reject) => {
                const transaction = db.transaction(['clientes'], 'readonly');
                const objectStore = transaction.objectStore('clientes');
                const request = objectStore.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            if (clientes.length === 0) {
                mostrarMensaje('No hay clientes registrados');
                return;
            }
            
            const marcadores = [];
            let geocodificacionesExitosas = 0;
            
            for (const cliente of clientes) {
                if (!cliente.direccion) continue;
                
                let coordenadas;
                
                if (cliente.coordenadas) {
                    coordenadas = cliente.coordenadas;
                    coordenadas.direccionOriginal = cliente.direccion;
                } else {
                    coordenadas = await geocodificarRobusto(cliente.direccion);
                    if (coordenadas) {
                        geocodificacionesExitosas++;
                        try {
                            await guardarCoordenadas(cliente.id, coordenadas);
                        } catch (error) {
                            console.error('Error al guardar coordenadas:', error);
                        }
                    }
                }
                
                if (coordenadas) {
                    const marcador = crearMarcador(cliente, coordenadas);
                    marcadores.push(marcador);
                }
            }
            
            if (marcadores.length > 0) {
                const grupo = new L.featureGroup(marcadores);
                mapa.fitBounds(grupo.getBounds().pad(0.1));
                
                if (geocodificacionesExitosas > 0) {
                    mostrarMensaje(`Se geocodificaron ${geocodificacionesExitosas} direcciones nuevas`, 'success');
                    setTimeout(() => mostrarMensaje(''), 3000);
                }
            } else {
                mostrarMensaje('No se pudo geocodificar ninguna dirección');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Ocurrió un error al cargar los clientes');
        } finally {
            mostrarLoader(false);
        }
    }

    function mostrarLoader(mostrar) {
        const loader = document.getElementById('mapa-loader');
        if (loader) loader.style.display = mostrar ? 'block' : 'none';
    }
    
    function mostrarMensaje(texto, tipo = 'error') {
        const mensaje = document.getElementById('mapa-mensaje');
        if (mensaje) {
            mensaje.textContent = texto;
            mensaje.className = tipo;
            mensaje.style.display = texto ? 'block' : 'none';
        }
    }

    mapa.whenReady(cargarMarcadoresDesdeIndexedDB);
});