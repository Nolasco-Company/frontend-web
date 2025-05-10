(function () {
    const nombreInput = document.querySelector('#nombre');
    const emailInput = document.querySelector('#email');
    const telefonoInput = document.querySelector('#telefono');
    const rolInput = document.querySelector('#rol');
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
        const abrirConexion = window.indexedDB.open('crm-usuyrol', 1);
    
        abrirConexion.onerror = function () {
            console.log('Hubo un error');
        };
    
        abrirConexion.onsuccess = function () {
            DB = abrirConexion.result;
        };
    }

    function actualizarCliente(e){
        e.preventDefault();

        if(nombreInput.value === '' || emailInput.value === '' || telefonoInput.value === '' || rolInput.value === ''){
            imprimirAlerta('Todos los campos son obligatorios', true);
            return;
        }

        const clienteActualizado = {
            nombre: nombreInput.value,
            email: emailInput.value,
            telefono: telefonoInput.value,
            rol: rolInput.value,
            id: Number(idCliente)
        }

        const transaction = DB.transaction(['crm-usuyrol'], 'readwrite');
        const objectStore = transaction.objectStore('crm-usuyrol');
        objectStore.put(clienteActualizado);

        transaction.onerror = function(){
            imprimirAlerta('Hubo un error', true);
        }

        transaction.oncomplete = function(){
            imprimirAlerta('El usuario se actualizo correctamente');

            setTimeout(() => {
                window.location.href = 'usuario-y-roles.html';
            }, 3000);
        }
    }

    function obtenerCliente(id) {
        const transaction = DB.transaction(['crm-usuyrol'], 'readwrite');
        const objectStore = transaction.objectStore('crm-usuyrol');

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
        const {nombre, email, telefono, rol} = datosCliente;
        nombreInput.value = nombre;
        emailInput.value = email;
        telefonoInput.value = telefono;
        rolInput.value = rol;
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
