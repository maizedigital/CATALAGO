import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductFilter, type FilterState } from '@/components/ProductFilter';
import { useProducts } from '@/hooks/useProducts';
import { useSEO } from '@/hooks/useSEO';
import { siteConfig } from '@/config/site';
import { effectivePrice } from '@/lib/format';
import { catalogPath } from '@/hooks/useCatalogPath';
import type { Gender, Product } from '@/types';

const defaultFilters: FilterState = {
  categories: [],
  sizes: [],
  colors: [],
  priceMax: null,
  sort: 'recentes',
};

export default function Catalog({ gender, offersOnly }: { gender?: Gender; offersOnly?: boolean }) {
  const { category: urlCategory } = useParams<{ category: string }>();
  const catalogId = '37c86a47-b2c1-4563-8e30-a5fff68ef918';
  const storeName = siteConfig.name;
  const { products, loading } = useProducts(catalogId);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);

  const isFemale = gender === 'feminino';
  useSEO({
    title: offersOnly
      ? `Promoção — ${storeName}`
      : urlCategory && urlCategory.toLowerCase() === 'geral'
        ? `Geral — ${storeName}`
        : urlCategory
          ? `${decodeURIComponent(urlCategory)} — ${storeName}`
          : `${isFemale ? 'Feminino' : 'Masculino'} — ${storeName}`,
    description: offersOnly
      ? `Ofertas especiais da ${storeName}. Aproveite os melhores preços.`
      : `Catálogo ${isFemale ? 'feminino' : 'masculino'} da ${storeName}. Filtre por categoria, tamanho, cor e preço.`,
  });

  const baseProducts = useMemo(() => {
    let result = products;
    if (gender) {
      result = result.filter((p) => p.gender === gender);
    }
    if (offersOnly) {
      result = result.filter((p) => p.on_sale || (p.promo_price !== null && p.promo_price < p.price));
    }
    if (urlCategory && urlCategory.toLowerCase() !== 'geral') {
      const cat = decodeURIComponent(urlCategory).toLowerCase();
      result = result.filter((p) => p.category.toLowerCase() === cat);
    }
    return result;
  }, [products, gender, offersOnly, urlCategory]);

  const subCategories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of baseProducts) {
      if (!p.category) continue;
      const key = p.category.toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, p.category);
      }
    }
    return [...map.values()].sort();
  }, [baseProducts]);

  const categories = useMemo(
    () => [...new Set(baseProducts.map((p) => p.category))].sort(),
    [baseProducts]
  );
  const sizes = useMemo(
    () => [...new Set(baseProducts.flatMap((p) => p.sizes))].sort(),
    [baseProducts]
  );
  const colors = useMemo(
    () => [...new Set(baseProducts.flatMap((p) => p.colors))].sort(),
    [baseProducts]
  );
  const priceRange = useMemo<[number, number]>(() => {
    if (baseProducts.length === 0) return [0, 500];
    const prices = baseProducts.map((p) => effectivePrice(p.price, p.promo_price));
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [baseProducts]);

  const filtered = useMemo(() => {
    let result = [...baseProducts];
    if (filters.categories.length > 0)
      result = result.filter((p) => filters.categories.includes(p.category));
    if (filters.sizes.length > 0)
      result = result.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)));
    if (filters.colors.length > 0)
      result = result.filter((p) => p.colors.some((c) => filters.colors.includes(c)));
    if (filters.priceMax !== null)
      result = result.filter(
        (p) => effectivePrice(p.price, p.promo_price) <= (filters.priceMax ?? Infinity)
      );

    switch (filters.sort) {
      case 'menor-preco':
        result.sort((a, b) => effectivePrice(a.price, a.promo_price) - effectivePrice(b.price, b.promo_price));
        break;
      case 'maior-preco':
        result.sort((a, b) => effectivePrice(b.price, b.promo_price) - effectivePrice(a.price, a.promo_price));
        break;
      case 'mais-vendidos':
        result.sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result as Product[];
  }, [baseProducts, filters]);

  const activeFilterCount =
    filters.categories.length + filters.sizes.length + filters.colors.length +
    (filters.priceMax !== null ? 1 : 0) +
    (filters.sort !== 'recentes' ? 1 : 0);

  return (
    <div>
      {/* Contextual subcategory navigation */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <nav className="flex items-center justify-center gap-4 overflow-x-auto scrollbar-hide md:gap-6">
            {/* Back to main departments */}
            <Link
              to={catalogPath('/')}
              className="shrink-0 text-xs font-bold uppercase tracking-wider text-neutral-400 transition-colors hover:text-neutral-900"
            >
              ←
            </Link>
            {subCategories.map((cat) => {
              const catSlug = encodeURIComponent(cat.toLowerCase());
              const isActive = urlCategory && decodeURIComponent(urlCategory).toLowerCase() === cat.toLowerCase();
              const linkTo = catalogPath(`/categoria/${catSlug}`);
              return (
                <Link
                  key={cat}
                  to={linkTo}
                  className={`shrink-0 text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive ? 'text-neutral-900 underline underline-offset-4' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      {/* Header */}
      <div className="mb-6 border-b border-neutral-200 pb-6 text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 uppercase md:text-4xl">
          {offersOnly ? 'Promoção' : urlCategory && urlCategory.toLowerCase() === 'geral' ? 'Geral' : urlCategory ? decodeURIComponent(urlCategory) : isFemale ? 'Feminino' : 'Masculino'}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {baseProducts.length} produtos
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setFilterOpen(true)}
          className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:border-neutral-900"
        >
          <SlidersHorizontal size={14} /> Filtrar
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1.5 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
        <p className="text-xs text-neutral-400">{filtered.length} resultados</p>
      </div>

      {/* Products — full width */}
      {loading ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-neutral-100" />
              <div className="mt-3 h-4 w-3/4 bg-neutral-100" />
              <div className="mt-2 h-4 w-1/3 bg-neutral-100" />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={filtered} />
      )}

      {/* Filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Filtros</h2>
              <button onClick={() => setFilterOpen(false)} aria-label="Fechar">
                <X size={22} className="text-neutral-900" />
              </button>
            </div>
            <ProductFilter
              categories={categories}
              sizes={sizes}
              colors={colors}
              priceRange={priceRange}
              filters={filters}
              onChange={setFilters}
            />
            <button
              onClick={() => setFilterOpen(false)}
              className="mt-8 w-full bg-neutral-900 py-3 text-xs font-bold uppercase tracking-widest text-white"
            >
              Ver {filtered.length} resultados
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
