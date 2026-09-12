import { Link } from 'react-router-dom';

export function PresentationFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <p className="text-xl font-extrabold tracking-tight text-white">
              ENVIE<span className="text-[#19E66B]">Y</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
              Sua loja online. Do seu jeito.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">Produto</p>
            <ul className="mt-4 space-y-3">
              <li><a href="#recursos" className="text-sm text-neutral-400 hover:text-white">Recursos</a></li>
              <li><a href="#como-funciona" className="text-sm text-neutral-400 hover:text-white">Como funciona</a></li>
              <li><a href="#preco" className="text-sm text-neutral-400 hover:text-white">Preço</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">Nichos</p>
            <ul className="mt-4 space-y-3">
              <li><a href="#moda" className="text-sm text-neutral-400 hover:text-white">Moda</a></li>
              <li><a href="#nichos" className="text-sm text-neutral-400 hover:text-white">Beleza</a></li>
              <li><a href="#nichos" className="text-sm text-neutral-400 hover:text-white">Alimentação</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">Suporte</p>
            <ul className="mt-4 space-y-3">
              <li><a href="#faq" className="text-sm text-neutral-400 hover:text-white">Central de ajuda</a></li>
              <li><a href="#faq" className="text-sm text-neutral-400 hover:text-white">FAQ</a></li>
              <li><Link to="/contato" className="text-sm text-neutral-400 hover:text-white">Contato</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">Legal</p>
            <ul className="mt-4 space-y-3">
              <li><span className="text-sm text-neutral-400">Termos de Uso</span></li>
              <li><span className="text-sm text-neutral-400">Política de Privacidade</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-center text-sm text-neutral-600">
            &copy; 2026 ENVIEY. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
