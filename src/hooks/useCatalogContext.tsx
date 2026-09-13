import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface CatalogInfo {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
}

const CatalogContext = createContext<CatalogInfo | null>(null);

export function CatalogProvider({ catalog, children }: { catalog: CatalogInfo; children: ReactNode }) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogInfo | null {
  return useContext(CatalogContext);
}

export function useCatalogBySlug(slug: string | undefined) {
  const [catalog, setCatalog] = useState<CatalogInfo | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!slug) {
      setCatalog(null);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const { data, error: queryError } = await supabase
        .from('catalogs')
        .select('id, name, slug, settings')
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle();
      if (cancelled) return;
      if (queryError || !data) {
        setCatalog(null);
        setError('Esta loja não foi encontrada.');
      } else {
        setCatalog(data as CatalogInfo);
        setError(null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { catalog, loading, error };
}
