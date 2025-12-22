'use client';

import { useRef, useEffect, useState } from 'react';
import {
  Snowflake,
  Truck,
  FileCheck,
  UserCheck,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WaveDivider } from '@/components/ui/decorations';

const values = [
  {
    icon: Snowflake,
    title: 'Свіжість гарантована',
    description: 'Квіти зберігаються при -20°C від плантації до вашого складу',
    color: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100',
    gradient: 'from-cyan-500/10 to-cyan-600/5',
  },
  {
    icon: Truck,
    title: 'Доставка 24/48h',
    description: 'Швидка доставка рефрижератором по Києву та Україні',
    color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    gradient: 'from-emerald-500/10 to-emerald-600/5',
  },
  {
    icon: FileCheck,
    title: 'ISO Сертифікат',
    description: 'Всі партії з повною документацією якості',
    color: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
    gradient: 'from-violet-500/10 to-violet-600/5',
  },
  {
    icon: UserCheck,
    title: 'Менеджер 24/7',
    description: 'Персональний менеджер для кожного клієнта',
    color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
    gradient: 'from-amber-500/10 to-amber-600/5',
  },
  {
    icon: Coins,
    title: 'Від 50 шт у замовленні',
    description: 'Гнучкі умови для різних обсягів замовлень',
    color: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
    gradient: 'from-rose-500/10 to-rose-600/5',
  },
  {
    icon: RefreshCw,
    title: 'Гарантія заміни',
    description: 'Заміна або повернення коштів без питань',
    color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    gradient: 'from-blue-500/10 to-blue-600/5',
  },
];

export function ValueStackingSection() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background with gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white to-emerald-50/30" />

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-emerald-200/30 via-emerald-100/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-radial from-cyan-200/25 via-cyan-100/10 to-transparent rounded-full blur-3xl translate-x-1/2 pointer-events-none animate-float-slow" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-radial from-violet-200/20 via-violet-100/10 to-transparent rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      {/* Subtle noise texture */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Wave divider at bottom */}
      <WaveDivider position="bottom" variant="layered" color="white" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={cn(
            'text-center mb-16',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4 border border-emerald-100/50 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Наші переваги
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Чому обирають <span className="text-emerald-600">Premium Flora</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ми поєднуємо європейську якість з українським сервісом
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {values.map((value, index) => (
            <div
              key={value.title}
              className={cn(
                'group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100/80',
                'hover:shadow-lg hover:border-emerald-200/60 hover:bg-white',
                'transition-all duration-300 ease-out',
                isVisible ? 'opacity-100' : 'opacity-0'
              )}
              style={{
                transitionDelay: isVisible ? `${index * 80}ms` : '0ms',
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              }}
            >
              {/* Hover gradient background */}
              <div
                className={cn(
                  'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                  value.gradient
                )}
              />

              {/* Icon */}
              <div
                className={cn(
                  'relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300',
                  'group-hover:scale-110 group-hover:shadow-md',
                  value.color
                )}
              >
                <value.icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              {/* Content */}
              <h3 className="relative text-base sm:text-lg font-semibold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {value.title}
              </h3>
              <p className="relative text-sm sm:text-base text-slate-600 leading-relaxed">
                {value.description}
              </p>

              {/* Corner decoration on hover */}
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-100 scale-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
