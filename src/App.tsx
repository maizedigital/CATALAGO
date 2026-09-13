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
import { CatalogProvider } from '@/hooks/useCatalogContext';
import { ADMIN_BASE } from '@/config/site';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import ProductPage from '@/pages/ProductPage';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Search from '@/pages/Search';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Bio from '@/pages/Bio';
import NotFound from '@/pages/NotFound';
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

export default function App() {
  return (
    <ErrorBoundary>
      <RemoveBoltBadge />
      <BrowserRouter>
        <AdminAuthProvider>
          <CartProvider>
            <TrackingProvider>
              <CatalogProvider>
                <ScrollToTop />
                <Routes>
                  {/* Public catalog routes — MB Moda Brasil at root */}
                  <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                  <Route path="/feminino" element={<PublicLayout><Catalog gender="feminino" /></PublicLayout>} />
                  <Route path="/masculino" element={<PublicLayout><Catalog gender="masculino" /></PublicLayout>} />
                  <Route path="/geral" element={<PublicLayout><Catalog /></PublicLayout>} />
                  <Route path="/promocao" element={<PublicLayout><Catalog offersOnly /></PublicLayout>} />
                  <Route path="/ofertas" element={<PublicLayout><Catalog offersOnly /></PublicLayout>} />
                  <Route path="/categoria/:category" element={<PublicLayout><Catalog /></PublicLayout>} />
                  <Route path="/produto/:slug" element={<PublicLayout><ProductPage /></PublicLayout>} />
                  <Route path="/carrinho" element={<PublicLayout><Cart /></PublicLayout>} />
                  <Route path="/finalizar" element={<PublicLayout><Checkout /></PublicLayout>} />
                  <Route path="/buscar" element={<PublicLayout><Search /></PublicLayout>} />
                  <Route path="/sobre" element={<PublicLayout><About /></PublicLayout>} />
                  <Route path="/contato" element={<PublicLayout><Contact /></PublicLayout>} />
                  <Route path="/bio" element={<Bio />} />

                  {/* Admin login — public */}
                  <Route path={`${ADMIN_BASE}/login`} element={<AdminLogin />} />

                  {/* Admin protected routes */}
                  <Route path={ADMIN_BASE} element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                  <Route path={`${ADMIN_BASE}/produtos`} element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                  <Route path={`${ADMIN_BASE}/produtos/:id`} element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
                  <Route path={`${ADMIN_BASE}/pedidos`} element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                  <Route path={`${ADMIN_BASE}/pedidos/:id`} element={<ProtectedRoute><AdminOrderDetail /></ProtectedRoute>} />
                  <Route path={`${ADMIN_BASE}/crm`} element={<ProtectedRoute><AdminCRM /></ProtectedRoute>} />
                  <Route path={`${ADMIN_BASE}/leads`} element={<Navigate to={`${ADMIN_BASE}/crm`} replace />} />
                  <Route path={`${ADMIN_BASE}/clientes`} element={<Navigate to={`${ADMIN_BASE}/crm`} replace />} />
                  <Route path={`${ADMIN_BASE}/clientes/:id`} element={<ProtectedRoute><AdminCustomerDetail /></ProtectedRoute>} />
                  <Route path={`${ADMIN_BASE}/analytics`} element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
                  <Route path={`${ADMIN_BASE}/configuracoes`} element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
                  <Route path={`${ADMIN_BASE}/banners`} element={<ProtectedRoute><AdminBanners /></ProtectedRoute>} />
                  <Route path={`${ADMIN_BASE}/links`} element={<ProtectedRoute><AdminLinks /></ProtectedRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
                </Routes>
              </CatalogProvider>
            </TrackingProvider>
          </CartProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
