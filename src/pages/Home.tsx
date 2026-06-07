/* ===== الصفحة الرئيسية ===== */

import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '../context';
import { HeroSection } from '../components/HeroSection';
import { ProductCard }  from '../components/ProductCard';
import { CATEGORIES }   from '../types';

export function HomePage() {
  const { products, navigateTo } = useApp();

  const featured = products.filter(p => p.featured && p.available).slice(0, 8);
  const newest   = products.filter(p => p.available)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div>
      <HeroSection />

      {/* أقسام المتجر */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              أقسام <span className="gold-gradient-text">متجرنا</span>
            </h2>
            <div className="gold-line w-20 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigateTo('products', { category: cat.id })}
                className="glass rounded-2xl p-4 sm:p-5 text-center hover:border-gold-400/30 border border-transparent transition-all group"
              >
                <div className="text-4xl sm:text-5xl mb-3">{cat.icon}</div>
                <h3 className="text-white font-bold text-sm sm:text-base group-hover:text-gold-400 transition-colors">{cat.name}</h3>
                <p className="text-dark-400 text-xs mt-1 hidden sm:block line-clamp-2">{cat.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* المنتجات المميزة */}
      {featured.length > 0 && (
        <section className="py-12 sm:py-16 px-4 sm:px-6 bg-black/20">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
                  منتجات <span className="gold-gradient-text">مميزة</span>
                </h2>
                <div className="gold-line w-20" />
              </div>
              <button onClick={() => navigateTo('products')} className="flex items-center gap-1 text-gold-400 text-sm hover:underline">
                عرض الكل <ChevronLeft size={16} />
              </button>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* الأحدث */}
      {newest.length > 0 && (
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
                  أحدث <span className="gold-gradient-text">الوافدين</span>
                </h2>
                <div className="gold-line w-20" />
              </div>
              <button onClick={() => navigateTo('products')} className="flex items-center gap-1 text-gold-400 text-sm hover:underline">
                عرض الكل <ChevronLeft size={16} />
              </button>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {newest.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass rounded-3xl p-8 sm:p-12 text-center border border-gold-400/15">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              ابدأ تجربة التسوق <span className="gold-gradient-text">الآن</span>
            </h2>
            <p className="text-dark-300 text-sm sm:text-base mb-6">
              توصيل سريع لجميع محافظات اليمن • منتجات أصلية مضمونة • دفع عند الاستلام
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigateTo('products')} className="btn-gold px-8 py-3">
                تصفح المنتجات
              </button>
              <button onClick={() => navigateTo('contact')} className="btn-gold-outline px-8 py-3">
                تواصل معنا
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
