import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Image as ImageIcon,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Logo } from '@/components/Logo';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/crm', label: 'CRM', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-neutral-900 border-r border-neutral-800 text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-800">
          <Logo dark />
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-neutral-500 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-2">
          <span className="px-3 text-xs font-medium uppercase tracking-wider text-neutral-600">
            Gerenciamento
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-800 px-4 py-4">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
          >
            <ExternalLink size={18} />
            Ver site
          </a>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-neutral-800/50 px-3 py-2.5">
            <span className="text-sm text-neutral-300">{username}</span>
            <button
              onClick={handleLogout}
              className="text-neutral-500 transition-colors hover:text-white"
              aria-label="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:ml-64">
        <header className="flex h-16 items-center gap-4 border-b border-neutral-800 bg-neutral-900 px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-neutral-400"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2"><Logo dark /><span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Admin</span></div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
