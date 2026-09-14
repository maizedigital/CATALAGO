import { useSEO } from '@/hooks/useSEO';
import { MessageCircle, Users, Instagram, MapPin, ShoppingBag } from 'lucide-react';
import { siteConfig } from '@/config/site';

const links = [
  { label: 'Compre Online', href: 'https://mbmodabrasil.com.br', icon: ShoppingBag, highlight: true },
  { label: 'Whatsapp', href: 'https://wa.me/5573999929009', icon: MessageCircle },
  { label: 'Grupo Vip', href: 'https://chat.whatsapp.com/CkDGPDbvHm126M6oJPeP6s', icon: Users },
  { label: 'Instagram', href: 'https://www.instagram.com/mbmodabrasil', icon: Instagram },
  { label: 'Localização', href: 'https://maps.app.goo.gl/4rzDt8WC8tBagiyA7?g_st=ipc', icon: MapPin },
] as const;

export default function Bio() {
  useSEO({
    title: 'MB Moda Brasil | Links',
    description: 'Acesse os links oficiais da MB Moda Brasil.',
    canonical: 'https://mbmodabrasil.com.br/bio',
  });

  return (
    <main className="bio-page relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-6 py-12">
      {/* Blurred background image */}
      <div
        aria-hidden
        className="absolute inset-0 scale-110 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/IMG_3937.jpg)', filter: 'blur(24px)' }}
      />
      <div aria-hidden className="absolute inset-0 bg-black/80" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90" />

      <div className="relative flex w-full max-w-sm flex-1 flex-col items-center justify-between">
        {/* Header — logo + tagline */}
        <header className="flex flex-col items-center pt-10 pb-6 text-center">
          <img
            src="/assets/IMG_3937.jpg"
            alt="MB Moda Brasil"
            className="h-32 w-32 rounded-full object-cover drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
          />
          <div className="mx-auto mt-2 h-px w-12 bg-white/30" />
          <p className="font-serif mt-6 text-xl font-light italic tracking-wide text-white/60">
            Vista-se com estilo.
          </p>
        </header>

        {/* Link buttons */}
        <nav
          className="flex w-full flex-col items-center gap-4 py-8"
          aria-label="Links principais"
        >
          {links.map(({ label, href, icon: Icon, highlight }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className={`group flex w-full items-center justify-start gap-4 rounded-lg border border-transparent bg-gradient-to-b from-white/[0.14] to-white/[0.04] py-5 px-5 text-[13px] font-normal tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:border-[#19e66b] hover:glow-green active:border-[#19e66b] focus-visible:border-[#19e66b] ${
                highlight ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]' : ''
              }`}
            >
              <Icon
                className="h-5 w-5 shrink-0 opacity-90"
                strokeWidth={1.5}
              />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        {/* Footer — location + hours */}
        <footer className="flex flex-col items-center pb-4 text-center">
          <div className="mx-auto mb-5 h-px w-10 bg-white/20" />
          <p className="text-[11px] font-light uppercase tracking-[0.35em] text-white/60">
            Coroa Vermelha • BA
          </p>
          <p className="mt-2 text-[10px] font-light tracking-[0.12em] text-white/40">
            {siteConfig.hoursStore}
          </p>
        </footer>
      </div>
    </main>
  );
}
