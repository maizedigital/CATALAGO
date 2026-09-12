import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Para quem é', href: '#para-quem-e' },
  { label: 'Preço', href: '#preco' },
  { label: 'FAQ', href: '#faq' },
];

export function PresentationHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
        <a href="/" className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
          ENVIE<span className="text-[#19E66B]">Y</span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/admin/login"
            className="text-sm font-semibold text-neutral-300 transition-colors hover:text-white"
          >
            Entrar
          </Link>
          <Link
            to="/admin/login"
            className="rounded-lg bg-[#19E66B] px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-[#15c259] hover:shadow-[0_0_24px_rgba(25,230,107,0.35)]"
          >
            Criar minha loja
          </Link>
        </div>

        <button
          className="text-white lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#050505] px-4 py-6 lg:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="text-base font-medium text-neutral-300 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-4">
              <Link to="/admin/login" onClick={closeMenu} className="text-base font-semibold text-neutral-300">
                Entrar
              </Link>
              <Link
                to="/admin/login"
                onClick={closeMenu}
                className="rounded-lg bg-[#19E66B] px-5 py-3 text-center text-sm font-bold text-black"
              >
                Criar minha loja
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
