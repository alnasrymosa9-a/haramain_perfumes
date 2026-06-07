/* ===== البيانات الثابتة والتجريبية ===== */

import { Product, PaymentInfo } from './types';

// ─── بيانات تجريبية (تُستخدم فقط عندما لا يكون Supabase مُعدَّاً) ────────────
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1', name: 'عطر المسك الأبيض الفاخر', category: 'perfumes',
    description: 'عطر المسك الأبيض الفاخر، تركيبة استثنائية من أجود أنواع المسك الطبيعي. يتميز برائحة نقية وعميقة تدوم طويلاً.',
    price: 15000, quantity: 25, mainImage: '', images: [], available: true, featured: true, createdAt: '2024-01-15',
  },
  {
    id: '2', name: 'عود كمبودي سوبر', category: 'oud',
    description: 'أجود أنواع العود الكمبودي الطبيعي. يتميز برائحة غنية ومعقدة تتطور مع الوقت.',
    price: 45000, quantity: 10, mainImage: '', images: [], available: true, featured: true, createdAt: '2024-01-20',
  },
  {
    id: '3', name: 'بخور العود الملكي', category: 'incense',
    description: 'مزيج فاخر من بخور العود الطبيعي مع توابل شرقية مختارة.',
    price: 8000, quantity: 50, mainImage: '', images: [], available: true, featured: false, createdAt: '2024-02-01',
  },
  {
    id: '4', name: 'دهن العود الهندي الأصلي', category: 'oud',
    description: 'دهن العود الهندي الأصيل، مستخلص من أجود أنواع العود. تركيبة غنية ومركزة تدوم طوال اليوم.',
    price: 35000, quantity: 15, mainImage: '', images: [], available: true, featured: true, createdAt: '2024-02-10',
  },
  {
    id: '5', name: 'عطر العنبر الساحر', category: 'perfumes',
    description: 'مزيج رائع من العنبر الطبيعي والفانيليا. عطر دافئ وغامض يناسب الليالي الباردة.',
    price: 22000, quantity: 20, mainImage: '', images: [], available: true, featured: false, createdAt: '2024-02-15',
  },
  {
    id: '6', name: 'مبخرة فخارية مطلية بالذهب', category: 'incense',
    description: 'مبخرة فخمة مصنوعة من النحاس المطلي بالذهب. تصميم عصري مع نقوش شرقية تقليدية.',
    price: 28000, quantity: 8, mainImage: '', images: [], available: true, featured: true, createdAt: '2024-03-01',
  },
  {
    id: '7', name: 'كريم العناية بالبشرة الذهبية', category: 'beauty',
    description: 'كريم فاخر للعناية بالبشرة يحتوي على جزيئات الذهب الخالص.',
    price: 12000, quantity: 30, mainImage: '', images: [], available: true, featured: false, createdAt: '2024-03-10',
  },
  {
    id: '8', name: 'طقم عطور ملكي - 6 قطع', category: 'offers',
    description: 'طقم عطور ملكي يحتوي على 6 عطور مختلفة بأحجام صغيرة. عرض خاص لفترة محدودة!',
    price: 55000, quantity: 12, mainImage: '', images: [], available: true, featured: true, createdAt: '2024-03-15',
  },
  {
    id: '9', name: 'عطر الورد الدمشقي', category: 'perfumes',
    description: 'عطر الورد الدمشقي الطبيعي، مستخلص من أجود أنواع الورد الشامي.',
    price: 18000, quantity: 18, mainImage: '', images: [], available: true, featured: false, createdAt: '2024-03-20',
  },
  {
    id: '10', name: 'مسك السلطان الأسود', category: 'perfumes',
    description: 'عطر قوي وعميق مناسب للرجال. مزيج من المسك الأسود والعنبر والعود.',
    price: 20000, quantity: 22, mainImage: '', images: [], available: true, featured: false, createdAt: '2024-04-01',
  },
  {
    id: '11', name: 'عود جاوي ممتاز', category: 'oud',
    description: 'عود جاوي ممتاز ذو جودة عالية، مناسب للاستخدام اليومي والمناسبات.',
    price: 12000, quantity: 35, mainImage: '', images: [], available: true, featured: false, createdAt: '2024-04-05',
  },
  {
    id: '12', name: 'طقم بخور هدايا فاخر', category: 'offers',
    description: 'طقم بخور هدايا فاخر يحتوي على 5 أنواع بخور مختلفة مع مبخرة أنيقة.',
    price: 15000, quantity: 20, mainImage: '', images: [], available: true, featured: true, createdAt: '2024-04-10',
  },
];

// ─── معلومات الدفع ──────────────────────────────────────────────────────────
export const PAYMENT_INFO: PaymentInfo = {
  kareemiName: 'الحرمين للعود والعطور',
  kareemiNumber: '967774726404',
};

// ─── معلومات المتجر ──────────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = '967774726404';

export const STORE_INFO = {
  name: 'الحرمين للعود والعطور',
  whatsapp: '+967774726404',
  email: 'adnankhaledaldby@gmail.com',
  address: 'اليمن - عدن - الشيخ عثمان - شارع دجلة',
  developer: 'MOSA ALNASRY',
  developerPhone: '770909668',
} as const;

// ─── مناطق اليمن ──────────────────────────────────────────────────────────────
export const YEMEN_LOCATIONS: Record<string, string[]> = {
  'عدن':      ['الشيخ عثمان', 'المعلا', 'كريتر', 'المنصورة', 'دار سعد', 'خورمكسر', 'البريقة', 'العرب'],
  'صنعاء':    ['الصافية', 'الثورة', 'الأصبحي', 'الوحدة', 'معين', 'شعوب', 'بني الحارث', 'سنحان'],
  'تعز':      ['المظفر', 'القاهرة', 'صالة', 'الحوبان'],
  'الحديدة':  ['الحالي', 'المينا', 'الصالح', 'المير'],
  'إب':       ['المدينة', 'الظهار', 'السياني'],
  'ذمار':     ['المدينة', 'جهران'],
  'المكلا':   ['المكلا', 'فوة', 'بروم'],
  'حضرموت':  ['المكلا', 'سيئون', 'تريم'],
  'شبوة':     ['عتق', 'بيحان'],
  'مأرب':     ['مأرب المدينة', 'مأرب'],
  'لحج':      ['الحوطة', 'يافع'],
  'أبين':     ['زنجبار', 'جعار'],
};

// ─── رسوم التوصيل ─────────────────────────────────────────────────────────────
export const DELIVERY_FEES: Record<string, number> = {
  'عدن':      500,
  'صنعاء':   1500,
  'تعز':     1200,
  'الحديدة': 1500,
  'إب':      1200,
  'ذمار':    1300,
  'المكلا':  1800,
  'حضرموت': 1800,
  'شبوة':    1500,
  'مأرب':    1500,
  'لحج':      800,
  'أبين':     800,
  default:   1500,
};
