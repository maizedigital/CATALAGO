import { useSEO } from '@/hooks/useSEO';
import { MessageCircle, Users, Instagram, MapPin, ShoppingBag } from 'lucide-react';

const links = [
  {
    label: 'COMPRE ONLINE',
    href: 'https://mbmodabrasil.com.br',
    icon: ShoppingBag,
    featured: true,
  },
  {
    label: 'WHATSAPP',
    href: 'https://wa.me/5573999929009',
    icon: MessageCircle,
  },
  {
    label: 'GRUPO VIP',
    href: 'https://chat.whatsapp.com/CkDGPDbvHm126M6oJPeP6s',
    icon: Users,
  },
  {
    label: 'INSTAGRAM',
    href: 'https://www.instagram.com/mbmodabrasil',
    icon: Instagram,
  },
  {
    label: 'LOCALIZAÇÃO',
    href: 'https://maps.app.goo.gl/4rzDt8WC8tBagiyA7?g_st=ipc',
    icon: MapPin,
  },
] as const;

export default function Bio() {
  useSEO({
    title: 'MB Moda Brasil | Links',
    description: 'Acesse os links oficiais da MB Moda Brasil.',
    canonical: 'https://mbmodabrasil.com.br/bio',
  });

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] px-5 py-10 text-white sm:px-8 sm:py-14">
      <div className="mx-auto flex w-full max-w-[704px] flex-col items-center">
        <div className="flex flex-col items-center text-center">
          <img
            src="/assets/IMG_3937.jpg"
            alt="MB Moda Brasil"
            className="h-36 w-36 rounded-full object-cover shadow-[0_0_35px_rgba(255,255,255,0.06)] sm:h-44 sm:w-44"
          />
          <div className="mt-9 h-px w-20 bg-white/40" />
          <h1 className="mt-8 font-serif text-3xl italic tracking-wide text-white/80 sm:text-4xl">Vista-se com estilo.</h1>
        </div>

        <div className="mt-14 flex w-full flex-col gap-4 sm:mt-16 sm:gap-5">
          {links.map(({ label, href, icon: Icon, featured }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className={`group flex min-h-[76px] w-full items-center gap-6 border px-7 text-left transition-all duration-200 sm:min-h-[88px] sm:px-10 ${
                featured
                  ? 'border-white/20 bg-gradient-to-b from-[#282828] to-[#151515] shadow-[0_0_18px_rgba(255,255,255,0.04)] hover:border-[#19e66b] hover:bg-[#151515] hover:shadow-[0_0_18px_rgba(25,230,107,0.12)]'
                  : 'border-white/[0.08] bg-gradient-to-b from-[#202020] to-[#111111] hover:border-[#19e66b] hover:bg-[#151515] hover:shadow-[0_0_18px_rgba(25,230,107,0.12)]'
              }`}
            >
              <Icon size={28} strokeWidth={1.5} className="shrink-0 text-white transition-colors duration-200 group-hover:text-[#19e66b]" />
              <span className="text-base font-medium tracking-[0.16em] text-white/90 transition-colors duration-200 group-hover:text-[#19e66b] sm:text-lg">
                {label}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center text-center sm:mt-20">
          <div className="h-px w-20 bg-white/30" />
          <p className="mt-9 text-xs uppercase tracking-[0.45em] text-white/60">Coroa Vermelha · BA</p>
          <p className="mt-6 text-[8px] tracking-[0.18em] text-white/40">Segunda a sábado, das 08h30 às 18h20</p>
        </div>
      </div>
    </main>
  );
}
