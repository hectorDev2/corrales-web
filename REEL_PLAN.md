# Corrales Web — Developer Reel

Plan de grabación para un Reel de Instagram/TikTok de 25–35 segundos, en formato vertical 9:16. La idea es contar una historia visual de **código → comportamiento → resultado**, sin mostrar credenciales ni hacer operaciones reales de pago.

> **Alcance de este documento:** análisis del código existente y planificación. No se modifica la aplicación de producción, no se agregan rutas de grabación y no se cambian variables de entorno o configuración de deployment.

## Stack real

- **Next.js 16.2.2** con React 19.2.4 y App Router.
- **TypeScript** con `strict: true` y alias de imports `@/*` hacia `src/*`.
- **Tailwind CSS 4** mediante `@tailwindcss/postcss`, más `tw-animate-css`, `shadcn/tailwind.css` y estilos globales propios.
- **Supabase** mediante `@supabase/supabase-js` y `@supabase/ssr`.
- **Zustand** con persistencia en `localStorage` para el carrito.
- **React Hook Form + Zod** para formularios y validación.
- **Mapbox GL + Mapbox Geocoder** para dirección y ubicación en checkout.
- **Culqi** para el flujo de pago.
- **Nubefact** para emisión/envío de comprobantes desde el servidor.
- **Embla Carousel** y **Swiper** para carruseles.
- **Sonner** para notificaciones.
- **Vitest + Testing Library** para pruebas unitarias y de componentes.
- **Vercel** como plataforma de despliegue visible en el flujo informado.
- **Web Push** para notificaciones del área administrativa.

No corresponde mencionar Redux, Prisma, Framer Motion, tRPC ni una API REST propia como tecnologías del proyecto: no aparecen en `package.json` ni en la estructura analizada.

## Arquitectura relevante

### App Router y grupos de rutas

La aplicación usa `src/app/` con grupos de rutas:

- `src/app/(public)/`: home, menú, promociones, detalle de producto, checkout, reservas, institucional, empleos, ventas corporativas y reclamaciones.
- `src/app/(admin)/`: dashboard y gestión de contenido, productos, categorías, slider, footer, usuarios, reservas, facturación e historial.
- `src/app/(delivery)/`: operación de pedidos para delivery.
- `src/app/login/`: autenticación.
- `src/app/api/`: formularios públicos, pago, facturación, usuarios y Web Push.

El layout público (`src/app/(public)/layout.tsx`) compone una experiencia consistente con `AnnouncementBar`, `Header`, `SubHeader`, `CartDrawer`, contenido, `Footer`, `BottomNav`, `LocationModal` y `LocationBanner`.

### Datos y servidor

- `src/app/(public)/page.tsx` obtiene en servidor slides, productos y configuración de ahorro mediante `Promise.all`.
- `src/app/(public)/menu/page.tsx` decide la consulta según `q`, `categoria` o `tag` y entrega los datos a `MenuPage`.
- `src/lib/api/products.ts` consulta productos, categorías, variantes, precios, stock y opciones en Supabase.
- `src/lib/api/orders.ts` usa el RPC `create_order` para crear pedidos con datos de precios/opciones resueltos en servidor.
- `src/lib/api/reservations.ts` maneja reservas.
- `src/lib/api/settings.ts` y `src/lib/api/slider.ts` alimentan la home y el contenido administrable.

### Cliente e interacción

- `MenuPage` es un Client Component: maneja paginación, orden, vista vertical/horizontal y agregado al carrito.
- `src/store/cart.ts` mantiene el carrito con Zustand y `persist`, limita cantidades al stock y calcula subtotal, delivery y total.
- `CheckoutForm` mantiene el flujo de tres etapas: **Cliente → Entrega → Pago**.
- `ReservaForm` usa React Hook Form/Zod y genera el contacto de reserva por WhatsApp después de persistir la información.
- `src/proxy.ts` usa Supabase SSR para proteger `/admin`, `/delivery` y `/login` según sesión y rol.

### Diseño responsive

