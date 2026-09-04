import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Truck, ShieldCheck, RefreshCw, CreditCard } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { BannerCarousel } from '@/components/BannerCarousel';
import { CategoryBanner } from '@/components/CategoryBanner';
import { ProductGrid } from '@/components/ProductGrid';
import { PromoBanner } from '@/components/PromoBanner';
import { useReveal } from '@/hooks/useReveal';
import { useProducts } from '@/hooks/useProducts';
import { useSEO } from '@/hooks/useSEO';
import { siteConfig } from '@/config/site';
import type { Product } from '@/types';

const femImg =
  'https://images.pexels.com/photos/31674938/pexels-photo-31674938.jpeg?auto=compress&cs=tinysrgb&h=800';
const mascImg =
  'https://images.pexels.com/photos/30688132/pexels-photo-30688132.jpeg?auto=compress&cs=tinysrgb&h=800';

const trustBadges = [
  { icon: Truck, title: 'Frete fixo R$ 25', desc: 'Toda a Bahia' },
  { icon: ShieldCheck, title: 'Compra segura', desc: 'Dados protegidos' },
  { icon: CreditCard, title: 'Pagamento', desc: 'PIX e cartão' },
  { icon: RefreshCw, title: 'Site 24h', desc: '7 dias por semana' },
];

const marqueeItems = [
  'FRETE FIXO DE R$ 25,00 PARA TODA A BAHIA',
  'MODA QUE COMBINA COM VOCÊ',
  'SITE 24 HORAS, 7 DIAS POR SEMANA',
  'PAGAMENTO VIA PIX E CARTÃO',
];

export default function Home() {
  const { products, loading } = useProducts();
  useSEO({
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description:
      'Catálogo oficial MB. Moda feminina e masculina com estilo, qualidade e atitude. Confira lançamentos, destaques e ofertas.',
    image: femImg,
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
      <Hero />

      {/* Marquee */}
      <div className="overflow-hidden border-y border-primary-900 bg-primary-950 py-3">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              {item} <span className="ml-12 text-neutral-500">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {trustBadges.map((badge, i) => (
            <div
              key={badge.title}
              className="flex items-center gap-3 animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <badge.icon size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary-900">{badge.title}</p>
                <p className="text-[11px] text-primary-500">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <CategoryBanner title="Feminino" subtitle="Coleção" image={femImg} to="/feminino" />
          <CategoryBanner title="Masculino" subtitle="Coleção" image={mascImg} to="/masculino" />
        </div>
      </section>

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
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-accent-600">Preços especiais</p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary-900 md:text-5xl">
            Ofertas
          </h2>
        </div>
        {loading ? <SkeletonGrid /> : <ProductGrid products={ofertas as Product[]} />}
      </section>

      <PromoBanner />
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
