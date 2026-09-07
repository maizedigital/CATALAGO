import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Banner } from '@/types';

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (!cancelled && data) {
        setBanners(data);
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, banners.length]);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const dragStartX = useRef(0);
  const dragEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    dragEndX.current = e.clientX;
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons > 0) dragEndX.current = e.clientX;
  };
  const handlePointerUp = () => {
    const diff = dragStartX.current - dragEndX.current;
    if (Math.abs(diff) > 50) (diff > 0 ? next : prev)();
    dragStartX.current = 0;
    dragEndX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!loaded || banners.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-neutral-100"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'pan-y' }}
    >
      <div className="relative w-full" style={{ aspectRatio: '16 / 6' }}>
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: idx === current ? 1 : 0, pointerEvents: idx === current ? 'auto' : 'none' }}
          >
            {banner.link_url ? (
              <a href={banner.link_url} target="_blank" rel="noreferrer" className="block h-full w-full">
                <picture>
                  {banner.desktop_image_url && <source media="(min-width: 768px)" srcSet={banner.desktop_image_url} />}
                  <img
                    src={banner.mobile_image_url || banner.image_url}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchPriority={idx === 0 ? 'high' : 'low'}
                  />
                </picture>
              </a>
            ) : (
              <picture>
                {banner.desktop_image_url && <source media="(min-width: 768px)" srcSet={banner.desktop_image_url} />}
                <img
                  src={banner.mobile_image_url || banner.image_url}
                  alt={banner.title}
                  className="h-full w-full object-cover"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : 'low'}
                />
              </picture>
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
              aria-label={`Ir para banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
