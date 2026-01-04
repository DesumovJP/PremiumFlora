'use client';

import { ArrowRight, Leaf, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

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
      className="relative overflow-hidden"
    >
      {/* Background Image - Bottom layer */}
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

      {/* Gradient Overlay - Top layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f9fbfa] via-[#f9fbfa]/95 to-[#f9fbfa]/70 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900/70" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 py-8 sm:py-12 lg:py-16 xl:py-20 px-5 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge - hidden on mobile */}
          <div className="hidden sm:inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {c.badge}
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-[15px] sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-4 leading-tight">
            {c.title}{' '}
            <span className="text-emerald-600 dark:text-emerald-400">{c.titleAccent}</span>
          </h2>

          {/* Subtitle */}
          <p className="text-[12px] sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-5 sm:mb-8 max-w-2xl mx-auto">
            {c.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              onClick={onContactClick}
              className="group w-auto h-10 sm:h-14 px-5 sm:px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[13px] sm:text-base rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              {c.buttonText}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="hidden sm:flex w-auto h-12 sm:h-14 px-6 sm:px-8 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-base rounded-full transition-all duration-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/50 dark:hover:bg-slate-800/50"
            >
              <a href="tel:+380441234567">
                <Phone className="w-5 h-5 mr-2" />
                Зателефонувати
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
