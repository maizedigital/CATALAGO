export type Gender = 'feminino' | 'masculino';
export type ProductType = 'roupas' | 'calcados';

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  gender: Gender;
  product_type?: ProductType;
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

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const CLOTHING_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG'];
export const FOOTWEAR_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44'];

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
