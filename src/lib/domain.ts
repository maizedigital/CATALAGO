// Detects whether the app is being served from the Enviey SaaS domain or the
// MB catalog domain, so the root route can show the right page. In local
// development (localhost) we default to the MB catalog so the storefront
// continues to work as before.

export function isEnvieyDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'enviey.app' || host.endsWith('.enviey.app');
}

// Known tenant slugs. In the future this can be loaded from the database.
// For now MB is the only tenant and its catalog routes need to work both
// from mbmodabrasil.com.br (root paths) and enviey.app/mbmodabrasil/*.
export const MB_SLUG = 'mbmodabrasil';

// The MB catalog's UUID in the catalogs table. Used to associate leads,
// customers, and orders with the correct tenant.
export const MB_CATALOG_ID = '37c86a47-b2c1-4563-8e30-a5fff68ef918';

export function isCatalogSlug(pathSegment: string): boolean {
  return pathSegment === MB_SLUG;
}

// Given a pathname, extract the catalog slug prefix if present.
// Returns null if the path does not start with a known catalog slug.
export function extractCatalogSlug(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  if (isCatalogSlug(segments[0])) return segments[0];
  return null;
}

// Strip the catalog slug prefix from a pathname, returning the catalog-relative
// path. e.g. "/mbmodabrasil/feminino" -> "/feminino"
// If no slug prefix is present, returns the original pathname.
export function stripCatalogSlug(pathname: string): string {
  const slug = extractCatalogSlug(pathname);
  if (!slug) return pathname;
  const stripped = pathname.replace(`/${slug}`, '');
  return stripped === '' ? '/' : stripped;
}
