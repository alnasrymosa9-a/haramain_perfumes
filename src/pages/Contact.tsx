/* ===== صفحة التواصل ===== */

import { motion } from 'framer-motion';
import { MessageCircle, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useApp } from '../context';
import { STORE_INFO } from '../data';

export function ContactPage() {
  const { sendWhatsApp } = useApp();

  const contacts = [
    {
      icon: MessageCircle,
      title: 'واتساب',
      value: STORE_INFO.whatsapp,
      action: () => sendWhatsApp('السلام عليكم، أريد التواصل معكم'),
      color: 'text-green-400 bg-green-500/10',
      dir: true,
    },
    {
      icon: Phone,
      title: 'هاتف',
      value: STORE_INFO.whatsapp,
      action: () => window.open(`tel:${STORE_INFO.whatsapp}`),
      color: 'text-blue-400 bg-blue-500/10',
      dir: true,
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      value: STORE_INFO.email,
      action: () => window.open(`mailto:${STORE_INFO.email}`),
      color: 'text-gold-400 bg-gold-400/10',
      dir: false,
    },
    {
      icon: MapPin,
      title: 'العنوان',
      value: STORE_INFO.address,
      action: undefined,
      color: 'text-purple-400 bg-purple-500/10',
      dir: false,
    },
    {
      icon: Clock,
      title: 'ساعات العمل',
      value: 'يومياً — 8 صباحاً حتى 10 مساءً',
      action: undefined,
      color: 'text-amber-400 bg-amber-500/10',
      dir: false,
    },
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            تواصل <span className="gold-gradient-text">معنا</span>
          </h1>
          <p className="text-dark-300 text-sm sm:text-base">نحن هنا لخدمتك على مدار الساعة</p>
          <div className="gold-line w-24 mx-auto mt-4" />
        </motion.div>

        <div className="space-y-3">
          {contacts.map(({ icon: Icon, title, value, action, color, dir }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={action}
              className={`glass rounded-2xl p-5 flex items-center gap-4 ${action ? 'cursor-pointer hover:border-gold-400/25 border border-transparent transition-all' : ''}`}
            >
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-dark-300 text-xs mb-0.5">{title}</p>
                <p className={`text-white font-medium text-sm sm:text-base truncate ${dir ? 'text-left' : ''}`} dir={dir ? 'ltr' : undefined}>
                  {value}
                </p>
              </div>
              {action && <span className="text-gold-400 text-xs opacity-60">اضغط للتواصل</span>}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 glass rounded-2xl p-6 text-center border border-gold-400/15"
        >
          <h3 className="text-white font-bold text-lg mb-2">تحتاج مساعدة؟</h3>
          <p className="text-dark-300 text-sm mb-4">
            فريقنا جاهز للإجابة على جميع استفساراتك حول المنتجات والطلبات والشحن
          </p>
          <button
            onClick={() => sendWhatsApp('السلام عليكم، لدي استفسار')}
            className="btn-gold flex items-center gap-2 mx-auto px-6"
          >
            <MessageCircle size={18} />
            تحدث معنا الآن
          </button>
        </motion.div>
      </div>
    </div>
  );
}
