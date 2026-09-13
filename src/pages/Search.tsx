import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '@/components/ProductGrid';
import { useSearch } from '@/hooks/useProducts';
import { useSEO } from '@/hooks/useSEO';
import { siteConfig } from '@/config/site';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const storeName = siteConfig.name;
  const { results, loading } = useSearch(query, '37c86a47-b2c1-4563-8e30-a5fff68ef918');
  useSEO({ title: `Buscar: ${query} — ${storeName}`, description: `Resultados de busca para "${query}" na ${storeName}.` });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 border-b border-neutral-200 pb-6">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
          {query ? `Resultados para "${query}"` : 'Buscar produtos'}
        </h1>
        {!loading && query && (
          <p className="mt-2 text-sm text-neutral-500">
            {results.length} {results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-neutral-100" />
              <div className="mt-3 h-4 w-3/4 bg-neutral-100" />
              <div className="mt-2 h-4 w-1/3 bg-neutral-100" />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={results} />
      )}
    </div>
  );
}
