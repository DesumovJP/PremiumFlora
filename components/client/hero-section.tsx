import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden section-padding">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          poster="/hero-video-poster.jpg"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          <source src="/hero-video.webm" type="video/webm" />
          {/* Fallback gradient if video doesn't load */}
        </video>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white/40 to-blue-50/50" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_10%,rgba(236,248,241,0.3),transparent),radial-gradient(1400px_circle_at_90%_20%,rgba(238,242,255,0.3),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/50" />
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge with animation */}
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-white/90 px-3.5 py-1.5 text-xs sm:text-[13px] font-semibold text-emerald-700 shadow-sm backdrop-blur-md transition-all hover:border-emerald-300 hover:shadow-md">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span className="leading-none">Преміальні квіти для вашого бізнесу</span>
          </div>
          
          {/* Main headline - Premium SaaS style */}
          <h1 className="mb-6 text-display font-extrabold tracking-tight text-slate-900">
            Оптовий магазин
            <span className="block bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Premium Flora
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="mx-auto mb-4 max-w-2xl text-body-large leading-relaxed text-slate-800 font-semibold sm:font-medium">
            Широкий асортимент свіжих квітів преміальної якості.
            <span className="block sm:inline"> Індивідуальний підхід, чесні оптові ціни та надійна доставка для вашого квіткового бізнесу.</span>
          </p>
          
          {/* Social proof */}
          <div className="mb-8 sm:mb-10 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs sm:text-sm font-semibold text-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span className="font-medium">Свіжі поставки щоп'ятниці</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span className="font-medium">500+ постійних клієнтів по всій Україні</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="mb-10 sm:mb-12 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="group h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-xl shadow-emerald-500/20 transition-all hover:shadow-2xl hover:shadow-emerald-500/30">
              <Link href="/catalog">
                Переглянути каталог
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold border-2">
              <Link href="/about#contact">Зв'язатися з нами</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-6 text-xs sm:text-[13px] font-medium text-slate-700">
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


