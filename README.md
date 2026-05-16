# Pollería & Fastfood Corrales — Web App

Aplicación web para gestión de pedidos, menú digital, reservas y panel administrativo de **Pollería & Fastfood Corrales**.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Base de datos | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| UI | React 19 + Tailwind CSS v4 + shadcn/ui + Lucide + Material Symbols |
| Estado global | Zustand + `persist` (carrito persistente en localStorage) |
| Carousel / Slider | Swiper + Embla Carousel + Autoplay |
| Mapas | Mapbox GL + Mapbox Geocoder |
| Formularios | react-hook-form + Zod v4 |
| Pagos | Culqi (checkout.js + charge API) |
| Facturación electrónica | Nubefact (API SUNAT) |
| Notificaciones | Web Push API + pg_net (Supabase webhook) |
| Testing | Vitest + Testing Library |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (public)/              # Menú, checkout, reservas, nosotros, trabaja con nosotros
│   ├── (admin)/admin/         # Panel de administración
│   │   ├── productos/         # CRUD de productos + variantes + option groups
│   │   ├── categorias/        # CRUD de categorías
│   │   ├── reservas/          # Gestión de reservas
│   │   ├── slider/            # Gestión del slider del home
│   │   ├── historial/         # Historial de pedidos
│   │   ├── usuarios/          # Gestión de usuarios delivery
│   │   ├── facturacion/       # Facturación electrónica (Nubefact)
│   │   ├── contenido/         # Configuración del footer (site_settings)
│   │   └── footer/            # Footer del sitio
│   ├── (delivery)/            # Panel del repartidor
│   ├── login/                 # Autenticación
│   └── api/
│       ├── payment/charge/    # Cobro con Culqi
│       ├── invoice/send/      # Envío a Nubefact/SUNAT
│       └── admin/
│           ├── push/          # Web Push (subscribe + notify)
│           └── users/         # CRUD de usuarios delivery
├── components/
│   ├── admin/                 # AdminPage, ProductForm, OptionGroupsForm, InvoiceModal, etc.
│   ├── auth/                  # LoginForm, LogoutButton
│   ├── delivery/              # DeliveryPage
│   ├── home/                  # HomeSlider, HeroSection
│   ├── products/              # ProductCard, ProductCardMini, ProductDetailPage, OptionGroupAccordion
│   ├── cart/                  # CartDrawer, CartItemRow
│   ├── checkout/              # CheckoutForm, OrderSummary, UpsellSection, MapboxAutocomplete
│   ├── menu/                  # MenuPage
│   ├── nosotros/              # NosotrosPage
│   ├── reservas/              # ReservaForm
│   └── layout/                # Header, Footer, FloatingActions, LocationBanner, CookieBanner, etc.
├── hooks/
│   └── useGeolocation.ts      # Captura y persistencia de ubicación GPS
├── lib/
│   ├── api/
│   │   ├── products.ts        # CRUD productos + variantes + option groups + imágenes (Storage)
│   │   ├── admin.ts           # Pedidos activos, asignación, cambio de estado, historial
│   │   ├── delivery.ts        # Pedidos disponibles y de entrega propios
│   │   ├── orders.ts          # Creación de pedidos (RPC)
│   │   ├── reservations.ts    # CRUD reservas
│   │   ├── slider.ts          # Slides del home + imágenes (Storage)
│   │   ├── settings.ts        # Footer y configuraciones del sitio (JSONB site_settings)
│   │   └── users.ts           # CRUD usuarios delivery
│   ├── hooks/
│   │   └── usePushNotifications.ts  # Hook para Web Push API
│   ├── nubefact.ts            # Integración con Nubefact (facturación electrónica)
│   ├── supabase.ts            # Cliente browser (Zustand / Client Components)
│   ├── supabase-server.ts     # Cliente SSR (Server Components / middleware)
│   ├── supabase-admin.ts      # Cliente con service_role (admin API routes)
│   └── utils.ts               # cn() utility
├── proxy.ts                   # Middleware de autenticación y redirección por rol
├── store/
│   └── cart.ts                # Carrito (Zustand + persist)
└── types/
    ├── product.ts             # Product, ProductVariant, ProductOptionGroup, ProductOption
    ├── admin.ts               # AdminOrder, AdminOrderStatus, DeliveryProfile
    ├── cart.ts                # CartItem
    ├── invoice.ts             # Invoice, InvoiceSeries, NubefactItem
    └── database.types.ts      # Generado por Supabase CLI
```

---

## Configuración local

### Requisitos

- Node.js 20+
- Supabase CLI
- Bun (recomendado) o npm

### Variables de entorno

Crear `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Culqi (pagos)
NEXT_PUBLIC_CULQI_PUBLIC_KEY=<culqi-public-key>
CULQI_PRIVATE_KEY=<culqi-private-key>

# Mapbox (geocoder en checkout)
NEXT_PUBLIC_MAPBOX_TOKEN=<mapbox-public-token>

