/* ============================================================
   SCRIPT.JS — comportamiento general del sitio
   Contiene: menú hamburguesa, navbar al desplazar, scroll
   suave, botón volver arriba, contador animado y animaciones
   al hacer scroll (reveal).
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Año automático en el footer ---------- */
    const anioSpan = document.getElementById('anio');
    if (anioSpan) {
        anioSpan.textContent = new Date().getFullYear();
    }

    /* ---------- Menú hamburguesa (responsive) ---------- */
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });

        // Cerrar el menú al seleccionar un enlace (útil en móviles)
        navLinks.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------- Cambio de estilo del navbar al desplazar ---------- */
    const header = document.getElementById('header');
    function actualizarHeader() {
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    actualizarHeader();
    window.addEventListener('scroll', actualizarHeader);

    /* ---------- Resaltar enlace activo según la sección visible ---------- */
    const secciones = document.querySelectorAll('main section[id]');
    const enlacesNav = document.querySelectorAll('.nav-link');

    function marcarEnlaceActivo() {
        let actual = '';
        secciones.forEach(function (seccion) {
            const top = seccion.offsetTop - 120;
            if (window.scrollY >= top) {
                actual = seccion.getAttribute('id');
            }
        });
        enlacesNav.forEach(function (enlace) {
            enlace.classList.toggle('active', enlace.getAttribute('href') === '#' + actual);
        });
    }
    marcarEnlaceActivo();
    window.addEventListener('scroll', marcarEnlaceActivo);

    /* ---------- Botón volver arriba ---------- */
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function () {
        backToTop.classList.toggle('show', window.scrollY > 480);
    });
    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ---------- Animaciones al hacer scroll (fade-in con IntersectionObserver) ---------- */
    const elementosReveal = document.querySelectorAll('.reveal');
    const observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('is-visible');
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.15 });

    elementosReveal.forEach(function (el) {
        observador.observe(el);
    });

    /* ---------- Contador animado para las estadísticas ---------- */
    const contadores = document.querySelectorAll('.stat-number');

    function animarContador(elemento) {
        const meta = parseInt(elemento.getAttribute('data-target'), 10);
        const sufijo = elemento.getAttribute('data-suffix') || '';
        const duracion = 1600; // milisegundos
        const inicio = performance.now();

        function paso(ahora) {
            const progreso = Math.min((ahora - inicio) / duracion, 1);
            const valor = Math.floor(progreso * meta);
            elemento.textContent = valor + sufijo;
            if (progreso < 1) {
                requestAnimationFrame(paso);
            } else {
                elemento.textContent = meta + sufijo;
            }
        }
        requestAnimationFrame(paso);
    }

    const observadorContadores = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
                animarContador(entrada.target);
                observadorContadores.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.5 });

    contadores.forEach(function (contador) {
        observadorContadores.observe(contador);
    });

    /* ---------- Botones "Más información" de los servicios (simulado) ---------- */
    document.querySelectorAll('.service-more').forEach(function (boton) {
        boton.addEventListener('click', function () {
            const tarjeta = boton.closest('.service-card');
            const titulo = tarjeta ? tarjeta.querySelector('h3').textContent : 'este servicio';
            alert('Pronto tendremos más información sobre "' + titulo + '". ¡Contáctanos si tienes preguntas!');
        });
    });

});
