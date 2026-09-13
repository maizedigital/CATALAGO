import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useSEO } from '@/hooks/useSEO';
import { ADMIN_BASE } from '@/config/site';

export default function AdminLogin() {
  useSEO({ title: 'MB Moda Brasil · Painel', noindex: true });
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={ADMIN_BASE} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate(ADMIN_BASE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full rounded-lg border border-neutral-700 bg-neutral-800 py-3 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-500';

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/">
            <img src="/assets/IMG_3937.jpg" alt="MB Moda Brasil" className="mx-auto h-14 w-auto rounded-lg" />
          </Link>
          <p className="mt-4 text-xs font-medium uppercase tracking-widest text-neutral-500">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400">Usuário</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus className={inputClass} placeholder="admin" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••" />
            </div>
          </div>

          {error && <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-xs font-medium text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-100 py-3.5 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
