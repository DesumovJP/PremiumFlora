'use client';

import { ArrowRight, Sprout } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSectionPremium() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/40 sm:to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl animate-fade-in text-center sm:text-left">
          {/* Badge */}
          <div className="animate-slide-in-up flex justify-center sm:justify-start" style={{ animationDelay: '100ms' }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6 border border-emerald-100">
              <Sprout className="w-4 h-4" />
              Свіжі квіти прямо з плантації
            </span>
          </div>

          {/* Headline */}
          <h1
            className="!text-[2.75rem] sm:!text-[3rem] md:!text-[4rem] lg:!text-[5rem] xl:!text-[6rem] 2xl:!text-[7rem] font-bold text-slate-900 !leading-[1.05] mb-6 animate-slide-in-up"
            style={{ animationDelay: '200ms' }}
          >
            Оптова свіжість
            <br />
            <span className="text-emerald-600">до ваших дверей</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-base sm:text-lg lg:text-xl text-slate-600 mb-8 max-w-xl mx-auto sm:mx-0 leading-relaxed animate-slide-in-up"
            style={{ animationDelay: '300ms' }}
          >
            Прямі поставки з європейських плантацій для флористів,
            готелів та івент-агентств. Гарантована свіжість 7+ днів.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-in-up items-center sm:items-start"
            style={{ animationDelay: '400ms' }}
          >
            <Button size="lg" asChild className="text-base">
              <Link href="#contact-form" className="gap-2">
                Отримати оптову пропозицію
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-slate-400 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