# Nubefact (facturación electrónica)
NUBEFACT_API_URL=https://<nubefact-instance>/api/v1
NUBEFACT_API_KEY=<nubefact-api-key>

# Web Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<vapid-public-key>
VAPID_PRIVATE_KEY=<vapid-private-key>
VAPID_SUBJECT=mailto:admin@corrales.pe
PUSH_NOTIFY_SECRET=<webhook-secret>
```

### Instalación

```bash
bun install
```

### Base de datos

```bash
# Levantar Supabase local
supabase start

# Aplicar migraciones y seed
supabase db push

# O resetear completamente con seed
supabase db reset
```

### Regenerar tipos después de una migración

```bash
supabase gen types typescript --linked > src/types/database.types.ts
```

### Desarrollo

```bash
bun dev
```

---

## Roles y accesos

| Rol | Rutas | Descripción |
|---|---|---|
| Público | `/`, `/menu`, `/checkout`, `/reservas`, `/nosotros`, `/trabaja-con-nosotros` | Navega el menú y hace pedidos |
| `admin` | `/admin/**` | Gestiona pedidos, productos, categorías, reservas, slider, usuarios, facturación y contenido |
| `delivery` | `/delivery` | Ve pedidos listos y marca entregas |

- La autenticación es via Supabase Auth (email + password).
- Los roles se manejan con RLS usando la función `current_user_role()`.
- El middleware (`proxy.ts`) redirige a cada usuario a su panel según su rol, e impide acceso cruzado.
- En el header público, los usuarios `admin` ven un botón **Panel** directo al dashboard.

---

## Módulos implementados

### Slider del home (`/`)
- Carousel con Swiper + autoplay
- Dos tipos de slide: `image` (flyer de Canva) y `custom` (gradiente + texto)
- Soporte de imagen separada para mobile (`image_url_mobile`)
- Aspect ratio `1:1` en mobile, `25:6` en desktop
- Contenido administrable desde el panel admin

### Menú público (`/menu`)
- Productos agrupados por categoría con orden de prioridad (Pollo a la Brasa y Parrillas primero)
- Variantes por producto (ej: 1/4, 1/2, entero)
- Grupos de opciones para personalización tipo combo (ej: acompañantes, bebidas)
- Filtro por categoría
- Modal de detalle de producto con selector de variantes y opciones (`/producto/:id`)
- Barra de búsqueda

### Carrito
- Drawer lateral con items y resumen
- Persistencia en `localStorage` via Zustand `persist`
- FAB flotante con animación `cart-pop` al agregar items

### Checkout (`/checkout`)
- Formulario con validación (react-hook-form + Zod)
- Tipos de entrega: delivery o recojo en local
- Autocompletado de direcciones con Mapbox Geocoder
- Captura opcional de ubicación GPS con preview en Google Maps (sin API key)
- Sección de upselling (productos sugeridos antes de pagar)
- Pago via Culqi con mensajes de error accionables para llave inválida/ausente
- Botón **Simular compra** para demostrar el flujo sin pasar por Culqi
- Datos fiscales opcionales (RUC/DNI) para facturación electrónica

### Reservas (`/reservas`)
- Formulario con validación
- Persistencia en Supabase

### Página de producto (`/producto/:id`)
- Vista detallada con imagen, descripción, variantes y grupos de opciones
- Selector de cantidad y botón para agregar al carrito

### Trabaja con nosotros (`/trabaja-con-nosotros`)
- Página informativa para postulantes
- Enlace en el menú de navegación

### Cookie Consent
- Banner de consentimiento de cookies con persistencia

### Panel Admin (`/admin`)
- Pedidos activos en tiempo real (Supabase Realtime via `postgres_changes`)
- Flujo de estados: `pendiente → preparando → listo / en_camino → entregado`
- Asignación de repartidor durante la etapa `preparando`
- Cancelación de pedidos
- Stats del día (BentoStats)

### CRUD de Productos (`/admin/productos`)
- Listado de todos los productos (activos e inactivos)
- Crear y editar producto con variantes dinámicas y grupos de opciones
- Activar / desactivar (soft delete)
- Subida de imagen a Supabase Storage (`product-images`) con preview instantáneo

### CRUD de Categorías (`/admin/categorias`)
- Crear, editar y desactivar categorías
- Control de orden de prioridad (archivado)

### Historial de Pedidos (`/admin/historial`)
- Vista de pedidos entregados y cancelados
- Filtros por fecha

### Gestión de Usuarios Delivery (`/admin/usuarios`)
- Crear cuentas de repartidor
- Activar / desactivar acceso

### Facturación Electrónica (`/admin/facturacion`)
- Envío de comprobantes a SUNAT via Nubefact
- Manejo de series (boletas B001 / facturas F001)
- Modal con datos del cliente y opción de envío por email
- Historial de facturas emitidas

### Gestión de Contenido (`/admin/contenido`)
- Editor visual del footer (teléfonos, horarios, redes sociales)
- Persistencia en JSONB (`site_settings`)

### Gestión de Reservas Admin (`/admin/reservas`)
- Listado de reservas con cambio de estado (pendiente / confirmada / cancelada)

### Gestión del Slider (`/admin/slider`)
- Crear, editar, reordenar y eliminar slides
- Selector visual de iconos y presets de gradiente (sin strings técnicos)
- Subida de imágenes desktop y mobile por separado al bucket `slider-images`

### Panel Delivery (`/delivery`)
- Pedidos en estado `listo` disponibles para tomar
- Mis entregas en curso con acceso al mapa y contacto por WhatsApp
- Marcar entrega como completada
- Actualización en tiempo real (Supabase Realtime)

### Notificaciones Push
- Suscripción de administradores via Web Push API
- Webhook en Supabase (`pg_net`) que dispara notificación al crear un nuevo pedido
- Banner de registro en el panel admin

---

## Storage

| Bucket | Uso | Acceso |
|---|---|---|
| `product-images` | Imágenes del catálogo de productos | Público (lectura), admin (escritura) |
| `slider-images` | Imágenes de slides del home | Público (lectura), admin (escritura) |

- Tamaño máximo: 5 MB por archivo
- Formatos: JPEG, PNG, WebP

---

## API Routes

| Ruta | Método | Descripción |
|---|---|---|
| `/api/payment/charge` | POST | Ejecuta cobro con Culqi |
| `/api/invoice/send` | POST | Envía factura a Nubefact/SUNAT |
| `/api/admin/push/subscribe` | POST / DELETE | Gestiona suscripciones push |
| `/api/admin/push/notify` | POST | Webhook interno para enviar notificaciones |
| `/api/admin/users` | POST | Crea usuario delivery |
| `/api/admin/users/[id]` | PATCH | Activa/desactiva usuario delivery |

---

## Migraciones

| Archivo | Descripción |
|---|---|
| `20260404140349_initial_schema.sql` | Schema base: productos, pedidos, perfiles, RLS |
| `20260404205919_add_product_variants.sql` | Variantes de productos, `restaurant_info` |
| `20260404205923_seed_menu.sql` | Seed inicial del menú |
| `20260404210427_seed_menu_back.sql` | Seed corrección menú |
| `20260404212641_add_location_to_orders.sql` | Campo de URL de ubicación en pedidos |
| `20260404214259_fn_create_order.sql` | Función `create_order` (RPC) |
| `20260404220257_fix_handle_new_user_trigger.sql` | Fix trigger de creación de perfil |
| `20260404220812_fix_trigger_search_path.sql` | Fix search_path en trigger |
| `20260404223001_delivery_self_assign.sql` | Política de auto-asignación delivery |
| `20260405000000_add_culqi_payment_method.sql` | Agrega `culqi` al enum `payment_method` |
| `20260409000000_product_images_storage.sql` | Bucket `product-images` + RLS de storage |
| `20260411000000_slider_slides.sql` | Tabla `slider_slides` + bucket `slider-images` + seed |
| `20260411000001_slider_mobile_image.sql` | Columna `image_url_mobile` en slider |
| `20260412000000_enable_orders_realtime.sql` | Habilita Realtime en `orders` (`REPLICA IDENTITY FULL`) |
| `20260412000001_categories_is_active.sql` | Columna `is_active` en categorías |
| `20260412000002_push_subscriptions.sql` | Tabla `push_subscriptions` |
| `20260412000003_push_notify_webhook.sql` | Webhook push con `pg_net` |
| `20260412000004_push_webhook_with_secret.sql` | Auth con webhook secret |
| `20260412000005_fix_push_webhook_safe.sql` | Fix handler seguro de push |
| `20260511000000_nubefact_invoices.sql` | Tablas `invoice_series` e `invoices`, columnas fiscales en `orders` |
| `20260511000001_product_option_groups.sql` | Tablas `product_option_groups` y `product_options` |
| `20260512000000_site_settings.sql` | Tabla `site_settings` (JSONB footer) + seed |

---

## Pendiente / Próximos pasos

### Funcionalidad
- [ ] **Notificaciones push al delivery** — actualmente solo notifica al admin
- [ ] **Información del restaurante** — UI para editar teléfonos, horarios, etc. (`restaurant_info`)
- [ ] **WhatsApp real en FAB** — reemplazar `51999999999` con el número real del negocio

### Pagos
- [ ] **Yape QR** — integración con la API de Yape
- [ ] **Webhook de Culqi** — validar estado del pago post-cobro

### Calidad
- [ ] **Tests** — cobertura de funciones de API y componentes críticos (checkout, carrito)
- [ ] **Error boundaries** — manejo de errores en el panel admin
- [ ] **Loading skeletons** — reemplazar spinners por skeletons en listas

### Infraestructura
- [ ] **CI/CD** — pipeline de deploy automático a Vercel
