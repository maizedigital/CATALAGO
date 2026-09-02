// Centralized store configuration. Edit these values to update brand info across the site.
export const siteConfig = {
  name: 'MB',
  tagline: 'Moda que combina com você',
  whatsapp: '5573999929009',
  instagram: '@mbmodabrasil',
  instagramUrl: 'https://instagram.com/mbmodabrasil',
  address: 'BR-367, km 77 — Coroa Vermelha, Santa Cruz Cabrália — BA, 45810-000',
  hoursStore: 'Segunda a sábado: 08:30 às 18:30',
  hoursSite: 'Disponível 24 horas por dia, 7 dias por semana',
  freeShippingThreshold: 480,
  whatsappDisplay: '(73) 99992-9009',
};

export const whatsappLink = (message: string) =>
  `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
