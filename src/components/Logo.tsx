import { Link } from 'react-router-dom';

export function Logo({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center select-none ${className}`}
      aria-label="MB MARCA BRASILEIRA — Página inicial"
    >
      <img
        src="/assets/IMG_3937.jpg"
        alt="MB MARCA BRASILEIRA"
        className="h-10 w-auto rounded-lg transition-transform duration-300 group-hover:scale-105 md:h-12"
      />
    </Link>
  );
}
