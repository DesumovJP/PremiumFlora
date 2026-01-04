'use client';

import { useRef } from 'react';
import {
  Snowflake,
  Truck,
  FileCheck,
  UserCheck,
  Coins,
  RefreshCw,
  Flower2,
  Leaf,
  Sprout,
  Cherry,
  Clover,
  TreeDeciduous,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { FeatureCard, type FeatureCardProps } from '@/components/ui/feature-card';

// Unified emerald palette for all cards
const values: Omit<FeatureCardProps, 'index'>[] = [
  {
    icon: Snowflake,
    title: 'Свіжість гарантована',
    description: 'Квіти зберігаються при оптимальній температурі від плантації до вашого складу',
  },
  {
    icon: Truck,
    title: 'Доставка 24/48h',
    description: 'Швидка доставка рефрижератором по Києву та всій Україні',
  },
  {
    icon: FileCheck,
    title: 'ISO Сертифікат',
    description: 'Всі партії супроводжуються повною документацією якості',
  },
  {
    icon: UserCheck,
    title: 'Менеджер 24/7',
    description: 'Персональний менеджер для кожного клієнта на зв\'язку',
  },
  {
    icon: Coins,
    title: 'Від 50 шт',
    description: 'Гнучкі умови для різних обсягів замовлень',
  },
  {
    icon: RefreshCw,
    title: 'Гарантія заміни',
    description: 'Заміна або повернення коштів без зайвих питань',
  },
];

export function ValueStackingSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-10 sm:py-20 lg:py-28 bg-white dark:bg-[#151922] overflow-hidden">
      {/* Decorative background - scattered floral icons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Row 1 - top */}
        <Flower2 className="absolute top-2 left-[5%] w-16 h-16 sm:w-24 sm:h-24 text-emerald-500 opacity-[0.08] -rotate-12" strokeWidth={0.7} />
        <Cherry className="absolute top-6 left-[20%] w-10 h-10 sm:w-14 sm:h-14 text-rose-400 opacity-[0.06] rotate-12 hidden sm:block" strokeWidth={0.7} />
        <Leaf className="absolute top-4 left-[38%] w-12 h-12 sm:w-16 sm:h-16 text-teal-400 opacity-[0.05] rotate-45 hidden md:block" strokeWidth={0.7} />
        <Clover className="absolute top-8 right-[35%] w-10 h-10 sm:w-14 sm:h-14 text-emerald-400 opacity-[0.06] -rotate-12 hidden lg:block" strokeWidth={0.7} />
        <Sprout className="absolute top-3 right-[18%] w-12 h-12 sm:w-16 sm:h-16 text-teal-500 opacity-[0.05] rotate-[20deg] hidden sm:block" strokeWidth={0.7} />
        <Flower2 className="absolute top-2 right-[3%] w-14 h-14 sm:w-20 sm:h-20 text-rose-300 opacity-[0.07] rotate-45" strokeWidth={0.7} />

        {/* Row 2 - upper middle */}
        <Leaf className="absolute top-[30%] left-[2%] w-10 h-10 sm:w-14 sm:h-14 text-emerald-500 opacity-[0.05] -rotate-45 hidden sm:block" strokeWidth={0.7} />
        <TreeDeciduous className="absolute top-[25%] right-[8%] w-12 h-12 sm:w-18 sm:h-18 text-emerald-400 opacity-[0.04] rotate-6 hidden md:block" strokeWidth={0.7} />

        {/* Row 3 - center */}
        <Cherry className="absolute top-1/2 left-[6%] w-8 h-8 sm:w-12 sm:h-12 text-rose-400 opacity-[0.05] rotate-12 hidden sm:block" strokeWidth={0.7} />
        <Clover className="absolute top-[45%] right-[5%] w-10 h-10 sm:w-14 sm:h-14 text-emerald-500 opacity-[0.05] -rotate-6 hidden sm:block" strokeWidth={0.7} />

        {/* Row 4 - lower middle */}
        <Sprout className="absolute bottom-[30%] left-[4%] w-10 h-10 sm:w-14 sm:h-14 text-teal-400 opacity-[0.05] rotate-[30deg] hidden sm:block" strokeWidth={0.7} />
        <Leaf className="absolute bottom-[28%] right-[6%] w-12 h-12 sm:w-16 sm:h-16 text-emerald-500 opacity-[0.04] -rotate-12 hidden md:block" strokeWidth={0.7} />

        {/* Row 5 - bottom */}
        <Flower2 className="absolute bottom-4 left-[4%] w-14 h-14 sm:w-20 sm:h-20 text-emerald-400 opacity-[0.07] rotate-12" strokeWidth={0.7} />
        <Clover className="absolute bottom-8 left-[22%] w-10 h-10 sm:w-14 sm:h-14 text-teal-500 opacity-[0.05] rotate-45 hidden sm:block" strokeWidth={0.7} />
        <Cherry className="absolute bottom-6 left-[40%] w-8 h-8 sm:w-12 sm:h-12 text-rose-300 opacity-[0.05] -rotate-6 hidden md:block" strokeWidth={0.7} />
        <Sprout className="absolute bottom-10 right-[32%] w-10 h-10 sm:w-14 sm:h-14 text-emerald-400 opacity-[0.04] rotate-[20deg] hidden lg:block" strokeWidth={0.7} />
        <Leaf className="absolute bottom-5 right-[15%] w-12 h-12 sm:w-16 sm:h-16 text-teal-400 opacity-[0.06] rotate-[60deg] hidden sm:block" strokeWidth={0.7} />
        <Flower2 className="absolute bottom-3 right-[3%] w-16 h-16 sm:w-22 sm:h-22 text-rose-400 opacity-[0.07] -rotate-12" strokeWidth={0.7} />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
