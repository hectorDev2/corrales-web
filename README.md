# Pollería & Fastfood Corrales — Web App

Aplicación web para gestión de pedidos, menú digital, reservas y panel administrativo de **Pollería & Fastfood Corrales**.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Base de datos | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| UI | React 19 + Tailwind CSS v4 + Material Symbols |
| Estado global | Zustand + `persist` (carrito persistente en localStorage) |
| Carousel | Embla Carousel + Autoplay |
| Formularios | react-hook-form + Zod v4 |
| Pagos | Culqi (checkout.js) |
| Notificaciones | Sonner |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (public)/          # Menú, checkout, reservas, nosotros
│   ├── (admin)/admin/     # Panel de administración
│   │   ├── productos/     # CRUD de productos
│   │   ├── reservas/      # Gestión de reservas
│   │   └── slider/        # Gestión del slider del home
│   ├── (delivery)/        # Panel del repartidor
│   ├── login/             # Autenticación
│   └── api/payment/       # API route de cobro con Culqi
├── components/
│   ├── admin/             # AdminPage, AdminOrderCard, ProductForm, AdminSliderPage, etc.
│   ├── delivery/          # DeliveryPage
│   ├── home/              # HomeSlider
│   ├── products/          # ProductCard, ProductCardMini
│   ├── cart/              # CartDrawer, CartItemRow
│   ├── checkout/          # CheckoutForm, OrderSummary
│   └── layout/            # Header, FloatingActions, LocationBanner
├── hooks/
│   └── useGeolocation.ts  # Captura y persistencia de ubicación GPS
├── lib/
│   ├── api/
│   │   ├── products.ts    # CRUD productos + imágenes (Storage)
│   │   ├── admin.ts       # Pedidos activos, asignación, cambio de estado
│   │   ├── delivery.ts    # Pedidos disponibles y de entrega propios
│   │   ├── orders.ts      # Creación de pedidos (RPC)
│   │   ├── reservations.ts
│   │   └── slider.ts      # Slides del home + imágenes (Storage)
│   ├── supabase.ts        # Cliente browser (Zustand / Client Components)
│   └── supabase-server.ts # Cliente SSR (Server Components / middleware)
├── store/
│   └── cart.ts            # Carrito (Zustand + persist)
└── types/
    ├── product.ts
    ├── admin.ts
    ├── cart.ts
    └── database.types.ts  # Generado por Supabase CLI
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
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
CULQI_SECRET_KEY=<culqi-secret>
NEXT_PUBLIC_CULQI_PUBLIC_KEY=<culqi-public-key>
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
| Público | `/`, `/menu`, `/checkout`, `/reservas`, `/nosotros` | Navega el menú y hace pedidos |
| `admin` | `/admin/**` | Gestiona pedidos, productos, reservas y slider |
| `delivery` | `/delivery` | Ve pedidos listos y marca entregas |

- La autenticación es via Supabase Auth (email + password).
- Los roles se manejan con RLS usando la función `current_user_role()`.
- El middleware redirige a cada usuario a su panel según su rol, e impide acceso cruzado.
- En el header público, los usuarios `admin` ven un botón **Panel** directo al dashboard.

---

## Módulos implementados

### Slider del home (`/`)
- Carousel con Embla + autoplay (4 s)
- Dos tipos de slide: `image` (flyer de Canva) y `custom` (gradiente + texto)
- Soporte de imagen separada para mobile (`image_url_mobile`)
- Aspect ratio `1:1` en mobile, `25:6` en desktop
- Contenido administrable desde el panel admin

### Menú público (`/menu`)
- Productos agrupados por categoría con orden de prioridad (Pollo a la Brasa y Parrillas primero)
- Variantes por producto (ej: 1/4, 1/2, entero)
- Filtro por categoría
- Tarjeta completa clickeable para agregar al carrito

### Carrito
- Drawer lateral con items y resumen
- Persistencia en `localStorage` via Zustand `persist`
- FAB flotante con animación `cart-pop` al agregar items

### Checkout (`/checkout`)
- Formulario con validación (react-hook-form + Zod)
- Tipos de entrega: delivery o recojo en local
- Captura opcional de ubicación GPS con preview en Google Maps (sin API key)
- Pago via Culqi con mensajes de error accionables para llave inválida/ausente
- Botón **Simular compra** para demostrar el flujo sin pasar por Culqi

### Reservas (`/reservas`)
- Formulario con validación
- Persistencia en Supabase

### Panel Admin (`/admin`)
- Pedidos activos en tiempo real (Supabase Realtime via `postgres_changes`)
- Flujo de estados: `pendiente → preparando → listo / en_camino → entregado`
- Asignación de repartidor durante la etapa `preparando`
- Cancelación de pedidos
- Stats del día (BentoStats)

### CRUD de Productos (`/admin/productos`)
- Listado de todos los productos (activos e inactivos)
- Crear y editar producto con variantes dinámicas
- Activar / desactivar (soft delete)
- Subida de imagen a Supabase Storage (`product-images`) con preview instantáneo

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

---

## Storage

| Bucket | Uso | Acceso |
|---|---|---|
| `product-images` | Imágenes del catálogo de productos | Público (lectura), admin (escritura) |
| `slider-images` | Imágenes de slides del home | Público (lectura), admin (escritura) |

- Tamaño máximo: 5 MB por archivo
- Formatos: JPEG, PNG, WebP

---

## Migraciones

| Archivo | Descripción |
|---|---|
| `20260404140349_initial_schema.sql` | Schema base: productos, pedidos, perfiles, RLS |
| `20260404205919_add_product_variants.sql` | Variantes de productos, `restaurant_info` |
| `20260404205923_seed_menu.sql` | Seed inicial del menú |
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

---

## Pendiente / Próximos pasos

### Funcionalidad
- [ ] **CRUD de categorías** — actualmente se gestionan solo por migraciones/seed
- [ ] **Gestión de usuarios** — el admin debería poder crear y desactivar cuentas de delivery
- [ ] **Historial de pedidos** — vista de pedidos entregados/cancelados con filtros por fecha
- [ ] **Notificaciones push** — alertar al admin cuando llega un nuevo pedido (Web Push o FCM)
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
