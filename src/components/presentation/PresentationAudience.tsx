import { Reveal } from './Reveal';
import { Instagram, MessageCircle, Store, Rocket, Music2 } from 'lucide-react';

const useCases = [
  {
    icon: Instagram,
    question: 'Vende pelo Instagram?',
    answer: 'Coloque o ENVIEY no link da sua bio.',
  },
  {
    icon: MessageCircle,
    question: 'Vende pelo WhatsApp?',
    answer: 'Envie o link da sua loja para seus clientes.',
  },
  {
    icon: Store,
    question: 'Tem loja física?',
    answer: 'Transforme sua vitrine física em uma vitrine online também.',
  },
  {
    icon: Rocket,
    question: 'Está começando?',
    answer: 'Crie sua loja online mesmo sem ter um ponto físico.',
  },
  {
    icon: Music2,
    question: 'Vende pelo TikTok?',
    answer: 'Leve seus clientes diretamente para seus produtos.',
  },
];

export function PresentationAudience() {
  return (
    <section id="para-quem-e" className="bg-[#080808] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Não importa como você vende hoje.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((uc, i) => (
            <Reveal key={uc.question} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-white/10 bg-[#0D0D0D] p-7 transition-colors hover:border-[#19E66B]/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#19E66B]/10 text-[#19E66B] transition-colors group-hover:bg-[#19E66B]/20">
                  <uc.icon size={24} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{uc.question}</h3>
                <p className="mt-2 text-base leading-relaxed text-neutral-400">{uc.answer}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
