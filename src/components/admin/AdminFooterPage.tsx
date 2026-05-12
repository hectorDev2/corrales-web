"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { FooterSettings, SiteSettings } from "@/lib/api/settings";
import { updateFooterSettings } from "@/lib/api/settings";

interface Props {
  initial: SiteSettings;
}

function defaultSection() {
  return { title: "", links: [{ label: "", href: "" }] };
}

export function AdminFooterPage({ initial }: Props) {
  const router = useRouter();
  const [footer, setFooter] = useState<FooterSettings>(initial.footer);
  const [saving, setSaving] = useState(false);

  function updateSection(
    i: number,
    field: "title",
    value: string,
  ) {
    setFooter((prev) => {
      const sections = [...prev.sections];
      sections[i] = { ...sections[i], [field]: value };
      return { ...prev, sections };
    });
  }

  function updateLink(
    sectionIdx: number,
    linkIdx: number,
    field: "label" | "href",
    value: string,
  ) {
    setFooter((prev) => {
      const sections = [...prev.sections];
      const links = [...sections[sectionIdx].links];
      links[linkIdx] = { ...links[linkIdx], [field]: value };
      sections[sectionIdx] = { ...sections[sectionIdx], links };
      return { ...prev, sections };
    });
  }

  function addLink(sectionIdx: number) {
    setFooter((prev) => {
      const sections = [...prev.sections];
      sections[sectionIdx] = {
        ...sections[sectionIdx],
        links: [...sections[sectionIdx].links, { label: "", href: "" }],
      };
      return { ...prev, sections };
    });
  }

  function removeLink(sectionIdx: number, linkIdx: number) {
    setFooter((prev) => {
      const sections = [...prev.sections];
      sections[sectionIdx] = {
        ...sections[sectionIdx],
        links: sections[sectionIdx].links.filter((_, i) => i !== linkIdx),
      };
      return { ...prev, sections };
    });
  }

  function addSection() {
    setFooter((prev) => ({
      ...prev,
      sections: [...prev.sections, defaultSection()],
    }));
  }

  function removeSection(i: number) {
    setFooter((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== i),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateFooterSettings(footer);
      toast.success("Footer actualizado");
      router.refresh();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function Input({ value, onChange, placeholder }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  }) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container-high rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-black tracking-tight text-on-surface">
          Editar Footer
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Configurá la información que aparece en el pie de página.
        </p>
      </header>

      {/* General info */}
      <section className="bg-white p-6 rounded-3xl shadow-card space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-on-surface">
          Información General
        </h2>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
            Texto descriptivo
          </label>
          <textarea
            value={footer.aboutText}
            onChange={(e) =>
              setFooter((prev) => ({ ...prev, aboutText: e.target.value }))
            }
            rows={3}
            className="w-full bg-surface-container-high rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              WhatsApp
            </label>
            <Input
              value={footer.whatsapp}
              onChange={(v) => setFooter((p) => ({ ...p, whatsapp: v }))}
              placeholder="51999999999"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              Email
            </label>
            <Input
              value={footer.email}
              onChange={(v) => setFooter((p) => ({ ...p, email: v }))}
              placeholder="corrales@contacto.pe"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              Dirección
            </label>
            <Input
              value={footer.address}
              onChange={(v) => setFooter((p) => ({ ...p, address: v }))}
              placeholder="Av. La Marina 1234, Lima"
            />
          </div>
        </div>
      </section>

      {/* Social */}
      <section className="bg-white p-6 rounded-3xl shadow-card space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-on-surface">
          Redes Sociales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              Facebook URL
            </label>
            <Input
              value={footer.social.facebook}
              onChange={(v) =>
                setFooter((p) => ({
                  ...p,
                  social: { ...p.social, facebook: v },
                }))
              }
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              Instagram URL
            </label>
            <Input
              value={footer.social.instagram}
              onChange={(v) =>
                setFooter((p) => ({
                  ...p,
                  social: { ...p.social, instagram: v },
                }))
              }
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
              TikTok URL
            </label>
            <Input
              value={footer.social.tiktok}
              onChange={(v) =>
                setFooter((p) => ({
                  ...p,
                  social: { ...p.social, tiktok: v },
                }))
              }
              placeholder="https://tiktok.com/..."
            />
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-on-surface">
            Secciones de Links
          </h2>
          <button
            type="button"
            onClick={addSection}
            className="flex items-center gap-1.5 bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Agregar sección
          </button>
        </div>

        {footer.sections.map((section, si) => (
          <div key={si} className="bg-white p-6 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <Input
                value={section.title}
                onChange={(v) => updateSection(si, "title", v)}
                placeholder="Nombre de la sección"
              />
              <button
                type="button"
                onClick={() => removeSection(si)}
                className="ml-3 p-2 text-on-surface-variant hover:text-error transition-colors shrink-0"
                aria-label="Eliminar sección"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>

            <div className="space-y-2 pl-2 border-l-2 border-outline-variant">
              {section.links.map((link, li) => (
                <div key={li} className="flex items-center gap-2">
                  <Input
                    value={link.label}
                    onChange={(v) => updateLink(si, li, "label", v)}
                    placeholder="Texto del link"
                  />
                  <Input
                    value={link.href}
                    onChange={(v) => updateLink(si, li, "href", v)}
                    placeholder="/ruta"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(si, li)}
                    className="p-2 text-on-surface-variant hover:text-error transition-colors shrink-0"
                    aria-label="Eliminar link"
                  >
                    <span className="material-symbols-outlined text-lg">remove_circle</span>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addLink(si)}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
              >
                + Agregar link
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Save */}
      <div className="sticky bottom-20 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-card border border-outline-variant/30">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-on-primary font-black py-4 rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
              Guardando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">save</span>
              Guardar cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
}
