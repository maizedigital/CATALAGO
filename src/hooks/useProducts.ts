import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

const PUBLIC_PRODUCT_COLUMNS =
  'id, sku, name, slug, category, subcategory, gender, product_type, description, price, promo_price, images, sizes, colors, stock, featured, bestseller, new_arrival, on_sale, active, created_at';

const escapeFilter = (value: string) => value.replace(/[(),.:"\\*]/g, ' ').trim();

export function useProducts(catalogId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!catalogId) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error: queryError } = await supabase
        .from('products')
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq('active', true)
        .eq('catalog_id', catalogId)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (queryError) {
        console.error('Failed to load products', queryError);
        setError('Não foi possível carregar os produtos.');
        setProducts([]);
      } else {
        setProducts((data ?? []) as unknown as Product[]);
        setError(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [catalogId]);

  return { products, loading, error };
}

export function useProduct(slug: string | undefined, catalogId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!slug || !catalogId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error: queryError } = await supabase
        .from('products')
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq('slug', slug)
        .eq('catalog_id', catalogId)
        .maybeSingle();
      if (cancelled) return;
      if (queryError) {
        console.error('Failed to load product', queryError);
        setError('Não foi possível carregar este produto. Tente novamente.');
      } else {
        setProduct(data as unknown as Product | null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, catalogId]);

  return { product, loading, error };
}

export function useSearch(query: string, catalogId: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const search = useCallback(async (q: string, cid: string) => {
    setLoading(true);
    const term = escapeFilter(q);
    if (!term || !cid) {
      setResults([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('products')
      .select(PUBLIC_PRODUCT_COLUMNS)
      .eq('catalog_id', cid)
      .or(
        `name.ilike.%${term}%,sku.ilike.%${term}%,category.ilike.%${term}%,description.ilike.%${term}%`
      )
      .order('created_at', { ascending: false });
    setResults((data ?? []) as unknown as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (query.trim() && catalogId) search(query, catalogId);
    else {
      setResults([]);
      setLoading(false);
    }
  }, [query, catalogId, search]);

  return { results, loading };
}
