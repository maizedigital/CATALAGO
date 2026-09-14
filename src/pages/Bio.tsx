import { useSEO } from '@/hooks/useSEO';
import { MessageCircle, Users, Instagram, MapPin, ShoppingBag } from 'lucide-react';
import { siteConfig } from '@/config/site';

const links = [
  { label: 'Compre Online', href: 'https://mbmodabrasil.com.br', icon: ShoppingBag },
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
    <main className="bio-page flex h-[100dvh] flex-col items-center justify-between overflow-y-auto bg-black px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] text-white">
      {/* Top — logo + tagline */}
      <div className="flex flex-col items-center">
        <img
          src="/assets/IMG_3937.jpg"
          alt="MB Moda Brasil"
          className="h-16 w-16 rounded-full object-cover opacity-90 sm:h-20 sm:w-20"
        />
        <div className="mt-5 h-px w-8 bg-white/20" />
        <p className="font-serif mt-4 text-lg italic tracking-wide text-white/50 sm:text-xl">
          Vista-se com estilo.
        </p>
      </div>

      {/* Middle — link buttons */}
      <nav className="flex w-full max-w-[340px] flex-col gap-3 py-8">
        {links.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-center gap-3 rounded-md border border-white/[0.08] bg-white/[0.02] px-5 py-4 text-center text-[15px] font-medium tracking-[0.06em] text-white/85 transition-colors duration-300 hover:border-[#19e66b]/70 hover:bg-[#19e66b]/[0.04] active:border-[#19e66b] active:bg-[#19e66b]/[0.07] sm:py-5 sm:text-base"
          >
            <Icon
              size={16}
              strokeWidth={1.5}
              className="shrink-0 text-white/45 transition-colors duration-300 group-hover:text-[#19e66b] group-active:text-[#19e66b]"
            />
            {label}
          </a>
        ))}
      </nav>

      {/* Bottom — location + hours */}
      <div className="flex flex-col items-center">
        <div className="h-px w-8 bg-white/20" />
        <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.35em] text-white/35">
          Coroa Vermelha • BA
        </p>
        <p className="mt-2 text-[10px] tracking-wide text-white/25">
          {siteConfig.hoursStore}
        </p>
      </div>
    </main>
  );
}
