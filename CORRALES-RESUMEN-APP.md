# 🍗 Corrales — Resumen de la Aplicación Web

> **Pollería & Fastfood Corrales** — Plataforma de pedidos online, reservas, y gestión operativa.

---

## 📱 EXPERIENCIA DEL CLIENTE (Sitio Público)

### 🏠 Página de Inicio

| Característica | Descripción |
|---|---|
| **Slider de banners** | Carrusel principal con imágenes de promociones y campañas. Soporta imágenes distintas para desktop y mobile. Configurable 100% desde admin. |
| **Hero Section** | Dos botones de acción rápida: "Pedir delivery" (va al menú) y "Reservar Mesa" (va a reservas). |
| **Menú completo en homepage** | Todo el catálogo de productos visible en el home, organizado por categorías. Incluye búsqueda por texto y scroll lateral de categorías. |
| **Carousel automático** | Franja de productos destacados con auto-scroll cada 30 segundos. Flechas de navegación manual. |
| **Botón flotante WhatsApp** | Ícono verde de WhatsApp fijo en la esquina inferior derecha en todas las páginas. Contacto directo con el negocio. |
| **Carrito de compras flotante** | Ícono de carrito con contador de items. Al hacer clic, abre un drawer lateral con el detalle del pedido. Animación de "pop" cuando se agrega un producto. |

---

### 📋 Carta / Menú (`/menu`)

| Característica | Descripción |
|---|---|
| **Navegación por categorías** | Barra horizontal con scroll que muestra las categorías y resalta automáticamente la que está visible en pantalla. Las categorías principales "Pollo a la Brasa" y "Parrillas" aparecen primero. |
| **Búsqueda por texto** | Campo de búsqueda en el header que filtra productos en tiempo real. Funciona también vía URL (`/menu?q=pollo`). |
| **Product Cards** | Cada producto muestra su imagen, nombre, descripción, tag promocional (ej. "Nuevo", "Bestseller"), y variantes de precio (ej. 1/4 Pollo S/25, 1/2 Pollo S/45). |
| **Variantes de producto** | Los productos pueden tener múltiples presentaciones con precios distintos. Ej: Mollejitas 100gr / 200gr, Gaseosa personal / 1.5L / 3L. |
| **Página de detalle** (`/producto/[id]`) | Vista individual con imagen grande, descripción completa, selector de variante, y opciones personalizables (ver abajo). |
| **Grupos de opciones** | Productos configurables con extras: guarniciones, salsas, bebidas adicionales. Dos tipos: selección única (radio) o por cantidad (+/-). Cada opción puede sumar al precio (price delta). Ej: +S/2 por papas fritas, +S/1.50 por cremas extra. |
| **Agregar al carrito** | Botón directo desde la card del producto o desde la página de detalle con la variante y opciones seleccionadas. |

---

### 🛒 Carrito de Compras

| Característica | Descripción |
|---|---|
| **Drawer lateral** | Panel que se desliza desde la derecha con todos los items agregados. Fondo con blur y overlay oscuro. |
| **Persistencia** | El carrito se guarda automáticamente en el navegador (localStorage). Si el cliente cierra la página y vuelve, su pedido sigue ahí. |
| **Gestión de items** | Cada item muestra: producto, variante, cantidad, precio unitario y subtotal. Controles `+`/`-` para ajustar cantidad. Botón para eliminar. |
| **Resumen de compra** | Subtotal, costo de delivery (S/5.00 fijo), y total final. |
| **Botón de checkout** | "Ir al Checkout" que redirige al formulario de pedido. |
| **Carrito vacío** | Estado visual amigable con ilustración y link al menú cuando no hay items. |
| **Cierre** | Se cierra con botón X, tecla Escape, o clic fuera del drawer. |

---

### 💳 Checkout / Finalizar Pedido (`/checkout`)

| Característica | Descripción |
|---|---|
| **Formulario validado** | Nombre completo (3-80 caracteres), teléfono (9 dígitos). Validación en tiempo real con mensajes de error. |
| **Tipo de entrega** | Toggle entre "Delivery" y "Recojo en tienda". Si es recojo, no pide dirección. |
| **Dirección inteligente** | Autocompletado con Mapbox: el cliente escribe su dirección y recibe sugerencias. Se requiere confirmar el número de casa si la dirección no lo incluye. |
| **Geolocalización** | Botón "Usar mi ubicación actual" que obtiene lat/lng del dispositivo y hace reverse geocode para llenar la dirección automáticamente. |
| **Mapa de ubicación** | Las coordenadas se guardan y se genera un link a OpenStreetMap para que el repartidor pueda ver la ubicación exacta. |
| **Notas del pedido** | Campo de texto libre (hasta 200 caracteres) para instrucciones especiales: "sin cremas", "puerta roja", etc. |
| **Resumen del pedido** | Recuadro lateral con todos los items, subtotal, delivery y total. |
| **Upsell / Sugerencias** | Sección de productos sugeridos para aumentar el ticket promedio. |
| **Pago con tarjeta (Culqi)** | Integración con pasarela de pagos Culqi. El cliente paga con tarjeta de crédito/débito directamente en el checkout. |
| **Simular compra (demo)** | Botón secundario que crea el pedido como "efectivo" sin pasar por la pasarela de pago — ideal para pruebas o pedidos telefónicos. |
| **Confirmación** | Al completar, se muestra el número de pedido, se vacía el carrito y redirige al inicio. |

