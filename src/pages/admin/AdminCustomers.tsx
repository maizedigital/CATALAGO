import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';
import { formatPrice } from '@/lib/format';

interface Customer {
  id: string;
  name: string;
  whatsapp: string | null;
  cpf: string | null;
  city: string | null;
  district: string | null;
  status: string | null;
  origin: string | null;
  created_at: string;
  last_contact: string | null;
  last_purchase: string | null;
  total_spent: number | null;
  orders_count: number | null;
}

const statusFilters = ['Todos', 'novo', 'interessado', 'cliente', 'cliente recorrente', 'inativo'];
const statusColors: Record<string, string> = {
  'novo': 'bg-blue-50 text-blue-600',
  'interessado': 'bg-orange-50 text-orange-600',
  'cliente': 'bg-green-50 text-green-600',
  'cliente recorrente': 'bg-purple-50 text-purple-600',
  'inativo': 'bg-neutral-100 text-neutral-500',
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.get<Customer[]>('/customers');
        if (!cancelled) setCustomers(data || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name?.toLowerCase().includes(q) ||
      c.whatsapp?.toLowerCase().includes(q) ||
      c.cpf?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Nome', 'WhatsApp', 'Cidade', 'Status', 'Data cadastro', 'Ultima compra', 'Total gasto', 'Pedidos'];
    const rows = filtered.map((c) => [
      c.name,
      c.whatsapp || '',
      c.city || '',
      c.status || '',
      new Date(c.created_at).toLocaleDateString('pt-BR'),
      c.last_purchase ? new Date(c.last_purchase).toLocaleDateString('pt-BR') : '',
      c.total_spent || 0,
      c.orders_count || 0,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'clientes-mb.csv';
    link.click();
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

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900">Clientes</h1>
          <p className="mt-1 text-sm text-neutral-500">{customers.length} clientes cadastrados</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 border border-neutral-200 px-5 py-3 text-xs font-bold uppercase tracking-widest text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, WhatsApp, CPF..."
            className="w-full border border-neutral-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-neutral-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
        >
          {statusFilters.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">{error}</div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <p className="text-sm text-neutral-500">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-600">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="hidden px-4 py-3 md:table-cell">Cidade</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 sm:table-cell">Cadastro</th>
                <th className="hidden px-4 py-3 lg:table-cell">Ultima compra</th>
                <th className="px-4 py-3">Total gasto</th>
                <th className="hidden px-4 py-3 sm:table-cell">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link to={`/admin/clientes/${c.id}`} className="font-medium text-neutral-900 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{c.whatsapp || '—'}</td>
                  <td className="hidden px-4 py-3 text-neutral-500 md:table-cell">{c.city || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[c.status || 'novo'] || 'bg-neutral-100 text-neutral-500'}`}>
                      {c.status || 'novo'}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-500 lg:table-cell">
                    {c.last_purchase ? new Date(c.last_purchase).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900">{formatPrice(c.total_spent || 0)}</td>
                  <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">{c.orders_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