Los estilos están centralizados en `src/app/globals.css` con tokens Tailwind v4: rojo primario `#e4002b`, superficies, tipografía, espaciado, sombras, breakpoints y la animación `cart-pop`. Las clases responsive (`sm:`, `md:`, `lg:`, `xl:`) aparecen directamente en los componentes.

### Integraciones externas

- Supabase Database, Storage, Auth, RPC y Realtime.
- Mapbox para geocodificación/autocompletado.
- Culqi para pago.
- Nubefact para comprobantes.
- WhatsApp para la confirmación de reservas.
- Vercel/Supabase Storage para despliegue y recursos remotos.

## Componentes que aparecerán

| Archivo                                          | Componente/función                                       | Qué hace                                                                                         | Por qué mostrarlo                                                                     | Fragmento de código sugerido                                                           |
| ------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/app/(public)/layout.tsx`                    | `PublicLayout`                                           | Ensambla la navegación pública, carrito, contenido, footer, navegación móvil y ubicación.        | Permite explicar que una sola composición se reutiliza en todas las páginas públicas. | `AnnouncementBar`, `Header`, `SubHeader`, `CartDrawer`, `main`, `Footer`, `BottomNav`. |
| `src/app/(public)/page.tsx`                      | `Home`, `HomeContent`                                    | Carga slides, productos y configuración; renderiza hero, carruseles, categorías y banner de app. | Es una buena transición de carga de datos a página visual.                            | `Promise.all([getSlides(), getProducts(), getHomeSavingsSettings()])`.                 |
| `src/components/home/KfcHeroSlider.tsx`          | `KfcHeroSlider`                                          | Presenta el hero/slider principal con slides activos.                                            | Tiene impacto visual inmediato para el hook.                                          | `<KfcHeroSlider slides={visibleSlides} />`.                                            |
| `src/components/home/KfcProductCarousel.tsx`     | `KfcProductCarousel`                                     | Muestra carruseles de promociones y productos destacados.                                        | Da ritmo al reel y muestra una home comercial real.                                   | `products.slice(0, 8)` y `href="/menu"`.                                               |
| `src/app/(public)/menu/page.tsx`                 | `Page`                                                   | Interpreta búsqueda, categoría y tag, y obtiene los datos apropiados.                            | Visualiza que el filtro no es solo decorativo: cambia la consulta.                    | `getProductsByCategory(categoria.trim())` / `searchProducts(q.trim())`.                |
| `src/lib/api/products.ts`                        | `getProducts`, `searchProducts`, `getProductsByCategory` | Consulta productos activos, categorías, variantes, precio y stock en Supabase.                   | Es el mejor momento de “backend/data → UI”.                                           | `.from("products").select(...)`, `.eq("is_active", true)`.                             |
| `src/components/menu/MenuPage.tsx`               | `CategoryStrip`, `ProductCatalogCard`, `Pagination`      | Renderiza categorías, cards, ordenamiento, vistas y paginación.                                  | Tiene muchas interacciones visibles en pocos segundos.                                | `visibleProducts.map(...)`, `addToCart`, `changePage`.                                 |
| `src/store/cart.ts`                              | `useCartStore`, `addItem`, `updateQuantity`              | Persiste el carrito, evita superar stock y calcula totales.                                      | Permite una transición clara función → drawer funcionando.                            | `persist(..., { name: "corrales-cart" })` y `addItem(...)`.                            |
| `src/components/cart/CartDrawer.tsx`             | `CartDrawer`                                             | Abre el resumen del pedido, cantidades, eliminación y acceso al checkout.                        | Es una interacción fácil de entender sin audio.                                       | `openDrawer`, `removeItem`, `updateQuantity`, total.                                   |
| `src/components/checkout/CheckoutForm.tsx`       | `CHECKOUT_STEPS`, `goToNextStep`, `onSubmit`             | Divide el checkout en Cliente, Entrega y Pago; integra ubicación, orden, Culqi y demo.           | Es la funcionalidad de negocio más fuerte para el reel.                               | `[{ number: 1, label: "Cliente" }, ...]`; `trigger(fieldsByStep[activeStep])`.         |
| `src/components/checkout/MapboxAutocomplete.tsx` | `MapboxAutocomplete`                                     | Permite elegir dirección y coordenadas de entrega.                                               | Aporta una interacción técnica distinta al catálogo.                                  | `onCoordinates={(lat, lng) => setMapboxCoords(...)}`.                                  |
| `src/components/reservas/ReservaForm.tsx`        | `ReservaForm`                                            | Valida una reserva y contacta por WhatsApp.                                                      | Puede funcionar como corte alternativo si se quiere mostrar una segunda conversión.   | `createReservation(...)` y armado del mensaje de WhatsApp.                             |
| `src/proxy.ts`                                   | `proxy`                                                  | Protege rutas administrativas y delivery según sesión/rol.                                       | Sirve para una toma técnica opcional de arquitectura, no para la historia principal.  | `isAdminRoute`, `isDeliveryRoute`, `supabase.auth.getUser()`.                          |
| `src/app/globals.css`                            | tokens, `@theme`, `cart-pop`                             | Define color, tipografía, spacing, sombras y animaciones.                                        | Es la toma ideal para explicar identidad visual y responsive.                         | `--color-primary: #e4002b`, `@keyframes cart-pop`.                                     |

