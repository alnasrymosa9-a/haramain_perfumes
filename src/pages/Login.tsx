/* ===== صفحة تسجيل الدخول ===== */

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context';

export function LoginPage() {
  const { login, navigateTo } = useApp();
  const [email,    setEmail]   = useState('');
  const [password, setPassword]= useState('');
  const [showPw,   setShowPw]  = useState(false);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      const ok = await login(email.trim(), password);
      if (ok) {
        navigateTo('admin-dashboard');
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full border-3 border-gold-400/60 bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center text-dark-900 font-black text-3xl mx-auto mb-4 shadow-lg shadow-gold-400/20">
            ح
          </div>
          <h1 className="text-white text-2xl font-black mb-1">لوحة التحكم</h1>
          <p className="text-dark-400 text-sm">الحرمين للعود والعطور</p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 border border-gold-400/15">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="text-white text-sm font-medium block mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@haramain.com"
                  autoComplete="email"
                  required
                  dir="ltr"
                  className="w-full bg-dark-900 border border-gold-400/10 rounded-xl pr-10 pl-4 py-3 text-white placeholder-dark-400 focus:border-gold-400/40 focus:outline-none text-sm text-left transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-400 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  dir="ltr"
                  className="w-full bg-dark-900 border border-gold-400/10 rounded-xl pr-10 pl-10 py-3 text-white placeholder-dark-400 focus:border-gold-400/40 focus:outline-none text-sm text-left transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-gold-400 transition-colors"
                  aria-label={showPw ? 'إخفاء' : 'إظهار'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" />جارٍ الدخول...</>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
