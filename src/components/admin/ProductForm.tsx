"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import {
  type AdminProduct,
  type CategoryOption,
  type ProductInput,
  createProduct,
  updateProduct,
} from "@/lib/api/products";

import { ImageUploadField } from "./ImageUploadField";

// ─── Schema ───────────────────────────────────────────────────────────────────

const variantSchema = z.object({
  _id: z.string().optional(),
  label: z.string().max(60, "Máximo 60 caracteres"),
  price: z.number({ error: "Ingresa un precio" }).positive("El precio debe ser mayor a 0"),
});

const productSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(100),
  description: z.string().min(5, "Mínimo 5 caracteres").max(300),
  category_id: z.string().min(1, "Seleccioná una categoría"),
  tag: z.string().max(30).optional(),
  image_src: z.string().min(1, "Ingresá la imagen"),
  image_alt: z.string().min(2, "Ingresá el alt text"),
  is_active: z.boolean(),
  variants: z.array(variantSchema).min(1, "Agregá al menos una variante"),
});

type ProductFormValues = z.infer<typeof productSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  product?: AdminProduct | null;
  categories: CategoryOption[];
  onSuccess: () => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductForm({ product, categories, onSuccess, onClose }: Props) {
  const isEditing = !!product;
  const [saving, setSaving] = useState(false);
  const deletedVariantIds = useRef<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      tag: "",
      image_src: "",
      image_alt: "",
      is_active: true,
      variants: [{ label: "", price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  useEffect(() => {
    deletedVariantIds.current = [];
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        tag: product.tag ?? "",
        image_src: product.image_src,
        image_alt: product.image_alt,
        is_active: product.is_active,
        variants: product.variants
          .filter((v) => v.is_active)
          .map((v) => ({ _id: v.id, label: v.label ?? "", price: v.price })),
      });
    } else {
      reset({
        name: "",
        description: "",
        category_id: "",
        tag: "",
        image_src: "",
        image_alt: "",
        is_active: true,
        variants: [{ label: "", price: 0 }],
      });
    }
  }, [product, reset]);

  function handleRemoveVariant(index: number) {
    const variant = fields[index];
    if (variant._id) {
      deletedVariantIds.current.push(variant._id);
    }
    remove(index);
  }

  async function onSubmit(values: ProductFormValues) {
    setSaving(true);
    try {
      const newVariants = values.variants
        .filter((v) => !v._id)
        .map((v, i) => ({ label: v.label, price: v.price, sort_order: i }));

      const updatedVariants = values.variants
        .filter((v) => !!v._id)
        .map((v, i) => ({ id: v._id!, label: v.label, price: v.price, sort_order: i }));

      const input: ProductInput = {
        name: values.name,
        description: values.description,
        image_src: values.image_src,
        image_alt: values.image_alt,
        tag: values.tag || null,
        is_active: values.is_active,
        category_id: values.category_id,
        newVariants,
        updatedVariants,
        deletedVariantIds: deletedVariantIds.current,
      };

      if (isEditing) {
        await updateProduct(product!.id, input);
      } else {
        await createProduct(input);
      }

      onSuccess();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-outline-variant/20">
        <h3 className="text-lg font-black tracking-tighter text-on-surface">
          {isEditing ? "Editar Producto" : "Nuevo Producto"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition active:scale-90"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Nombre */}
        <Field label="Nombre" error={errors.name?.message}>
          <input
            {...register("name")}
            placeholder="Ej: Pollo a la brasa"
            className={inputClass(!!errors.name)}
          />
        </Field>

        {/* Descripción */}
        <Field label="Descripción" error={errors.description?.message}>
          <textarea
            {...register("description")}
            rows={2}
            placeholder="Descripción breve del producto"
            className={inputClass(!!errors.description)}
          />
        </Field>

        {/* Categoría */}
        <Field label="Categoría" error={errors.category_id?.message}>
          <select
            {...register("category_id")}
            className={inputClass(!!errors.category_id)}
          >
            <option value="">Seleccioná una categoría...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Tag */}
        <Field label="Tag (opcional)" error={errors.tag?.message}>
          <input
            {...register("tag")}
            placeholder='Ej: Nuevo, Promo, Popular'
            className={inputClass(!!errors.tag)}
          />
        </Field>

        {/* Imagen */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Imagen
          </label>
          <Controller
            control={control}
            name="image_src"
            render={({ field }) => (
              <ImageUploadField
                value={field.value}
                onChange={field.onChange}
                productName={watch("name")}
              />
            )}
          />
          {errors.image_src && (
            <p className="text-[10px] text-error">{errors.image_src.message}</p>
          )}
        </div>

        {/* Alt text */}
        <Field label="Alt text (descripción de imagen)" error={errors.image_alt?.message}>
          <input
            {...register("image_alt")}
            placeholder="Ej: Pollo a la brasa entero con papas"
            className={inputClass(!!errors.image_alt)}
          />
        </Field>

        {/* Activo */}
        <div className="flex items-center justify-between bg-surface-container-low rounded-2xl p-4">
          <div>
            <p className="text-sm font-bold text-on-surface">Activo</p>
            <p className="text-xs text-on-surface-variant">Visible en el menú</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" {...register("is_active")} />
            <div className="w-11 h-6 bg-outline rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        {/* Variantes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-on-surface">Variantes</p>
            <button
              type="button"
              onClick={() => append({ label: "", price: 0 })}
              className="flex items-center gap-1 text-xs font-bold text-primary"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Agregar
            </button>
          </div>

          {errors.variants?.root && (
            <p className="text-xs text-error">{errors.variants.root.message}</p>
          )}
          {typeof errors.variants?.message === "string" && (
            <p className="text-xs text-error">{errors.variants.message}</p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="bg-surface-container-low rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Label (opcional)
                  </label>
                  <input
                    {...register(`variants.${index}.label`)}
                    placeholder='Ej: 1/4, 1/2, Entero'
                    className={inputClass(!!errors.variants?.[index]?.label)}
                  />
                  {errors.variants?.[index]?.label && (
                    <p className="text-[10px] text-error mt-1">
                      {errors.variants[index]!.label?.message}
                    </p>
                  )}
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Precio
                  </label>
                  <input
                    {...register(`variants.${index}.price`, { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={inputClass(!!errors.variants?.[index]?.price)}
                  />
                  {errors.variants?.[index]?.price && (
                    <p className="text-[10px] text-error mt-1">
                      {errors.variants[index]!.price?.message}
                    </p>
                  )}
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    className="mt-4 w-8 h-8 flex items-center justify-center rounded-full text-error hover:bg-error-container transition active:scale-90"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-outline-variant/20">
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold uppercase tracking-wider text-sm shadow-lg shadow-primary/25 transition active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputClass(hasError: boolean) {
  return [
    "w-full mt-1 bg-surface-container-high rounded-xl px-3 py-2.5 text-sm text-on-surface",
    "placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2",
    hasError ? "ring-2 ring-error/50 focus:ring-error/60" : "focus:ring-primary/25",
  ].join(" ");
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </label>
      {children}
      {error && <p className="text-[10px] text-error mt-1">{error}</p>}
    </div>
  );
}
