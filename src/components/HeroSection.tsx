/* ===== Hero Section ===== */

import { motion } from 'framer-motion';
import { ChevronLeft, Star, Sparkles } from 'lucide-react';
import { useApp } from '../context';

export function HeroSection() {
  const { navigateTo, products } = useApp();
  const featuredCount = products.filter(p => p.featured && p.available).length;
  const totalProducts = products.filter(p => p.available).length;

  return (
    <section className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gold-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-amber-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* شعار المحل */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="mb-6 sm:mb-8"
        >
          <img
            src="/logo.png"
            alt="الحرمين للعود والعطور"
            className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full object-cover border-2 border-gold-400/40 shadow-2xl shadow-gold-400/20"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
          <Sparkles size={14} className="text-gold-400" />
          <span className="text-gold-400 text-sm font-medium">أرقى العطور اليمنية</span>
          <Sparkles size={14} className="text-gold-400" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight">
          الحرمين للعود
          <br />
          <span className="gold-gradient-text">والعطور</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="text-amber-100/60 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          اكتشف عالماً من الأناقة والرقي مع أجود أنواع العطور العربية والعود الطبيعي ومستلزمات البخور الفاخرة
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button onClick={() => navigateTo('products')} className="btn-gold flex items-center gap-2 px-8 py-4 text-base sm:text-lg shadow-lg shadow-gold-400/20">
            تصفح المنتجات <ChevronLeft size={20} />
          </button>
          <button onClick={() => navigateTo('offers')} className="btn-gold-outline flex items-center gap-2 px-8 py-4 text-base sm:text-lg">
            <Star size={18} />العروض الخاصة
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
          className="flex items-center justify-center gap-6 sm:gap-10 mt-12 sm:mt-16">
          {[
            { value: `${totalProducts}+`, label: 'منتج متاح' },
            { value: `${featuredCount}+`, label: 'منتج مميز' },
            { value: '100%',              label: 'منتجات أصلية' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-gold-400 font-black text-2xl sm:text-3xl">{stat.value}</p>
              <p className="text-amber-100/50 text-xs sm:text-sm mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
