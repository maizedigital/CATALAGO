import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <nav className="flex items-center justify-center gap-4 px-4 py-5">
      <Link
        to="/feminino"
        className="text-xs font-semibold uppercase tracking-widest text-primary-700 transition-colors duration-200 hover:text-accent-500"
      >
        Compre Feminino
      </Link>
      <span className="text-neutral-300">·</span>
      <Link
        to="/masculino"
        className="text-xs font-semibold uppercase tracking-widest text-primary-700 transition-colors duration-200 hover:text-accent-500"
      >
        Compre Masculino
      </Link>
    </nav>
  );
}
