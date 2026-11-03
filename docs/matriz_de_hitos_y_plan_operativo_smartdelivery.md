# Matriz de Hitos y Plan Operativo: SmartDelivery (90 Minutos)

**Proyecto:** SmartDelivery – Sistema de Gestión de Pedidos y Envíos  
**Objetivo:** Completar el 100% de los requerimientos de la evaluación final XCODE 2026 sin bloqueos técnicos ni dependencias de pago.

---

## 0. Checklist de Verificación Previa (Garantía de Cero Bloqueos)

Antes de iniciar el cronómetro, se verifican las siguientes condiciones para evitar cuellos de botella:

* [x] **Base de Datos Embebida:** Uso de `better-sqlite3` o `sqlite3` sobre archivo local (`smartdelivery.db`). No requiere Docker, contraseñas de red ni puertos de servidor adicionales.
* [x] **Motor Cartográfico Gratuito:** Uso de **Leaflet (`react-leaflet`)** y **OpenStreetMap**. No requiere tarjetas de crédito, tokens ni llaves de API (evitando bloqueos de Google Maps Platform).
* [x] **Datos Semilla Autoejecutables (*Seeders*):** Usuarios y productos se crean en la memoria/disco al levantar el servidor por primera vez, permitiendo evaluar el sistema sin perder tiempo rellenando formularios.
* [x] **Arquitectura Monocanal Frontend:** Vistas condicionadas por rol en un solo flujo SPA para prescindir de configuraciones complejas de enrutamiento web.

---

## Desglose Detallado de Hitos

```
[00m - 15m] HITO 1: Base de Datos y Datos Semilla
   │
[16m - 35m] HITO 2: Backend RESTful y Seguridad JWT
   │
[36m - 55m] HITO 3: Frontend Base y Control de Roles
   │
[56m - 75m] HITO 4: Mapa Leaflet, Trazado y Simulación GPS
   │
[76m - 90m] HITO 5: Validación Cruzada E2E y Sustentación
```

---

### HITO 1: Estructura de Datos y Semilla Automática
* **Ventana de tiempo:** Minuto 00 al Minuto 15 (15 min)
* **Puntaje impactado:** 15 pts (*Gestión y persistencia de productos y pedidos*)
* **Objetivo:** Disponer de una base de datos funcional con las entidades mínimas requeridas y datos iniciales para pruebas.

#### Tareas Técnicas
1. Inicializar proyecto Node.js e instalar dependencias esenciales:
   ```bash
   npm init -y
   npm install express cors jsonwebtoken bcryptjs better-sqlite3 dotenv
   ```
2. Crear la base de datos SQLite con las 3 tablas compactas:
   * `users` (`id`, `name`, `email`, `password`, `role`)
   * `products` (`id`, `name`, `description`, `price`, `stock`, `imageUrl`)
   * `orders` (`id`, `userId`, `itemsSummary`, `total`, `status`, `destAddress`, `destLat`, `destLng`, `currentLat`, `currentLng`, `createdAt`)
