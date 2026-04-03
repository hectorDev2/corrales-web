export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: {
    src: string;
    alt: string;
  };
  tag?: string;
  category: string;
}
