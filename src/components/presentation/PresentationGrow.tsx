import { Reveal } from './Reveal';

const todayFlow = ['Produtos', 'Loja', 'Pedidos', 'WhatsApp'];
const nearFuture = ['Clientes', 'CRM', 'Métricas', 'Marketing', 'Automações'];
const futureFlow = ['Estoque', 'Pagamentos', 'Integrações', 'Gestão'];

export function PresentationGrow() {
  return (
    <section className="bg-[#050505] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Comece simples.
          </h2>
        </Reveal>

        <div className="mx-auto mt-14 max-w-4xl space-y-8">
          {/* Today */}
          <Reveal>
            <div className="rounded-2xl border border-[#19E66B]/20 bg-[#19E66B]/5 p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-[#19E66B]">Hoje</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
                {todayFlow.map((item, i) => (
                  <div key={item} className="flex items-center gap-2 md:gap-3">
                    <span className="rounded-lg bg-[#19E66B] px-4 py-2 text-sm font-bold text-black">
                      {item}
                    </span>
                    {i < todayFlow.length - 1 && <span className="text-neutral-600">→</span>}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Near future */}
          <Reveal delay={100}>
            <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Evolução</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
                {nearFuture.map((item, i) => (
                  <div key={item} className="flex items-center gap-2 md:gap-3">
                    <span className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-neutral-300">
                      {item}
                    </span>
                    {i < nearFuture.length - 1 && <span className="text-neutral-600">→</span>}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Future vision */}
          <Reveal delay={200}>
            <div className="rounded-2xl border border-white/10 bg-[#0D0D0D]/50 p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">Futuro</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
                {futureFlow.map((item, i) => (
                  <div key={item} className="flex items-center gap-2 md:gap-3">
                    <span className="rounded-lg border border-white/5 px-4 py-2 text-sm text-neutral-500">
                      {item}
                    </span>
                    {i < futureFlow.length - 1 && <span className="text-neutral-700">→</span>}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12 text-center" delay={300}>
          <p className="text-lg text-neutral-400">
            O ENVIEY pode crescer junto com o seu negócio.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
