import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { siteConfig, whatsappLink } from '@/config/site';
import { MessageCircle, Truck, ShieldCheck } from 'lucide-react';

export default function About() {
  useSEO({
    title: 'Sobre a MB — MB',
    description: 'Conheça a MB. Moda que combina com você. Qualidade, estilo e atitude em cada peça.',
  });

  const img =
    'https://images.pexels.com/photos/8386651/pexels-photo-8386651.jpeg?auto=compress&cs=tinysrgb&h=800';

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden bg-neutral-900">
        <img src={img} alt="MB" className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight md:text-5xl">
              Sobre a MB
            </h1>
            <p className="mt-3 text-sm text-white/80 md:text-base">{siteConfig.tagline}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
        <div className="prose prose-neutral max-w-none">
          <p className="text-base leading-relaxed text-neutral-600">
            A MB nasceu com o desejo de criar moda que traduz personalidade. Acreditamos que
            estilo não é excesso — é a forma mais simples de dizer quem você é. Por isso,
            trabalhamos com peças atemporais, tecidos cuidadosamente selecionados e um
            acabamento que você sente ao toque.
          </p>
          <p className="mt-4 text-base leading-relaxed text-neutral-600">
            Cada coleção é pensada para combinar com você, do dia à noite, do casual ao
            sofisticado. Do feminino ao masculino, a MB oferece peças que duram e que
            permanecem atuais.
          </p>
        </div>

        {/* Policies */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <PolicyCard
            icon={<Truck size={24} />}
            title="Frete grátis"
            text="Para todo o Brasil nas compras acima de R$ 480,00."
          />
          <PolicyCard
            icon={<ShieldCheck size={24} />}
            title="Qualidade"
            text="Tecidos selecionados e acabamento premium em cada peça MB."
          />
        </div>

        {/* Contact CTA */}
        <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-sm leading-relaxed text-neutral-600">
          <p><strong className="text-neutral-900">Loja física:</strong> {siteConfig.address}</p>
          <p className="mt-1"><strong className="text-neutral-900">Horário:</strong> {siteConfig.hoursStore}</p>
          <p className="mt-1"><strong className="text-neutral-900">Site:</strong> {siteConfig.hoursSite}</p>
          <p className="mt-1"><strong className="text-neutral-900">Pagamento:</strong> PIX e cartão</p>
          <p className="mt-1"><strong className="text-neutral-900">Frete grátis:</strong> para todo o Brasil nas compras acima de R$ 480,00</p>
        </div>

        <div className="mt-8 border border-neutral-200 bg-neutral-50 p-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-neutral-900">Fale com a MB</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Dúvidas sobre produtos ou pedidos? Estamos prontos para ajudar.
          </p>
          <a
            href={whatsappLink('Olá, MB! Tenho uma dúvida.')}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 bg-neutral-900 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            <MessageCircle size={16} /> Falar no WhatsApp
          </a>
          <div className="mt-4">
            <Link to="/contato" className="text-sm text-neutral-600 underline hover:text-neutral-900">
              Ver todas as formas de contato
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PolicyCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="border border-neutral-200 p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center text-neutral-900">
        {icon}
      </div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-500">{text}</p>
    </div>
  );
}
