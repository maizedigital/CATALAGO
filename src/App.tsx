import { useEffect } from 'react';








const removeFloating = () => {

  document.querySelectorAll('[style="position: fixed"][style="bottom: 1rem"][style="right: 1rem"][style="z-index: 2147483647"]').forEach(el => el.remove());

};



// executa já no load

removeFloating();



// observa mudanças no DOM

const observer = new MutationObserver(removeFloating);

observer.observe(document.body, { childList: true, subtree: true });


import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { CartDrawer } from '@/components/CartDrawer';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
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
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminProductForm from '@/pages/admin/AdminProductForm';
import AdminCRM from '@/pages/admin/AdminCRM';
import AdminLeads from '@/pages/admin/AdminLeads';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminCustomerDetail from '@/pages/admin/AdminCustomerDetail';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminOrderDetail from '@/pages/admin/AdminOrderDetail';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSettings from '@/pages/admin/AdminSettings';

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
      <WhatsAppButton />
      <LeadCaptureModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
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
                <Route path="/admin/leads" element={<ProtectedRoute><AdminLeads /></ProtectedRoute>} />
                <Route path="/admin/clientes" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
                <Route path="/admin/clientes/:id" element={<ProtectedRoute><AdminCustomerDetail /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
                <Route path="/admin/configuracoes" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

                {/* Public routes */}
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/feminino" element={<PublicLayout><Catalog gender="feminino" /></PublicLayout>} />
                <Route path="/masculino" element={<PublicLayout><Catalog gender="masculino" /></PublicLayout>} />
                <Route path="/produto/:slug" element={<PublicLayout><ProductPage /></PublicLayout>} />
                <Route path="/carrinho" element={<PublicLayout><Cart /></PublicLayout>} />
                <Route path="/finalizar" element={<PublicLayout><Checkout /></PublicLayout>} />
                <Route path="/buscar" element={<PublicLayout><Search /></PublicLayout>} />
                <Route path="/sobre" element={<PublicLayout><About /></PublicLayout>} />
                <Route path="/contato" element={<PublicLayout><Contact /></PublicLayout>} />
                <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
              </Routes>
            </TrackingProvider>
          </CartProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
