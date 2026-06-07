/* ===== لوحة التحكم الكاملة ===== */

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Package, ShoppingCart, Plus, Pencil, Trash2,
  Search, Star, Save, Loader2, DollarSign, Image as ImageIcon,
  ChevronDown, LogOut, Home, Building2, Eye, EyeOff,
  CreditCard, CheckCircle, XCircle, Clock,
} from 'lucide-react';
import { useApp } from '../context';
import {
  Product, OrderStatus, ORDER_STATUS_MAP, ORDER_STATUS_COLORS,
  CATEGORIES, Category, BankAccount,
  PaymentStatus, PAYMENT_STATUS_MAP, PAYMENT_STATUS_COLORS,
} from '../types';

type Tab = 'dashboard' | 'products' | 'add-product' | 'edit-product' | 'orders' | 'bank-accounts';

/* ── Shell ─────────────────────────────────────────────────────────────── */
export function AdminPanel() {
  const { navigateTo, logout } = useApp();
  const [tab,     setTab]     = useState<Tab>('dashboard');
  const [editing, setEditing] = useState<Product | null>(null);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard',    label: 'الرئيسية',          icon: BarChart3 },
    { id: 'products',     label: 'المنتجات',          icon: Package },
    { id: 'add-product',  label: 'إضافة منتج',        icon: Plus },
    { id: 'orders',       label: 'الطلبات',           icon: ShoppingCart },
    { id: 'bank-accounts',label: 'حسابات الدفع',      icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      {/* شريط العنوان */}
      <div className="bg-dark-800 border-b border-gold-400/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-dark-900 font-bold text-sm">ح</div>
            <div>
              <p className="text-white font-bold text-sm">لوحة التحكم</p>
              <p className="text-dark-400 text-xs">الحرمين للعود والعطور</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigateTo('home')} className="p-2 text-dark-400 hover:text-gold-400 rounded-lg hover:bg-white/5 transition-all" title="الموقع"><Home size={18} /></button>
            <button onClick={logout}                   className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="خروج"><LogOut size={18} /></button>
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="bg-dark-800/50 border-b border-gold-400/5 px-4 sm:px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                tab === id ? 'text-gold-400 border-gold-400' : 'text-dark-400 border-transparent hover:text-white'
              }`}>
              <Icon size={16} />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {tab === 'dashboard'    && <Dashboard key="d" onNav={setTab} />}
          {tab === 'products'     && <ProductsList key="p" onEdit={p => { setEditing(p); setTab('edit-product'); }} onAdd={() => setTab('add-product')} />}
          {tab === 'add-product'  && <ProductForm key="add" onSave={() => setTab('products')} />}
          {tab === 'edit-product' && editing && <ProductForm key={`edit-${editing.id}`} product={editing} onSave={() => setTab('products')} />}
          {tab === 'orders'       && <OrdersList key="o" />}
          {tab === 'bank-accounts'&& <BankAccountsManager key="b" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Dashboard ─────────────────────────────────────────────────────────── */
function Dashboard({ onNav }: { onNav: (t: Tab) => void }) {
  const { products, orders, bankAccounts } = useApp();
  const stats = useMemo(() => ({
    total:    products.length,
    avail:    products.filter(p => p.available).length,
    featured: products.filter(p => p.featured).length,
    orders:   orders.length,
    newO:     orders.filter(o => o.status === 'new').length,
    revenue:  orders.reduce((s, o) => s + o.totalPrice, 0),
    pendingPayments: orders.filter(o => o.paymentStatus === 'pending_review').length,
    activeBanks: bankAccounts.filter(a => a.active).length,
  }), [products, orders, bankAccounts]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-white text-xl font-bold">لوحة المعلومات</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'المنتجات',         value: stats.total,                                     icon: Package,     color: 'text-blue-400 bg-blue-500/10' },
          { label: 'طلبات جديدة',     value: stats.newO,                                      icon: ShoppingCart,color: 'text-green-400 bg-green-500/10' },
          { label: 'إجمالي الطلبات',   value: stats.orders,                                    icon: BarChart3,   color: 'text-purple-400 bg-purple-500/10' },
          { label: 'الإيرادات',        value: `${stats.revenue.toLocaleString('ar-YE')} ر.ي`,  icon: DollarSign,  color: 'text-gold-400 bg-gold-400/10' },
          { label: 'تحويلات بانتظار', value: stats.pendingPayments,                            icon: Clock,       color: 'text-yellow-400 bg-yellow-500/10' },
          { label: 'حسابات بنكية',    value: stats.activeBanks,                               icon: CreditCard,  color: 'text-cyan-400 bg-cyan-500/10' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-xl p-4">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}><Icon size={20} /></div>
              <p className="text-dark-400 text-xs mb-1">{s.label}</p>
              <p className="text-white font-bold text-lg">{s.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2"><ShoppingCart size={16} className="text-gold-400" />آخر الطلبات</h3>
            <button onClick={() => onNav('orders')} className="text-gold-400 text-xs hover:underline">الكل</button>
          </div>
          {orders.slice(0, 5).length > 0 ? orders.slice(0, 5).map(o => (
            <div key={o.id} className="flex items-center justify-between p-2 bg-dark-900 rounded-lg mb-1.5">
              <div>
                <p className="text-white text-sm font-medium">{o.customerName}</p>
                <p className="text-dark-400 text-xs">{o.items[0]?.productName ?? '—'}{o.items.length > 1 && ` +${o.items.length - 1}`}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${ORDER_STATUS_COLORS[o.status]}`}>{ORDER_STATUS_MAP[o.status]}</span>
            </div>
          )) : <p className="text-dark-400 text-sm text-center py-4">لا توجد طلبات</p>}
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2"><Star size={16} className="text-gold-400" />المميزة</h3>
            <button onClick={() => onNav('products')} className="text-gold-400 text-xs hover:underline">الكل</button>
          </div>
          {products.filter(p => p.featured).slice(0, 5).map(p => (
            <div key={p.id} className="flex items-center justify-between p-2 bg-dark-900 rounded-lg mb-1.5">
              <p className="text-white text-sm font-medium truncate max-w-[180px]">{p.name}</p>
              <span className="text-gold-400 text-xs font-bold">{p.price.toLocaleString('ar-YE')} ر.ي</span>
            </div>
          ))}
          {products.filter(p => p.featured).length === 0 && <p className="text-dark-400 text-sm text-center py-4">لا يوجد</p>}
        </div>
      </div>
    </motion.div>
  );
}

