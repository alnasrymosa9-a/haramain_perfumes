/* ===== صفحة المنتجات ===== */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '../context';
import { ProductCard } from '../components/ProductCard';
import { Category, CATEGORIES } from '../types';

export function ProductsPage() {
  const { products, pageData } = useApp();

  // ✅ pageData قد يكون { category } من الصفحة الرئيسية أو Footer
  const initCat = (() => {
    const d = pageData as Record<string, unknown> | null;
    const c = d?.category;
    return typeof c === 'string' ? c as Category | 'all' : 'all';
  })();

  const [search,   setSearch]  = useState('');
  const [category, setCategory]= useState<Category | 'all'>(initCat);
  const [sortBy,   setSortBy]  = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [showSort, setShowSort]= useState(false);

  const filtered = useMemo(() => {
    let r = products.filter(p => p.available);
    if (category !== 'all') r = r.filter(p => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'price-low':  r = [...r].sort((a, b) => a.price - b.price); break;
      case 'price-high': r = [...r].sort((a, b) => b.price - a.price); break;
      default:           r = [...r].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return r;
  }, [products, category, search, sortBy]);

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            {category === 'all' ? 'جميع المنتجات' : CATEGORIES.find(c => c.id === category)?.name}
          </h1>
          <p className="text-dark-300 text-sm">{filtered.length} منتج متاح</p>
          <div className="gold-line w-24 mx-auto mt-4" />
        </motion.div>

        {/* بحث وفلترة */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
            <input type="text" placeholder="ابحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-dark-800 border border-gold-400/10 rounded-xl pr-12 pl-4 py-3 text-white placeholder-dark-400 focus:border-gold-400/30 focus:outline-none transition-colors" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={() => setCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${category === 'all' ? 'bg-gold-400 text-dark-900' : 'glass text-dark-300 hover:text-gold-400'}`}>
              الكل
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${category === cat.id ? 'bg-gold-400 text-dark-900' : 'glass text-dark-300 hover:text-gold-400'}`}>
                <span>{cat.icon}</span><span className="hidden sm:inline">{cat.name}</span>
              </button>
            ))}
            <button onClick={() => setShowSort(v => !v)}
              className="glass px-3 py-2 rounded-xl text-dark-300 hover:text-gold-400 transition-all flex items-center gap-1 mr-auto">
              <SlidersHorizontal size={16} /><span className="text-xs">ترتيب</span>
            </button>
          </div>

          {showSort && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-2 flex-wrap">
              {([['newest','الأحدث'],['price-low','السعر: الأقل'],['price-high','السعر: الأعلى']] as const).map(([id, label]) => (
                <button key={id} onClick={() => { setSortBy(id); setShowSort(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === id ? 'bg-gold-400/20 text-gold-400 border border-gold-400/30' : 'bg-dark-800 text-dark-400 hover:text-white border border-transparent'}`}>
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* شبكة المنتجات */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-white text-xl font-bold mb-2">لا توجد منتجات</h3>
            <p className="text-dark-400 text-sm">
              {search ? 'لم يتم العثور على منتجات تطابق بحثك' : 'لا توجد منتجات في هذا القسم حالياً'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
