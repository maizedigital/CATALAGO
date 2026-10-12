import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Banner } from '@/types';

export function CategoryCarousel() {
  const [categories, setCategories] = useState<Banner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .eq('type', 'category')
        .order('sort_order', { ascending: true });
      if (!cancelled && data) {
        setCategories(data);
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!loaded || categories.length === 0) return null;

  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <h2 className="mb-8 text-center font-serif text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
          Categorias
        </h2>
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-2 md:justify-center md:overflow-x-visible"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((cat) => {
            const name = cat.category_name || cat.title;
            const link = cat.link_url || '/';
            const isInternal = link.startsWith('/');
            const content = (
              <div className="group flex shrink-0 flex-col items-center" style={{ scrollSnapAlign: 'center' }}>
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-neutral-200 transition-all duration-300 group-hover:border-neutral-900 group-hover:shadow-lg md:h-32 md:w-32">
                  <img
                    src={cat.image_url}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <span className="mt-3 text-center text-xs font-bold uppercase tracking-wider text-neutral-900 transition-colors group-hover:text-neutral-600 md:text-sm">
                  {name}
                </span>
              </div>
            );
            return isInternal ? (
              <Link key={cat.id} to={link}>{content}</Link>
            ) : (
              <a key={cat.id} href={link} target="_blank" rel="noreferrer">{content}</a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
