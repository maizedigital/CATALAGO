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

export function CheckoutForm({ items, total, onClear }: CheckoutFormProps) {
  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { trackEvent, setWhatsappId } = useTracking();

  const update = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) next.name = 'Informe seu nome';
    if (!form.whatsapp.trim()) next.whatsapp = 'Informe seu WhatsApp';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);

    const orderLines = items
      .map(
        (item) =>
          `• ${item.name} — Tam: ${item.size}, Cor: ${item.color}, Qtd: ${item.quantity} — ${formatPrice(
            effectivePrice(item.price, item.promo_price) * item.quantity
          )}`
      )
      .join('\n');

    const message = `Olá, MB! Gostaria de finalizar meu pedido.\n\n*Itens:*\n${orderLines}\n\n*Total: ${formatPrice(
      total
    )}*\n\n*Dados:*\nNome: ${form.name}\nWhatsApp: ${form.whatsapp}${
      form.cpf ? `\nCPF: ${form.cpf}` : ''
    }\n\nForma de pagamento: PIX`;

    let saved = false;
    try {
      const { data: existing } = await supabase
        .from('customers')
        .select('id, orders_count, total_spent')
        .eq('whatsapp', form.whatsapp)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('customers')
          .update({
            name: form.name,
            cpf: form.cpf || null,
            last_purchase: new Date().toISOString(),
            last_contact: new Date().toISOString(),
            orders_count: (existing.orders_count || 0) + 1,
            total_spent: (existing.total_spent || 0) + total,
            status: (existing.orders_count || 0) >= 1 ? 'cliente recorrente' : 'cliente',
          })
          .eq('id', existing.id);
        if (!error) saved = true;
      } else {
        const { error } = await supabase.from('customers').insert({
          name: form.name,
          whatsapp: form.whatsapp,
          cpf: form.cpf || null,
          origin: 'site',
          status: 'cliente',
          last_purchase: new Date().toISOString(),
          last_contact: new Date().toISOString(),
          orders_count: 1,
          total_spent: total,
        });
        if (!error) saved = true;
      }

      await supabase
        .from('leads')
        .update({ status: 'cliente', last_interaction: new Date().toISOString() })
        .eq('whatsapp', form.whatsapp);
    } catch {
      // CRM errors won't block checkout
    }

    if (!saved) {
      setSubmitError('Nao foi possivel registrar seus dados. Tente novamente.');
      return;
    }

    window.open(whatsappLink(message), '_blank');
    setSubmitted(true);
    onClear();

    trackEvent('order_placed', { total, items: items.length }, items[0]?.name);
    setWhatsappId(form.whatsapp);
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
          placeholder="(11) 99999-9999"
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
        className="mt-2 w-full bg-neutral-900 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
      >
        Finalizar via WhatsApp
      </button>
      <p className="text-center text-xs text-neutral-400">
        Seus dados são enviados apenas para a MB via WhatsApp.
      </p>
    </form>
  );
}
