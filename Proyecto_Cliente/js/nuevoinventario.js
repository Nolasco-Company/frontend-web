(function () {
    let DB;

    const formulario = document.querySelector('#formulario');

    document.addEventListener('DOMContentLoaded', () => {
        formulario.addEventListener('submit', validarCliente);

        conectarDB();
    });

    function conectarDB() {
        let abrirConexion = window.indexedDB.open('crm-inv', 1);

        abrirConexion.onerror = function() {
            console.log('Hubo un error');
        };
    
        abrirConexion.onsuccess = function(){
            DB = abrirConexion.result;
        };
    }

    function validarCliente(e) {
        e.preventDefault();

        const dispositivo = document.querySelector('#dispositivo').value;
        const precio = document.querySelector('#precio').value;
        const stock = document.querySelector('#stock').value;

        if(dispositivo === '' || precio === '' || stock === '')
            return;

        const cliente = {
            dispositivo, 
            precio,
            stock
        };

        cliente.id = Date.now();

        crearNuevoCliente(cliente);
    }

    function crearNuevoCliente(cliente) {
        const transaction = DB.transaction(['crm-inv'], 'readwrite');
        const objectStore = transaction.objectStore('crm-inv');
        objectStore.add(cliente);

        transaction.onerror = function () {
            imprimirAlerta('Hubo un error', true);
        };

        transaction.oncomplete = function () {
            imprimirAlerta('El producto se agregó correctamente');
            setTimeout(() => {
                window.location.href = 'inventario.html';
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