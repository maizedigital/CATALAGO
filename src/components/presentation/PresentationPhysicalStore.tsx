import { Reveal } from './Reveal';

const examples = [
  'Produtos mais vendidos',
  'Lançamentos',
  'Novas coleções',
  'Produtos de maior margem',
  'Peças que você quer divulgar',
];

export function PresentationPhysicalStore() {
  return (
    <section className="bg-[#050505] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Tem loja física?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-400 md:text-lg">
            Você não precisa transformar sua operação inteira em um e-commerce.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 max-w-3xl">
          <Reveal delay={100}>
            <p className="text-center text-lg text-neutral-300">
              Você pode começar colocando apenas os produtos que você quer online.
            </p>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {examples.map((ex, i) => (
              <Reveal key={ex} delay={i * 60}>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0D0D0D] px-5 py-4">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#19E66B]" />
                  <span className="text-base text-neutral-200">{ex}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 text-center" delay={200}>
            <div className="space-y-1">
              <p className="text-xl font-bold text-white">Comece pequeno.</p>
              <p className="text-xl font-bold text-white">Venda online.</p>
              <p className="text-xl font-bold text-[#19E66B]">Expanda quando estiver pronto.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
