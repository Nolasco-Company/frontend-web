(function () {
    let DB;

    const listadoClientes = document.querySelector('#listado-clientes');

    document.addEventListener('DOMContentLoaded', () => {
        crearDB();

        if (window.indexedDB.open('crm-usuyrol', 1)) {
            obtenerClientes();
        }

        listadoClientes.addEventListener('click', eliminarRegristro);
    });

    function eliminarRegristro(e){
        if(e.target.classList.contains('eliminar')){
            const idEliminar = Number(e.target.dataset.cliente);

            const confirmar = confirm('Deseas eliminar este registro?');

            if(confirmar){
                const transaction = DB.transaction(['crm-usuyrol'], 'readwrite');
                const objectStore = transaction.objectStore('crm-usuyrol');
                objectStore.delete(idEliminar);

                transaction.onerror = function(){
                    console.log('Hubo un error');
                }

                transaction.oncomplete = function(){
                    e.target.parentElement.parentElement.remove();
                }
            }
        }
    }

    function crearDB() {
        const crearDB = window.indexedDB.open('crm-usuyrol', 1);

        crearDB.onerror = function () {
            console.log('Hubo un error');
        };

        crearDB.onsuccess = function () {
            DB = crearDB.result;
        };

        crearDB.onupgradeneeded = function (e) {
            const db = e.target.result;

            const objectStore = db.createObjectStore('crm-usuyrol', { keyPath: 'id', autoIncrement: true });

            objectStore.createIndex('nombre', 'nombre', { unique: false });
            objectStore.createIndex('email', 'email', { unique: true });
            objectStore.createIndex('telefono', 'telefono', { unique: false });
            objectStore.createIndex('rol', 'rol', { unique: false });
            objectStore.createIndex('id', 'id', { unique: true });
        };
    }

    function obtenerClientes() {
        const abrirConexion = window.indexedDB.open('crm-usuyrol', 1);

        abrirConexion.onerror = function () {
            console.log('Hubo un error');
        };

        abrirConexion.onsuccess = function () {
            DB = abrirConexion.result;

            const objectStore = DB.transaction('crm-usuyrol').objectStore('crm-usuyrol');

            objectStore.openCursor().onsuccess = function (e) {
                const cursor = e.target.result;

                if (cursor) {
                    const { nombre, rol, email, telefono, id } = cursor.value;

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
                                <p class="rol-cliente">${rol}</p>
                            </td>
                            <td class="tabla-celda acciones-cliente">
                                <a href="editar-usuario-y-roles.html?id=${id}" class="link-editar">Editar</a>
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
