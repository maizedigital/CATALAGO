import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BannerCarousel } from '@/components/BannerCarousel';
import { ProductGrid } from '@/components/ProductGrid';
import { useReveal } from '@/hooks/useReveal';
import { useProducts } from '@/hooks/useProducts';
import { useSEO } from '@/hooks/useSEO';
import { siteConfig } from '@/config/site';
import type { Product } from '@/types';

export default function Home() {
  const { products, loading } = useProducts();
  useSEO({
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description:
      'Catálogo oficial MB. Moda feminina e masculina com estilo, qualidade e atitude. Confira lançamentos, destaques e ofertas.',

  });

  const [searchParams] = useSearchParams();
  const section = searchParams.get('section');
  const novidadesScrollRef = useRef<HTMLDivElement | null>(null);
  const ofertasScrollRef = useRef<HTMLDivElement | null>(null);

  const { ref: featuredRef, inView: featuredInView } = useReveal<HTMLDivElement>();
  const { ref: novidadesReveal, inView: novidadesInView } = useReveal<HTMLDivElement>();
  const { ref: ofertasReveal, inView: ofertasInView } = useReveal<HTMLDivElement>();

  const setNovidadesRef = useCallback((el: HTMLDivElement | null) => {
    novidadesScrollRef.current = el;
    novidadesReveal.current = el;
  }, [novidadesReveal]);

  const setOfertasRef = useCallback((el: HTMLDivElement | null) => {
    ofertasScrollRef.current = el;
    ofertasReveal.current = el;
  }, [ofertasReveal]);

  useEffect(() => {
    if (!section) return;
    const target = section === 'novidades' ? novidadesScrollRef : section === 'ofertas' ? ofertasScrollRef : null;
    if (target?.current) {
      setTimeout(() => target.current!.scrollIntoView({ behavior: 'smooth' }), 200);
    }
  }, [section, loading]);

  const featured = products.filter((p) => p.featured).slice(0, 8);
  const novidades = products.filter((p) => p.new_arrival).slice(0, 8);
  const ofertas = products.filter((p) => p.on_sale || (p.promo_price !== null && p.promo_price < p.price)).slice(0, 8);

  return (
    <div>
      <BannerCarousel />

      {/* Destaques */}
      <section ref={featuredRef} className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
        <div className={`mb-10 text-center transition-all duration-700 ${featuredInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-primary-400">Selecionados</p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary-900 md:text-5xl">
            Destaques MB
          </h2>
        </div>
        {loading ? <SkeletonGrid /> : <ProductGrid products={featured} />}
      </section>

      {/* Novidades */}
      <section ref={setNovidadesRef} className="bg-primary-50 px-4 py-12 md:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className={`mb-10 text-center transition-all duration-700 ${novidadesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-primary-400">Recém-chegados</p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-primary-900 md:text-5xl">
              Novidades
            </h2>
          </div>
          {loading ? <SkeletonGrid /> : <ProductGrid products={novidades} />}
        </div>
      </section>

      {/* Ofertas */}
      <section ref={setOfertasRef} className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
        <div className={`mb-10 text-center transition-all duration-700 ${ofertasInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-primary-900">Preços especiais</p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary-900 md:text-5xl">
            Ofertas
          </h2>
        </div>
        {loading ? <SkeletonGrid /> : <ProductGrid products={ofertas as Product[]} />}
      </section>

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
