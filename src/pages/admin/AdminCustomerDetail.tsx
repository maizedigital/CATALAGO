import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, ShoppingCart, Eye, Package } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/config/site';

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

interface CustomerEvent {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  product_name: string | null;
  created_at: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  payment_method: string;
  created_at: string;
  order_items: { product_name: string; quantity: number; unit_price: number }[];
}

const eventLabels: Record<string, string> = {
  page_view: 'Visitou uma pagina',
  product_view: 'Visualizou produto',
  add_to_cart: 'Adicionou ao carrinho',
  remove_from_cart: 'Removeu do carrinho',
  checkout_started: 'Iniciou checkout',
  whatsapp_click: 'Clicou no WhatsApp',
  order_placed: 'Realizou pedido',
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function AdminCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [events, setEvents] = useState<CustomerEvent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const [cust, evts, ords] = await Promise.all([
          adminApi.get<Customer>(`/customers/${id}`),
          adminApi.get<CustomerEvent[]>(`/customers/${id}/events`),
          adminApi.get<Order[]>(`/customers/${id}/orders`),
        ]);
        if (cancelled) return;
        setCustomer(cust);
        setEvents(evts || []);
        setOrders(ords || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-300" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !customer) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 p-12 text-center">
          <p className="text-sm font-medium text-red-400">{error || 'Cliente nao encontrado'}</p>
          <button
            onClick={() => navigate('/admin/crm')}
            className="mt-6 bg-neutral-800 border border-neutral-700 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-700"
          >
            Voltar para CRM
          </button>
        </div>
      </AdminLayout>
    );
  }

  const totalSpent = customer.total_spent || 0;
  const orderCount = customer.orders_count || 0;
  const avgTicket = orderCount > 0 ? totalSpent / orderCount : 0;

  const viewedProducts = new Set<string>();
  const cartedProducts = new Set<string>();
  let lastViewed = '';
  for (const e of events) {
    if (e.event_type === 'product_view' && e.product_name) {
      viewedProducts.add(e.product_name);
      lastViewed = e.product_name;
    }
    if (e.event_type === 'add_to_cart' && e.product_name) {
      cartedProducts.add(e.product_name);
    }
  }

  const whatsappLink = customer.whatsapp
    ? `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Olá ${customer.name}!`)}`
    : `https://wa.me/${siteConfig.whatsapp}`;

  const cardClass = "rounded-lg border border-neutral-800 bg-neutral-900 p-6";

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/crm')}
          className="rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-neutral-300 transition-colors hover:bg-neutral-700"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-serif text-2xl font-bold text-white">{customer.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <div className={cardClass}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-300">Informacoes</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Nome</dt>
                <dd className="font-medium text-white">{customer.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">WhatsApp</dt>
                <dd className="font-medium text-white">{customer.whatsapp || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">CPF</dt>
                <dd className="font-medium text-white">{customer.cpf || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Cidade</dt>
                <dd className="font-medium text-white">{customer.city || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Bairro</dt>
                <dd className="font-medium text-white">{customer.district || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Cadastro</dt>
                <dd className="font-medium text-white">{new Date(customer.created_at).toLocaleDateString('pt-BR')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Origem</dt>
                <dd className="font-medium text-white">{customer.origin || 'site'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Status</dt>
                <dd>
                  <span className="inline-flex rounded-full bg-blue-950 border border-blue-800 px-2 py-0.5 text-xs font-medium text-blue-400">
                    {customer.status || 'novo'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className={cardClass}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-300">Resumo</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Pedidos</dt>
                <dd className="font-bold text-white">{orderCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Total gasto</dt>
                <dd className="font-bold text-white">{formatPrice(totalSpent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Ticket medio</dt>
                <dd className="font-bold text-white">{formatPrice(avgTicket)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Ultima compra</dt>
                <dd className="font-medium text-white">
                  {customer.last_purchase ? new Date(customer.last_purchase).toLocaleDateString('pt-BR') : '—'}
                </dd>
              </div>
            </dl>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 border border-green-700 bg-green-950/30 py-3.5 text-xs font-bold uppercase tracking-widest text-green-400 transition-colors hover:bg-green-950/50"
          >
            <MessageCircle size={16} /> Abrir WhatsApp
          </a>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className={cardClass}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-300">
              Produtos de interesse
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  <Eye size={14} /> Visualizados ({viewedProducts.size})
                </p>
                <div className="space-y-1">
                  {viewedProducts.size === 0 ? (
                    <p className="text-xs text-neutral-600">Nenhum produto visualizado</p>
                  ) : (
                    Array.from(viewedProducts).slice(0, 8).map((p) => (
                      <p key={p} className="text-sm text-neutral-300">{p}</p>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  <ShoppingCart size={14} /> No carrinho ({cartedProducts.size})
                </p>
                <div className="space-y-1">
                  {cartedProducts.size === 0 ? (
                    <p className="text-xs text-neutral-600">Nenhum produto adicionado</p>
                  ) : (
                    Array.from(cartedProducts).slice(0, 8).map((p) => (
                      <p key={p} className="text-sm text-neutral-300">{p}</p>
                    ))
                  )}
                </div>
              </div>
            </div>
            {lastViewed && (
              <p className="mt-4 border-t border-neutral-800 pt-3 text-xs text-neutral-500">
                Ultimo produto visualizado: <span className="font-medium text-neutral-300">{lastViewed}</span>
              </p>
            )}
          </div>

          <div className={cardClass}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-300">Pedidos</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-neutral-600">Nenhum pedido registrado.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/admin/pedidos/${order.id}`}
                    className="block rounded-lg border border-neutral-800 bg-neutral-850 p-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800"
                    style={{ background: 'rgb(28,28,28)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-neutral-500" />
                        <span className="text-sm font-medium text-white">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="inline-flex rounded-full bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-400">
                          {order.status}
                        </span>
                      </div>
                      <span className="font-bold text-white">{formatPrice(order.total)}</span>
                    </div>
                    <div className="mt-2 text-xs text-neutral-500">
                      {order.order_items.map((item, i) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          {item.quantity}x {item.product_name}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className={cardClass}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-300">Historico</h2>
            {events.length === 0 ? (
              <p className="text-sm text-neutral-600">Nenhum evento registrado.</p>
            ) : (
              <div className="relative space-y-4 before:absolute before:left-2 before:top-2 before:h-full before:w-px before:bg-neutral-800">
                {events.slice(0, 50).map((event) => (
                  <div key={event.id} className="relative flex gap-4 pl-6">
                    <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-neutral-700 bg-neutral-900" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {eventLabels[event.event_type] || event.event_type}
                      </p>
                      {event.product_name && (
                        <p className="text-xs text-neutral-500">{event.product_name}</p>
                      )}
                      <p className="mt-0.5 text-xs text-neutral-600">{formatDateTime(event.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
