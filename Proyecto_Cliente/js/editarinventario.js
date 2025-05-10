(function () {
    const dispositivoInput = document.querySelector('#dispositivo');
    const precioInput = document.querySelector('#precio');
    const stockInput = document.querySelector('#stock');
    const formulario = document.querySelector('#formulario');

    let DB;
    let idCliente;

    document.addEventListener('DOMContentLoaded', () => {
        conectarDB();

        formulario.addEventListener('submit', actualizarCliente);

        const parametrosURL = new URLSearchParams(window.location.search);
        idCliente = parametrosURL.get('id');

        if (idCliente) {
            setTimeout(() => {
                obtenerCliente(idCliente);
            }, 100);
        }
    });

    function conectarDB() {
        const abrirConexion = window.indexedDB.open('crm-inv', 1);
    
        abrirConexion.onerror = function () {
            console.log('Hubo un error');
        };
    
        abrirConexion.onsuccess = function () {
            DB = abrirConexion.result;
        };
    }

    function actualizarCliente(e){
        e.preventDefault();

        if(dispositivoInput.value === '' || precioInput.value === '' || stockInput.value === ''){
            imprimirAlerta('Todos los campos son obligatorios', true);
            return;
        }

        const clienteActualizado = {
            dispositivo: dispositivoInput.value,
            precio: precioInput.value,
            stock: stockInput.value,
            id: Number(idCliente)
        }

        const transaction = DB.transaction(['crm-inv'], 'readwrite');
        const objectStore = transaction.objectStore('crm-inv');
        objectStore.put(clienteActualizado);

        transaction.onerror = function(){
            imprimirAlerta('Hubo un error', true);
        }

        transaction.oncomplete = function(){
            imprimirAlerta('El producto se actualizo correctamente');

            setTimeout(() => {
                window.location.href = 'inventario.html';
            }, 3000);
        }
    }

    function obtenerCliente(id) {
        const transaction = DB.transaction(['crm-inv'], 'readwrite');
        const objectStore = transaction.objectStore('crm-inv');

        const cliente = objectStore.openCursor();
        cliente.onsuccess = function (e) {
            const cursor = e.target.result;

            if (cursor) {
                if (cursor.value.id === Number(id)) {
                    llenarFormulario(cursor.value);
                }
                cursor.continue();
            }
        };
    }

    function llenarFormulario(datosCliente){
        const {dispositivo, precio, stock} = datosCliente;
        dispositivoInput.value = dispositivo;
        precioInput.value = precio;
        stockInput.value = stock;
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
