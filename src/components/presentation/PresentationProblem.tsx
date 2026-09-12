import { Reveal } from './Reveal';
import { ArrowDown, Check } from 'lucide-react';

const messages = [
  'Quanto custa?',
  'Tem M?',
  'Tem outra cor?',
  'Me manda as fotos.',
  'Tem esse modelo?',
  'Como faço o pedido?',
];

const flowSteps = ['Entrar', 'Navegar', 'Escolher', 'Adicionar ao carrinho', 'Enviar pedido'];

export function PresentationProblem() {
  return (
    <section className="bg-[#080808] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Você ainda vende seus produtos assim?
          </h2>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {messages.map((msg, i) => (
            <Reveal key={msg} delay={i * 80}>
              <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5">
                    <span className="text-sm text-neutral-500">💬</span>
                  </div>
                  <p className="pt-1.5 text-base text-neutral-300">{msg}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mt-14 max-w-2xl text-center" delay={200}>
          <p className="text-2xl font-bold text-white md:text-3xl">
            Seu cliente não deveria precisar perguntar tudo.
          </p>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Seu produto já existe. Seu preço já existe. Suas fotos já existem. Suas informações já
            existem. Então por que você precisa enviar tudo manualmente?
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function PresentationSolution() {
  return (
    <section className="bg-[#050505] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Coloque tudo em um <span className="text-[#19E66B]">único lugar</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-neutral-400 md:text-lg">
            O ENVIEY transforma seus produtos em uma loja online profissional.
          </p>
        </Reveal>

        {/* Flow diagram */}
        <Reveal className="mx-auto mt-14 max-w-4xl" delay={100}>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-1">
            {flowSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-2 sm:gap-1">
                <div className="rounded-xl border border-white/10 bg-[#0D0D0D] px-5 py-3">
                  <span className="text-sm font-semibold text-white">{step}</span>
                </div>
                {i < flowSteps.length - 1 && (
                  <ArrowDown size={18} className="text-neutral-600 sm:rotate-[-90deg]" />
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-12 max-w-lg text-center" delay={200}>
          <div className="space-y-2">
            <p className="text-lg text-neutral-300">
              <Check size={18} className="mr-2 inline text-[#19E66B]" />
              Sem PDF.
            </p>
            <p className="text-lg text-neutral-300">
              <Check size={18} className="mr-2 inline text-[#19E66B]" />
              Sem ficar mandando foto produto por produto.
            </p>
            <p className="text-lg text-neutral-300">
              <Check size={18} className="mr-2 inline text-[#19E66B]" />
              Sem complicação.
            </p>
          </div>

          <a
            href="#preco"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#19E66B] px-7 py-4 text-base font-bold text-black transition-all hover:bg-[#15c259] hover:shadow-[0_0_32px_rgba(25,230,107,0.4)]"
          >
            Quero colocar minha loja online
          </a>
        </Reveal>
      </div>
    </section>
  );
}
