'use client';

import { ArrowRight, Sparkles, Phone, ChevronRight, Zap, Heart, MessageCircle, Send, Star, Leaf } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * CTA Section Variants Test Page
 * 10 радикально різних варіантів повної CTA секції
 */

export default function CtaTestPage() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 py-8 px-4 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            CTA Section Variants
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            10 радикально різних варіантів CTA секцій
          </p>
        </div>
      </div>

      {/* Current CTA for comparison */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a7a56]/90 via-[#0f9c6e]/85 to-[#0d8a5f]/90" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white/90 text-sm font-medium mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Поточний варіант (для порівняння)
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Зв'яжіться з нами для <span className="text-white">індивідуальної пропозиції</span>
          </h2>
          <p className="text-base text-white/80 mb-8 max-w-lg mx-auto">
            Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.
          </p>
          <button className="inline-flex items-center justify-center bg-white hover:bg-white/95 text-emerald-700 shadow-xl font-semibold px-8 h-12 text-base rounded-md transition-all duration-300">
            Залишити заявку
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>

      <VariantLabel number={1} title="Glassmorphism + Split Layout" />

      {/* Variant 1: Glassmorphism + Split Layout */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0">
          <Image
            src="https://mymediastorage.fra1.digitaloceanspaces.com/premiumFlora/2149408754_93d28191c1.jpg"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 via-emerald-800/70 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm font-medium mb-6 border border-white/20">
                <Sparkles className="w-4 h-4" />
                Не знайшли потрібне?
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Зв'яжіться з нами для{' '}
                <span className="text-emerald-300">індивідуальної пропозиції</span>
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="group relative inline-flex items-center justify-center h-14 px-8 overflow-hidden rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-base transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:shadow-[0_8px_32px_rgba(255,255,255,0.2)]">
                  <span className="relative z-10 flex items-center">
                    Залишити заявку
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
                <button className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-white text-emerald-700 font-semibold text-base transition-all duration-300 hover:shadow-[0_8px_32px_rgba(255,255,255,0.4)]">
                  <Phone className="w-5 h-5 mr-2" />
                  Зателефонувати
                </button>
              </div>
            </div>
            <div className="hidden lg:flex justify-end">
              <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                <div className="text-white/60 text-sm mb-2">Відповідаємо за</div>
                <div className="text-5xl font-bold text-white mb-2">30 хв</div>
                <div className="text-white/80">в робочий час</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VariantLabel number={2} title="Dark Elegant + Animated Gradient Border" />

      {/* Variant 2: Dark Elegant */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Не знайшли потрібне?
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Зв'яжіться з нами для
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              індивідуальної пропозиції
            </span>
          </h2>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="group relative inline-flex items-center justify-center h-14 px-8 overflow-hidden rounded-xl text-white font-semibold text-base">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite]" />
              <span className="absolute inset-[2px] rounded-[10px] bg-slate-950" />
              <span className="relative z-10 flex items-center bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Залишити заявку
                <ArrowRight className="w-5 h-5 ml-2 text-emerald-400 transition-transform group-hover:translate-x-1" />
              </span>
            </button>

            <button className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-white text-slate-900 font-semibold text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Зателефонувати
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
        `}</style>
      </section>

      <VariantLabel number={3} title="Brutalist + Bold Typography" />

      {/* Variant 3: Brutalist */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-amber-50">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-40 h-40 border-8 border-black rotate-12" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border-8 border-emerald-600 -rotate-6" />
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-black" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4">
          <div className="bg-white border-4 border-black p-8 lg:p-12 shadow-[12px_12px_0_0_#000]">
            <span className="inline-block px-4 py-2 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest mb-6 border-2 border-black">
              Не знайшли потрібне?
            </span>

            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-black mb-6 uppercase leading-none">
              Зв'яжіться
              <br />
              <span className="text-emerald-600">з нами</span>
            </h2>

            <p className="text-xl text-black/70 mb-10 max-w-xl font-medium">
              Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="inline-flex items-center justify-center h-16 px-10 bg-emerald-500 text-white font-black text-lg uppercase tracking-wider border-4 border-black shadow-[6px_6px_0_0_#000] transition-all duration-100 hover:shadow-[2px_2px_0_0_#000] hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-[6px] active:translate-y-[6px]">
                ЗАЛИШИТИ ЗАЯВКУ →
              </button>

              <button className="inline-flex items-center justify-center h-16 px-10 bg-white text-black font-black text-lg uppercase tracking-wider border-4 border-black shadow-[6px_6px_0_0_#10b981] transition-all duration-100 hover:shadow-[2px_2px_0_0_#10b981] hover:translate-x-1 hover:translate-y-1">
                ЗАТЕЛЕФОНУВАТИ
              </button>
            </div>
          </div>
        </div>
      </section>

      <VariantLabel number={4} title="Minimal Swiss + Clean Lines" />

      {/* Variant 4: Minimal Swiss */}
      <section className="relative py-24 lg:py-32 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-7">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">
                Не знайшли потрібне?
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-slate-900 leading-[1.1] mb-8">
                Зв'яжіться з нами
                <br />
                для <span className="font-semibold">індивідуальної</span>
                <br />
                пропозиції
              </h2>
            </div>

            <div className="lg:col-span-5">
              <div className="border-t border-slate-200 pt-8">
                <p className="text-lg text-slate-600 mb-8">
                  Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="group inline-flex items-center justify-center h-12 text-slate-900 font-medium text-base transition-all duration-200 hover:text-emerald-600">
                    <span className="relative">
                      Залишити заявку
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-900 group-hover:bg-emerald-600 transition-colors" />
                    </span>
                    <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-2" />
                  </button>

                  <button className="inline-flex items-center justify-center h-12 px-6 bg-slate-900 text-white font-medium text-base transition-all duration-200 hover:bg-slate-800">
                    Зателефонувати
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VariantLabel number={5} title="Neon Glow + Dark Theme" />

      {/* Variant 5: Neon Glow */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Sparkles className="w-4 h-4" />
            Не знайшли потрібне?
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            Зв'яжіться з нами для
            <br />
            <span className="text-emerald-400 drop-shadow-[0_0_40px_rgba(16,185,129,0.8)]">
              індивідуальної пропозиції
            </span>
          </h2>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="group inline-flex items-center justify-center h-14 px-8 bg-emerald-500/20 text-emerald-400 font-semibold text-base rounded-xl border border-emerald-400 transition-all duration-300 hover:bg-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.5),0_0_60px_rgba(16,185,129,0.3)] hover:text-emerald-300">
              <span className="drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">Залишити заявку</span>
              <ArrowRight className="w-5 h-5 ml-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-transform group-hover:translate-x-1" />
            </button>

            <button className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-white text-slate-900 font-semibold text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <Phone className="w-5 h-5 mr-2" />
              Зателефонувати
            </button>
          </div>
        </div>
      </section>

      <VariantLabel number={6} title="3D Card + Floating Elements" />

      {/* Variant 6: 3D Card */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-200 dark:bg-emerald-800 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-teal-200 dark:bg-teal-800 rounded-full blur-xl animate-pulse delay-1000" />

        <div className="relative z-10 mx-auto max-w-4xl px-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 lg:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transform hover:-translate-y-2 transition-all duration-500">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white mb-6 shadow-lg shadow-emerald-500/30">
                <MessageCircle className="w-8 h-8" />
              </div>

              <span className="block text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                Не знайшли потрібне?
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Зв'яжіться з нами для{' '}
                <span className="text-emerald-600 dark:text-emerald-400">індивідуальної пропозиції</span>
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
                Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <button className="group inline-flex items-center justify-center h-14 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-base rounded-2xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-1 active:translate-y-0">
                  Залишити заявку
                  <Send className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </button>

                <button className="inline-flex items-center justify-center h-14 px-8 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-base rounded-2xl transition-all duration-300 hover:bg-slate-200 dark:hover:bg-slate-600">
                  <Phone className="w-5 h-5 mr-2" />
                  Зателефонувати
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VariantLabel number={7} title="Split Image + Overlay Text" />

      {/* Variant 7: Split Image */}
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="relative h-[400px] lg:h-auto">
            <Image
              src="https://mymediastorage.fra1.digitaloceanspaces.com/premiumFlora/2149408754_93d28191c1.jpg"
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20 lg:bg-gradient-to-l lg:from-white lg:to-transparent" />
          </div>

          <div className="relative py-16 lg:py-24 px-8 lg:px-16 bg-white dark:bg-slate-900 flex items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Leaf className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Не знайшли потрібне?
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                Зв'яжіться з нами для{' '}
                <span className="text-emerald-600 dark:text-emerald-400">індивідуальної пропозиції</span>
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="group inline-flex items-center justify-center h-14 px-8 bg-emerald-600 text-white font-semibold text-base rounded-full transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg">
                  Залишити заявку
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </button>

                <button className="inline-flex items-center justify-center h-14 px-8 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-base rounded-full transition-all duration-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400">
                  Зателефонувати
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VariantLabel number={8} title="Retro Vintage + Warm Tones" />

      {/* Variant 8: Retro Vintage */}
      <section className="relative py-20 lg:py-28 bg-amber-50 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-800 text-amber-100 text-sm font-bold uppercase tracking-widest mb-8 border-2 border-emerald-900">
            <Star className="w-4 h-4" />
            Не знайшли потрібне?
            <Star className="w-4 h-4" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-emerald-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            Зв'яжіться з нами
            <br />
            <span className="text-amber-700 italic">для індивідуальної пропозиції</span>
          </h2>

          <div className="w-24 h-1 bg-emerald-800 mx-auto mb-6" />

          <p className="text-xl text-emerald-800/80 mb-10 max-w-xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
            Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="inline-flex items-center justify-center h-16 px-10 bg-emerald-800 text-amber-50 font-bold text-lg uppercase tracking-widest rounded-sm border-2 border-emerald-900 shadow-[inset_0_-4px_0_0_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-200 hover:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2),0_2px_6px_rgba(0,0,0,0.15)] hover:translate-y-[2px]">
              Залишити заявку
            </button>

            <button className="inline-flex items-center justify-center h-16 px-10 bg-amber-100 text-emerald-900 font-bold text-lg uppercase tracking-widest rounded-sm border-2 border-emerald-900 transition-all duration-200 hover:bg-amber-200">
              Зателефонувати →
            </button>
          </div>
        </div>
      </section>

      <VariantLabel number={9} title="Gradient Mesh + Modern" />

      {/* Variant 9: Gradient Mesh */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-white dark:bg-slate-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-emerald-100 via-teal-50 to-transparent dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-amber-50 via-rose-50 to-transparent dark:from-amber-900/20 dark:via-rose-900/10 dark:to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Не знайшли потрібне?
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Зв'яжіться з нами для
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
                індивідуальної пропозиції
              </span>
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
              Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.
            </p>

            <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button className="inline-flex items-center justify-center h-12 px-6 bg-emerald-600 text-white font-semibold text-base rounded-xl transition-all duration-300 hover:bg-emerald-700">
                Залишити заявку
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button className="inline-flex items-center justify-center h-12 px-6 text-slate-600 dark:text-slate-400 font-semibold text-base rounded-xl transition-all duration-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                <Phone className="w-5 h-5 mr-2" />
                Зателефонувати
              </button>
            </div>
          </div>
        </div>
      </section>

      <VariantLabel number={10} title="Neumorphism + Soft UI" />

      {/* Variant 10: Neumorphism */}
      <section className="relative py-20 lg:py-28 bg-slate-200 dark:bg-slate-800">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-3xl p-8 lg:p-12 bg-slate-200 dark:bg-slate-800 shadow-[20px_20px_60px_#b8b8b8,-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#1e293b,-20px_-20px_60px_#475569]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-slate-200 dark:bg-slate-800 shadow-[8px_8px_16px_#b8b8b8,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#1e293b,-8px_-8px_16px_#475569]">
                <Leaf className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>

              <span className="block text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                Не знайшли потрібне?
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold text-slate-700 dark:text-slate-200 mb-4">
                Зв'яжіться з нами для{' '}
                <span className="text-emerald-600 dark:text-emerald-400">індивідуальної пропозиції</span>
              </h2>

              <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto">
                Маємо широкий асортимент квітів під замовлення. Наш менеджер допоможе підібрати оптимальний варіант.
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                <button className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-emerald-500 text-white font-semibold text-base transition-all duration-200 shadow-[8px_8px_16px_#b8b8b8,-8px_-8px_16px_#ffffff,inset_0_-4px_8px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_16px_#1e293b,-8px_-8px_16px_#475569,inset_0_-4px_8px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_8px_#b8b8b8,-4px_-4px_8px_#ffffff] dark:hover:shadow-[4px_4px_8px_#1e293b,-4px_-4px_8px_#475569] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]">
                  Залишити заявку
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>

                <button className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold text-base transition-all duration-200 shadow-[8px_8px_16px_#b8b8b8,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#1e293b,-8px_-8px_16px_#475569] hover:shadow-[4px_4px_8px_#b8b8b8,-4px_-4px_8px_#ffffff] dark:hover:shadow-[4px_4px_8px_#1e293b,-4px_-4px_8px_#475569] active:shadow-[inset_4px_4px_8px_#b8b8b8,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_4px_4px_8px_#1e293b,inset_-4px_-4px_8px_#475569]">
                  <Phone className="w-5 h-5 mr-2" />
                  Зателефонувати
                </button>
              </div>
            </div>
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
