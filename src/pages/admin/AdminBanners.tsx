import { useEffect, useState, useRef } from 'react';
import { Image as ImageIcon, Video as VideoIcon, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Save, X, Upload, Loader2, Search, Tag } from 'lucide-react';
import { adminApi, uploadBannerImage, uploadBannerVideo } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';
import type { Banner, Product } from '@/types';

const BANNER_RATIO = 16 / 6;
const BANNER_W = 1920;
const BANNER_H = 720;
const MAX_VIDEO_DURATION = 120;
const CATEGORY_IMG_SIZE = 200;

const card = 'rounded-xl border border-neutral-800 bg-neutral-900';
const inputClass = 'w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-500';
const labelClass = 'mb-1.5 block text-xs font-semibold text-neutral-400';

type MediaType = 'image' | 'video';
type DisplayMode = 'mobile_only' | 'responsive';
type BannerType = 'banner' | 'category';

interface FormState {
  title: string;
  media_type: MediaType;
  display_mode: DisplayMode;
  image_url: string;
  mobile_image_url: string;
  desktop_image_url: string;
  video_url: string;
  mobile_video_url: string;
  desktop_video_url: string;
  link_url: string;
  product_id: string | null;
  active: boolean;
  type: BannerType;
  category_name: string;
}

const emptyForm: FormState = {
  title: '', media_type: 'image', display_mode: 'mobile_only',
  image_url: '', mobile_image_url: '', desktop_image_url: '',
  video_url: '', mobile_video_url: '', desktop_video_url: '',
  link_url: '', product_id: null, active: true,
  type: 'banner', category_name: '',
};

interface CategoryFormState {
  category_name: string;
  image_url: string;
  link_url: string;
  active: boolean;
}

