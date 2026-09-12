const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const apiUrl = (path: string) => `${SUPABASE_URL}/functions/v1/admin-api/${path}`;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('mb_admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'X-Client-Info': 'mb-admin',
    'Apikey': SUPABASE_ANON_KEY,
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['X-Admin-Token'] = token;

  const res = await fetch(apiUrl(path), { ...options, headers });
  if (!res.ok) {
    if (res.status === 401) handleExpiredSession();
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Erro ${res.status}`);
  }
  return res.json();
}

// The server now validates the admin session, so a 401 means the stored token is
// expired or invalid. Clear it and send the user back to the login screen.
function handleExpiredSession() {
  localStorage.removeItem('mb_admin_token');
  localStorage.removeItem('mb_admin_user');
  if (!window.location.pathname.startsWith('/admin/login')) {
    window.location.href = '/admin/login';
  }
}

export const adminApi = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export async function uploadProductImage(file: File): Promise<string> {
  const token = localStorage.getItem('mb_admin_token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(apiUrl('upload'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'X-Client-Info': 'mb-admin',
      'Apikey': SUPABASE_ANON_KEY,
      ...(token ? { 'X-Admin-Token': token } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Erro ${res.status}`);
  }
  const data = await res.json() as { url: string };
  return data.url;
}

export async function uploadBannerImage(file: File): Promise<string> {
  const token = localStorage.getItem('mb_admin_token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(apiUrl('banner-upload'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'X-Client-Info': 'mb-admin',
      'Apikey': SUPABASE_ANON_KEY,
      ...(token ? { 'X-Admin-Token': token } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Erro ${res.status}`);
  }
  const data = await res.json() as { url: string };
  return data.url;
}

export async function uploadBannerVideo(file: File): Promise<string> {
  const token = localStorage.getItem('mb_admin_token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(apiUrl('video-upload'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'X-Client-Info': 'mb-admin',
      'Apikey': SUPABASE_ANON_KEY,
      ...(token ? { 'X-Admin-Token': token } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Erro ${res.status}`);
  }
  const data = await res.json() as { url: string };
  return data.url;
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'X-Client-Info': 'mb-admin',
      'Apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Credenciais inválidas');
  }
  return res.json() as Promise<{ token: string; username: string; id: string }>;
}
