import { Reveal } from './Reveal';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const included = [
  'Loja online',
  'Produtos ilimitados',
  'Categorias',
  'Carrinho',
  'Pedidos',
  'WhatsApp',
  'Banners',
  'Personalização',
  'Clientes',
  'Métricas',
  'Responsivo',
];

const trialBenefits = ['7 dias grátis', 'Sem cartão', 'Sem comissão', 'Cancele quando quiser'];

export function PresentationPricing() {
  return (
    <section id="preco" className="bg-[#080808] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Uma loja completa.
          </h2>
          <p className="mt-3 text-2xl font-semibold text-neutral-400">Um único plano.</p>
        </Reveal>

        {/* Price card */}
        <Reveal className="mx-auto mt-12 max-w-md" delay={100}>
          <div className="relative overflow-hidden rounded-3xl border border-[#19E66B]/30 bg-[#0D0D0D] p-8 text-center md:p-10">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-[#19E66B]/15 blur-[80px]" />

            <p className="relative text-sm font-bold uppercase tracking-wider text-[#19E66B]">ENVIEY</p>

            <div className="relative mt-4 flex items-end justify-center gap-1">
              <span className="text-5xl font-black text-white md:text-6xl">R$ 16,97</span>
              <span className="pb-2 text-lg text-neutral-500">/mês</span>
            </div>

            <p className="relative mt-3 text-sm font-bold uppercase tracking-wider text-white">
              Tudo incluso
            </p>

            <ul className="relative mx-auto mt-8 grid max-w-sm grid-cols-1 gap-3 text-left sm:grid-cols-2">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check size={16} className="shrink-0 text-[#19E66B]" />
                  <span className="text-sm text-neutral-300">{item}</span>
                </li>
              ))}
            </ul>

            <div className="relative mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2">
              {trialBenefits.map((b) => (
                <span key={b} className="text-xs font-semibold text-neutral-500">
                  {b}
                </span>
              ))}
            </div>

            <Link
              to="/admin/login"
              className="relative mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#19E66B] px-7 py-4 text-base font-bold text-black transition-all hover:bg-[#15c259] hover:shadow-[0_0_32px_rgba(25,230,107,0.4)]"
            >
              Criar minha loja grátis
            </Link>

            <p className="relative mt-4 text-xs text-neutral-600">
              Após o período gratuito, R$16,97/mês.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function PresentationPriceJustification() {
  return (
    <section className="bg-[#050505] py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
        <Reveal>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Por que pagar mais?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            Uma loja online não precisa custar uma fortuna.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-8 space-y-2 text-base text-neutral-400">
            <p>You don&rsquo;t need to pay hundreds of reais per month to start.</p>
            <p>You don&rsquo;t need to hire a developer.</p>
            <p>You don&rsquo;t need to understand technology.</p>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-8 text-xl font-bold text-white">Você precisa começar.</p>
          <p className="mt-6 text-5xl font-black text-[#19E66B] md:text-6xl">R$ 16,97/mês</p>
        </Reveal>
      </div>
    </section>
  );
}
