import { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';

interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  cpf: string | null;
  city: string | null;
  origin: string | null;
  status: string;
  product_interest: string | null;
  last_interaction: string | null;
  created_at: string;
}

const statusFilters = ['Todos', 'novo', 'interessado', 'cliente', 'inativo'];
const statusColors: Record<string, string> = {
  'novo': 'bg-blue-50 text-blue-600',
  'interessado': 'bg-orange-50 text-orange-600',
  'cliente': 'bg-green-50 text-green-600',
  'inativo': 'bg-neutral-100 text-neutral-500',
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get<Lead[]>('/leads');
      setLeads(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLeads(); }, []);

  const handleUpdateStatus = async (lead: Lead, newStatus: string) => {
    try {
      await adminApi.put(`/leads/${lead.id}`, { status: newStatus });
      setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: newStatus } : l));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir lead "${name}"?`)) return;
    try {
      await adminApi.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch = l.name?.toLowerCase().includes(q) || l.whatsapp?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'Todos' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="font-serif text-2xl font-bold text-neutral-900">Leads</h1>
        <p className="mt-1 text-sm text-neutral-500">{leads.length} leads capturados</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou WhatsApp..."
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
          <p className="text-sm text-neutral-500">Nenhum lead encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-600">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="hidden px-4 py-3 sm:table-cell">Data</th>
                <th className="px-4 py-3">Origem</th>
                <th className="hidden px-4 py-3 md:table-cell">Produto de interesse</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{lead.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{lead.whatsapp}</td>
                  <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-700">
                      {lead.origin || 'site'}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-500 md:table-cell">{lead.product_interest || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateStatus(lead, e.target.value)}
                      className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium outline-none cursor-pointer ${statusColors[lead.status] || 'bg-neutral-100 text-neutral-500'}`}
                    >
                      <option value="novo">novo</option>
                      <option value="interessado">interessado</option>
                      <option value="cliente">cliente</option>
                      <option value="inativo">inativo</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(lead.id, lead.name)}
                      className="rounded p-2 text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
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
