import { createContext, useContext, type ReactNode } from 'react';
import { MB_CATALOG_ID, MB_SLUG } from '@/lib/domain';
import { siteConfig } from '@/config/site';

export interface CatalogInfo {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
}

const MB_CATALOG: CatalogInfo = {
  id: MB_CATALOG_ID,
  name: siteConfig.name,
  slug: MB_SLUG,
  settings: {},
};

const CatalogContext = createContext<CatalogInfo | null>(MB_CATALOG);

export function CatalogProvider({ children }: { children: ReactNode }) {
  return <CatalogContext.Provider value={MB_CATALOG}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogInfo {
  return useContext(CatalogContext) ?? MB_CATALOG;
}
