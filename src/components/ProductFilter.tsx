import { useState } from 'react';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import type { SortOption } from '@/types';

export interface FilterState {
  categories: string[];
  sizes: string[];
  colors: string[];
  priceMax: number | null;
  sort: SortOption;
}

interface ProductFilterProps {
  categories: string[];
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
  { value: 'mais-vendidos', label: 'Mais vendidos' },
];

export function ProductFilter({
  categories,
  sizes,
  colors,
  priceRange,
  filters,
  onChange,
}: ProductFilterProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleArray = (key: 'categories' | 'sizes' | 'colors', value: string) => {
    const arr = filters[key];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onChange({ ...filters, [key]: next });
  };

  const Panel = (
    <div className="space-y-8">
      {/* Sort */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-900">
          Ordenar por
        </h3>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortOption })}
          className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-900">
            Categoria
          </h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => toggleArray('categories', cat)}
                  className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
                >
                  <span className={`flex h-4 w-4 items-center justify-center border ${filters.categories.includes(cat) ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300'}`}>
                    {filters.categories.includes(cat) && <Check size={12} />}
                  </span>
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-900">
            Tamanho
          </h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleArray('sizes', size)}
                className={`min-w-9 border px-2 py-1.5 text-xs font-medium transition-colors ${
                  filters.sizes.includes(size)
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-900">
            Cor
          </h3>
          <ul className="space-y-2">
            {colors.map((color) => (
              <li key={color}>
                <button
                  onClick={() => toggleArray('colors', color)}
                  className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
                >
                  <span className={`flex h-4 w-4 items-center justify-center border ${filters.colors.includes(color) ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300'}`}>
                    {filters.colors.includes(color) && <Check size={12} />}
                  </span>
                  {color}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-900">
          Preço máximo
        </h3>
        <input
          type="range"
          min={priceRange[0]}
          max={priceRange[1]}
          step={10}
          value={filters.priceMax ?? priceRange[1]}
          onChange={(e) => onChange({ ...filters, priceMax: Number(e.target.value) })}
          className="w-full accent-neutral-900"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Até R$ {(filters.priceMax ?? priceRange[1]).toFixed(0).replace('.', ',')}0
        </p>
      </div>

      {(filters.categories.length > 0 || filters.sizes.length > 0 || filters.colors.length > 0 || filters.priceMax !== null) && (
        <button
          onClick={() => onChange({ categories: [], sizes: [], colors: [], priceMax: null, sort: filters.sort })}
          className="text-xs font-medium uppercase tracking-wider text-neutral-500 underline hover:text-neutral-900"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-60 shrink-0 md:block">
        <div className="sticky top-24">
          <div className="mb-6 flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-neutral-900" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Filtros</h2>
          </div>
          {Panel}
        </div>
      </aside>

      {/* Mobile trigger */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 border border-neutral-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-neutral-900"
        >
          <SlidersHorizontal size={14} /> Filtrar
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Filtros</h2>
              <button onClick={() => setMobileOpen(false)} aria-label="Fechar">
                <X size={22} className="text-neutral-900" />
              </button>
            </div>
            {Panel}
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-8 w-full bg-neutral-900 py-3 text-xs font-bold uppercase tracking-widest text-white"
            >
              Ver resultados
            </button>
          </div>
        </div>
      )}
    </>
  );
}
