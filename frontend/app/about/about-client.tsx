"use client";

import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { GallerySection } from "@/components/client/gallery-section";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

interface AboutClientProps {
  galleryImages: string[];
}

export function AboutClient({ galleryImages }: AboutClientProps) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16 lg:pt-20">
        {/* Hero - White */}
        <section className="bg-white py-4 sm:py-5 lg:py-6 border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Про <span className="text-emerald-600">Premium Flora</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-lg">
              Оптовий постачальник свіжих квітів преміальної якості
            </p>
          </div>
        </section>

        {/* Mission Section - Clean & Focused */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              Допомагаємо вашому бізнесу <span className="text-emerald-600">процвітати</span>
            </h2>

            <p className="mt-6 text-base lg:text-lg leading-relaxed text-slate-600">
              Premium Flora — це більше, ніж постачальник квітів. Ми ваш стратегічний партнер,
              який забезпечує найкращу якість, конкурентні ціни та індивідуальний підхід.
              За роки роботи ми заслужили довіру сотень клієнтів по всій Україні.
            </p>
          </div>
        </section>

        {/* Contacts Section */}
        <section
          id="contact"
          className="bg-white py-10 sm:py-14 lg:py-16"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-8 text-center">
              Контакти
            </h3>

            {/* Contact cards - modern style */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Phone Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center border border-slate-100 group">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 bg-emerald-50 mx-auto group-hover:bg-emerald-100 transition-colors">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h4 className="text-[12px] sm:text-sm font-semibold text-slate-800 mb-1.5">Телефон</h4>
                <div className="space-y-0.5 text-[12px] sm:text-sm text-slate-500">
                  <a href="tel:+380671234567" className="block hover:text-emerald-600 transition-colors">
                    +380 67 123 4567
                  </a>
                  <a href="tel:+380501234567" className="block hover:text-emerald-600 transition-colors">
                    +380 50 123 4567
                  </a>
                </div>
              </div>

              {/* Schedule Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center border border-slate-100 group">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 bg-amber-50 mx-auto group-hover:bg-amber-100 transition-colors">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" strokeWidth={1.5} />
                </div>
                <h4 className="text-[12px] sm:text-sm font-semibold text-slate-800 mb-1.5">Графік</h4>
                <div className="space-y-0.5 text-slate-500">
                  <p className="text-[12px] sm:text-sm">Пн-Пт: 9:00-18:00</p>
                  <p className="text-[12px] sm:text-sm">Сб: 10:00-16:00</p>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center border border-slate-100 group">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 bg-sky-50 mx-auto group-hover:bg-sky-100 transition-colors">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" strokeWidth={1.5} />
                </div>
                <h4 className="text-[12px] sm:text-sm font-semibold text-slate-800 mb-1.5">Email</h4>
                <div className="text-[12px] sm:text-sm text-slate-500">
                  <a href="mailto:info@premiumflora.ua" className="hover:text-sky-600 transition-colors break-all">
                    info@premiumflora.ua
                  </a>
                </div>
              </div>

              {/* Address Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center border border-slate-100 group">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 bg-rose-50 mx-auto group-hover:bg-rose-100 transition-colors">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" strokeWidth={1.5} />
                </div>
                <h4 className="text-[12px] sm:text-sm font-semibold text-slate-800 mb-1.5">Адреса</h4>
                <div className="text-slate-500 leading-relaxed">
                  <p className="text-[12px] sm:text-sm">вул. Тираспольська, 41а</p>
                  <p className="text-[12px] sm:text-sm">м. Київ</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section - Minimal */}
        <section className="py-10 sm:py-12 lg:py-16 bg-slate-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 h-[280px] sm:h-[350px] lg:h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2541.0876854953307!2d30.74461!3d50.4419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4c5a1c4b5c5c5%3A0x0!2z0LLRg9C7LiDQotC40YDQsNGB0L_QvtC70YzRgdGM0LrQsCwgNDHQsA!5e0!3m2!1suk!2sua!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Premium Flora Location"
              />

              {/* Minimal overlay */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                <a
                  href="https://maps.google.com/?q=вул.+Тираспольська,+41а,+Київ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm text-slate-700 text-xs sm:text-sm rounded-lg border border-slate-100 shadow-sm hover:bg-white transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>вул. Тираспольська, 41а</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <GallerySection images={galleryImages} />
      </main>
      <Footer />
    </>
  );
}
