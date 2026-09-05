import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';
import { formatPrice } from '@/lib/format';

interface OrderItem {
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

const card = 'rounded-xl border border-neutral-800 bg-neutral-900';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('Todos');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.get<Order[]>('/orders');
        if (!cancelled) setOrders(data || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = statusFilter === 'Todos' ? orders : orders.filter((o) => o.status === statusFilter);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-300" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-white">Pedidos</h1>
        <p className="mt-1 text-sm text-neutral-400">{orders.length} pedidos</p>
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-neutral-600"
        >
          <option value="Todos">Todos os status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm font-medium text-red-400">{error}</div>
      )}

      {filtered.length === 0 ? (
        <div className={`${card} p-12 text-center`}>
          <p className="text-sm text-neutral-500">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-500" style={{ background: 'rgb(28,28,28)' }}>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="hidden px-4 py-3 sm:table-cell">WhatsApp</th>
                <th className="hidden px-4 py-3 md:table-cell">Itens</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-neutral-800/60 last:border-0 transition-colors hover:bg-neutral-800/40">
                  <td className="px-4 py-3 text-neutral-400">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 font-medium text-white">{order.customer_name || '—'}</td>
                  <td className="hidden px-4 py-3 text-neutral-400 sm:table-cell">{order.customer_whatsapp || '—'}</td>
                  <td className="hidden px-4 py-3 text-neutral-400 md:table-cell">{order.order_items?.length || 0} itens</td>
                  <td className="px-4 py-3 font-bold text-white">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || 'bg-neutral-800 text-neutral-400'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/pedidos/${order.id}`} className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
