import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CartProvider } from '@/hooks/useCart';
import { TrackingProvider } from '@/hooks/useTracking';
import { AdminAuthProvider } from '@/hooks/useAdminAuth';
import { CatalogProvider, useCatalogBySlug, type CatalogInfo } from '@/hooks/useCatalogContext';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import ProductPage from '@/pages/ProductPage';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Search from '@/pages/Search';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';
import Presentation from '@/pages/Presentation';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminSignup from '@/pages/admin/AdminSignup';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminProductForm from '@/pages/admin/AdminProductForm';
import AdminCRM from '@/pages/admin/AdminCRM';
import AdminCustomerDetail from '@/pages/admin/AdminCustomerDetail';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminOrderDetail from '@/pages/admin/AdminOrderDetail';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminBanners from '@/pages/admin/AdminBanners';
import AdminLinks from '@/pages/admin/AdminLinks';
import AdminTenants from '@/pages/admin/AdminTenants';

function RemoveBoltBadge() {
  useEffect(() => {
    const removeBoltBadge = () => {
      const knownBadge = document.querySelector('[data-bolt-badge], [class*="bolt-badge"]');
      if (knownBadge) knownBadge.remove();
      const textBadge = Array.from(document.body.querySelectorAll<HTMLElement>('*'))
        .filter((element) => {
          const text = element.textContent?.trim() || '';
          const position = window.getComputedStyle(element).position;
          return text.includes('Made in Bolt') && text.length < 80 && (position === 'fixed' || position === 'absolute');
        })
        .sort((a, b) => a.textContent!.length - b.textContent!.length)[0];
      if (textBadge) textBadge.remove();
    };

    removeBoltBadge();
    const observer = new MutationObserver(removeBoltBadge);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

function TenantCatalogLayout({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const { catalog, loading, error } = useCatalogBySlug(slug);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-pulse text-sm text-neutral-400">Carregando loja...</div>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Loja não encontrada</h1>
        <p className="mt-2 text-sm text-neutral-500">Esta loja não existe ou não está disponível.</p>
        <a href="/" className="mt-6 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-bold text-white">Voltar para Enviey</a>
      </div>
    );
  }

  return (
    <CatalogProvider catalog={catalog}>
      <PublicLayout>{children}</PublicLayout>
    </CatalogProvider>
  );
}

// Dynamic tenant catalog routes — any /:slug/* resolves to a tenant catalog.
function tenantCatalogRoutes(slug: string) {
  const p = (path: string) => `/${slug}${path}`;
  return [
    <Route key={p('/')} path={p('/')} element={<TenantCatalogLayout><Home /></TenantCatalogLayout>} />,
    <Route key={p('/feminino')} path={p('/feminino')} element={<TenantCatalogLayout><Catalog gender="feminino" /></TenantCatalogLayout>} />,
    <Route key={p('/masculino')} path={p('/masculino')} element={<TenantCatalogLayout><Catalog gender="masculino" /></TenantCatalogLayout>} />,
    <Route key={p('/geral')} path={p('/geral')} element={<TenantCatalogLayout><Catalog /></TenantCatalogLayout>} />,
    <Route key={p('/promocao')} path={p('/promocao')} element={<TenantCatalogLayout><Catalog offersOnly /></TenantCatalogLayout>} />,
    <Route key={p('/ofertas')} path={p('/ofertas')} element={<TenantCatalogLayout><Catalog offersOnly /></TenantCatalogLayout>} />,
    <Route key={p('/categoria/:category')} path={p('/categoria/:category')} element={<TenantCatalogLayout><Catalog /></TenantCatalogLayout>} />,
    <Route key={p('/produto/:slug')} path={p('/produto/:slug')} element={<TenantCatalogLayout><ProductPage /></TenantCatalogLayout>} />,
    <Route key={p('/carrinho')} path={p('/carrinho')} element={<TenantCatalogLayout><Cart /></TenantCatalogLayout>} />,
    <Route key={p('/finalizar')} path={p('/finalizar')} element={<TenantCatalogLayout><Checkout /></TenantCatalogLayout>} />,
    <Route key={p('/buscar')} path={p('/buscar')} element={<TenantCatalogLayout><Search /></TenantCatalogLayout>} />,
    <Route key={p('/sobre')} path={p('/sobre')} element={<TenantCatalogLayout><About /></TenantCatalogLayout>} />,
    <Route key={p('/contato')} path={p('/contato')} element={<TenantCatalogLayout><Contact /></TenantCatalogLayout>} />,
  ];
}

export default function App() {
  return (
    <ErrorBoundary>
      <RemoveBoltBadge />
      <BrowserRouter>
        <AdminAuthProvider>
          <CartProvider>
            <TrackingProvider>
              <ScrollToTop />
              <Routes>
                {/* Enviey landing page */}
                <Route path="/" element={<Presentation />} />
                <Route path="/apresentacao" element={<Navigate to="/" replace />} />

                {/* Admin auth — public */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/cadastro" element={<AdminSignup />} />

                {/* Admin protected routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/produtos" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                <Route path="/admin/produtos/:id" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
                <Route path="/admin/pedidos" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/pedidos/:id" element={<ProtectedRoute><AdminOrderDetail /></ProtectedRoute>} />
                <Route path="/admin/crm" element={<ProtectedRoute><AdminCRM /></ProtectedRoute>} />
                <Route path="/admin/leads" element={<Navigate to="/admin/crm" replace />} />
                <Route path="/admin/clientes" element={<Navigate to="/admin/crm" replace />} />
                <Route path="/admin/clientes/:id" element={<ProtectedRoute><AdminCustomerDetail /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
                <Route path="/admin/configuracoes" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
                <Route path="/admin/banners" element={<ProtectedRoute><AdminBanners /></ProtectedRoute>} />
                <Route path="/admin/links" element={<ProtectedRoute><AdminLinks /></ProtectedRoute>} />
                <Route path="/admin/clientes-tenant" element={<ProtectedRoute><AdminTenants /></ProtectedRoute>} />

                {/* Dynamic tenant catalog routes — /:slug/* */}
                {tenantCatalogRoutes(':slug')}

                {/* Fallback */}
                <Route path="*" element={<Presentation />} />
              </Routes>
            </TrackingProvider>
          </CartProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
