(function () {
    const DB_NAME = 'crm';
    const STORE_NAME = 'clientes';
    const DB_VERSION = 1;

    // Elementos del formulario
    const nombreInput = document.querySelector('#nombre');
    const emailInput = document.querySelector('#email');
    const telefonoInput = document.querySelector('#telefono');
    const direccionInput = document.querySelector('#direccion');
    const formulario = document.querySelector('#formulario');
    const idInput = document.querySelector('#id');

    let DB;
    let idCliente;

    document.addEventListener('DOMContentLoaded', () => {
        const parametrosURL = new URLSearchParams(window.location.search);
        idCliente = parametrosURL.get('id');
        idInput.value = idCliente;

        if (idCliente) {
            abrirDBYMostrarCliente();
        }

        formulario.addEventListener('submit', actualizarCliente);
    });

    function abrirDBYMostrarCliente() {
        const abrirConexion = indexedDB.open(DB_NAME, DB_VERSION);

        abrirConexion.onerror = function() {
            console.error('Error al abrir la base de datos');
            imprimirAlerta('Error al conectar con la base de datos', true);
        };

        abrirConexion.onsuccess = function() {
            DB = abrirConexion.result;
            obtenerCliente(idCliente);
        };

        abrirConexion.onupgradeneeded = function(e) {
            console.log('Se necesitó una actualización de la base de datos');
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

    function obtenerCliente(id) {
        if (!DB) {
            console.error('Database not initialized');
            return;
        }

        const transaction = DB.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.get(Number(id));

        request.onsuccess = function(e) {
            const cliente = e.target.result;
            if (cliente) {
                llenarFormulario(cliente);
            } else {
                console.error('Cliente no encontrado');
                imprimirAlerta('Cliente no encontrado', true);
            }
        };

        request.onerror = function() {
            console.error('Error al buscar cliente');
            imprimirAlerta('Error al buscar cliente', true);
        };
    }

    function actualizarCliente(e) {
        e.preventDefault();

        if (!DB) {
            imprimirAlerta('La base de datos no está disponible', true);
            return;
        }

        if (nombreInput.value === '' || emailInput.value === '' || 
            telefonoInput.value === '' || direccionInput.value === '') {
            imprimirAlerta('Todos los campos son obligatorios', true);
            return;
        }

        const clienteActualizado = {
            nombre: nombreInput.value,
            email: emailInput.value,
            telefono: telefonoInput.value,
            direccion: direccionInput.value,
            id: Number(idCliente)
        };

        const transaction = DB.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.put(clienteActualizado);

        request.onsuccess = function() {
            imprimirAlerta('Cliente actualizado correctamente');
            setTimeout(() => {
                window.location.href = 'clientes.html';
            }, 2000);
        };

        request.onerror = function() {
            imprimirAlerta('Error al actualizar el cliente', true);
        };
    }

    function llenarFormulario(cliente) {
        nombreInput.value = cliente.nombre;
        emailInput.value = cliente.email;
        telefonoInput.value = cliente.telefono;
        direccionInput.value = cliente.direccion;
    }

    function imprimirAlerta(mensaje, error = false) {
        // Limpiar alertas previas
        const alertaPrevia = document.querySelector('.alerta');
        if (alertaPrevia) {
            alertaPrevia.remove();
        }

        const alerta = document.createElement('div');
        alerta.textContent = mensaje;
        alerta.classList.add('alerta', error ? 'alerta-error' : 'alerta-exito');
        
        formulario.insertBefore(alerta, formulario.lastChild);

        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
})();