/* ── قائمة المنتجات ────────────────────────────────────────────────────── */
function ProductsList({ onEdit, onAdd }: { onEdit: (p: Product) => void; onAdd: () => void }) {
  const { products, deleteProduct, updateProduct } = useApp();
  const [search,  setSearch]  = useState('');
  const [catF,    setCatF]    = useState<Category | 'all'>('all');
  const [delConf, setDelConf] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let r = [...products];
    if (catF !== 'all') r = r.filter(p => p.category === catF);
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter(p => p.name.toLowerCase().includes(q)); }
    return r;
  }, [products, catF, search]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-white text-xl font-bold">المنتجات ({products.length})</h2>
        <button onClick={onAdd} className="btn-gold flex items-center gap-2 text-sm py-2 px-4"><Plus size={16} />إضافة</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          <input type="text" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-dark-800 border border-gold-400/10 rounded-lg pr-9 pl-3 py-2 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-gold-400/30" />
        </div>
        <select value={catF} onChange={e => setCatF(e.target.value as Category | 'all')}
          className="bg-dark-800 border border-gold-400/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none appearance-none">
          <option value="all">جميع الأقسام</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-400/10">
                {['المنتج','القسم','السعر','الكمية','الحالة','إجراءات'].map(h => (
                  <th key={h} className="text-right text-dark-400 font-medium p-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gold-400/5 hover:bg-white/[0.02]">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-dark-700 shrink-0 overflow-hidden flex items-center justify-center">
                        {p.mainImage ? <img src={p.mainImage} alt="" className="w-full h-full object-cover" /> : <span className="text-lg opacity-40">📦</span>}
                      </div>
                      <div>
                        <span className="text-white font-medium text-xs truncate max-w-[130px] block">{p.name}</span>
                        {p.featured && <Star size={11} className="text-gold-400 fill-gold-400" />}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-dark-300 text-xs">{CATEGORIES.find(c => c.id === p.category)?.name}</td>
                  <td className="p-3 text-gold-400 font-medium">{p.price.toLocaleString('ar-YE')}</td>
                  <td className="p-3 text-white">{p.quantity}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {p.available ? 'متوفر' : 'غير متوفر'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(p)} className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="تعديل"><Pencil size={14} /></button>
                      <button onClick={() => updateProduct(p.id, { featured: !p.featured })}
                        className={`p-1.5 rounded-lg transition-colors ${p.featured ? 'text-gold-400 hover:bg-gold-400/10' : 'text-dark-400 hover:bg-white/5'}`} title="مميز">
                        <Star size={14} fill={p.featured ? 'currentColor' : 'none'} />
                      </button>
                      {delConf === p.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => { deleteProduct(p.id); setDelConf(null); }} className="text-xs text-red-400 px-2 py-0.5 bg-red-500/10 rounded">تأكيد</button>
                          <button onClick={() => setDelConf(null)} className="text-xs text-dark-400 px-2 py-0.5 bg-white/5 rounded">إلغاء</button>
                        </div>
                      ) : (
                        <button onClick={() => setDelConf(p.id)} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors" title="حذف"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-8 text-dark-400 text-sm">لا توجد منتجات</div>}
        </div>
      </div>
    </motion.div>
  );
}

