import { useEffect, useState } from 'react';
import { Users, UserPlus, ShoppingCart, DollarSign, TrendingUp, MessageCircle, Repeat } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';

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

const formatCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminCRM() {
  const [data, setData] = useState<CRMDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminApi.get<CRMDashboard>('/crm-dashboard');
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center rounded-lg bg-red-50 p-12 text-center">
          <p className="text-sm font-medium text-red-600">Nao foi possivel carregar os dados.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-neutral-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            Tentar novamente
          </button>
        </div>
      </AdminLayout>
    );
  }

  const cards = [
    { label: 'Total de clientes', value: data?.total_customers || 0, icon: Users, color: 'text-purple-600' },
    { label: 'Total de leads', value: data?.total_leads || 0, icon: UserPlus, color: 'text-orange-600' },
    { label: 'Novos leads', value: data?.new_leads || 0, icon: TrendingUp, color: 'text-orange-500' },
    { label: 'Clientes recorrentes', value: data?.recurring_customers || 0, icon: Repeat, color: 'text-blue-600' },
    { label: 'Pedidos', value: data?.orders || 0, icon: ShoppingCart, color: 'text-neutral-900' },
    { label: 'Faturamento', value: formatCurrency(data?.revenue || 0), icon: DollarSign, color: 'text-green-600' },
    { label: 'Ticket medio', value: formatCurrency(data?.avg_ticket || 0), icon: DollarSign, color: 'text-green-500' },
    { label: 'Cliques WhatsApp', value: data?.whatsapp_clicks || 0, icon: MessageCircle, color: 'text-green-500' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-neutral-900">CRM</h1>
        <p className="mt-1 text-sm text-neutral-500">Central de relacionamento com clientes</p>
      </div>

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
        <a
          href="/admin/clientes"
          className="rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-sm"
        >
          <Users size={24} className="text-purple-600" />
          <h2 className="mt-3 text-sm font-bold uppercase tracking-wider text-neutral-900">Clientes</h2>
          <p className="mt-1 text-xs text-neutral-500">Ver todos os clientes e seus historicos</p>
        </a>
        <a
          href="/admin/leads"
          className="rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-sm"
        >
          <UserPlus size={24} className="text-orange-600" />
          <h2 className="mt-3 text-sm font-bold uppercase tracking-wider text-neutral-900">Leads</h2>
          <p className="mt-1 text-xs text-neutral-500">Gerenciar leads capturados no site</p>
        </a>
      </div>
    </AdminLayout>
  );
}
