(function () {
    let DB;

    const listadoClientes = document.querySelector('#listado-clientes');

    document.addEventListener('DOMContentLoaded', () => {
        crearDB();

        if (window.indexedDB.open('crm-inv', 1)) {
            obtenerClientes();
        }

        listadoClientes.addEventListener('click', eliminarRegristro);
    });

    function eliminarRegristro(e) {
        if (e.target.classList.contains('eliminar')) {
            const idEliminar = Number(e.target.dataset.cliente);

            const confirmar = confirm('¿Deseas eliminar este registro?');

            if (confirmar) {
                const transaction = DB.transaction(['crm-inv'], 'readwrite');
                const objectStore = transaction.objectStore('crm-inv');
                objectStore.delete(idEliminar);

                transaction.onerror = function () {
                    console.log('Hubo un error');
                }

                transaction.oncomplete = function () {
                    e.target.parentElement.parentElement.remove();
                }
            }
        }
    }

    function crearDB() {
        const crearDB = window.indexedDB.open('crm-inv', 1);

        crearDB.onerror = function () {
            console.log('Hubo un error');
        };

        crearDB.onsuccess = function () {
            DB = crearDB.result;
        };

        crearDB.onupgradeneeded = function (e) {
            const db = e.target.result;

            const objectStore = db.createObjectStore('crm-inv', { keyPath: 'id', autoIncrement: true });

            objectStore.createIndex('dispositivo', 'dispositivo', { unique: false });
            objectStore.createIndex('precio', 'precio', { unique: true });
            objectStore.createIndex('stock', 'stock', { unique: false });
            objectStore.createIndex('id', 'id', { unique: true });
        };
    }

    function obtenerClientes() {
        const abrirConexion = window.indexedDB.open('crm-inv', 1);

        abrirConexion.onerror = function () {
            console.log('Hubo un error');
        };

        abrirConexion.onsuccess = function () {
            DB = abrirConexion.result;

            const objectStore = DB.transaction('crm-inv').objectStore('crm-inv');

            objectStore.openCursor().onsuccess = function (e) {
                const cursor = e.target.result;

                if (cursor) {
                    const { dispositivo, stock, precio, id } = cursor.value;

                    let color = '';
                    if (stock >= 11) {
                        color = 'green';
                    } else if (stock >= 5) {
                        color = 'orange';
                    } else {
                        color = 'red';
                    }

                    listadoClientes.innerHTML += `
                        <tr>
                            <td class="tabla-celda">
                                <p class="nombre-cliente">${dispositivo}</p>
                            </td>
                            <td class="tabla-celda">
                                <p class="precio-cliente">${precio}</p>
                            </td>
                            <td class="tabla-celda">
                                <p class="stock-cliente" style="color: ${color}; font-weight: bold;">${stock}</p>
                            </td>
                            <td class="tabla-celda acciones-cliente">
                                <a href="editar-inventario.html?id=${id}" class="link-editar">Editar</a>
                                <a href="#" data-cliente="${id}" class="link-eliminar eliminar">Eliminar</a>
                            </td>
                        </tr>
                    `;

                    cursor.continue();
                } else {
                    console.log('No hay más registros');
                }
            };
        };
    }
})();
