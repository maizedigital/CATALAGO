import { useState } from 'react';
import { Reveal } from './Reveal';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'O que é o ENVIEY?',
    a: 'Uma plataforma para criar uma loja online profissional e vender seus produtos pela internet.',
  },
  {
    q: 'Preciso ter loja física?',
    a: 'Não. Você pode usar o ENVIEY mesmo vendendo somente online.',
  },
  {
    q: 'Posso vender pelo Instagram?',
    a: 'Sim. Você pode colocar o link da sua loja na bio e divulgar seus produtos.',
  },
  {
    q: 'Posso vender pelo WhatsApp?',
    a: 'Sim. O ENVIEY foi pensado para facilitar vendas que continuam pelo WhatsApp.',
  },
  {
    q: 'Funciona para loja de roupas?',
    a: 'Sim. Moda é o principal foco do ENVIEY.',
  },
  {
    q: 'Posso cadastrar vários produtos?',
    a: 'Sim. O plano inclui produtos ilimitados.',
  },
  {
    q: 'O ENVIEY cobra comissão?',
    a: 'Não.',
  },
  {
    q: 'Preciso saber programar?',
    a: 'Não.',
  },
  {
    q: 'Posso usar pelo celular?',
    a: 'Sim.',
  },
  {
    q: 'Quanto custa?',
    a: 'R$16,97/mês.',
  },
  {
    q: 'Tem período grátis?',
    a: 'Sim. 7 dias grátis e sem cartão.',
  },
  {
    q: 'Posso cancelar?',
    a: 'Sim, quando quiser.',
  },
];

export function PresentationFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#050505] py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Perguntas frequentes
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 30}>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0D0D0D]">
                <button
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="text-base font-semibold text-white">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-neutral-500 transition-transform duration-200 ${
                      open === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ${
                    open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-base leading-relaxed text-neutral-400">{faq.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
