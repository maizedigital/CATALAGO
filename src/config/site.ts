// MB Moda Brasil — site configuration (single catalog, not SaaS)

export const siteConfig = {
  name: 'MB Moda Brasil',
  shortName: 'MB',
  tagline: 'Vista-se com estilo',
  domain: 'mbmodabrasil.com.br',
  whatsapp: '5573999929009',
  whatsappDisplay: '(73) 99992-9009',
  instagram: '@mbmodabrasil',
  instagramUrl: 'https://instagram.com/mbmodabrasil',
  address: 'BR-367, km 77 — Coroa Vermelha, Santa Cruz Cabrália — BA, 45810-000',
  hoursStore: 'Segunda a sábado: 08:30 às 18:30',
  hoursSite: 'Disponível 24 horas por dia, 7 dias por semana',
};

// Secret admin route — not a security mechanism, just less predictable.
// Real protection is authentication.
export const ADMIN_BASE = '/painel-mb-7X4K9';

export const whatsappLink = (phone: string, message: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