/* ── نموذج المنتج (إضافة/تعديل) ────────────────────────────────────────── */
function ProductForm({ product, onSave }: { product?: Product; onSave: () => void }) {
  const { addProduct, updateProduct, uploadImage } = useApp();
  const isEdit = !!product;
  const fileRef = useRef<HTMLInputElement>(null);

  const [name,        setName]        = useState(product?.name        ?? '');
  const [category,    setCategory]    = useState<Category>(product?.category ?? 'perfumes');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price,       setPrice]       = useState(product?.price?.toString()    ?? '');
  const [quantity,    setQuantity]    = useState(product?.quantity?.toString() ?? '');
  const [available,   setAvailable]   = useState(product?.available ?? true);
  const [featured,    setFeatured]    = useState(product?.featured   ?? false);
  const [mainImage,   setMainImage]   = useState(product?.mainImage  ?? '');
  const [saving,      setSaving]      = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [imgError,    setImgError]    = useState('');

  const onImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImgError('');
    setUploading(true);
    try {
      const url = await uploadImage(f, 'products');
      setMainImage(url);
    } catch (err) {
      setImgError(err instanceof Error ? err.message : 'فشل رفع الصورة');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price || !quantity) return;
    setSaving(true);
    try {
      const data = {
        name: name.trim(), category, description: description.trim(),
        price: Number(price), quantity: Number(quantity),
        mainImage, images: product?.images ?? [],
        available, featured,
      };
      if (isEdit && product) {
        await updateProduct(product.id, data);
      } else {
        await addProduct(data);
      }
      onSave();
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setSaving(false);
    }
  };

  const canSave = name.trim() && price && quantity && !saving && !uploading;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-5">
      <h2 className="text-white text-xl font-bold">{isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>

      <div className="glass rounded-xl p-5 space-y-4">
        <div>
          <label className="text-white text-sm font-medium block mb-1.5">اسم المنتج *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: عطر المسك الأبيض"
            className="w-full bg-dark-900 border border-gold-400/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-gold-400/30" />
        </div>

        <div>
          <label className="text-white text-sm font-medium block mb-1.5">القسم *</label>
          <select value={category} onChange={e => setCategory(e.target.value as Category)}
            className="w-full bg-dark-900 border border-gold-400/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400/30 appearance-none">
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-white text-sm font-medium block mb-1.5">الوصف</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="وصف المنتج..." rows={3}
            className="w-full bg-dark-900 border border-gold-400/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-gold-400/30 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-white text-sm font-medium block mb-1.5">السعر (ر.ي) *</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" min="0" dir="ltr"
              className="w-full bg-dark-900 border border-gold-400/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-gold-400/30 text-left" />
          </div>
          <div>
            <label className="text-white text-sm font-medium block mb-1.5">الكمية *</label>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" min="0" dir="ltr"
              className="w-full bg-dark-900 border border-gold-400/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-gold-400/30 text-left" />
          </div>
        </div>

        <div>
          <label className="text-white text-sm font-medium block mb-1.5">صورة المنتج</label>
          <div onClick={() => !uploading && fileRef.current?.click()}
            className="border-2 border-dashed border-gold-400/15 rounded-xl p-4 text-center cursor-pointer hover:border-gold-400/30 transition-colors">
            {mainImage ? (
              <div className="space-y-2">
                <img src={mainImage} alt="المنتج" className="max-h-40 mx-auto rounded-lg object-contain" />
                <p className="text-gold-400 text-xs">اضغط لتغيير الصورة</p>
              </div>
            ) : uploading ? (
              <div className="py-4"><Loader2 size={30} className="text-gold-400 mx-auto animate-spin mb-2" /><p className="text-dark-300 text-sm">جارٍ الرفع...</p></div>
            ) : (
              <div className="py-4"><ImageIcon size={30} className="text-gold-400/50 mx-auto mb-2" /><p className="text-dark-300 text-sm">اضغط لرفع صورة</p><p className="text-dark-500 text-xs mt-1">JPG / PNG / WebP — حتى 5MB</p></div>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onImagePick} className="hidden" />
          </div>
          {imgError && <p className="text-red-400 text-xs mt-1">{imgError}</p>}
        </div>

        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} className="w-4 h-4 rounded accent-gold-400" />
            <span className="text-white text-sm">متوفر</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-4 h-4 rounded accent-gold-400" />
            <span className="text-white text-sm">منتج مميز</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onSave} className="btn-gold-outline flex-1">إلغاء</button>
          <button onClick={handleSave} disabled={!canSave}
            className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <><Loader2 size={16} className="animate-spin" />جارٍ الحفظ...</> : <><Save size={16} />{isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── إدارة حسابات الدفع البنكية ──────────────────────────────────────────── */
function BankAccountsManager() {
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount } = useApp();
  const [showForm,   setShowForm]   = useState(false);
  const [editingAcc, setEditingAcc] = useState<BankAccount | null>(null);
  const [delConf,    setDelConf]    = useState<string | null>(null);

  const openAdd  = () => { setEditingAcc(null); setShowForm(true); };
  const openEdit = (a: BankAccount) => { setEditingAcc(a); setShowForm(true); };
  const closeForm= () => { setShowForm(false); setEditingAcc(null); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white text-xl font-bold">إدارة حسابات الدفع البنكية</h2>
          <p className="text-dark-400 text-sm mt-0.5">الحسابات المفعلة تظهر للعملاء في صفحة إتمام الطلب</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={16} />إضافة حساب
        </button>
      </div>

      {/* نموذج الإضافة/التعديل */}
      <AnimatePresence>
        {showForm && (
          <BankAccountForm
            account={editingAcc ?? undefined}
            onSave={async (data) => {
              if (editingAcc) {
                await updateBankAccount(editingAcc.id, data);
              } else {
                await addBankAccount(data);
              }
              closeForm();
            }}
            onCancel={closeForm}
          />
        )}
      </AnimatePresence>

      {/* قائمة الحسابات */}
      <div className="space-y-3">
        {bankAccounts.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Building2 size={40} className="text-dark-500 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">لا توجد حسابات بنكية مضافة</p>
            <button onClick={openAdd} className="mt-4 text-gold-400 text-sm hover:underline">إضافة أول حساب</button>
          </div>
        ) : (
          bankAccounts.map(acc => (
            <motion.div key={acc.id} layout
              className={`glass rounded-xl p-4 border-2 transition-all ${
                acc.active ? 'border-gold-400/20' : 'border-dark-600/30 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    acc.active ? 'bg-gold-400/15' : 'bg-dark-700'
                  }`}>
                    <Building2 size={20} className={acc.active ? 'text-gold-400' : 'text-dark-500'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold">{acc.bankName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        acc.active
                          ? 'bg-green-500/15 text-green-400 border-green-500/25'
                          : 'bg-dark-600/30 text-dark-400 border-dark-500/20'
                      }`}>
                        {acc.active ? 'مفعل' : 'معطل'}
                      </span>
                    </div>
                    <p className="text-dark-400 text-sm">{acc.accountHolder}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* تفعيل/تعطيل */}
                  <button
                    onClick={() => updateBankAccount(acc.id, { active: !acc.active })}
                    className={`p-1.5 rounded-lg transition-colors ${
                      acc.active
                        ? 'text-green-400 hover:bg-green-500/10'
                        : 'text-dark-400 hover:bg-white/5'
                    }`}
                    title={acc.active ? 'تعطيل' : 'تفعيل'}
                  >
                    {acc.active ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>

                  <button onClick={() => openEdit(acc)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="تعديل">
                    <Pencil size={15} />
                  </button>

                  {delConf === acc.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => { deleteBankAccount(acc.id); setDelConf(null); }} className="text-xs text-red-400 px-2 py-0.5 bg-red-500/10 rounded">تأكيد</button>
                      <button onClick={() => setDelConf(null)} className="text-xs text-dark-400 px-2 py-0.5 bg-white/5 rounded">لا</button>
                    </div>
                  ) : (
                    <button onClick={() => setDelConf(acc.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="حذف">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* تفاصيل الحساب */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="bg-dark-900 rounded-lg px-3 py-2">
                  <p className="text-dark-500 text-xs mb-0.5">رقم الحساب</p>
                  <p className="text-white font-mono" dir="ltr">{acc.accountNumber}</p>
                </div>
                {acc.walletNumber && (
                  <div className="bg-dark-900 rounded-lg px-3 py-2">
                    <p className="text-dark-500 text-xs mb-0.5">رقم المحفظة</p>
                    <p className="text-white font-mono" dir="ltr">{acc.walletNumber}</p>
                  </div>
                )}
                {acc.notes && (
                  <div className="bg-dark-900 rounded-lg px-3 py-2 sm:col-span-2">
                    <p className="text-dark-500 text-xs mb-0.5">ملاحظات</p>
                    <p className="text-dark-300">{acc.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

/* ── نموذج الحساب البنكي ──────────────────────────────────────────────── */
function BankAccountForm({
  account,
  onSave,
  onCancel,
}: {
  account?: BankAccount;
  onSave: (data: Omit<BankAccount, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}) {
  const [bankName,      setBankName]      = useState(account?.bankName      ?? '');
  const [accountHolder, setAccountHolder] = useState(account?.accountHolder ?? '');
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber ?? '');
  const [walletNumber,  setWalletNumber]  = useState(account?.walletNumber  ?? '');
  const [notes,         setNotes]         = useState(account?.notes         ?? '');
  const [active,        setActive]        = useState(account?.active        ?? true);
  const [saving,        setSaving]        = useState(false);

  const handleSave = async () => {
    if (!bankName.trim() || !accountHolder.trim() || !accountNumber.trim()) return;
    setSaving(true);
    try {
      await onSave({
        bankName:      bankName.trim(),
        accountHolder: accountHolder.trim(),
        accountNumber: accountNumber.trim(),
        walletNumber:  walletNumber.trim() || undefined,
        notes:         notes.trim() || undefined,
        active,
      });
    } finally {
      setSaving(false);
    }
  };

  const canSave = bankName.trim() && accountHolder.trim() && accountNumber.trim() && !saving;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass rounded-xl p-5 border border-gold-400/20 space-y-4"
    >
      <h3 className="text-gold-400 font-bold flex items-center gap-2">
        <Building2 size={18} />
        {account ? 'تعديل الحساب البنكي' : 'إضافة حساب بنكي جديد'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-white text-xs font-medium block mb-1.5">اسم البنك / شركة التحويل *</label>
          <input type="text" value={bankName} onChange={e => setBankName(e.target.value)}
            placeholder="مثال: الكريمي، كاش، بنك اليمن..."
            className="w-full bg-dark-900 border border-gold-400/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-gold-400/30" />
        </div>
        <div>
          <label className="text-white text-xs font-medium block mb-1.5">اسم صاحب الحساب *</label>
          <input type="text" value={accountHolder} onChange={e => setAccountHolder(e.target.value)}
            placeholder="الاسم الكامل"
            className="w-full bg-dark-900 border border-gold-400/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-gold-400/30" />
        </div>
        <div>
          <label className="text-white text-xs font-medium block mb-1.5">رقم الحساب *</label>
          <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
            placeholder="رقم الحساب البنكي" dir="ltr"
            className="w-full bg-dark-900 border border-gold-400/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono placeholder-dark-500 focus:outline-none focus:border-gold-400/30 text-left" />
        </div>
        <div>
          <label className="text-white text-xs font-medium block mb-1.5">رقم المحفظة <span className="text-dark-500">(اختياري)</span></label>
          <input type="text" value={walletNumber} onChange={e => setWalletNumber(e.target.value)}
            placeholder="رقم المحفظة إن وجد" dir="ltr"
            className="w-full bg-dark-900 border border-gold-400/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono placeholder-dark-500 focus:outline-none focus:border-gold-400/30 text-left" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-white text-xs font-medium block mb-1.5">ملاحظات إضافية <span className="text-dark-500">(اختياري)</span></label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="أي تعليمات للعميل عند التحويل..." rows={2}
            className="w-full bg-dark-900 border border-gold-400/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-gold-400/30 resize-none" />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)}
          className="w-4 h-4 rounded accent-gold-400" />
        <span className="text-white text-sm">مفعل (يظهر للعملاء)</span>
      </label>

      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className="btn-gold-outline flex-1 text-sm py-2">إلغاء</button>
        <button onClick={handleSave} disabled={!canSave}
          className="btn-gold flex-1 text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <><Loader2 size={15} className="animate-spin" />جارٍ الحفظ...</> : <><Save size={15} />{account ? 'حفظ التعديلات' : 'إضافة الحساب'}</>}
        </button>
      </div>
    </motion.div>
  );
}

/* ── قائمة الطلبات ─────────────────────────────────────────────────────── */
function OrdersList() {
  const { orders, updateOrderStatus, updatePaymentStatus, bankAccounts } = useApp();
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState<OrderStatus | 'all'>('all');
  const [expanded,  setExpanded]  = useState<string | null>(null);

  const filtered = useMemo(() => {
    let r = [...orders];
    if (statusF !== 'all') r = r.filter(o => o.status === statusF);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(o =>
        o.customerName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.items.some(i => i.productName.toLowerCase().includes(q))
      );
    }
    return r;
  }, [orders, statusF, search]);

  const paymentStatusIcons: Record<PaymentStatus, React.ElementType> = {
    pending_review: Clock,
    verified:       CheckCircle,
    rejected:       XCircle,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h2 className="text-white text-xl font-bold">الطلبات ({orders.length})</h2>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          <input type="text" placeholder="بحث بالاسم أو الرقم..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-dark-800 border border-gold-400/10 rounded-lg pr-9 pl-3 py-2 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-gold-400/30" />
        </div>
        <select value={statusF} onChange={e => setStatusF(e.target.value as OrderStatus | 'all')}
          className="bg-dark-800 border border-gold-400/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none appearance-none">
          <option value="all">جميع الحالات</option>
          {(Object.keys(ORDER_STATUS_MAP) as OrderStatus[]).map(s => (
            <option key={s} value={s}>{ORDER_STATUS_MAP[s]}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(order => {
          const bankAcc = order.selectedBankAccountId
            ? bankAccounts.find(a => a.id === order.selectedBankAccountId)
            : null;

          return (
            <div key={order.id} className="glass rounded-xl overflow-hidden">
              {/* رأس الطلب */}
              <div className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-white font-bold text-sm">{order.customerName}</p>
                    <p className="text-dark-400 text-xs">
                      #{order.id.slice(-8)} • {order.items[0]?.productName ?? '—'}
                      {order.items.length > 1 && ` +${order.items.length - 1}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gold-400 font-bold text-sm">{order.totalPrice.toLocaleString('ar-YE')} ر.ي</span>
                    {/* حالة الدفع */}
                    {order.paymentStatus && (() => {
                      const PIcon = paymentStatusIcons[order.paymentStatus!];
                      return (
                        <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${PAYMENT_STATUS_COLORS[order.paymentStatus!]}`}>
                          <PIcon size={11} />{PAYMENT_STATUS_MAP[order.paymentStatus!]}
                        </span>
                      );
                    })()}
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_MAP[order.status]}
                    </span>
                    <ChevronDown size={15} className={`text-dark-400 transition-transform ${expanded === order.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {/* تفاصيل الطلب */}
              <AnimatePresence>
                {expanded === order.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gold-400/10 overflow-hidden">
                    <div className="p-4 space-y-4">
                      {/* بيانات العميل */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { label: 'الاسم',     value: order.customerName },
                          { label: 'الهاتف',    value: order.phone,                           dir: true },
                          { label: 'المحافظة',  value: `${order.governorate} / ${order.district}` },
                          { label: 'العنوان',   value: order.address },
                        ].map(f => (
                          <div key={f.label} className="bg-dark-900 rounded-lg p-2.5">
                            <p className="text-dark-400 text-xs mb-0.5">{f.label}</p>
                            <p className="text-white text-sm" dir={f.dir ? 'ltr' : undefined}>{f.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* المنتجات */}
                      <div className="bg-dark-900 rounded-lg p-3">
                        <p className="text-dark-400 text-xs mb-2">المنتجات:</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm border-b border-gold-400/5 py-1.5 last:border-0">
                            <span className="text-white">{item.productName} × {item.quantity}</span>
                            <span className="text-gold-400">{item.subtotal.toLocaleString('ar-YE')} ر.ي</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm pt-2 mt-1 border-t border-gold-400/10">
                          <span className="text-dark-300">الإجمالي</span>
                          <span className="text-gold-400 font-bold">{order.totalPrice.toLocaleString('ar-YE')} ر.ي</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-dark-300">العربون</span>
                          <span className="text-green-400">{order.deposit.toLocaleString('ar-YE')} ر.ي</span>
                        </div>
                      </div>

                      {/* بيانات التحويل البنكي */}
                      {(bankAcc || order.transferNumber || order.transferReceipt) && (
                        <div className="bg-dark-900 rounded-lg p-3 space-y-2.5">
                          <p className="text-gold-400 text-xs font-bold flex items-center gap-1.5">
                            <CreditCard size={13} />بيانات التحويل
                          </p>

                          {bankAcc && (
                            <div className="flex justify-between text-sm">
                              <span className="text-dark-400">جهة التحويل</span>
                              <span className="text-white font-medium">{bankAcc.bankName} — {bankAcc.accountHolder}</span>
                            </div>
                          )}
                          {order.transferNumber && (
                            <div className="flex justify-between text-sm">
                              <span className="text-dark-400">رقم الحوالة</span>
                              <span className="text-white font-mono" dir="ltr">{order.transferNumber}</span>
                            </div>
                          )}
                          {order.transferReceipt && (
                            <div className="space-y-1.5">
                              <p className="text-dark-400 text-xs">صورة إشعار التحويل:</p>
                              <a href={order.transferReceipt} target="_blank" rel="noopener noreferrer"
                                className="block">
                                <img
                                  src={order.transferReceipt}
                                  alt="إشعار التحويل"
                                  className="max-h-40 rounded-lg object-contain border border-gold-400/15 hover:border-gold-400/40 transition-colors"
                                />
                              </a>
                              <a href={order.transferReceipt} target="_blank" rel="noopener noreferrer"
                                className="text-gold-400 text-xs hover:underline inline-flex items-center gap-1">
                                🧾 فتح الصورة في تبويب جديد
                              </a>
                            </div>
                          )}

                          {/* حالة الدفع */}
                          <div>
                            <p className="text-dark-400 text-xs mb-2">حالة الدفع:</p>
                            <div className="flex flex-wrap gap-2">
                              {(Object.keys(PAYMENT_STATUS_MAP) as PaymentStatus[]).map(ps => {
                                const PIcon = paymentStatusIcons[ps];
                                return (
                                  <button key={ps} onClick={() => updatePaymentStatus(order.id, ps)}
                                    className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                                      order.paymentStatus === ps
                                        ? PAYMENT_STATUS_COLORS[ps]
                                        : 'border-dark-500 text-dark-400 hover:text-white hover:border-dark-400'
                                    }`}>
                                    <PIcon size={12} />{PAYMENT_STATUS_MAP[ps]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* تغيير حالة الطلب */}
                      <div className="bg-dark-900 rounded-lg p-3">
                        <p className="text-dark-400 text-xs mb-2">تغيير حالة الطلب:</p>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(ORDER_STATUS_MAP) as OrderStatus[]).map(s => (
                            <button key={s} onClick={() => updateOrderStatus(order.id, s)}
                              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                                order.status === s
                                  ? ORDER_STATUS_COLORS[s]
                                  : 'border-dark-500 text-dark-400 hover:text-white hover:border-dark-400'
                              }`}>
                              {ORDER_STATUS_MAP[s]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="text-dark-500 text-xs" dir="ltr">
                        {new Date(order.createdAt).toLocaleString('ar-YE')}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-14">
            <ShoppingCart size={40} className="text-dark-500 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">لا توجد طلبات</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
