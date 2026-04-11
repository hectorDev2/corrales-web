"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  createSlide,
  deleteSlide,
  deleteSlideImage,
  reorderSlide,
  toggleSlide,
  updateSlide,
  uploadSlideImage,
  type SliderSlide,
  type SlideInput,
} from "@/lib/api/slider";

// ─── Opciones visuales ────────────────────────────────────────────────────────

const ICON_OPTIONS = [
  { value: "outdoor_grill",         label: "Parrilla" },
  { value: "restaurant",            label: "Restaurante" },
  { value: "delivery_dining",       label: "Delivery" },
  { value: "local_fire_department", label: "Fuego" },
  { value: "fastfood",              label: "Fast food" },
  { value: "lunch_dining",          label: "Pollo" },
  { value: "set_meal",              label: "Menú" },
  { value: "star",                  label: "Estrella" },
  { value: "celebration",           label: "Promo" },
  { value: "new_releases",          label: "Novedad" },
  { value: "percent",               label: "Descuento" },
  { value: "whatshot",              label: "Popular" },
] as const;

const GRADIENT_PRESETS = [
  { label: "Naranja fuego",  value: "from-[#1a0a00] via-[#3d1500] to-[#f25600]", preview: "linear-gradient(135deg,#1a0a00,#3d1500,#f25600)" },
  { label: "Verde campo",    value: "from-[#0a1a00] via-[#1a3a00] to-[#2d5a00]", preview: "linear-gradient(135deg,#0a1a00,#1a3a00,#2d5a00)" },
  { label: "Dorado",         value: "from-[#1a1000] via-[#3d2800] to-[#a06000]", preview: "linear-gradient(135deg,#1a1000,#3d2800,#a06000)" },
  { label: "Rojo intenso",   value: "from-[#1a0000] via-[#3d0000] to-[#9e2016]", preview: "linear-gradient(135deg,#1a0000,#3d0000,#9e2016)" },
  { label: "Azul noche",     value: "from-[#000a1a] via-[#00133d] to-[#0a2060]", preview: "linear-gradient(135deg,#000a1a,#00133d,#0a2060)" },
  { label: "Negro elegante", value: "from-[#000000] via-[#1a1a1a] to-[#333333]", preview: "linear-gradient(135deg,#000000,#1a1a1a,#333333)" },
] as const;

const CTA_LINKS = [
  { label: "Carta / Menú", value: "/menu" },
  { label: "Reservas",     value: "/reservas" },
  { label: "Inicio",       value: "/" },
  { label: "Nosotros",     value: "/nosotros" },
] as const;

// ─── Defaults ─────────────────────────────────────────────────────────────────

const BLANK_CUSTOM: SlideInput = {
  type: "custom",
  sort_order: 0,
  is_active: true,
  image_url: null,
  image_url_mobile: null,
  eyebrow: "",
  title: "",
  subtitle: "",
  cta_label: "Ver Carta",
  cta_href: "/menu",
  bg_gradient: GRADIENT_PRESETS[0].value,
  accent_color: "#f25600",
  icon: "outdoor_grill",
};

