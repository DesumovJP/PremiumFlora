'use client';

import { useRef, useState, useEffect } from 'react';
import { MapPin, Clock, Snowflake, Package, Truck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const zones = [
  {
    name: 'Центр Києва',
    time: '2-4 години',
    color: 'bg-emerald-500',
    icon: '🟢',
  },
  {
    name: 'Київ (всі райони)',
    time: '4-6 годин',
    color: 'bg-emerald-400',
    icon: '🟢',
  },
];

const schedule = [
  { day: 'ПН', active: true },
  { day: 'ВТ', active: true },
  { day: 'СР', active: true },
  { day: 'ЧТ', active: true },
  { day: 'ПТ', active: true },
  { day: 'СБ', active: false },
  { day: 'НД', active: false },
];

const features = [
  {
    icon: Snowflake,
    title: 'Свіжість гарантована',
    description: 'Квіти зберігаються при -20°C від плантації до вашого складу',
  },
  {
    icon: Package,
    title: 'Спеціальна упаковка',
    description: 'Термобокси з гельовими акумуляторами для збереження свіжості',
  },
  {
    icon: Truck,
    title: 'Власний автопарк',
    description: 'Рефрижераторні автомобілі з GPS-трекінгом',
  },
  {
    icon: Clock,
    title: 'Гнучкий графік',
    description: 'Доставка в зручний для вас час з попереднім узгодженням',
  },
];

export function LogisticsSection() {
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
    <section ref={ref} id="delivery" className="py-20 sm:py-28 bg-slate-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={cn(
            'text-center mb-16 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
            Логістика
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
            Доставка по Києву
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
            Власний рефрижераторний автопарк та холодний ланцюг гарантують свіжість квітів
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Map placeholder + Zones */}
          <div
            className={cn(
              'transition-all duration-700 delay-200',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            {/* Map placeholder */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl border border-slate-200 overflow-hidden mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                  <p className="text-slate-500">Інтерактивна карта зон доставки</p>
                  <p className="text-sm text-slate-400 mt-1">Буде додано найближчим часом</p>
                </div>
              </div>

              {/* Zone indicators */}
              <div className="absolute top-4 left-4 space-y-2">
                {zones.map((zone) => (
                  <div
                    key={zone.name}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm"
                  >
                    <span>{zone.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{zone.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Zones List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Зони доставки
              </h3>
              <div className="space-y-3">
                {zones.map((zone) => (
                  <div
                    key={zone.name}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('w-3 h-3 rounded-full', zone.color)} />
                      <span className="font-medium text-slate-700">{zone.name}</span>
                    </div>
                    <span className="text-emerald-600 font-semibold">{zone.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Features + Schedule */}
          <div
            className={cn(
              'space-y-6 transition-all duration-700 delay-300',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-emerald-100 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Графік поставок</h3>
              <div className="flex justify-between mb-4">
                {schedule.map((day) => (
                  <div key={day.day} className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">{day.day}</span>
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        day.active
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      {day.active ? <Check className="w-5 h-5" /> : '—'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Доставка</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">—</span>
                  <span>Замовлення до ПТ 15:00</span>
                </div>
              </div>
            </div>

            {/* Cold Chain Info */}
            <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-2xl border border-cyan-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                  <Snowflake className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Холодний ланцюг гарантовано
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Температура -20°C підтримується від моменту зрізу на плантації до
                    моменту передачі вам. Всі автомобілі обладнані GPS-моніторингом
                    температури. Ви отримуєте звіт з графіком температури для кожної партії.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
