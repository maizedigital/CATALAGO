import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, MapPin, Clock, Globe } from 'lucide-react';
import { siteConfig, whatsappLink } from '@/config/site';
import { Logo } from '@/components/Logo';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { catalogPath } from '@/hooks/useCatalogPath';

export function Footer() {
  return (
    <footer className="bg-black">
      {/* Newsletter opt-in band */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 text-center md:px-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-white md:text-3xl">
              Receber novidades
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Cadastre seu nome e WhatsApp para receber lançamentos e ofertas da MB.
            </p>
          </div>
          <div className="w-full max-w-md">
            <NewsletterSignup />
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 flex flex-col items-center text-center md:col-span-1 md:items-start md:text-left">
            <div className="flex justify-center md:justify-start">
              <Logo />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              {siteConfig.tagline}
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Instagram"
              >
                <Instagram size={17} />
              </a>
              <a
                href={whatsappLink('Olá, MB!')}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="WhatsApp"
              >
                <MessageCircle size={17} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
              Compre
            </h3>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li><Link to={catalogPath('/feminino')} className="transition-colors hover:text-white">Feminino</Link></li>
              <li><Link to={catalogPath('/masculino')} className="transition-colors hover:text-white">Masculino</Link></li>
              <li><Link to={catalogPath('/categoria/geral')} className="transition-colors hover:text-white">Geral</Link></li>
              <li><Link to={catalogPath('/ofertas')} className="transition-colors hover:text-white">Promoção</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
              Atendimento
            </h3>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li>
                <a href={whatsappLink('Olá, MB! Preciso de ajuda.')} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
                  <MessageCircle size={15} /> WhatsApp
                </a>
              </li>
              <li><Link to={catalogPath('/contato')} className="transition-colors hover:text-white">Contato</Link></li>
              <li><Link to={catalogPath('/sobre')} className="transition-colors hover:text-white">Sobre a MB</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
              Loja física
            </h3>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-white/30" /> {siteConfig.address}
              </li>
              <li className="flex items-start gap-2">
                <Clock size={15} className="mt-0.5 shrink-0 text-white/30" /> {siteConfig.hoursStore}
              </li>
              <li className="flex items-start gap-2">
                <Globe size={15} className="mt-0.5 shrink-0 text-white/30" /> {siteConfig.hoursSite}
              </li>
            </ul>
          </div>
        </div>

        {/* Payment */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-xs text-white/40">
            MB Moda Brasil
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
            <span className="rounded border border-white/20 px-2 py-1">PIX</span>
            <span className="rounded border border-white/20 px-2 py-1">CARTÃO</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center md:px-6">
          <Logo />
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-white">MB Moda Brasil</p>
            <p className="mt-1 text-xs text-neutral-400">CNPJ: 61.941.085/0001-05</p>
          </div>
          <p className="text-xs text-neutral-500">© MB Moda Brasil. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
