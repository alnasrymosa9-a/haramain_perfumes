/* ===== تطبيق الحرمين للعود والعطور ===== */

import { Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context';
import { Layout }           from './components/Layout';
import { HomePage }         from './pages/Home';
import { ProductsPage }     from './pages/Products';
import { ProductDetailPage } from './pages/ProductDetail';
import { ContactPage }      from './pages/Contact';
import { LoginPage }        from './pages/Login';
import { OffersPage }       from './pages/Offers';
import { TrackOrderPage }   from './pages/TrackOrder';
import { AdminPanel }       from './admin/AdminPanel';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

const fade = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: 'easeInOut' },
} as const;

function PageRouter() {
  const { currentPage, isAdmin } = useApp();

  if (currentPage.startsWith('admin')) {
    if (!isAdmin) {
      return (
        <Layout>
          <motion.div key="login" {...fade}><LoginPage /></motion.div>
        </Layout>
      );
    }
    return <AdminPanel />;
  }

  const page = (() => {
    switch (currentPage) {
      case 'home':           return <HomePage />;
      case 'products':       return <ProductsPage />;
      case 'product-detail': return <ProductDetailPage />;
      case 'contact':        return <ContactPage />;
      case 'offers':         return <OffersPage />;
      case 'login':          return <LoginPage />;
      case 'track-order':    return <TrackOrderPage />;
      default:               return <HomePage />;
    }
  })();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div key={currentPage} {...fade}>{page}</motion.div>
      </AnimatePresence>
    </Layout>
  );
}

function Splash() {
  return (
    <div className="min-h-screen luxury-bg flex items-center justify-center">
      <div className="text-center">
        <img src="/logo.png" alt="الحرمين" className="w-20 h-20 mx-auto mb-4 rounded-full animate-pulse" />
        <p className="text-gold-400 font-bold gold-shimmer">الحرمين للعود والعطور</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Splash />}>
      <AppProvider>
        <PageRouter />
        <PWAInstallPrompt />
      </AppProvider>
    </Suspense>
  );
}
