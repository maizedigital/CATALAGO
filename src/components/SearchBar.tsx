import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

export function SearchBar({ onClose }: { onClose?: () => void }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      onClose?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar produtos..."
        className="flex-1 border-b border-neutral-300 py-2 text-sm outline-none focus:border-neutral-900"
      />
      <button type="submit" aria-label="Buscar">
        <Search size={18} className="text-neutral-900" />
      </button>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Fechar busca">
          <X size={18} className="text-neutral-900" />
        </button>
      )}
    </form>
  );
}
