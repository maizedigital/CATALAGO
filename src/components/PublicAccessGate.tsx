import { useEffect, useState, type ReactNode } from 'react';
import { Lock, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MB_CATALOG_ID } from '@/lib/domain';

const PREVIEW_SECONDS = 5;
const AUTH_EMAIL_DOMAIN = 'auth.mbmarcabrasileira.local';

function digits(value: string): string {
  return value.replace(/\D/g, '');
}

function formatPhone(value: string): string {
  const phone = digits(value).slice(0, 11);
  if (phone.length <= 2) return phone;
  if (phone.length <= 6) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
  if (phone.length <= 10) return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
}

function formatCpf(value: string): string {
  const cpf = digits(value).slice(0, 11);
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

function authEmail(phone: string): string {
  return `${digits(phone)}@${AUTH_EMAIL_DOMAIN}`;
}

export function PublicAccessGate({ children }: { children: ReactNode }) {
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PREVIEW_SECONDS);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setHasSession(Boolean(data.session));
        setSessionReady(true);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setHasSession(Boolean(nextSession));
        setSessionReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (hasSession || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [hasSession, secondsLeft]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedPhone = digits(phone);
    const normalizedCpf = digits(cpf);
    setError(null);
    setMessage(null);

    if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
      setError('Informe um telefone válido com DDD.');
      return;
    }
    if (normalizedCpf.length !== 11) {
      setError('Informe um CPF válido.');
      return;
    }
    if (authMode === 'signup' && name.trim().length < 3) {
      setError('Informe seu nome completo.');
      return;
    }

    setBusy(true);
    try {
      const email = authEmail(normalizedPhone);
      const result = authMode === 'signup'
        ? await supabase.auth.signUp({
            email,
            password: normalizedCpf,
            options: { data: { full_name: name.trim(), phone: normalizedPhone } },
          })
        : await supabase.auth.signInWithPassword({ email, password: normalizedCpf });

      if (result.error) {
        setError('Não foi possível concluir o acesso. Confira os dados e tente novamente.');
        return;
      }

      if (authMode === 'signup' && result.data.session) {
        const { error: customerError } = await supabase.rpc('register_public_customer', {
          p_name: name.trim(),
          p_whatsapp: normalizedPhone,
          p_cpf: normalizedCpf,
          p_catalog_id: MB_CATALOG_ID,
        });
        if (customerError) {
          await supabase.auth.signOut();
          setError('Não foi possível concluir o cadastro. Tente novamente.');
          return;
        }
      }

      if (authMode === 'signup' && !result.data.session) {
        setMessage('Cadastro iniciado. Confirme o acesso pelo e-mail automático da conta.');
      }
    } catch {
      setError('Não foi possível concluir o acesso. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  const mustAuthenticate = sessionReady && !hasSession && secondsLeft === 0;

  return (
    <>
      {children}
      {mustAuthenticate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/90 px-4 py-8 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-white shadow-2xl md:p-8">
            <button
              type="button"
              onClick={() => setSecondsLeft(PREVIEW_SECONDS)}
              className="absolute right-4 top-4 text-neutral-500 transition-colors hover:text-white"
              aria-label="Continuar prévia"
            >
              <X size={18} />
            </button>
            <div className="mb-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900">
                <Lock size={20} />
              </div>
              <h2 className="mt-4 font-serif text-2xl font-bold">Acesse a coleção</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                Cadastre seu nome completo, telefone e CPF para continuar vendo a MB MARCA BRASILEIRA.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label htmlFor="public-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">Nome completo</label>
                  <input
                    id="public-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white"
                    placeholder="Seu nome completo"
                  />
                </div>
              )}
              <div>
                <label htmlFor="public-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">Telefone</label>
                <input
                  id="public-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(formatPhone(event.target.value))}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white"
                  placeholder="(73) 99992-9009"
                />
              </div>
              <div>
                <label htmlFor="public-cpf" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">CPF</label>
                <input
                  id="public-cpf"
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete={authMode === 'signup' ? 'off' : 'current-password'}
                  value={cpf}
                  onChange={(event) => setCpf(formatCpf(event.target.value))}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white"
                  placeholder="000.000.000-00"
                />
              </div>

              {error && <p className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2.5 text-xs text-red-300">{error}</p>}
              {message && <p className="rounded-lg border border-green-900 bg-green-950/40 px-3 py-2.5 text-xs text-green-300">{message}</p>}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
              >
                {busy && <Loader2 size={15} className="animate-spin" />}
                {authMode === 'signup' ? 'Cadastrar e continuar' : 'Entrar e continuar'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => { setAuthMode((current) => current === 'signup' ? 'login' : 'signup'); setError(null); setMessage(null); }}
              className="mt-5 w-full text-center text-xs text-neutral-400 transition-colors hover:text-white"
            >
              {authMode === 'signup' ? 'Já tenho cadastro. Entrar' : 'Ainda não tenho cadastro. Criar acesso'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
