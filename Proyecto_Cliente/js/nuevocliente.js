(function () {
    let DB;
    const DB_NAME = 'crm';
    const STORE_NAME = 'clientes';
    const DB_VERSION = 1;

    const formulario = document.querySelector('#formulario');

    document.addEventListener('DOMContentLoaded', () => {
        formulario.addEventListener('submit', validarCliente);
        conectarDB();
    });

    function conectarDB() {
        const abrirConexion = window.indexedDB.open(DB_NAME, DB_VERSION);

        abrirConexion.onerror = function() {
            console.log('Hubo un error al conectar a la base de datos');
        };

        abrirConexion.onsuccess = function() {
            DB = abrirConexion.result;
        };

        abrirConexion.onupgradeneeded = function(e) {
            const db = e.target.result;
            
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
    }

    function validarCliente(e) {
        e.preventDefault();

        const nombre = document.querySelector('#nombre').value;
        const email = document.querySelector('#email').value;
        const telefono = document.querySelector('#telefono').value;
        const direccion = document.querySelector('#direccion').value;

        if(nombre === '' || email === '' || telefono === '' || direccion === '') {
            imprimirAlerta('Todos los campos son obligatorios', true);
            return;
        }

        const cliente = {
            nombre, 
            email,
            telefono,
            direccion,
            id: Date.now()
        };

        crearNuevoCliente(cliente);
    }

    function crearNuevoCliente(cliente) {
        if (!DB) {
            imprimirAlerta('La base de datos no está lista', true);
            return;
        }

        const transaction = DB.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        
        const request = objectStore.add(cliente);

        request.onsuccess = function() {
            imprimirAlerta('El cliente se agregó correctamente');
            setTimeout(() => {
                window.location.href = 'clientes.html';
            }, 3000);
        };

        request.onerror = function() {
            imprimirAlerta('Hubo un error al agregar el cliente', true);
        };
    }

    function imprimirAlerta(mensaje, error = false) {
        const alertaExistente = document.querySelector('.alerta');
    
        if (!alertaExistente) {
            const divMensaje = document.createElement('div');
            divMensaje.textContent = mensaje;
            divMensaje.classList.add('alerta');
    
            if (error) {
                divMensaje.classList.add('alerta-error');
            } else {
                divMensaje.classList.add('alerta-exito');
            }
    
            formulario.appendChild(divMensaje);
    
            setTimeout(() => {
                divMensaje.remove();
            }, 3000);
        }
    }
})();