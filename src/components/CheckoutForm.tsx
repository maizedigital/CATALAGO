import { useState } from 'react';
import type { CartItem } from '@/types';
import { formatPrice, effectivePrice } from '@/lib/format';
import { whatsappLink } from '@/config/site';
import { useTracking } from '@/hooks/useTracking';
import { supabase } from '@/lib/supabase';

interface CheckoutFormProps {
  items: CartItem[];
  total: number;
  onClear: () => void;
}

interface FormData {
  name: string;
  whatsapp: string;
  cpf: string;
}

const empty: FormData = { name: '', whatsapp: '', cpf: '' };

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

export function CheckoutForm({ items, total, onClear }: CheckoutFormProps) {
  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { trackEvent, setWhatsappId } = useTracking();

  const update = (key: keyof FormData, value: string) => {
    const processed = key === 'whatsapp' ? formatWhatsApp(value) : value;
    setForm((prev) => ({ ...prev, [key]: processed }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) next.name = 'Informe seu nome';
    if (!form.whatsapp.trim()) {
      next.whatsapp = 'Informe seu WhatsApp';
    } else if (!validateWhatsApp(form.whatsapp)) {
      next.whatsapp = 'WhatsApp inválido. Use DDD + número (ex: 73 99992-9009)';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    const rawDigits = form.whatsapp.replace(/\D/g, '');

    const orderLines = items
      .map(
        (item) =>
          `• ${item.name} — Tam: ${item.size}, Cor: ${item.color}, Qtd: ${item.quantity}${item.sizes && item.sizes.length > 1 ? ` (Unidades: ${item.sizes.join(', ')})` : ''} — ${formatPrice(
            effectivePrice(item.price, item.promo_price) * item.quantity
          )}`
      )
      .join('\n');

    const message = `Olá, MB! Gostaria de finalizar meu pedido.\n\n*Itens:*\n${orderLines}\n\n*Total: ${formatPrice(
      total
    )}*\n\n*Dados:*\nNome: ${form.name}\nWhatsApp: ${form.whatsapp}${
      form.cpf ? `\nCPF: ${form.cpf}` : ''
    }\n\nForma de pagamento: PIX`;

    // Try to register the customer in the database. This must not block
    // checkout — the WhatsApp order still goes through even if the CRM
    // insert fails, so the shopper is never stuck.
    try {
      const { error } = await supabase.rpc('record_checkout_customer', {
        p_name: form.name,
        p_whatsapp: rawDigits,
        p_cpf: form.cpf || null,
        p_items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      if (error) {
        console.warn('CRM register failed:', error.message);
      }
    } catch (err) {
      console.warn('CRM register error:', err);
    }

    window.open(whatsappLink(message), '_blank');
    setSubmitted(true);
    setSubmitting(false);
    onClear();

    trackEvent('order_placed', { total, items: items.length }, items[0]?.name);
    setWhatsappId(rawDigits);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <span className="text-2xl text-green-600">✓</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-neutral-900">Pedido enviado!</h2>
        <p className="mt-3 text-sm text-neutral-500">
          Abrimos o WhatsApp da MB com os detalhes do seu pedido. Finalize a conversa para
          confirmar o pagamento via PIX.
        </p>
      </div>
    );
  }

  const inputClass = (key: keyof FormData) =>
    `w-full border bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900 ${
      errors[key] ? 'border-red-400' : 'border-neutral-200'
    }`;

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-700">Nome completo *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className={inputClass('name')}
          placeholder="Seu nome"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-700">WhatsApp *</label>
        <input
          type="tel"
          value={form.whatsapp}
          onChange={(e) => update('whatsapp', e.target.value)}
          className={inputClass('whatsapp')}
          placeholder="(73) 99992-9009"
        />
        {errors.whatsapp && <p className="mt-1 text-xs text-red-500">{errors.whatsapp}</p>}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-700">CPF (opcional)</label>
        <input
          type="text"
          value={form.cpf}
          onChange={(e) => update('cpf', e.target.value)}
          className={inputClass('cpf')}
          placeholder="000.000.000-00"
        />
      </div>

      <div className="mt-2 border-t border-neutral-200 pt-4">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-900">
          Forma de pagamento
        </h3>
        <div className="flex items-center gap-3 border border-neutral-900 bg-neutral-50 px-4 py-3">
          <span className="text-sm font-bold uppercase tracking-wider text-neutral-900">PIX</span>
          <span className="text-xs text-neutral-500">Pagamento instantâneo</span>
        </div>
      </div>

      {submitError && (
        <p className="text-sm text-red-500">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full bg-neutral-900 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Enviando...' : 'Finalizar via WhatsApp'}
      </button>
      <p className="text-center text-xs text-neutral-400">
        Seus dados são enviados apenas para a MB via WhatsApp.
      </p>
    </form>
  );
}
