"use client";

import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { GallerySection } from "@/components/client/gallery-section";
import { FeatureCard } from "@/components/ui/feature-card";
import { StatCard } from "@/components/ui/stat-card";
import {
  Phone, Mail, MapPin, Clock,
  Award, Users, TrendingUp, Calendar
} from "lucide-react";

// Stats data - unified emerald palette
const stats = [
  {
    value: "10+",
    label: "Років досвіду",
    icon: Award,
  },
  {
    value: "500+",
    label: "Задоволених клієнтів",
    icon: Users,
  },
  {
    value: "50+",
    label: "Видів квітів",
    icon: TrendingUp,
  },
  {
    value: "52",
    label: "Поставки на рік",
    icon: Calendar,
  },
];

interface AboutClientProps {
  galleryImages: string[];
}

export function AboutClient({ galleryImages }: AboutClientProps) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16 lg:pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10">
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 -z-10">
            <div className="h-full w-full bg-[url('https://mymediastorage.fra1.digitaloceanspaces.com/premiumFlora/2147760920_14fa35030d.jpg')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/60" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-slate-900 mb-2 sm:mb-3">
                Про{' '}
                <span className="relative inline-block">
                  <span className="text-emerald-600">Premium Flora</span>
                  <svg className="absolute -bottom-1 left-0 w-full h-2 text-emerald-300/50" viewBox="0 0 200 8" preserveAspectRatio="none">
                    <path d="M0 6c40-3 80-3 120-1.5s80 3 80 0" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
                Оптовий постачальник свіжих квітів преміальної якості для вашого квіткового бізнесу
              </p>
            </div>
          </div>
        </section>

        {/* Mission + Stats + Contacts Section */}
        <section id="contact" className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Mobile: Stats -> Mission -> Contacts -> Map */}
            {/* Desktop: Mission -> Stats|Contacts -> Map */}

            {/* Mission - Desktop only at top */}
            <div className="hidden lg:block mb-14 max-w-3xl text-center mx-auto">
              <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
                Допомагаємо вашому бізнесу <span className="text-emerald-600">процвітати</span>
              </h2>

              <p className="text-base lg:text-lg leading-relaxed text-slate-600">
                Premium Flora — це більше, ніж постачальник квітів. Ми ваш стратегічний партнер,
                який забезпечує найкращу якість, конкурентні ціни та індивідуальний підхід.
                За роки роботи ми заслужили довіру сотень клієнтів по всій Україні.
              </p>
            </div>

            {/* Stats - Mobile only (FIRST on mobile) */}
            <div className="mb-8 lg:hidden">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Наші досягнення</h3>
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                {stats.map((stat, index) => (
                  <StatCard key={stat.label} {...stat} index={index} />
                ))}
              </div>
            </div>

            {/* Mission - Mobile only (SECOND on mobile, after Stats) */}
            <div className="mb-8 lg:hidden max-w-3xl text-center mx-auto">
              <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
                Допомагаємо вашому бізнесу <span className="text-emerald-600">процвітати</span>
              </h2>

              <p className="text-base lg:text-lg leading-relaxed text-slate-600">
                Premium Flora — це більше, ніж постачальник квітів. Ми ваш стратегічний партнер,
                який забезпечує найкращу якість, конкурентні ціни та індивідуальний підхід.
                За роки роботи ми заслужили довіру сотень клієнтів по всій Україні.
              </p>
            </div>

            {/* Contacts - Mobile only (after Mission) */}
            <div className="mb-8 lg:hidden">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Контакти</h3>
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                <FeatureCard icon={Phone} title="Телефон" index={0} centered>
                  <div className="space-y-0.5">
                    <a href="tel:+380671234567" className="block text-emerald-600 transition-colors hover:text-emerald-700">
                      +380 67 123 4567
                    </a>
                    <a href="tel:+380501234567" className="block text-emerald-600 transition-colors hover:text-emerald-700">
                      +380 50 123 4567
                    </a>
                  </div>
                </FeatureCard>

                <FeatureCard icon={Clock} title="Графік" index={1} centered>
                  <span className="block">Пн-Пт: 9:00-18:00</span>
                  <span className="block">Сб: 10:00-16:00</span>
                </FeatureCard>

                <FeatureCard icon={Mail} title="Email" index={2} centered>
                  <a href="mailto:info@premiumflora.ua" className="text-emerald-600 transition-colors hover:text-emerald-700 break-all">
                    info@premiumflora.ua
                  </a>
                </FeatureCard>

                <FeatureCard icon={MapPin} title="Адреса" index={3} centered>
                  <span className="block">вул. Тираспольська, 41а</span>
                  <span className="block">м. Київ</span>
                </FeatureCard>
              </div>
            </div>

            {/* Stats + Contacts - Two Column Grid (desktop only) */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-8 lg:gap-12 mb-10 lg:mb-14 items-stretch">
              {/* Left Column - Stats */}
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Наші досягнення</h3>
                <div className="grid grid-cols-2 gap-4 sm:gap-5 flex-1 auto-rows-fr">
                  {stats.map((stat, index) => (
                    <StatCard key={stat.label} {...stat} index={index} />
                  ))}
                </div>
              </div>

              {/* Right Column - Contacts */}
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Контакти</h3>
                <div className="grid grid-cols-2 gap-4 sm:gap-5 flex-1 auto-rows-fr">
                  <FeatureCard icon={Phone} title="Телефон" index={0} centered>
                    <div className="space-y-0.5">
                      <a href="tel:+380671234567" className="block text-emerald-600 transition-colors hover:text-emerald-700">
                        +380 67 123 4567
                      </a>
                      <a href="tel:+380501234567" className="block text-emerald-600 transition-colors hover:text-emerald-700">
                        +380 50 123 4567
                      </a>
                    </div>
                  </FeatureCard>

                  <FeatureCard icon={Clock} title="Графік" index={1} centered>
                    <span className="block">Пн-Пт: 9:00-18:00</span>
                    <span className="block">Сб: 10:00-16:00</span>
                  </FeatureCard>

                  <FeatureCard icon={Mail} title="Email" index={2} centered>
                    <a href="mailto:info@premiumflora.ua" className="text-emerald-600 transition-colors hover:text-emerald-700 break-all">
                      info@premiumflora.ua
                    </a>
                  </FeatureCard>

                  <FeatureCard icon={MapPin} title="Адреса" index={3} centered>
                    <span className="block">вул. Тираспольська, 41а</span>
                    <span className="block">м. Київ</span>
                  </FeatureCard>
                </div>
              </div>
            </div>

            {/* Map - Full Width */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[280px] sm:h-[350px] lg:h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2541.0876854953307!2d30.74461!3d50.4419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4c5a1c4b5c5c5%3A0x0!2z0LLRg9C7LiDQotC40YDQsNGB0L_QvtC70YzRgdGM0LrQsCwgNDHQsA!5e0!3m2!1suk!2sua!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Premium Flora Location"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
              {/* Map Overlay with Address */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium">вул. Тираспольська, 41а, Київ</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section - using real product images */}
        <GallerySection images={galleryImages} />
      </main>
      <Footer />
    </>
  );
}
