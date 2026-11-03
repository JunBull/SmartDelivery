# SmartDelivery - Directrices de Arquitectura y Desarrollo (XCODE 2026)

## Contexto del Proyecto
Desarrollo contrarreloj (90 minutos) de una aplicación Full Stack monolítica y ligera para el sistema "SmartDelivery". El sistema gestiona pedidos y realiza seguimiento de envíos en tiempo real mediante un mapa interactivo.

## Stack Tecnológico Obligatorio
- **Backend:** Node.js con Express (arquitectura en un solo servicio o estructura mínima de controladores).
- **Base de Datos:** SQLite local mediante `better-sqlite3` o `sqlite3` (con migraciones y seed automático al iniciar).
- **Seguridad:** JSON Web Tokens (JWT) con diferenciación estricta de roles (`cliente` y `tienda`) y contraseñas hasheadas con `bcryptjs`.
- **Frontend:** Single Page Application (SPA) servida como estáticos desde Express (`/public`), maquetada con Tailwind CSS (CDN) y Vanilla JS modular.
- **Mapas:** Leaflet.js + OpenStreetMap (CDN, sin dependencias de API keys comerciales).

## Reglas Críticas de Implementación
1. **Cero Placeholders:** Prohibido emitir comentarios del tipo `// TODO`, `// Agrega aquí la lógica`, o código abreviado con `...`. Todo archivo generado debe ser funcional, autónomo y listo para producción.
2. **Monolito Estructurado:** Para agilizar el despliegue en 90 min, priorizar la consolidación en archivos clave:
   - `server.js`: Punto de entrada, middlewares, rutas de API y servidor de estáticos.
   - `database.js`: Esquema SQLite, inicialización y datos semilla preconfigurados.
   - `public/index.html`: UI completa dividida en contenedores (`#auth-view`, `#client-view`, `#admin-view`).
   - `public/app.js`: Lógica de consumo de API, gestión de estado local (token, rol) y renderizado.
   - `public/map.js`: Inicialización de Leaflet, trazado de rutas, cálculo de polilíneas y simulación de coordenadas.
3. **Mapeo y Coordenadas:**
   - Origen fijo (Tienda): Coordenadas base en Lima `[-12.0768, -76.9535]`.
   - Destino (Cliente): Coordenadas seleccionables vía clic en mapa o ingresadas manualmente.
   - Envío: Coordenada flotante interpolada entre Origen y Destino según el estado (`Pendiente`, `En camino`, `Entregado`).
4. **Respuesta ante Errores:** Todas las rutas de la API deben retornar JSON estructurado: `{ success: boolean, data?: any, error?: string }` con sus respectivos códigos HTTP (200, 201, 400, 401, 403, 404, 500).