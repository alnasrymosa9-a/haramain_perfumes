/* ===== PWA Install Prompt ===== */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [prompt,  setPrompt]  = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      // أظهر البانر بعد 3 ثوانٍ لتجنب الإزعاج الفوري
      setTimeout(() => setVisible(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setPrompt(null);
    } catch (err) {
      console.error('[PWA] install error:', err);
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && prompt && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50"
        >
          <div className="glass-dark border border-gold-400/25 rounded-2xl p-4 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center text-dark-900 font-black text-xl shrink-0 shadow-md">
                ح
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">تثبيت التطبيق</p>
                <p className="text-dark-300 text-xs mt-0.5 leading-relaxed">
                  أضف الحرمين للعود والعطور إلى شاشتك الرئيسية للوصول السريع
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="btn-gold flex items-center gap-1.5 text-xs py-1.5 px-3"
                  >
                    <Download size={13} />تثبيت
                  </button>
                  <button
                    onClick={() => setVisible(false)}
                    className="text-dark-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                  >
                    لاحقاً
                  </button>
                </div>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="p-1 text-dark-400 hover:text-white transition-colors shrink-0"
                aria-label="إغلاق"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
