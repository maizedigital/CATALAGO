import { useSEO } from '@/hooks/useSEO';
import { MessageCircle, Users, Instagram, MapPin, ShoppingBag } from 'lucide-react';

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
    <main className="bio-page flex h-[100dvh] flex-col items-center justify-center overflow-hidden bg-black px-4 text-white">
      <div className="flex h-full w-full max-w-[300px] flex-col items-center justify-between py-[env(safe-area-inset-top,0)] pb-[max(1.5rem,env(safe-area-inset-bottom,0))]">
        <div className="flex flex-1 flex-col items-center justify-center">
          <img
            src="/assets/IMG_3937.jpg"
            alt="MB Moda Brasil"
            className="h-20 w-20 rounded-full object-cover opacity-90 sm:h-24 sm:w-24"
          />
          <div className="mt-4 h-px w-10 bg-white/25" />
        </div>

        <nav className="flex w-full flex-col gap-2.5 sm:gap-3">
          {links.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-[20px] font-medium tracking-[0.14em] text-white/80 transition-colors duration-200 hover:border-[#19e66b] hover:bg-[#19e66b] hover:text-black sm:py-3.5"
            >
              <Icon size={14} strokeWidth={1.5} className="shrink-0 transition-colors duration-200 group-hover:text-black" />
              {label}
            </a>
          ))}
        </nav>

        <div className="flex-1" />
      </div>
    </main>
  );
}
