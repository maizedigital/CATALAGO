import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '@/hooks/useCart';

const navLinks = [
  { label: 'Início', to: '/' },
  { label: 'Feminino', to: '/feminino' },
  { label: 'Masculino', to: '/masculino' },
  { label: 'Ofertas', to: '/ofertas' },
];

const marqueeItems = [
  'FRETE FIXO R$ 20 PARA TODA A BAHIA',
  'SITE 24 HORAS',
  'PIX E CARTÃO',
  'MODA MASCULINA E FEMININA',
  'RETIRE NA LOJA',
  'ENVIO PARA TODA A BAHIA',
];

const marqueeText = marqueeItems.join(' • ');

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { count, openCart } = useCart();
  const navigate = useNavigate();

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
      <header className="sticky top-0 z-40 bg-black">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          {/* Left: mobile menu + desktop nav */}
          <div className="flex flex-1 items-center gap-4">
            <button
              className="p-2 -ml-2 text-white md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="group relative text-[13px] font-medium text-white/80 transition-colors hover:text-white"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Logo */}
          <div className="flex shrink-0 items-center justify-center">
            <Logo />
          </div>

          {/* Right: nav + actions */}
          <div className="flex flex-1 items-center justify-end gap-4">
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.slice(2).map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="group relative text-[13px] font-medium text-white/80 transition-colors hover:text-white"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
            <button
              className="p-2 text-white transition-opacity hover:opacity-60"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Pesquisar"
            >
              <Search size={20} />
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
            <form onSubmit={handleSearch} className="mx-auto flex max-w-xl items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar produtos, categorias..."
                  className="w-full rounded-full border border-white/20 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-neutral-400 focus:border-white/40 focus:bg-white/15"
                />
              </div>
              <button type="submit" className="text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-60">
                Buscar
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Moving information marquee */}
      <div className="overflow-hidden border-b border-white/10" style={{ background: 'linear-gradient(90deg, #000000 0%, #111111 50%, #000000 100%)' }}>
        <div className="marquee-track flex whitespace-nowrap py-1.5">
          <span className="marquee-content text-[11px] font-medium uppercase tracking-wider text-white/70">
            {marqueeText} • {marqueeText} •
          </span>
        </div>
      </div>

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
                  className="border-b border-white/10 py-3 text-sm font-medium text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <form onSubmit={handleSearch} className="mt-6">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full rounded-full border border-white/20 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-neutral-400 focus:border-white/40 focus:bg-white/15"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