---

### 📅 Reservas (`/reservas`)

| Característica | Descripción |
|---|---|
| **Formulario simple** | Nombre, teléfono, fecha, hora, número de personas (1-20), notas opcionales. |
| **Confirmación WhatsApp** | Al hacer la reserva, se genera un link de WhatsApp con todos los datos para confirmar con el restaurante. |
| **Estados** | Pendiente → Confirmada → Cancelada. El restaurante gestiona los estados desde el admin. |

---

### 📖 Nosotros (`/nosotros`)

| Característica | Descripción |
|---|---|
| **Historia de la familia** | Línea de tiempo con 4 hitos: 1987 (Don Aurelio, Chorrillos), 2001 (segunda generación, Barranco), 2015 (parrillas), 2024 (tercera generación, delivery digital). |
| **Valores** | Tarjetas visuales: Tradición, Calidad, Familia, Sabor. |
| **Invitación** | CTA al final para visitar el local o hacer un pedido. |

---

### 💼 Trabaja con Nosotros (`/trabaja-con-nosotros`)

| Característica | Descripción |
|---|---|
| **Postulación con CV** | Formulario con nombre, correo, teléfono (opcional), y upload de PDF (máx 5MB). |
| **Drag & drop** | Zona de arrastrar y soltar archivos, además del botón de selección tradicional. |
| **Aceptación de políticas** | Checkbox obligatorio que vincula a Política de Privacidad y Términos y Condiciones. |
| **Sección de beneficios** | Tarjetas: Crecimiento profesional, Buen Clima laboral, Beneficios (descuentos en productos). |

---

### 🧭 Navegación del Sitio

| Característica | Descripción |
|---|---|
| **Header fijo rojo** | Barra superior siempre visible con logo de Corrales (ícono de llama + texto). Navegación desktop: Inicio, Menú, Reservas, Nosotros, Trabaja con nosotros. |
| **Menú mobile** | Hamburguesa que despliega un drawer con las mismas opciones + acceso a admin si el usuario tiene ese rol. |
| **Bottom Nav (mobile)** | Barra inferior fija con 4 íconos: Inicio, Carta, Carrito, Perfil. El ítem activo se resalta con el color primario. |
| **Búsqueda en header** | Campo de búsqueda que redirige a `/menu?q=...` al presionar Enter. |
| **Cookie Consent** | Banner en la parte inferior con botones "Aceptar" y "Cancelar". La decisión se guarda en localStorage. |

---

### 📌 Footer

| Característica | Descripción |
|---|---|
| **Diseño oscuro** | Fondo rojo primario con texto blanco. |
| **Secciones configurables** | "Contacto", "Sobre Nosotros" y "Políticas" — cada una con links personalizables desde admin. |
| **Redes sociales** | Íconos de Facebook, Instagram y TikTok con links configurables. |
| **Acordeón mobile** | En pantallas pequeñas las secciones son colapsables para ahorrar espacio. |
| **Datos editables** | WhatsApp, email, dirección, texto "about" — todo cambiable desde admin sin tocar código. |

---

## 🔐 ADMINISTRACIÓN (Panel `/admin`)

> Solo accesible con usuario y contraseña (rol `admin`). El login está en `/login`.

### 📊 Dashboard de Pedidos Activos

| Característica | Descripción |
|---|---|
| **Tiempo real** | Los pedidos aparecen instantáneamente apenas el cliente confirma. Se actualiza solo, sin necesidad de refrescar la página. |
| **Flujo de estados** | Cada pedido avanza por: **Pendiente → Preparando → Listo → En Camino → Entregado**. Un botón permite avanzar al siguiente estado. |
| **Cancelación** | Posibilidad de cancelar un pedido en cualquier momento. |
| **Asignación de repartidor** | Cuando el pedido está "Listo", se puede seleccionar un repartidor de la lista para que lo entregue. |
| **Tarjeta de pedido** | Muestra: número de orden, estado (con color), nombre del cliente, tipo de entrega, items con cantidades, total, método de pago. |
| **Acceso rápido a facturación** | Si el pedido tiene comprobante emitido, muestra un badge con link al PDF. |
| **Notificaciones Push** | El admin puede activar alertas en el navegador para recibir notificaciones de nuevos pedidos incluso con la pestaña cerrada. |

