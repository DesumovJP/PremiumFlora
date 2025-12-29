'use client';

import { BookOpen, Leaf, Package, Info, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Page Hero Variants Test Page
 * 10 варіантів hero секцій для сторінок (Каталог, Блог, Про нас)
 * На основі наявних стилів з варіаціями позиціонування
 */

export default function HeroTestPage() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 py-8 px-4 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Page Hero Variants
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            10 варіантів hero секцій на основі наявних стилів
          </p>
        </div>
      </div>

      {/* Current Hero for comparison */}
      <VariantLabel number={0} title="Поточний варіант (для порівняння)" />
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 border-b border-slate-100">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="h-full w-full bg-[url('/blog.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-white/90" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-blue-50/40" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100/50 bg-emerald-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700 shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Ваш надійний партнер
            </div>
            <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Про <span className="text-emerald-600">Premium Flora</span>
            </h1>
            <p className="text-lg text-slate-600">
              Оптовий постачальник свіжих квітів преміальної якості для вашого квіткового бізнесу
            </p>
          </div>
        </div>
      </section>

      <VariantLabel number={1} title="Left Aligned + Gradient Right" />
      {/* Variant 1: Left Aligned */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="h-full w-full bg-[url('/blog.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100/50 bg-emerald-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700 shadow-sm">
              <Package className="h-4 w-4" />
              Каталог квітів
            </div>
            <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Преміальні квіти для <span className="text-emerald-600">вашого бізнесу</span>
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              Широкий асортимент свіжих квітів від найкращих виробників Еквадору та Нідерландів
            </p>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                50+ сортів
              </span>
              <span className="text-slate-300">•</span>
              <span>Доставка по Україні</span>
            </div>
          </div>
        </div>
      </section>

      <VariantLabel number={2} title="Split Layout 50/50" />
      {/* Variant 2: Split 50/50 */}
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[400px]">
          {/* Content */}
          <div className="flex items-center py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-white dark:bg-slate-900 order-2 lg:order-1">
            <div className="max-w-lg">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-100/50 bg-amber-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-amber-700 shadow-sm">
                <BookOpen className="h-4 w-4" />
                Блог
              </div>
              <h1 className="mb-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Корисні статті та <span className="text-amber-600">поради</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Дізнайтеся про догляд за квітами, тренди та секрети професійних флористів
              </p>
            </div>
          </div>
          {/* Image */}
          <div className="relative h-[250px] lg:h-auto order-1 lg:order-2">
            <Image
              src="https://mymediastorage.fra1.digitaloceanspaces.com/premiumFlora/2149408754_93d28191c1.jpg"
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-white/20" />
          </div>
        </div>
      </section>

      <VariantLabel number={3} title="Compact + Bottom Border Accent" />
      {/* Variant 3: Compact with accent */}
      <section className="relative bg-white dark:bg-slate-900 border-b-4 border-emerald-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-100/50 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Info className="h-3.5 w-3.5" />
                Про нас
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Про <span className="text-emerald-600">Premium Flora</span>
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">
              Ваш надійний партнер у світі преміальних квітів
            </p>
          </div>
        </div>
      </section>

      <VariantLabel number={4} title="Full Width Image + Overlay" />
      {/* Variant 4: Full image overlay */}
      <section className="relative overflow-hidden min-h-[350px] sm:min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="https://mymediastorage.fra1.digitaloceanspaces.com/premiumFlora/2149408754_93d28191c1.jpg"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs sm:text-sm font-semibold text-white border border-white/20">
              <Package className="h-4 w-4" />
              Каталог
            </div>
            <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Квіти преміум <span className="text-emerald-400">якості</span>
            </h1>
            <p className="text-lg text-white/80">
              Понад 50 сортів троянд та інших квітів для вашого бізнесу
            </p>
          </div>
        </div>
      </section>

      <VariantLabel number={5} title="Centered + Decorative Elements" />
      {/* Variant 5: Centered with decoration */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-emerald-50 to-white dark:from-slate-800 dark:to-slate-900">
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-teal-100 dark:bg-teal-900/30 rounded-full blur-3xl opacity-50" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white dark:bg-slate-800 px-5 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm">
              <Leaf className="h-4 w-4" />
              Про компанію
            </div>
            <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Premium <span className="text-emerald-600 dark:text-emerald-400">Flora</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Оптовий постачальник свіжих квітів преміальної якості для вашого квіткового бізнесу
            </p>
          </div>
        </div>
      </section>

      <VariantLabel number={6} title="Right Aligned + Stats" />
      {/* Variant 6: Right aligned with stats */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="h-full w-full bg-[url('/blog.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-l from-white via-white/95 to-white/70" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end">
            <div className="max-w-2xl text-right">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-100/50 bg-amber-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-amber-700 shadow-sm">
                <BookOpen className="h-4 w-4" />
                Блог
              </div>
              <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
                Статті та <span className="text-amber-600">поради</span>
              </h1>
              <p className="text-lg text-slate-600 mb-6">
                Корисна інформація для професійних флористів та любителів
              </p>
              <div className="flex justify-end gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">50+</div>
                  <div className="text-sm text-slate-500">статей</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">10K+</div>
                  <div className="text-sm text-slate-500">читачів</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VariantLabel number={7} title="Minimal + Large Typography" />
      {/* Variant 7: Minimal large text */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">
              Каталог квітів
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Преміальні
              <br />
              <span className="text-emerald-600 dark:text-emerald-400">квіти</span> для бізнесу
            </h1>
          </div>
        </div>
      </section>

      <VariantLabel number={8} title="Card Style + Shadow" />
      {/* Variant 8: Card style */}
      <section className="relative py-12 sm:py-16 bg-slate-50 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid lg:grid-cols-5">
              {/* Image - 2 cols */}
              <div className="relative h-[200px] lg:h-auto lg:col-span-2">
                <Image
                  src="https://mymediastorage.fra1.digitaloceanspaces.com/premiumFlora/2149408754_93d28191c1.jpg"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              {/* Content - 3 cols */}
              <div className="p-6 sm:p-8 lg:p-10 lg:col-span-3 flex items-center">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700">
                    <Info className="h-4 w-4" />
                    Про нас
                  </div>
                  <h1 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Про <span className="text-emerald-600 dark:text-emerald-400">Premium Flora</span>
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Оптовий постачальник свіжих квітів преміальної якості для вашого квіткового бізнесу
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VariantLabel number={9} title="Gradient Text + CTA" />
      {/* Variant 9: Gradient text with CTA */}
      <section className="relative overflow-hidden py-14 sm:py-18 lg:py-22 bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-400 border border-emerald-500/20">
              <Sparkles className="h-4 w-4" />
              Каталог
            </div>
            <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                Квіти преміум якості
              </span>
            </h1>
            <p className="text-lg text-slate-400 mb-8">
              Понад 50 сортів для вашого бізнесу
            </p>
            <button className="inline-flex items-center gap-2 h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition-colors">
              Переглянути каталог
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <VariantLabel number={10} title="Breadcrumb Style + Subtle" />
      {/* Variant 10: Breadcrumb style */}
      <section className="relative py-10 sm:py-12 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Головна</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900 dark:text-white font-medium">Блог</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                Корисні статті та поради
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 lg:max-w-md lg:text-right">
              Дізнайтеся про догляд за квітами, тренди та секрети флористів
            </p>
          </div>
        </div>
      </section>

      {/* Back link */}
      <div className="py-12 text-center bg-white dark:bg-slate-800">
        <Link
          href="/"
          className="inline-flex items-center text-slate-500 hover:text-emerald-600 transition-colors"
        >
          ← Повернутися на головну
        </Link>
      </div>
    </div>
  );
}

function VariantLabel({ number, title }: { number: number; title: string }) {
  return (
    <div className="bg-slate-800 dark:bg-slate-950 py-4 px-6">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-sm flex items-center justify-center">
          {number}
        </span>
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
    </div>
  );
}
