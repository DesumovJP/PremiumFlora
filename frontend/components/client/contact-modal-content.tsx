"use client";

import { Phone, Clock, MessageCircle, Send } from "lucide-react";

// Contact information
const contacts = {
  phones: [
    { number: "+380 67 123 4567", href: "tel:+380671234567" },
    { number: "+380 50 123 4567", href: "tel:+380501234567" },
  ],
  viber: { number: "+380 67 123 4567", href: "viber://chat?number=%2B380671234567" },
  telegram: { username: "@premiumflora", href: "https://t.me/premiumflora" },
  workHours: "Пн - Пт: 9:00 - 18:00",
};

export function ContactModalContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="space-y-5">
      {/* Phones - simple list */}
      <div className="space-y-2">
        {contacts.phones.map((phone, index) => (
          <a
            key={index}
            href={phone.href}
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Phone className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <span className="text-sm">{phone.number}</span>
          </a>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[10px] uppercase tracking-wider text-slate-400">або напишіть</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Messengers - inline */}
      <div className="flex gap-3">
        {/* Viber */}
        <a
          href={contacts.viber.href}
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-slate-100 text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/50"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
          <span className="text-sm font-medium">Viber</span>
        </a>

        {/* Telegram */}
        <a
          href={contacts.telegram.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-slate-100 text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/50"
        >
          <Send className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
          <span className="text-sm font-medium">Telegram</span>
        </a>
      </div>

      {/* Work hours */}
      <div className="flex items-center justify-center gap-2 pt-1 text-slate-400">
        <Clock className="h-3 w-3" strokeWidth={1.5} />
        <span className="text-[11px]">{contacts.workHours}</span>
      </div>
    </div>
  );
}
