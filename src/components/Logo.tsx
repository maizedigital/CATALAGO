import { Link } from 'react-router-dom';
import { useCatalog } from '@/hooks/useCatalogContext';

export function Logo({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  const catalog = useCatalog();
  const storeName = catalog?.name ?? '';
  const settings = catalog?.settings as Record<string, unknown> | null;
  const storeSettings = (settings?.store ?? settings ?? {}) as { logo_url?: string };

  // If the tenant has a custom logo, use it
  if (storeSettings.logo_url) {
    return (
      <Link to="/" className={`group inline-flex items-center select-none ${className}`} aria-label={`${storeName} — Página inicial`}>
        <img src={storeSettings.logo_url} alt={storeName || 'Logo'} className="h-10 w-auto rounded-lg transition-transform duration-300 group-hover:scale-105 md:h-12" />
      </Link>
    );
  }

  // Default: show the store name as text (or "Enviey" if no catalog context)
  const displayName = storeName || 'Enviey';
  return (
    <Link to="/" className={`group inline-flex items-center select-none ${className}`} aria-label={`${displayName} — Página inicial`}>
      <span className={`text-xl font-extrabold tracking-tight transition-transform duration-300 group-hover:scale-105 ${dark ? 'text-white' : 'text-white'}`}>
        {displayName}
      </span>
    </Link>
  );
}
