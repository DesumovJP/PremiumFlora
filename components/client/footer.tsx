import { Leaf, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="flex gap-4">
            {/* Контакти - зліва */}
            <div className="w-1/2 text-center">
              <h3 className="footer-heading mb-1">Контакти</h3>
              <div className="space-y-1.5 text-[9px] text-slate-600">
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
            <div className="w-1/2 text-center">
              <h3 className="footer-heading mb-1">Режим роботи</h3>
              <div className="space-y-1 text-[9px] text-slate-600">
              <div>Пн - Пт: 9:00 - 18:00</div>
              <div>Сб: 10:00 - 16:00</div>
              <div>Нд: Вихідний</div>
            </div>
            </div>
          </div>
          
          {/* Нова поставка - по центру */}
          <div className="mt-6 text-center">
            <div className="text-[10px] font-medium text-emerald-700">Нова поставка щоп'ятниці</div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden grid-cols-1 gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/25">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">Premium Flora</div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-600">Оптовий магазин квітів</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Преміальні квіти для вашого бізнесу. Якість, надійність та індивідуальний підхід до кожного клієнта.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 text-center">
            <h3 className="footer-heading">Контакти</h3>
            <div className="mx-auto max-w-[280px] flex flex-col gap-3">
              <a
                href="tel:+380671234567"
                className="flex items-center justify-center gap-3 text-sm text-slate-600 transition-colors hover:text-emerald-600"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+380 67 123 4567</span>
              </a>
              <a
                href="tel:+380501234567"
                className="flex items-center justify-center gap-3 text-sm text-slate-600 transition-colors hover:text-emerald-600"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+380 50 123 4567</span>
              </a>
              <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>м. Київ, Україна</span>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4 text-center">
            <h3 className="footer-heading">Режим роботи</h3>
            <div className="mx-auto max-w-[280px] space-y-2 text-sm text-slate-600">
              <div>Пн - Пт: 9:00 - 18:00</div>
              <div>Сб: 10:00 - 16:00</div>
              <div>Нд: Вихідний</div>
            </div>
          </div>
        </div>

        {/* Friday delivery note - centered for tablet & desktop with horizontal line */}
        <div className="mt-8 hidden border-t border-slate-200 pt-4 text-center sm:block">
          <div className="text-sm font-medium text-emerald-700">
            Нова поставка щоп'ятниці
          </div>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-8 text-center space-y-2">
          <p className="!text-[10px] sm:!text-sm text-slate-500">
            © {new Date().getFullYear()} Premium Flora. Всі права захищені.
          </p>
          <p className="!text-[10px] sm:!text-sm text-slate-500">
            Розробка сайту -{" "}
            <a
              href="https://webbie.team"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 transition-colors !text-[10px] sm:!text-sm"
            >
              Webbie.team
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}