## Storyboard

### Escena 1 — Hook: el producto terminado

- **Duración:** 0–3 s.
- **Archivo a abrir:** navegador en `/` o la URL desplegada.
- **Código que debe verse:** ninguno al inicio; primero tiene que entrar el resultado final.
- **Acción:** mostrar hero, desplazarse apenas hasta un carrusel de productos y cortar antes de que el movimiento se vuelva lento.
- **Web después del código:** home completa, rojo/negro, hero y productos.
- **Texto:** `De código a pedidos online`.
- **Transición:** zoom rápido sobre el hero → corte a VS Code.

### Escena 2 — Estructura Next.js

- **Duración:** 3–7 s.
- **Archivo a abrir:** `src/app/(public)/page.tsx` y luego `src/app/(public)/layout.tsx`.
- **Código:** `Home`, `HomeContent`, `Suspense`, `Promise.all` y composición de `PublicLayout`.
- **Acción:** paneo corto por el árbol `src/app`, abrir la home y el layout; no recorrer todo el repositorio.
- **Web después del código:** hero de la home.
- **Texto:** `Next.js App Router + layouts reutilizables`.
- **Transición:** árbol de rutas → hero mediante match cut.

### Escena 3 — Layout y componentes visuales

- **Duración:** 7–11 s.
- **Archivo a abrir:** `src/app/(public)/layout.tsx`, luego `src/components/home/KfcHeroSlider.tsx`.
- **Código:** `Header`, `SubHeader`, `CartDrawer`, `Footer`, `BottomNav`; después `<KfcHeroSlider slides={visibleSlides} />`.
- **Acción:** resaltar con selección rápida cómo el layout envuelve el contenido y pasar al slider.
- **Web después del código:** scroll de hero a carrusel/banners.
- **Texto:** `Componentes que se reutilizan en toda la experiencia`.
- **Transición:** bloque JSX resaltado → header/hero funcionando.

### Escena 4 — Productos desde Supabase

- **Duración:** 11–16 s.
- **Archivo a abrir:** `src/lib/api/products.ts` y `src/app/(public)/menu/page.tsx`.
- **Código:** `getProducts`, `getProductsByCategory`, selección de `product_variants`, y la decisión por `categoria`, `tag` o `q`.
- **Acción:** mostrar `.from("products")`, `.select(...)`, `.eq("is_active", true)` y cortar.
- **Web después del código:** `/menu`, click en una categoría y aparición de las cards.
- **Texto:** `Productos, variantes, precio y stock desde Supabase`.
- **Transición:** query de Supabase → cards del catálogo.

### Escena 5 — Card y carrito

- **Duración:** 16–21 s.
- **Archivo a abrir:** `src/components/menu/MenuPage.tsx`, después `src/store/cart.ts`.
- **Código:** `ProductCatalogCard`, `addToCart`, `useCartStore`, `addItem`, `persist`.
- **Acción:** en navegador, click en `+` de un producto; abrir drawer; subir cantidad una vez.
- **Web después del código:** producto agregado, total y botón de checkout.
- **Texto:** `Una interacción real: producto → carrito persistente`.
- **Transición:** `addItem(product, variant)` → drawer abriéndose con animación.

