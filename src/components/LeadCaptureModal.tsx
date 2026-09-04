import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTracking } from '@/hooks/useTracking';

const REGISTERED_KEY = 'mb_lead_submitted';
const FIRST_VISIT_KEY = 'mb_first_visit';

function formatWhatsApp(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validateWhatsApp(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

function detectOrigin(): string {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source')?.toLowerCase();
  if (utmSource) {
    if (utmSource.includes('instagram')) return 'instagram';
    if (utmSource.includes('whatsapp')) return 'whatsapp';
    if (utmSource.includes('campaign') || utmSource.includes('campanha')) return 'campanha';
    return utmSource;
  }
  const referrer = document.referrer.toLowerCase();
  if (referrer.includes('instagram.com')) return 'instagram';
  if (referrer.includes('wa.me') || referrer.includes('whatsapp.com')) return 'whatsapp';
  if (referrer === '') return 'link direto';
  return 'site';
}

const GRACE_PERIOD_MS = 15000;

export function LeadCaptureModal() {
  const [open, setOpen] = useState(false);
  const [mandatory, setMandatory] = useState(false);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { setWhatsappId, trackEvent } = useTracking();

  useEffect(() => {
    const registered = localStorage.getItem(REGISTERED_KEY);
    if (registered) return;

    let firstVisit = localStorage.getItem(FIRST_VISIT_KEY);
    if (!firstVisit) {
      firstVisit = Date.now().toString();
      localStorage.setItem(FIRST_VISIT_KEY, firstVisit);
    }

    const elapsed = Date.now() - parseInt(firstVisit, 10);
    const remaining = Math.max(0, GRACE_PERIOD_MS - elapsed);

    const showTimer = setTimeout(() => setOpen(true), remaining);
    const mandatoryTimer = setTimeout(() => setMandatory(true), remaining + 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(mandatoryTimer);
    };
  }, []);

  const dismiss = () => {
    if (mandatory) return;
    setOpen(false);
  };

  const handleWhatsappChange = (value: string) => {
    setWhatsapp(formatWhatsApp(value));
    setWhatsappError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!validateWhatsApp(whatsapp)) {
      setWhatsappError('Informe um WhatsApp válido com DDD');
      return;
    }
    setSubmitting(true);

    const rawDigits = whatsapp.replace(/\D/g, '');
    const origin = detectOrigin();

    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('whatsapp', rawDigits)
      .maybeSingle();

    if (existing) {
      await supabase.from('leads').update({
        name: name.trim(),
        origin,
        last_interaction: 'Cadastro no catálogo',
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('leads').insert({
        name: name.trim(),
        whatsapp: rawDigits,
        origin,
        status: 'novo',
        last_interaction: 'Cadastro no catálogo',
      });
    }

    setWhatsappId(rawDigits);
    trackEvent('lead_captured', { name: name.trim(), whatsapp: rawDigits, origin });
    localStorage.setItem(REGISTERED_KEY, new Date().toISOString());
    setSubmitting(false);
    setDone(true);
    setTimeout(() => setOpen(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-white p-8 shadow-2xl">
        {!mandatory && (
          <button
            onClick={dismiss}
            className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        )}

        {done ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <span className="text-xl text-green-600">✓</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-neutral-900">Bem-vindo!</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Cadastro realizado. Aproveite o catálogo MB.
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-2xl font-bold text-neutral-900">
              {mandatory ? 'Cadastre-se para continuar' : 'Quer receber novidades da MB?'}
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              {mandatory
                ? 'Para continuar navegando no catálogo, precisamos do seu nome e WhatsApp.'
                : 'Deixe seu nome e WhatsApp para continuar navegando e receber lançamentos em primeira mão.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Nome *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  className={`w-full border px-3 py-2.5 text-sm outline-none transition-colors ${
                    whatsappError ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-neutral-900'
                  }`}
                  placeholder="(XX) XXXXX-XXXX"
                />
                {whatsappError && <p className="mt-1 text-xs text-red-500">{whatsappError}</p>}
              </div>

              <p className="text-xs text-neutral-400">
                Seus dados são tratados conforme a LGPD e não serão compartilhados com terceiros.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-neutral-900 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : mandatory ? 'Cadastrar e continuar' : 'Continuar'}
              </button>
              {!mandatory && (
                <button
                  type="button"
                  onClick={dismiss}
                  className="w-full text-center text-xs text-neutral-400 hover:text-neutral-900"
                >
                  Depois eu cadastro
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
