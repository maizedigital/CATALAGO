import { Link } from 'react-router-dom';

export function Logo({ className = '' }: { className?: string; dark?: boolean }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center select-none ${className}`}
      aria-label="MB — Página inicial"
    >
      <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-black shadow-md transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
        <img src="/assets/IMG_3937.jpg" alt="MB" className="h-full w-full object-cover" />
      </span>
    </Link>
  );
}