### Escena 6 — Checkout en tres etapas

- **Duración:** 21–25 s.
- **Archivo a abrir:** `src/components/checkout/CheckoutForm.tsx`.
- **Código:** `CHECKOUT_STEPS`, `goToNextStep`, `fieldsByStep`, `trigger`.
- **Acción:** en `/checkout`, mostrar Cliente → completar lo mínimo de forma ficticia → Entrega → Pago. No enviar un pago real.
- **Web después del código:** stepper con las tres etapas y resumen del pedido.
- **Texto:** `Cliente → Entrega → Pago`.
- **Transición:** array de pasos → stepper navegable.

### Escena 7 — Responsive y cierre

- **Duración:** 25–30 s.
- **Archivo a abrir:** `src/app/globals.css` y una toma breve de `MenuPage.tsx` con clases `md:`, `lg:` o `xl:`.
- **Código:** tokens `--color-primary`, `--spacing-margin-desktop`, `grid-cols-2`, `md:grid-cols-3`, `xl:grid-cols-4`.
- **Acción:** cambiar viewport de desktop a móvil 9:16; terminar en la home o menú móvil.
- **Web después del código:** desktop → mobile, luego URL final.
- **Texto:** `Responsive by design` y finalmente `Corrales Web`.
- **Transición:** media query/clases Tailwind → wipe vertical desktop/mobile → logo/URL.

## Timeline 0–30 segundos

| Tiempo  | Imagen principal                     | Texto sobreimpreso                | Ritmo                                 |
| ------- | ------------------------------------ | --------------------------------- | ------------------------------------- |
| 0–3 s   | Home final: hero + primer carrusel   | `De código a pedidos online`      | Hook, cortes rápidos                  |
| 3–7 s   | Árbol App Router + `page.tsx`/layout | `Next.js App Router`              | Paneo horizontal                      |
| 7–11 s  | JSX del layout y hero                | `Componentes reutilizables`       | Match cut código → UI                 |
| 11–16 s | API de productos + menú              | `Supabase → catálogo`             | Scroll de código y click de categoría |
| 16–21 s | `addItem` + drawer                   | `Carrito persistente con Zustand` | Click, apertura y micro zoom          |
| 21–25 s | `CHECKOUT_STEPS` + checkout          | `Cliente → Entrega → Pago`        | Tres cortes al ritmo de la música     |
| 25–28 s | Clases Tailwind + desktop/mobile     | `Responsive by design`            | Wipe vertical                         |
| 28–30 s | Resultado final en `/`               | `Corrales Web`                    | Fade/brand lockup                     |

## Código que mostrar

Mostrar fragmentos cortos, con zoom suficiente para que se lean en 9:16. No conviene grabar archivos completos ni hacer scroll lento.

### Hook y home

```tsx
const [slides, products, homeSavings] = await Promise.all([
  getSlides(),
  getProducts(),
  getHomeSavingsSettings(),
]);

<KfcHeroSlider slides={visibleSlides} />
<KfcProductCarousel title="Promos Grupales 🔥" products={products.slice(0, 8)} href="/menu" />
```

### Layout público

```tsx
<AnnouncementBar />
<Header />
<SubHeader />
<CartDrawer />
<main>{children}</main>
<Footer />
<BottomNav />
```

### Consulta de productos

```ts
const { data, error } = await supabase
  .from("products")
  .select(`... product_variants ( id, label, price, stock, sort_order )`)
  .eq("is_active", true)
  .eq("categories.is_active", true);
```

### Card y carrito

```tsx
function addToCart() {
  if (variant) addItem(product, variant);
}
```

```ts
persist(
  (set, get) => ({
    items: [],
    addItem: (product, variant, selectedOptions = {}, qty = 1) => {
      /* ... */
    },
  }),
  { name: "corrales-cart" },
);
```

