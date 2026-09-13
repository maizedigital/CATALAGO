// Generic site configuration for the Enviey SaaS platform.
// Tenant-specific config (name, whatsapp, instagram, etc.) is loaded
// from the catalog settings in the database, not hardcoded here.

export const envieyConfig = {
  name: 'Enviey',
  tagline: 'Sua loja online profissional',
  domain: 'enviey.app',
};

// Default whatsapp link builder — uses tenant settings when available.
// This is a fallback; components should use catalog settings from useCatalog().
export const whatsappLink = (phone: string, message: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
