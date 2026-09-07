import { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Save, X, Copy, BarChart3, ExternalLink, Loader2, ChevronLeft } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';

interface ShortLink {
  id: string;
  slug: string;
  name: string;
  destination_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface LinkStats {
  total: number;
  unique: number;
  today: number;
  last7: number;
  last30: number;
  last_click: string | null;
  referrers: [string, number][];
  devices: [string, number][];
  countries: [string, number][];
}

const card = 'rounded-xl border border-neutral-800 bg-neutral-900';
const inputClass = 'w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-500';
const labelClass = 'mb-1.5 block text-xs font-semibold text-neutral-400';

const emptyForm = { name: '', slug: '', destination_url: '', active: true };

export default function AdminLinks() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [statsLink, setStatsLink] = useState<ShortLink | null>(null);
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { loadLinks(); }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get<ShortLink[]>('/short-links');
      setLinks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar links');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (link: ShortLink) => {
    setForm({ name: link.name, slug: link.slug, destination_url: link.destination_url, active: link.active });
    setEditingId(link.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Informe um nome'); return; }
    if (!form.destination_url.trim()) { setError('Informe a URL de destino'); return; }

    setSaving(true); setError(null);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      destination_url: form.destination_url.trim(),
      active: form.active,
    };

    try {
      if (editingId) {
        await adminApi.put(`/short-links/${editingId}`, payload);
      } else {
        await adminApi.post('/short-links', payload);
      }
      resetForm();
      await loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (link: ShortLink) => {
    try {
      await adminApi.put(`/short-links/${link.id}`, { active: !link.active });
      setLinks((prev) => prev.map((l) => l.id === link.id ? { ...l, active: !l.active } : l));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  const deleteLink = async (link: ShortLink) => {
    if (!confirm(`Excluir "${link.name}"?`)) return;
    try {
      await adminApi.delete(`/short-links/${link.id}`);
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const openStats = async (link: ShortLink) => {
    setStatsLink(link);
    setStatsLoading(true);
    setStats(null);
    try {
      const data = await adminApi.get<LinkStats>(`/short-links/${link.id}/stats`);
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/go/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
        </div>
      </AdminLayout>
    );
  }

  if (statsLink) {
    return (
      <AdminLayout>
        <button onClick={() => setStatsLink(null)} className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
          <ChevronLeft size={16} /> Voltar
        </button>
        <h1 className="font-serif text-2xl font-bold text-white">Estatísticas — {statsLink.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">/go/{statsLink.slug}</p>

        {statsLoading ? (
          <div className="mt-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-neutral-600" /></div>
        ) : stats ? (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {[
                { label: 'Total', value: stats.total },
                { label: 'Únicos', value: stats.unique },
                { label: 'Hoje', value: stats.today },
                { label: '7 dias', value: stats.last7 },
                { label: '30 dias', value: stats.last30 },
                { label: 'Último clique', value: stats.last_click ? new Date(stats.last_click).toLocaleDateString('pt-BR') : '—' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">{s.label}</span>
                  <p className="mt-2 text-xl font-bold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            {stats.referrers.length > 0 && (
              <div className={card + ' p-6'}>
                <h3 className="mb-3 text-sm font-bold text-neutral-300">Origem (Referrers)</h3>
                <div className="space-y-2">
                  {stats.referrers.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">{name}</span>
                      <span className="font-bold text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {stats.devices.length > 0 && (
                <div className={card + ' p-6'}>
                  <h3 className="mb-3 text-sm font-bold text-neutral-300">Dispositivos</h3>
                  <div className="space-y-2">
                    {stats.devices.map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-400 capitalize">{name}</span>
                        <span className="font-bold text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {stats.countries.length > 0 && (
                <div className={card + ' p-6'}>
                  <h3 className="mb-3 text-sm font-bold text-neutral-300">Países</h3>
                  <div className="space-y-2">
                    {stats.countries.map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-400">{name}</span>
                        <span className="font-bold text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-8 text-sm text-neutral-500">Sem dados disponíveis.</p>
        )}
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Links</h1>
          <p className="mt-1 text-sm text-neutral-400">Links curtos com estatísticas</p>
        </div>
        {!showForm && (
          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white">
            <Plus size={16} /> Novo link
          </button>
        )}
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm font-medium text-red-400">{error}</div>}

      {showForm && (
        <form onSubmit={handleSave} className={card + ' mb-8 p-6'}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">{editingId ? 'Editar link' : 'Novo link'}</h2>
            <button type="button" onClick={resetForm} className="text-neutral-500 hover:text-white"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Nome *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="Ex: Promoção Instagram" />
            </div>
            <div>
              <label className={labelClass}>Slug (opcional)</label>
              <input type="text" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} className={inputClass} placeholder="promocao-instagram" />
              <p className="mt-1 text-xs text-neutral-500">Se vazio, será gerado automaticamente a partir do nome.</p>
            </div>
            <div>
              <label className={labelClass}>URL de destino *</label>
              <input type="text" required value={form.destination_url} onChange={(e) => setForm((p) => ({ ...p, destination_url: e.target.value }))} className={inputClass} placeholder="https://exemplo.com/produto" />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} className="h-4 w-4 rounded border-neutral-700 bg-neutral-800" />
                <span className="text-sm text-neutral-300">Ativar imediatamente</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" onClick={resetForm} className="rounded-lg border border-neutral-700 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:bg-neutral-800">Cancelar</button>
            </div>
          </div>
        </form>
      )}

      {links.length > 0 ? (
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.id} className={`flex flex-col gap-3 ${card} p-4 sm:flex-row sm:items-center ${link.active ? '' : 'opacity-60'}`}>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{link.name}</p>
                <p className="text-xs text-neutral-500">/go/{link.slug} → {link.destination_url}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${link.active ? 'bg-green-950/50 text-green-400' : 'bg-neutral-800 text-neutral-500'}`}>
                  {link.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => copyLink(link.slug)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800" aria-label="Copiar link" title="Copiar link">
                  {copied === link.slug ? <span className="text-xs text-green-400">OK</span> : <Copy size={15} />}
                </button>
                <a href={`${window.location.origin}/go/${link.slug}`} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800" aria-label="Abrir link" title="Abrir link">
                  <ExternalLink size={15} />
                </a>
                <button onClick={() => openStats(link)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800" aria-label="Estatísticas" title="Estatísticas">
                  <BarChart3 size={15} />
                </button>
                <button onClick={() => openEdit(link)} className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800">Editar</button>
                <button onClick={() => toggleActive(link)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800" aria-label={link.active ? 'Desativar' : 'Ativar'} title={link.active ? 'Desativar' : 'Ativar'}>
                  {link.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => deleteLink(link)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-colors hover:bg-red-950/40 hover:text-red-400" aria-label="Excluir" title="Excluir">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${card} p-12 text-center`}>
          <ExternalLink size={32} className="mx-auto text-neutral-600" />
          <p className="mt-4 text-sm text-neutral-500">Nenhum link cadastrado.</p>
          <p className="text-xs text-neutral-600">Use o botão acima para adicionar.</p>
        </div>
      )}
    </AdminLayout>
  );
}
