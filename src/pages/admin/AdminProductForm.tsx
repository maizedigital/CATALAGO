import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Loader2, Barcode } from 'lucide-react';
import { adminApi, uploadProductImage } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';
import { Logo } from '@/components/Logo';
import type { Product, Gender, ProductType } from '@/types';
import { CLOTHING_SIZES, FOOTWEAR_SIZES } from '@/types';

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function generateBarcode(): string {
  const now = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${now}${rand}`;
}

interface FormState {
  name: string; slug: string; gender: Gender; product_type: ProductType;
  price: string; promo_price: string; sizes: string[]; colors: string;
  images: string[]; description: string; category: string; barcode: string;
  featured: boolean; new_arrival: boolean; on_sale: boolean; active: boolean;
}

const emptyForm: FormState = {
  name: '', slug: '', gender: 'feminino', product_type: 'roupas',
  price: '', promo_price: '', sizes: [], colors: '', images: [],
  description: '', category: '', barcode: generateBarcode(),
  featured: false, new_arrival: true, on_sale: false, active: true,
};

const card = 'rounded-xl border border-neutral-800 bg-neutral-900 p-5';
const inputClass = 'w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-500';
const labelClass = 'mb-1.5 block text-xs font-semibold text-neutral-400';

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'novo';

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const products = await adminApi.get<Product[]>('/products');
        const product = products.find((p) => p.id === id);
        if (!product) { setError('Produto não encontrado'); return; }
        setForm({
          name: product.name, slug: product.slug, gender: product.gender,
          product_type: (product.product_type as ProductType) || 'roupas',
          price: String(product.price), promo_price: product.promo_price != null ? String(product.promo_price) : '',
          sizes: product.sizes || [], colors: product.colors.join(', '), images: product.images || [],
          description: product.description || '', category: product.category || '',
          barcode: product.barcode || generateBarcode(),
          featured: product.featured, new_arrival: product.new_arrival, on_sale: product.on_sale,
          active: product.active !== false,
        });
      } catch (err) { setError(err instanceof Error ? err.message : 'Erro ao carregar'); }
      finally { setLoading(false); }
    })();
  }, [id, isEdit]);

  const handleChange = (field: keyof FormState, value: string | boolean | string[]) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !isEdit) next.slug = slugify(value as string);
      if (field === 'product_type') next.sizes = [];
      return next;
    });
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({ ...prev, sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size] }));
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArr.length === 0) return;
    const slotsLeft = 5 - form.images.length;
    if (slotsLeft <= 0) return;
    const toUpload = fileArr.slice(0, slotsLeft);
    setUploading(true); setError(null);
    try {
      const urls: string[] = [];
      for (const file of toUpload) { const url = await uploadProductImage(file); urls.push(url); }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro ao enviar foto'); }
    finally { setUploading(false); }
  };

  const removeImage = (index: number) => { setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) })); };
  const moveImage = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= form.images.length) return;
    const imgs = [...form.images];
    [imgs[index], imgs[newIndex]] = [imgs[newIndex], imgs[index]];
    setForm((prev) => ({ ...prev, images: imgs }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.images.length === 0) { setError('Adicione pelo menos uma foto do produto'); return; }
    setSaving(true); setError(null);
    const sku = form.barcode || generateBarcode();
    const payload = {
      name: form.name.trim(), sku, slug: form.slug.trim() || slugify(form.name), barcode: form.barcode,
      gender: form.gender, category: form.category.trim() || 'Geral', subcategory: null,
      description: form.description.trim() || null, price: parseFloat(form.price) || 0,
      promo_price: form.promo_price ? parseFloat(form.promo_price) : null, sizes: form.sizes,
      product_type: form.product_type, colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
      images: form.images, stock: 999, featured: form.featured, bestseller: false,
      new_arrival: form.new_arrival, on_sale: form.on_sale, active: form.active,
    };
    try {
      if (isEdit) await adminApi.put(`/products/${id}`, payload);
      else await adminApi.post('/products', payload);
      navigate('/admin/produtos');
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro ao salvar'); }
    finally { setSaving(false); }
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

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/admin/produtos')} className="rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-neutral-300 transition-colors hover:bg-neutral-700">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div className="hidden md:block"><Logo /></div>
          <h1 className="font-serif text-2xl font-bold text-white">{isEdit ? 'Editar produto' : 'Novo produto'}</h1>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm font-medium text-red-400">{error}</div>}

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5">
        <div className={card}>
          <h2 className="mb-3 text-sm font-bold text-white">Fotos do produto</h2>
          <p className="mb-4 text-xs text-neutral-500">Arraste imagens aqui ou clique para selecionar. Até 5 fotos. A primeira será a capa.</p>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => form.images.length < 5 && fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 transition-colors ${dragging ? 'border-neutral-500 bg-neutral-800' : 'border-neutral-700 hover:border-neutral-600'} ${form.images.length >= 5 ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {uploading ? <Loader2 className="h-7 w-7 animate-spin text-neutral-500" /> : (
              <><Upload size={24} className="text-neutral-500" /><p className="mt-2 text-xs text-neutral-500">{form.images.length >= 5 ? 'Limite de 5 fotos' : 'Clique ou arraste imagens'}</p></>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }} />
          {form.images.length > 0 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute left-1 top-1 rounded bg-neutral-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-neutral-900">Capa</span>}
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900/90 text-neutral-300 shadow-sm transition-colors hover:bg-red-950 hover:text-red-400"><X size={12} /></button>
                  {i > 0 && <button type="button" onClick={(e) => { e.stopPropagation(); moveImage(i, -1); }} className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded bg-neutral-900/90 text-[10px] text-neutral-400 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">‹</button>}
                  {i < form.images.length - 1 && <button type="button" onClick={(e) => { e.stopPropagation(); moveImage(i, 1); }} className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded bg-neutral-900/90 text-[10px] text-neutral-400 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">›</button>}
                </div>
              ))}
              {form.images.length < 5 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-neutral-700 text-neutral-500 transition-colors hover:border-neutral-600 hover:text-neutral-300"><ImageIcon size={20} /></button>
              )}
            </div>
          )}
        </div>

        <div className={card}>
          <h2 className="mb-4 text-sm font-bold text-white">Informações</h2>
          <div className="space-y-4">
            <div><label className={labelClass}>Nome do produto *</label><input type="text" required value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={inputClass} placeholder="Ex: Camiseta MB Essential" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelClass}>Gênero *</label><select value={form.gender} onChange={(e) => handleChange('gender', e.target.value as Gender)} className={inputClass}><option value="feminino">Feminino</option><option value="masculino">Masculino</option></select></div>
              <div><label className={labelClass}>Categoria (opcional)</label><input type="text" value={form.category} onChange={(e) => handleChange('category', e.target.value)} className={inputClass} placeholder="Ex: Camiseta" /></div>
            </div>
            <div><label className={labelClass}>Descrição (opcional)</label><textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={2} className={inputClass} placeholder="Breve descrição do produto" /></div>
            <div>
              <label className={labelClass}>Código de barras (gerado automaticamente)</label>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5">
                  <Barcode size={16} className="text-neutral-500" />
                  <span className="text-sm font-mono text-neutral-300">{form.barcode}</span>
                </div>
                <button type="button" onClick={() => handleChange('barcode', generateBarcode())} className="rounded-lg border border-neutral-700 px-3 py-2.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800">Gerar novo</button>
              </div>
            </div>
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-sm font-bold text-white">Preço</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelClass}>Preço (R$) *</label><input type="number" step="0.01" required value={form.price} onChange={(e) => handleChange('price', e.target.value)} className={inputClass} placeholder="0,00" /></div>
            <div><label className={labelClass}>Preço promocional (opcional)</label><input type="number" step="0.01" value={form.promo_price} onChange={(e) => handleChange('promo_price', e.target.value)} className={inputClass} placeholder="0,00" /></div>
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-sm font-bold text-white">Tipo de produto</h2>
          <div className="flex gap-3">
            <button type="button" onClick={() => handleChange('product_type', 'roupas')} className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${form.product_type === 'roupas' ? 'border-neutral-500 bg-neutral-800 text-white' : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-600'}`}>Roupas</button>
            <button type="button" onClick={() => handleChange('product_type', 'calcados')} className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${form.product_type === 'calcados' ? 'border-neutral-500 bg-neutral-800 text-white' : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-600'}`}>Calçados</button>
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-sm font-bold text-white">Tamanhos e cores</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Tamanhos {form.product_type === 'calcados' ? '(Calçados)' : '(Roupas)'}</label>
              <div className="flex flex-wrap gap-2">
                {(form.product_type === 'calcados' ? FOOTWEAR_SIZES : CLOTHING_SIZES).map((size) => (
                  <button key={size} type="button" onClick={() => toggleSize(size)} className={`min-w-[44px] rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${form.sizes.includes(size) ? 'border-neutral-500 bg-neutral-800 text-white' : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-600'}`}>{size}</button>
                ))}
              </div>
            </div>
            <div><label className={labelClass}>Cores (vírgula)</label><input type="text" value={form.colors} onChange={(e) => handleChange('colors', e.target.value)} className={inputClass} placeholder="Preto, Branco" /></div>
          </div>
        </div>

        <div className={card}>
          <h2 className="mb-3 text-sm font-bold text-white">Destaques</h2>
          <div className="flex flex-wrap gap-2">
            {([['new_arrival', 'Novidade'], ['featured', 'Destaque'], ['on_sale', 'Oferta'], ['active', 'Ativo']] as const).map(([key, label]) => (
              <button key={key} type="button" onClick={() => handleChange(key, !form[key])} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${form[key] ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>{label}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pb-4">
          <button type="submit" disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? 'Salvando...' : 'Salvar produto'}
          </button>
          <button type="button" onClick={() => navigate('/admin/produtos')} className="rounded-lg border border-neutral-700 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:bg-neutral-800">Cancelar</button>
        </div>
      </form>
    </AdminLayout>
  );
}
