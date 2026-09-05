import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Eye,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';

interface DashboardStats {
  sales: number;
  orders: number;
  customers: number;
  products: number;
  active_products: number;
  visitors: number;
  leads: number;
  whatsapp_clicks: number;
}

interface DailyPoint {
  date: string;
  visitors: number;
  leads: number;
  orders: number;
}

const formatCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

const card = 'rounded-xl border border-neutral-800 bg-neutral-900';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          adminApi.get<DashboardStats>('/dashboard'),
          adminApi.get<{ daily: DailyPoint[] }>('/analytics?days=30'),
        ]);
        if (cancelled) return;
        setStats(dashRes);
        setDaily(analyticsRes.daily || []);
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-300" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 p-12 text-center">
          <p className="text-sm font-medium text-red-400">Nao foi possivel carregar os dados.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-neutral-100 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white"
          >
            Tentar novamente
          </button>
        </div>
      </AdminLayout>
    );
  }

  const cards = [
    { label: 'Faturamento', value: formatCurrency(stats?.sales || 0), icon: DollarSign, color: 'text-green-400' },
    { label: 'Pedidos', value: stats?.orders || 0, icon: ShoppingCart, color: 'text-blue-400' },
    { label: 'Clientes', value: stats?.customers || 0, icon: Users, color: 'text-purple-400' },
    { label: 'Leads', value: stats?.leads || 0, icon: TrendingUp, color: 'text-orange-400' },
    { label: 'Produtos', value: stats?.products || 0, icon: Package, color: 'text-neutral-300' },
    { label: 'Visitantes', value: stats?.visitors || 0, icon: Eye, color: 'text-cyan-400' },
    { label: 'Cliques WhatsApp', value: stats?.whatsapp_clicks || 0, icon: MessageCircle, color: 'text-green-500' },
  ];

  const maxVisitors = Math.max(...daily.map((d) => d.visitors), 1);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">Visao geral da loja</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`${card} p-4 transition-colors hover:border-neutral-700`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">{c.label}</span>
                <Icon size={18} className={c.color} />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className={`${card} mt-6 p-6`}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
          Visitantes ultimos 30 dias
        </h2>
        <div className="mt-6 flex h-48 items-end gap-1">
          {daily.map((point) => (
            <div
              key={point.date}
              className="group relative flex flex-1 flex-col items-center justify-end"
              style={{ height: '100%' }}
            >
              <div
                className="w-full rounded-t bg-neutral-700 transition-colors group-hover:bg-neutral-600"
                style={{
                  height: `${(point.visitors / maxVisitors) * 100}%`,
                  minHeight: point.visitors > 0 ? '4px' : '0',
                }}
              />
              <span className="pointer-events-none absolute -top-7 hidden whitespace-nowrap rounded bg-neutral-800 px-2 py-1 text-xs text-white group-hover:block">
                {formatDate(point.date)}: {point.visitors}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-xs text-neutral-500">
          <span>{formatDate(daily[0]?.date || '')}</span>
          <span>{formatDate(daily[daily.length - 1]?.date || '')}</span>
        </div>
      </div>
    </AdminLayout>
  );
}
