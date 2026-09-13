import { useLocation } from 'react-router-dom';
import { getTenantSlugFromPath } from '@/lib/domain';

// Returns the path prefix for the current tenant catalog context.
// On enviey.app, catalog routes are under /{slug}.
// In local dev, same structure.
export function useCatalogPrefix(): string {
  const { pathname } = useLocation();
  const slug = getTenantSlugFromPath(pathname);
  return slug ? `/${slug}` : '';
}

// Prefixes a path with the current tenant slug if needed.
// Use this for internal links within a tenant's catalog.
export function catalogPath(path: string): string {
  if (typeof window === 'undefined') return path;
  const slug = getTenantSlugFromPath(window.location.pathname);
  const prefix = slug ? `/${slug}` : '';
  if (path.startsWith('/')) return `${prefix}${path}`;
  return `${prefix}/${path}`;
}
