# Assets generados del menú

El contenido de esta carpeta fue generado con Codex Imagegen y se mantiene local hasta validar la carga en Supabase.

## Importación

El manifiesto `manifest.json` relaciona cada nombre de la base con su archivo local. Primero ejecutar:

```bash
pnpm import:menu-images
```

Ese comando hace auditoría local y **no modifica Supabase**. Para aplicar la carga, usar variables de entorno —nunca credenciales pegadas en el código— y confirmar explícitamente:

```bash
SUPABASE_URL="https://tu-proyecto.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="..." \
pnpm import:menu-images -- --apply
```

El importador actualiza `products.image_src`, las imágenes de `product_options` y los cuatro tiles de `site_settings`. También sube los seis archivos de slider a `slider-images`, pero no cambia las filas existentes porque los slides sembrados son de tipo `custom` y su render no consume `image_url`.

Los archivos son PNG de 800px y no incluyen logos, textos, marcas ni marcas de agua. Las imágenes de bebidas y alcohol son presentaciones genéricas; deben reemplazarse por fotografías autorizadas si se necesita representar una marca comercial concreta.
