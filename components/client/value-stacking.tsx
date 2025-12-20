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

const values = [
  {
    icon: Snowflake,
    title: 'Холодний ланцюг -20°C',
    description: 'Температурний контроль від плантації до вашого складу',
    color: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100',
  },
  {
    icon: Truck,
    title: 'Доставка 24/48h',
    description: 'Швидка доставка рефрижератором по Києву та Україні',
    color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
  },
  {
    icon: FileCheck,
    title: 'ISO Сертифікат',
    description: 'Всі партії з повною документацією якості',
    color: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
  },
  {
    icon: UserCheck,
    title: 'Менеджер 24/7',
    description: 'Персональний менеджер для кожного клієнта',
    color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
  },
  {
    icon: Coins,
    title: 'Від 50 шт у замовленні',
    description: 'Гнучкі умови для різних обсягів замовлень',
    color: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
  },
  {
    icon: RefreshCw,
    title: 'Гарантія заміни',
    description: 'Заміна або повернення коштів без питань',
    color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
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
    <section ref={ref} className="py-20 sm:py-28 bg-slate-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={cn(
            'text-center mb-16',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
          style={{ transition: 'opacity 0.5s ease-out' }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
            Наші переваги
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Чому обирають Premium Flora
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
                'group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100',
                'hover:shadow-md hover:border-emerald-100',
                isVisible ? 'opacity-100' : 'opacity-0'
              )}
              style={{
                transition: 'opacity 0.4s ease-out, box-shadow 0.2s ease, border-color 0.2s ease',
                transitionDelay: isVisible ? `${index * 80}ms` : '0ms',
              }}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
                  value.color
                )}
              >
                <value.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {value.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {value.description}
              </p>

              {/* Hover border accent */}
              <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
