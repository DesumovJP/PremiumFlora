"use client";

import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { GallerySection } from "@/components/client/gallery-section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock, Users, Award, Package, Calendar, Shield } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-100 py-12 sm:py-16">
          {/* Background image with soft overlay */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="h-full w-full bg-[url('/blog.jpg')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
                Про Premium Flora
              </h1>
              <p className="text-lg leading-relaxed text-slate-600 sm:text-xl">
                Ваш надійний партнер у світі оптової торгівлі квітами
              </p>
            </div>
          </div>
        </section>

        {/* About Content */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Наша історія
                  </h2>
                  <div className="space-y-4 text-base leading-relaxed text-slate-600">
                    <p>
                      Premium Flora — це оптовий магазин квітів, який спеціалізується на
                      постачанні свіжих квітів височної якості для квіткових салонів, магазинів та
                      бізнесу по всій Україні.
                    </p>
                    <p>
                      Ми працюємо з найкращими постачальниками та гарантуємо свіжість та якість
                      кожної квітки. Наша мета — допомогти вашому квітковому бізнесу процвітати,
                      надаючи конкурентні ціни та індивідуальний підхід до кожного клієнта.
                    </p>
                    <p>
                      За роки роботи ми заслужили довіру багатьох клієнтів по всій Україні та
                      продовжуємо розширювати наш асортимент та покращувати сервіс.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-none bg-emerald-50/50">
                    <CardContent className="p-4 text-center">
                      <Award className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                      <div className="text-2xl font-bold text-slate-900">10+</div>
                      <div className="text-sm text-slate-600">Років досвіду</div>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-emerald-50/50">
                    <CardContent className="p-4 text-center">
                      <Users className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                      <div className="text-2xl font-bold text-slate-900">500+</div>
                      <div className="text-sm text-slate-600">Задоволених клієнтів</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Наші переваги
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:gap-5">
                    {[
                      {
                        icon: Package,
                        title: "Широкий асортимент",
                        description:
                          "Більше 10 видів квітів з різними варіантами висоти та розмірів",
                        gradient: "from-blue-500 to-cyan-500",
                      },
                      {
                        icon: Calendar,
                        title: "Регулярні поставки",
                        description:
                          "Нова поставка свіжих квітів щоп'ятниці для забезпечення найкращої якості",
                        gradient: "from-emerald-500 to-teal-500",
                      },
                      {
                        icon: Shield,
                        title: "Гарантія якості",
                        description:
                          "Свіжі квіти височної якості з гарантією свіжості",
                        gradient: "from-purple-500 to-pink-500",
                      },
                      {
                        icon: Users,
                        title: "Індивідуальний підхід",
                        description:
                          "Персональний менеджер та індивідуальні умови для кожного клієнта",
                        gradient: "from-orange-500 to-amber-500",
                      },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                      <Card 
                        key={index} 
                        className="group flex h-full border border-slate-200 bg-white/90 transition-all duration-300 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10"
                      >
                          <CardContent className="flex items-start gap-4 p-4 sm:p-5">
                            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="benefit-heading mb-1 sm:mb-1.5 text-slate-900">
                                {item.title}
                              </h3>
                              <p className="benefit-text text-slate-600">
                                {item.description}
                              </p>
                            </div>
                        </CardContent>
                      </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <GallerySection
          images={[
            "https://images.unsplash.com/photo-1462275646964-a0e85b72680a?w=1200&q=80",
            "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80",
            "https://images.unsplash.com/photo-1519376918334-c52cd69e55db?w=1200&q=80",
            "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=1200&q=80",
            "https://images.unsplash.com/photo-1508610048659-a06c66986c63?w=1200&q=80",
            "https://images.unsplash.com/photo-1519376918334-c52cd69e55db?w=1200&q=80",
            "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=1200&q=80",
            "https://images.unsplash.com/photo-1508610048659-a06c66986c63?w=1200&q=80",
          ]}
        />

        {/* Contact Info */}
        <section className="bg-slate-50/50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                Контактна інформація
              </h2>
              <p className="text-lg text-slate-600">
                Зв'яжіться з нами зручним для вас способом
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none bg-white/80 text-center">
                <CardContent className="p-6">
                  <Phone className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
                  <h3 className="mb-2 font-semibold text-slate-900">Телефон</h3>
                  <div className="space-y-1">
                    <a
                      href="tel:+380671234567"
                      className="block text-sm text-emerald-600 transition-colors hover:text-emerald-700"
                    >
                      +380 67 123 4567
                    </a>
                    <a
                      href="tel:+380501234567"
                      className="block text-sm text-emerald-600 transition-colors hover:text-emerald-700"
                    >
                      +380 50 123 4567
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-white/80 text-center">
                <CardContent className="p-6">
                  <Mail className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
                  <h3 className="mb-2 font-semibold text-slate-900">Email</h3>
                  <a
                    href="mailto:info@premiumflora.ua"
                    className="text-sm text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    info@premiumflora.ua
                  </a>
                </CardContent>
              </Card>

              <Card className="border-none bg-white/80 text-center">
                <CardContent className="p-6">
                  <MapPin className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
                  <h3 className="mb-2 font-semibold text-slate-900">Адреса</h3>
                  <p className="text-sm text-slate-600">м. Київ, Україна</p>
                </CardContent>
              </Card>

              <Card className="border-none bg-white/80 text-center">
                <CardContent className="p-6">
                  <Clock className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
                  <h3 className="mb-2 font-semibold text-slate-900">Режим роботи</h3>
                  <p className="text-sm text-slate-600">Пн-Пт: 9:00-18:00</p>
                  <p className="text-sm text-slate-600">Сб: 10:00-16:00</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}