### Checkout

```ts
const CHECKOUT_STEPS = [
  { number: 1, label: "Cliente" },
  { number: 2, label: "Entrega" },
  { number: 3, label: "Pago" },
];
```

```ts
const isValid = await trigger(fieldsByStep[activeStep]);
if (!isValid) return;
setActiveStep(nextStep);
```

### Responsive

```tsx
className = "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4";
```

```css
--color-primary: #e4002b;
--spacing-margin-desktop: 48px;
```

## Acciones en navegador

1. Cargar `/` y dejar visible el hero durante menos de dos segundos.
2. Desplazarse hasta el primer carrusel de productos.
3. Abrir `/menu`.
4. Click en una categoría con productos, por ejemplo `Parrillas` o `Pollo a la Brasa`.
5. Mostrar una card en vista vertical y cambiar a vista horizontal si el tiempo lo permite.
6. Click en `+` de una card y abrir el carrito.
7. Entrar a `/checkout`.
8. Mostrar el stepper completo y avanzar visualmente de Cliente a Entrega y Pago con datos de demostración.
9. Cambiar el viewport a 390×844 o un preset móvil equivalente.
10. Terminar en la home o en el menú móvil.

No se debe ingresar una tarjeta real, ejecutar un cobro de Culqi, mostrar datos personales o dejar visible ninguna variable de entorno.

## Transiciones

| Código                          | Resultado                             | Transición                                 |
| ------------------------------- | ------------------------------------- | ------------------------------------------ |
| `PublicLayout`                  | Header, footer y navegación presentes | Desplazamiento del árbol al navegador      |
| `Promise.all` de la home        | Hero y carruseles cargados            | Match cut desde `getProducts()` a una card |
| `.from("products").select(...)` | Catálogo visible                      | Línea de código que se transforma en grid  |
| `ProductCatalogCard`            | Producto con precio y botón `+`       | Zoom desde el JSX al click                 |
| `addItem(product, variant)`     | Drawer con producto y total           | Corte al instante del agregado             |
| `CHECKOUT_STEPS`                | Stepper de tres etapas                | Tres cortes sincronizados                  |
| clases `md:`/`xl:`              | Desktop → mobile                      | Wipe vertical o cambio de viewport         |
| URL final                       | Producto terminado                    | Fade out con `Corrales Web`                |

## Textos en pantalla

Usar frases de 2–5 palabras, grandes y de alto contraste:

1. `De código a pedidos online`
2. `Next.js App Router`
3. `Componentes reutilizables`
4. `Supabase → catálogo`
5. `Zustand + carrito persistente`
6. `Cliente → Entrega → Pago`
7. `Responsive by design`
8. `Corrales Web`

Opcional al final: `corrales-web.vercel.app`.

## Secuencia exacta de grabación

Cada clip debe durar entre 1 y 4 segundos. Grabar por separado y editar después; no intentar hacer una toma continua.

### ESCENA 1 — Resultado final

1. Navegador en `/`.
2. Grabar 2 segundos del hero y 1 segundo de un carrusel.
3. Cortar antes de que aparezcan estados de carga o contenido inesperado.

### ESCENA 2 — Arquitectura

1. VS Code/Codex con el árbol `src/app` visible.
2. Abrir `src/app/(public)/page.tsx`.
3. Seleccionar `Suspense`, `HomeContent` y `Promise.all`.
4. Abrir `src/app/(public)/layout.tsx` durante 1–2 segundos.

### ESCENA 3 — Componentes visuales

1. Abrir `src/components/home/KfcHeroSlider.tsx`.
2. Mostrar una línea de render o la definición principal.
3. Cortar al navegador con hero/carrusel.

### ESCENA 4 — Datos y catálogo

1. Abrir `src/lib/api/products.ts` en `getProducts`.
2. Mostrar `products`, `product_variants`, `price` y `stock`.
3. Abrir `src/app/(public)/menu/page.tsx` y mostrar la elección por categoría.
4. Cambiar al navegador, abrir `/menu` y hacer click en una categoría.

### ESCENA 5 — Card y carrito