const emptyCategoryForm: CategoryFormState = {
  category_name: '', image_url: '', link_url: '', active: true,
};

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(emptyForm);

  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSelect, setShowProductSelect] = useState(false);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [savingCategory, setSavingCategory] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState(false);
  const [categoryDragging, setCategoryDragging] = useState(false);
  const categoryFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadBanners(); loadProducts(); }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get<Banner[]>('/banners');
      setBanners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await adminApi.get<Product[]>('/products');
      setProducts(data);
    } catch { /* ignore */ }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageInfo(null);
    setVideoDuration(null);
    setVideoError(null);
    setProductSearch('');
    setShowProductSelect(false);
    setShowForm(false);
    setEditingId(null);
    setUploadingField(null);
    setDraggingField(null);
  };

  const openNew = (type: MediaType) => {
    resetForm();
    setForm({ ...emptyForm, media_type: type, type: 'banner' });
    setShowForm(true);
  };

  const openEdit = (banner: Banner) => {
    resetForm();
    setForm({
      title: banner.title,
      media_type: banner.media_type || 'image',
      display_mode: (banner.display_mode as DisplayMode) || 'mobile_only',
      image_url: banner.media_type === 'video' ? '' : banner.image_url,
      mobile_image_url: banner.mobile_image_url || banner.image_url || '',
      desktop_image_url: banner.desktop_image_url || '',
      video_url: banner.video_url || '',
      mobile_video_url: banner.mobile_video_url || banner.video_url || '',
      desktop_video_url: banner.desktop_video_url || '',
      link_url: banner.link_url || '',
      product_id: banner.product_id,
      active: banner.active,
      type: (banner.type as BannerType) || 'banner',
      category_name: banner.category_name || '',
    });
    setEditingId(banner.id);
    const prod = banner.product_id ? products.find((p) => p.id === banner.product_id) : null;
    if (prod) setProductSearch(prod.name);
    setShowForm(true);
  };

  const handleImageFile = async (file: File, field: 'image_url' | 'mobile_image_url' | 'desktop_image_url') => {
    if (!file.type.startsWith('image/')) { setError('Apenas imagens são aceitas (JPG, PNG, WebP)'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Arquivo muito grande (máximo 10MB)'); return; }
    if (field === 'image_url') {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = async () => { setImageInfo({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
      img.src = url;
    }
    setUploadingField(field); setError(null);
    try {
      const imageUrl = await uploadBannerImage(file);
      setForm((prev) => ({ ...prev, [field]: imageUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem');
    } finally { setUploadingField(null); }
  };

  const handleVideoFile = async (file: File, field: 'video_url' | 'mobile_video_url' | 'desktop_video_url') => {
    if (!file.type.startsWith('video/')) { setVideoError('Apenas vídeos são aceitos (MP4, WebM)'); return; }
    if (file.size > 100 * 1024 * 1024) { setVideoError('Arquivo muito grande (máximo 100MB)'); return; }
    setVideoError(null);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = async () => {
      const duration = video.duration;
      if (field === 'video_url' || field === 'mobile_video_url') setVideoDuration(duration);
      if (duration > MAX_VIDEO_DURATION) {
        setVideoError(`Vídeo muito longo: ${Math.round(duration)}s. O limite é de ${MAX_VIDEO_DURATION / 60} minuto(s).`);
        return;
      }
      setUploadingField(field);
      try {
        const videoUrl = await uploadBannerVideo(file);
        setForm((prev) => ({ ...prev, [field]: videoUrl }));
      } catch (err) {
        setVideoError(err instanceof Error ? err.message : 'Erro ao enviar vídeo');
      } finally { setUploadingField(null); }
    };
    video.onerror = () => { setVideoError('Não foi possível ler o arquivo de vídeo'); };
    video.src = URL.createObjectURL(file);
  };

  const handleDrop = (e: React.DragEvent, field: 'image_url' | 'mobile_image_url' | 'desktop_image_url' | 'video_url' | 'mobile_video_url' | 'desktop_video_url') => {
    e.preventDefault();
    setDraggingField(null);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (field.startsWith('video')) handleVideoFile(file, field as 'video_url' | 'mobile_video_url' | 'desktop_video_url');
    else handleImageFile(file, field as 'image_url' | 'mobile_image_url' | 'desktop_image_url');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Informe um título'); return; }
    if (form.media_type === 'image' && !form.image_url) { setError('Faça upload da imagem'); return; }
    if (form.media_type === 'video' && !form.video_url) { setError('Faça upload do vídeo'); return; }
    if (videoError) { setError(videoError); return; }

    setSaving(true); setError(null);
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      media_type: form.media_type,
      link_url: form.link_url.trim() || null,
      product_id: form.product_id || null,
      active: form.active,
      type: form.type,
    };
    if (form.media_type === 'image') {
      payload.image_url = form.image_url;
      payload.video_url = null;
    } else {
      payload.video_url = form.video_url;
      payload.image_url = form.image_url || '';
    }

    try {
      if (editingId) {
        await adminApi.put(`/banners/${editingId}`, payload);
      } else {
        payload.sort_order = banners.filter((b) => (b.type || 'banner') === 'banner').length;
        await adminApi.post('/banners', payload);
      }
      resetForm();
      await loadBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally { setSaving(false); }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await adminApi.put(`/banners/${banner.id}`, { active: !banner.active });
      setBanners((prev) => prev.map((b) => b.id === banner.id ? { ...b, active: !b.active } : b));
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro ao atualizar'); }
  };

  const deleteBanner = async (banner: Banner) => {
    if (!confirm(`Excluir "${banner.title}"?`)) return;
    try {
      await adminApi.delete(`/banners/${banner.id}`);
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro ao excluir'); }
  };

  const moveBanner = async (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= banners.length) return;
    const reordered = [...banners];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setBanners(reordered.map((b, i) => ({ ...b, sort_order: i })));
    try {
      await adminApi.post('/banners-reorder', { items: reordered.map((b, i) => ({ id: b.id, sort_order: i })) });
    } catch { await loadBanners(); }
  };

  // --- Category management ---

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setShowCategoryForm(false);
    setEditingCategoryId(null);
    setUploadingCategory(false);
    setCategoryDragging(false);
  };

  const openNewCategory = () => {
    resetCategoryForm();
    setShowCategoryForm(true);
  };

  const openEditCategory = (banner: Banner) => {
    resetCategoryForm();
    setCategoryForm({
      category_name: banner.category_name || banner.title,
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      active: banner.active,
    });
    setEditingCategoryId(banner.id);
    setShowCategoryForm(true);
  };

  const handleCategoryImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Apenas imagens são aceitas (JPG, PNG, WebP)'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Arquivo muito grande (máximo 10MB)'); return; }
    setUploadingCategory(true); setError(null);
    try {
      const imageUrl = await uploadBannerImage(file);
      setCategoryForm((prev) => ({ ...prev, image_url: imageUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem');
    } finally { setUploadingCategory(false); }
  };

  const handleCategorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.category_name.trim()) { setError('Informe o nome da categoria'); return; }
    if (!categoryForm.image_url) { setError('Faça upload da imagem da categoria'); return; }

    setSavingCategory(true); setError(null);
    const payload = {
      title: categoryForm.category_name.trim(),
      category_name: categoryForm.category_name.trim(),
      image_url: categoryForm.image_url,
      link_url: categoryForm.link_url.trim() || null,
      active: categoryForm.active,
      type: 'category' as BannerType,
      media_type: 'image' as MediaType,
    };

    try {
      if (editingCategoryId) {
        await adminApi.put(`/banners/${editingCategoryId}`, payload);
      } else {
        const categoryBanners = banners.filter((b) => b.type === 'category');
        await adminApi.post('/banners', { ...payload, sort_order: categoryBanners.length });
      }
      resetCategoryForm();
      await loadBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar categoria');
    } finally { setSavingCategory(false); }
  };

  const moveCategory = async (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= categoryBanners.length) return;
    const reordered = [...categoryBanners];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setBanners((prev) => {
      const nonCats = prev.filter((b) => b.type !== 'category');
      return [...nonCats, ...reordered.map((b, i) => ({ ...b, sort_order: i }))];
    });
    try {
      await adminApi.post('/banners-reorder', { items: reordered.map((b, i) => ({ id: b.id, sort_order: i })) });
    } catch { await loadBanners(); }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 20);

  const selectedProduct = form.product_id ? products.find((p) => p.id === form.product_id) : null;

  const regularBanners = banners.filter((b) => (b.type || 'banner') === 'banner');
  const categoryBanners = banners.filter((b) => b.type === 'category');
  const imageBanners = regularBanners.filter((b) => (b.media_type || 'image') === 'image');
  const videoBanners = regularBanners.filter((b) => b.media_type === 'video');

  const aspectRatioWarn = imageInfo && (Math.abs((imageInfo.width / imageInfo.height) - BANNER_RATIO) > 0.3);

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Banners</h1>
          <p className="mt-1 text-sm text-neutral-400">Banners, vídeos e categorias do carrossel</p>
        </div>
        {!showForm && !showCategoryForm && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => openNew('image')} className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white">
              <Plus size={16} /> Banner
            </button>
            <button onClick={() => openNew('video')} className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-200 transition-colors hover:bg-neutral-700">
              <VideoIcon size={16} /> Vídeo
            </button>
            <button onClick={openNewCategory} className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-200 transition-colors hover:bg-neutral-700">
              <Tag size={16} /> Categoria
            </button>
          </div>
        )}
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm font-medium text-red-400">{error}</div>}

      {/* Category carousel form */}
      {showCategoryForm && (
        <form onSubmit={handleCategorySave} className={`${card} mb-8 p-6`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Tag size={18} /> {editingCategoryId ? 'Editar' : 'Nova'} categoria
            </h2>
            <button type="button" onClick={resetCategoryForm} className="text-neutral-500 hover:text-white"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Nome da categoria *</label>
              <input type="text" required value={categoryForm.category_name} onChange={(e) => setCategoryForm((prev) => ({ ...prev, category_name: e.target.value }))} className={inputClass} placeholder="Ex: CAMISAS, TÊNIS, BONÉS" />
            </div>
            <div>
              <label className={labelClass}>URL de destino *</label>
              <input type="text" required value={categoryForm.link_url} onChange={(e) => setCategoryForm((prev) => ({ ...prev, link_url: e.target.value }))} className={inputClass} placeholder="/categoria/camisas ou https://..." />
              <p className="mt-1 text-xs text-neutral-500">Para categorias internas, use /categoria/nome-da-categoria</p>
            </div>
            <div>
              <label className={labelClass}>Imagem da categoria *</label>
              <p className="mb-2 text-xs text-neutral-500">Imagem circular · Recomendado: {CATEGORY_IMG_SIZE} × {CATEGORY_IMG_SIZE}px · JPG, PNG ou WebP</p>
              {!categoryForm.image_url ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setCategoryDragging(true); }}
                  onDragLeave={() => setCategoryDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setCategoryDragging(false); const file = e.dataTransfer.files[0]; if (file) handleCategoryImageFile(file); }}
                  onClick={() => categoryFileRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-colors ${categoryDragging ? 'border-neutral-500 bg-neutral-800' : 'border-neutral-700 hover:border-neutral-600'}`}
                >
                  {uploadingCategory ? <Loader2 className="h-7 w-7 animate-spin text-neutral-500" /> : (
                    <><Upload size={24} className="text-neutral-500" /><p className="mt-2 text-xs text-neutral-500">Clique ou arraste uma imagem</p></>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-neutral-700 bg-neutral-800">
                    <img src={categoryForm.image_url} alt="Preview" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setCategoryForm((prev) => ({ ...prev, image_url: '' }))} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900/90 text-neutral-300 shadow-sm transition-colors hover:bg-red-950 hover:text-red-400">
                      <X size={12} />
                    </button>
                  </div>
                  <button type="button" onClick={() => categoryFileRef.current?.click()} className="text-xs font-semibold text-neutral-400 underline hover:text-white">Trocar imagem</button>
                </div>
              )}
              <input ref={categoryFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleCategoryImageFile(e.target.files[0]); e.target.value = ''; }} />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={categoryForm.active} onChange={(e) => setCategoryForm((prev) => ({ ...prev, active: e.target.checked }))} className="h-4 w-4 rounded border-neutral-700 bg-neutral-800" />
                <span className="text-sm text-neutral-300">Ativar imediatamente</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={savingCategory || uploadingCategory} className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white disabled:opacity-50">
                {savingCategory ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {savingCategory ? 'Salvando...' : 'Salvar categoria'}
              </button>
              <button type="button" onClick={resetCategoryForm} className="rounded-lg border border-neutral-700 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:bg-neutral-800">Cancelar</button>
            </div>
          </div>
        </form>
      )}

      {/* Banner form */}
      {showForm && (
        <form onSubmit={handleSave} className={`${card} mb-8 p-6`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              {form.media_type === 'video' ? <VideoIcon size={18} /> : <ImageIcon size={18} />}
              {editingId ? 'Editar' : 'Novo'} {form.media_type === 'video' ? 'vídeo' : 'banner'}
            </h2>
            <button type="button" onClick={resetForm} className="text-neutral-500 hover:text-white"><X size={20} /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Título (interno) *</label>
              <input type="text" required value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className={inputClass} placeholder="Ex: Promoção de Verão" />
            </div>

            {form.media_type === 'image' ? (
              <>
                <div>
                  <label className={labelClass}>Link de destino (opcional)</label>
                  <input type="text" value={form.link_url} onChange={(e) => setForm((prev) => ({ ...prev, link_url: e.target.value }))} className={inputClass} placeholder="https://... ou /masculino" />
                </div>
                <div>
                  <label className={labelClass}>Imagem do banner *</label>
                  <p className="mb-2 text-xs text-neutral-500">Tamanho recomendado: {BANNER_W} × {BANNER_H}px · JPG, PNG ou WebP · Máx 10MB</p>
                  {!form.image_url ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDraggingField('image_url'); }}
                      onDragLeave={() => setDraggingField(null)}
                      onDrop={(e) => handleDrop(e, 'image_url')}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 transition-colors ${draggingField === 'image_url' ? 'border-neutral-500 bg-neutral-800' : 'border-neutral-700 hover:border-neutral-600'}`}
                    >
                      {uploadingField === 'image_url' ? <Loader2 className="h-7 w-7 animate-spin text-neutral-500" /> : (
                        <><Upload size={24} className="text-neutral-500" /><p className="mt-2 text-xs text-neutral-500">Clique ou arraste uma imagem</p></>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800" style={{ aspectRatio: '16 / 6' }}>
                        <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => { setForm((prev) => ({ ...prev, image_url: '' })); setImageInfo(null); }} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900/90 text-neutral-300 shadow-sm transition-colors hover:bg-red-950 hover:text-red-400">
                          <X size={14} />
                        </button>
                      </div>
                      {imageInfo && (
                        <p className={`text-xs ${aspectRatioWarn ? 'text-amber-400' : 'text-neutral-500'}`}>
                          Dimensões: {imageInfo.width} × {imageInfo.height}px{aspectRatioWarn && ' — proporção diferente de 16:6.'}
                        </p>
                      )}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold text-neutral-400 underline hover:text-white">Trocar imagem</button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageFile(e.target.files[0], 'image_url'); e.target.value = ''; }} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelClass}>Vídeo promocional *</label>
                  <p className="mb-2 text-xs text-neutral-500">Formato vertical 9:16 · MP4, WebM ou OGG · Máx 100MB · Limite de {MAX_VIDEO_DURATION / 60} minuto(s)</p>
                  {!form.video_url ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDraggingField('video_url'); }}
                      onDragLeave={() => setDraggingField(null)}
                      onDrop={(e) => handleDrop(e, 'video_url')}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 transition-colors ${draggingField === 'video_url' ? 'border-neutral-500 bg-neutral-800' : 'border-neutral-700 hover:border-neutral-600'}`}
                    >
                      {uploadingField === 'video_url' ? <Loader2 className="h-7 w-7 animate-spin text-neutral-500" /> : (
                        <><Upload size={24} className="text-neutral-500" /><p className="mt-2 text-xs text-neutral-500">Clique ou arraste um vídeo</p></>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative mx-auto overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800" style={{ aspectRatio: '9 / 16', width: '200px' }}>
                        <video src={form.video_url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
                        <button type="button" onClick={() => { setForm((prev) => ({ ...prev, video_url: '' })); setVideoDuration(null); }} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900/90 text-neutral-300 shadow-sm transition-colors hover:bg-red-950 hover:text-red-400">
                          <X size={14} />
                        </button>
                      </div>
                      {videoDuration != null && (
                        <p className="text-center text-xs text-neutral-500">Duração: {Math.round(videoDuration)}s</p>
                      )}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="block w-full text-center text-xs font-semibold text-neutral-400 underline hover:text-white">Trocar vídeo</button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/ogg" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleVideoFile(e.target.files[0], 'video_url'); e.target.value = ''; }} />
                  {videoError && <p className="mt-2 text-xs text-red-400">{videoError}</p>}
                </div>

                <div>
                  <label className={labelClass}>Produto relacionado</label>
                  <p className="mb-2 text-xs text-neutral-500">Selecione o produto que o vídeo vai promover. O link é gerado automaticamente.</p>
                  {selectedProduct ? (
                    <div className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2.5">
                      <span className="text-sm text-white">{selectedProduct.name}</span>
                      <button type="button" onClick={() => { setForm((prev) => ({ ...prev, product_id: null })); setProductSearch(''); setShowProductSelect(true); }} className="text-xs text-neutral-400 underline hover:text-white">Trocar</button>
                    </div>
                  ) : showProductSelect ? (
                    <div>
                      <div className="relative mb-2">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className={`${inputClass} pl-9`} placeholder="Buscar produto..." autoFocus />
                      </div>
                      <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-800">
                        {filteredProducts.length === 0 ? (
                          <p className="p-3 text-xs text-neutral-500">Nenhum produto encontrado.</p>
                        ) : (
                          filteredProducts.map((p) => (
                            <button key={p.id} type="button" onClick={() => { setForm((prev) => ({ ...prev, product_id: p.id })); setProductSearch(p.name); setShowProductSelect(false); }} className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-neutral-700">
                              <img src={p.images[0]} alt="" className="h-10 w-8 rounded object-cover" />
                              <div>
                                <p className="text-sm text-white">{p.name}</p>
                                <p className="text-xs text-neutral-500">{p.category} · {p.gender}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      <button type="button" onClick={() => setShowProductSelect(false)} className="mt-2 text-xs text-neutral-400 underline hover:text-white">Cancelar</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowProductSelect(true)} className="text-xs font-semibold text-neutral-400 underline hover:text-white">Selecionar produto</button>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Ou link de destino (opcional)</label>
                  <input type="text" value={form.link_url} onChange={(e) => setForm((prev) => ({ ...prev, link_url: e.target.value }))} className={inputClass} placeholder="https://... ou /masculino" />
                </div>
              </>
            )}

            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))} className="h-4 w-4 rounded border-neutral-700 bg-neutral-800" />
                <span className="text-sm text-neutral-300">Ativar imediatamente</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving || !!uploadingField || !!videoError} className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" onClick={resetForm} className="rounded-lg border border-neutral-700 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:bg-neutral-800">Cancelar</button>
            </div>
          </div>
        </form>
      )}

      {/* Categories section */}
      {categoryBanners.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-400">
            <Tag size={16} /> Categorias do carrossel
          </h2>
          <div className="space-y-3">
            {categoryBanners.map((cat, index) => (
              <div key={cat.id} className={`flex flex-col gap-4 ${card} p-4 sm:flex-row sm:items-center ${cat.active ? '' : 'opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-500">#{index + 1}</span>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveCategory(index, -1)} disabled={index === 0} className="flex h-6 w-6 items-center justify-center rounded border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800 disabled:opacity-30" aria-label="Mover para cima"><ArrowUp size={14} /></button>
                    <button onClick={() => moveCategory(index, 1)} disabled={index === categoryBanners.length - 1} className="flex h-6 w-6 items-center justify-center rounded border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800 disabled:opacity-30" aria-label="Mover para baixo"><ArrowDown size={14} /></button>
                  </div>
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-neutral-700 bg-neutral-800">
                    <img src={cat.image_url} alt={cat.category_name || cat.title} className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{cat.category_name || cat.title}</p>
                  {cat.link_url && <p className="text-xs text-neutral-500">{cat.link_url}</p>}
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cat.active ? 'bg-green-950/50 text-green-400' : 'bg-neutral-800 text-neutral-500'}`}>
                    {cat.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditCategory(cat)} className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800">Editar</button>
                  <button onClick={() => toggleActive(cat)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800" aria-label={cat.active ? 'Desativar' : 'Ativar'} title={cat.active ? 'Desativar' : 'Ativar'}>
                    {cat.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => deleteBanner(cat)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-colors hover:bg-red-950/40 hover:text-red-400" aria-label="Excluir" title="Excluir">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video banners */}
      {videoBanners.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-400">
            <VideoIcon size={16} /> Vídeos promocionais
          </h2>
          <div className="space-y-4">
            {videoBanners.map((banner) => {
              const index = regularBanners.indexOf(banner);
              const prod = banner.product_id ? products.find((p) => p.id === banner.product_id) : null;
              return (
                <div key={banner.id} className={`flex flex-col gap-4 ${card} p-4 sm:flex-row sm:items-center ${banner.active ? '' : 'opacity-60'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-500">#{index + 1}</span>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveBanner(banners.indexOf(banner), -1)} disabled={banners.indexOf(banner) === 0} className="flex h-6 w-6 items-center justify-center rounded border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800 disabled:opacity-30" aria-label="Mover para cima"><ArrowUp size={14} /></button>
                      <button onClick={() => moveBanner(banners.indexOf(banner), 1)} disabled={banners.indexOf(banner) === banners.length - 1} className="flex h-6 w-6 items-center justify-center rounded border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800 disabled:opacity-30" aria-label="Mover para baixo"><ArrowDown size={14} /></button>
                    </div>
                  </div>
                  <div className="h-28 w-[63px] shrink-0 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800" style={{ aspectRatio: '9 / 16' }}>
                    <video src={banner.video_url || undefined} muted loop playsInline className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{banner.title}</p>
                    {prod && <p className="text-xs text-neutral-500">Produto: {prod.name}</p>}
                    {banner.link_url && !prod && <p className="text-xs text-neutral-500">{banner.link_url}</p>}
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${banner.active ? 'bg-green-950/50 text-green-400' : 'bg-neutral-800 text-neutral-500'}`}>
                      {banner.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(banner)} className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800">Editar</button>
                    <button onClick={() => toggleActive(banner)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800" aria-label={banner.active ? 'Desativar' : 'Ativar'} title={banner.active ? 'Desativar' : 'Ativar'}>
                      {banner.active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => deleteBanner(banner)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-colors hover:bg-red-950/40 hover:text-red-400" aria-label="Excluir" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image banners */}
      {imageBanners.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-400">
            <ImageIcon size={16} /> Banners de imagem
          </h2>
          <div className="space-y-4">
            {imageBanners.map((banner) => {
              const index = regularBanners.indexOf(banner);
              return (
                <div key={banner.id} className={`flex flex-col gap-4 ${card} p-4 sm:flex-row sm:items-center ${banner.active ? '' : 'opacity-60'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-500">#{index + 1}</span>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveBanner(banners.indexOf(banner), -1)} disabled={banners.indexOf(banner) === 0} className="flex h-6 w-6 items-center justify-center rounded border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800 disabled:opacity-30" aria-label="Mover para cima"><ArrowUp size={14} /></button>
                      <button onClick={() => moveBanner(banners.indexOf(banner), 1)} disabled={banners.indexOf(banner) === banners.length - 1} className="flex h-6 w-6 items-center justify-center rounded border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800 disabled:opacity-30" aria-label="Mover para baixo"><ArrowDown size={14} /></button>
                    </div>
                  </div>
                  <div className="h-16 w-32 shrink-0 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800" style={{ aspectRatio: '16 / 6' }}>
                    <img src={banner.image_url} alt={banner.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{banner.title}</p>
                    {banner.link_url && <p className="text-xs text-neutral-500">{banner.link_url}</p>}
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${banner.active ? 'bg-green-950/50 text-green-400' : 'bg-neutral-800 text-neutral-500'}`}>
                      {banner.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(banner)} className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800">Editar</button>
                    <button onClick={() => toggleActive(banner)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-colors hover:bg-neutral-800" aria-label={banner.active ? 'Desativar' : 'Ativar'} title={banner.active ? 'Desativar' : 'Ativar'}>
                      {banner.active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => deleteBanner(banner)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-colors hover:bg-red-950/40 hover:text-red-400" aria-label="Excluir" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {banners.length === 0 && (
        <div className={`${card} p-12 text-center`}>
          <ImageIcon size={32} className="mx-auto text-neutral-600" />
          <p className="mt-4 text-sm text-neutral-500">Nenhum banner, vídeo ou categoria cadastrado.</p>
          <p className="text-xs text-neutral-600">Use os botões acima para adicionar.</p>
        </div>
      )}
    </AdminLayout>
  );
}
