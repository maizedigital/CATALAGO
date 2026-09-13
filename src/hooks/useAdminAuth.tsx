import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { adminLogin } from '@/lib/adminApi';
import { ADMIN_BASE } from '@/config/site';

interface AdminAuthState {
  isAuthenticated: boolean;
  username: string | null;
  mustChangePassword: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | undefined>(undefined);

const TOKEN_KEY = 'mb_admin_token';
const USER_KEY = 'mb_admin_user';
const MUST_CHANGE_KEY = 'mb_admin_must_change';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    const mustChange = localStorage.getItem(MUST_CHANGE_KEY) === 'true';
    if (token && user) {
      setIsAuthenticated(true);
      setUsername(user);
      setMustChangePassword(mustChange);
    }
    setLoading(false);
  }, []);

  const login = async (user: string, password: string) => {
    const result = await adminLogin(user, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, result.username);
    localStorage.setItem(MUST_CHANGE_KEY, String(result.must_change_password ?? false));
    setIsAuthenticated(true);
    setUsername(result.username);
    setMustChangePassword(result.must_change_password ?? false);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(MUST_CHANGE_KEY);
    setIsAuthenticated(false);
    setUsername(null);
    setMustChangePassword(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, username, mustChangePassword, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
