import { useSEO } from '@/hooks/useSEO';
import { siteConfig } from '@/config/site';
import { BannerCarousel } from '@/components/BannerCarousel';
import { ProductGrid } from '@/components/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

const gradientBar = {
  background:
    'linear-gradient(to right, rgb(255,255,74), rgb(252,208,0), rgb(255,193,18), rgb(255,193,18), rgb(255,138,0), rgb(255,95,95), rgb(255,37,58), rgb(255,55,168), rgb(199,57,255), rgb(164,0,225), rgb(46,206,255), rgb(0,134,255), rgb(114,247,114), rgb(0,214,4))',
  backgroundSize: '200% 100%',
} as const;

export default function Home() {
  const { products, loading } = useProducts();
  useSEO({
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description:
      'Catálogo oficial MB. Moda feminina e masculina com estilo, qualidade e atitude. Confira lançamentos e ofertas.',
  });

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (!p.category) continue;
      const key = p.category.toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, p.category);
      }
    }
    return [...map.values()].sort();
  }, [products]);

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

      {/* 3px animated multicolor gradient bar */}
      <div className="gradient-bar h-[3px] w-full" style={gradientBar} />

      {/* Category navigation */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <Link
              to="/feminino"
              className="shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors hover:text-neutral-900"
            >
              Feminino
            </Link>
            <Link
              to="/masculino"
              className="shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors hover:text-neutral-900"
            >
              Masculino
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/categoria/${encodeURIComponent(cat.toLowerCase())}`}
                className="shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 transition-colors hover:text-neutral-900"
              >
                {cat}
              </Link>
            ))}
            <Link
              to="/ofertas"
              className="shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-900 underline underline-offset-4"
            >
              Ofertas
            </Link>
          </div>
        </div>
      </section>

      {/* All products grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Catálogo MB
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            {loading ? '' : `${products.length} produtos disponíveis`}
          </p>
        </div>
        {loading ? <SkeletonGrid /> : <ProductGrid products={products} />}
      </section>

      {/* Ofertas section */}
      {ofertas.length > 0 && (
        <section className="bg-neutral-50 px-4 py-12 md:px-6 md:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
                Ofertas
              </h2>
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
