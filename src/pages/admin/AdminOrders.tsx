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
  'novo': 'bg-blue-50 text-blue-600',
  'aguardando pagamento': 'bg-yellow-50 text-yellow-600',
  'pago': 'bg-green-50 text-green-600',
  'em preparacao': 'bg-purple-50 text-purple-600',
  'enviado': 'bg-cyan-50 text-cyan-600',
  'concluido': 'bg-green-100 text-green-700',
  'cancelado': 'bg-red-50 text-red-600',
};

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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-neutral-900">Pedidos</h1>
        <p className="mt-1 text-sm text-neutral-500">{orders.length} pedidos</p>
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
        >
          <option value="Todos">Todos os status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">{error}</div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <p className="text-sm text-neutral-500">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-600">
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
                <tr key={order.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {order.customer_name || '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
                    {order.customer_whatsapp || '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-500 md:table-cell">
                    {order.order_items?.length || 0} itens
                  </td>
                  <td className="px-4 py-3 font-bold text-neutral-900">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || 'bg-neutral-100 text-neutral-500'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/pedidos/${order.id}`}
                      className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900"
                    >
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
