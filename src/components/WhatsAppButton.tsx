import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/config/site';
import { useTracking } from '@/hooks/useTracking';

export function WhatsAppButton() {
  const { trackEvent } = useTracking();
  return (
    <a
      href={whatsappLink('Olá, MB! Gostaria de mais informações.')}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent('whatsapp_click', { source: 'floating_button' })}
      className="group fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-transform hover:scale-110 active:scale-95"
      aria-label="Falar no WhatsApp"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 animate-pulse-ring rounded-full bg-green-500" />
      <MessageCircle size={28} className="relative z-10" />
      {/* Tooltip */}
      <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-lg bg-primary-950 px-3 py-2 text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        Fale conosco no WhatsApp
      </span>
    </a>
  );
}
