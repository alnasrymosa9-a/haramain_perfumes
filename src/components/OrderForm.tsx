/* ===== نموذج الطلب (منتج مفرد أو سلة) ===== */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Upload, Check, CreditCard, Send, Loader2, Copy, CheckCheck, Building2 } from 'lucide-react';
import { Product, CartItem } from '../types';
import { useApp } from '../context';
import { YEMEN_LOCATIONS, DELIVERY_FEES } from '../data';

/* ─── Props (منتج واحد أو سلة — ليس كليهما) ──────────────────────────── */
type Props =
  | { product: Product; quantity: number; cart?: never; onClose: () => void }
  | { product?: never; quantity?: never; cart: CartItem[]; onClose: () => void };

export function OrderForm({ product, quantity, cart, onClose }: Props) {
  const { addOrder, uploadImage, sendWhatsApp, clearCart, bankAccounts } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  // بنود الطلب
  const items: CartItem[] = cart ?? (product ? [{ product, quantity: quantity ?? 1 }] : []);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  // الحسابات المفعلة فقط
  const activeAccounts = bankAccounts.filter(a => a.active);

  // بيانات النموذج
  const [name,             setName]            = useState('');
  const [phone,            setPhone]           = useState('');
  const [governorate,      setGovernorate]     = useState('');
  const [district,         setDistrict]        = useState('');
  const [address,          setAddress]         = useState('');
  const [selectedAccount,  setSelectedAccount] = useState<string>('');
  const [transferNum,      setTransferNum]     = useState('');
  const [receiptFile,      setReceiptFile]     = useState<File | null>(null);
  const [receiptPreview,   setReceiptPreview]  = useState('');
  const [copiedId,         setCopiedId]        = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');

  // حسابات
  const deliveryFee = DELIVERY_FEES[governorate] ?? DELIVERY_FEES['default'] ?? 1500;
  const total       = subtotal + deliveryFee;
  const deposit     = Math.round(total * 0.2);
  const districts   = governorate ? (YEMEN_LOCATIONS[governorate] ?? []) : [];

  /* ── نسخ رقم الحساب ─────────────────────────────────────────────────── */
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  /* ── اختيار ملف السند ─────────────────────────────────────────────── */
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('حجم الصورة يتجاوز 5MB'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(f.type)) { setError('يُرجى رفع صورة JPG أو PNG أو WebP'); return; }
    setError('');
    setReceiptFile(f);
    setReceiptPreview(URL.createObjectURL(f));
  };

  /* ── التحقق ───────────────────────────────────────────────────────── */
  const validate = (): string => {
    if (!name.trim())                       return 'يرجى إدخال الاسم الكامل';
    if (phone.replace(/\D/g,'').length < 9) return 'يرجى إدخال رقم هاتف صحيح (9 أرقام على الأقل)';
    if (!governorate)                       return 'يرجى اختيار المحافظة';
    if (!district)                          return 'يرجى اختيار المديرية';
    if (!address.trim())                    return 'يرجى إدخال العنوان';
    if (items.length === 0)                 return 'لا توجد منتجات في الطلب';
    return '';
  };

  /* ── الإرسال ──────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);

    try {
      let receiptUrl = '';
      if (receiptFile) {
        receiptUrl = await uploadImage(receiptFile, 'receipts');
      }

      const selectedBankAcc = activeAccounts.find(a => a.id === selectedAccount);

      const order = await addOrder({
        customerName:           name.trim(),
        phone:                  phone.trim(),
        governorate,
        district,
        address:                address.trim(),
        items: items.map(i => ({
          productId:    i.product.id,
          productName:  i.product.name,
          productImage: i.product.mainImage,
          quantity:     i.quantity,
          unitPrice:    i.product.price,
          subtotal:     i.product.price * i.quantity,
        })),
        totalPrice:             total,
        deposit,
        transferReceipt:        receiptUrl,
        transferNumber:         transferNum.trim(),
        selectedBankAccountId:  selectedAccount || undefined,
        paymentStatus:          transferNum.trim() || receiptUrl ? 'pending_review' : undefined,
      });

      // رسالة الواتساب
      const lines = items.map(i =>
        `▪ ${i.product.name} × ${i.quantity} = ${(i.product.price * i.quantity).toLocaleString('ar-YE')} ر.ي`
      ).join('\n');

      const msg =
        `🛍️ *طلب جديد — الحرمين للعود والعطور*\n\n` +
        `👤 ${name}\n📱 ${phone}\n📍 ${governorate} / ${district}\n📝 ${address}\n\n` +
        `📦 *المنتجات:*\n${lines}\n` +
        `▪ التوصيل: ${deliveryFee.toLocaleString('ar-YE')} ر.ي\n` +
        `▪ الإجمالي: ${total.toLocaleString('ar-YE')} ر.ي\n` +
        `▪ العربون 20%: ${deposit.toLocaleString('ar-YE')} ر.ي\n` +
        (selectedBankAcc ? `▪ جهة التحويل: ${selectedBankAcc.bankName}\n` : '') +
        (transferNum ? `▪ رقم الحوالة: ${transferNum}\n` : '') +
        (receiptUrl  ? `🧾 السند: ${receiptUrl}\n` : '') +
        `\n🆔 رقم الطلب: ${order.id}`;

      sendWhatsApp(msg);
      if (cart) clearCart();
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          onClick={e => e.stopPropagation()}
          className="bg-dark-800 border border-gold-400/20 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        >
          {/* رأس */}
          <div className="sticky top-0 bg-dark-800/95 backdrop-blur-md border-b border-gold-400/10 px-5 py-4 flex items-center justify-between z-10">
            <h2 className="text-gold-400 font-bold text-lg flex items-center gap-2">
              <Send size={20} />تأكيد الطلب
            </h2>
            <button onClick={onClose} className="p-2 text-dark-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>

          {success ? (
            <div className="p-10 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check size={38} className="text-green-400" />
              </motion.div>
              <h3 className="text-white text-2xl font-bold mb-3">تم إرسال طلبك!</h3>
              <p className="text-dark-300 mb-6">سيتم التواصل معك عبر الواتساب لتأكيد الطلب. شكراً لثقتكم.</p>
              <button onClick={onClose} className="btn-gold px-8">إغلاق</button>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* ملخص المنتجات */}
              <div className="glass rounded-xl p-4 space-y-3">
                {items.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-dark-700 shrink-0 overflow-hidden flex items-center justify-center">
                      {item.product.mainImage
                        ? <img src={item.product.mainImage} alt={item.product.name} className="w-full h-full object-cover" />
                        : <span className="text-2xl">📦</span>}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{item.product.name}</p>
                      <p className="text-gold-400 text-xs mt-0.5">
                        {item.product.price.toLocaleString('ar-YE')} ر.ي × {item.quantity}
                      </p>
                    </div>
                    <span className="text-white font-bold text-sm">
                      {(item.product.price * item.quantity).toLocaleString('ar-YE')} ر.ي
                    </span>
                  </div>
                ))}
              </div>

              {/* الحسابات */}
              <div className="glass rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-dark-300">المجموع</span><span className="text-white">{subtotal.toLocaleString('ar-YE')} ر.ي</span></div>
                <div className="flex justify-between"><span className="text-dark-300">التوصيل ({governorate || '—'})</span><span className="text-white">{deliveryFee.toLocaleString('ar-YE')} ر.ي</span></div>
                <div className="flex justify-between border-t border-gold-400/10 pt-2">
                  <span className="text-white font-bold">الإجمالي</span>
                  <span className="text-gold-400 font-black text-base">{total.toLocaleString('ar-YE')} ر.ي</span>
                </div>
                <div className="flex justify-between bg-gold-400/10 rounded-lg p-2">
                  <span className="text-gold-300 font-medium">العربون (20%)</span>
                  <span className="text-gold-400 font-black">{deposit.toLocaleString('ar-YE')} ر.ي</span>
                </div>
              </div>

              {/* حسابات الدفع البنكية */}
              {activeAccounts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-gold-400 font-bold text-sm flex items-center gap-2">
                    <CreditCard size={16} />حسابات التحويل البنكي
                  </h4>
                  <div className="space-y-2">
                    {activeAccounts.map(acc => (
                      <motion.div
                        key={acc.id}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedAccount(selectedAccount === acc.id ? '' : acc.id)}
                        className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                          selectedAccount === acc.id
                            ? 'border-gold-400/60 bg-gold-400/5'
                            : 'border-gold-400/15 bg-dark-900/50 hover:border-gold-400/30'
                        }`}
                      >
                        {/* رأس البطاقة */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              selectedAccount === acc.id ? 'bg-gold-400/20' : 'bg-dark-700'
                            }`}>
                              <Building2 size={16} className={selectedAccount === acc.id ? 'text-gold-400' : 'text-dark-400'} />
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">{acc.bankName}</p>
                              <p className="text-dark-400 text-xs">{acc.accountHolder}</p>
                            </div>
                          </div>
                          {selectedAccount === acc.id && (
                            <div className="w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center shrink-0">
                              <Check size={12} className="text-dark-900" />
                            </div>
                          )}
                        </div>

                        {/* تفاصيل الحساب */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-dark-800 rounded-lg px-3 py-2">
                            <div>
                              <p className="text-dark-400 text-xs mb-0.5">رقم الحساب</p>
                              <p className="text-white font-mono text-sm font-bold" dir="ltr">{acc.accountNumber}</p>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); copyToClipboard(acc.accountNumber, acc.id + '-acc'); }}
                              className="p-1.5 rounded-lg bg-dark-700 hover:bg-gold-400/20 transition-colors"
                              title="نسخ رقم الحساب"
                            >
                              {copiedId === acc.id + '-acc'
                                ? <CheckCheck size={14} className="text-green-400" />
                                : <Copy size={14} className="text-dark-400 hover:text-gold-400" />}
                            </button>
                          </div>

                          {acc.walletNumber && (
                            <div className="flex items-center justify-between bg-dark-800 rounded-lg px-3 py-2">
                              <div>
                                <p className="text-dark-400 text-xs mb-0.5">رقم المحفظة</p>
                                <p className="text-white font-mono text-sm font-bold" dir="ltr">{acc.walletNumber}</p>
                              </div>
                              <button
                                onClick={e => { e.stopPropagation(); copyToClipboard(acc.walletNumber!, acc.id + '-wallet'); }}
                                className="p-1.5 rounded-lg bg-dark-700 hover:bg-gold-400/20 transition-colors"
                                title="نسخ رقم المحفظة"
                              >
                                {copiedId === acc.id + '-wallet'
                                  ? <CheckCheck size={14} className="text-green-400" />
                                  : <Copy size={14} className="text-dark-400 hover:text-gold-400" />}
                              </button>
                            </div>
                          )}

                          {acc.notes && (
                            <p className="text-dark-400 text-xs px-1">📝 {acc.notes}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* بيانات العميل */}
              <div className="space-y-3">
                <h4 className="text-white font-bold text-sm">بيانات العميل</h4>

                <div className="relative">
                  <User size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-400 pointer-events-none" />
                  <input type="text" placeholder="الاسم الكامل *" value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-dark-900 border-2 border-gold-400/15 rounded-xl pr-10 pl-4 py-3.5 text-white text-base placeholder-dark-400 focus:border-gold-400/60 focus:outline-none focus:ring-1 focus:ring-gold-400/20" />
                </div>

                <div className="relative">
                  <Phone size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-400 pointer-events-none" />
                  <input type="tel" placeholder="رقم الهاتف *" value={phone} onChange={e => setPhone(e.target.value.replace(/[^\d+\s-]/g, ''))}
                    dir="ltr"
                    className="w-full bg-dark-900 border-2 border-gold-400/15 rounded-xl pr-10 pl-4 py-3.5 text-white text-base placeholder-dark-400 focus:border-gold-400/60 focus:outline-none focus:ring-1 focus:ring-gold-400/20 text-left" />
                </div>

                <select value={governorate} onChange={e => { setGovernorate(e.target.value); setDistrict(''); }}
                  className="w-full bg-dark-900 border-2 border-gold-400/15 rounded-xl px-4 py-3 text-white focus:border-gold-400/40 focus:outline-none text-sm appearance-none">
                  <option value="">اختر المحافظة *</option>
                  {Object.keys(YEMEN_LOCATIONS).map(g => <option key={g} value={g}>{g}</option>)}
                </select>

                {districts.length > 0 && (
                  <select value={district} onChange={e => setDistrict(e.target.value)}
                    className="w-full bg-dark-900 border-2 border-gold-400/15 rounded-xl px-4 py-3 text-white focus:border-gold-400/40 focus:outline-none text-sm appearance-none">
                    <option value="">اختر المديرية *</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                )}

                <div className="relative">
                  <MapPin size={17} className="absolute right-3 top-3 text-gold-400 pointer-events-none" />
                  <textarea placeholder="العنوان بالتفصيل *" value={address} onChange={e => setAddress(e.target.value)}
                    rows={2}
                    className="w-full bg-dark-900 border-2 border-gold-400/15 rounded-xl pr-10 pl-4 py-3.5 text-white text-base placeholder-dark-400 focus:border-gold-400/60 focus:outline-none focus:ring-1 focus:ring-gold-400/20 resize-none" />
                </div>
              </div>

              {/* معلومات التحويل — تظهر دائماً أو عند اختيار حساب */}
              <div className="space-y-3">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <Upload size={15} className="text-gold-400" />
                  {selectedAccount ? 'تأكيد التحويل' : 'معلومات التحويل (اختياري)'}
                </h4>

                <input type="text" placeholder="رقم الحوالة / رقم العملية" value={transferNum} onChange={e => setTransferNum(e.target.value)}
                  className="w-full bg-dark-900 border-2 border-gold-400/15 rounded-xl px-4 py-3.5 text-white text-base placeholder-dark-400 focus:border-gold-400/60 focus:outline-none focus:ring-1 focus:ring-gold-400/20" />

                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gold-400/20 rounded-xl p-4 text-center cursor-pointer hover:border-gold-400/40 transition-colors">
                  {receiptPreview ? (
                    <div className="space-y-2">
                      <img src={receiptPreview} alt="السند" className="max-h-32 mx-auto rounded-lg object-contain" />
                      <p className="text-gold-400 text-xs">اضغط لتغيير الصورة</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload size={30} className="text-gold-400 mx-auto" />
                      <p className="text-dark-300 text-sm">رفع صورة إشعار التحويل</p>
                      <p className="text-dark-500 text-xs">JPG / PNG / WebP — حتى 5MB</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="hidden" />
                </div>
              </div>

              {/* خطأ */}
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">
                  {error}
                </motion.div>
              )}

              {/* أزرار */}
              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="btn-gold-outline flex-1">إلغاء</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting
                    ? <><Loader2 size={17} className="animate-spin" />جارٍ الإرسال...</>
                    : <><Send size={17} />تأكيد الطلب</>}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