---

### 📜 Historial de Pedidos

| Característica | Descripción |
|---|---|
| **Filtros avanzados** | Por rango de fechas (desde/hasta) y por estado (entregado, cancelado, o ambos). |
| **Vista igual al dashboard** | Misma presentación de tarjetas con todos los datos. |
| **Separación clara** | Los pedidos completados/cancelados no saturan el dashboard de pedidos activos. |

---

### 🍽️ Gestión de Productos

| Característica | Descripción |
|---|---|
| **Listado completo** | Tabla con todos los productos: nombre, categoría, estado (activo/inactivo), tag, cantidad de variantes. |
| **Crear / Editar** | Formulario con: nombre, descripción, imagen (upload a servidor), tag, categoría, estado. |
| **Activar / Desactivar** | Un switch permite ocultar un producto del menú sin eliminarlo. Ideal para platos de temporada. |
| **Gestión de variantes** | Cada producto puede tener múltiples precios (ej: 1/4, 1/2, Entero). Se pueden agregar, editar y eliminar variantes. |
| **Grupos de opciones** | Para cada producto se pueden definir grupos de personalización: |
|   | • **Selección única**: el cliente elige 1 opción entre varias (ej: tipo de papa) |
|   | • **Selección por cantidad**: el cliente puede elegir varias unidades (ej: cremas extra) |
|   | • **Mín/Máx**: cuántas opciones debe/puede seleccionar |
|   | • **Obligatorio u opcional** |
|   | • **Precio delta**: cada opción puede sumar al precio final |
| **Imágenes** | Upload directo desde el formulario. Se guardan en el storage del servidor. |

---

### 📂 Gestión de Categorías

| Característica | Descripción |
|---|---|
| **CRUD completo** | Crear, editar y eliminar categorías. |
| **Protección** | No se puede eliminar una categoría que tenga productos asociados. |
| **Activar / Desactivar** | Al desactivar una categoría, todos sus productos se ocultan automáticamente del menú público. |
| **Conteo** | Muestra cuántos productos hay en cada categoría. |

---

### 🎠 Gestión del Slider

| Característica | Descripción |
|---|---|
| **Slides con imagen** | Cada slide puede tener imagen desktop y mobile por separado. Upload de imágenes al storage. |
| **Slides "custom"** | Alternativa sin imagen: fondo con gradiente configurable, ícono, título, subtítulo y botón CTA. |
| **Ordenamiento** | Se puede cambiar el orden de los slides. |
| **Activación individual** | Cada slide se puede activar/desactivar sin afectar a los demás. |
| **Fallback local** | Si no hay slides configurados, el slider muestra imágenes por defecto de `public/slider/`. |

---

### 📝 Contenido General

| Característica | Descripción |
|---|---|
| **Panel unificado** | Vista combinada de Slider + Site Settings. Permite gestionar todo el contenido editable de la web desde un solo lugar. |

---

### 🔗 Footer Configurable

| Característica | Descripción |
|---|---|
| **Texto "about"** | Párrafo descriptivo del negocio. |
| **Datos de contacto** | WhatsApp, email, dirección — editables. |
| **Secciones y links** | Las 3 columnas/secciones del footer: títulos y lista de links con etiqueta y URL. |
| **Redes sociales** | URLs de Facebook, Instagram, TikTok. |
| **Guardado inmediato** | Los cambios se aplican al instante en el sitio público. |

---

### 🛵 Gestión de Repartidores

| Característica | Descripción |
|---|---|
| **Listado** | Nombre, teléfono, estado (activo/inactivo), fecha de creación. |
| **Crear nuevo** | Formulario con nombre, email, contraseña y teléfono. Crea automáticamente la cuenta de acceso. |
| **Activar / Desactivar** | Control de qué repartidores están disponibles para asignar pedidos. |

---

### 📋 Gestión de Reservas

| Característica | Descripción |
|---|---|
| **Listado cronológico** | Reservas ordenadas por fecha y hora. |
| **Cambio de estado** | Pendiente → Confirmada → Cancelada con un solo clic. |
| **Vista completa** | Nombre, teléfono, fecha, hora, número de personas y notas. |

---

### 🧾 Facturación Electrónica (Nubefact / SUNAT)

