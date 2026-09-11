import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '@/hooks/useCart';

const navLinks = [
  { label: 'Início', to: '/' },
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
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? 'border-neutral-200 bg-white/95 backdrop-blur-lg shadow-sm'
            : 'border-neutral-200 bg-white/90 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          {/* Left: mobile menu + desktop nav */}
          <div className="flex flex-1 items-center gap-4">
            <button
              className="p-2 -ml-2 text-neutral-900 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="group relative text-[13px] font-medium text-neutral-700 transition-colors hover:text-neutral-900"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-neutral-900 transition-all duration-300 group-hover:w-full" />
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
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="group relative text-[13px] font-medium text-neutral-700 transition-colors hover:text-neutral-900"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-neutral-900 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
            <button
              className="p-2 text-neutral-900 transition-opacity hover:opacity-60"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Pesquisar"
            >
              <Search size={20} />
            </button>
            <button
              className="relative p-2 text-neutral-900 transition-opacity hover:opacity-60"
              onClick={openCart}
              aria-label="Carrinho"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 animate-bounce-in items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="animate-fade-down border-t border-neutral-200 bg-white px-4 py-4 md:px-6">
            <form onSubmit={handleSearch} className="mx-auto flex max-w-xl items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar produtos, categorias..."
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
                />
              </div>
              <button type="submit" className="text-xs font-bold uppercase tracking-wider text-neutral-900 transition-opacity hover:opacity-60">
                Buscar
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] animate-slide-right bg-white p-6 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <Logo />
              <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
                <X size={22} className="text-neutral-900" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-neutral-100 py-3 text-sm font-medium text-neutral-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <form onSubmit={handleSearch} className="mt-6">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
