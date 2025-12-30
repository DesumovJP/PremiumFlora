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
        {/* Hero - Clean Minimal Design */}
        <section className="border-b border-slate-100 bg-slate-50/50 py-4 sm:py-5 lg:py-6">
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

        {/* Contacts Section - Minimal Horizontal */}
        <section id="contact" className="border-t border-slate-100 bg-slate-50/50 py-10 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 text-center">
              Контакти
            </h3>

            {/* Contact items - horizontal on desktop, 2 columns on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Phone */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 mb-3">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 mb-1">Телефон</p>
                <a href="tel:+380671234567" className="block text-sm text-slate-700 hover:text-emerald-600 transition-colors">
                  +380 67 123 4567
                </a>
                <a href="tel:+380501234567" className="block text-sm text-slate-700 hover:text-emerald-600 transition-colors">
                  +380 50 123 4567
                </a>
              </div>

              {/* Schedule */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 mb-3">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 mb-1">Графік</p>
                <p className="text-sm text-slate-700">Пн-Пт: 9:00-18:00</p>
                <p className="text-sm text-slate-700">Сб: 10:00-16:00</p>
              </div>

              {/* Email */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 mb-3">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <a href="mailto:info@premiumflora.ua" className="text-sm text-slate-700 hover:text-emerald-600 transition-colors break-all">
                  info@premiumflora.ua
                </a>
              </div>

              {/* Address */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 mb-3">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 mb-1">Адреса</p>
                <p className="text-sm text-slate-700">вул. Тираспольська, 41а</p>
                <p className="text-sm text-slate-700">м. Київ</p>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section - Clean with subtle styling */}
        <section className="py-10 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[280px] sm:h-[350px] lg:h-[400px] group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2541.0876854953307!2d30.74461!3d50.4419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4c5a1c4b5c5c5%3A0x0!2z0LLRg9C7LiDQotC40YDQsNGB0L_QvtC70YzRgdGM0LrQsCwgNDHQsA!5e0!3m2!1suk!2sua!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Premium Flora Location"
                className="opacity-95 group-hover:opacity-100 transition-opacity duration-300"
              />

              {/* Map Overlay Card */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 max-w-xs">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm">Premium Flora</h4>
                      <p className="text-slate-600 text-xs mt-0.5">вул. Тираспольська, 41а, Київ</p>
                    </div>
                  </div>
                  <a
                    href="https://maps.google.com/?q=вул.+Тираспольська,+41а,+Київ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Відкрити в Google Maps
                  </a>
                </div>
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
