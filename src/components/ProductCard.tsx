/* ===== بطاقة المنتج ===== */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Package, Eye, Check } from 'lucide-react';
import { Product, CATEGORIES } from '../types';
import { useApp } from '../context';

interface Props {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: Props) {
  const { navigateTo, addToCart } = useApp();
  const [added, setAdded] = useState(false);

  const cat = CATEGORIES.find(c => c.id === product.category);

  // ✅ يُمرر productId فقط — هذا ما يقرأه ProductDetail
  const goDetail = () => navigateTo('product-detail', { productId: product.id });

  const handleCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.available) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4 }}
      className="product-card glass rounded-2xl overflow-hidden cursor-pointer group"
      onClick={goDetail}
    >
      {/* صورة المنتج */}
      <div className="relative overflow-hidden h-48 sm:h-56 bg-gradient-to-br from-amber-900/20 to-stone-800/40">
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt={product.name}
            className="w-full h-full object-cover product-image"
            loading="lazy"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-30">{cat?.icon ?? '📦'}</span>
          </div>
        )}

        {/* شارات */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.featured && (
            <span className="flex items-center gap-1 bg-gold-500/90 text-dark-900 text-xs font-bold px-2 py-0.5 rounded-lg">
              <Star size={10} fill="currentColor" />مميز
            </span>
          )}
          {!product.available && (
            <span className="bg-red-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-lg">نفد</span>
          )}
        </div>

        {/* أزرار overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={handleCart}
            disabled={!product.available}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all shadow-lg ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-gold-500 hover:bg-gold-400 text-dark-900 disabled:opacity-40'
            }`}
          >
            {added ? <><Check size={14} />أُضيف</> : <><ShoppingCart size={14} />سلة</>}
          </button>
          <button
            onClick={e => { e.stopPropagation(); goDetail(); }}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all"
          >
            <Eye size={14} />عرض
          </button>
        </div>
      </div>

      {/* بيانات المنتج */}
      <div className="p-4">
        <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2 mb-1 group-hover:text-gold-300 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-amber-100/40 text-xs line-clamp-2 mb-3">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gold-400 font-black text-base sm:text-lg">
            {product.price.toLocaleString('ar-YE')}
            <span className="text-xs font-normal text-amber-100/40 mr-1">ر.ي</span>
          </span>
          <div className="flex items-center gap-1 text-amber-100/40 text-xs">
            <Package size={12} /><span>{product.quantity}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
