import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useCatalog } from '@/hooks/useCatalogContext';
import { whatsappLink } from '@/config/site';
import { MessageCircle, Truck, ShieldCheck } from 'lucide-react';
import { catalogPath } from '@/hooks/useCatalogPath';

type StoreSettings = {
  name?: string;
  tagline?: string;
  whatsapp?: string;
  address?: string;
  hoursStore?: string;
  hours?: string;
};

export default function About() {
  const catalog = useCatalog();
  const storeName = catalog?.name ?? 'Loja';
  const settings = (catalog?.settings as Record<string, unknown>)?.store ?? (catalog?.settings ?? {}) as StoreSettings;
  useSEO({
    title: `Sobre — ${storeName}`,
    description: `Conheça a ${storeName}.`,
  });

  return (
    <div>
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight md:text-5xl">Sobre a {storeName}</h1>
            <p className="mt-3 text-sm text-white/80 md:text-base">{settings.tagline ?? ''}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
        <div className="prose prose-neutral max-w-none">
          <p className="text-base leading-relaxed text-neutral-600">
            Bem-vindo à {storeName}. Aqui você encontra produtos selecionados com qualidade e os melhores preços.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <PolicyCard icon={<Truck size={24} />} title="Entrega" text="Envio para todo Brasil." />
          <PolicyCard icon={<ShieldCheck size={24} />} title="Qualidade" text="Produtos selecionados com cuidado." />
        </div>

        {(settings.address || settings.hoursStore) && (
          <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-sm leading-relaxed text-neutral-600">
            {settings.address && <p><strong className="text-neutral-900">Loja física:</strong> {settings.address}</p>}
            {settings.hoursStore && <p className="mt-1"><strong className="text-neutral-900">Horário:</strong> {settings.hoursStore}</p>}
            <p className="mt-1"><strong className="text-neutral-900">Pagamento:</strong> PIX e cartão</p>
          </div>
        )}

        {settings.whatsapp && (
          <div className="mt-8 border border-neutral-200 bg-neutral-50 p-8 text-center">
            <h2 className="font-serif text-2xl font-bold text-neutral-900">Fale conosco</h2>
            <p className="mt-2 text-sm text-neutral-500">Dúvidas sobre produtos ou pedidos? Estamos prontos para ajudar.</p>
            <a
              href={whatsappLink(settings.whatsapp, `Olá, ${storeName}! Tenho uma dúvida.`)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-neutral-900 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
            >
              <MessageCircle size={16} /> Falar no WhatsApp
            </a>
            <div className="mt-4">
              <Link to={catalogPath('/contato')} className="text-sm text-neutral-600 underline hover:text-neutral-900">Ver todas as formas de contato</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function PolicyCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="border border-neutral-200 p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center text-neutral-900">{icon}</div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-500">{text}</p>
    </div>
  );
}
