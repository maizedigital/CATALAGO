import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

// Public catalogue columns only. Cost, supplier and other internal fields are
// never sent to the storefront.
const PUBLIC_PRODUCT_COLUMNS =
  'id, sku, name, slug, category, subcategory, gender, product_type, description, price, promo_price, images, sizes, colors, stock, featured, bestseller, new_arrival, on_sale, active, created_at';

// PostgREST parses `or` filters from a string, so user input must not be able to
// introduce extra filter terms.
const escapeFilter = (value: string) => value.replace(/[(),.:"\\*]/g, ' ').trim();

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        // Fallback: se a coluna active não existir, busca sem filtro
        const { data: fallback } = await supabase
          .from('products')
          .select(PUBLIC_PRODUCT_COLUMNS)
          .order('created_at', { ascending: false });
        if (cancelled) return;
        setProducts((fallback ?? []) as unknown as Product[]);
        setError(null);
      } else setProducts((data ?? []) as unknown as Product[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq('slug', slug)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error('Falha ao carregar o produto', error);
        setError('Nao foi possivel carregar este produto. Tente novamente.');
      } else setProduct(data as unknown as Product | null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { product, loading, error };
}

export function useSearch(query: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    const term = escapeFilter(q);
    if (!term) {
      setResults([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('products').select(PUBLIC_PRODUCT_COLUMNS).or(
      `name.ilike.%${term}%,sku.ilike.%${term}%,category.ilike.%${term}%,description.ilike.%${term}%`
    ).order('created_at', { ascending: false });
    setResults((data ?? []) as unknown as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (query.trim()) search(query);
    else {
      setResults([]);
      setLoading(false);
    }
  }, [query, search]);

  return { results, loading };
}
