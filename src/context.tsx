/* ===== إدارة الحالة المركزية ===== */

import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode,
} from 'react';
import { Product, Order, CartItem, Page, OrderStatus, OrderItem, BankAccount, PaymentStatus } from './types';
import { MOCK_PRODUCTS, WHATSAPP_NUMBER } from './data';
import { supabase, isSupabaseConfigured } from './supabase';

interface AppContextType {
  currentPage: Page;
  navigateTo: (page: Page, data?: unknown) => void;
  goBack: () => void;
  canGoBack: boolean;
  pageData: unknown;
  user: unknown;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  products: Product[];
  loading: boolean;
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  orders: Order[];
  addOrder: (o: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (id: string, paymentStatus: PaymentStatus) => Promise<void>;
  uploadImage: (file: File, bucket: 'products' | 'receipts') => Promise<string>;
  whatsappNumber: string;
  sendWhatsApp: (msg: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  /* ── حسابات الدفع البنكية ── */
  bankAccounts: BankAccount[];
  addBankAccount: (a: Omit<BankAccount, 'id' | 'createdAt'>) => Promise<void>;
  updateBankAccount: (id: string, data: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const CART_KEY = 'haramain_cart_v2';

function toProduct(row: Record<string, unknown>): Product {
  return {
    id:          String(row.id          ?? ''),
    name:        String(row.name        ?? ''),
    category:    row.category as Product['category'],
    description: String(row.description ?? ''),
    price:       Number(row.price)      || 0,
    quantity:    Number(row.quantity)   || 0,
    mainImage:   String(row.main_image  ?? ''),
    images:      Array.isArray(row.images) ? (row.images as string[]) : [],
    available:   Boolean(row.available),
    featured:    Boolean(row.featured),
    createdAt:   String(row.created_at  ?? new Date().toISOString()),
  };
}

function toOrder(row: Record<string, unknown>): Order {
  return {
    id:                    String(row.id                    ?? ''),
    customerName:          String(row.customer_name         ?? ''),
    phone:                 String(row.phone                 ?? ''),
    governorate:           String(row.governorate           ?? ''),
    district:              String(row.district              ?? ''),
    address:               String(row.address               ?? ''),
    items:                 Array.isArray(row.items) ? (row.items as OrderItem[]) : [],
    totalPrice:            Number(row.total_price)          || 0,
    deposit:               Number(row.deposit)              || 0,
    transferReceipt:       String(row.transfer_receipt      ?? ''),
    transferNumber:        String(row.transfer_number       ?? ''),
    selectedBankAccountId: row.selected_bank_account_id ? String(row.selected_bank_account_id) : undefined,
    paymentStatus:         (row.payment_status as PaymentStatus) ?? 'pending_review',
    status:                (row.status as OrderStatus)      ?? 'new',
    createdAt:             String(row.created_at ?? new Date().toISOString()),
    updatedAt:             String(row.updated_at ?? new Date().toISOString()),
  };
}

function toBankAccount(row: Record<string, unknown>): BankAccount {
  return {
    id:            String(row.id             ?? ''),
    bankName:      String(row.bank_name      ?? ''),
    accountHolder: String(row.account_holder ?? ''),
    accountNumber: String(row.account_number ?? ''),
    walletNumber:  row.wallet_number ? String(row.wallet_number) : undefined,
    notes:         row.notes ? String(row.notes) : undefined,
    active:        Boolean(row.active),
    createdAt:     String(row.created_at     ?? new Date().toISOString()),
  };
}

function safeFileName(original: string): string {
  const ext = original.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageData,    setPageData]    = useState<unknown>(null);
  const [history,     setHistory]     = useState<{ page: Page; data: unknown }[]>([]);
  const [user,        setUser]        = useState<unknown>(null);
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [products,    setProducts]    = useState<Product[]>(MOCK_PRODUCTS);
  const [orders,      setOrders]      = useState<Order[]>([]);
  const [bankAccounts,setBankAccounts]= useState<BankAccount[]>([]);
  const [loading,     setLoading]     = useState(false);
  const loadingRef = useRef(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart]);

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const canGoBack = history.length > 0;

  /* ── Auth ── */
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAdmin(!!session?.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  /* ── Data ── */
  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (pData && pData.length > 0) setProducts(pData.map(r => toProduct(r as Record<string, unknown>)));

      const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (oData) setOrders(oData.map(r => toOrder(r as Record<string, unknown>)));

      const { data: bData } = await supabase.from('bank_accounts').select('*').order('created_at', { ascending: true });
      if (bData) setBankAccounts(bData.map(r => toBankAccount(r as Record<string, unknown>)));
    } catch (err) {
      console.error('[loadData]', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadData();
    if (!isSupabaseConfigured) return;
    const chP = supabase.channel('rt-products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, loadData).subscribe();
    const chO = supabase.channel('rt-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, loadData).subscribe();
    const chB = supabase.channel('rt-bank-accounts').on('postgres_changes', { event: '*', schema: 'public', table: 'bank_accounts' }, loadData).subscribe();
    return () => { chP.unsubscribe(); chO.unsubscribe(); chB.unsubscribe(); };
  }, [loadData]);

  /* ── Navigation ── */
  const navigateTo = useCallback((page: Page, data?: unknown) => {
    setHistory(prev => [...prev, { page: currentPage, data: pageData }]);
    setCurrentPage(page);
    setPageData(data ?? null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, pageData]);

  const goBack = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setCurrentPage(prev.page);
    setPageData(prev.data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [history]);

  /* ── Auth actions ── */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      const ok = email === 'admin@haramain.com' && password === 'admin123';
      if (ok) setIsAdmin(true);
      return ok;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return !error;
    } catch { return false; }
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) { try { await supabase.auth.signOut(); } catch { /* ignore */ } }
    setIsAdmin(false);
    setUser(null);
    setHistory([]);
    setCurrentPage('home');
    setPageData(null);
  }, []);

  /* ── Products ── */
  const addProduct = useCallback(async (p: Omit<Product, 'id' | 'createdAt'>) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').insert([{
        name: p.name, category: p.category, description: p.description,
        price: p.price, quantity: p.quantity, main_image: p.mainImage,
        images: p.images, available: p.available, featured: p.featured,
      }]).select().single();
      if (!error && data) { setProducts(prev => [toProduct(data as Record<string, unknown>), ...prev]); return; }
    }
    setProducts(prev => [{ ...p, id: `local_${Date.now()}`, createdAt: new Date().toISOString() }, ...prev]);
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    if (!isSupabaseConfigured) return;
    const payload: Record<string, unknown> = {};
    if (data.name        !== undefined) payload.name        = data.name;
    if (data.category    !== undefined) payload.category    = data.category;
    if (data.description !== undefined) payload.description = data.description;
    if (data.price       !== undefined) payload.price       = data.price;
    if (data.quantity    !== undefined) payload.quantity    = data.quantity;
    if (data.mainImage   !== undefined) payload.main_image  = data.mainImage;
    if (data.images      !== undefined) payload.images      = data.images;
    if (data.available   !== undefined) payload.available   = data.available;
    if (data.featured    !== undefined) payload.featured    = data.featured;
    if (Object.keys(payload).length > 0) {
      const { error } = await supabase.from('products').update(payload).eq('id', id);
      if (error) console.error('[updateProduct]', error.message);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (!isSupabaseConfigured) return;
    await supabase.from('products').delete().eq('id', id);
  }, []);

  /* ── Orders ── */
  const addOrder = useCallback(async (o: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Order> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').insert([{
        customer_name: o.customerName, phone: o.phone,
        governorate: o.governorate, district: o.district, address: o.address,
        items: o.items, total_price: o.totalPrice, deposit: o.deposit,
        transfer_receipt: o.transferReceipt, transfer_number: o.transferNumber,
        selected_bank_account_id: o.selectedBankAccountId ?? null,
        payment_status: o.transferNumber || o.transferReceipt ? 'pending_review' : null,
        status: 'new',
      }]).select().single();
      if (!error && data) {
        const mapped = toOrder(data as Record<string, unknown>);
        setOrders(prev => [mapped, ...prev]);
        return mapped;
      }
    }
    const local: Order = {
      ...o,
      id: `ORD-${Date.now()}`,
      status: 'new',
      paymentStatus: o.transferNumber || o.transferReceipt ? 'pending_review' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrders(prev => [local, ...prev]);
    return local;
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    const updatedAt = new Date().toISOString();
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, updatedAt } : o));
    if (!isSupabaseConfigured) return;
    await supabase.from('orders').update({ status, updated_at: updatedAt }).eq('id', id);
  }, []);

  const updatePaymentStatus = useCallback(async (id: string, paymentStatus: PaymentStatus) => {
    const updatedAt = new Date().toISOString();
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus, updatedAt } : o));
    if (!isSupabaseConfigured) return;
    await supabase.from('orders').update({ payment_status: paymentStatus, updated_at: updatedAt }).eq('id', id);
  }, []);

  /* ── Bank Accounts ── */
  const addBankAccount = useCallback(async (a: Omit<BankAccount, 'id' | 'createdAt'>) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('bank_accounts').insert([{
        bank_name:      a.bankName,
        account_holder: a.accountHolder,
        account_number: a.accountNumber,
        wallet_number:  a.walletNumber ?? null,
        notes:          a.notes ?? null,
        active:         a.active,
      }]).select().single();
      if (!error && data) {
        setBankAccounts(prev => [...prev, toBankAccount(data as Record<string, unknown>)]);
        return;
      }
    }
    const local: BankAccount = { ...a, id: `local_${Date.now()}`, createdAt: new Date().toISOString() };
    setBankAccounts(prev => [...prev, local]);
  }, []);

  const updateBankAccount = useCallback(async (id: string, data: Partial<BankAccount>) => {
    setBankAccounts(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    if (!isSupabaseConfigured) return;
    const payload: Record<string, unknown> = {};
    if (data.bankName      !== undefined) payload.bank_name      = data.bankName;
    if (data.accountHolder !== undefined) payload.account_holder = data.accountHolder;
    if (data.accountNumber !== undefined) payload.account_number = data.accountNumber;
    if (data.walletNumber  !== undefined) payload.wallet_number  = data.walletNumber;
    if (data.notes         !== undefined) payload.notes          = data.notes;
    if (data.active        !== undefined) payload.active         = data.active;
    if (Object.keys(payload).length > 0) {
      const { error } = await supabase.from('bank_accounts').update(payload).eq('id', id);
      if (error) console.error('[updateBankAccount]', error.message);
    }
  }, []);

  const deleteBankAccount = useCallback(async (id: string) => {
    setBankAccounts(prev => prev.filter(a => a.id !== id));
    if (!isSupabaseConfigured) return;
    await supabase.from('bank_accounts').delete().eq('id', id);
  }, []);

  /* ── Upload ── */
  const uploadImage = useCallback(async (file: File, bucket: 'products' | 'receipts'): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) throw new Error('حجم الصورة يتجاوز 5MB');
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) throw new Error('صيغة غير مدعومة. استخدم JPG أو PNG أو WebP');
    if (!isSupabaseConfigured) return URL.createObjectURL(file);
    const { data, error } = await supabase.storage.from(bucket).upload(safeFileName(file.name), file, { contentType: file.type, cacheControl: '31536000', upsert: false });
    if (error) throw new Error(`فشل رفع الصورة: ${error.message}`);
    if (!data) throw new Error('فشل رفع الصورة');
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    if (!publicUrl) throw new Error('تعذّر الحصول على رابط الصورة');
    return publicUrl;
  }, []);

  const sendWhatsApp = useCallback((msg: string) => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }, []);

  /* ── Cart ── */
  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id);
      if (idx !== -1) { const next = [...prev]; next[idx] = { ...next[idx], quantity: next[idx].quantity + qty }; return next; }
      return [...prev, { product, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => setCart(prev => prev.filter(i => i.product.id !== productId)), []);
  const updateCartQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.product.id !== productId));
    else setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);

  return (
    <AppContext.Provider value={{
      currentPage, navigateTo, goBack, canGoBack, pageData,
      user, isAdmin, login, logout,
      products, loading, addProduct, updateProduct, deleteProduct,
      orders, addOrder, updateOrderStatus, updatePaymentStatus,
      uploadImage, whatsappNumber: WHATSAPP_NUMBER, sendWhatsApp,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartCount,
      bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
