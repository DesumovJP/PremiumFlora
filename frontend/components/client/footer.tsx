import { Leaf, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 dark:border-admin-border glass glass-soft">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Mobile Layout */}
        <div className="block sm:hidden w-full">
          <div className="flex flex-row flex-nowrap gap-4 w-full">
            {/* Контакти - зліва */}
            <div className="flex-1 min-w-0 text-center">
              <h3 className="footer-heading mb-1">Контакти</h3>
              <div className="space-y-1.5 text-[0.5625rem] text-slate-600 dark:text-admin-text-secondary">
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
                <div>м. Київ, Україна</div>
              </div>
            </div>
            
            {/* Режим роботи - справа */}
            <div className="flex-1 min-w-0 text-center">
              <h3 className="footer-heading mb-1">Режим роботи</h3>
              <div className="space-y-1 text-[0.5625rem] text-slate-600 dark:text-admin-text-secondary">
                <div>Пн - Пт: 9:00 - 18:00</div>
                <div>Сб: 10:00 - 16:00</div>
                <div>Нд: Вихідний</div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/25">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-admin-text-primary">Premium Flora</div>
                <div className="text-[0.625rem] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Оптовий магазин квітів</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-admin-text-secondary leading-relaxed">
              Преміальні квіти для вашого бізнесу. Якість, надійність та індивідуальний підхід до кожного клієнта.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 text-center">
            <h3 className="footer-heading">Контакти</h3>
            <div className="mx-auto max-w-[17.5rem] flex flex-col gap-3">
              <a
                href="tel:+380671234567"
                className="flex items-center justify-center gap-3 text-sm text-slate-600 dark:text-admin-text-secondary transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+380 67 123 4567</span>
              </a>
              <a
                href="tel:+380501234567"
                className="flex items-center justify-center gap-3 text-sm text-slate-600 dark:text-admin-text-secondary transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+380 50 123 4567</span>
              </a>
              <div className="flex items-center justify-center gap-3 text-sm text-slate-600 dark:text-admin-text-secondary">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>м. Київ, Україна</span>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4 text-center">
            <h3 className="footer-heading">Режим роботи</h3>
            <div className="mx-auto max-w-[17.5rem] space-y-2 text-sm text-slate-600 dark:text-admin-text-secondary">
              <div>Пн - Пт: 9:00 - 18:00</div>
              <div>Сб: 10:00 - 16:00</div>
              <div>Нд: Вихідний</div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-12 border-t border-slate-100 dark:border-admin-border pt-4 sm:pt-8 text-center space-y-2">
          <p className="!text-[0.625rem] sm:!text-sm text-slate-500 dark:text-admin-text-muted">
            © {new Date().getFullYear()} Premium Flora. Всі права захищені.
          </p>
          <p className="!text-[0.625rem] sm:!text-sm text-slate-500 dark:text-admin-text-muted">
            Розробка сайту 🌸 {" "}
            <a
              href="https://webbie.team"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors !text-[0.625rem] sm:!text-sm"
            >
              Webbie.team
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}



