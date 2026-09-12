import { Reveal } from './Reveal';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

export function PresentationFinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#050505] py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[600px] rounded-full bg-[#19E66B]/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
        <Reveal>
          <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
            Você já vende.
          </h2>
          <p className="mt-2 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
            Agora tenha uma loja para isso.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
            Crie sua loja online, organize seus produtos e comece a receber pedidos.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-8 text-4xl font-black text-[#19E66B] md:text-5xl">R$ 16,97/mês</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Check size={15} className="text-[#19E66B]" /> 7 dias grátis
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={15} className="text-[#19E66B]" /> Sem cartão
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={15} className="text-[#19E66B]" /> Sem comissão
            </span>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <Link
            to="/admin/cadastro"
            className="group mt-10 inline-flex items-center justify-center gap-2 rounded-xl bg-[#19E66B] px-8 py-5 text-lg font-bold text-black transition-all hover:bg-[#15c259] hover:shadow-[0_0_40px_rgba(25,230,107,0.5)]"
          >
            Criar minha loja grátis
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
