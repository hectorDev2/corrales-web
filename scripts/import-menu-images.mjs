#!/usr/bin/env node

import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const PROJECT_ROOT = process.cwd();
const DEFAULT_SOURCE = path.join(PROJECT_ROOT, "assets/generated-menu");
const manifestPath = path.join(DEFAULT_SOURCE, "manifest.json");
const mimeTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function parseArgs(argv) {
  return {
    apply: argv.includes("--apply"),
    source: argv.find((arg) => arg.startsWith("--source="))?.slice(9) ?? DEFAULT_SOURCE,
  };
}

function entries(items) {
  return items.map(([key, file, mobile]) => ({ key, file, mobile }));
}

function storagePath(file) {
  return `menu/${file}`;
}

function fail(message) {
  throw new Error(message);
}

async function loadManifest(source) {
  const manifest = JSON.parse(await readFile(path.join(source, "manifest.json"), "utf8"));
  const groups = {
    products: entries(manifest.products),
    options: entries(manifest.options),
    home: entries(manifest.home),
    slider: entries(manifest.slider),
  };

  const files = [...groups.products, ...groups.options, ...groups.home, ...groups.slider];
  for (const item of files) {
    for (const file of [item.file, item.mobile]) {
      if (!file) continue;
      const absolute = path.join(source, file);
      try {
        await readFile(absolute);
      } catch {
        fail(`Falta el asset declarado en el manifiesto: ${absolute}`);
      }
      if (!mimeTypes[path.extname(file).toLowerCase()]) {
        fail(`Formato no permitido para ${file}. Usá PNG, JPG o WebP.`);
      }
    }
  }
  return groups;
}

async function getTargets(supabase, groups) {
  const [
    { data: products, error: productsError },
    { data: options, error: optionsError },
    { data: settings, error: settingsError },
  ] = await Promise.all([
    supabase.from("products").select("id,name"),
    supabase.from("product_options").select("id,name"),
    supabase.from("site_settings").select("id,footer").eq("id", 1).single(),
  ]);
  if (productsError) fail(`No se pudieron consultar products: ${productsError.message}`);
  if (optionsError) fail(`No se pudieron consultar product_options: ${optionsError.message}`);
  if (settingsError) fail(`No se pudo consultar site_settings: ${settingsError.message}`);

  const productMap = new Map(products.map((row) => [row.name, row]));
  const optionMap = new Map();
  for (const row of options) optionMap.set(row.name, [...(optionMap.get(row.name) ?? []), row]);
  for (const item of groups.products)
    if (!productMap.has(item.key)) fail(`Producto no encontrado: ${item.key}`);
  for (const item of groups.options)
    if (!optionMap.has(item.key)) fail(`Opción no encontrada: ${item.key}`);

  const footer = settings.footer ?? {};
  const homeTiles = footer.homeSavings?.tiles ?? [];
  for (const item of groups.home)
    if (!homeTiles.some((tile) => tile.label === item.key))
      fail(`Tile de home no encontrado: ${item.key}`);
  return { productMap, optionMap, settings, homeTiles };
}

async function upload(supabase, source, bucket, file) {
  const bytes = await readFile(path.join(source, file));
  const contentType = mimeTypes[path.extname(file).toLowerCase()];
  const target = storagePath(file);
  const { error } = await supabase.storage
    .from(bucket)
    .upload(target, bytes, { contentType, cacheControl: "3600", upsert: true });
  if (error) fail(`No se pudo subir ${file}: ${error.message}`);
  return supabase.storage.from(bucket).getPublicUrl(target).data.publicUrl;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const groups = await loadManifest(args.source);
  console.log(
    `Assets auditados: ${groups.products.length} productos, ${groups.options.length} opciones, ${groups.home.length} tiles y ${groups.slider.length} slides.`,
  );

  if (!args.apply) {
    console.log(
      "Dry-run: no se modificó Supabase. Ejecutá con --apply y las variables SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY para aplicar.",
    );
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    fail(
      "Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY; no se aceptan credenciales hardcodeadas.",
    );
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const targets = await getTargets(supabase, groups);
  const productUrls = new Map();
  const optionUrls = new Map();
  const homeUrls = new Map();

  for (const item of groups.products)
    productUrls.set(item.key, await upload(supabase, args.source, "product-images", item.file));
  for (const item of groups.options)
    optionUrls.set(item.key, await upload(supabase, args.source, "product-images", item.file));
  for (const item of groups.home)
    homeUrls.set(item.key, await upload(supabase, args.source, "product-images", item.file));
  for (const item of groups.slider) await upload(supabase, args.source, "slider-images", item.file);
  for (const item of groups.slider)
    if (item.mobile) await upload(supabase, args.source, "slider-images", item.mobile);

  for (const item of groups.products) {
    const { error } = await supabase
      .from("products")
      .update({ image_src: productUrls.get(item.key), image_alt: item.key })
      .eq("id", targets.productMap.get(item.key).id);
    if (error) fail(`No se pudo actualizar ${item.key}: ${error.message}`);
  }
  for (const item of groups.options) {
    const { error } = await supabase
      .from("product_options")
      .update({ image_url: optionUrls.get(item.key) })
      .in(
        "id",
        targets.optionMap.get(item.key).map((row) => row.id),
      );
    if (error) fail(`No se pudo actualizar la opción ${item.key}: ${error.message}`);
  }
  const nextTiles = targets.homeTiles.map((tile) => ({
    ...tile,
    imageSrc: homeUrls.get(tile.label) ?? tile.imageSrc,
  }));
  const { error: settingsError } = await supabase
    .from("site_settings")
    .update({
      footer: {
        ...targets.settings.footer,
        homeSavings: { ...targets.settings.footer.homeSavings, tiles: nextTiles },
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (settingsError) fail(`No se pudo actualizar Home Savings: ${settingsError.message}`);
  console.log(
    "Importación aplicada. Las imágenes de slider quedaron subidas; las filas existentes conservan su configuración de contenido.",
  );
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
