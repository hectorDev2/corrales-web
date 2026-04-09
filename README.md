# Pollería & Fastfood Corrales — Web App

Aplicación web para gestión de pedidos, menú digital, reservas y panel administrativo de **Pollería & Fastfood Corrales**.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Base de datos | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| UI | React 19 + Tailwind CSS v4 + Material Symbols |
| Estado global | Zustand (carrito) |
| Formularios | react-hook-form + Zod v4 |
| Pagos | Culqi |
| Notificaciones | Sonner |
| PWA | next-pwa |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (public)/          # Menú, checkout, reservas, nosotros
│   ├── (admin)/admin/     # Panel de administración
│   │   └── productos/     # CRUD de productos
│   ├── (delivery)/        # Panel de delivery
│   ├── login/             # Autenticación
│   └── api/payment/       # Webhook de Culqi
├── components/
│   ├── admin/             # AdminPage, ProductForm, ImageUploadField, etc.
│   ├── products/          # ProductCard, ProductCardMini
│   ├── cart/              # CartDrawer, CartItemRow
│   ├── checkout/          # CheckoutForm, OrderSummary
│   └── layout/            # Header, BottomNav
├── lib/
│   ├── api/               # Funciones hacia Supabase
│   │   ├── products.ts    # CRUD productos + upload de imágenes
│   │   ├── admin.ts       # Órdenes, delivery, asignaciones
│   │   ├── orders.ts      # Creación de pedidos
│   │   └── reservations.ts
│   └── supabase.ts        # Cliente de Supabase
├── store/
│   └── cart.ts            # Estado del carrito (Zustand)
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

### Variables de entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
CULQI_SECRET_KEY=<culqi-secret>
```

### Instalación

```bash
npm install
```

### Base de datos

```bash
# Levantar Supabase local
supabase start

# Aplicar migraciones
supabase db push

# O reiniciar con seed
supabase db reset
```

### Desarrollo

```bash
npm run dev
```

---

## Roles y accesos

| Rol | Acceso |
|---|---|
| Público | Menú, carrito, checkout, reservas |
| `admin` | Panel de pedidos + CRUD de productos |
| `delivery` | Panel de delivery (pedidos asignados) |

La autenticación es via Supabase Auth. Los roles se manejan con RLS a nivel de base de datos usando la función `current_user_role()`.

---

## Módulos implementados

### Menú público (`/menu`)
- Listado de productos agrupados por categoría
- Variantes por producto (ej: 1/4, 1/2, entero)
- Filtro por categoría

### Carrito
- Drawer lateral con items
- Persistencia en memoria (Zustand)
- Badge con contador en el header

### Checkout (`/checkout`)
- Formulario de datos del cliente
- Tipos de entrega: delivery o recojo en local
- Pago via Culqi (tarjeta)

### Reservas (`/reservas`)
- Formulario de reserva con validación
- Persistencia en Supabase

### Panel Admin (`/admin`)
- Vista en tiempo real de pedidos activos (Supabase Realtime)
- Avance de estados: pendiente → preparando → listo → en camino → entregado
- Asignación de repartidor por pedido
- Cancelación de pedidos
- Stats del día (BentoStats)

### CRUD de Productos (`/admin/productos`)
- Listado de todos los productos (activos e inactivos)
- Crear producto con variantes dinámicas
- Editar producto y sus variantes
- Activar / desactivar producto (soft delete)
- Subida de imagen a Supabase Storage (`product-images`)
  - Preview local instantáneo antes de confirmar upload
  - Reemplazo automático: elimina la imagen anterior al subir una nueva
  - Nombre de archivo generado desde el nombre del producto (slug)

### Panel Delivery (`/delivery`)
- Vista de pedidos asignados al repartidor autenticado

---

## Storage

Bucket: `product-images`

- **Acceso:** público (las imágenes son visibles en el menú sin autenticación)
- **Tamaño máximo:** 5 MB por archivo
- **Formatos permitidos:** JPEG, PNG, WebP
- **RLS:** solo usuarios con rol `admin` pueden subir, editar o eliminar

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
| `20260404223001_delivery_self_assign.sql` | Política de auto-asignación delivery |
| `20260405000000_add_culqi_payment_method.sql` | Agrega `culqi` al enum `payment_method` |
| `20260409000000_product_images_storage.sql` | Bucket `product-images` + RLS de storage |

---

## Pendiente / Próximos pasos

### Funcionalidad
- [ ] **CRUD de categorías** — actualmente las categorías se gestionan solo por migraciones/seed
- [ ] **Gestión de usuarios** — el admin debería poder crear y desactivar cuentas de delivery
- [ ] **Historial de pedidos** — vista de pedidos entregados/cancelados con filtros por fecha
- [ ] **Notificaciones push** — alertar al admin cuando llega un nuevo pedido (Web Push o FCM)
- [ ] **Información del restaurante** — UI para editar teléfonos, horarios, etc. (tabla `restaurant_info`)
- [ ] **Eliminar imagen al eliminar producto** — si se elimina un producto, borrar su imagen del bucket

### Pagos
- [ ] **Yape QR** — integración con la API de Yape
- [ ] **Webhook de Culqi** — validar estado del pago post-redirect

### Calidad
- [ ] **Tests** — cobertura de funciones de API y componentes críticos (checkout, carrito)
- [ ] **Error boundaries** — manejo de errores en el panel admin
- [ ] **Loading skeletons** — reemplazar spinners por skeletons en listas

### Infraestructura
- [ ] **CI/CD** — pipeline de deploy automático
- [x] **Sincronizar tipos con el schema** — `payment_method` actualizado con `culqi` en `AdminOrder`
