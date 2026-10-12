import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Copy, Trash2, Power, GripVertical, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';
import { ADMIN_BASE } from '@/config/site';
import { formatPrice } from '@/lib/format';
import type { Product, Gender } from '@/types';

const card = 'rounded-xl border border-neutral-800 bg-neutral-900';
const inputClass = 'w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-500';

const GENDER_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'unissex', label: 'Unissex' },
];

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reordering, setReordering] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get<Product[]>('/products');
      const sorted = [...(data || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setProducts(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await adminApi.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await adminApi.put(`/products/${product.id}`, { active: !product.active });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao alterar status');
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const { id, created_at, ...rest } = product;
      void id; void created_at;
      const copy = {
        ...rest,
        sku: `${product.sku || product.barcode || ''}-copia`,
        barcode: `${product.barcode || product.sku || ''}-copia`,
        slug: `${product.slug}-copia`,
        name: `${product.name} (cópia)`,
      };
      const created = await adminApi.post<Product>('/products', copy);
      setProducts((prev) => [created, ...prev]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao duplicar');
    }
  };

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.gender.toLowerCase().includes(q);
    const matchesGender = !genderFilter || p.gender === genderFilter;
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    const matchesStatus = !statusFilter ||
      (statusFilter === 'active' && p.active !== false) ||
      (statusFilter === 'inactive' && p.active === false);
    return matchesSearch && matchesGender && matchesCategory && matchesStatus;
  });

  const saveOrder = useCallback(async (newOrder: Product[]) => {
    setReordering(true);
    try {
      const items = newOrder.map((p, idx) => ({ id: p.id, sort_order: idx }));
      await adminApi.post('/products-reorder', { items });
      setProducts(newOrder);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao reordenar');
      void load();
    } finally {
      setReordering(false);
    }
  }, []);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== dragOverId) setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const newOrder = [...filtered];
    const fromIdx = newOrder.findIndex((p) => p.id === draggedId);
    const toIdx = newOrder.findIndex((p) => p.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);

    const fullNewOrder = [...products];
    const movedIds = newOrder.map((p) => p.id);
    const nonMoved = fullNewOrder.filter((p) => !movedIds.includes(p.id));
    const reorderedAll = [...nonMoved];
    let insertIdx = 0;
    for (const item of newOrder) {
      const targetIdx = reorderedAll.findIndex((p) => p.id === item.id);
      if (targetIdx !== -1) {
        reorderedAll.splice(targetIdx, 1);
      }
      reorderedAll.splice(Math.min(insertIdx, reorderedAll.length), 0, item);
      insertIdx++;
    }
    void saveOrder(reorderedAll);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleMove = (id: string, dir: -1 | 1) => {
    const idx = filtered.findIndex((p) => p.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= filtered.length) return;
    const newOrder = [...filtered];
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];

    const fullNewOrder = [...products];
    const movedIds = newOrder.map((p) => p.id);
    const nonMoved = fullNewOrder.filter((p) => !movedIds.includes(p.id));
    const reorderedAll = [...nonMoved];
    let insertIdx = 0;
    for (const item of newOrder) {
      const targetIdx = reorderedAll.findIndex((p) => p.id === item.id);
      if (targetIdx !== -1) {
        reorderedAll.splice(targetIdx, 1);
      }
      reorderedAll.splice(Math.min(insertIdx, reorderedAll.length), 0, item);
      insertIdx++;
    }
    void saveOrder(reorderedAll);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Produtos</h1>
          <p className="mt-1 text-sm text-neutral-400">{products.length} produtos cadastrados</p>
        </div>
        <Link
          to={`${ADMIN_BASE}/produtos/novo`}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-5 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white"
        >
          <Plus size={16} /> Novo produto
        </Link>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, código..."
            className={`${inputClass} pl-10`}
          />
        </div>
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className={inputClass}>
          {GENDER_FILTERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={inputClass}>
          <option value="">Todas categorias</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
          {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm font-medium text-red-400">{error}</div>
      )}

      {reordering && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-850 p-3 text-xs text-neutral-400">
          <Loader2 size={14} className="animate-spin" /> Salvando ordem...
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-300" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${card} p-12 text-center`}>
          <p className="text-sm text-neutral-500">
            {search || genderFilter || categoryFilter || statusFilter ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}
          </p>
        </div>
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-500" style={{ background: 'rgb(28,28,28)' }}>
                <th className="px-2 py-3 w-10">Ordem</th>
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">Produto</th>
                <th className="hidden px-4 py-3 md:table-cell">Código</th>
                <th className="hidden px-4 py-3 sm:table-cell">Categoria</th>
                <th className="hidden px-4 py-3 sm:table-cell">Público</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, idx) => (
                <tr
                  key={product.id}
                  draggable
                  onDragStart={() => handleDragStart(product.id)}
                  onDragOver={(e) => handleDragOver(e, product.id)}
                  onDrop={(e) => handleDrop(e, product.id)}
                  className={`border-b border-neutral-800/60 last:border-0 transition-colors hover:bg-neutral-800/40 ${dragOverId === product.id ? 'bg-neutral-800/60' : ''} ${draggedId === product.id ? 'opacity-50' : ''}`}
                >
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1">
                      <GripVertical size={14} className="cursor-grab text-neutral-600 active:cursor-grabbing" />
                      <div className="flex flex-col">
                        <button onClick={() => handleMove(product.id, -1)} disabled={idx === 0} className="text-[10px] text-neutral-500 hover:text-neutral-300 disabled:opacity-30">▲</button>
                        <button onClick={() => handleMove(product.id, 1)} disabled={idx === filtered.length - 1} className="text-[10px] text-neutral-500 hover:text-neutral-300 disabled:opacity-30">▼</button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <img src={product.images[0]} alt={product.name} className="h-12 w-12 rounded object-cover" />
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{product.name}</td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-neutral-400 md:table-cell">{product.barcode || product.sku}</td>
                  <td className="hidden px-4 py-3 text-neutral-400 sm:table-cell">{product.category}</td>
                  <td className="hidden px-4 py-3 capitalize text-neutral-400 sm:table-cell">{product.gender}</td>
                  <td className="px-4 py-3 font-medium text-white">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.active === false ? 'bg-red-950/50 text-red-400' : 'bg-green-950/50 text-green-400'
                    }`}>
                      {product.active === false ? 'Inativo' : 'Ativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`${ADMIN_BASE}/produtos/${product.id}`} className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200" title="Editar">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => handleDuplicate(product)} className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200" title="Duplicar">
                        <Copy size={16} />
                      </button>
                      <button onClick={() => handleToggleActive(product)} className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200" title={product.active === false ? 'Ativar' : 'Desativar'}>
                        <Power size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-950/40 hover:text-red-400" title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-neutral-500">Arraste as linhas ou use as setas ▲▼ para reordenar. A ordem é salva automaticamente e refletida no catálogo público.</p>
    </AdminLayout>
  );
}
