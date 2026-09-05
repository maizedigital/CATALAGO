import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserPlus, ShoppingCart, DollarSign, TrendingUp, MessageCircle, Repeat,
  Search, Download, Trash2, Eye,
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';
import { formatPrice } from '@/lib/format';

interface CRMDashboard {
  total_customers: number;
  total_leads: number;
  new_leads: number;
  recurring_customers: number;
  orders: number;
  revenue: number;
  avg_ticket: number;
  whatsapp_clicks: number;
}

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

const formatCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const customerStatusFilters = ['Todos', 'novo', 'interessado', 'cliente', 'cliente recorrente', 'inativo'];
const leadStatusFilters = ['Todos', 'novo', 'interessado', 'cliente', 'inativo'];

const statusColors: Record<string, string> = {
  'novo': 'bg-blue-50 text-blue-600',
  'interessado': 'bg-orange-50 text-orange-600',
  'cliente': 'bg-green-50 text-green-600',
  'cliente recorrente': 'bg-purple-50 text-purple-600',
  'inativo': 'bg-neutral-100 text-neutral-500',
};

type Tab = 'dashboard' | 'clientes' | 'leads';

export default function AdminCRM() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [dashboard, setDashboard] = useState<CRMDashboard | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const loadDashboard = useCallback(async () => {
    try {
      const res = await adminApi.get<CRMDashboard>('/crm-dashboard');
      setDashboard(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    }
  }, []);

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

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.get<Lead[]>('/leads');
      setLeads(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setSearch('');
    setStatusFilter('Todos');
    setError(null);
    if (newTab === 'clientes') loadCustomers();
    else if (newTab === 'leads') loadLeads();
    else loadDashboard();
  };

  const handleUpdateLeadStatus = async (lead: Lead, newStatus: string) => {
    try {
      await adminApi.put(`/leads/${lead.id}`, { status: newStatus });
      setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: newStatus } : l));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (!confirm(`Excluir lead "${name}"?`)) return;
    try {
      await adminApi.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const exportCSV = () => {
    const headers = ['Nome', 'WhatsApp', 'Cidade', 'Status', 'Data cadastro', 'Ultima compra', 'Total gasto', 'Pedidos'];
    const rows = filteredCustomers.map((c) => [
      c.name, c.whatsapp || '', c.city || '', c.status || '',
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

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch = c.name?.toLowerCase().includes(q) || c.whatsapp?.toLowerCase().includes(q) || c.cpf?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLeads = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch = l.name?.toLowerCase().includes(q) || l.whatsapp?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'Todos' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const cards = [
    { label: 'Total de clientes', value: dashboard?.total_customers || 0, icon: Users, color: 'text-purple-600' },
    { label: 'Total de leads', value: dashboard?.total_leads || 0, icon: UserPlus, color: 'text-orange-600' },
    { label: 'Novos leads', value: dashboard?.new_leads || 0, icon: TrendingUp, color: 'text-orange-500' },
    { label: 'Clientes recorrentes', value: dashboard?.recurring_customers || 0, icon: Repeat, color: 'text-blue-600' },
    { label: 'Pedidos', value: dashboard?.orders || 0, icon: ShoppingCart, color: 'text-neutral-900' },
    { label: 'Faturamento', value: formatCurrency(dashboard?.revenue || 0), icon: DollarSign, color: 'text-green-600' },
    { label: 'Ticket medio', value: formatCurrency(dashboard?.avg_ticket || 0), icon: DollarSign, color: 'text-green-500' },
    { label: 'Cliques WhatsApp', value: dashboard?.whatsapp_clicks || 0, icon: MessageCircle, color: 'text-green-500' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-neutral-900">CRM</h1>
        <p className="mt-1 text-sm text-neutral-500">Central de relacionamento com clientes</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-neutral-200">
        {([
          { key: 'dashboard', label: 'Visao Geral' },
          { key: 'clientes', label: 'Clientes' },
          { key: 'leads', label: 'Leads' },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-b-2 border-neutral-900 text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">{error}</div>
      )}

      {/* Dashboard Tab */}
      {tab === 'dashboard' && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-lg border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                      {card.label}
                    </span>
                    <Icon size={18} className={card.color} />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-neutral-900">{card.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <button
              onClick={() => handleTabChange('clientes')}
              className="rounded-lg border border-neutral-200 bg-white p-6 text-left transition-shadow hover:shadow-sm"
            >
              <Users size={24} className="text-purple-600" />
              <h2 className="mt-3 text-sm font-bold uppercase tracking-wider text-neutral-900">Clientes</h2>
              <p className="mt-1 text-xs text-neutral-500">Ver todos os clientes e seus historicos</p>
            </button>
            <button
              onClick={() => handleTabChange('leads')}
              className="rounded-lg border border-neutral-200 bg-white p-6 text-left transition-shadow hover:shadow-sm"
            >
              <UserPlus size={24} className="text-orange-600" />
              <h2 className="mt-3 text-sm font-bold uppercase tracking-wider text-neutral-900">Leads</h2>
              <p className="mt-1 text-xs text-neutral-500">Gerenciar leads capturados no site</p>
            </button>
          </div>
        </>
      )}

      {/* Clientes Tab */}
      {tab === 'clientes' && (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
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
                {customerStatusFilters.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 border border-neutral-200 px-5 py-3 text-xs font-bold uppercase tracking-widest text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <Download size={16} /> Exportar CSV
            </button>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
            </div>
          ) : filteredCustomers.length === 0 ? (
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
                  {filteredCustomers.map((c) => (
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
        </>
      )}

      {/* Leads Tab */}
      {tab === 'leads' && (
        <>
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
              {leadStatusFilters.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
            </div>
          ) : filteredLeads.length === 0 ? (
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
                    <th className="px-4 py-3 text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
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
                          onChange={(e) => handleUpdateLeadStatus(lead, e.target.value)}
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
                          onClick={() => handleDeleteLead(lead.id, lead.name)}
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
        </>
      )}
    </AdminLayout>
  );
}
