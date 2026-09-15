import { useSEO } from '@/hooks/useSEO';
import { BannerCarousel } from '@/components/BannerCarousel';
import { ProductGrid } from '@/components/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { useCatalog } from '@/hooks/useCatalogContext';
import { siteConfig } from '@/config/site';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { catalogPath } from '@/hooks/useCatalogPath';
import { AlertCircle } from 'lucide-react';

const gradientBarStyle = {
  background: 'linear-gradient(90deg, #19e66b 0%, #ffffff 25%, #19e66b 50%, #ffffff 75%, #19e66b 100%)',
  backgroundSize: '200% 100%',
};

export default function Home() {
  const catalog = useCatalog();
  const { products, loading, error } = useProducts(catalog.id);
  const storeName = siteConfig.name;
  useSEO({
    title: storeName,
    description: `Catálogo de produtos da ${storeName}.`,
  });

  const ofertas = useMemo(
    () =>
      products
        .filter((p) => p.on_sale || (p.promo_price !== null && p.promo_price < p.price))
        .slice(0, 8),
    [products]
  );

  return (
    <div>
      <BannerCarousel />

      {/* Animated gradient bar below banner */}
      <div className="gradient-bar h-0.5 w-full" style={gradientBarStyle} />

      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <nav className="flex items-center justify-center gap-6 md:gap-10">
            <Link to={catalogPath('/feminino')} className="shrink-0 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors hover:text-neutral-900 md:text-sm">Feminino</Link>
            <Link to={catalogPath('/masculino')} className="shrink-0 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors hover:text-neutral-900 md:text-sm">Masculino</Link>
            <Link to={catalogPath('/categoria/geral')} className="shrink-0 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors hover:text-neutral-900 md:text-sm">Geral</Link>
            <Link to={catalogPath('/ofertas')} className="shrink-0 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors hover:text-neutral-900 md:text-sm">Promoção</Link>
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">MB MODA BRASIL</h2>
        </div>
        {loading ? <SkeletonGrid /> : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle size={32} className="text-neutral-300" />
            <p className="mt-3 text-sm text-neutral-500">{error}</p>
          </div>
        ) : <ProductGrid products={products} />}
      </section>

      {ofertas.length > 0 && (
        <section className="bg-neutral-50 px-4 py-12 md:px-6 md:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Promoção</h2>
            </div>
            {loading ? <SkeletonGrid /> : <ProductGrid products={ofertas} />}
          </div>
        </section>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] shimmer-bg animate-shimmer" />
          <div className="mt-3 h-4 w-3/4 shimmer-bg animate-shimmer" />
          <div className="mt-2 h-4 w-1/3 shimmer-bg animate-shimmer" />
        </div>
      ))}
    </div>
  );
}
