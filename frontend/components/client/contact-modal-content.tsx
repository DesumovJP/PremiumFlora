"use client";

import { Phone, Clock, MessageCircle, Send } from "lucide-react";
import { motion } from "framer-motion";

// Contact information
const contacts = {
  phones: [
    { number: "+380 67 123 4567", href: "tel:+380671234567" },
    { number: "+380 50 123 4567", href: "tel:+380501234567" },
  ],
  viber: { href: "viber://chat?number=%2B380671234567" },
  telegram: { href: "https://t.me/premiumflora" },
  workHours: "Пн-Пт: 9:00-18:00 • Сб: 10:00-16:00",
};

export function ContactModalContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="space-y-4">
      {/* Phones */}
      <div className="space-y-2">
        {contacts.phones.map((phone, index) => (
          <motion.a
            key={index}
            href={phone.href}
            onClick={onClose}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="group flex items-center gap-3 p-3 rounded-xl bg-[#fafafa] transition-all duration-200 hover:bg-emerald-50 active:scale-[0.98]"
            style={{
              boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.04), -3px -3px 6px rgba(255, 255, 255, 0.9)',
            }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white"
              style={{
                boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.04), inset -1px -1px 2px rgba(255, 255, 255, 0.8)',
              }}
            >
              <Phone className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">
              {phone.number}
            </span>
          </motion.a>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[10px] uppercase tracking-wider text-slate-400">або</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Messengers */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
        className="grid grid-cols-2 gap-2.5"
      >
        {/* Viber */}
        <a
          href={contacts.viber.href}
          onClick={onClose}
          className="group flex flex-col items-center gap-2 p-3.5 rounded-xl bg-[#fafafa] transition-all duration-200 hover:bg-[#7360f2]/5 active:scale-[0.98]"
          style={{
            boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.04), -3px -3px 6px rgba(255, 255, 255, 0.9)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl bg-white flex items-center justify-center transition-colors group-hover:bg-[#7360f2]/10"
            style={{
              boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.04), inset -1px -1px 2px rgba(255, 255, 255, 0.8)',
            }}
          >
            <MessageCircle className="h-5 w-5 text-[#7360f2]" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium text-slate-600 group-hover:text-[#7360f2] transition-colors">Viber</span>
        </a>

        {/* Telegram */}
        <a
          href={contacts.telegram.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="group flex flex-col items-center gap-2 p-3.5 rounded-xl bg-[#fafafa] transition-all duration-200 hover:bg-[#0088cc]/5 active:scale-[0.98]"
          style={{
            boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.04), -3px -3px 6px rgba(255, 255, 255, 0.9)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl bg-white flex items-center justify-center transition-colors group-hover:bg-[#0088cc]/10"
            style={{
              boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.04), inset -1px -1px 2px rgba(255, 255, 255, 0.8)',
            }}
          >
            <Send className="h-5 w-5 text-[#0088cc]" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium text-slate-600 group-hover:text-[#0088cc] transition-colors">Telegram</span>
        </a>
      </motion.div>

      {/* Work hours */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        className="flex items-center justify-center gap-2 pt-1 text-slate-400"
      >
        <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="text-[11px]">{contacts.workHours}</span>
      </motion.div>
    </div>
  );
}
