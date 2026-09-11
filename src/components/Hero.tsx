import { useEffect, useState } from 'react';

const heroImg =
  'https://images.pexels.com/photos/26448305/pexels-photo-26448305.jpeg?auto=compress&cs=tinysrgb&h=1200';

export function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="relative h-[85vh] min-h-[560px] w-full overflow-hidden bg-primary-950">
      {/* Parallax background */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${scrollY * 0.35}px) scale(1.08)` }}
      >
        <img
          src={heroImg}
          alt="Coleção MB"
          className={`h-full w-full object-cover object-center transition-all duration-[1200ms] ${
            loaded ? 'opacity-90 scale-100' : 'opacity-0 scale-110'
          }`}
          fetchPriority="high"
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-950/20 to-primary-950/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-950/40 via-transparent to-transparent" />



      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-white/60" />
        </div>
      </div>
    </section>
  );
}