1. Abrir `src/components/menu/MenuPage.tsx` en `ProductCatalogCard`.
2. Mostrar `addToCart`.
3. Abrir `src/store/cart.ts` y mostrar `persist`/`addItem`.
4. Volver al navegador, click en `+`, abrir drawer y modificar cantidad.

### ESCENA 6 — Checkout

1. Abrir `src/components/checkout/CheckoutForm.tsx` en `CHECKOUT_STEPS`.
2. Mostrar `goToNextStep` y `trigger(fieldsByStep[activeStep])`.
3. Navegar a `/checkout`.
4. Capturar Cliente, Entrega y Pago en tres cortes de aproximadamente un segundo.

### ESCENA 7 — Responsive y final

1. Mostrar `globals.css` en `--color-primary` y un bloque responsive del menú.
2. Cambiar el viewport del navegador de desktop a 390×844.
3. Mostrar el menú/home en mobile.
4. Cerrar con la home final y la URL.

## Comandos

Ejecutar solo si hace falta preparar el entorno. Estos comandos no forman parte de una modificación de producción.

```bash
# Ubicarse en el proyecto
cd /Users/hector/Documents/projects/corrales-web

# Instalar dependencias respetando el lockfile
pnpm install --frozen-lockfile

# Ejecutar desarrollo local
pnpm dev
# URL: http://localhost:3000

# Alternativa explícita
pnpm run dev

# Verificar lint
pnpm run lint

# Ejecutar pruebas sin modo watch
pnpm run test:run

# Comprobar build — documentado, no ejecutado como parte de este análisis
pnpm run build

# Servir el build ya generado, si corresponde
pnpm start

# Revisar cambios locales sin tocar nada
git status --short
```

