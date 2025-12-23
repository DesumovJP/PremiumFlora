"use client";

import { useRef, useEffect, useState } from "react";
import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { GallerySection } from "@/components/client/gallery-section";
import {
  Phone, Mail, MapPin, Clock,
  Snowflake, Truck, FileCheck, UserCheck, Coins, RefreshCw,
  Award, Users, TrendingUp, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

// Stats data
const stats = [
  { value: "10+", label: "Років досвіду", icon: Award },
  { value: "500+", label: "Задоволених клієнтів", icon: Users },
  { value: "50+", label: "Видів квітів", icon: TrendingUp },
  { value: "52", label: "Поставки на рік", icon: Calendar },
];

// Advantages data (unified emerald palette)
const advantages = [
  {
    icon: Snowflake,
    title: "Свіжість гарантована",
    description: "Квіти зберігаються при оптимальній температурі від плантації до вашого складу",
    color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    gradient: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    icon: Truck,
    title: "Швидка доставка",
    description: "Доставка рефрижератором по Києву та всій Україні",
    color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    gradient: "from-emerald-500/10 to-teal-600/5",
  },
  {
    icon: FileCheck,
    title: "Документація якості",
    description: "Всі партії з повною документацією та сертифікатами",
    color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    gradient: "from-teal-500/10 to-emerald-600/5",
  },
  {
    icon: UserCheck,
    title: "Персональний менеджер",
    description: "Індивідуальний підхід та підтримка для кожного клієнта",
    color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    gradient: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    icon: Coins,
    title: "Гнучкі умови",
    description: "Мінімальне замовлення від 50 шт, індивідуальні ціни для постійних клієнтів",
    color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    gradient: "from-teal-500/10 to-emerald-600/5",
  },
  {
    icon: RefreshCw,
    title: "Гарантія заміни",
    description: "Заміна або повернення коштів без зайвих питань",
    color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    gradient: "from-emerald-500/10 to-teal-600/5",
  },
];

// Gallery images (32 images for Pinterest-style gallery)
const galleryImages = [
  "https://images.unsplash.com/photo-1462275646964-a0e85b72680a?w=800&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
  "https://images.unsplash.com/photo-1519376918334-c52cd69e55db?w=800&q=80",
  "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80",
  "https://images.unsplash.com/photo-1508610048659-a06c66986c63?w=800&q=80",
  "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
  "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80",
  "https://images.unsplash.com/photo-1518882605630-8eb-a0e3e0f3?w=800&q=80",
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80",
  "https://images.unsplash.com/photo-1467043153537-a4fba2cd39ef?w=800&q=80",
  "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=800&q=80",
  "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&q=80",
  "https://images.unsplash.com/photo-1469259943454-aa100abba749?w=800&q=80",
  "https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?w=800&q=80",
  "https://images.unsplash.com/photo-1495231916356-a86217efff12?w=800&q=80",
  "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80",
  "https://images.unsplash.com/photo-1518882605630-be8a14f47b8c?w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=800&q=80",
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80",
  "https://images.unsplash.com/photo-1496661415325-ef852f9e8e7c?w=800&q=80",
  "https://images.unsplash.com/photo-1510217145035-7b6e5e2f4656?w=800&q=80",
  "https://images.unsplash.com/photo-1478217828116-5e8f0c999ac9?w=800&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
  "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800&q=80",
  "https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?w=800&q=80",
  "https://images.unsplash.com/photo-1462275646964-a0e85b72680a?w=800&q=80",
  "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80",
  "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80",
  "https://images.unsplash.com/photo-1467043153537-a4fba2cd39ef?w=800&q=80",
  "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=800&q=80",
];

export default function AboutPage() {
  const missionRef = useRef<HTMLElement>(null);
  const advantagesRef = useRef<HTMLElement>(null);
  const [missionVisible, setMissionVisible] = useState(false);
  const [advantagesVisible, setAdvantagesVisible] = useState(false);

  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: "-50px" };

    const missionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMissionVisible(true);
        missionObserver.disconnect();
      }
    }, observerOptions);

    const advantagesObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setAdvantagesVisible(true);
        advantagesObserver.disconnect();
      }
    }, observerOptions);

    if (missionRef.current) missionObserver.observe(missionRef.current);
    if (advantagesRef.current) advantagesObserver.observe(advantagesRef.current);

    return () => {
      missionObserver.disconnect();
      advantagesObserver.disconnect();
    };
  }, []);

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-100 py-16 sm:py-20 lg:py-24">
          {/* Background with gradient mesh */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="h-full w-full bg-[url('/blog.jpg')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-white/85 backdrop-blur-md" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-blue-50/40" />
          </div>

          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-gradient-radial from-emerald-200/30 via-emerald-100/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-gradient-radial from-teal-200/25 via-teal-100/10 to-transparent blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Premium badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100/50 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Ваш надійний партнер
              </div>

              <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Про <span className="text-emerald-600">Premium Flora</span>
              </h1>
              <p className="text-lg leading-relaxed text-slate-600 sm:text-xl">
                Оптовий постачальник свіжих квітів преміальної якості для вашого квіткового бізнесу
              </p>
            </div>
          </div>
        </section>

        {/* Mission + Stats Section */}
        <section
          ref={missionRef}
          className="relative overflow-hidden py-16 sm:py-20 lg:py-24"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white" />

          {/* Decorative orbs */}
          <div className="pointer-events-none absolute left-0 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-emerald-200/20 via-emerald-100/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 translate-x-1/3 rounded-full bg-gradient-radial from-teal-200/20 via-teal-100/10 to-transparent blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className={cn(
                "mx-auto max-w-3xl text-center",
                missionVisible ? "opacity-100" : "opacity-0"
              )}
              style={{
                transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: missionVisible ? "translateY(0)" : "translateY(20px)",
              }}
            >
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100/50 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Наша місія
              </span>

              <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Допомагаємо вашому бізнесу <span className="text-emerald-600">процвітати</span>
              </h2>

              <p className="text-lg leading-relaxed text-slate-600">
                Premium Flora — це більше, ніж постачальник квітів. Ми ваш стратегічний партнер,
                який забезпечує найкращу якість, конкурентні ціни та індивідуальний підхід.
                За роки роботи ми заслужили довіру сотень клієнтів по всій Україні.
              </p>
            </div>

            {/* Stats Grid */}
            <div
              className={cn(
                "mt-12 grid grid-cols-2 gap-4 sm:mt-16 lg:grid-cols-4 lg:gap-6",
                missionVisible ? "opacity-100" : "opacity-0"
              )}
              style={{
                transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
                transform: missionVisible ? "translateY(0)" : "translateY(30px)",
              }}
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="group relative overflow-hidden rounded-2xl border border-slate-100/80 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-emerald-200/60 hover:bg-white hover:shadow-lg sm:p-8"
                    style={{
                      transitionDelay: missionVisible ? `${index * 100}ms` : "0ms",
                    }}
                  >
                    {/* Hover gradient */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-100 group-hover:shadow-md">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="mb-1 text-3xl font-bold text-slate-900 sm:text-4xl">
                        {stat.value}
                      </div>
                      <div className="text-sm font-medium text-slate-600">
                        {stat.label}
                      </div>
                    </div>

                    {/* Corner decoration */}
                    <div className="absolute right-3 top-3 h-2 w-2 scale-0 rounded-full bg-emerald-400 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Advantages Section (value-stacking style) */}
        <section
          ref={advantagesRef}
          className="relative overflow-hidden py-16 sm:py-20 lg:py-24"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white to-emerald-50/30" />

          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -left-48 top-0 h-96 w-96 rounded-full bg-gradient-radial from-emerald-200/30 via-emerald-100/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 translate-x-1/2 rounded-full bg-gradient-radial from-teal-200/25 via-teal-100/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 translate-y-1/2 rounded-full bg-gradient-radial from-emerald-200/20 via-emerald-100/10 to-transparent blur-3xl" />

          {/* Subtle noise texture */}
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")", opacity: 0.03 }} />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div
              className={cn(
                "mb-12 text-center sm:mb-16",
                advantagesVisible ? "opacity-100" : "opacity-0"
              )}
              style={{
                transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: advantagesVisible ? "translateY(0)" : "translateY(20px)",
              }}
            >
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100/50 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Наші переваги
              </span>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Чому обирають <span className="text-emerald-600">Premium Flora</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Ми поєднуємо європейську якість з українським сервісом
              </p>
            </div>

            {/* Advantages Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <div
                    key={advantage.title}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border border-slate-100/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6",
                      "transition-all duration-300 ease-out hover:border-emerald-200/60 hover:bg-white hover:shadow-lg",
                      advantagesVisible ? "opacity-100" : "opacity-0"
                    )}
                    style={{
                      transitionDelay: advantagesVisible ? `${index * 80}ms` : "0ms",
                      transform: advantagesVisible ? "translateY(0)" : "translateY(30px)",
                    }}
                  >
                    {/* Hover gradient background */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                        advantage.gradient
                      )}
                    />

                    {/* Icon */}
                    <div
                      className={cn(
                        "relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 sm:h-14 sm:w-14",
                        "group-hover:scale-110 group-hover:shadow-md",
                        advantage.color
                      )}
                    >
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>

                    {/* Content */}
                    <h3 className="relative mb-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-emerald-700 sm:text-lg">
                      {advantage.title}
                    </h3>
                    <p className="relative text-sm leading-relaxed text-slate-600 sm:text-base">
                      {advantage.description}
                    </p>

                    {/* Corner decoration */}
                    <div className="absolute right-3 top-3 h-2 w-2 scale-0 rounded-full bg-emerald-400 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <GallerySection images={galleryImages} />

        {/* Contact Info */}
        <section id="contact" className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/30 via-slate-50/50 to-white" />

          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-gradient-radial from-emerald-200/20 via-emerald-100/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-gradient-radial from-teal-200/20 via-teal-100/10 to-transparent blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100/50 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Контакти
              </span>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Зв'яжіться з нами
              </h2>
              <p className="text-lg text-slate-600">
                Оберіть зручний для вас спосіб зв'язку
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {[
                {
                  icon: Phone,
                  title: "Телефон",
                  content: (
                    <div className="space-y-1">
                      <a href="tel:+380671234567" className="block text-sm text-emerald-600 transition-colors hover:text-emerald-700">
                        +380 67 123 4567
                      </a>
                      <a href="tel:+380501234567" className="block text-sm text-emerald-600 transition-colors hover:text-emerald-700">
                        +380 50 123 4567
                      </a>
                    </div>
                  ),
                },
                {
                  icon: Mail,
                  title: "Email",
                  content: (
                    <a href="mailto:info@premiumflora.ua" className="text-sm text-emerald-600 transition-colors hover:text-emerald-700">
                      info@premiumflora.ua
                    </a>
                  ),
                },
                {
                  icon: MapPin,
                  title: "Адреса",
                  content: <p className="text-sm text-slate-600">м. Київ, Україна</p>,
                },
                {
                  icon: Clock,
                  title: "Режим роботи",
                  content: (
                    <>
                      <p className="text-sm text-slate-600">Пн-Пт: 9:00-18:00</p>
                      <p className="text-sm text-slate-600">Сб: 10:00-16:00</p>
                    </>
                  ),
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-2xl border border-slate-100/80 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-emerald-200/60 hover:bg-white hover:shadow-lg"
                  >
                    {/* Hover gradient */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-100 group-hover:shadow-md">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                      {item.content}
                    </div>

                    {/* Corner decoration */}
                    <div className="absolute right-3 top-3 h-2 w-2 scale-0 rounded-full bg-emerald-400 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
