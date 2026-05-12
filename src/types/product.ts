export interface ProductVariant {
  id: string;
  label: string | null;
  price: number;
  sort_order: number;
}

export interface ProductOption {
  id: string;
  name: string;
  imageUrl: string | null;
  priceDelta: number;
  sortOrder: number;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  selectionType: "single" | "quantity";
  minSelect: number;
  maxSelect: number | null;
  isRequired: boolean;
  sortOrder: number;
  options: ProductOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  tag?: string | null;
  category: string;
  variants: ProductVariant[];
  optionGroups?: ProductOptionGroup[];
}
