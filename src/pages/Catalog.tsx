import { useMemo, useState } from 'react';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductFilter, type FilterState } from '@/components/ProductFilter';
import { useProducts } from '@/hooks/useProducts';
import { useSEO } from '@/hooks/useSEO';
import { effectivePrice } from '@/lib/format';
import type { Gender, Product } from '@/types';

const defaultFilters: FilterState = {
  categories: [],
  sizes: [],
  colors: [],
  priceMax: null,
  sort: 'recentes',
};

export default function Catalog({ gender }: { gender: Gender }) {
  const { products, loading } = useProducts();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const isFemale = gender === 'feminino';
  useSEO({
    title: `${isFemale ? 'Feminino' : 'Masculino'} — MB`,
    description: `Catálogo ${isFemale ? 'feminino' : 'masculino'} MB. ${isFemale ? 'Roupas femininas' : 'Roupas masculinas'} com estilo e qualidade. Filtre por categoria, tamanho, cor e preço.`,
  });

  const genderProducts = useMemo(
    () => products.filter((p) => p.gender === gender),
    [products, gender]
  );

  const categories = useMemo(
    () => [...new Set(genderProducts.map((p) => p.category))].sort(),
    [genderProducts]
  );
  const sizes = useMemo(
    () => [...new Set(genderProducts.flatMap((p) => p.sizes))].sort(),
    [genderProducts]
  );
  const colors = useMemo(
    () => [...new Set(genderProducts.flatMap((p) => p.colors))].sort(),
    [genderProducts]
  );
  const priceRange = useMemo<[number, number]>(() => {
    if (genderProducts.length === 0) return [0, 500];
    const prices = genderProducts.map((p) => effectivePrice(p.price, p.promo_price));
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [genderProducts]);

  const filtered = useMemo(() => {
    let result = [...genderProducts];
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
  }, [genderProducts, filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      {/* Header */}
      <div className="mb-8 border-b border-neutral-200 pb-6 text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
          {isFemale ? 'Feminino' : 'Masculino'}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {genderProducts.length} produtos
        </p>
      </div>

      <div className="flex gap-8">
        <ProductFilter
          categories={categories}
          sizes={sizes}
          colors={colors}
          priceRange={priceRange}
          filters={filters}
          onChange={setFilters}
        />
        <div className="flex-1">
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
        </div>
      </div>
    </div>
  );
}
