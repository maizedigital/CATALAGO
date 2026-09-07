import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Banner, Product } from '@/types';

export function VideoBanner() {
  const [videos, setVideos] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .eq('media_type', 'video')
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      const videoBanners = (data || []) as Banner[];
      setVideos(videoBanners);

      const productIds = videoBanners.map((v) => v.product_id).filter(Boolean) as string[];
      if (productIds.length > 0) {
        const { data: prods } = await supabase
          .from('products')
          .select('id, name, slug, gender')
          .in('id', productIds);
        if (!cancelled && prods) {
          const map: Record<string, Product> = {};
          for (const p of prods as unknown as Product[]) {
            map[p.id] = p;
          }
          setProducts(map);
        }
      }
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  if (!loaded || videos.length === 0) return null;

  return (
    <section className="w-full bg-neutral-900 py-4 md:py-6">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 md:justify-center">
          {videos.map((video, idx) => {
            const product = video.product_id ? products[video.product_id] : null;
            const href = product ? `/produto/${product.slug}` : video.link_url || '#';
            const isExternal = href.startsWith('http');

            const content = (
              <div className="group relative shrink-0 snap-center">
                <div
                  className="relative overflow-hidden rounded-xl bg-neutral-800 shadow-lg"
                  style={{ aspectRatio: '9 / 16', width: 'clamp(220px, 60vw, 340px)' }}
                >
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload={idx === 0 ? 'auto' : 'metadata'}
                    className="h-full w-full object-cover"
                  >
                    {(video.desktop_video_url || video.video_url) && <source media="(min-width: 768px)" src={video.desktop_video_url || video.video_url || undefined} />}
                    <source src={video.mobile_video_url || video.video_url || undefined} />
                  </video>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm transition-opacity group-hover:opacity-0">
                    Toque para ver
                  </div>
                </div>
                {product && (
                  <p className="mt-2 text-center text-xs font-medium text-neutral-300">
                    {product.name}
                  </p>
                )}
              </div>
            );

            if (isExternal) {
              return (
                <a key={video.id} href={href} target="_blank" rel="noreferrer">
                  {content}
                </a>
              );
            }
            return (
              <Link key={video.id} to={href}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
