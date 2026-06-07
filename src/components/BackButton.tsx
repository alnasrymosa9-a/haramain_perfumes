/* ===== زر الرجوع الذكي ===== */

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../context';

export function BackButton() {
  const { canGoBack, goBack } = useApp();

  if (!canGoBack) return null;

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={goBack}
      className="fixed top-20 sm:top-24 right-4 z-40 flex items-center gap-1.5 glass border border-gold-400/20 text-gold-400 hover:bg-gold-400/10 px-3 py-2 rounded-xl text-sm font-medium transition-all shadow-lg"
      aria-label="رجوع"
    >
      <ChevronRight size={18} />
      <span className="hidden sm:inline">رجوع</span>
    </motion.button>
  );
}
