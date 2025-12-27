'use client';

import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface HeroSectionPremiumProps {
  onContactClick?: () => void;
}

export function HeroSectionPremium({ onContactClick }: HeroSectionPremiumProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden pt-20 pb-24 sm:pt-0 sm:pb-0">
      {/* Background image layer */}
      <div className="absolute inset-0">
        <Image
          src="/hero-flowers.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Light overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/70 lg:from-white/90 lg:via-white/75 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/80" />
      </div>


      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">

            {/* Left: Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl text-center sm:text-left"
            >
              {/* Eyebrow */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={mounted ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xs sm:text-sm font-medium text-emerald-600 mb-3 sm:mb-4 tracking-wide"
              >
                Оптові поставки квітів з Європи
              </motion.p>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-800 leading-[1.15] tracking-tight mb-4 sm:mb-6"
              >
                Преміальні квіти для вашого бізнесу
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm sm:text-base lg:text-lg text-slate-600 mb-6 sm:mb-8 leading-relaxed"
              >
                Прямі поставки з європейських плантацій.
                Гарантована свіжість 7+ днів, доставка по всій Україні.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="flex flex-col sm:flex-row gap-2 sm:gap-3"
              >
                <Button
                  size="lg"
                  onClick={onContactClick}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base font-medium rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25"
                >
                  Отримати пропозицію
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base font-medium rounded-xl transition-all duration-200"
                >
                  <Link href="/catalog">
                    Переглянути каталог
                  </Link>
                </Button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={mounted ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200/60"
              >
                <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 sm:gap-x-8 gap-y-3 sm:gap-y-4">
                  {[
                    { value: '500+', label: 'клієнтів' },
                    { value: '7+ днів', label: 'свіжість' },
                    { value: '24h', label: 'доставка' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-baseline gap-1 sm:gap-1.5">
                      <span className="text-base sm:text-lg font-medium text-slate-700">{stat.value}</span>
                      <span className="text-[10px] sm:text-xs text-slate-500">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={mounted ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100">
                <Image
                  src="/hero-flowers.jpg"
                  alt="Преміальні квіти"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 0vw, 50vw"
                />
                {/* Subtle overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent" />
              </div>

              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={mounted ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -left-8 bottom-12 bg-white rounded-2xl shadow-xl p-5 max-w-[240px]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Доставка щоп'ятниці</p>
                    <p className="text-xs text-slate-500">Свіжий імпорт</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {['🌷', '🌹', '🌸', '💐'].map((emoji, i) => (
                    <span key={i} className="text-lg">{emoji}</span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile due to space constraints */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1 hidden sm:flex"
      >
        <span className="text-xs font-medium text-slate-500">Дивіться більше</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-emerald-500" />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
