import type { Product, ProductVariant } from "./product";

export interface SelectedOption {
  /** ID de la opción (ProductOption.id) */
  optionId: string;
  /** Cantidad seleccionada (para grupos tipo "quantity"; para "single" siempre es 1) */
  quantity: number;
}

/**
 * Mapa de selecciones por grupo.
 * Key = ProductOptionGroup.id
 * Value = array de opciones seleccionadas en ese grupo
 */
export type SelectedOptionsMap = Record<string, SelectedOption[]>;

export interface CartItem {
  /** Clave única: getCartItemKey(variant.id, selectedOptions) */
  key: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  /** Opciones seleccionadas agrupadas por optionGroup.id */
  selectedOptions: SelectedOptionsMap;
}

/**
 * Clave única para identificar un item en el carrito.
 * Dos items con diferente variante u opciones se consideran distintos.
 */
export function getCartItemKey(variantId: string, selectedOptions: SelectedOptionsMap): string {
  const optsKey = Object.keys(selectedOptions).sort().map((gk) => {
    const opts = selectedOptions[gk]
      .map((o) => `${o.optionId}:${o.quantity}`)
      .sort()
      .join(",");
    return `${gk}[${opts}]`;
  }).join("|");
  return optsKey ? `${variantId}__${optsKey}` : variantId;
}

/**
 * Calcula el precio extra total de las opciones seleccionadas.
 * Recorre todos los grupos de opciones del producto y suma priceDelta * quantity.
 */
export function calcOptionsTotal(
  product: Product,
  selectedOptions: SelectedOptionsMap,
): number {
  if (!product.optionGroups) return 0;
  let total = 0;
  for (const group of product.optionGroups) {
    const selected = selectedOptions[group.id];
    if (!selected) continue;
    for (const sel of selected) {
      const option = group.options.find((o) => o.id === sel.optionId);
      if (option) {
        total += option.priceDelta * sel.quantity;
      }
    }
  }
  return total;
}
