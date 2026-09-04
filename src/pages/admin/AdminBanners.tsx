import { useEffect, useState, useRef } from 'react';
import { Image as ImageIcon, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Save, X, Upload, Loader2 } from 'lucide-react';
import { adminApi, uploadBannerImage } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';
import type { Banner } from '@/types';

const BANNER_RATIO = 16 / 6;
const BANNER_W = 1920;
const BANNER_H = 720;

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    image_url: '',
    link_url: '',
    active: true,
  });
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    loadBanners();
  }, []);

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

  const resetForm = () => {
    setForm({ title: '', image_url: '', link_url: '', active: true });
    setImageInfo(null);
    setShowForm(false);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Apenas imagens são aceitas (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande (máximo 10MB)');
      return;
    }

    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      setImageInfo({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.src = url;

    setUploading(true);
    setError(null);
    try {
      const imageUrl = await uploadBannerImage(file);
      setForm((prev) => ({ ...prev, image_url: imageUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) {
      setError('Faça upload de uma imagem primeiro');
      return;
    }
    if (!form.title.trim()) {
      setError('Informe um título para o banner');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const sortOrder = banners.length;
      await adminApi.post('/banners', {
        title: form.title.trim(),
        image_url: form.image_url,
        link_url: form.link_url.trim() || null,
        active: form.active,
        sort_order: sortOrder,
      });
      resetForm();
      await loadBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar banner');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await adminApi.put(`/banners/${banner.id}`, { active: !banner.active });
      setBanners((prev) => prev.map((b) => b.id === banner.id ? { ...b, active: !b.active } : b));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar banner');
    }
  };

  const deleteBanner = async (banner: Banner) => {
    if (!confirm(`Excluir o banner "${banner.title}"?`)) return;
    try {
      await adminApi.delete(`/banners/${banner.id}`);
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir banner');
    }
  };

  const moveBanner = async (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= banners.length) return;
    const reordered = [...banners];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setBanners(reordered.map((b, i) => ({ ...b, sort_order: i })));
    try {
      await adminApi.post('/banners-reorder', {
        items: reordered.map((b, i) => ({ id: b.id, sort_order: i })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reordenar');
      await loadBanners();
    }
  };

  const inputClass = 'w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-neutral-900';
  const labelClass = 'mb-1.5 block text-xs font-semibold text-neutral-600';

  const aspectRatioWarn = imageInfo && (Math.abs((imageInfo.width / imageInfo.height) - BANNER_RATIO) > 0.3);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900">Gerenciar Banners</h1>
          <p className="mt-1 text-sm text-neutral-500">Banners do catálogo — formato {BANNER_W} × {BANNER_H}px (16:6)</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            <Plus size={16} /> Novo banner
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">Novo banner</h2>
            <button type="button" onClick={resetForm} className="text-neutral-400 hover:text-neutral-900">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Título (interno) *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className={inputClass}
                placeholder="Ex: Promoção de Verão"
              />
            </div>

            <div>
              <label className={labelClass}>Link de destino (opcional)</label>
              <input
                type="text"
                value={form.link_url}
                onChange={(e) => setForm((prev) => ({ ...prev, link_url: e.target.value }))}
                className={inputClass}
                placeholder="https://... ou /feminino"
              />
            </div>

            <div>
              <label className={labelClass}>Imagem do banner *</label>
              <p className="mb-2 text-xs text-neutral-500">
                Tamanho recomendado: {BANNER_W} × {BANNER_H}px · Formato: JPG, PNG ou WebP · Máx 10MB
              </p>

              {!form.image_url ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 transition-colors ${
                    dragging ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  {uploading ? (
                    <Loader2 className="h-7 w-7 animate-spin text-neutral-400" />
                  ) : (
                    <>
                      <Upload size={24} className="text-neutral-400" />
                      <p className="mt-2 text-xs text-neutral-500">Clique ou arraste uma imagem</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100" style={{ aspectRatio: '16 / 6' }}>
                    <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setForm((prev) => ({ ...prev, image_url: '' })); setImageInfo(null); }}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {imageInfo && (
                    <p className={`text-xs ${aspectRatioWarn ? 'text-amber-600' : 'text-neutral-500'}`}>
                      Dimensões: {imageInfo.width} × {imageInfo.height}px
                      {aspectRatioWarn && ' — proporção diferente de 16:6. A imagem será recortada para preencher a área.'}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-neutral-600 underline hover:text-neutral-900"
                  >
                    Trocar imagem
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                <span className="text-sm text-neutral-700">Ativar banner imediatamente</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || uploading || !form.image_url}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Salvando...' : 'Salvar banner'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-neutral-200 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      {banners.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <ImageIcon size={32} className="mx-auto text-neutral-300" />
          <p className="mt-4 text-sm text-neutral-500">Nenhum banner cadastrado.</p>
          <p className="text-xs text-neutral-400">Clique em "Novo banner" para adicionar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center ${
                banner.active ? 'border-neutral-200' : 'border-neutral-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-400">#{index + 1}</span>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveBanner(index, -1)}
                    disabled={index === 0}
                    className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 disabled:opacity-30"
                    aria-label="Mover para cima"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveBanner(index, 1)}
                    disabled={index === banners.length - 1}
                    className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 disabled:opacity-30"
                    aria-label="Mover para baixo"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>

              <div className="h-16 w-32 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100" style={{ aspectRatio: '16 / 6' }}>
                <img src={banner.image_url} alt={banner.title} className="h-full w-full object-cover" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900">{banner.title}</p>
                {banner.link_url && <p className="text-xs text-neutral-500">{banner.link_url}</p>}
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  banner.active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {banner.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(banner)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    banner.active
                      ? 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      : 'border-neutral-200 text-neutral-400 hover:bg-neutral-50'
                  }`}
                  aria-label={banner.active ? 'Desativar' : 'Ativar'}
                  title={banner.active ? 'Desativar' : 'Ativar'}
                >
                  {banner.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => deleteBanner(banner)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="Excluir"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
