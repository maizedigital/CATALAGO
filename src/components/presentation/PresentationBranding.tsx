import { Reveal } from './Reveal';

const identityItems = [
  'Seu logo',
  'Suas cores',
  'Seus produtos',
  'Seus banners',
  'Suas categorias',
  'Sua identidade',
];

export function PresentationBranding() {
  return (
    <section className="bg-[#080808] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Não pareça um catálogo genérico.
          </h2>
          <p className="mt-3 text-2xl font-semibold text-[#19E66B]">Pareça uma marca.</p>
        </Reveal>

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {identityItems.map((item, i) => (
              <Reveal key={item} delay={i * 60}>
                <div className="rounded-xl border border-white/10 bg-[#0D0D0D] px-5 py-4 text-center">
                  <span className="text-base font-semibold text-neutral-200">{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-12 text-center" delay={200}>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-neutral-400">
            O ENVIEY fornece a tecnologia. A loja continua sendo sua.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
