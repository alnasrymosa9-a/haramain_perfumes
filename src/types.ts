/* ===== أنواع البيانات - الحرمين للعود والعطور ===== */

export type Category = 'perfumes' | 'oud' | 'incense' | 'beauty' | 'offers';

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  description: string;
  price: number;
  quantity: number;
  mainImage: string;
  images: string[];
  available: boolean;
  featured: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/* ── حسابات الدفع البنكية ── */
export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  walletNumber?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

/* ── حالة الدفع ── */
export type PaymentStatus = 'pending_review' | 'verified' | 'rejected';

export const PAYMENT_STATUS_MAP: Record<PaymentStatus, string> = {
  pending_review: 'بانتظار المراجعة',
  verified:       'تم التحقق',
  rejected:       'مرفوض',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  verified:       'bg-green-500/20 text-green-400 border-green-500/30',
  rejected:       'bg-red-500/20 text-red-400 border-red-500/30',
};

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  governorate: string;
  district: string;
  address: string;
  items: OrderItem[];
  totalPrice: number;
  deposit: number;
  transferReceipt: string;
  transferNumber: string;
  selectedBankAccountId?: string;
  paymentStatus?: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'new'
  | 'deposit_review'
  | 'preparing'
  | 'delivered'
  | 'cancelled';

export interface PaymentInfo {
  kareemiName: string;
  kareemiNumber: string;
}

export type Page =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'contact'
  | 'offers'
  | 'login'
  | 'track-order'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-add-product'
  | 'admin-edit-product'
  | 'admin-settings';

export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  new:            'طلب جديد',
  deposit_review: 'قيد المراجعة',
  preparing:      'قيد التجهيز',
  delivered:      'تم التسليم',
  cancelled:      'تم الإلغاء',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new:            'bg-blue-500/20 text-blue-400 border-blue-500/30',
  deposit_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  preparing:      'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered:      'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled:      'bg-red-500/20 text-red-400 border-red-500/30',
};

// ترتيب خطوات التتبع
export const ORDER_STATUS_STEPS: OrderStatus[] = [
  'new', 'deposit_review', 'preparing', 'delivered',
];

export const CATEGORIES: CategoryInfo[] = [
  { id: 'perfumes', name: 'العطور',          icon: '🧴', description: 'أرقى وأفخم العطور العربية والعالمية' },
  { id: 'oud',      name: 'العود',           icon: '🪵', description: 'أجود أنواع العود الكمبودي والهندي' },
  { id: 'incense',  name: 'مستلزمات البخور', icon: '🔥', description: 'كل ما يخص البخور والدخون' },
  { id: 'beauty',   name: 'أدوات التجميل',  icon: '💄', description: 'مستحضرات تجميل وأدوات العناية بالبشرة' },
  { id: 'offers',   name: 'العروض الخاصة',  icon: '🎁', description: 'عروض حصرية وتخفيضات مميزة' },
];