3. Programar la rutina de inserción automática (*Seeder*) que valide si las tablas están vacías y cargue:
   * 1 cuenta Administrador: `admin@tienda.com` (clave: `123456`, rol: `ADMIN`).
   * 1 cuenta Cliente: `cliente@correo.com` (clave: `123456`, rol: `CLIENT`).
   * 4 productos tecnológicos (Laptop Pro, Mouse Inalámbrico, Teclado Mecánico, Monitor 24").

#### Criterio de Aceptación (DoD)
* Al ejecutar `node server.js`, la consola muestra: `Base de datos inicializada y seeders cargados con éxito`.

---

### HITO 2: Backend RESTful y Autenticación con Roles
* **Ventana de tiempo:** Minuto 16 al Minuto 35 (20 min)
* **Puntaje impactado:** 15 pts (*Autenticación y seguridad*) + 15 pts (*Desarrollo Backend y API REST*)
* **Objetivo:** Exponer los endpoints HTTP protegidos mediante tokens JWT y control de acceso.

#### Tareas Técnicas
1. **Controlador de Autenticación (`/api/auth`):**
   * Endpoint `POST /register`: Cifra contraseña con `bcryptjs`, guarda usuario y retorna JWT con `{ id, email, role }`.
   * Endpoint `POST /login`: Verifica credenciales y retorna el JWT firmado junto con el rol.
2. **Middleware de Seguridad:**
   * Función `verifyToken`: Extrae y valida el header `Authorization: Bearer <token>`.
   * Función `requireRole(role)`: Rechaza peticiones si el usuario no tiene permisos (`ADMIN` o `CLIENT`).
3. **Endpoints de Negocio:**
   * `GET /api/products`: Lista el catálogo público.
   * `POST /api/products`: Inserta nuevo producto (solo `ADMIN`).
   * `POST /api/orders`: Crea un pedido asociando las coordenadas del cliente y seteando las coordenadas iniciales del repartidor en la tienda (solo `CLIENT`).
   * `GET /api/orders`: Si es cliente, filtra por su `userId`; si es tienda, lista todos los pedidos del sistema.
   * `PATCH /api/orders/:id/tracking`: Actualiza `status`, `currentLat` y `currentLng` (solo `ADMIN`).

#### Criterio de Aceptación (DoD)
* Pruebas rápidas mediante consola o archivo `.http` confirman que un usuario con rol `CLIENT` no puede invocar rutas marcadas como exclusivas para `ADMIN`.

---

### HITO 3: Frontend Base, Autenticación y Flujo Comercial
* **Ventana de tiempo:** Minuto 36 al Minuto 55 (20 min)
* **Puntaje impactado:** 10 pts (*Diseño e interfaz*) + 15 pts (*Integración Full Stack*)
* **Objetivo:** Crear la interfaz de usuario en React que responda visualmente al rol autenticado.

#### Tareas Técnicas
1. Crear el cliente con Vite e instalar librerías visuales:
   ```bash
   npm create vite@latest client -- --template react
   cd client && npm install lucide-react leaflet react-leaflet
   ```
2. Configurar Tailwind CSS e importar la hoja de estilos de Leaflet en `client/index.html`:
   ```html
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
   ```
3. Construir la vista de acceso (`AuthView`):
   * Formulario reactivo para Login y Registro con selector de rol (`Cliente` / `Tienda`) para conveniencia del evaluador.
   * Persistencia del token y datos de sesión en `localStorage`.
4. Construir la estructura de las dos vistas principales:
   * **Panel Cliente:** Listado de productos en tarjetas, botón de compra rápida y sección "Mis Pedidos".
   * **Panel Tienda:** Formulario de alta de productos tecnológicos y tabla con el resumen de pedidos activos.

#### Criterio de Aceptación (DoD)
* Al iniciar sesión como `admin@tienda.com`, se muestra el panel administrativo. Al cerrar sesión e ingresar como `cliente@correo.com`, se muestra la tienda y el historial personal.

---

### HITO 4: Integración del Mapa, Trazado y Simulación GPS
* **Ventana de tiempo:** Minuto 56 al Minuto 75 (20 min)
* **Puntaje impactado:** 20 pts (*Integración del mapa y seguimiento de envíos*)
* **Objetivo:** Visualizar la tienda, el destino del envío, la posición actual del repartidor y la ruta trazada en un mapa interactivo.

#### Tareas Técnicas
1. **Definir constantes de geolocalización:**
   * Coordenadas de la tienda: $\text{STORE\_COORDS} = [-12.0464, -77.0428]$ (Lima Centro).
2. **Componente de Selección de Destino (Cliente):**
   * Integrar `<MapContainer>` con un listener de eventos (`useMapEvents`) que capture el clic del usuario en la pantalla y fije `destLat` y `destLng` en el formulario de compra.
3. **Componente de Seguimiento en Vivo (`<DeliveryMap />`):**
   * Mostrar 3 marcadores diferenciados:
     * Marcador A: Tienda (icono base).
     * Marcador B: Repartidor / Paquete (`currentLat`, `currentLng`).
     * Marcador C: Domicilio del cliente (`destLat`, `destLng`).
   * Trazar la ruta vectorial usando `<Polyline positions={[STORE_COORDS, [currentLat, currentLng], [destLat, destLng]]} color="blue" />`.
4. **Módulo de Simulación de Ruta (Tienda):**
   * Incluir botones en el panel de administración que actualicen la telemetría del pedido con un clic:
     * *Inicio (0%):* Mantiene coordenadas de la tienda y estado `PENDIENTE`.
     * *Tránsito (50%):* Calcula el punto medio:
       $$Lat_{mid} = \frac{Lat_{store} + Lat_{dest}}{2}, \quad Lng_{mid} = \frac{Lng_{store} + Lng_{dest}}{2}$$
       y actualiza el estado a `EN_CAMINO`.
     * *Completado (100%):* Iguala las coordenadas actuales al destino y marca `ENTREGADO`.

#### Criterio de Aceptación (DoD)
* El cliente visualiza en tiempo real el desplazamiento del marcador en el mapa cuando el administrador presiona los botones de actualización de estado.

---

### HITO 5: Validación Cruzada E2E y Cierre Técnico
* **Ventana de tiempo:** Minuto 76 al Minuto 90 (15 min)
* **Puntaje impactado:** 10 pts (*Uso de IA, resolución de problemas y sustentación*) + 15 pts (*Integración general*)
* **Objetivo:** Ejecutar la prueba funcional completa y preparar los argumentos para los jurados.

#### Tareas Técnicas
1. **Prueba en Vivo con Doble Navegador:**
   * Ventana A (Modo incógnito - Cliente): Seleccionar producto, hacer clic en el mapa para marcar domicilio en San Isidro o Miraflores y registrar pedido.
   * Ventana B (Navegador principal - Tienda): Abrir el pedido recién registrado, cambiar estado a `EN_CAMINO` y mover el repartidor al punto medio.
   * Ventana A: Refrescar y validar que el mapa muestra al repartidor en camino.
2. **Limpieza y Estabilidad de Código:**
   * Asegurar que no existan errores de consola (`console.error`).
   * Validar que los campos numéricos de coordenadas no reciban valores `null` o `undefined`.
3. **Repaso de Argumentos de Sustentación:**
   * Justificar el uso de SQLite y Leaflet por eficiencia y confiabilidad bajo condiciones de tiempo límite.
   * Explicar el rol de la IA en la aceleración de interfaces y diseño de esquemas.

#### Criterio de Aceptación (DoD)
* El flujo completo (Registro $\rightarrow$ Pedido con Mapa $\rightarrow$ Despacho Administrativo $\rightarrow$ Entrega) funciona sin interrupciones ni recargas manuales forzadas de base de datos.

---

## Matriz de Cobertura de la Rúbrica (100 Puntos)

| Criterio de Evaluación | Pts | Hito Responsable | Elemento Clave a Mostrar al Jurado |
| :--- | :---: | :---: | :--- |
| **1. Autenticación y roles** | 15 | Hito 2 y 3 | Inicio de sesión con JWT y vistas diferenciadas para `CLIENT` y `ADMIN`. |
| **2. Diseño e interfaz (Frontend)** | 10 | Hito 3 | Layout responsivo y limpio implementado con Tailwind CSS. |
| **3. Desarrollo Backend y API REST** | 15 | Hito 2 | Rutas RESTful estructuradas con verbos `GET`, `POST`, `PATCH`. |
| **4. Persistencia de productos y pedidos**| 15 | Hito 1 | Base de datos SQLite con tablas relacionadas e inserción persistente. |
| **5. Integración de mapa y envíos** | 20 | Hito 4 | 3 marcadores (Tienda, Repartidor, Cliente), ruta `Polyline` y telemetría simulada. |
| **6. Integración Full Stack** | 15 | Hito 3 y 5 | Comunicación fluida entre cliente React y servidor Node.js sin bloqueos de CORS. |
| **7. Sustentación y uso de IA** | 10 | Hito 5 | Explicación solvente de decisiones arquitectónicas y optimización del tiempo. |
| **TOTAL** | **100** | | |