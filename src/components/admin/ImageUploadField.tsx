"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { deleteProductImage, uploadProductImage } from "@/lib/api/products";

interface Props {
  value: string;
  onChange: (url: string) => void;
  productName?: string;
}

export function ImageUploadField({ value, onChange, productName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local inmediato
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setUploading(true);
    try {
      // Eliminar imagen anterior del bucket si existe
      if (value) await deleteProductImage(value);

      const publicUrl = await uploadProductImage(file, productName);
      onChange(publicUrl);
      URL.revokeObjectURL(localUrl);
      setPreview(null);
    } catch {
      toast.error("No se pudo subir la imagen.");
      setPreview(null);
    } finally {
      setUploading(false);
      // Reset input para permitir subir el mismo archivo de nuevo
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const displayed = preview ?? value;

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-surface-container-high border-2 border-dashed border-outline-variant transition hover:border-primary active:scale-[0.99] disabled:opacity-60"
      >
        {displayed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayed}
            alt="Vista previa"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-on-surface-variant">
            <span
              className="material-symbols-outlined text-4xl"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
            >
              add_photo_alternate
            </span>
            <p className="text-xs font-bold">Subir imagen</p>
          </div>
        )}

        {/* Overlay cuando hay imagen */}
        {displayed && !uploading && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center opacity-0 hover:opacity-100">
            <span
              className="material-symbols-outlined text-white text-3xl"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
            >
              edit
            </span>
          </div>
        )}

        {/* Spinner de carga */}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white text-3xl animate-spin"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
            >
              progress_activity
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </button>
      <p className="text-[11px] text-on-surface-variant/60 mt-1.5 text-center leading-tight">
        Recomendado: 800×800px · Formato: JPG o WebP · Máx 5MB · Fondo claro · Cuadrado (1:1)
      </p>
    </>
  );
}