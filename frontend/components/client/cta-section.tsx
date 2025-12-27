'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

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
      title: 'Отримайте персональну пропозицію',
      titleAccent: 'для вашого бізнесу',
      subtitle: 'Залиште заявку і наш менеджер зв\'яжеться з вами протягом 30 хвилин',
      buttonText: 'Залишити заявку',
    },
    catalog: {
      badge: 'Не знайшли потрібне?',
      title: 'Зв\'яжіться з нами для',
      titleAccent: 'індивідуальної пропозиції',
      subtitle: 'Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.',
      buttonText: 'Залишити заявку',
    },
  };

  const c = content[variant];

  return (
    <section
      ref={ref}
      id="contact-form"
      className="relative overflow-hidden py-16 lg:py-24"
    >
      {/* Background image with overlay - using brand color #0f9c6e */}
      <div className="absolute inset-0 bg-[url('/bg.webp')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a7a56]/90 via-[#0f9c6e]/85 to-[#0d8a5f]/90" />


      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-center"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white/90 text-sm font-medium mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {c.badge}
          </span>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            {c.title}{' '}
            <span className="text-white">{c.titleAccent}</span>
          </h2>

          {/* Subtext */}
          <p className="text-base text-white/80 mb-8 max-w-lg mx-auto">
            {c.subtitle}
          </p>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block"
          >
            <Button
              size="lg"
              onClick={onContactClick}
              className="bg-white hover:bg-white/95 text-emerald-700 shadow-xl font-semibold px-8 h-12 text-base transition-all duration-300"
            >
              {c.buttonText}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
