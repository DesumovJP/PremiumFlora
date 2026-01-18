import { Leaf, Phone, MapPin, Instagram, Send, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#fafafa] dark:bg-[#151922]">
      {/* Subtle top shadow for depth */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Mobile Layout */}
        <div className="block sm:hidden w-full">
          <div className="flex flex-row w-full">
            {/* Контакти */}
            <div className="w-1/2 text-center">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Контакти</h3>
              <div className="space-y-2 text-xs text-slate-600 dark:text-admin-text-secondary">
                <a
                  href="tel:+380671234567"
                  className="block transition-colors hover:text-emerald-600"
                >
                  +380 67 123 4567
                </a>
                <a
                  href="tel:+380501234567"
                  className="block transition-colors hover:text-emerald-600"
                >
                  +380 50 123 4567
                </a>
                <div className="text-slate-500">м. Київ, Україна</div>
              </div>
            </div>

            {/* Графік */}
            <div className="w-1/2 text-center">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Графік</h3>
              <div className="space-y-2 text-xs text-slate-600 dark:text-admin-text-secondary">
                <div>Пн - Пт: 9:00 - 18:00</div>
                <div>Сб: 10:00 - 16:00</div>
                <div className="text-slate-500">Нд: Вихідний</div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - 60% / 20% / 20% */}
        <div className="hidden sm:flex gap-8 lg:gap-12">
          {/* Brand - 60% */}
          <div className="w-[60%] space-y-4">
            <div className="flex items-center gap-3">
              {/* Soft icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Leaf className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 dark:text-admin-text-primary" style={{ fontFamily: 'var(--font-display), serif' }}>
                  Premium Flora
                </div>
                <div className="text-[0.7rem] uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400">
                  Оптові квіти
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-admin-text-secondary leading-relaxed max-w-xs">
              Преміальні квіти для вашого бізнесу. Свіжі поставки щодня, доставка по всій Україні.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
              >
                <Send className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Contact Info - 20% */}
          <div className="w-[20%] space-y-4">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Контакти</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-admin-text-secondary">
              <a
                href="tel:+380671234567"
                className="block transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                +380 67 123 4567
              </a>
              <a
                href="tel:+380501234567"
                className="block transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                +380 50 123 4567
              </a>
              <div className="text-slate-500">м. Київ, Україна</div>
            </div>
          </div>

          {/* Business Hours - 20% */}
          <div className="w-[20%] space-y-4">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Графік</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-admin-text-secondary">
              <div>Пн - Пт: 9:00 - 18:00</div>
              <div>Сб: 10:00 - 16:00</div>
              <div className="text-slate-400">Нд: Вихідний</div>
            </div>
          </div>
        </div>

        {/* Desktop Bottom bar */}
        <div className="hidden sm:flex gap-8 lg:gap-12 mt-8 pt-5 border-t border-slate-200/50 dark:border-admin-border text-slate-400 dark:text-admin-text-muted">
          <p className="w-[60%] text-xs">© {new Date().getFullYear()} Premium Flora</p>
          <div className="w-[20%]"></div>
          <a
            href="https://webbie.team"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[20%] flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-600 transition-colors group"
          >
            <span>Розробка сайту</span>
            <Code2 className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
            <span>Webbie.team</span>
          </a>
        </div>

        {/* Mobile Social links */}
        <div className="sm:hidden flex justify-center gap-3 mt-6">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-400"
          >
            <Instagram className="h-4 w-4" strokeWidth={1.5} />
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-400"
          >
            <Send className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>

        {/* Mobile Bottom bar */}
        <div className="sm:hidden mt-4 pt-4 border-t border-slate-200/50 dark:border-admin-border">
          <div className="flex flex-col items-center gap-0.5 text-[11px] text-slate-400 dark:text-admin-text-muted">
            <span>© {new Date().getFullYear()} Premium Flora</span>
            <a
              href="https://webbie.team"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
            >
              <Code2 className="h-2.5 w-2.5 opacity-50" strokeWidth={1.5} />
              <span>Webbie.team</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}



