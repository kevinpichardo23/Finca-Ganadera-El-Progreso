const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const ExcelJS = require('exceljs');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
app.use(helmet({contentSecurityPolicy:false}));
app.use(cors());
app.use(express.json({limit:'100kb'}));
app.use(express.urlencoded({extended:false}));

const estados = ['Activo','En observación','Vendido'];
const sexos = ['Hembra','Macho'];
function validarGanado(body){
  const errores=[];
  const codigo=String(body.codigo||'').trim().toUpperCase();
  const nombre=String(body.nombre||'').trim();
  const razaId=Number(body.raza_id), peso=Number(body.peso_kg);
  if(!/^[A-Z0-9-]{3,15}$/.test(codigo)) errores.push('El código debe tener entre 3 y 15 caracteres válidos.');
  if(nombre.length<2 || nombre.length>60) errores.push('El nombre debe tener entre 2 y 60 caracteres.');
  if(!Number.isInteger(razaId)||razaId<1) errores.push('La raza seleccionada no es válida.');
  if(!sexos.includes(body.sexo)) errores.push('El sexo no es válido.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(body.fecha_nacimiento||'') || new Date(body.fecha_nacimiento+'T00:00:00')>new Date()) errores.push('La fecha de nacimiento no es válida.');
  if(!Number.isFinite(peso)||peso<1||peso>2000) errores.push('El peso debe estar entre 1 y 2000 kg.');
  if(!estados.includes(body.estado)) errores.push('El estado no es válido.');
  if(String(body.observaciones||'').length>250) errores.push('Las observaciones no pueden superar 250 caracteres.');
  return {errores,data:{codigo,nombre,raza_id:razaId,sexo:body.sexo,fecha_nacimiento:body.fecha_nacimiento,peso_kg:peso,estado:body.estado,observaciones:String(body.observaciones||'').trim()||null}};
}
app.get('/api/salud', async(req,res)=>{try{await pool.query('SELECT 1');res.json({estado:'ok',base_de_datos:'conectada'});}catch(e){res.status(503).json({estado:'error',mensaje:'No hay conexión con PostgreSQL.'});}});
app.get('/api/razas',async(req,res,next)=>{try{const {rows}=await pool.query('SELECT id,nombre,descripcion FROM razas ORDER BY nombre');res.json(rows);}catch(e){next(e);}});
app.get('/api/ganado',async(req,res,next)=>{try{const {rows}=await pool.query(`SELECT g.id,g.codigo,g.nombre,g.raza_id,r.nombre AS raza,g.sexo,TO_CHAR(g.fecha_nacimiento,'YYYY-MM-DD') AS fecha_nacimiento,g.peso_kg,g.estado,g.observaciones,g.creado_en,g.actualizado_en FROM ganado g JOIN razas r ON r.id=g.raza_id ORDER BY g.id DESC`);res.json(rows);}catch(e){next(e);}});
app.get('/api/ganado/:id',async(req,res,next)=>{try{const {rows}=await pool.query(`SELECT g.*,r.nombre AS raza,TO_CHAR(g.fecha_nacimiento,'YYYY-MM-DD') AS fecha_nacimiento FROM ganado g JOIN razas r ON r.id=g.raza_id WHERE g.id=$1`,[req.params.id]);if(!rows.length)return res.status(404).json({mensaje:'Registro no encontrado.'});res.json(rows[0]);}catch(e){next(e);}});
app.post('/api/ganado',async(req,res,next)=>{const {errores,data}=validarGanado(req.body);if(errores.length)return res.status(400).json({mensaje:errores.join(' '),errores});try{const raza=await pool.query('SELECT id FROM razas WHERE id=$1',[data.raza_id]);if(!raza.rowCount)return res.status(400).json({mensaje:'La raza seleccionada no existe.'});const {rows}=await pool.query(`INSERT INTO ganado(codigo,nombre,raza_id,sexo,fecha_nacimiento,peso_kg,estado,observaciones) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[data.codigo,data.nombre,data.raza_id,data.sexo,data.fecha_nacimiento,data.peso_kg,data.estado,data.observaciones]);res.status(201).json({mensaje:'Registro creado correctamente.',registro:rows[0]});}catch(e){next(e);}});
app.put('/api/ganado/:id',async(req,res,next)=>{const {errores,data}=validarGanado(req.body);if(errores.length)return res.status(400).json({mensaje:errores.join(' '),errores});try{const {rows}=await pool.query(`UPDATE ganado SET codigo=$1,nombre=$2,raza_id=$3,sexo=$4,fecha_nacimiento=$5,peso_kg=$6,estado=$7,observaciones=$8,actualizado_en=CURRENT_TIMESTAMP WHERE id=$9 RETURNING *`,[data.codigo,data.nombre,data.raza_id,data.sexo,data.fecha_nacimiento,data.peso_kg,data.estado,data.observaciones,req.params.id]);if(!rows.length)return res.status(404).json({mensaje:'Registro no encontrado.'});res.json({mensaje:'Registro actualizado correctamente.',registro:rows[0]});}catch(e){next(e);}});
app.delete('/api/ganado/:id',async(req,res,next)=>{try{const result=await pool.query('DELETE FROM ganado WHERE id=$1',[req.params.id]);if(!result.rowCount)return res.status(404).json({mensaje:'Registro no encontrado.'});res.json({mensaje:'Registro eliminado correctamente.'});}catch(e){next(e);}});

app.get('/api/reportes/ganado/excel', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        g.codigo,
        g.nombre,
        r.nombre AS raza,
        g.sexo,
        g.fecha_nacimiento,
        g.peso_kg,
        g.estado,
        g.observaciones,
        g.creado_en
      FROM ganado g
      JOIN razas r ON r.id = g.raza_id
      ORDER BY g.id DESC
    `);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Finca Ganadera El Progreso';
    workbook.created = new Date();

    const hoja = workbook.addWorksheet('Reporte de Ganado', {
      views: [{ state: 'frozen', ySplit: 4 }]
    });

    hoja.columns = [
      { key: 'codigo', width: 15 },
      { key: 'nombre', width: 22 },
      { key: 'raza', width: 20 },
      { key: 'sexo', width: 12 },
      { key: 'fecha_nacimiento', width: 22 },
      { key: 'peso_kg', width: 15 },
      { key: 'estado', width: 19 },
      { key: 'observaciones', width: 42 },
      { key: 'creado_en', width: 22 }
    ];

    hoja.mergeCells('A1:I1');
    const titulo = hoja.getCell('A1');
    titulo.value = 'FINCA GANADERA EL PROGRESO';
    titulo.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titulo.alignment = { horizontal: 'center', vertical: 'middle' };
    titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F5C3A' } };
    hoja.getRow(1).height = 30;

    hoja.mergeCells('A2:I2');
    const subtitulo = hoja.getCell('A2');
    subtitulo.value = 'Reporte administrativo de ganado';
    subtitulo.font = { size: 13, bold: true };
    subtitulo.alignment = { horizontal: 'center' };

    hoja.mergeCells('A3:I3');
    const fechaReporte = hoja.getCell('A3');
    fechaReporte.value = `Generado el ${new Date().toLocaleDateString('es-DO')} a las ${new Date().toLocaleTimeString('es-DO')}`;
    fechaReporte.font = { italic: true, color: { argb: 'FF555555' } };
    fechaReporte.alignment = { horizontal: 'center' };

    const encabezados = ['Código', 'Nombre', 'Raza', 'Sexo', 'Fecha de nacimiento', 'Peso (kg)', 'Estado', 'Observaciones', 'Fecha de registro'];
    encabezados.forEach((texto, indice) => {
      hoja.getCell(4, indice + 1).value = texto;
    });

    const filaEncabezados = hoja.getRow(4);
    filaEncabezados.height = 24;
    filaEncabezados.eachCell(celda => {
      celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D4F' } };
      celda.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      celda.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    rows.forEach(registro => {
      hoja.addRow({
        codigo: registro.codigo,
        nombre: registro.nombre,
        raza: registro.raza,
        sexo: registro.sexo,
        fecha_nacimiento: registro.fecha_nacimiento,
        peso_kg: Number(registro.peso_kg),
        estado: registro.estado,
        observaciones: registro.observaciones || 'Sin observaciones',
        creado_en: registro.creado_en
      });
    });

    hoja.eachRow((fila, numeroFila) => {
      if (numeroFila < 5) return;
      fila.eachCell(celda => {
        celda.alignment = { vertical: 'middle', wrapText: true };
        celda.border = {
          top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
        };
        if (numeroFila % 2 === 0) {
          celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F7F3' } };
        }
      });
    });

    hoja.getColumn('peso_kg').numFmt = '#,##0.00';
    hoja.getColumn('fecha_nacimiento').numFmt = 'dd/mm/yyyy';
    hoja.getColumn('creado_en').numFmt = 'dd/mm/yyyy hh:mm';
    hoja.autoFilter = { from: 'A4', to: 'I4' };
    hoja.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };
    hoja.headerFooter.oddFooter = '&LFinca El Progreso&CReporte de ganado&R Página &P de &N';

    const fechaArchivo = new Date().toISOString().slice(0, 10);
    const nombreArchivo = `reporte-ganado-${fechaArchivo}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));
app.get('*',(req,res)=>res.sendFile(path.join(FRONTEND_DIR,'index.html')));
app.use((err,req,res,next)=>{console.error(err);if(err.code==='23505')return res.status(409).json({mensaje:'El código ya está registrado. Utilice uno diferente.'});if(err.code==='23503')return res.status(400).json({mensaje:'La relación seleccionada no existe o está siendo utilizada.'});res.status(500).json({mensaje:'Ocurrió un error interno en el servidor.'});});
app.listen(PORT,()=>console.log(`Finca El Progreso disponible en http://localhost:${PORT}`));
