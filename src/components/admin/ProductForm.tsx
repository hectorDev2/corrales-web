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
import { OptionGroupsForm } from "./OptionGroupsForm";

// ─── Schema ───────────────────────────────────────────────────────────────────

const variantSchema = z.object({
  _id: z.string().optional(),
  label: z.string().max(60, "Máximo 60 caracteres"),
  price: z.number({ error: "Ingresa un precio" }).positive("El precio debe ser mayor a 0"),
  stock: z
    .number({ error: "Ingresa el stock" })
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo"),
});

const productSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(100),
  description: z.string().min(5, "Mínimo 5 caracteres").max(300),
  category_id: z.string().min(1, "Seleccioná una categoría"),
  tag: z.string().max(30).optional(),
  image_src: z.string().min(1, "Ingresá la imagen"),
  image_alt: z.string().min(2, "Ingresá el alt text"),
  is_active: z.boolean(),
  station: z.enum(["cocina", "horno", "barra"]),
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
      station: "cocina",
      variants: [{ label: "", price: 0, stock: 30 }],
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
        station: product.station,
        variants: product.variants
          .filter((v) => v.is_active)
          .map((v) => ({ _id: v.id, label: v.label ?? "", price: v.price, stock: v.stock })),
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
        station: "cocina",
        variants: [{ label: "", price: 0, stock: 30 }],
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
        .map((v, i) => ({ label: v.label, price: v.price, stock: v.stock, sort_order: i }));

      const updatedVariants = values.variants
        .filter((v) => !!v._id)
        .map((v, i) => ({
          id: v._id!,
          label: v.label,
          price: v.price,
          stock: v.stock,
          sort_order: i,
        }));

      const input: ProductInput = {
        name: values.name,
        description: values.description,
        image_src: values.image_src,
        image_alt: values.image_alt,
        tag: values.tag || null,
        is_active: values.is_active,
        station: values.station,
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="border-outline-variant/20 flex items-center justify-between border-b px-5 py-3 md:px-8">
        <div>
          <h3 className="text-on-surface text-lg font-black tracking-tight">
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </h3>
          {isEditing && product && (
            <p className="text-on-surface-variant text-xs">{product.name}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="bg-surface-container-high text-on-surface-variant flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 md:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-8">
          {/* Columna izquierda: datos e imagen */}
          <div className="space-y-5">
            <SectionTitle icon="info">Datos del producto</SectionTitle>
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

            {/* Imagen */}
            <div className="space-y-2">
              <label className="text-on-surface-variant text-xs font-bold">
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
                <p className="text-error text-xs">{errors.image_src.message}</p>
              )}
            </div>

            {/* Alt text */}
            <Field label="Descripción de la foto (para personas con baja visión)" error={errors.image_alt?.message}>
              <input
                {...register("image_alt")}
                placeholder="Ej: Pollo a la brasa entero con papas"
                className={inputClass(!!errors.image_alt)}
              />
            </Field>
          </div>

          {/* Columna derecha: clasificación, estado y variantes */}
          <div className="space-y-5">
            <SectionTitle icon="category">Clasificación</SectionTitle>
            {/* Categoría */}
            <Field label="Categoría" error={errors.category_id?.message}>
              <select {...register("category_id")} className={inputClass(!!errors.category_id)}>
                <option value="">Seleccioná una categoría...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            {/* Estación de producción */}
            <div>
              <label className="text-on-surface-variant text-xs font-bold">
                Se prepara en
              </label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {(
                  [
                    ["cocina", "Cocina", "skillet"],
                    ["horno", "Horno", "outdoor_grill"],
                    ["barra", "Barra", "local_bar"],
                  ] as const
                ).map(([value, text, icon]) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      value={value}
                      {...register("station")}
                      className="peer sr-only"
                    />
                    <span className="bg-surface-container-high text-on-surface-variant peer-checked:bg-primary peer-checked:text-on-primary peer-focus-visible:ring-primary/40 flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-bold transition peer-focus-visible:ring-2">
                      <span className="material-symbols-outlined text-xl">{icon}</span>
                      {text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tag */}
            <Field label="Etiqueta (opcional)" error={errors.tag?.message}>
              <input
                {...register("tag")}
                placeholder="Ej: Nuevo, Promo, Más pedido"
                className={inputClass(!!errors.tag)}
              />
            </Field>

            {/* Activo */}
            <div className="bg-surface-container-low flex items-center justify-between rounded-2xl p-4">
              <div>
                <p className="text-on-surface text-sm font-bold">Activo</p>
                <p className="text-on-surface-variant text-xs">Visible en el menú</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" {...register("is_active")} />
                <div className="bg-outline peer peer-checked:bg-primary after:bg-surface h-6 w-11 rounded-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:transition-all after:content-[''] peer-checked:after:translate-x-5" />
              </label>
            </div>

            {/* Variantes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <SectionTitle icon="sell">Variantes y precios</SectionTitle>
                <button
                  type="button"
                  onClick={() => append({ label: "", price: 0, stock: 30 })}
                  className="text-primary flex items-center gap-1 text-xs font-bold"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  Agregar
                </button>
              </div>

              {errors.variants?.root && (
                <p className="text-error text-xs">{errors.variants.root.message}</p>
              )}
              {typeof errors.variants?.message === "string" && (
                <p className="text-error text-xs">{errors.variants.message}</p>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="bg-surface-container-low space-y-2 rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-on-surface-variant text-xs font-bold">
                        Presentación
                      </label>
                      <input
                        {...register(`variants.${index}.label`)}
                        placeholder="Ej: 1/4, 1/2, Entero (vacío si es única)"
                        className={inputClass(!!errors.variants?.[index]?.label)}
                      />
                      {errors.variants?.[index]?.label && (
                        <p className="text-error mt-1 text-xs">
                          {errors.variants[index]!.label?.message}
                        </p>
                      )}
                    </div>
                    <div className="w-24">
                      <label className="text-on-surface-variant text-xs font-bold">
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
                        <p className="text-error mt-1 text-xs">
                          {errors.variants[index]!.price?.message}
                        </p>
                      )}
                    </div>
                    <div className="w-20">
                      <label className="text-on-surface-variant text-xs font-bold">
                        Cantidad disponible
                      </label>
                      <input
                        {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        className={inputClass(!!errors.variants?.[index]?.stock)}
                      />
                      {errors.variants?.[index]?.stock && (
                        <p className="text-error mt-1 text-xs">
                          {errors.variants[index]!.stock?.message}
                        </p>
                      )}
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="text-error hover:bg-error-container mt-4 flex h-8 w-8 items-center justify-center rounded-full transition active:scale-90"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Option groups (solo en edición) */}
        {product && (
          <div className="border-outline-variant/20 border-t pt-5">
            <OptionGroupsForm productId={product.id} onSaved={() => {}} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-outline-variant/20 border-t px-5 py-3 md:flex md:justify-end md:px-8">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-on-primary shadow-primary/25 w-full rounded-2xl py-3.5 text-sm font-bold tracking-wider uppercase shadow-lg transition active:scale-[0.98] disabled:opacity-50 md:w-auto md:px-10"
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
    "w-full mt-1 bg-surface-container-high rounded-xl px-3 py-3 text-base text-on-surface",
    "placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2",
    hasError ? "ring-2 ring-error/50 focus:ring-error/60" : "focus:ring-primary/25",
  ].join(" ");
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="text-on-surface flex items-center gap-2 text-xs font-black tracking-widest uppercase">
      <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
      {children}
    </p>
  );
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
      <label className="text-on-surface-variant text-xs font-bold">
        {label}
      </label>
      {children}
      {error && <p className="text-error mt-1 text-xs">{error}</p>}
    </div>
  );
}
