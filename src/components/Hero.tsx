import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-primary-950 px-4 py-12 md:py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/feminino"
          className="group inline-flex items-center justify-center gap-2 bg-white px-10 py-4 text-xs font-bold uppercase tracking-widest text-primary-950 transition-all duration-300 hover:bg-accent-400 hover:shadow-xl hover:shadow-accent-400/30"
        >
          Compre Feminino
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          to="/masculino"
          className="group inline-flex items-center justify-center gap-2 border border-white/30 bg-white/5 px-10 py-4 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:border-white/60 hover:bg-white/15"
        >
          Compre Masculino
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
