export interface ProductVariant {
  id: string;
  label: string | null;
  price: number;
  sort_order: number;
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
}
