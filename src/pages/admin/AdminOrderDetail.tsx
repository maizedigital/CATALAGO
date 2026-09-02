import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';
import { formatPrice } from '@/lib/format';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  size: string | null;
  color: string | null;
}

interface Order {
  id: string;
  status: string;
  total: number;
  payment_method: string;
  customer_name: string | null;
  customer_whatsapp: string | null;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const statusOptions = ['novo', 'aguardando pagamento', 'pago', 'em preparacao', 'enviado', 'concluido', 'cancelado'];
const statusColors: Record<string, string> = {
  'novo': 'bg-blue-50 text-blue-600',
  'aguardando pagamento': 'bg-yellow-50 text-yellow-600',
  'pago': 'bg-green-50 text-green-600',
  'em preparacao': 'bg-purple-50 text-purple-600',
  'enviado': 'bg-cyan-50 text-cyan-600',
  'concluido': 'bg-green-100 text-green-700',
  'cancelado': 'bg-red-50 text-red-600',
};

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.get<Order>(`/orders/${id}`);
        if (cancelled) return;
        setOrder(data);
        setNewStatus(data.status);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleSaveStatus = async () => {
    if (!order || !id) return;
    setSaving(true);
    try {
      await adminApi.put(`/orders/${id}`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center rounded-lg bg-red-50 p-12 text-center">
          <p className="text-sm font-medium text-red-600">{error || 'Pedido nao encontrado'}</p>
          <button
            onClick={() => navigate('/admin/pedidos')}
            className="mt-6 bg-neutral-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"
          >
            Voltar para pedidos
          </button>
        </div>
      </AdminLayout>
    );
  }

  const subtotal = order.order_items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/pedidos')}
          className="rounded-lg border border-neutral-200 p-2 text-neutral-600 transition-colors hover:bg-neutral-50"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-serif text-2xl font-bold text-neutral-900">Pedido</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order info */}
        <div className="space-y-6">
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-900">Dados do pedido</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Data</dt>
                <dd className="font-medium text-neutral-900">{new Date(order.created_at).toLocaleString('pt-BR')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Pagamento</dt>
                <dd className="font-medium text-neutral-900">{order.payment_method || 'pix'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Cliente</dt>
                <dd className="font-medium text-neutral-900">{order.customer_name || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">WhatsApp</dt>
                <dd className="font-medium text-neutral-900">{order.customer_whatsapp || '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-900">Alterar status</h2>
            <div className="flex flex-col gap-3">
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status] || 'bg-neutral-100 text-neutral-500'}`}>
                Status atual: {order.status}
              </span>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={handleSaveStatus}
                disabled={saving || newStatus === order.status}
                className="inline-flex items-center justify-center gap-2 bg-neutral-900 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
              >
                <Save size={16} /> {saving ? 'Salvando...' : 'Salvar status'}
              </button>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-lg border border-neutral-200 bg-white p-6">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-neutral-900">Observacoes</h2>
              <p className="text-sm text-neutral-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-900">Itens do pedido</h2>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-neutral-100 pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{item.product_name}</p>
                    <p className="text-xs text-neutral-500">
                      {item.quantity}x — {formatPrice(item.unit_price)}
                      {item.size && ` — Tam: ${item.size}`}
                      {item.color && ` — Cor: ${item.color}`}
                    </p>
                  </div>
                  <span className="font-bold text-neutral-900">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="font-bold text-neutral-900">Total</span>
                <span className="font-bold text-neutral-900">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
