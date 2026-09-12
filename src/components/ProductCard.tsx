import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, effectivePrice } from '@/lib/format';
import { useCart } from '@/hooks/useCart';
import { catalogPath } from '@/hooks/useCatalogPath';

export function ProductCard({ product }: { product: Product }) {
  const price = product.price;
  const promo = product.promo_price;
  const hasDiscount = promo !== null && promo < price;
  const final = effectivePrice(price, promo);
  const { addItem } = useCart();

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.sizes[0] || 'M', product.colors[0] || 'Único', 1);
  };

  return (
    <Link to={catalogPath(`/produto/${product.slug}`)} className="group block overflow-hidden rounded-lg border border-neutral-200 transition-colors hover:border-neutral-400">
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        {/* OFERTAS badge — only when product is on sale */}
        {hasDiscount && (
          <span className="absolute left-2 top-2 z-10 bg-black px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
            Ofertas
          </span>
        )}
        {/* Primary image */}
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Second image on hover */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* Quick actions bar (slides up on hover) */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-400 ease-out group-hover:translate-y-0">
          <div className="flex items-center justify-center gap-2 bg-white/95 p-3 backdrop-blur-md">
            <button
              onClick={quickAdd}
              className="flex flex-1 items-center justify-center gap-1.5 bg-primary-950 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary-800"
            >
              <ShoppingBag size={14} /> Adicionar
            </button>
            <span className="flex h-9 w-9 items-center justify-center bg-neutral-100 text-primary-700 transition-colors hover:bg-neutral-200">
              <Eye size={15} />
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 px-1 pb-1">
        <h3 className="text-[13px] font-semibold uppercase leading-snug tracking-wide text-neutral-900 transition-colors duration-300 group-hover:text-neutral-600">
          {product.name}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">{formatPrice(price)}</span>
          )}
          <span className="text-sm font-semibold text-neutral-900">{formatPrice(final)}</span>
        </div>
      </div>
    </Link>
  );
}
