'use client';

import { useRef, useState } from 'react';
import {
  Snowflake,
  Truck,
  FileCheck,
  UserCheck,
  Coins,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Value {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

const values: Value[] = [
  {
    icon: Snowflake,
    title: 'Свіжість гарантована',
    description: 'Квіти зберігаються при оптимальній температурі від плантації до вашого складу',
    gradient: 'from-cyan-50 to-emerald-50',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
  },
  {
    icon: Truck,
    title: 'Доставка 24/48h',
    description: 'Швидка доставка рефрижератором по Києву та всій Україні',
    gradient: 'from-emerald-50 to-teal-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    icon: FileCheck,
    title: 'ISO Сертифікат',
    description: 'Всі партії супроводжуються повною документацією якості',
    gradient: 'from-violet-50 to-indigo-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    icon: UserCheck,
    title: 'Менеджер 24/7',
    description: 'Персональний менеджер для кожного клієнта на зв\'язку',
    gradient: 'from-amber-50 to-orange-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    icon: Coins,
    title: 'Від 50 шт',
    description: 'Гнучкі умови для різних обсягів замовлень',
    gradient: 'from-rose-50 to-pink-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    icon: RefreshCw,
    title: 'Гарантія заміни',
    description: 'Заміна або повернення коштів без зайвих питань',
    gradient: 'from-teal-50 to-cyan-50',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
];

// Interactive card with hover effects
function ValueCard({ value, index }: { value: Value; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1]
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Card */}
      <motion.div
        className={cn(
          'relative h-full p-3 sm:p-6 rounded-xl sm:rounded-2xl cursor-default overflow-hidden',
          'bg-white border border-slate-100',
          'transition-all duration-300',
        )}
        whileHover={{
          y: -4,
          boxShadow: '0 20px 40px -15px rgba(16, 185, 129, 0.15), 0 8px 20px -10px rgba(0, 0, 0, 0.08)',
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Gradient background on hover */}
        <motion.div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300',
            value.gradient
          )}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            className={cn(
              'w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4',
              'transition-all duration-300',
              value.iconBg
            )}
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <value.icon className={cn('w-4 h-4 sm:w-6 sm:h-6', value.iconColor)} strokeWidth={1.5} />
          </motion.div>

          {/* Title */}
          <h3 className="text-xs sm:text-lg font-semibold text-slate-800 mb-1 sm:mb-2 group-hover:text-slate-900 transition-colors leading-tight">
            {value.title}
          </h3>

          {/* Description */}
          <p className="text-[10px] sm:text-sm text-slate-500 leading-snug sm:leading-relaxed group-hover:text-slate-600 transition-colors line-clamp-3 sm:line-clamp-none">
            {value.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ValueStackingSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-12 sm:py-20 lg:py-28 bg-white overflow-hidden">

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8 sm:mb-14 lg:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-3 sm:mb-4"
          >
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-medium border border-emerald-100/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Переваги співпраці
            </span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-2 sm:mb-4">
            Чому обирають{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              нас
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-500 max-w-xl mx-auto">
            Європейська якість з українським сервісом
          </p>
        </motion.div>

        {/* Cards Grid - 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-5 lg:gap-6">
          {values.map((value, index) => (
            <ValueCard key={value.title} value={value} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
