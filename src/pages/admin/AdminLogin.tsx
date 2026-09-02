import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-serif text-4xl font-bold tracking-[0.3em] text-white">MB</span>
          <p className="mt-2 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Painel Administrativo
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-lg bg-white p-8 shadow-2xl"
        >
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-700">
              Usuário
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                className="w-full border border-neutral-200 py-3 pl-10 pr-3 text-sm outline-none transition-colors focus:border-neutral-900"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-700">
              Senha
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-neutral-200 py-3 pl-10 pr-3 text-sm outline-none transition-colors focus:border-neutral-900"
                placeholder="••••"
              />
            </div>
          </div>

          {error && (
            <p className="rounded bg-red-50 px-4 py-3 text-xs font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-neutral-900 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-600">
          Acesso restrito a administradores.
        </p>
      </div>
    </div>
  );
}