| Característica | Descripción |
|---|---|
| **Emisión de comprobantes** | Boletas (B001) y Facturas (F001) electrónicas. |
| **Datos fiscales** | DNI o RUC del cliente, nombre/razón social, dirección. |
| **Cálculo automático de IGV** | 18% de IGV calculado ítem por ítem. |
| **Envío a SUNAT** | Integración directa con Nubefact para declarar los comprobantes. |
| **Documentos generados** | PDF, XML y CDR descargables. |
| **Panel de control** | Dashboard con cantidad de comprobantes emitidos, estado de series, RUC del emisor (20604262322). |

---

## 🚀 APP DE REPARTIDOR (`/delivery`)

> Acceso exclusivo para usuarios con rol `delivery`.

| Característica | Descripción |
|---|---|
| **Vista mobile-first** | Diseño optimizado para celular (390px de ancho máximo). |
| **Pedidos disponibles** | Lista de pedidos listos para entregar que ningún repartidor ha tomado aún. |
| **Tomar pedido** | El repartidor elige un pedido y se le asigna automáticamente. Cambia a estado "En Camino". |
| **Mis Entregas** | Lista de pedidos asignados al repartidor, con todos los datos del cliente y los productos. |
| **Ver mapa** | Link a OpenStreetMap con las coordenadas del cliente para navegación GPS. |
| **Contactar cliente** | Botón directo de WhatsApp con el número del cliente. |
| **Marcar como entregado** | Al finalizar la entrega, el repartidor confirma y el pedido pasa a estado "Entregado". |
| **Tiempo real** | Los pedidos nuevos aparecen automáticamente sin refrescar. |
| **Header personalizado** | Saludo con el nombre del repartidor y contador de pedidos activos. |

---

## 🔧 CARACTERÍSTICAS TÉCNICAS (para referencia)

### 🏗️ Stack Principal

| Tecnología | Uso |
|---|---|
| **Next.js 16** | Framework principal (App Router, React 19, Server Components) |
| **Supabase** | Base de datos PostgreSQL, autenticación, tiempo real, almacenamiento de archivos |
| **Tailwind CSS v4** | Estilos con design system personalizado (tokens de color, tipografía, sombras) |
| **Zustand** | Estado global del carrito de compras (persistido en localStorage) |
| **Mapbox GL** | Autocompletado inteligente de direcciones en el checkout |
| **Culqi** | Pasarela de pagos con tarjeta |
| **Nubefact** | API de facturación electrónica para SUNAT |
| **Web Push API** | Notificaciones push en el navegador para alertar nuevos pedidos |

### 🔐 Seguridad

- **Row Level Security (RLS)** en PostgreSQL: cada rol ve solo lo que debe ver.
- **Tres roles**: `admin` (acceso total), `delivery` (solo sus pedidos), `anon` (solo lectura de productos activos y creación de pedidos/reservas).
- **Validación Zod** en todos los formularios.
- **Proxy/Middleware** para autenticación a nivel de servidor.

### 📱 PWA

- La aplicación funciona como Progressive Web App (gracias a `next-pwa`), lo que permite instalarla en el celular como si fuera una app nativa.

### ⚡ Tiempo Real

- Supabase Realtime transmite cambios en pedidos al instante: admin y repartidor ven nuevos pedidos y cambios de estado sin refrescar.

---

## 📊 RESUMEN DE PÁGINAS

| Ruta | Tipo | Descripción |
|---|---|---|
| `/` | Público | Home con slider, hero y menú completo |
| `/menu` | Público | Carta con búsqueda y categorías |
| `/producto/[id]` | Público | Detalle de producto con opciones |
| `/checkout` | Público | Finalizar pedido y pago |
| `/reservas` | Público | Reserva de mesa |
| `/nosotros` | Público | Historia y valores |
| `/trabaja-con-nosotros` | Público | Postulación con CV |
| `/login` | Auth | Inicio de sesión |
| `/admin` | Admin | Dashboard de pedidos activos |
| `/admin/historial` | Admin | Historial de pedidos |
| `/admin/productos` | Admin | Gestión de productos |
| `/admin/categorias` | Admin | Gestión de categorías |
| `/admin/slider` | Admin | Gestión del slider |
| `/admin/contenido` | Admin | Contenido general unificado |
| `/admin/footer` | Admin | Configuración del footer |
| `/admin/usuarios` | Admin | Gestión de repartidores |
| `/admin/reservas` | Admin | Gestión de reservas |
| `/admin/facturacion` | Admin | Facturación electrónica |
| `/delivery` | Delivery | App del repartidor |

---

> **Total: 19 páginas** — 7 públicas + 11 admin + 1 delivery.

---

*Documento generado el 13 de junio de 2026. Para el dueño de Corrales — resumen funcional de todo lo que la aplicación puede hacer hoy.*
