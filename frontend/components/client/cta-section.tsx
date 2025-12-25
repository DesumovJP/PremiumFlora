'use client';

import { ArrowRight, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useIntersection } from '@/hooks/use-intersection';

export function CtaSection() {
  const { ref, isVisible } = useIntersection({ threshold: 0.2, triggerOnce: true });

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative overflow-hidden py-12 sm:py-16 lg:py-20"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800" />

      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-white/20 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
          Готові почати співпрацю?
        </div>

        {/* Heading */}
        <h2
          className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Отримайте персональну пропозицію
          <br className="hidden sm:block" />
          <span className="text-emerald-200">для вашого бізнесу</span>
        </h2>

        {/* Subtext */}
        <p
          className={`text-sm sm:text-base lg:text-lg text-emerald-100/90 mb-6 sm:mb-8 max-w-2xl mx-auto transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Залиште заявку і наш менеджер зв'яжеться з вами протягом 30 хвилин
          у робочий час. Підберемо оптимальні умови співпраці.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Button
            size="lg"
            asChild
            className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 transition-all duration-300"
          >
            <Link href="#contact-form" className="flex items-center gap-2">
              Залишити заявку
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full sm:w-auto border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm font-semibold text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 transition-all duration-300"
          >
            <a href="tel:+380671234567" className="flex items-center gap-2">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              Зателефонувати
            </a>
          </Button>
        </div>

        {/* Trust badges */}
        <div
          className={`mt-8 sm:mt-10 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-emerald-100/80 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Безкоштовна консультація</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Гнучкі умови</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Доставка по Україні</span>
          </div>
        </div>
      </div>
    </section>
  );
}
