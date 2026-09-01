"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

import { uploadProductImage } from "@/lib/api/products";
import type { FooterSettings, HomeSavingsSettings, HomeSavingsTile } from "@/lib/api/settings";
import { updateHomeSavingsSettings } from "@/lib/api/settings";

interface Props {
  initial: HomeSavingsSettings;
  currentFooter: FooterSettings;
}

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function getHomeSavingsImageUploadError(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return "Subí una imagen JPG, PNG o WebP.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "La imagen debe pesar como máximo 5 MB.";
  }

  return null;
}

function orderTiles(tiles: HomeSavingsTile[]) {
  return [...tiles].sort((first, second) => first.sortOrder - second.sortOrder);
}

export function AdminHomeSavingsPage({ initial, currentFooter }: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState<HomeSavingsSettings>(() => ({
    ...initial,
    tiles: orderTiles(initial.tiles),
  }));
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [localPreviews, setLocalPreviews] = useState<Record<number, string>>({});
  const fileInputs = useRef<Array<HTMLInputElement | null>>([]);

  function updateTile(index: number, field: keyof HomeSavingsTile, value: string | boolean) {
    setSettings((previous) => {
      const tiles = orderTiles(previous.tiles);
      tiles[index] = { ...tiles[index], [field]: value } as HomeSavingsTile;
      return { ...previous, tiles };
    });
  }

  function moveTile(index: number, direction: -1 | 1) {
    setSettings((previous) => {
      const tiles = orderTiles(previous.tiles);
      const target = index + direction;
      if (target < 0 || target >= tiles.length) return previous;

      [tiles[index], tiles[target]] = [tiles[target], tiles[index]];
      return {
        ...previous,
        tiles: tiles.map((tile, sortOrder) => ({ ...tile, sortOrder })),
      };
    });
  }

  async function handleImageUpload(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = getHomeSavingsImageUploadError(file);
    if (validationError) {
      toast.error(validationError);
      event.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setLocalPreviews((previous) => ({ ...previous, [index]: localPreview }));
    setUploadingIndex(index);

    try {
      // The product-images bucket is public and already enforces this MIME/size policy.
      // Do not delete the current image yet: this upload is persisted only when the admin saves.
      const publicUrl = await uploadProductImage(file);
      updateTile(index, "imageSrc", publicUrl);
      toast.success("Imagen subida. Guardá los cambios para publicarla.");
    } catch {
      toast.error("No se pudo subir la imagen.");
    } finally {
      URL.revokeObjectURL(localPreview);
      setLocalPreviews((previous) => {
        const { [index]: _preview, ...remaining } = previous;
        return remaining;
      });
      setUploadingIndex(null);
      event.target.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateHomeSavingsSettings(settings, currentFooter);
      toast.success("Sección de inicio actualizada");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar la sección de inicio.",
      );
    } finally {
      setSaving(false);
    }
  }

  const tiles = orderTiles(settings.tiles);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-on-surface text-2xl font-black tracking-tight">Inicio</h1>
        <p className="text-on-surface-variant mt-1 text-sm">
          Configurá la sección de categorías que aparece en la página principal.
        </p>
      </header>

      <section className="shadow-card space-y-4 rounded-3xl bg-white p-6">
        <h2 className="text-on-surface text-sm font-black tracking-widest uppercase">Encabezado</h2>
        <div className="space-y-1.5">
          <label
            htmlFor="home-savings-title"
            className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase"
          >
            Título de la sección
          </label>
          <input
            id="home-savings-title"
            type="text"
            value={settings.title}
            onChange={(event) =>
              setSettings((previous) => ({ ...previous, title: event.target.value }))
            }
            className="bg-surface-container-high text-on-surface focus:ring-primary/20 w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="home-savings-all-href"
            className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase"
          >
            URL de “Ver todos”
          </label>
          <input
            id="home-savings-all-href"
            type="text"
            value={settings.allHref}
            onChange={(event) =>
              setSettings((previous) => ({ ...previous, allHref: event.target.value }))
            }
            placeholder="/menu"
            className="bg-surface-container-high text-on-surface focus:ring-primary/20 w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-on-surface text-sm font-black tracking-widest uppercase">
            Categorías destacadas
          </h2>
          <p className="text-on-surface-variant mt-1 text-xs">
            Administrá las cuatro tarjetas, su orden y visibilidad. Usá rutas internas, por ejemplo
            {" “/menu?categoria=Parrillas”"}.
          </p>
        </div>

        {tiles.map((tile, index) => (
          <article key={tile.sortOrder} className="shadow-card space-y-4 rounded-3xl bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-on-surface text-base font-black">Tarjeta {index + 1}</h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveTile(index, -1)}
                  disabled={index === 0 || uploadingIndex !== null}
                  aria-label={`Mover ${tile.label} hacia arriba`}
                  className="text-on-surface-variant hover:bg-surface-container-high hover:text-primary flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    arrow_upward
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => moveTile(index, 1)}
                  disabled={index === tiles.length - 1 || uploadingIndex !== null}
                  aria-label={`Mover ${tile.label} hacia abajo`}
                  className="text-on-surface-variant hover:bg-surface-container-high hover:text-primary flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    arrow_downward
                  </span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor={`home-savings-label-${index}`}
                  className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase"
                >
                  Etiqueta
                </label>
                <input
                  id={`home-savings-label-${index}`}
                  type="text"
                  value={tile.label}
                  onChange={(event) => updateTile(index, "label", event.target.value)}
                  className="bg-surface-container-high text-on-surface focus:ring-primary/20 w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor={`home-savings-href-${index}`}
                  className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase"
                >
                  URL / categoría
                </label>
                <input
                  id={`home-savings-href-${index}`}
                  type="text"
                  value={tile.href}
                  onChange={(event) => updateTile(index, "href", event.target.value)}
                  placeholder="/menu?categoria=..."
                  className="bg-surface-container-high text-on-surface focus:ring-primary/20 w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={`home-savings-image-${index}`}
                className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase"
              >
                URL de imagen
              </label>
              <input
                id={`home-savings-image-${index}`}
                type="url"
                value={tile.imageSrc}
                onChange={(event) => updateTile(index, "imageSrc", event.target.value)}
                className="bg-surface-container-high text-on-surface focus:ring-primary/20 w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <input
                  ref={(element) => {
                    fileInputs.current[index] = element;
                  }}
                  id={`home-savings-file-${index}`}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  aria-label={`Subir imagen para ${tile.label}`}
                  className="hidden"
                  onChange={(event) => handleImageUpload(index, event)}
                />
                <button
                  type="button"
                  onClick={() => fileInputs.current[index]?.click()}
                  disabled={uploadingIndex === index}
                  className="border-primary text-primary hover:bg-primary inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition hover:text-white disabled:cursor-wait disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    {uploadingIndex === index ? "progress_activity" : "upload"}
                  </span>
                  {uploadingIndex === index ? "Subiendo..." : "Subir imagen"}
                </button>
                <p className="text-on-surface-variant text-xs">
                  JPG, PNG o WebP · Máx. 5 MB. También podés usar una URL.
                </p>
                {(localPreviews[index] ?? tile.imageSrc) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={localPreviews[index] ?? tile.imageSrc}
                    alt={`Vista previa de ${tile.label}`}
                    className="h-16 w-24 rounded-lg border border-black/10 bg-white object-contain p-1"
                  />
                )}
              </div>
            </div>

            <label className="text-on-surface flex cursor-pointer items-center gap-3 text-sm font-bold">
              <input
                type="checkbox"
                checked={tile.isActive}
                onChange={(event) => updateTile(index, "isActive", event.target.checked)}
                aria-label={`Mostrar ${tile.label} en el inicio`}
                className="border-outline-variant text-primary focus:ring-primary h-4 w-4 rounded"
              />
              Mostrar esta tarjeta en el inicio
            </label>
          </article>
        ))}
      </section>

      <div className="border-outline-variant/30 shadow-card sticky bottom-20 rounded-2xl border bg-white/90 p-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploadingIndex !== null}
          className="bg-primary text-on-primary shadow-primary/30 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            {saving ? "progress_activity" : "save"}
          </span>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
