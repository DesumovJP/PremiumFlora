'use client';

import { useRef, useState, useEffect } from 'react';
import { Check, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const packages = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Для невеликих флористичних студій',
    moq: 'від 50 шт/міс',
    features: [
      'Базові оптові ціни',
      'Email підтримка',
      'Стандартна доставка',
      'Базовий асортимент',
    ],
    cta: 'Обрати',
    popular: false,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Для активних флористів та салонів',
    moq: 'від 500 шт/міс',
    discount: '-10%',
    features: [
      'Знижка 10% на всі замовлення',
      'Особистий менеджер',
      'Пріоритетна доставка',
      'Кредитна лінія 14 днів',
      'Розширений асортимент',
      'Безкоштовна консультація',
    ],
    cta: 'Обрати',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Для мереж та великих клієнтів',
    moq: 'від 2000 шт/міс',
    discount: '-20%',
    features: [
      'Знижка 20% на всі замовлення',
      'Виділений менеджер 24/7',
      'Безкоштовна доставка',
      'Кредитна лінія 30 днів',
      'Індивідуальні сорти під замовлення',
      'Пріоритетне бронювання на свята',
      'Квартальний звіт та аналітика',
    ],
    cta: "Зв'язатися",
    popular: false,
  },
];

const priceTable = [
  { range: '50-99', price: '45 ₴' },
  { range: '100-499', price: '42 ₴' },
  { range: '500-999', price: '38 ₴' },
  { range: '1000+', price: 'Індивідуально' },
];

export function PricingSection() {
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
    <section ref={ref} id="pricing" className="py-20 sm:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={cn(
            'text-center mb-16 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
            Тарифи
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
            Оптові пакети
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
            Оберіть пакет, який найкраще підходить для вашого бізнесу
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={cn(
                'relative bg-white rounded-2xl p-6 sm:p-8 border transition-all duration-500',
                pkg.popular
                  ? 'border-emerald-300 shadow-xl shadow-emerald-500/10 scale-105 z-10'
                  : 'border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-100',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{
                transitionDelay: isVisible ? `${200 + index * 100}ms` : '0ms',
              }}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-sm font-semibold shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    Популярний
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {pkg.name}
                </h3>
                <p className="text-sm text-slate-500">{pkg.description}</p>
              </div>

              {/* MOQ & Discount */}
              <div className="text-center mb-6 pb-6 border-b border-slate-100">
                <p className="text-2xl font-bold text-slate-900">{pkg.moq}</p>
                {pkg.discount && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
                    {pkg.discount} знижка
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={pkg.popular ? 'default' : 'outline'}
                size="lg"
                className="w-full gap-2"
              >
                {pkg.cta}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Price Table */}
        <div
          className={cn(
            'max-w-2xl mx-auto transition-all duration-700 delay-500',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <h3 className="text-lg font-semibold text-slate-900 text-center mb-6">
            Приклад цін: Троянда червона 50см
          </h3>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Кількість
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                    Ціна за шт
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {priceTable.map((row) => (
                  <tr key={row.range} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-700">{row.range} шт</td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                      {row.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 text-center mt-4">
            * Ціни актуальні на {new Date().toLocaleDateString('uk-UA')}.
            Для точного розрахунку зв'яжіться з менеджером.
          </p>
        </div>
      </div>
    </section>
  );
}
