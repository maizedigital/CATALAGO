import { Reveal } from './Reveal';
import { X, Check } from 'lucide-react';

const beforeItems = [
  'Fotos espalhadas',
  'Preços enviados manualmente',
  'PDF desatualizado',
  'Cliente perguntando tudo',
  'Pedidos perdidos no WhatsApp',
  'Link sem profissionalismo',
];

const afterItems = [
  'Uma loja',
  'Produtos organizados',
  'Carrinho',
  'Pedidos',
  'Categorias',
  'Link único',
  'Atendimento mais organizado',
];

export function PresentationBeforeAfter() {
  return (
    <section className="bg-[#080808] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Antes <span className="text-neutral-600">×</span> ENVIEY
          </h2>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* Before */}
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">Antes</p>
              <ul className="mt-5 space-y-4">
                {beforeItems.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <X size={18} className="shrink-0 text-neutral-600" />
                    <span className="text-base text-neutral-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* After */}
          <Reveal delay={100}>
            <div className="rounded-2xl border border-[#19E66B]/20 bg-[#19E66B]/5 p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-[#19E66B]">Com o ENVIEY</p>
              <ul className="mt-5 space-y-4">
                {afterItems.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check size={18} className="shrink-0 text-[#19E66B]" />
                    <span className="text-base text-white">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12 text-center" delay={200}>
          <p className="text-xl font-bold text-white md:text-2xl">
            Menos trabalho repetitivo.
          </p>
          <p className="text-xl font-bold text-[#19E66B] md:text-2xl">Mais tempo para vender.</p>
        </Reveal>
      </div>
    </section>
  );
}
