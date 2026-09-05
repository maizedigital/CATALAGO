import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Copy, Trash2, Power } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types';

const card = 'rounded-xl border border-neutral-800 bg-neutral-900';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get<Product[]>('/products');
      setProducts(data || []);
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

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.gender.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Produtos</h1>
          <p className="mt-1 text-sm text-neutral-400">{products.length} produtos cadastrados</p>
        </div>
        <Link
          to="/admin/produtos/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-5 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white"
        >
          <Plus size={16} /> Novo produto
        </Link>
      </div>

      <div className="mb-4 relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, código, categoria..."
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-3 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-600"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm font-medium text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-300" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${card} p-12 text-center`}>
          <p className="text-sm text-neutral-500">
            {search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}
          </p>
        </div>
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-500" style={{ background: 'rgb(28,28,28)' }}>
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">Produto</th>
                <th className="hidden px-4 py-3 md:table-cell">Código</th>
                <th className="hidden px-4 py-3 sm:table-cell">Categoria</th>
                <th className="hidden px-4 py-3 sm:table-cell">Gênero</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-neutral-800/60 last:border-0 transition-colors hover:bg-neutral-800/40">
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
                      <Link to={`/admin/produtos/${product.id}`} className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200" title="Editar">
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
    </AdminLayout>
  );
}
