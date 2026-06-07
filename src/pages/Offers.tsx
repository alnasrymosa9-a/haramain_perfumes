/* ===== صفحة العروض ===== */

import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { useApp } from '../context';
import { ProductCard } from '../components/ProductCard';

export function OffersPage() {
  const { products } = useApp();
  const offers = products.filter(p => p.category === 'offers' && p.available);

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4">
            <Tag size={16} className="text-gold-400" />
            <span className="text-gold-400 text-sm font-medium">عروض حصرية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            العروض <span className="gold-gradient-text">الخاصة</span>
          </h1>
          <p className="text-dark-300 text-sm">أفضل الأسعار والعروض المميزة لعملائنا الكرام</p>
          <div className="gold-line w-24 mx-auto mt-4" />
        </motion.div>

        {offers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {offers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-7xl mb-5">🎁</div>
            <h3 className="text-white text-xl font-bold mb-2">لا توجد عروض حالياً</h3>
            <p className="text-dark-400 text-sm">تابعنا لمعرفة أحدث العروض والتخفيضات</p>
          </div>
        )}
      </div>
    </div>
  );
}
