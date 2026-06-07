/* ===== صفحة تتبع الطلب ===== */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, CheckCircle, Clock, Truck, XCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context';
import {
  OrderStatus,
  ORDER_STATUS_MAP,
  ORDER_STATUS_STEPS,
  Order,
} from '../types';
import { supabase, isSupabaseConfigured } from '../supabase';

/* ── أيقونة كل حالة ── */
function StatusIcon({ status }: { status: OrderStatus }) {
  const icons: Record<OrderStatus, React.ReactNode> = {
    new:            <Package    size={22} />,
    deposit_review: <Clock      size={22} />,
    preparing:      <Truck      size={22} />,
    delivered:      <CheckCircle size={22} />,
    cancelled:      <XCircle    size={22} />,
  };
  return <>{icons[status]}</>;
}

/* ── لون كل حالة ── */
function statusColor(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    new:            'bg-blue-500/20   text-blue-400   border-blue-500/40',
    deposit_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    preparing:      'bg-purple-500/20 text-purple-400 border-purple-500/40',
    delivered:      'bg-green-500/20  text-green-400  border-green-500/40',
    cancelled:      'bg-red-500/20    text-red-400    border-red-500/40',
  };
  return map[status];
}

/* ── بحث في Supabase أو محلياً ── */
async function fetchOrder(
  query: string,
  localOrders: Order[]
): Promise<Order | null> {
  const q = query.trim();
  if (!q) return null;

  if (isSupabaseConfigured) {
    // بحث برقم الطلب أولاً
    const { data: byId } = await supabase
      .from('orders')
      .select('*')
      .eq('id', q)
      .maybeSingle();

    if (byId) {
      return {
        id:              String(byId.id),
        customerName:    String(byId.customer_name   ?? ''),
        phone:           String(byId.phone           ?? ''),
        governorate:     String(byId.governorate     ?? ''),
        district:        String(byId.district        ?? ''),
        address:         String(byId.address         ?? ''),
        items:           Array.isArray(byId.items) ? byId.items : [],
        totalPrice:      Number(byId.total_price)    || 0,
        deposit:         Number(byId.deposit)        || 0,
        transferReceipt: String(byId.transfer_receipt ?? ''),
        transferNumber:  String(byId.transfer_number  ?? ''),
        status:          (byId.status as OrderStatus) ?? 'new',
        createdAt:       String(byId.created_at ?? ''),
        updatedAt:       String(byId.updated_at ?? ''),
      };
    }

    // بحث برقم الهاتف — يُعيد آخر طلب
    const { data: byPhone } = await supabase
      .from('orders')
      .select('*')
      .eq('phone', q)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (byPhone) {
      return {
        id:              String(byPhone.id),
        customerName:    String(byPhone.customer_name   ?? ''),
        phone:           String(byPhone.phone           ?? ''),
        governorate:     String(byPhone.governorate     ?? ''),
        district:        String(byPhone.district        ?? ''),
        address:         String(byPhone.address         ?? ''),
        items:           Array.isArray(byPhone.items) ? byPhone.items : [],
        totalPrice:      Number(byPhone.total_price)    || 0,
        deposit:         Number(byPhone.deposit)        || 0,
        transferReceipt: String(byPhone.transfer_receipt ?? ''),
        transferNumber:  String(byPhone.transfer_number  ?? ''),
        status:          (byPhone.status as OrderStatus) ?? 'new',
        createdAt:       String(byPhone.created_at ?? ''),
        updatedAt:       String(byPhone.updated_at ?? ''),
      };
    }

    return null;
  }

  // بحث محلي (وضع التطوير)
  return (
    localOrders.find(o => o.id === q || o.phone === q) ?? null
  );
}

