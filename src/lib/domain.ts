// Domain detection for the Enviey SaaS platform.
// The app runs on enviey.app — all tenants live under /{slug}/*.
// In local development (localhost), we also use /{slug}/* routing.

export function isEnvieyDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  // On localhost, treat as Enviey platform for development
  return host === 'enviey.app' || host.endsWith('.enviey.app') || host === 'localhost' || host === '127.0.0.1';
}

// Extract the tenant slug from the current URL path.
// e.g. "/lojateste/feminino" -> "lojateste"
// Returns null if no slug is present (e.g. on "/" or "/admin/*").
export function getTenantSlugFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  // Reserved paths that are not tenant slugs
  const reserved = new Set(['admin', 'apresentacao']);
  if (reserved.has(segments[0])) return null;
  return segments[0];
}
