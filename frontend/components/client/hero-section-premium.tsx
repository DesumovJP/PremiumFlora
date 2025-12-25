'use client';

import { ArrowRight, Sprout } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';

// Floating petal component for premium effect
function FloatingPetal({ delay, duration, startX, startY, size }: {
  delay: number;
  duration: number;
  startX: number;
  startY: number;
  size: number;
}) {
  return (
    <div
      className="absolute pointer-events-none gpu-accelerated"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        animationName: 'floatPetal',
        animationDuration: `${duration}s`,
        animationTimingFunction: 'ease-in-out',
        animationDelay: `${delay}s`,
        animationIterationCount: 'infinite',
        willChange: 'transform, opacity',
      }}
    >
      <div
        className="rounded-full bg-gradient-to-br from-emerald-200/40 to-emerald-400/20"
        style={{
          width: `${size}px`,
          height: `${size * 1.5}px`,
          transform: 'rotate(-45deg)',
          filter: 'blur(1px)',
        }}
      />
    </div>
  );
}

// Animated text character component
function AnimatedChar({ char, delay }: { char: string; delay: number }) {
  return (
    <span
      className="inline-block gpu-accelerated"
      style={{
        animation: `charReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
        opacity: 0,
        transform: 'translate3d(0, 2.5rem, 0) rotateX(-40deg)',
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
}

// Animated word component
function AnimatedWord({ word, baseDelay, charDelay = 0.03 }: { word: string; baseDelay: number; charDelay?: number }) {
  return (
    <span className="inline-block overflow-hidden" style={{ perspective: '1000px' }}>
      {word.split('').map((char, i) => (
        <AnimatedChar key={i} char={char} delay={baseDelay + i * charDelay} />
      ))}
    </span>
  );
}

// Fixed petal configurations to avoid hydration mismatch
const PETAL_CONFIGS = [
  { delay: 0, duration: 10, startX: 65, startY: 15, size: 18 },
  { delay: 0.8, duration: 11, startX: 80, startY: 25, size: 22 },
  { delay: 1.6, duration: 9, startX: 70, startY: 45, size: 16 },
  { delay: 2.4, duration: 12, startX: 85, startY: 35, size: 24 },
  { delay: 3.2, duration: 10.5, startX: 75, startY: 55, size: 20 },
  { delay: 4, duration: 8.5, startX: 90, startY: 20, size: 14 },
  { delay: 4.8, duration: 11.5, startX: 68, startY: 60, size: 26 },
  { delay: 5.6, duration: 9.5, startX: 82, startY: 50, size: 19 },
];

export function HeroSectionPremium() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showPetals, setShowPetals] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    // Show petals only on client to avoid hydration issues
    setShowPetals(true);
    return () => clearTimeout(timer);
  }, []);

  // Parallax effect on mouse move - throttled for 120fps
  useEffect(() => {
    let rafId: number;
    let lastTime = 0;
    const throttleMs = 1000 / 120; // 120fps

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastTime < throttleMs) return;
      lastTime = now;

      rafId = requestAnimationFrame(() => {
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x: x * 20, y: y * 20 });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[calc(100svh-56px)] sm:min-h-[85vh] flex items-center overflow-hidden"
    >
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover gpu-accelerated"
          style={{
            transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0) scale(1.05)`,
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay with animated shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/40 sm:to-transparent" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(120deg, transparent 30%, rgba(16, 185, 129, 0.1) 50%, transparent 70%)',
            animation: isVisible ? 'shimmerOverlay 8s ease-in-out infinite' : 'none',
          }}
        />
      </div>

      {/* Floating Petals - rendered only on client */}
      <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden hidden sm:block">
        {showPetals && PETAL_CONFIGS.map((petal, index) => (
          <FloatingPetal key={index} {...petal} />
        ))}
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div
          className="max-w-7xl text-center sm:text-left"
          style={{
            transform: `translate3d(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px, 0)`,
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Badge with glow pulse */}
          <div
            className={`flex justify-center sm:justify-start transition-all duration-700 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 1.25rem, 0)',
              transitionDelay: '0.1s',
            }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6 border border-emerald-100 gpu-accelerated hover-scale-premium"
              style={{
                animation: isVisible ? 'pulseGlowSoft 3s ease-in-out infinite 1s' : 'none',
              }}
            >
              <Sprout className="w-4 h-4" style={{ animation: isVisible ? 'iconBounce 2s ease-in-out infinite' : 'none' }} />
              Свіжі квіти прямо з плантації
            </span>
          </div>

          {/* Headline with character animation */}
          <h1
            className="!text-[2rem] sm:!text-[2.5rem] md:!text-[3.5rem] lg:!text-[4.5rem] xl:!text-[5.5rem] font-bold text-slate-900 !leading-[1.1] mb-4 sm:mb-6"
            style={{ perspective: '1000px' }}
          >
            <span className="block overflow-hidden">
              {isVisible && (
                <>
                  <AnimatedWord word="Оптова" baseDelay={0.2} />
                  {' '}
                  <AnimatedWord word="свіжість" baseDelay={0.4} />
                </>
              )}
            </span>
            <span className="block overflow-hidden">
              {isVisible && (
                <span className="text-emerald-600 relative">
                  <AnimatedWord word="до" baseDelay={0.7} />
                  {' '}
                  <AnimatedWord word="ваших" baseDelay={0.8} />
                  {' '}
                  <AnimatedWord word="дверей" baseDelay={1.0} />
                  {/* Gradient underline */}
                  <span
                    className="absolute bottom-0 left-0 h-[0.25rem] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full gpu-accelerated"
                    style={{
                      width: isVisible ? '100%' : '0%',
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      transitionDelay: '1.5s',
                    }}
                  />
                </span>
              )}
            </span>
          </h1>

          {/* Subheadline with fade-in */}
          <p
            className={`text-sm sm:text-base lg:text-lg text-slate-600 mb-6 sm:mb-8 max-w-lg sm:max-w-xl mx-auto sm:mx-0 leading-relaxed gpu-accelerated ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 1.875rem, 0)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: '1.3s',
            }}
          >
            Прямі поставки з європейських плантацій для флористів,
            готелів та івент-агентств. Гарантована свіжість 7+ днів.
          </p>

          {/* CTAs with premium hover effect */}
          <div
            className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 items-center sm:items-start ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 2.5rem, 0)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: '1.5s',
            }}
          >
            <Button
              size="lg"
              asChild
              className="text-base relative overflow-hidden group gpu-accelerated btn-press-premium"
              style={{
                boxShadow: isVisible
                  ? '0 0 0 0 rgba(16, 185, 129, 0.4), 0 4px 15px rgba(16, 185, 129, 0.3)'
                  : 'none',
                animation: isVisible ? 'buttonGlow 2.5s ease-in-out infinite 2s' : 'none',
              }}
            >
              <Link href="#contact-form" className="gap-2">
                {/* Shimmer effect */}
                <span
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Отримати оптову пропозицію
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
          </div>

          {/* Trust indicators with staggered animation */}
          <div
            className={`flex flex-wrap gap-4 sm:gap-6 items-center justify-center sm:justify-start ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 1.25rem, 0)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: '1.8s',
            }}
          >
            {[
              { value: '500+', label: 'Клієнтів' },
              { value: '7+', label: 'Днів свіжості' },
              { value: '48h', label: 'Доставка' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="flex items-center gap-1.5 sm:gap-2 gpu-accelerated"
                style={{
                  animation: isVisible ? `fadeInUpPremium 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${2 + i * 0.1}s forwards` : 'none',
                  opacity: 0,
                }}
              >
                <span className="text-xl sm:text-2xl font-bold text-emerald-600">{stat.value}</span>
                <span className="text-xs sm:text-sm text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator with enhanced animation */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: isVisible ? 'translate(-50%, 0)' : 'translate(-50%, 1.25rem)',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: '2.2s',
        }}
      >
        <div
          className="w-6 h-10 rounded-full border-2 border-slate-300/60 flex items-start justify-center p-2 gpu-accelerated"
          style={{
            animation: 'scrollIndicatorBounce 2s ease-in-out infinite',
          }}
        >
          <div
            className="w-1.5 h-3 bg-emerald-500 rounded-full"
            style={{
              animation: 'scrollDot 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </section>
  );
}
