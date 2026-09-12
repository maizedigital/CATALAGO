import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Check } from 'lucide-react';

export function PresentationHero() {
  return (
    <section className="relative overflow-hidden bg-[#050505] pt-28 pb-20 md:pt-36 md:pb-28">
      {/* subtle green glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#19E66B]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center rounded-full border border-[#19E66B]/30 bg-[#19E66B]/10 px-4 py-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#19E66B]">
                Sua loja online por R$16,97/mês
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              Você vende.
              <br />
              <span className="text-[#19E66B]">O ENVIEY cuida</span>
              <br />
              da sua loja online.
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-neutral-400 md:text-lg lg:mx-0">
              Crie uma loja online profissional para apresentar seus produtos, receber pedidos e
              vender pelo Instagram, WhatsApp e outros canais — sem complicação.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/admin/login"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#19E66B] px-7 py-4 text-base font-bold text-black transition-all hover:bg-[#15c259] hover:shadow-[0_0_32px_rgba(25,230,107,0.4)] sm:w-auto"
              >
                Criar minha loja grátis
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-white/5 sm:w-auto"
              >
                Ver como funciona
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-neutral-500 lg:justify-start">
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
          </div>

          {/* Right: product mockup */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <StorefrontMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function StorefrontMockup() {
  return (
    <div className="relative">
      {/* glow behind card */}
      <div className="absolute inset-0 rounded-2xl bg-[#19E66B]/15 blur-[60px]" />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0D0D0D] shadow-2xl">
        {/* Browser bar */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-[#080808] px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-neutral-700" />
          <div className="h-3 w-3 rounded-full bg-neutral-700" />
          <div className="h-3 w-3 rounded-full bg-neutral-700" />
          <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-xs text-neutral-500">
            enviey.app/minha-loja
          </div>
        </div>

        {/* Storefront content */}
        <div className="p-4 md:p-5">
          {/* store header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#19E66B] text-xs font-black text-black">
                ML
              </div>
              <span className="text-sm font-bold text-white">Minha Loja</span>
            </div>
            <ShoppingBag size={18} className="text-neutral-400" />
          </div>

          {/* categories */}
          <div className="mt-3 flex gap-2 overflow-hidden">
            {['Feminino', 'Masculino', 'Acessórios'].map((cat) => (
              <span
                key={cat}
                className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-400"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* product grid */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { name: 'Camiseta Oversized', price: 'R$ 89,90' },
              { name: 'Vestido Floral', price: 'R$ 149,90' },
              { name: 'Calça Wide', price: 'R$ 119,90' },
              { name: 'Tênis Casual', price: 'R$ 199,90' },
            ].map((p, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-lg border border-white/10 bg-[#050505]"
              >
                <div
                  className="h-20 w-full md:h-24"
                  style={{
                    background: `linear-gradient(135deg, hsl(${i * 80}, 30%, 20%) 0%, hsl(${i * 80 + 40}, 25%, 12%) 100%)`,
                  }}
                />
                <div className="p-2.5">
                  <p className="truncate text-xs font-semibold text-white">{p.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#19E66B]">{p.price}</span>
                    <span className="rounded-md bg-[#19E66B] px-2 py-0.5 text-[10px] font-bold text-black">
                      +
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* cart bar */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-[#19E66B]/20 bg-[#19E66B]/10 px-4 py-3">
            <div>
              <p className="text-xs text-neutral-400">2 itens no carrinho</p>
              <p className="text-sm font-bold text-white">R$ 239,80</p>
            </div>
            <span className="rounded-lg bg-[#19E66B] px-4 py-2 text-xs font-bold text-black">
              Enviar pedido
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
