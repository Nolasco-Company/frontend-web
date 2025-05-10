(function () {
    let DB;
    const DB_NAME = 'crm';
    const STORE_NAME = 'clientes';
    const DB_VERSION = 1;

    const listadoClientes = document.querySelector('#listado-clientes');

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            DB = await initDB();
            await obtenerClientes();
        } catch (error) {
            console.error('Error initializing database:', error);
        }

        listadoClientes.addEventListener('click', eliminarRegistro);
    });

    function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                reject(new Error('Error opening database'));
            };

            request.onsuccess = () => {
                DB = request.result;
                resolve(DB);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    objectStore.createIndex('nombre', 'nombre', { unique: false });
                    objectStore.createIndex('email', 'email', { unique: true });
                    objectStore.createIndex('telefono', 'telefono', { unique: false });
                    objectStore.createIndex('direccion', 'direccion', { unique: false });
                }
            };
        });
    }

    async function eliminarRegistro(e) {
        if (e.target.classList.contains('eliminar')) {
            const idEliminar = Number(e.target.dataset.cliente);
            const confirmar = confirm('¿Deseas eliminar este registro?');

            if (confirmar) {
                try {
                    await new Promise((resolve, reject) => {
                        const transaction = DB.transaction([STORE_NAME], 'readwrite');
                        const objectStore = transaction.objectStore(STORE_NAME);
                        
                        const request = objectStore.delete(idEliminar);

                        request.onsuccess = () => {
                            e.target.parentElement.parentElement.remove();
                            resolve();
                        };

                        request.onerror = () => {
                            reject(new Error('Error deleting record'));
                        };
                    });
                } catch (error) {
                    console.error('Error deleting record:', error);
                }
            }
        }
    }

    async function obtenerClientes() {
        if (!DB) {
            console.error('Database not initialized');
            return;
        }

        return new Promise((resolve, reject) => {
            const transaction = DB.transaction([STORE_NAME], 'readonly');
            const objectStore = transaction.objectStore(STORE_NAME);
            
            listadoClientes.innerHTML = '';

            objectStore.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;

                if (cursor) {
                    const { nombre, direccion, email, telefono, id } = cursor.value;

                    listadoClientes.innerHTML += `
                        <tr>
                            <td class="tabla-celda">
                                <p class="nombre-cliente">${nombre}</p>
                                <p class="email-cliente">${email}</p>
                            </td>
                            <td class="tabla-celda">
                                <p class="telefono-cliente">${telefono}</p>
                            </td>
                            <td class="tabla-celda">
                                <p class="direccion-cliente">${direccion}</p>
                            </td>
                            <td class="tabla-celda acciones-cliente">
                                <a href="editar-cliente.html?id=${id}" class="link-editar">Editar</a>
                                <a href="#" data-cliente="${id}" class="link-eliminar eliminar">Eliminar</a>
                            </td>
                        </tr>
                    `;

                    cursor.continue();
                } else {
                    resolve();
                }
            };

            transaction.onerror = () => {
                reject(new Error('Transaction error'));
            };
        });
    }
})();