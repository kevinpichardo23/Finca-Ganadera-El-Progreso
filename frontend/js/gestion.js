/* Gestión de ganado: consumo de la API REST y CRUD completo. */
document.addEventListener('DOMContentLoaded', () => {
    const API = '/api';
    const form = document.getElementById('formGanado');
    if (!form) return;

    const campos = {
        id: document.getElementById('ganadoId'), codigo: document.getElementById('codigoGanado'),
        nombre: document.getElementById('nombreGanado'), raza: document.getElementById('razaGanado'),
        sexo: document.getElementById('sexoGanado'), fecha: document.getElementById('fechaNacimiento'),
        peso: document.getElementById('pesoGanado'), estado: document.getElementById('estadoGanado'),
        observaciones: document.getElementById('observacionesGanado')
    };
    let registros = [];
    const tabla = document.getElementById('tablaGanado');
    const mensaje = document.getElementById('mensajeGestion');
    const buscar = document.getElementById('buscarGanado');
    const filtroEstado = document.getElementById('filtroEstado');

    const escapar = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
    const fechaCorta = value => value ? new Date(value + 'T00:00:00').toLocaleDateString('es-DO') : '';

    function mostrarMensaje(texto, tipo='success') {
        mensaje.textContent = texto; mensaje.className = `api-message show ${tipo}`;
        setTimeout(() => mensaje.classList.remove('show'), 5000);
    }
    function errorCampo(campo, texto) {
        const grupo = campo.closest('.form-group'); grupo.classList.toggle('has-error', Boolean(texto));
        const span = grupo.querySelector('.error-msg'); if (span) span.textContent = texto;
    }
    function validar() {
        let ok = true;
        const reglas = [
            [campos.codigo, /^[A-Za-z0-9-]{3,15}$/.test(campos.codigo.value.trim()), 'Use entre 3 y 15 caracteres: letras, números o guiones.'],
            [campos.nombre, campos.nombre.value.trim().length >= 2, 'El nombre debe tener al menos 2 caracteres.'],
            [campos.raza, Boolean(campos.raza.value), 'Seleccione una raza.'],
            [campos.sexo, Boolean(campos.sexo.value), 'Seleccione el sexo.'],
            [campos.fecha, Boolean(campos.fecha.value) && campos.fecha.value <= new Date().toISOString().slice(0,10), 'Ingrese una fecha válida, no futura.'],
            [campos.peso, Number(campos.peso.value) >= 1 && Number(campos.peso.value) <= 2000, 'El peso debe estar entre 1 y 2000 kg.'],
            [campos.estado, Boolean(campos.estado.value), 'Seleccione un estado.']
        ];
        reglas.forEach(([campo, valido, texto]) => { errorCampo(campo, valido ? '' : texto); if (!valido) ok=false; });
        return ok;
    }
    async function api(url, options={}) {
        const respuesta = await fetch(url, { headers:{'Content-Type':'application/json'}, ...options });
        const data = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) throw new Error(data.mensaje || 'No fue posible completar la solicitud.');
        return data;
    }
    async function cargarRazas() {
        const razas = await api(`${API}/razas`);
        campos.raza.innerHTML = '<option value="">Seleccione una raza</option>' + razas.map(r => `<option value="${r.id}">${escapar(r.nombre)}</option>`).join('');
    }
    async function cargarGanado() {
        tabla.innerHTML = '<tr><td colspan="8" class="table-status">Cargando registros...</td></tr>';
        try { registros = await api(`${API}/ganado`); renderizar(); actualizarResumen(); }
        catch (e) { tabla.innerHTML = `<tr><td colspan="8" class="table-status error">${escapar(e.message)}</td></tr>`; }
    }
    function filtrados() {
        const q = buscar.value.trim().toLowerCase(), estado = filtroEstado.value;
        return registros.filter(r => (!estado || r.estado === estado) && (!q || [r.codigo,r.nombre,r.raza,r.sexo,r.estado].some(v => String(v).toLowerCase().includes(q))));
    }
    function renderizar() {
        const datos = filtrados();
        document.getElementById('cantidadRegistros').textContent = `${datos.length} ${datos.length===1?'registro':'registros'}`;
        if (!datos.length) { tabla.innerHTML='<tr><td colspan="8" class="table-status">No se encontraron registros.</td></tr>'; return; }
        tabla.innerHTML = datos.map(r => `<tr>
            <td><strong>${escapar(r.codigo)}</strong></td><td>${escapar(r.nombre)}</td><td>${escapar(r.raza)}</td><td>${escapar(r.sexo)}</td>
            <td>${fechaCorta(r.fecha_nacimiento)}</td><td>${Number(r.peso_kg).toLocaleString('es-DO',{minimumFractionDigits:2})} kg</td>
            <td><span class="status-badge status-${r.estado.toLowerCase().replaceAll(' ','-').replace('ó','o')}">${escapar(r.estado)}</span></td>
            <td class="actions-cell no-print"><button class="table-action edit" data-edit="${r.id}" title="Editar"><i class="fa-solid fa-pen"></i></button><button class="table-action delete" data-delete="${r.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button></td></tr>`).join('');
    }
    function actualizarResumen() {
        document.getElementById('totalGanado').textContent = registros.length;
        document.getElementById('ganadoActivo').textContent = registros.filter(r=>r.estado==='Activo').length;
        document.getElementById('ganadoObservacion').textContent = registros.filter(r=>r.estado==='En observación').length;
    }
    function limpiar() {
        form.reset(); campos.id.value=''; campos.estado.value='Activo';
        document.getElementById('tituloFormulario').textContent='Registrar animal';
        document.getElementById('btnGuardarGanado').innerHTML='<i class="fa-solid fa-floppy-disk"></i> Guardar registro';
        document.getElementById('btnCancelarEdicion').classList.add('hidden');
        form.querySelectorAll('.form-group').forEach(g=>g.classList.remove('has-error'));
        form.querySelectorAll('.error-msg').forEach(e=>e.textContent='');
        document.getElementById('contadorObservaciones').textContent='0';
    }
    form.addEventListener('submit', async e => {
        e.preventDefault(); if (!validar()) return;
        const body = {codigo:campos.codigo.value.trim().toUpperCase(), nombre:campos.nombre.value.trim(), raza_id:Number(campos.raza.value), sexo:campos.sexo.value, fecha_nacimiento:campos.fecha.value, peso_kg:Number(campos.peso.value), estado:campos.estado.value, observaciones:campos.observaciones.value.trim()};
        const id=campos.id.value;
        try { await api(`${API}/ganado${id?'/'+id:''}`, {method:id?'PUT':'POST', body:JSON.stringify(body)}); mostrarMensaje(id?'Registro actualizado correctamente.':'Animal registrado correctamente.'); limpiar(); await cargarGanado(); document.getElementById('reportes').scrollIntoView({behavior:'smooth'}); }
        catch(e){ mostrarMensaje(e.message,'error'); }
    });
    tabla.addEventListener('click', async e => {
        const editar=e.target.closest('[data-edit]'), eliminar=e.target.closest('[data-delete]');
        if (editar) { const r=registros.find(x=>x.id===Number(editar.dataset.edit)); if(!r)return; campos.id.value=r.id; campos.codigo.value=r.codigo; campos.nombre.value=r.nombre; campos.raza.value=r.raza_id; campos.sexo.value=r.sexo; campos.fecha.value=r.fecha_nacimiento; campos.peso.value=r.peso_kg; campos.estado.value=r.estado; campos.observaciones.value=r.observaciones||''; document.getElementById('contadorObservaciones').textContent=campos.observaciones.value.length; document.getElementById('tituloFormulario').textContent='Modificar animal'; document.getElementById('btnGuardarGanado').innerHTML='<i class="fa-solid fa-check"></i> Actualizar registro'; document.getElementById('btnCancelarEdicion').classList.remove('hidden'); document.getElementById('gestion').scrollIntoView({behavior:'smooth'}); }
        if (eliminar) { const r=registros.find(x=>x.id===Number(eliminar.dataset.delete)); if(!r || !confirm(`¿Desea eliminar el registro ${r.codigo} - ${r.nombre}?`)) return; try{await api(`${API}/ganado/${r.id}`,{method:'DELETE'}); mostrarMensaje('Registro eliminado correctamente.'); await cargarGanado();}catch(err){mostrarMensaje(err.message,'error');} }
    });
    buscar.addEventListener('input',renderizar); filtroEstado.addEventListener('change',renderizar);
    document.getElementById('btnActualizarReporte').addEventListener('click',cargarGanado);
    document.getElementById('btnCancelarEdicion').addEventListener('click',limpiar);
    document.getElementById('btnImprimirReporte').addEventListener('click',()=>window.print());
    document.getElementById('btnExportarExcel').addEventListener('click',()=>{ window.location.href = `${API}/reportes/ganado/excel`; });
    campos.observaciones.addEventListener('input',()=>document.getElementById('contadorObservaciones').textContent=campos.observaciones.value.length);
    Object.values(campos).filter(x=>x && x!==campos.id && x!==campos.observaciones).forEach(c=>c.addEventListener('input',()=>errorCampo(c,'')));
    Promise.all([cargarRazas(),cargarGanado()]).catch(e=>mostrarMensaje(e.message,'error'));
});
