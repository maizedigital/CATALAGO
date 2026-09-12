import { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Store, AtSign, Mail, Lock, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { tenantSignup, checkSlugAvailability } from '@/lib/adminApi';
import { useSEO } from '@/hooks/useSEO';

export default function AdminSignup() {
  useSEO({ title: 'Criar minha loja — Enviey', noindex: true });
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAdminAuth();

  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  // Normalize slug from store name if user hasn't manually edited it
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      const normalized = storeName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(normalized);
    }
  }, [storeName, slugTouched]);

  // Debounced slug availability check
  useEffect(() => {
    if (!slug || slug.length < 2) {
      setSlugStatus('idle');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugStatus('invalid');
      return;
    }
    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const available = await checkSlugAvailability(slug);
      setSlugStatus(available ? 'available' : 'taken');
    }, 500);
    return () => clearTimeout(timer);
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !slug.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    if (slugStatus !== 'available') {
      setError('O endereço da loja não está disponível.');
      return;
    }
    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await tenantSignup({
        storeName: storeName.trim(),
        slug: slug.trim(),
        email: email.trim(),
        password,
      });
      // Auto-login with the new credentials
      await login(slug.trim(), password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full rounded-lg border border-neutral-700 bg-neutral-800 py-3 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-500';

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <img src="/IMG_7011.jpg" alt="Enviey" className="mx-auto h-14 w-auto rounded-lg" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Criar minha loja grátis</h1>
          <p className="mt-2 text-sm text-neutral-500">Comece a vender online em minutos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
          {/* Store name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400">Nome da loja</label>
            <div className="relative">
              <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                autoFocus
                className={inputClass}
                placeholder="Minha Loja"
              />
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400">
              Endereço da loja
            </label>
            <div className="relative">
              <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9-]/g, '-')
                      .replace(/-+/g, '-')
                      .replace(/^-|-$/g, '')
                  );
                }}
                className={inputClass}
                placeholder="minha-loja"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {slugStatus === 'checking' && <Loader2 size={16} className="animate-spin text-neutral-500" />}
                {slugStatus === 'available' && <Check size={16} className="text-green-500" />}
                {slugStatus === 'taken' && <X size={16} className="text-red-500" />}
                {slugStatus === 'invalid' && <X size={16} className="text-red-500" />}
              </div>
            </div>
            <p className="mt-1.5 text-xs text-neutral-500">
              Sua loja ficará em: <span className="font-semibold text-neutral-300">enviey.app/{slug || 'minha-loja'}</span>
            </p>
            {slugStatus === 'taken' && (
              <p className="mt-1 text-xs text-red-400">Este endereço já está em uso. Escolha outro.</p>
            )}
            {slugStatus === 'invalid' && (
              <p className="mt-1 text-xs text-red-400">Use apenas letras, números e hífens.</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="voce@email.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Mínimo 4 caracteres"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-xs font-medium text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || slugStatus !== 'available'}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#19E66B] py-3.5 text-sm font-bold text-black transition-colors hover:bg-[#15c259] disabled:opacity-50"
          >
            {loading ? 'Criando sua loja...' : 'Criar minha loja'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Já tem uma conta?{' '}
          <Link to="/admin/login" className="font-semibold text-[#19E66B] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
