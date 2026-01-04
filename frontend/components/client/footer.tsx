import { Leaf, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#faf8f5] dark:bg-[#151922]">
      {/* Subtle top shadow for depth */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Mobile Layout */}
        <div className="block sm:hidden w-full">
          <div className="flex flex-row flex-nowrap gap-8 w-full justify-center">
            {/* Контакти */}
            <div className="text-center">
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
            <div className="text-center">
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
            <p className="text-base text-slate-500 dark:text-admin-text-secondary leading-relaxed">
              Преміальні квіти для вашого бізнесу
            </p>
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
        <div className="hidden sm:flex justify-between items-center mt-8 pt-5 border-t border-slate-200/50 dark:border-admin-border text-slate-400 dark:text-admin-text-muted" style={{ fontSize: '9px' }}>
          <p>© {new Date().getFullYear()} Premium Flora</p>
          <p>
            Створено{" "}
            <a
              href="https://webbie.team"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600/60 hover:text-emerald-600 transition-colors"
            >
              Webbie.team
            </a>
          </p>
        </div>

        {/* Mobile Bottom bar */}
        <div className="sm:hidden mt-6 pt-4 border-t border-slate-200/50 dark:border-admin-border">
          <div className="flex flex-col items-center gap-0.5 text-[8px] text-slate-400 dark:text-admin-text-muted">
            <p>© {new Date().getFullYear()} Premium Flora</p>
            <p>
              Створено{" "}
              <a
                href="https://webbie.team"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600/60 hover:text-emerald-600 transition-colors"
              >
                Webbie.team
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}



