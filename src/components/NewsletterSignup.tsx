import { useState } from 'react';
import { supabase } from '@/lib/supabase';

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

export function NewsletterSignup() {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe seu nome');
      return;
    }
    if (!validateWhatsApp(whatsapp)) {
      setError('Informe um WhatsApp válido com DDD');
      return;
    }

    setSubmitting(true);
    setError('');

    const rawDigits = whatsapp.replace(/\D/g, '');

    try {
      const { error: upsertError } = await supabase
        .from('leads')
        .upsert(
          {
            name: name.trim(),
            whatsapp: rawDigits,
            origin: 'newsletter',
            status: 'novo',
            last_interaction: 'Inscrição novidades',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'whatsapp' }
        );

      if (upsertError) {
        setError('Erro ao cadastrar. Tente novamente.');
        return;
      }

      setSuccess(true);
      setName('');
      setWhatsapp('');
    } catch {
      setError('Erro ao cadastrar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium text-white">
          Cadastro realizado com sucesso. Você receberá nossas novidades.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome"
        className="w-full border-b border-white/30 bg-transparent py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-white"
      />
      <input
        type="tel"
        value={whatsapp}
        onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
        placeholder="WhatsApp"
        className="w-full border-b border-white/30 bg-transparent py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-white"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 self-center border border-white px-8 py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
      >
        {submitting ? 'Enviando...' : 'Quero receber novidades'}
      </button>
    </form>
  );
}
