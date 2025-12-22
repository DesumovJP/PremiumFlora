'use client';

import { useRef, useState, useEffect } from 'react';
import { Phone, MessageCircle, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ContactFormSection() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="contact"
      className="py-20 sm:py-28 bg-gradient-to-b from-white to-slate-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={cn(
            'text-center mb-12 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
            Контакти
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Зв'яжіться з нами
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Зателефонуйте або напишіть — відповімо протягом 15 хвилин
          </p>
        </div>

        {/* Contact Cards */}
        <div
          className={cn(
            'max-w-4xl mx-auto transition-all duration-700 delay-200',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          {/* Main CTA - Phone */}
          <div className="bg-emerald-600 rounded-2xl p-8 sm:p-10 text-white text-center mb-6">
            <Phone className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              Зателефонуйте нам
            </h3>
            <p className="text-emerald-100 mb-6">
              Найшвидший спосіб отримати відповідь
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+380671234567"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-emerald-700 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all hover:scale-105 shadow-lg"
              >
                <Phone className="w-6 h-6" />
                +380 67 123 4567
              </a>
              <a
                href="tel:+380501234567"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20"
              >
                <Phone className="w-6 h-6" />
                +380 50 123 4567
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {/* Telegram */}
            <a
              href="https://t.me/premiumflora"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-200 hover:border-[#229ED9] hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-[#229ED9] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-900 group-hover:text-[#229ED9] transition-colors">
                  Telegram
                </div>
                <div className="text-slate-600">@premiumflora</div>
              </div>
              <MessageCircle className="w-5 h-5 text-slate-400 ml-auto group-hover:text-[#229ED9] transition-colors" />
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/premiumflora.ua"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-200 hover:border-pink-400 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-900 group-hover:text-pink-500 transition-colors">
                  Instagram
                </div>
                <div className="text-slate-600">@premiumflora.ua</div>
              </div>
              <MessageCircle className="w-5 h-5 text-slate-400 ml-auto group-hover:text-pink-500 transition-colors" />
            </a>
          </div>

          {/* Info Row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Режим роботи</div>
                <div className="text-sm text-slate-600">Пн-Пт: 9:00-18:00, Сб: 10:00-16:00</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Адреса</div>
                <div className="text-sm text-slate-600">м. Київ, Україна</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
