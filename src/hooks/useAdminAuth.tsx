import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { adminLogin } from '@/lib/adminApi';

interface AdminAuthState {
  isAuthenticated: boolean;
  username: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | undefined>(undefined);

const TOKEN_KEY = 'mb_admin_token';
const USER_KEY = 'mb_admin_user';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    if (token && user) {
      setIsAuthenticated(true);
      setUsername(user);
    }
    setLoading(false);
  }, []);

  const login = async (user: string, password: string) => {
    const result = await adminLogin(user, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, result.username);
    setIsAuthenticated(true);
    setUsername(result.username);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setIsAuthenticated(false);
    setUsername(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, username, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
