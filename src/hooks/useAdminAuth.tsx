import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { adminLogin } from '@/lib/adminApi';

interface AdminAuthState {
  isAuthenticated: boolean;
  username: string | null;
  catalogId: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | undefined>(undefined);

const TOKEN_KEY = 'mb_admin_token';
const USER_KEY = 'mb_admin_user';
const CATALOG_KEY = 'mb_admin_catalog_id';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    const catalog = localStorage.getItem(CATALOG_KEY);
    if (token && user) {
      setIsAuthenticated(true);
      setUsername(user);
      setCatalogId(catalog);
    }
    setLoading(false);
  }, []);

  const login = async (user: string, password: string) => {
    const result = await adminLogin(user, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, result.username);
    if (result.catalog_id) localStorage.setItem(CATALOG_KEY, result.catalog_id);
    setIsAuthenticated(true);
    setUsername(result.username);
    setCatalogId(result.catalog_id ?? null);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CATALOG_KEY);
    setIsAuthenticated(false);
    setUsername(null);
    setCatalogId(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, username, catalogId, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
