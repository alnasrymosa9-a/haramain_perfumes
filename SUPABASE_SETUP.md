# دليل إعداد Supabase الكامل 🗄️

## 1. إنشاء المشروع
1. سجّل في https://supabase.com
2. أنشئ مشروعاً جديداً (Region: Europe West موصى به)
3. من **Settings → API** انسخ:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`

ضعهما في `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 2. إنشاء الجداول (SQL Editor)

```sql
-- جدول المنتجات
CREATE TABLE products (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  category    TEXT        NOT NULL,
  description TEXT        DEFAULT '',
  price       NUMERIC     NOT NULL DEFAULT 0,
  quantity    INTEGER     NOT NULL DEFAULT 0,
  main_image  TEXT        DEFAULT '',
  images      JSONB       DEFAULT '[]',
  available   BOOLEAN     DEFAULT true,
  featured    BOOLEAN     DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الطلبات
CREATE TABLE orders (
  id               TEXT        PRIMARY KEY DEFAULT ('ORD-' || gen_random_uuid()::text),
  customer_name    TEXT        NOT NULL,
  phone            TEXT        NOT NULL,
  governorate      TEXT        DEFAULT '',
  district         TEXT        DEFAULT '',
  address          TEXT        DEFAULT '',
  items            JSONB       DEFAULT '[]',
  total_price      NUMERIC     NOT NULL DEFAULT 0,
  deposit          NUMERIC     DEFAULT 0,
  transfer_receipt TEXT        DEFAULT '',
  transfer_number  TEXT        DEFAULT '',
  status           TEXT        DEFAULT 'new',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Storage Buckets

في **Storage → Buckets** أنشئ:

| الاسم | النوع | الوصف |
|-------|-------|-------|
| `products` | **Public** | صور المنتجات |
| `receipts` | **Public** | سندات التحويل من العملاء |

> ⚠️ كلا الـ bucket يجب Public حتى تعمل روابط الصور.

---

## 4. Row Level Security (SQL Editor)

```sql
-- تفعيل RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;

-- ───── المنتجات ─────
-- الجميع يقرأ
CREATE POLICY "products_read" ON products FOR SELECT USING (true);
-- المسؤولون فقط يكتبون
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "products_update" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "products_delete" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- ───── الطلبات ─────
-- الجميع يُضيف (العميل لا يسجّل دخول)
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
-- المسؤولون فقط يقرؤون ويعدّلون
CREATE POLICY "orders_select" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- ───── Storage ─────
-- قراءة عامة للصور
CREATE POLICY "products_read" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "receipts_read" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');
-- المسؤولون يرفعون صور المنتجات
CREATE POLICY "products_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
-- الجميع يرفع سندات التحويل (بدون تسجيل دخول)
CREATE POLICY "receipts_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts');
-- المسؤولون يحذفون الصور
CREATE POLICY "products_del" ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');
```

---

## 5. إنشاء مستخدم الأدمن

في **Authentication → Users → Add User**:
- Email: `adnankhaledaldby@gmail.com`
- Password: كلمة مرور قوية (8+ حروف)

---

## ✅ قائمة التحقق

- [ ] `.env` يحتوي URL و Key
- [ ] جدول `products` مُنشأ
- [ ] جدول `orders` مُنشأ
- [ ] Bucket `products` مُنشأ وPublic
- [ ] Bucket `receipts` مُنشأ وPublic
- [ ] RLS policies مُطبَّقة
- [ ] مستخدم الأدمن مُنشأ
- [ ] تجربة تسجيل الدخول ✓
- [ ] تجربة إضافة منتج بصورة ✓
- [ ] تجربة إرسال طلب بسند ✓

---

## 6. جدول حسابات الدفع البنكية (جديد)

```sql
-- جدول حسابات الدفع البنكية
CREATE TABLE bank_accounts (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name      TEXT        NOT NULL,
  account_holder TEXT        NOT NULL,
  account_number TEXT        NOT NULL,
  wallet_number  TEXT        DEFAULT NULL,
  notes          TEXT        DEFAULT NULL,
  active         BOOLEAN     DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة أعمدة التحويل البنكي لجدول الطلبات
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS selected_bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT NULL;

-- RLS لجدول حسابات الدفع
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- الجميع يقرأ الحسابات المفعلة (للعملاء في صفحة الطلب)
CREATE POLICY "bank_accounts_read_active" ON bank_accounts
  FOR SELECT USING (active = true OR auth.role() = 'authenticated');

-- المسؤولون فقط يكتبون
CREATE POLICY "bank_accounts_insert" ON bank_accounts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "bank_accounts_update" ON bank_accounts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "bank_accounts_delete" ON bank_accounts
  FOR DELETE USING (auth.role() = 'authenticated');
```

> ✅ بعد تطبيق هذا SQL تصبح ميزة إدارة حسابات الدفع البنكية جاهزة كاملاً.