/* ── الصفحة الرئيسية ── */
export function TrackOrderPage() {
  const { orders } = useApp();
  const [query,    setQuery]   = useState('');
  const [result,   setResult]  = useState<Order | null>(null);
  const [notFound, setNotFound]= useState(false);
  const [loading,  setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const found = await fetchOrder(query, orders);
      if (found) {
        setResult(found);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  /* ── خطوات التتبع (شريط التقدم) ── */
  const renderSteps = (order: Order) => {
    if (order.status === 'cancelled') {
      return (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${statusColor('cancelled')}`}>
          <XCircle size={24} />
          <div>
            <p className="font-bold text-sm">تم إلغاء الطلب</p>
            <p className="text-xs opacity-70 mt-0.5">تواصل معنا للمزيد من التفاصيل</p>
          </div>
        </div>
      );
    }

    const currentIdx = ORDER_STATUS_STEPS.indexOf(order.status);

    return (
      <div className="space-y-2">
        {ORDER_STATUS_STEPS.map((step, idx) => {
          const done    = idx < currentIdx;
          const current = idx === currentIdx;
          const pending = idx > currentIdx;

          return (
            <div key={step}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                current ? statusColor(step)
                : done   ? 'bg-green-500/10 text-green-400 border-green-500/20'
                :          'bg-dark-900 text-dark-500 border-dark-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                current ? 'ring-2 ring-current'
                : done   ? 'bg-green-500/20'
                :          ''
              }`}>
                {done ? (
                  <CheckCircle size={18} className="text-green-400" />
                ) : (
                  <StatusIcon status={step} />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${pending ? 'text-dark-500' : ''}`}>
                  {ORDER_STATUS_MAP[step]}
                </p>
                {current && (
                  <p className="text-xs opacity-70 mt-0.5">الحالة الحالية</p>
                )}
              </div>
              {current && (
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">

        {/* رأس الصفحة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gold-400/15 flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-gold-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
            تتبع <span className="gold-gradient-text">طلبك</span>
          </h1>
          <p className="text-dark-300 text-sm">
            أدخل رقم طلبك أو رقم هاتفك لمعرفة حالة الطلب
          </p>
          <div className="gold-line w-20 mx-auto mt-4" />
        </motion.div>

        {/* حقل البحث */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 mb-6"
        >
          <label className="text-white text-sm font-medium block mb-3">
            رقم الطلب أو رقم الهاتف
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="مثال: ORD-abc123 أو 0774123456"
              dir="ltr"
              className="flex-1 bg-dark-900 border-2 border-gold-400/20 rounded-xl px-4 py-3.5 text-white placeholder-dark-400 focus:border-gold-400/50 focus:outline-none text-sm text-left transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="btn-gold px-5 flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {loading
                ? <Loader2 size={18} className="animate-spin" />
                : <Search size={18} />
              }
            </button>
          </div>
          <p className="text-dark-500 text-xs mt-2">
            رقم الطلب يبدأ بـ ORD- ويُرسل إليك عبر الواتساب عند تأكيد الطلب
          </p>
        </motion.div>

        {/* النتيجة */}
        <AnimatePresence mode="wait">

          {/* لم يُعثر على طلب */}
          {notFound && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-2xl p-8 text-center"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-white font-bold text-lg mb-2">لم يُعثر على طلب</h3>
              <p className="text-dark-400 text-sm">
                تأكد من صحة رقم الطلب أو رقم الهاتف وحاول مجدداً
              </p>
            </motion.div>
          )}

          {/* تفاصيل الطلب */}
          {result && (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* بطاقة معلومات الطلب */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-dark-400 text-xs mb-1">رقم الطلب</p>
                    <p className="text-gold-400 font-black text-sm" dir="ltr">{result.id}</p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${statusColor(result.status)}`}>
                    {ORDER_STATUS_MAP[result.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-dark-900 rounded-xl p-3">
                    <p className="text-dark-400 text-xs mb-1">الاسم</p>
                    <p className="text-white font-medium">{result.customerName}</p>
                  </div>
                  <div className="bg-dark-900 rounded-xl p-3">
                    <p className="text-dark-400 text-xs mb-1">الهاتف</p>
                    <p className="text-white font-medium" dir="ltr">{result.phone}</p>
                  </div>
                  <div className="bg-dark-900 rounded-xl p-3 col-span-2">
                    <p className="text-dark-400 text-xs mb-1">المنتجات</p>
                    {result.items.map((item, i) => (
                      <p key={i} className="text-white text-xs">
                        {item.productName} × {item.quantity}
                      </p>
                    ))}
                  </div>
                  <div className="bg-dark-900 rounded-xl p-3">
                    <p className="text-dark-400 text-xs mb-1">الإجمالي</p>
                    <p className="text-gold-400 font-bold">{result.totalPrice.toLocaleString('ar-YE')} ر.ي</p>
                  </div>
                  <div className="bg-dark-900 rounded-xl p-3">
                    <p className="text-dark-400 text-xs mb-1">تاريخ الطلب</p>
                    <p className="text-white text-xs">{new Date(result.createdAt).toLocaleDateString('ar-YE')}</p>
                  </div>
                </div>
              </div>

              {/* شريط تقدم الحالة */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Truck size={16} className="text-gold-400" />
                  مراحل الطلب
                </h3>
                {renderSteps(result)}
              </div>

              {/* آخر تحديث */}
              <p className="text-dark-500 text-xs text-center">
                آخر تحديث: {new Date(result.updatedAt).toLocaleString('ar-YE')}
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
