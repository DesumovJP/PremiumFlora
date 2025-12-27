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
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Truck,
    title: "Швидка доставка",
    description: "Доставка рефрижератором по Києву та всій Україні",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: FileCheck,
    title: "Документація якості",
    description: "Всі партії з повною документацією та сертифікатами",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: UserCheck,
    title: "Персональний менеджер",
    description: "Індивідуальний підхід та підтримка для кожного клієнта",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Coins,
    title: "Гнучкі умови",
    description: "Мінімальне замовлення від 50 шт, індивідуальні ціни для постійних клієнтів",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: RefreshCw,
    title: "Гарантія заміни",
    description: "Заміна або повернення коштів без зайвих питань",
    color: "bg-emerald-50 text-emerald-600",
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
      <main className="min-h-screen pt-16 lg:pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-100 py-16 sm:py-20 lg:py-24">
          {/* Background with gradient mesh */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="h-full w-full bg-[url('/blog.jpg')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-white/90" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-blue-50/40" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Premium badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100/50 bg-emerald-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700 shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Ваш надійний партнер
              </div>

              <h1 className="mb-4 text-display-sm font-extrabold tracking-tight text-slate-900">
                Про <span className="text-emerald-600">Premium Flora</span>
              </h1>
              <p className="text-body-large text-slate-600">
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
                    className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 text-center transition-colors duration-200 hover:border-emerald-200 sm:p-8"
                    style={{
                      transitionDelay: missionVisible ? `${index * 100}ms` : "0ms",
                    }}
                  >
                    <div className="relative">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="mb-1 text-3xl font-bold text-slate-900 sm:text-4xl">
                        {stat.value}
                      </div>
                      <div className="text-sm font-medium text-slate-600">
                        {stat.label}
                      </div>
                    </div>
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
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <div
                    key={advantage.title}
                    className={cn(
                      "group relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-3 sm:p-6",
                      "transition-colors duration-200 hover:border-emerald-200",
                      advantagesVisible ? "opacity-100" : "opacity-0"
                    )}
                    style={{
                      transitionDelay: advantagesVisible ? `${index * 80}ms` : "0ms",
                      transform: advantagesVisible ? "translateY(0)" : "translateY(30px)",
                    }}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "relative mb-2 sm:mb-4 flex h-9 w-9 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl",
                        advantage.color
                      )}
                    >
                      <Icon className="h-4 w-4 sm:h-7 sm:w-7" />
                    </div>

                    {/* Content */}
                    <h3 className="relative mb-1 sm:mb-2 text-xs sm:text-lg font-semibold text-slate-900 leading-tight">
                      {advantage.title}
                    </h3>
                    <p className="relative text-[10px] sm:text-base leading-snug sm:leading-relaxed text-slate-600">
                      {advantage.description}
                    </p>
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

            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {[
                {
                  icon: Phone,
                  title: "Телефон",
                  content: (
                    <div className="space-y-0.5 sm:space-y-1">
                      <a href="tel:+380671234567" className="block text-[10px] sm:text-sm text-emerald-600 transition-colors hover:text-emerald-700">
                        +380 67 123 4567
                      </a>
                      <a href="tel:+380501234567" className="block text-[10px] sm:text-sm text-emerald-600 transition-colors hover:text-emerald-700">
                        +380 50 123 4567
                      </a>
                    </div>
                  ),
                },
                {
                  icon: Mail,
                  title: "Email",
                  content: (
                    <a href="mailto:info@premiumflora.ua" className="text-[10px] sm:text-sm text-emerald-600 transition-colors hover:text-emerald-700 break-all">
                      info@premiumflora.ua
                    </a>
                  ),
                },
                {
                  icon: MapPin,
                  title: "Адреса",
                  content: <p className="text-[10px] sm:text-sm text-slate-600">м. Київ, Україна</p>,
                },
                {
                  icon: Clock,
                  title: "Режим роботи",
                  content: (
                    <>
                      <p className="text-[10px] sm:text-sm text-slate-600">Пн-Пт: 9:00-18:00</p>
                      <p className="text-[10px] sm:text-sm text-slate-600">Сб: 10:00-16:00</p>
                    </>
                  ),
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-3 sm:p-6 text-center transition-colors duration-200 hover:border-emerald-200"
                  >
                    <div className="relative">
                      <div className="mx-auto mb-2 sm:mb-3 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600">
                        <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                      </div>
                      <h3 className="mb-1 sm:mb-2 text-xs sm:text-base font-semibold text-slate-900">{item.title}</h3>
                      {item.content}
                    </div>
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
