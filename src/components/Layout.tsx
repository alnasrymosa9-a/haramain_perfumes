/* ===== Layout ===== */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, MessageCircle, Phone, MapPin, Gift, Home,
  Package, PhoneCall, LogIn, LogOut, Settings, ShoppingCart,
  Mail, Search,
} from 'lucide-react';
import { useApp } from '../context';
import { CATEGORIES, Page } from '../types';
import { STORE_INFO } from '../data';
import { CartDrawer } from './CartDrawer';
import { BackButton } from './BackButton';

export function Navbar() {
  const { currentPage, navigateTo, isAdmin, logout, cartCount } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [currentPage]);

  type NavPage = Extract<Page, 'home' | 'products' | 'offers' | 'contact' | 'track-order'>;
  const navItems: { id: NavPage; label: string; icon: React.ElementType }[] = [
    { id: 'home',        label: 'الرئيسية',   icon: Home },
    { id: 'products',    label: 'المنتجات',   icon: Package },
    { id: 'offers',      label: 'العروض',     icon: Gift },
    { id: 'track-order', label: 'تتبع طلبي',  icon: Search },
    { id: 'contact',     label: 'تواصل معنا', icon: PhoneCall },
  ];

  const active = (id: string) =>
    currentPage === id || (id === 'admin-dashboard' && currentPage.startsWith('admin'));

  const cls = (id: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
      active(id) ? 'bg-gold-400/15 text-gold-400' : 'text-amber-100/70 hover:text-gold-400 hover:bg-gold-400/5'
    }`;

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'glass-dark shadow-lg shadow-black/30' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          // بعد:
<div className="flex items-center justify-between h-16 sm:h-20 relative">

            {/* الشعار */}
            <button onClick={() => navigateTo('home')} className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 group" aria-label="الرئيسية">
              <img
                src="/logo.png"
                alt="الحرمين"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-lg shadow-gold-400/20 group-hover:shadow-gold-400/40 transition-all border border-gold-400/30"
              />
              <div className="hidden sm:block">
                <p className="text-gold-400 font-black text-base leading-tight">الحرمين</p>
                <p className="text-amber-200/60 text-xs">للعود والعطور</p>
              </div>
            </button>

            {/* روابط سطح المكتب */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => navigateTo(id)} className={cls(id)}>
                  <Icon size={15} />{label}
                </button>
              ))}
              {isAdmin ? (
                <div className="flex items-center gap-1 mr-2 border-r border-gold-400/15 pr-2">
                  <button onClick={() => navigateTo('admin-dashboard')} className={cls('admin-dashboard')}>
                    <Settings size={15} />لوحة التحكم
                  </button>
                  <button onClick={logout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all" aria-label="خروج">
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <button onClick={() => navigateTo('login')} className={cls('login')}>
                  <LogIn size={15} />دخول
                </button>
              )}
            </div>

            {/* أيقونات اليمين */}
            <div className="flex items-center gap-1">
              <button onClick={() => setCartOpen(true)} className="relative p-2 text-gold-400 hover:bg-gold-400/10 rounded-xl transition-all" aria-label="السلة">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-dark-900 text-xs font-black rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
              <button onClick={() => setMenuOpen(v => !v)} className="lg:hidden p-2 text-gold-400 hover:bg-gold-400/10 rounded-xl transition-all" aria-label="القائمة">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* قائمة الجوال */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
              className="lg:hidden glass-dark border-t border-gold-400/10 overflow-hidden">
              <div className="px-4 py-3 space-y-1">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => navigateTo(id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${active(id) ? 'bg-gold-400/15 text-gold-400' : 'text-amber-100/70 hover:text-gold-400 hover:bg-gold-400/5'}`}>
                    <Icon size={18} /><span className="font-medium">{label}</span>
                  </button>
                ))}
                <div className="border-t border-gold-400/10 my-1" />
                {isAdmin ? (
                  <>
                    <button onClick={() => navigateTo('admin-dashboard')} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-amber-100/70 hover:text-gold-400 hover:bg-gold-400/5 transition-all">
                      <Settings size={18} /><span className="font-medium">لوحة التحكم</span>
                    </button>
                    <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                      <LogOut size={18} /><span className="font-medium">تسجيل الخروج</span>
                    </button>
                  </>
                ) : (
                  <button onClick={() => navigateTo('login')} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-amber-100/70 hover:text-gold-400 hover:bg-gold-400/5 transition-all">
                    <LogIn size={18} /><span className="font-medium">تسجيل الدخول</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export function Footer() {
  const { navigateTo } = useApp();
  return (
    <footer className="bg-stone-950/90 border-t border-gold-400/15 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="الحرمين" className="w-14 h-14 rounded-full object-cover border border-gold-400/30" />
              <div>
                <h3 className="text-gold-400 font-black text-lg">الحرمين</h3>
                <p className="text-amber-100/50 text-xs">للعود والعطور ومستلزمات البخور</p>
              </div>
            </div>
            <p className="text-amber-100/50 text-sm leading-relaxed">نقدم أرقى وأجود أنواع العطور والعود ومستلزمات البخور في اليمن.</p>
          </div>
          <div>
            <h4 className="text-gold-400 font-bold mb-4">أقسامنا</h4>
            <div className="space-y-2">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => navigateTo('products', { category: cat.id })} className="block text-amber-100/50 hover:text-gold-400 transition-colors text-sm text-right w-full">
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-gold-400 font-bold mb-4">تواصل معنا</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-amber-100/50 text-sm"><MapPin size={16} className="text-gold-400 mt-0.5 shrink-0" /><span>{STORE_INFO.address}</span></div>
              <a href={`tel:${STORE_INFO.whatsapp}`} className="flex items-center gap-2 text-amber-100/50 hover:text-gold-400 text-sm transition-colors"><Phone size={16} className="text-gold-400 shrink-0" /><span dir="ltr">{STORE_INFO.whatsapp}</span></a>
              <a href={`mailto:${STORE_INFO.email}`} className="flex items-center gap-2 text-amber-100/50 hover:text-gold-400 text-sm transition-colors"><Mail size={16} className="text-gold-400 shrink-0" /><span>{STORE_INFO.email}</span></a>
              <div className="flex items-center gap-2 text-amber-100/50 text-sm"><MessageCircle size={16} className="text-gold-400 shrink-0" /><span>واتساب متاح 24/7</span></div>
            </div>
          </div>
        </div>
        <div className="border-t border-gold-400/10 mt-8 pt-6 text-center space-y-1">
          <p className="text-amber-100/30 text-sm">© {new Date().getFullYear()} {STORE_INFO.name} — جميع الحقوق محفوظة</p>
          <p className="text-amber-100/20 text-xs">
            تطوير{' '}
            <a
              href="https://wa.me/967770909668"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold-400/60 transition-colors"
            >
              {STORE_INFO.developer} · {STORE_INFO.developerPhone}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFloat() {
  const { sendWhatsApp } = useApp();
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 2000); return () => clearTimeout(t); }, []);
  if (!visible) return null;
  return (
    <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
      onClick={() => sendWhatsApp('السلام عليكم، أريد الاستفسار عن المنتجات')}
      className="fixed bottom-6 left-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse-gold transition-colors"
      aria-label="واتساب">
      <MessageCircle size={28} className="text-white" />
    </motion.button>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen luxury-bg font-cairo">
      <Navbar />
      <BackButton />
      <main className="pt-16 sm:pt-20">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
