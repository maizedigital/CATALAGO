import { isEnvieyDomain, MB_SLUG } from '@/lib/domain';

// Returns the path prefix for the current catalog context.
// On enviey.app, catalog routes are under /mb-moda-brasil.
// On mbmodabrasil.com.br or localhost, routes are at root (empty prefix).
export function useCatalogPrefix(): string {
  return isEnvieyDomain() ? `/${MB_SLUG}` : '';
}

// Prefixes a path with the catalog slug if needed.
// Use this for internal links within the MB catalog.
export function catalogPath(path: string): string {
  const prefix = isEnvieyDomain() ? `/${MB_SLUG}` : '';
  if (path.startsWith('/')) return `${prefix}${path}`;
  return `${prefix}/${path}`;
}
