import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden section-padding min-h-[90vh] flex items-center">
      {/* Video Background - Optimized */}
      <div className="absolute inset-0 z-0 gpu-accelerated">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          poster="/hero-video-poster.jpg"
          style={{ willChange: 'transform' }}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          <source src="/hero-video.webm" type="video/webm" />
          {/* Fallback gradient if video doesn't load */}
        </video>
        {/* Premium Overlay with Glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white/50 to-blue-50/60 dark:from-emerald-900/30 dark:via-admin-bg/50 dark:to-blue-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_10%,rgba(236,248,241,0.4),transparent),radial-gradient(1400px_circle_at_90%_20%,rgba(238,242,255,0.4),transparent)] dark:bg-[radial-gradient(1200px_circle_at_10%_10%,rgba(13,17,23,0.6),transparent),radial-gradient(1400px_circle_at_90%_20%,rgba(22,27,34,0.4),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/60 dark:from-transparent dark:via-admin-bg/30 dark:to-admin-bg/60" />
        {/* Glass overlay for depth */}
        <div className="absolute inset-0 glass-soft opacity-30" />
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 gpu-accelerated">
        <div className="mx-auto max-w-4xl text-center fade-in-up">
          {/* Premium Badge with Glassmorphism */}
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full glass glass-soft px-3.5 py-1.5 text-xs sm:text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 shadow-premium transition-premium hover-lift-3d animate-float">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span className="leading-none">Преміальні квіти для вашого бізнесу</span>
          </div>
          
          {/* Main headline - Premium SaaS style */}
          <h1 className="mb-6 text-display font-extrabold tracking-tight text-slate-900 dark:text-admin-text-primary gpu-accelerated">
            Оптовий магазин
            <span className="block text-gradient-premium">
              Premium Flora
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="mx-auto mb-4 max-w-2xl text-body-large leading-relaxed text-slate-800 dark:text-admin-text-secondary font-semibold sm:font-medium">
            Широкий асортимент свіжих квітів преміальної якості.
            <span className="block sm:inline"> Індивідуальний підхід, чесні оптові ціни та надійна доставка для вашого квіткового бізнесу.</span>
          </p>
          
          {/* Social proof */}
          <div className="mb-8 sm:mb-10 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-admin-text-secondary">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span className="font-medium">Свіжі поставки щоп'ятниці</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span className="font-medium">500+ постійних клієнтів по всій Україні</span>
            </div>
          </div>
          
          {/* Premium CTA Buttons */}
          <div className="mb-10 sm:mb-12 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="group btn-premium h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-colored-emerald transition-premium hover-lift-3d gpu-accelerated">
              <Link href="/catalog">
                Переглянути каталог
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold border-2 glass glass-soft btn-premium hover-lift-3d gpu-accelerated">
              <Link href="/about#contact">Зв'язатися з нами</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-6 text-xs sm:text-[13px] font-medium text-slate-700 dark:text-admin-text-tertiary">
            {/* Left: Гарантія якості та свіжості */}
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Гарантія якості та свіжості</span>
            </div>
            {/* Right: Швидка та надійна доставка */}
            <div className="flex items-center justify-end gap-1.5 sm:justify-start">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Швидка та надійна доставка</span>
            </div>
            {/* Bottom center: Індивідуальний підхід */}
            <div className="col-span-2 flex items-center justify-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Індивідуальний підхід до кожного клієнта</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


