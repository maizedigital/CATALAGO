import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X, MessageCircle } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '@/hooks/useCart';
import { siteConfig, whatsappLink } from '@/config/site';

const navLinks = [
  { label: 'Feminino', to: '/feminino' },
  { label: 'Masculino', to: '/masculino' },
  { label: 'Novidades', to: '/?section=novidades' },
  { label: 'Ofertas', to: '/?section=ofertas' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { count, openCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
      setQuery('');
    }
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* Announcement bar — on top of the black header */}
      <div className="relative z-50 overflow-hidden bg-neutral-950 py-2">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.15em] text-white/80">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex items-center gap-8">
              <span>Frete fixo de R$ 25,00 para toda a Bahia</span>
              <span className="text-white/40">·</span>
              <span>Moda que combina com você</span>
              <span className="text-white/40">·</span>
              <span>Site 24 horas, 7 dias por semana</span>
              <span className="text-white/40">·</span>
            </span>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? 'border-white/10 bg-black/95 backdrop-blur-lg shadow-lg'
            : 'border-transparent bg-black/90 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          {/* Mobile menu button */}
          <button
            className="p-2 -ml-2 text-white md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo — just the photo */}
          <Logo className="md:flex-1" />

          {/* Navigation */}
          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="group relative text-sm font-medium uppercase tracking-wide text-white/80 transition-colors hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 justify-end md:flex-1 md:gap-2">
            <button
              className="p-2 text-white transition-opacity hover:opacity-60"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Pesquisar"
            >
              <Search size={20} />
            </button>
            <button
              className="hidden p-2 text-white transition-opacity hover:opacity-60 md:inline-flex"
              onClick={() => window.open(whatsappLink('Olá, MB! Gostaria de tirar uma dúvida.'), '_blank')}
              aria-label="WhatsApp"
            >
              <MessageCircle size={20} />
            </button>
            <button
              className="relative p-2 text-white transition-opacity hover:opacity-60"
              onClick={openCart}
              aria-label="Carrinho"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 animate-bounce-in items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="animate-fade-down border-t border-white/10 bg-black px-4 py-4 md:px-6">
            <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl items-center gap-3">
              <Search size={18} className="text-white/40" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produtos, categorias..."
                className="flex-1 border-b border-white/20 bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white"
              />
              <button type="submit" className="text-sm font-bold uppercase tracking-wide text-white">
                Buscar
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] animate-slide-right bg-black p-6 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <Logo />
              <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
                <X size={22} className="text-white" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-white/10 py-3 text-base font-medium uppercase tracking-wide text-white/90"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <form onSubmit={handleSearch} className="mt-6 flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="flex-1 border-b border-white/20 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white"
              />
              <button type="submit" aria-label="Buscar">
                <Search size={18} className="text-white" />
              </button>
            </form>
            <a
              href={whatsappLink('Olá, MB! Gostaria de tirar uma dúvida.')}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/90"
            >
              <MessageCircle size={18} />
              {siteConfig.whatsappDisplay}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
