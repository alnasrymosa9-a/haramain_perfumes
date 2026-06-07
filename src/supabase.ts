/* ===== إعداد Supabase Client ===== */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl    = import.meta.env.VITE_SUPABASE_URL    ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// true فقط إذا كانت القيم حقيقية وليست placeholder
export const isSupabaseConfigured =
  supabaseUrl !== '' &&
  supabaseAnonKey !== '' &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseUrl.startsWith('https://');

// نُنشئ client دائماً لتجنب أخطاء TypeScript - لكن نتحقق من isSupabaseConfigured قبل الاستخدام
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);
