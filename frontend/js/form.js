/* ============================================================
   FORM.JS — validación del formulario de contacto (simulado)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    const formulario = document.getElementById('formContacto');
    if (!formulario) return;

    const campoNombre = document.getElementById('nombre');
    const campoCorreo = document.getElementById('correo');
    const campoAsunto = document.getElementById('asunto');
    const campoMensaje = document.getElementById('mensaje');
    const mensajeExito = document.getElementById('formSuccess');

    const errores = {
        nombre: document.getElementById('errorNombre'),
        correo: document.getElementById('errorCorreo'),
        asunto: document.getElementById('errorAsunto'),
        mensaje: document.getElementById('errorMensaje')
    };

    function mostrarError(campo, mensaje) {
        const grupo = campo.closest('.form-group');
        grupo.classList.add('has-error');
        errores[campo.id].textContent = mensaje;
    }

    function limpiarError(campo) {
        const grupo = campo.closest('.form-group');
        grupo.classList.remove('has-error');
        errores[campo.id].textContent = '';
    }

    function validarCorreo(valor) {
        const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return patron.test(valor);
    }

    function validarCampo(campo) {
        const valor = campo.value.trim();

        if (campo === campoNombre) {
            if (valor.length < 3) {
                mostrarError(campo, 'Ingresa tu nombre completo (mínimo 3 caracteres).');
                return false;
            }
        }

        if (campo === campoCorreo) {
            if (!validarCorreo(valor)) {
                mostrarError(campo, 'Ingresa un correo electrónico válido.');
                return false;
            }
        }

        if (campo === campoAsunto) {
            if (valor.length < 4) {
                mostrarError(campo, 'Cuéntanos brevemente el asunto de tu mensaje.');
                return false;
            }
        }

        if (campo === campoMensaje) {
            if (valor.length < 10) {
                mostrarError(campo, 'Tu mensaje debe tener al menos 10 caracteres.');
                return false;
            }
        }

        limpiarError(campo);
        return true;
    }

    // Validación en tiempo real al salir de cada campo
    [campoNombre, campoCorreo, campoAsunto, campoMensaje].forEach(function (campo) {
        campo.addEventListener('blur', function () {
            validarCampo(campo);
        });
        campo.addEventListener('input', function () {
            if (campo.closest('.form-group').classList.contains('has-error')) {
                validarCampo(campo);
            }
        });
    });

    // Envío del formulario (simulado, sin backend)
    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const camposValidos = [campoNombre, campoCorreo, campoAsunto, campoMensaje]
            .map(validarCampo)
            .every(Boolean);

        if (!camposValidos) {
            mensajeExito.classList.remove('show');
            return;
        }

        // Simulación de envío exitoso
        mensajeExito.classList.add('show');
        formulario.reset();

        setTimeout(function () {
            mensajeExito.classList.remove('show');
        }, 5000);
    });

});
