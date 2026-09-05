import { useEffect, useState } from 'react';
import { Eye, ShoppingCart, MessageCircle, Package, TrendingDown, TrendingUp, Users, UserPlus } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';

interface AnalyticsData {
  visitors: number;
  new_leads: number;
  new_customers: number;
  orders: number;
  event_counts: Record<string, number>;
}

interface RankingItem { name: string; count: number; }
interface Rankings {
  most_viewed: RankingItem[];
  most_carted: RankingItem[];
  most_whatsapp: RankingItem[];
  most_sold: RankingItem[];
}

const card = 'rounded-xl border border-neutral-800 bg-neutral-900 p-6';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [rankings, setRankings] = useState<Rankings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, r] = await Promise.all([
          adminApi.get<AnalyticsData>(`/analytics?days=${days}`),
          adminApi.get<Rankings>('/rankings'),
        ]);
        if (cancelled) return;
        setAnalytics(a);
        setRankings(r);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [days]);

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
          <button onClick={() => window.location.reload()} className="mt-6 rounded-lg bg-neutral-100 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white">
            Tentar novamente
          </button>
        </div>
      </AdminLayout>
    );
  }

  const ec = analytics?.event_counts || {};
  const funnel = [
    { label: 'Visitantes', value: analytics?.visitors || 0, icon: Eye, color: 'text-cyan-400' },
    { label: 'Leads', value: analytics?.new_leads || 0, icon: UserPlus, color: 'text-orange-400' },
    { label: 'Carrinhos', value: ec['add_to_cart'] || 0, icon: ShoppingCart, color: 'text-blue-400' },
    { label: 'Checkouts', value: ec['checkout_started'] || 0, icon: Package, color: 'text-purple-400' },
    { label: 'Clientes', value: analytics?.new_customers || 0, icon: Users, color: 'text-green-400' },
  ];

  const maxFunnel = Math.max(...funnel.map((f) => f.value), 1);

  const rankingSections = [
    { title: 'Mais visualizados', items: rankings?.most_viewed || [], icon: Eye },
    { title: 'Mais adicionados ao carrinho', items: rankings?.most_carted || [], icon: ShoppingCart },
    { title: 'Mais clicados no WhatsApp', items: rankings?.most_whatsapp || [], icon: MessageCircle },
    { title: 'Mais vendidos', items: rankings?.most_sold || [], icon: Package },
  ];

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-neutral-400">Comportamento e conversao</p>
        </div>
        <select
          value={days}
          onChange={(e) => { setDays(parseInt(e.target.value, 10)); setLoading(true); }}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-neutral-600"
        >
          <option value={7}>Ultimos 7 dias</option>
          <option value={30}>Ultimos 30 dias</option>
          <option value={90}>Ultimos 90 dias</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Visitantes', value: analytics?.visitors || 0, icon: Eye, color: 'text-cyan-400' },
          { label: 'Novos leads', value: analytics?.new_leads || 0, icon: UserPlus, color: 'text-orange-400' },
          { label: 'Cliques WhatsApp', value: ec['whatsapp_click'] || 0, icon: MessageCircle, color: 'text-green-500' },
          { label: 'Pedidos', value: analytics?.orders || 0, icon: Package, color: 'text-blue-400' },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">{c.label}</span>
                <Icon size={18} className={c.color} />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className={`${card} mt-6`}>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-300">Funil de conversao</h2>
        <div className="space-y-3">
          {funnel.map((stage, i) => {
            const Icon = stage.icon;
            const pct = (stage.value / maxFunnel) * 100;
            const prevVal = i > 0 ? funnel[i - 1].value : 0;
            const drop = prevVal > 0 ? ((prevVal - stage.value) / prevVal) * 100 : 0;
            return (
              <div key={stage.label} className="flex items-center gap-4">
                <div className="flex w-40 items-center gap-2 text-sm font-medium text-neutral-300">
                  <Icon size={16} className={stage.color} /> {stage.label}
                </div>
                <div className="flex-1">
                  <div className="h-8 rounded bg-neutral-800">
                    <div className="flex h-8 items-center rounded bg-neutral-600 px-3 text-xs font-bold text-white transition-all" style={{ width: `${Math.max(pct, 8)}%` }}>
                      {stage.value}
                    </div>
                  </div>
                </div>
                {i > 0 && drop > 0 && (
                  <span className="flex w-20 items-center gap-1 text-xs text-red-400"><TrendingDown size={12} /> -{Math.round(drop)}%</span>
                )}
                {i > 0 && drop === 0 && prevVal > 0 && (
                  <span className="flex w-20 items-center gap-1 text-xs text-green-400"><TrendingUp size={12} /> 0%</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rankingSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className={card}>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-300">
                <Icon size={16} /> {section.title}
              </h3>
              {section.items.length === 0 ? (
                <p className="text-xs text-neutral-600">Sem dados ainda.</p>
              ) : (
                <ol className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={item.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-neutral-400">{i + 1}</span>
                        <span className="text-neutral-300">{item.name}</span>
                      </span>
                      <span className="font-bold text-white">{item.count}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
