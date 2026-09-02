import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

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
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        // Fallback: se a coluna active não existir, busca sem filtro
        const { data: fallback } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (cancelled) return;
        setProducts((fallback ?? []) as Product[]);
        setError(null);
      } else setProducts((data ?? []) as Product[]);
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
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (cancelled) return;
      if (error) setError(error.message);
      else setProduct(data as Product | null);
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
    const { data } = await supabase.from('products').select('*').or(
      `name.ilike.%${q}%,sku.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%`
    ).order('created_at', { ascending: false });
    setResults((data ?? []) as Product[]);
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
