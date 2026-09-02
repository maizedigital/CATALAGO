import { useSEO } from '@/hooks/useSEO';
import { siteConfig, whatsappLink } from '@/config/site';
import { MessageCircle, Instagram, MapPin, Clock, Globe } from 'lucide-react';

export default function Contact() {
  useSEO({
    title: 'Contato — MB',
    description: 'Entre em contato com a MB. WhatsApp, Instagram e atendimento na loja física em Coroa Vermelha.',
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
          Contato
        </h1>
        <p className="mt-3 text-sm text-neutral-500">
          Estamos aqui para ajudar. Escolha o canal que preferir.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {/* WhatsApp */}
        <a
          href={whatsappLink('Olá, MB! Preciso de ajuda.')}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-4 border border-neutral-200 p-6 transition-colors hover:border-neutral-900"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
            <MessageCircle size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">WhatsApp</h3>
            <p className="mt-1 text-sm text-neutral-500">{siteConfig.whatsappDisplay}</p>
          </div>
        </a>

        {/* Instagram */}
        <a
          href={siteConfig.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-4 border border-neutral-200 p-6 transition-colors hover:border-neutral-900"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-900">
            <Instagram size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Instagram</h3>
            <p className="mt-1 text-sm text-neutral-500">{siteConfig.instagram}</p>
          </div>
        </a>

        {/* Store hours */}
        <div className="flex items-center gap-4 border border-neutral-200 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-900">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Loja física</h3>
            <p className="mt-1 text-sm text-neutral-500">{siteConfig.hoursStore}</p>
          </div>
        </div>

        {/* Site hours */}
        <div className="flex items-center gap-4 border border-neutral-200 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-900">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Site</h3>
            <p className="mt-1 text-sm text-neutral-500">{siteConfig.hoursSite}</p>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="mt-4 flex items-center gap-4 border border-neutral-200 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-900">
          <MapPin size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Endereço</h3>
          <p className="mt-1 text-sm text-neutral-500">{siteConfig.address}</p>
        </div>
      </div>
    </div>
  );
}
