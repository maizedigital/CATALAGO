import { useEffect, useState } from 'react';
import { Save, Lock, Check } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface StoreSettings {
  name: string;
  tagline: string;
  whatsapp: string;
  instagram: string;
  address: string;
  hoursStore: string;
  hoursSite: string;
}

const card = 'rounded-xl border border-neutral-800 bg-neutral-900 p-6';
const inputClass = 'w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-neutral-500';
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-400';

export default function AdminSettings() {
  const { username } = useAdminAuth();
  const [store, setStore] = useState<StoreSettings>({
    name: 'MB', tagline: 'Moda que combina com você', whatsapp: '5573999929009', instagram: '@mbmodabrasil',
    address: 'BR-367, km 77 — Coroa Vermelha, Santa Cruz Cabrália — BA, 45810-000',
    hoursStore: 'Segunda a sábado: 08:30 às 18:30', hoursSite: 'Disponível 24 horas por dia, 7 dias por semana',
  });
  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [storeSaved, setStoreSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await adminApi.get<{ key: string; value: StoreSettings }[]>('/settings');
        const storeSetting = settings.find((s) => s.key === 'store');
        if (storeSetting?.value) setStore(storeSetting.value);
      } catch { /* Use defaults */ } finally { setLoading(false); }
    })();
  }, []);

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStore(true); setStoreSaved(false);
    try {
      await adminApi.put('/settings', { key: 'store', value: store });
      setStoreSaved(true); setTimeout(() => setStoreSaved(false), 3000);
    } catch (err) { alert(err instanceof Error ? err.message : 'Erro ao salvar'); }
    finally { setSavingStore(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null); setPasswordSuccess(false);
    if (newPassword.length < 4) { setPasswordError('A nova senha deve ter pelo menos 4 caracteres'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('As senhas não coincidem'); return; }
    setSavingPassword(true);
    try {
      await adminApi.post('/change-password', { username, currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) { setPasswordError(err instanceof Error ? err.message : 'Erro ao alterar senha'); }
    finally { setSavingPassword(false); }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-300" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-white">Configurações</h1>
        <p className="mt-1 text-sm text-neutral-400">Dados da loja e segurança</p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSaveStore} className={card}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-300">Dados da loja</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className={labelClass}>Nome da loja</label><input type="text" value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Slogan</label><input type="text" value={store.tagline} onChange={(e) => setStore({ ...store, tagline: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>WhatsApp (com DDI)</label><input type="text" value={store.whatsapp} onChange={(e) => setStore({ ...store, whatsapp: e.target.value })} className={inputClass} placeholder="5573999929009" /></div>
            <div><label className={labelClass}>Instagram</label><input type="text" value={store.instagram} onChange={(e) => setStore({ ...store, instagram: e.target.value })} className={inputClass} placeholder="@mbmodabrasil" /></div>
            <div><label className={labelClass}>Endereço da loja física</label><input type="text" value={store.address} onChange={(e) => setStore({ ...store, address: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Horário da loja física</label><input type="text" value={store.hoursStore} onChange={(e) => setStore({ ...store, hoursStore: e.target.value })} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Horário do site</label><input type="text" value={store.hoursSite} onChange={(e) => setStore({ ...store, hoursSite: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button type="submit" disabled={savingStore} className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-white disabled:opacity-50">
              <Save size={16} /> {savingStore ? 'Salvando...' : 'Salvar'}
            </button>
            {storeSaved && <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-400"><Check size={16} /> Salvo!</span>}
          </div>
        </form>

        <form onSubmit={handleChangePassword} className={card}>
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-neutral-300">Alterar senha</h2>
          <p className="mb-4 text-xs text-neutral-500">Usuário atual: <span className="font-medium text-neutral-300">{username}</span></p>
          <div className="grid gap-4 md:grid-cols-3">
            <div><label className={labelClass}>Senha atual</label><input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Nova senha</label><input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Confirmar nova senha</label><input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} /></div>
          </div>
          {passwordError && <p className="mt-3 text-xs font-medium text-red-400">{passwordError}</p>}
          {passwordSuccess && <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-green-400"><Check size={14} /> Senha alterada com sucesso!</p>}
          <div className="mt-5">
            <button type="submit" disabled={savingPassword} className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:bg-neutral-800 disabled:opacity-50">
              <Lock size={16} /> {savingPassword ? 'Alterando...' : 'Alterar senha'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
