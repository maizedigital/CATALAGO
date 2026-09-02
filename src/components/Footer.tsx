import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, MapPin, Clock, Globe } from 'lucide-react';
import { siteConfig, whatsappLink } from '@/config/site';

export function Footer() {
  const handleWhatsApp = () => {
    window.open(whatsappLink('Olá, MB! Quero receber novidades e ofertas em primeira mão.'), '_blank');
  };

  return (
    <footer className="border-t border-primary-200 bg-primary-50">
      {/* WhatsApp opt-in band */}
      <div className="border-b border-primary-200 bg-primary-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 text-center md:flex-row md:justify-between md:px-6 md:text-left">
          <div>
            <h3 className="font-serif text-2xl font-bold text-white md:text-3xl">
              Receba novidades em primeira mão
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Lançamentos, ofertas exclusivas e conteúdos especiais direto no seu WhatsApp.
            </p>
          </div>
          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-2 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-primary-950 transition-all duration-300 hover:scale-105 hover:bg-accent-400"
          >
            <MessageCircle size={16} /> Quero receber no WhatsApp
          </button>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="font-serif text-2xl font-bold tracking-[0.2em] text-primary-900">
              MB
            </span>
            <p className="mt-3 text-sm leading-relaxed text-primary-500">
              {siteConfig.tagline}
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-900 text-white transition-colors hover:bg-primary-700"
                aria-label="Instagram"
              >
                <Instagram size={17} />
              </a>
              <a
                href={whatsappLink('Olá, MB!')}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-900 text-white transition-colors hover:bg-primary-700"
                aria-label="WhatsApp"
              >
                <MessageCircle size={17} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-900">
              Compre
            </h3>
            <ul className="space-y-2.5 text-sm text-primary-600">
              <li><Link to="/feminino" className="transition-colors hover:text-primary-950">Feminino</Link></li>
              <li><Link to="/masculino" className="transition-colors hover:text-primary-950">Masculino</Link></li>
              <li><Link to="/?section=novidades" className="transition-colors hover:text-primary-950">Novidades</Link></li>
              <li><Link to="/?section=ofertas" className="transition-colors hover:text-primary-950">Ofertas</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-900">
              Atendimento
            </h3>
            <ul className="space-y-2.5 text-sm text-primary-600">
              <li>
                <a href={whatsappLink('Olá, MB! Preciso de ajuda.')} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary-950">
                  <MessageCircle size={15} /> WhatsApp
                </a>
              </li>
              <li><Link to="/contato" className="transition-colors hover:text-primary-950">Contato</Link></li>
              <li><Link to="/sobre" className="transition-colors hover:text-primary-950">Sobre a MB</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary-900">
              Loja física
            </h3>
            <ul className="space-y-2.5 text-sm text-primary-600">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-primary-400" /> {siteConfig.address}
              </li>
              <li className="flex items-start gap-2">
                <Clock size={15} className="mt-0.5 shrink-0 text-primary-400" /> {siteConfig.hoursStore}
              </li>
              <li className="flex items-start gap-2">
                <Globe size={15} className="mt-0.5 shrink-0 text-primary-400" /> {siteConfig.hoursSite}
              </li>
            </ul>
          </div>
        </div>

        {/* Payment */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-primary-200 pt-6 md:flex-row">
          <p className="text-xs text-primary-400">
            MB — Moda que combina com você
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary-400">
            <span className="rounded border border-primary-200 bg-white px-2 py-1">PIX</span>
            <span className="rounded border border-primary-200 bg-white px-2 py-1">CARTÃO</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
