import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CartProvider } from '@/hooks/useCart';
import { TrackingProvider } from '@/hooks/useTracking';
import { AdminAuthProvider } from '@/hooks/useAdminAuth';
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
import { isEnvieyDomain, MB_SLUG } from '@/lib/domain';
import AdminLogin from '@/pages/admin/AdminLogin';
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

// MB catalog routes — shared between mbmodabrasil.com.br (at root) and
// enviey.app/mb-moda-brasil (under slug prefix). The `prefix` param lets
// the same routes work in both contexts without duplication.
function MBCatalogRoutes({ prefix }: { prefix: string }) {
  const p = (path: string) => `${prefix}${path}`;
  return (
    <>
      <Route path={p('/')} element={<PublicLayout><Home /></PublicLayout>} />
      <Route path={p('/feminino')} element={<PublicLayout><Catalog gender="feminino" /></PublicLayout>} />
      <Route path={p('/masculino')} element={<PublicLayout><Catalog gender="masculino" /></PublicLayout>} />
      <Route path={p('/ofertas')} element={<PublicLayout><Catalog offersOnly /></PublicLayout>} />
      <Route path={p('/categoria/:category')} element={<PublicLayout><Catalog /></PublicLayout>} />
      <Route path={p('/produto/:slug')} element={<PublicLayout><ProductPage /></PublicLayout>} />
      <Route path={p('/carrinho')} element={<PublicLayout><Cart /></PublicLayout>} />
      <Route path={p('/finalizar')} element={<PublicLayout><Checkout /></PublicLayout>} />
      <Route path={p('/buscar')} element={<PublicLayout><Search /></PublicLayout>} />
      <Route path={p('/sobre')} element={<PublicLayout><About /></PublicLayout>} />
      <Route path={p('/contato')} element={<PublicLayout><Contact /></PublicLayout>} />
    </>
  );
}

export default function App() {
  const enviey = isEnvieyDomain();

  return (
    <ErrorBoundary>
      <RemoveBoltBadge />
      <BrowserRouter>
        <AdminAuthProvider>
          <CartProvider>
            <TrackingProvider>
              <ScrollToTop />
              <Routes>
                {/* Admin login — public */}
                <Route path="/admin/login" element={<AdminLogin />} />

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

                {enviey ? (
                  <>
                    {/* Enviey platform — root shows the SaaS landing page */}
                    <Route path="/" element={<Presentation />} />
                    {/* Legacy redirect */}
                    <Route path="/apresentacao" element={<Navigate to="/" replace />} />
                    {/* MB catalog under slug prefix */}
                    <MBCatalogRoutes prefix={`/${MB_SLUG}`} />
                    {/* Fallback */}
                    <Route path="*" element={<Presentation />} />
                  </>
                ) : (
                  <>
                    {/* MB catalog at root (mbmodabrasil.com.br or localhost) */}
                    <MBCatalogRoutes prefix="" />
                    {/* Presentation page still accessible on MB domain */}
                    <Route path="/apresentacao" element={<Presentation />} />
                    {/* Fallback */}
                    <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
                  </>
                )}
              </Routes>
            </TrackingProvider>
          </CartProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
