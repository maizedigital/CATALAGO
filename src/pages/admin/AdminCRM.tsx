import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Users } from 'lucide-react';
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

export default function AdminCRM() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.get<Customer[]>('/customers');
      setCustomers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.whatsapp?.toLowerCase().includes(q) ||
      c.cpf?.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const headers = ['Nome', 'WhatsApp', 'CPF', 'Cidade', 'Status', 'Data cadastro', 'Ultima compra', 'Total gasto', 'Pedidos'];
    const rows = filtered.map((c) => [
      c.name, c.whatsapp || '', c.cpf || '', c.city || '', c.status || '',
      new Date(c.created_at).toLocaleDateString('pt-BR'),
      c.last_purchase ? new Date(c.last_purchase).toLocaleDateString('pt-BR') : '',
      c.total_spent || 0, c.orders_count || 0,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'clientes-mb.csv';
    link.click();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">CRM</h1>
          <p className="mt-1 text-sm text-neutral-400">Cadastro de clientes</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 border border-neutral-700 px-5 py-3 text-xs font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:bg-neutral-800"
        >
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, WhatsApp ou CPF..."
            className="w-full border border-neutral-700 bg-neutral-800 py-3 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-950/50 border border-red-800 p-4 text-sm font-medium text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-300" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-12 text-center">
          <Users size={32} className="mx-auto text-neutral-600" />
          <p className="mt-4 text-sm text-neutral-500">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-850 text-xs font-bold uppercase tracking-wider text-neutral-400" style={{ background: 'rgb(30,30,30)' }}>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">CPF</th>
                <th className="hidden px-4 py-3 sm:table-cell">Cadastro</th>
                <th className="hidden px-4 py-3 md:table-cell">Ultima compra</th>
                <th className="hidden px-4 py-3 lg:table-cell">Total gasto</th>
                <th className="hidden px-4 py-3 lg:table-cell">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-neutral-800 last:border-0 transition-colors hover:bg-neutral-800">
                  <td className="px-4 py-3">
                    <Link to={`/admin/clientes/${c.id}`} className="font-medium text-white hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{c.whatsapp || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400">{c.cpf || '—'}</td>
                  <td className="hidden px-4 py-3 text-neutral-400 sm:table-cell">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-400 md:table-cell">
                    {c.last_purchase ? new Date(c.last_purchase).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="hidden px-4 py-3 font-medium text-white lg:table-cell">{formatPrice(c.total_spent || 0)}</td>
                  <td className="hidden px-4 py-3 text-neutral-400 lg:table-cell">{c.orders_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
