import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';
import { ADMIN_BASE } from '@/config/site';
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
  'novo': 'bg-blue-950/50 text-blue-400',
  'aguardando pagamento': 'bg-yellow-950/50 text-yellow-400',
  'pago': 'bg-green-950/50 text-green-400',
  'em preparacao': 'bg-purple-950/50 text-purple-400',
  'enviado': 'bg-cyan-950/50 text-cyan-400',
  'concluido': 'bg-green-900/50 text-green-300',
  'cancelado': 'bg-red-950/50 text-red-400',
};

const card = 'rounded-xl border border-neutral-800 bg-neutral-900 p-6';

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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-300" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 p-12 text-center">
          <p className="text-sm font-medium text-red-400">{error || 'Pedido nao encontrado'}</p>
          <button onClick={() => navigate(`${ADMIN_BASE}/pedidos`)} className="mt-6 rounded-lg bg-neutral-100 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white">
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
        <button onClick={() => navigate(`${ADMIN_BASE}/pedidos`)} className="rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-neutral-300 transition-colors hover:bg-neutral-700">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-serif text-2xl font-bold text-white">Pedido</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <div className={card}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-300">Dados do pedido</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-500">Data</dt><dd className="font-medium text-white">{new Date(order.created_at).toLocaleString('pt-BR')}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Pagamento</dt><dd className="font-medium text-white">{order.payment_method || 'pix'}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Cliente</dt><dd className="font-medium text-white">{order.customer_name || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">WhatsApp</dt><dd className="font-medium text-white">{order.customer_whatsapp || '—'}</dd></div>
            </dl>
          </div>

          <div className={card}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-300">Alterar status</h2>
            <div className="flex flex-col gap-3">
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status] || 'bg-neutral-800 text-neutral-400'}`}>
                Status atual: {order.status}
              </span>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-500"
              >
                {statusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
              <button
                onClick={handleSaveStatus}
                disabled={saving || newStatus === order.status}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-100 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white disabled:opacity-50"
              >
                <Save size={16} /> {saving ? 'Salvando...' : 'Salvar status'}
              </button>
            </div>
          </div>

          {order.notes && (
            <div className={card}>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-neutral-300">Observacoes</h2>
              <p className="text-sm text-neutral-400">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className={card}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-300">Itens do pedido</h2>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-neutral-800 pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{item.product_name}</p>
                    <p className="text-xs text-neutral-500">
                      {item.quantity}x — {formatPrice(item.unit_price)}
                      {item.size && ` — Tam: ${item.size}`}
                      {item.color && ` — Cor: ${item.color}`}
                    </p>
                  </div>
                  <span className="font-bold text-white">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-neutral-800 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="font-bold text-white">Total</span>
                <span className="font-bold text-white">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
