'use client';

import { ArrowRight, Sparkles, Phone } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Shared blur placeholder for optimized image loading - neutral light grey
const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPjwvc3ZnPg==";

interface CtaSectionProps {
  onContactClick?: () => void;
  variant?: 'home' | 'catalog';
}

export function CtaSection({ onContactClick, variant = 'home' }: CtaSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const content = {
    home: {
      badge: 'Готові до співпраці?',
      title: 'Персональна пропозиція',
      titleAccent: 'для вашого бізнесу',
      subtitle: 'Залиште заявку і наш менеджер зв\'яжеться з вами протягом 30 хвилин',
      buttonText: 'Залишити заявку',
    },
    catalog: {
      badge: 'Не знайшли потрібне?',
      title: 'Індивідуальна пропозиція',
      titleAccent: 'під ваші потреби',
      subtitle: 'Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.',
      buttonText: 'Залишити заявку',
    },
  };

  const c = content[variant];

  return (
    <section
      ref={ref}
      id="contact-form"
      className="relative overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://mymediastorage.fra1.digitaloceanspaces.com/premiumFlora/2149408754_93d28191c1.jpg"
          alt="Premium Flora - квіти"
          fill
          className="object-cover"
          loading="eager"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="100vw"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fafafa] via-[#fafafa]/95 to-[#fafafa]/70 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900/70" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 py-8 sm:py-12 lg:py-16 xl:py-20 px-5 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-4 sm:mb-5 px-4 py-2 rounded-full bg-white/90 dark:bg-emerald-900/50 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
            <span className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {c.badge}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-[20px] sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-3 sm:mb-4 leading-tight"
          >
            {c.title}{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {c.titleAccent}
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed"
          >
            {c.subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {/* Primary button */}
            <motion.button
              onClick={onContactClick}
              className="group flex items-center gap-2 h-10 sm:h-12 px-5 sm:px-7 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm sm:text-base rounded-xl transition-colors duration-200 shadow-lg shadow-emerald-500/25"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {c.buttonText}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>

            {/* Secondary button */}
            <motion.a
              href="tel:+380441234567"
              className="hidden sm:flex items-center gap-2 h-12 px-6 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-emerald-600 font-medium text-base rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Phone className="w-4 h-4" />
              Зателефонувати
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
