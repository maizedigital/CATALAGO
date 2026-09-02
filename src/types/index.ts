export type Gender = 'feminino' | 'masculino';

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  gender: Gender;
  description: string | null;
  price: number;
  promo_price: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  bestseller: boolean;
  new_arrival: boolean;
  on_sale: boolean;
  cost?: number | null;
  supplier?: string | null;
  barcode?: string | null;
  ncm?: string | null;
  weight?: number | null;
  dimensions?: Record<string, number> | null;
  subcategory?: string | null;
  stock_minimum?: number;
  active?: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  promo_price: number | null;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export type SortOption = 'recentes' | 'menor-preco' | 'maior-preco' | 'mais-vendidos';
