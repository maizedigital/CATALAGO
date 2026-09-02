import { ArrowRight, MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/config/site';
import { useReveal } from '@/hooks/useReveal';

export function PromoBanner() {
  const { ref, inView } = useReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="relative overflow-hidden bg-primary-950 px-4 py-20 text-center text-white md:py-28">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900" />
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-400/5 blur-3xl" />

      <div className={`relative z-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">Dúvidas?</p>
        <h2 className="mt-3 font-serif text-3xl font-bold md:text-5xl">
          Ficou com alguma dúvida?
        </h2>
        <p className="mt-3 text-sm text-white/60">
          Fale com a MB pelo WhatsApp — atendimento rápido e personalizado.
        </p>
        <a
          href={whatsappLink('Olá, MB! Tenho uma dúvida sobre um produto.')}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary-950 transition-all duration-300 hover:bg-accent-400 hover:shadow-xl hover:shadow-accent-400/20"
        >
          <MessageCircle size={16} /> Falar no WhatsApp <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}
