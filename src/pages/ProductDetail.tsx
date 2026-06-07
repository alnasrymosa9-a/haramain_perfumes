/* ===== صفحة تفاصيل المنتج ===== */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, MessageCircle, Star, Share2, Check, Package, ShoppingCart } from 'lucide-react';
import { useApp } from '../context';
import { OrderForm } from '../components/OrderForm';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../types';

export function ProductDetailPage() {
  const { products, pageData, navigateTo, sendWhatsApp, addToCart } = useApp();

  // ✅ pageData هو { productId: string } كما يُرسله ProductCard
  const productId = (pageData as { productId?: string } | null)?.productId ?? '';
  const product = useMemo(() => products.find(p => p.id === productId), [products, productId]);

  const [qty,         setQty]         = useState(1);
  const [imgIdx,      setImgIdx]      = useState(0);
  const [orderOpen,   setOrderOpen]   = useState(false);
  const [cartAdded,   setCartAdded]   = useState(false);

  const related = useMemo(() =>
    product
      ? products.filter(p => p.category === product.category && p.id !== product.id && p.available).slice(0, 4)
      : [],
    [products, product]
  );

  /* ── منتج غير موجود ──────────────────────────────────────────────── */
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-5">😔</div>
          <h2 className="text-white text-2xl font-bold mb-3">المنتج غير موجود</h2>
          <p className="text-dark-400 text-sm mb-6">ربما تم حذفه أو الرابط غير صحيح</p>
          <button onClick={() => navigateTo('products')} className="btn-gold">
            العودة للمنتجات
          </button>
        </div>
      </div>
    );
  }

  const allImages = [product.mainImage, ...product.images].filter(Boolean);
  const cat       = CATEGORIES.find(c => c.id === product.category);
  const fmt       = (n: number) => `${n.toLocaleString('ar-YE')} ر.ي`;

  const handleAddToCart = () => {
    addToCart(product, qty);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  const handleShare = async () => {
    if (!navigator.share) return;
    try { await navigator.share({ title: product.name, text: product.description }); } catch { /* cancelled */ }
  };

  return (
    <div className="min-h-screen py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* مسار */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap text-dark-400">
          <button onClick={() => navigateTo('home')} className="hover:text-gold-400 transition-colors">الرئيسية</button>
          <span>/</span>
          <button onClick={() => navigateTo('products', { category: product.category })} className="hover:text-gold-400 transition-colors">{cat?.name}</button>
          <span>/</span>
          <span className="text-gold-400 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
          {/* الصور */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square rounded-2xl overflow-hidden bg-dark-800 border border-gold-400/10 mb-3">
              {allImages.length > 0 && allImages[imgIdx] ? (
                <img src={allImages[imgIdx]} alt={product.name} className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full img-placeholder">
                  <span className="text-8xl opacity-30">{cat?.icon ?? '📦'}</span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${imgIdx === i ? 'border-gold-400' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* التفاصيل */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
            {/* شارات */}
            <div className="flex flex-wrap gap-2">
              <span className="glass px-3 py-1 rounded-full text-xs text-gold-400">{cat?.icon} {cat?.name}</span>
              {product.featured && (
                <span className="bg-gold-400/15 text-gold-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star size={11} fill="currentColor" />مميز
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${product.available ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                {product.available ? <><Check size={11} />متوفر</> : 'غير متوفر'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">{product.name}</h1>
            {product.description && <p className="text-dark-300 text-sm sm:text-base leading-relaxed">{product.description}</p>}

            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-dark-300 text-sm">السعر</span>
                <span className="text-gold-400 font-black text-2xl sm:text-3xl">{fmt(product.price)}</span>
              </div>
              {qty > 1 && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gold-400/10">
                  <span className="text-dark-400 text-sm">الإجمالي ({qty} قطع)</span>
                  <span className="text-white font-bold">{fmt(product.price * qty)}</span>
                </div>
              )}
            </div>

            {product.available && (
              <div className="flex items-center gap-4">
                <span className="text-dark-300 text-sm font-medium">الكمية:</span>
                <div className="flex items-center glass rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-gold-400 hover:bg-white/5 transition-colors"><Minus size={16} /></button>
                  <span className="px-5 py-3 text-white font-bold text-lg min-w-[50px] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.quantity, q + 1))} className="px-4 py-3 text-gold-400 hover:bg-white/5 transition-colors"><Plus size={16} /></button>
                </div>
                <span className="text-dark-500 text-xs">(متوفر: {product.quantity})</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {product.available && (
                <>
                  <button onClick={() => setOrderOpen(true)} className="btn-gold flex-1 flex items-center justify-center gap-2 py-3.5 text-base">
                    <ShoppingBag size={20} />تأكيد الطلب
                  </button>
                  <button onClick={handleAddToCart}
                    className={`flex-1 border-2 font-bold rounded-xl flex items-center justify-center gap-2 py-3.5 text-base transition-all ${cartAdded ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-gold-400/30 text-gold-400 hover:bg-gold-400/5'}`}>
                    {cartAdded ? <><Check size={20} />أُضيف للسلة</> : <><ShoppingCart size={20} />أضف للسلة</>}
                  </button>
                </>
              )}
              <button onClick={() => sendWhatsApp(`السلام عليكم\nأريد الاستفسار عن:\n📦 ${product.name}\n💰 ${fmt(product.price)}`)}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 py-3.5 text-base transition-colors">
                <MessageCircle size={20} />واتساب
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-3 text-center"><Package size={18} className="text-gold-400 mx-auto mb-1" /><span className="text-dark-300 text-xs">توصيل لجميع المحافظات</span></div>
              <div className="glass rounded-xl p-3 text-center"><Star size={18} className="text-gold-400 mx-auto mb-1" /><span className="text-dark-300 text-xs">منتجات أصلية مضمونة</span></div>
            </div>

            {navigator.share && (
              <button onClick={handleShare} className="flex items-center gap-2 text-dark-400 hover:text-gold-400 transition-colors text-sm">
                <Share2 size={15} />مشاركة المنتج
              </button>
            )}
          </motion.div>
        </div>

        {/* منتجات مشابهة */}
        {related.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              منتجات <span className="gold-gradient-text">مشابهة</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {orderOpen && product.available && (
        <OrderForm product={product} quantity={qty} onClose={() => setOrderOpen(false)} />
      )}
    </div>
  );
}
