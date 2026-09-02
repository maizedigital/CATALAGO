import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';

export default function NotFound() {
  useSEO({ title: 'Página não encontrada — MB' });
  return (
    <div className="py-24 text-center">
      <h1 className="font-serif text-4xl font-bold text-neutral-900">404</h1>
      <p className="mt-3 text-sm text-neutral-500">Página não encontrada.</p>
      <Link
        to="/"
        className="mt-8 inline-block bg-neutral-900 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
      >
        Voltar para a home
      </Link>
    </div>
  );
}
