import { Reveal } from './Reveal';
import { ArrowRight } from 'lucide-react';

const flow = ['Instagram', 'Link na bio', 'ENVIEY', 'Produto', 'Carrinho', 'Pedido', 'WhatsApp'];

export function PresentationInstagramFlow() {
  return (
    <section className="bg-[#080808] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Seus seguidores já estão lá.
          </h2>
          <p className="mt-3 text-xl font-semibold text-neutral-400">
            Agora dê um lugar para eles comprar.
          </p>
        </Reveal>

        {/* Flow chain */}
        <Reveal className="mt-14" delay={100}>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {flow.map((step, i) => (
              <div key={step} className="flex items-center gap-2 md:gap-3">
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-bold md:text-base ${
                    step === 'ENVIEY'
                      ? 'bg-[#19E66B] text-black'
                      : 'border border-white/10 bg-[#0D0D0D] text-neutral-200'
                  }`}
                >
                  {step}
                </div>
                {i < flow.length - 1 && (
                  <ArrowRight size={16} className="text-neutral-600" />
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-12 max-w-lg text-center" delay={200}>
          <p className="text-lg text-neutral-300">
            Pare de responder &ldquo;preço?&rdquo; dezenas de vezes por dia.
          </p>
          <p className="mt-4 text-2xl font-bold text-[#19E66B]">Mande o link.</p>
        </Reveal>
      </div>
    </section>
  );
}
