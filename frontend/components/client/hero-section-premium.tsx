'use client';

import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Shared blur placeholder for optimized image loading - neutral light grey
const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPjwvc3ZnPg==";

// Floating animation for decorative elements
const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut" as const
  }
};

const floatingSlowAnimation = {
  y: [-15, 15, -15],
  x: [-5, 5, -5],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut" as const
  }
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.5, 0.8, 0.5],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut" as const
  }
};

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
      {/* Floating decorative elements - GPU accelerated */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={floatingAnimation}
          className="absolute top-[15%] right-[10%] w-32 h-32 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/20 will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        />
        <motion.div
          animate={floatingSlowAnimation}
          className="absolute top-[60%] right-[5%] w-24 h-24 rounded-full bg-gradient-to-br from-amber-200/25 to-orange-200/15 will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        />
        <motion.div
          animate={pulseAnimation}
          className="absolute top-[30%] left-[5%] w-40 h-40 rounded-full bg-gradient-to-br from-emerald-100/20 to-cyan-100/10 will-change-transform hidden lg:block"
          style={{ transform: 'translateZ(0)' }}
        />
        <motion.div
          animate={floatingAnimation}
          className="absolute bottom-[20%] left-[15%] w-20 h-20 rounded-full bg-gradient-to-br from-rose-200/20 to-pink-200/10 will-change-transform hidden lg:block"
          style={{ transform: 'translateZ(0)' }}
        />
      </div>

      {/* Background image layer */}
      <div className="absolute inset-0">
        <Image
          src="https://mymediastorage.fra1.digitaloceanspaces.com/premiumFlora/2149408754_93d28191c1.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
        {/* Light overlay to ensure text readability - more subtle on mobile to show image */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/65 to-white/40 lg:from-white/90 lg:via-white/75 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/70 lg:from-white/60 lg:via-transparent lg:to-white/80" />
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
              {/* Mobile floating badge - above eyebrow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={mounted ? {
                  opacity: 1,
                  scale: 1,
                  y: [0, -4, 0]
                } : {}}
                transition={{
                  opacity: { duration: 0.4, delay: 0.05 },
                  scale: { duration: 0.4, delay: 0.05 },
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
                }}
                className="flex justify-end mb-3 lg:hidden"
              >
                <div
                  className="bg-white rounded-xl p-2.5 will-change-transform border border-slate-100"
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-base">🌷</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-800 leading-tight">Щоп&apos;ятниці</p>
                      <p className="text-[9px] text-slate-500 leading-tight">свіжі поставки</p>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>

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
                className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 leading-[1.15] tracking-tight mb-4 sm:mb-6"
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
                className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3"
              >
                <Button
                  size="lg"
                  onClick={onContactClick}
                  className="w-auto bg-emerald-600 hover:bg-emerald-700 text-white h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base font-medium rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25"
                >
                  Отримати пропозицію
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="w-auto text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base font-medium rounded-xl transition-all duration-200"
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
                className="mt-8 sm:mt-12 pt-4 sm:pt-6"
              >
                <div
                  className="inline-flex flex-wrap justify-center sm:justify-start gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-[#fafafa]"
                  style={{
                    boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.06), -3px -3px 8px rgba(255, 255, 255, 0.8)',
                  }}
                >
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
                  src="https://mymediastorage.fra1.digitaloceanspaces.com/premiumFlora/2149408754_93d28191c1.jpg"
                  alt="Преміальні квіти"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 0vw, 50vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
                {/* Subtle overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent" />
              </div>

              {/* Floating card with continuous animation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={mounted ? {
                  opacity: 1,
                  x: 0,
                  y: [0, -8, 0]
                } : {}}
                transition={{
                  opacity: { duration: 0.6, delay: 0.6 },
                  x: { duration: 0.6, delay: 0.6 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }
                }}
                className="absolute -left-8 bottom-12 bg-white rounded-2xl p-4 will-change-transform border border-slate-100"
                style={{
                  transform: 'translateZ(0)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center"
                  >
                    <span className="text-2xl">🌷</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Щоп&apos;ятниці</p>
                    <p className="text-xs text-slate-500">свіжі поставки</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center ml-1">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
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