Para una grabación con datos reales se requieren las variables del README (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_MAPBOX_TOKEN`, Culqi, Nubefact y Web Push según el flujo). No mostrar `.env.local` en pantalla. `pnpm import:menu-images` existe, pero no es necesario para grabar y su modo `--apply` escribe datos/remotos: no usarlo para preparar el reel.

## Checklist de grabación

- [ ] Formato vertical 9:16; idealmente 1080×1920.
- [ ] Ocultar marcadores, tabs, favoritos y notificaciones del sistema.
- [ ] No mostrar `.env.local`, tokens, llaves privadas, sesiones, emails ni teléfonos reales.
- [ ] Usar zoom del editor de 125–150% para que el código sea legible.
- [ ] Preparar el navegador en la home antes de grabar.
- [ ] Limpiar el carrito o usar una ventana de incógnito antes de la toma.
- [ ] Tener una categoría del menú con productos disponibles.
- [ ] No ejecutar un pago real de Culqi.
- [ ] Completar checkout solo con datos ficticios o mostrar la navegación de etapas.
- [ ] Grabar clips separados de 1–4 segundos.
- [ ] Mantener el cursor fuera del centro del producto.
- [ ] Usar música con golpes claros para los cambios código → resultado.
- [ ] Revisar que no aparezcan skeletons, errores de red o modales de ubicación en la toma final.
- [ ] Confirmar la URL/local host que se mostrará antes de publicar.

## Caption sugerido

> De una idea a una experiencia de compra completa: catálogo, variantes, stock, carrito persistente, checkout en tres etapas y diseño responsive. Todo conectado con Next.js, Supabase y una interfaz pensada para pedir desde cualquier pantalla. 🍗🔥

## Tecnologías/hashtags que realmente correspondan al proyecto

Hashtags sugeridos:

`#NextJS #React #TypeScript #TailwindCSS #Supabase #Zustand #ReactHookForm #Zod #Mapbox #Culqi #Vercel #WebDevelopment #Frontend #DeveloperReel`

Usar `#Nubefact` solo si en el video se muestra realmente la parte de comprobantes. No usar hashtags que sugieran Redux, Prisma, Framer Motion o una tecnología que no esté en este repositorio.

## Modo reconstrucción: estrategia segura

La opción recomendada quedó implementada después de recibir autorización: una ruta exclusivamente local, aislada de los servicios y datos de producción. Las otras alternativas se conservan como referencia de sus tradeoffs.

### Opción recomendada: ruta local de desarrollo aislada

La implementación usa este grupo de ruta separado:

```text
src/app/(dev)/dev/reel/page.tsx
src/components/reel/ReelBuilder.tsx
src/components/reel/ReelBuilder.test.tsx
src/components/reel/index.ts
```

La página usaría estado local `stage` con siete estados:

```text
0 estructura vacía
1 navbar
2 hero
3 contenido
4 productos
5 interacciones
6 página completa
```

Para que sea segura, la ruta debería:

- usar datos estáticos de demostración;
- no consultar Supabase, Culqi, Mapbox ni APIs públicas;
- no reutilizar el layout público completo si eso acopla la demo al contenido real;
- no leer variables de entorno privadas;
- devolver `notFound()` fuera de desarrollo, o mantenerse en una rama local que nunca se despliegue;
- tener controles visibles de `Anterior`, `Siguiente` y `Reiniciar` para grabar los cortes.

**Ventaja:** mantiene la demo dentro del stack Next.js y permite mostrar la construcción por etapas.

**Riesgo:** aunque se oculte en producción, la ruta forma parte del código compilado; hay que revisar bien la protección y no desplegarla accidentalmente.

### Opción más aislada: página de grabación fuera de `src/app`

Crear una pequeña página estática o herramienta local separada, sin ruta Next pública, con componentes visuales duplicados mínimos.

**Ventaja:** riesgo prácticamente nulo para rutas, auth, Supabase y deployment.

**Costo:** la demo puede separarse visualmente del producto real y habría que mantener estilos o datos de muestra por separado.

### Opción de mayor fidelidad: reutilizar componentes de producción

Componer `Header`, `KfcHeroSlider`, `ProductCatalogCard` y `CartDrawer` dentro de una ruta de demo con estados controlados.

**Ventaja:** máxima fidelidad visual.

**Costo/riesgo:** la demo queda acoplada a stores, datos, imágenes y comportamiento de producción; no es la primera opción si la prioridad es no afectar la aplicación.

### Recomendación final

Para este repositorio se implementó la **ruta local aislada con componentes `reel/` y datos estáticos**, protegida fuera de desarrollo y sin imports de servicios. `ReelBuilder` incluye controles, navegación con flechas y siete estados progresivos. Si en el futuro la prioridad absoluta fuera eliminar incluso la ruta del árbol compilado, la alternativa sería mover la experiencia a una herramienta estática fuera de `src/app`.

## Riesgos y controles

1. **Disponibilidad del despliegue:** la URL informada es `https://corrales-web.vercel.app/`, pero durante esta revisión la herramienta de acceso no pudo abrirla; por eso el storyboard visual está fundamentado en el código y los assets reales del repositorio. Verificar manualmente la URL antes de grabar.
2. **Red y Supabase:** el catálogo, sliders y settings dependen de datos remotos y Storage; una caída o latencia puede producir una toma vacía o tardía.
3. **Integraciones de pago:** Culqi requiere configuración y no debe probarse con una tarjeta real durante una grabación.
4. **Ubicación:** Mapbox y geolocalización dependen de permisos del navegador; para el reel alcanza con mostrar la etapa Entrega sin capturar ubicación real.
5. **Datos vivos:** precios, stock, promociones e imágenes pueden cambiar; conviene preparar el producto/categoría antes de grabar.
6. **Autenticación:** `/admin` y `/delivery` están protegidos por Supabase SSR y roles; no hace falta mostrarlos en el reel principal.
7. **Secretos:** no grabar `.env.local`, llaves de Culqi/Nubefact, service role key, VAPID ni cookies de sesión.
8. **Cambios locales existentes:** el worktree ya tenía modificaciones no relacionadas en componentes de carrito, menú, productos y promociones; no deben mezclarse con la implementación del reel ni en un commit accidental.
9. **Build:** no se ejecutó `build`. La ruta llama `notFound()` cuando `NODE_ENV` no es `development`; antes de cualquier despliegue futuro corresponde verificar también ese comportamiento en producción.
