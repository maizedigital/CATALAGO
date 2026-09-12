import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ExternalLink, Settings, Loader2, CircleDot } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/AdminLayout';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  status: string;
  whatsapp: string | null;
  created_at: string;
}

export default function AdminTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('catalogs')
          .select('id, name, slug, domain, status, whatsapp, created_at')
          .order('created_at', { ascending: true });
        if (queryError) throw queryError;
        if (!cancelled) setTenants(data || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-white">Clientes</h1>
        <p className="mt-1 text-sm text-neutral-400">Catálogos ativos na plataforma Enviey</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
        </div>
      ) : tenants.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-12 text-center">
          <p className="text-sm text-neutral-500">Nenhum cliente cadastrado.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-neutral-700"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800">
                    <Building2 size={20} className="text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{tenant.name}</h3>
                    <p className="text-xs text-neutral-500">/{tenant.slug}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  tenant.status === 'active'
                    ? 'bg-green-950/40 text-green-400'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  <CircleDot size={10} />
                  {tenant.status === 'active' ? 'Ativo' : tenant.status}
                </span>
              </div>

              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Domínio</dt>
                  <dd className="text-neutral-300">{tenant.domain || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">WhatsApp</dt>
                  <dd className="text-neutral-300">{tenant.whatsapp || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Criado em</dt>
                  <dd className="text-neutral-300">
                    {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex gap-2">
                <a
                  href={`/${tenant.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800"
                >
                  <ExternalLink size={14} /> Catálogo
                </a>
                <Link
                  to="/admin/produtos"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800"
                >
                  <Settings size={14} /> Painel
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
