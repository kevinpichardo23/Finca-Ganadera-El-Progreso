/* ============================================================
   GALLERY.JS — visor tipo lightbox para la galería de imágenes
   Construido únicamente con JavaScript puro, sin librerías.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    const items = Array.from(document.querySelectorAll('.gallery-item'));
    const lightbox = document.getElementById('lightbox');

    if (!lightbox || items.length === 0) return;

    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const btnClose = document.getElementById('lightboxClose');
    const btnPrev = document.getElementById('lightboxPrev');
    const btnNext = document.getElementById('lightboxNext');

    let indiceActual = 0;

    function abrirLightbox(indice) {
        indiceActual = indice;
        const img = items[indiceActual].querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = items[indiceActual].getAttribute('data-caption') || img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function cerrarLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function mostrarSiguiente() {
        indiceActual = (indiceActual + 1) % items.length;
        abrirLightbox(indiceActual);
    }

    function mostrarAnterior() {
        indiceActual = (indiceActual - 1 + items.length) % items.length;
        abrirLightbox(indiceActual);
    }

    items.forEach(function (item, indice) {
        item.addEventListener('click', function () {
            abrirLightbox(indice);
        });
    });

    btnClose.addEventListener('click', cerrarLightbox);
    btnNext.addEventListener('click', mostrarSiguiente);
    btnPrev.addEventListener('click', mostrarAnterior);

    // Cerrar al hacer clic fuera de la imagen
    lightbox.addEventListener('click', function (evento) {
        if (evento.target === lightbox) {
            cerrarLightbox();
        }
    });

    // Navegación con el teclado
    document.addEventListener('keydown', function (evento) {
        if (!lightbox.classList.contains('active')) return;

        if (evento.key === 'Escape') cerrarLightbox();
        if (evento.key === 'ArrowRight') mostrarSiguiente();
        if (evento.key === 'ArrowLeft') mostrarAnterior();
    });

});
