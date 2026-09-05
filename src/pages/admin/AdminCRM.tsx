import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, X, MessageCircle, Pencil, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';

interface Customer {
  id: string;
  name: string;
  whatsapp: string | null;
  cpf: string | null;
  created_at: string;
}

function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 || digits.length === 10) {
    digits = '55' + digits;
  }
  return digits;
}

function waLink(phone: string | null): string {
  if (!phone) return '#';
  return `https://wa.me/${normalizePhone(phone)}`;
}

export default function AdminCRM() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

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

  const openAdd = () => {
    setFormName('');
    setFormPhone('');
    setFormError(null);
    setShowAdd(true);
  };

  const openEdit = (c: Customer) => {
    setFormName(c.name);
    setFormPhone(c.whatsapp || '');
    setFormError(null);
    setShowEdit(c);
  };

  const closeModals = () => {
    setShowAdd(false);
    setShowEdit(null);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formPhone.trim()) {
      setFormError('Nome e telefone são obrigatórios');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const phone = formPhone.replace(/\D/g, '');
      if (showEdit) {
        await adminApi.put(`/customers/${showEdit.id}`, {
          name: formName.trim(),
          whatsapp: phone,
        });
      } else {
        const { data: existing } = await (async () => {
          return null;
        })();
        void existing;
        await adminApi.post('/customers', {
          name: formName.trim(),
          whatsapp: phone,
          cpf: null,
          origin: 'manual',
          status: 'novo',
        });
      }
      closeModals();
      await loadCustomers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const card = 'rounded-xl border border-neutral-800 bg-neutral-900';

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">CRM</h1>
          <p className="mt-1 text-sm text-neutral-400">Cadastro de clientes</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-5 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white"
        >
          <Plus size={16} /> Adicionar cliente
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone ou CPF..."
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-3 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-600"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm font-medium text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${card} p-12 text-center`}>
          <p className="text-sm text-neutral-500">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-500" style={{ background: 'rgb(28,28,28)' }}>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="hidden px-4 py-3 sm:table-cell">CPF</th>
                <th className="hidden px-4 py-3 md:table-cell">Cadastro</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-neutral-800/60 last:border-0 transition-colors hover:bg-neutral-800/40">
                  <td className="px-4 py-3">
                    <Link to={`/admin/clientes/${c.id}`} className="font-medium text-white hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{c.whatsapp || '—'}</td>
                  <td className="hidden px-4 py-3 text-neutral-400 sm:table-cell">{c.cpf || '—'}</td>
                  <td className="hidden px-4 py-3 text-neutral-500 md:table-cell">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <a
                        href={waLink(c.whatsapp)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-2 text-green-500 transition-colors hover:bg-green-950/40"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showAdd || showEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModals} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {showEdit ? 'Editar cliente' : 'Adicionar cliente'}
              </h2>
              <button onClick={closeModals} className="text-neutral-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">Nome *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-500"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">Telefone / WhatsApp *</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
              {formError && (
                <p className="text-sm text-red-400">{formError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={closeModals}
                  className="rounded-lg border border-neutral-700 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:bg-neutral-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
