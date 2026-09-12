import { Reveal } from './Reveal';

const steps = [
  { num: '01', title: 'Crie sua conta', copy: 'Comece em poucos minutos.' },
  { num: '02', title: 'Personalize', copy: 'Logo, nome, cores e identidade.' },
  { num: '03', title: 'Cadastre seus produtos', copy: 'Fotos, preços, categorias e informações.' },
  { num: '04', title: 'Publique', copy: 'Sua loja fica pronta para receber visitantes.' },
  { num: '05', title: 'Divulgue', copy: 'Instagram, WhatsApp, TikTok, QR Code ou onde quiser.' },
  { num: '06', title: 'Receba pedidos', copy: 'Seu cliente escolhe e envia o pedido.' },
];

export function PresentationHowItWorks() {
  return (
    <section id="como-funciona" className="bg-[#050505] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Sua loja pode estar online em poucos passos.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 80}>
              <div className="h-full bg-[#0D0D0D] p-7 transition-colors hover:bg-[#080808]">
                <span className="text-4xl font-black text-[#19E66B]/20">{step.num}</span>
                <h3 className="mt-3 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-base text-neutral-400">{step.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
