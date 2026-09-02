export const formatPrice = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const discountPercent = (price: number, promo: number): number =>
  Math.round(((price - promo) / price) * 100);

export const effectivePrice = (price: number, promo: number | null): number =>
  promo !== null && promo < price ? promo : price;
