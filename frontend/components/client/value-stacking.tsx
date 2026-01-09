'use client';

import { useRef } from 'react';
import {
  Snowflake,
  Truck,
  FileCheck,
  UserCheck,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { FeatureCard } from '@/components/ui/feature-card';

const values = [
  {
    icon: Snowflake,
    title: 'Свіжість гарантована',
    description: 'Квіти зберігаються при оптимальній температурі від плантації до вашого складу',
    accentColor: 'sky' as const,
  },
  {
    icon: Truck,
    title: 'Доставка 24/48h',
    description: 'Швидка доставка рефрижератором по Києву та всій Україні',
    accentColor: 'emerald' as const,
  },
  {
    icon: FileCheck,
    title: 'ISO Сертифікат',
    description: 'Всі партії супроводжуються повною документацією якості',
    accentColor: 'violet' as const,
  },
  {
    icon: UserCheck,
    title: 'Менеджер 24/7',
    description: 'Персональний менеджер для кожного клієнта на зв\'язку',
    accentColor: 'amber' as const,
  },
  {
    icon: Coins,
    title: 'Від 50 шт',
    description: 'Гнучкі умови для різних обсягів замовлень',
    accentColor: 'rose' as const,
  },
  {
    icon: RefreshCw,
    title: 'Гарантія заміни',
    description: 'Заміна або повернення коштів без зайвих питань',
    accentColor: 'emerald' as const,
  },
];

export function ValueStackingSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-10 sm:py-20 lg:py-28 bg-white dark:bg-[#151922] overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8 sm:mb-14 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-2 sm:mb-4">
            Переваги{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              співпраці
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-500 max-w-xl mx-auto">
            Чому партнери обирають Premium Flora
          </p>
        </motion.div>

        {/* Cards Grid - 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {values.map((value, index) => (
            <FeatureCard key={value.title} {...value} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
