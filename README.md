# Finca Ganadera El Progreso — Fase 2

Aplicación web dinámica desarrollada con HTML5, CSS3, JavaScript, Node.js, Express.js y PostgreSQL.

## Estructura del proyecto

```text
Finca-El-Progreso-Fase-2-Organizado/
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── img/
├── backend/
│   ├── database/
│   │   └── schema.sql
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   └── server.js
├── .gitignore
└── README.md
```

## Funcionalidades

- Conserva Inicio, Nosotros, Servicios, Productos, Galería y Contacto.
- Incluye Gestión de Ganado con CRUD completo.
- Registra, consulta, modifica y elimina información.
- Genera reportes dinámicos desde PostgreSQL.
- Incluye búsqueda, filtro por estado e impresión.
- Utiliza las tablas relacionadas `razas` y `ganado`.
- Incluye llaves primarias, llave foránea y datos de prueba.
- Valida datos en el frontend y en el backend.

## Configuración de PostgreSQL

1. Crea la base de datos:

```sql
CREATE DATABASE finca_el_progreso;
```

2. Ejecuta el archivo:

```text
backend/database/schema.sql
```

Desde una terminal también puedes utilizar:

```bash
psql -U postgres -d finca_el_progreso -f backend/database/schema.sql
```

## Configuración del backend

Entra a la carpeta `backend`:

```bash
cd backend
```

Copia `.env.example`, renómbralo como `.env` y configura tus datos:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finca_el_progreso
DB_USER=postgres
DB_PASSWORD=tu_contraseña
```

Instala las dependencias y ejecuta el servidor:

```bash
npm install
npm start
```

Abre en el navegador:

```text
http://localhost:3000
```

El backend sirve automáticamente el contenido de la carpeta `frontend`, por lo que no debes abrir `index.html` directamente.

## API REST

- `GET /api/salud`
- `GET /api/razas`
- `GET /api/ganado`
- `GET /api/ganado/:id`
- `POST /api/ganado`
- `PUT /api/ganado/:id`
- `DELETE /api/ganado/:id`


## Exportar reporte a Excel

En la sección **Reportes** se incluye el botón **Exportar a Excel**. El backend consulta los registros directamente desde PostgreSQL y genera un archivo `.xlsx` con título, fecha, filtros, formatos y todos los datos del ganado.
