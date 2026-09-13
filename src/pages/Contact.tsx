import { useSEO } from '@/hooks/useSEO';
import { useCatalog } from '@/hooks/useCatalogContext';
import { whatsappLink } from '@/config/site';
import { MessageCircle, Instagram, MapPin, Clock, Globe } from 'lucide-react';

type StoreSettings = {
  name?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  hours?: string;
  hoursStore?: string;
  address?: string;
};

export default function Contact() {
  const catalog = useCatalog();
  const storeName = catalog?.name ?? 'Loja';
  const s = ((catalog?.settings as Record<string, unknown>)?.store ?? catalog?.settings ?? {}) as StoreSettings;
  useSEO({
    title: `Contato — ${storeName}`,
    description: `Entre em contato com a ${storeName}.`,
  });

  const wa = s.whatsapp ?? '';
  const insta = s.instagram ?? '';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">Contato</h1>
        <p className="mt-3 text-sm text-neutral-500">Estamos aqui para ajudar. Escolha o canal que preferir.</p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {wa && (
          <a href={whatsappLink(wa, `Olá, ${storeName}! Preciso de ajuda.`)} target="_blank" rel="noreferrer" className="group flex items-center gap-4 border border-neutral-200 p-6 transition-colors hover:border-neutral-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600"><MessageCircle size={24} /></div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">WhatsApp</h3>
              <p className="mt-1 text-sm text-neutral-500">{wa}</p>
            </div>
          </a>
        )}

        {insta && (
          <a href={`https://instagram.com/${insta.replace('@', '')}`} target="_blank" rel="noreferrer" className="group flex items-center gap-4 border border-neutral-200 p-6 transition-colors hover:border-neutral-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-900"><Instagram size={24} /></div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Instagram</h3>
              <p className="mt-1 text-sm text-neutral-500">{insta}</p>
            </div>
          </a>
        )}

        {s.hoursStore && (
          <div className="flex items-center gap-4 border border-neutral-200 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-900"><Clock size={24} /></div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Loja física</h3>
              <p className="mt-1 text-sm text-neutral-500">{s.hoursStore}</p>
            </div>
          </div>
        )}

        {s.hours && (
          <div className="flex items-center gap-4 border border-neutral-200 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-900"><Globe size={24} /></div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Site</h3>
              <p className="mt-1 text-sm text-neutral-500">{s.hours}</p>
            </div>
          </div>
        )}
      </div>

      {s.address && (
        <div className="mt-4 flex items-center gap-4 border border-neutral-200 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-900"><MapPin size={24} /></div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">Endereço</h3>
            <p className="mt-1 text-sm text-neutral-500">{s.address}</p>
          </div>
        </div>
      )}
    </div>
  );
}
