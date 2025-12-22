"use client";

import { Package, Truck, Shield, Users, Calendar, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useIntersection } from "@/hooks/use-intersection";
import { useEffect } from "react";

const benefits = [
  {
    icon: Package,
    title: "Широкий асортимент",
    description: "Більше 10 видів квітів з різними варіантами висоти та розмірів",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Calendar,
    title: "Регулярні поставки",
    description: "Нова поставка свіжих квітів щоп'ятниці для забезпечення найкращої якості",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    title: "Гарантія якості",
    description: "Свіжі квіти височної якості з гарантією свіжості",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Індивідуальний підхід",
    description: "Персональний менеджер та індивідуальні умови для кожного клієнта",
    gradient: "from-orange-500 to-amber-500",
  },
];

export function BenefitsSection() {
  const { ref, isVisible } = useIntersection({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (ref.current && isVisible) {
      ref.current.classList.add("visible");
    }
  }, [isVisible, ref]);

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      className="relative bg-white dark:bg-admin-surface section-padding-sm fade-in-up-animate"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 sm:mb-16 text-center fade-in-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span>Переваги</span>
          </div>
          <h2 className="mb-4 text-display-sm font-extrabold tracking-tight text-slate-900 dark:text-admin-text-primary">
            Чому обирають нас
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-body-large text-slate-600 dark:text-admin-text-secondary">
            Ми працюємо для успіху вашого квіткового бізнесу
          </p>
        </div>

        {/* Benefits Grid - Premium Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={index} 
                className="group relative flex h-full w-full flex-col overflow-hidden card-premium hover-lift-3d fade-in-up"
              >
                {/* Gradient accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 transition-premium group-hover:opacity-5`} />
                
                <CardContent className="relative flex flex-1 flex-col items-center p-3 text-center sm:p-6 gpu-accelerated">
                  {/* Icon with gradient background - Premium */}
                  <div className={`mb-2 sm:mb-4 inline-flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${benefit.gradient} text-white shadow-colored-emerald transition-premium hover-scale-3d`}>
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="benefit-heading mb-1 sm:mb-1.5 text-slate-900 dark:text-admin-text-primary">
                    {benefit.title}
                  </h3>
                  <p className="benefit-text text-slate-600 dark:text-admin-text-secondary">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}


