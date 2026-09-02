import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

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

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-end px-4 pb-20 text-center text-white md:pb-28">
        <div
          className={`mb-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md transition-all duration-700 ${
            loaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <Sparkles size={14} className="text-accent-400" />
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/90">
            Moda que combina com você
          </span>
        </div>

        <h1
          className={`font-serif text-5xl font-bold leading-[1.05] tracking-tight transition-all duration-700 md:text-7xl lg:text-8xl ${
            loaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '450ms' }}
        >
          ESTILO QUE
          <br />
          <span className="italic text-white/85">MARCA</span>
        </h1>

        <p
          className={`mt-4 max-w-md text-balance text-sm text-white/70 transition-all duration-700 md:text-base ${
            loaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          Descubra a nova coleção MB. Moda que combina com você,
          do dia à noite.
        </p>

        <div
          className={`mt-8 flex flex-col gap-3 transition-all duration-700 sm:flex-row ${
            loaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
          style={{ transitionDelay: '750ms' }}
        >
          <Link
            to="/feminino"
            className="group inline-flex items-center justify-center gap-2 bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary-950 transition-all duration-300 hover:bg-accent-400 hover:text-primary-950 hover:shadow-xl hover:shadow-accent-400/30"
          >
            Comprar Feminino
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/masculino"
            className="group inline-flex items-center justify-center gap-2 border border-white/30 bg-white/5 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:border-white/60 hover:bg-white/15"
          >
            Comprar Masculino
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-white/60" />
        </div>
      </div>
    </section>
  );
}
