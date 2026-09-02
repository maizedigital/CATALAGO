import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

interface CategoryBannerProps {
  title: string;
  image: string;
  to: string;
  subtitle?: string;
}

export function CategoryBanner({ title, image, to, subtitle }: CategoryBannerProps) {
  const { ref, inView } = useReveal<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      to={to}
      className={`group relative block aspect-[4/5] overflow-hidden bg-neutral-100 md:aspect-[3/4] transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <img
        src={image}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-primary-950/10 to-transparent transition-all duration-500 group-hover:from-primary-950/80" />

      {/* Animated corner accent */}
      <div className="absolute right-5 top-5 h-12 w-12 border-r-2 border-t-2 border-white/40 transition-all duration-500 group-hover:h-16 group-hover:w-16" />

      <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 text-center text-white">
        {subtitle && (
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.25em] text-white/60 transition-all duration-500 group-hover:text-white/80">
            {subtitle}
          </p>
        )}
        <h2 className="font-serif text-2xl font-bold tracking-tight transition-transform duration-500 group-hover:scale-105 md:text-4xl">
          {title}
        </h2>
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
          Ver coleção
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}
