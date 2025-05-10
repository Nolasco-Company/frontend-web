(function () {
    let DB;

    const formulario = document.querySelector('#formulario');

    document.addEventListener('DOMContentLoaded', () => {
        formulario.addEventListener('submit', validarCliente);

        conectarDB();
    });

    function conectarDB() {
        let abrirConexion = window.indexedDB.open('crm-usuyrol', 1);

        abrirConexion.onerror = function() {
            console.log('Hubo un error');
        };
    
        abrirConexion.onsuccess = function(){
            DB = abrirConexion.result;
        };
    }

    function validarCliente(e) {
        e.preventDefault();

        const nombre = document.querySelector('#nombre').value;
        const email = document.querySelector('#email').value;
        const telefono = document.querySelector('#telefono').value;
        const rol = document.querySelector('#rol').value;

        if(nombre === '' || email === '' || telefono === '' || rol === '')
            return;

        const cliente = {
            nombre, 
            email,
            telefono,
            rol
        };

        cliente.id = Date.now();

        crearNuevoCliente(cliente);
    }

    function crearNuevoCliente(cliente) {
        const transaction = DB.transaction(['crm-usuyrol'], 'readwrite');
        const objectStore = transaction.objectStore('crm-usuyrol');
        objectStore.add(cliente);

        transaction.onerror = function () {
            imprimirAlerta('Hubo un error', true);
        };

        transaction.oncomplete = function () {
            imprimirAlerta('El usuario se agregó correctamente');
            setTimeout(() => {
                window.location.href = 'usuario-y-roles.html';
            }, 3000);
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