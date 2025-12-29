"use client";

import { Phone } from "lucide-react";

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

// Viber icon component
function ViberIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 1.003c-4.587.015-9.015 1.586-9.015 7.146 0 3.803.942 6.062 2.723 7.482V18.5l2.588-1.418c.704.192 1.469.306 2.286.326l.003.001c.066.001.132.002.199.002 4.701 0 8.52-3.032 8.52-7.41 0-4.181-3.456-8.976-7.304-8.998zm-.024 1.502c3.312.018 6.323 4.163 6.323 7.496 0 3.629-3.255 5.908-7.019 5.908-.066 0-.132-.001-.198-.002-.689-.017-1.374-.104-2.032-.26l-.45-.108-1.57.86v-1.62l-.343-.266c-1.517-1.175-2.378-3.018-2.378-6.512 0-4.658 3.667-5.513 7.667-5.496zm.114 2.4c-.193 0-.386.074-.533.222-.147.147-.22.34-.22.533s.073.386.22.533c.147.147.34.221.533.221s.386-.074.533-.221c.147-.147.22-.34.22-.533s-.073-.386-.22-.533c-.147-.148-.34-.222-.533-.222zm2.918 1.102c-.13-.03-.266.01-.368.097-.102.087-.164.213-.173.347-.008.134.038.266.128.363.09.097.218.152.353.152h.002c.404 0 .791.095 1.148.28.357.186.672.457.936.806.264.35.467.758.603 1.216.135.457.2.947.192 1.458-.007.136.044.27.14.367.098.098.23.153.37.152.14-.001.274-.058.37-.158.096-.1.148-.233.143-.37-.01-.618-.074-1.213-.247-1.777-.172-.564-.424-1.08-.751-1.534-.327-.455-.723-.835-1.178-1.131-.456-.296-.964-.51-1.51-.625-.052-.012-.105-.023-.158-.043zm-5.124.148c-.105-.004-.21.015-.31.055-.394.16-.651.41-.803.776l-.009.024c-.12.31-.072.648.13.912.23.302.559.74.866 1.102.307.36.615.654.907.795.353.172.833.422 1.363.717.53.296 1.113.643 1.618.992.317.22.596.43.808.604l.068.058c.2.172.48.235.742.168.261-.068.478-.25.576-.486.193-.464.11-.944-.248-1.279-.118-.11-.255-.208-.4-.296-.3-.18-.66-.328-.978-.454-.159-.063-.308-.12-.435-.171-.254-.102-.448-.179-.541-.23-.264-.143-.485-.17-.663-.102-.177.068-.295.213-.363.37-.069.157-.087.323-.066.456.02.132.07.235.143.3.073.064.166.096.278.085.113-.011.19-.061.253-.125.063-.063.113-.135.165-.198-.208-.024-.383.017-.527.13-.143.112-.217.276-.23.458-.012.183.045.373.178.534.133.16.34.284.6.339.26.055.556.04.858-.07.302-.11.604-.316.874-.62.27-.303.51-.706.689-1.207.089-.251.162-.53.216-.836.027-.153.049-.312.065-.477.032-.33.044-.68.034-1.048-.02-.734-.125-1.516-.352-2.297-.227-.78-.573-1.556-1.072-2.276-.102-.148-.215-.29-.337-.426-.203-.227-.44-.423-.712-.575-.136-.076-.283-.14-.44-.19-.314-.1-.661-.132-1.015-.09z"/>
    </svg>
  );
}

// Telegram icon component
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

export function ContactModalContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="space-y-4">
      {/* Phones */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Телефони
        </div>
        <div className="space-y-2">
          {contacts.phones.map((phone, index) => (
            <a
              key={index}
              href={phone.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Phone className="h-5 w-5" />
              </div>
              <span>{phone.number}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Messengers - 50% width each */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Месенджери
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* Viber */}
          <a
            href={contacts.viber.href}
            onClick={onClose}
            className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <ViberIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-semibold">Viber</span>
              <span className="text-xs text-slate-500">{contacts.viber.number}</span>
            </div>
          </a>

          {/* Telegram */}
          <a
            href={contacts.telegram.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-sky-50 hover:text-sky-700 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <TelegramIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-semibold">Telegram</span>
              <span className="text-xs text-slate-500">{contacts.telegram.username}</span>
            </div>
          </a>
        </div>
      </div>

      {/* Work hours */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-center">
        <div className="text-xs font-medium text-slate-500">Графік роботи</div>
        <div className="text-sm font-semibold text-slate-700">{contacts.workHours}</div>
      </div>
    </div>
  );
}