const BLANK_IMAGE: SlideInput = {
  type: "image",
  sort_order: 0,
  is_active: true,
  image_url: null,
  image_url_mobile: null,
  eyebrow: null,
  title: null,
  subtitle: null,
  cta_label: null,
  cta_href: null,
  bg_gradient: null,
  accent_color: null,
  icon: null,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface AdminSliderPageProps {
  initialSlides: SliderSlide[];
}

export function AdminSliderPage({ initialSlides }: AdminSliderPageProps) {
  const [slides, setSlides] = useState<SliderSlide[]>(initialSlides);
  const [editing, setEditing] = useState<SliderSlide | null>(null);
  const [creating, setCreating] = useState<SlideInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const createFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);
  const createMobileFileRef = useRef<HTMLInputElement>(null);

  async function move(slide: SliderSlide, dir: -1 | 1) {
    const newOrder = slide.sort_order + dir;
    await reorderSlide(slide.id, newOrder);
    setSlides((prev) =>
      prev
        .map((s) => {
          if (s.id === slide.id) return { ...s, sort_order: newOrder };
          if (s.sort_order === newOrder) return { ...s, sort_order: slide.sort_order };
          return s;
        })
        .sort((a, b) => a.sort_order - b.sort_order),
    );
  }

  async function handleToggle(slide: SliderSlide) {
    await toggleSlide(slide.id, !slide.is_active);
    setSlides((prev) =>
      prev.map((s) => (s.id === slide.id ? { ...s, is_active: !s.is_active } : s)),
    );
  }

  async function handleDelete(slide: SliderSlide) {
    if (!confirm("¿Eliminar este slide?")) return;
    if (slide.image_url) await deleteSlideImage(slide.image_url);
    await deleteSlide(slide.id);
    setSlides((prev) => prev.filter((s) => s.id !== slide.id));
    toast.success("Slide eliminado");
  }

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    mode: "edit" | "create",
    field: "image_url" | "image_url_mobile" = "image_url",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSlideImage(file);
      if (mode === "edit" && editing) setEditing({ ...editing, [field]: url });
      else if (mode === "create" && creating) setCreating({ ...creating, [field]: url });
    } catch {
      toast.error("Error al subir la imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      const { id, ...input } = editing;
      await updateSlide(id, input);
      setSlides((prev) => prev.map((s) => (s.id === id ? editing : s)));
      setEditing(null);
      toast.success("Slide actualizado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    if (!creating) return;
    if (creating.type === "image" && !creating.image_url) {
      toast.error("Subí una imagen primero");
      return;
    }
    setSaving(true);
    try {
      await createSlide({ ...creating, sort_order: slides.length + 1 });
      window.location.reload();
    } catch {
      toast.error("Error al crear el slide");
    } finally {
      setSaving(false);
    }
  }

  // ── Slide form ─────────────────────────────────────────────────────────────

  function SlideForm({
    data,
    onChange,
  }: {
    data: SliderSlide | SlideInput;
    onChange: (d: SliderSlide | SlideInput) => void;
  }) {
    const isImage = data.type === "image";
    const isEdit = "id" in data;

    return (
      <div className="space-y-5">

        {/* ── Tipo ── */}
        <div>
          <Label>Tipo de slide</Label>
          <div className="flex gap-2 mt-1">
            {(["custom", "image"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ ...data, type: t })}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-bold transition border-2 ${
                  data.type === t
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-transparent bg-surface-container-high text-on-surface-variant"
                }`}
              >
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: `'FILL' ${data.type === t ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
                >
                  {t === "custom" ? "text_fields" : "image"}
                </span>
                {t === "custom" ? "Texto y color" : "Imagen / Flyer"}
              </button>
            ))}
          </div>
        </div>

        {isImage ? (
          /* ── Imagen (flyer de Canva) ── */
          <div className="space-y-4">
            {/* Desktop */}
            <div>
              <Label>
                Imagen escritorio{" "}
                <Hint>banner horizontal, ej: 1200×400</Hint>
              </Label>
              <div className="mt-1">
                {data.image_url ? (
                  <div className="relative rounded-xl overflow-hidden aspect-[16/7]">
                    <Image src={data.image_url} alt="Desktop" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => onChange({ ...data, image_url: null })}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => (isEdit ? fileRef : createFileRef).current?.click()}
                    disabled={uploading}
                    className="w-full py-8 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant flex flex-col items-center gap-2 hover:border-primary hover:text-primary transition"
                  >
                    <span className="material-symbols-outlined text-4xl">upload_file</span>
                    <span className="text-sm font-bold">{uploading ? "Subiendo..." : "Subir imagen escritorio"}</span>
                    <span className="text-xs opacity-60">PNG, JPG, WEBP</span>
                  </button>
                )}
                <input
                  ref={isEdit ? fileRef : createFileRef}
                  type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleImageUpload(e, isEdit ? "edit" : "create", "image_url")}
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <Label>
                Imagen móvil{" "}
                <Hint>cuadrada o vertical, ej: 720×720</Hint>
              </Label>
              <div className="mt-1">
                {data.image_url_mobile ? (
                  <div className="relative rounded-xl overflow-hidden aspect-square max-w-[200px]">
                    <Image src={data.image_url_mobile} alt="Mobile" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => onChange({ ...data, image_url_mobile: null })}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => (isEdit ? mobileFileRef : createMobileFileRef).current?.click()}
                    disabled={uploading}
                    className="w-full py-8 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant flex flex-col items-center gap-2 hover:border-primary hover:text-primary transition"
                  >
                    <span className="material-symbols-outlined text-4xl">smartphone</span>
                    <span className="text-sm font-bold">{uploading ? "Subiendo..." : "Subir imagen móvil"}</span>
                    <span className="text-xs opacity-60">Opcional — si no subís, usa la de escritorio</span>
                  </button>
                )}
                <input
                  ref={isEdit ? mobileFileRef : createMobileFileRef}
                  type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleImageUpload(e, isEdit ? "edit" : "create", "image_url_mobile")}
                />
              </div>
            </div>
          </div>
        ) : (
          /* ── Custom: texto y color ── */
          <>
            {/* Etiqueta pequeña */}
            <div>
              <Label>Etiqueta pequeña arriba del título <Hint>ej: "Clásico de siempre"</Hint></Label>
              <input
                type="text"
                value={data.eyebrow ?? ""}
                onChange={(e) => onChange({ ...data, eyebrow: e.target.value })}
                placeholder="Clásico de siempre"
                className="mt-1 w-full rounded-xl bg-surface-container-high px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Título */}
            <div>
              <Label>Título principal <Hint>podés usar dos líneas</Hint></Label>
              <textarea
                value={data.title ?? ""}
                onChange={(e) => onChange({ ...data, title: e.target.value })}
                placeholder={"Pollo a la\nBrasa"}
                rows={2}
                className="mt-1 w-full rounded-xl bg-surface-container-high px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Descripción */}
            <div>
              <Label>Descripción <Hint>texto debajo del título</Hint></Label>
              <textarea
                value={data.subtitle ?? ""}
                onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
                placeholder="Texto descriptivo del slide"
                rows={2}
                className="mt-1 w-full rounded-xl bg-surface-container-high px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Botón CTA */}
            <div>
              <Label>Texto del botón</Label>
              <input
                type="text"
                value={data.cta_label ?? ""}
                onChange={(e) => onChange({ ...data, cta_label: e.target.value })}
                placeholder="Ver Carta"
                className="mt-1 w-full rounded-xl bg-surface-container-high px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Destino del botón */}
            <div>
              <Label>El botón lleva a…</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {CTA_LINKS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange({ ...data, cta_href: opt.value })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                      data.cta_href === opt.value
                        ? "bg-primary text-on-primary border-primary"
                        : "border-outline-variant text-on-surface-variant hover:border-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ícono */}
            <div>
              <Label>Ícono de la etiqueta</Label>
              <div className="mt-1 grid grid-cols-6 gap-2">
                {ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange({ ...data, icon: opt.value })}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-bold transition border-2 ${
                      data.icon === opt.value
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-transparent bg-surface-container-high text-on-surface-variant hover:border-outline-variant"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ fontVariationSettings: `'FILL' ${data.icon === opt.value ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
                    >
                      {opt.value}
                    </span>
                    <span className="leading-tight text-center">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color de fondo */}
            <div>
              <Label>Color de fondo</Label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onChange({ ...data, bg_gradient: preset.value })}
                    className={`relative h-14 rounded-xl overflow-hidden border-2 transition ${
                      data.bg_gradient === preset.value
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-transparent"
                    }`}
                    style={{ background: preset.preview }}
                  >
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold text-white/90 drop-shadow">
                      {preset.label}
                    </span>
                    {data.bg_gradient === preset.value && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>check</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Color del acento */}
            <div>
              <Label>Color del acento <Hint>botón, etiqueta e ícono</Hint></Label>
              <div className="mt-1 flex items-center gap-3 bg-surface-container-high rounded-xl px-4 py-3">
                <input
                  type="color"
                  value={data.accent_color ?? "#f25600"}
                  onChange={(e) => onChange({ ...data, accent_color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <div>
                  <p className="text-sm font-bold text-on-surface">{data.accent_color}</p>
                  <p className="text-xs text-on-surface-variant">Tocá para elegir el color</p>
                </div>
                <div className="ml-auto w-10 h-10 rounded-lg shadow-inner" style={{ background: data.accent_color ?? "#f25600" }} />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-lg mx-auto px-4 pb-32">
      <div className="py-6 flex items-center justify-between">
        <h1 className="text-xl font-black text-on-surface">Slider</h1>
        {!creating && (
          <button
            onClick={() => setCreating(BLANK_CUSTOM)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Nuevo slide
          </button>
        )}
      </div>

      {/* ── Create form ── */}
      {creating && (
        <div className="mb-6 bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-sm">
          <p className="text-sm font-bold text-primary mb-4">Nuevo slide</p>
          <SlideForm data={creating} onChange={(d) => setCreating(d as SlideInput)} />
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setCreating(null)}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-surface-container-high text-on-surface-variant"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary text-on-primary disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Crear slide"}
            </button>
          </div>
        </div>
      )}

      {/* ── Slide list ── */}
      <div className="space-y-3">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm transition-opacity ${!slide.is_active ? "opacity-50" : ""}`}
          >
            {/* Preview */}
            <div className="relative h-20 w-full">
              {slide.type === "image" && slide.image_url ? (
                <Image src={slide.image_url} alt="slide" fill className="object-cover" />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: GRADIENT_PRESETS.find((p) => p.value === slide.bg_gradient)?.preview
                      ?? "linear-gradient(135deg,#1a0a00,#3d1500,#f25600)",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center px-4 gap-3">
                <span className="text-white font-black text-lg">#{slide.sort_order}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">
                    {slide.title?.replace(/\n/g, " ") ?? "Sin título"}
                  </p>
                  <p className="text-white/70 text-[10px] uppercase tracking-wider">
                    {slide.type === "image" ? "Imagen" : "Texto y color"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 px-3 py-2">
              <button
                onClick={() => move(slide, -1)}
                disabled={idx === 0}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition"
                title="Subir"
              >
                <span className="material-symbols-outlined text-base">arrow_upward</span>
              </button>
              <button
                onClick={() => move(slide, 1)}
                disabled={idx === slides.length - 1}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition"
                title="Bajar"
              >
                <span className="material-symbols-outlined text-base">arrow_downward</span>
              </button>
              <div className="flex-1" />
              <button
                onClick={() => handleToggle(slide)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition"
                title={slide.is_active ? "Ocultar" : "Mostrar"}
              >
                <span className="material-symbols-outlined text-base">
                  {slide.is_active ? "visibility" : "visibility_off"}
                </span>
              </button>
              <button
                onClick={() => setEditing(editing?.id === slide.id ? null : slide)}
                className={`p-1.5 rounded-lg transition ${editing?.id === slide.id ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-high"}`}
                title="Editar"
              >
                <span className="material-symbols-outlined text-base">edit</span>
              </button>
              <button
                onClick={() => handleDelete(slide)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition"
                title="Eliminar"
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>

            {/* Inline edit form */}
            {editing?.id === slide.id && (
              <div className="border-t border-outline-variant/20 p-4">
                <SlideForm data={editing} onChange={(d) => setEditing(d as SliderSlide)} />
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => setEditing(null)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-surface-container-high text-on-surface-variant"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary text-on-primary disabled:opacity-60"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
      {children}
    </p>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-on-surface-variant/60">
      — {children}
    </span>
  );
}
