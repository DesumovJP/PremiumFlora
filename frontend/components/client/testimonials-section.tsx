'use client';

import { useRef, useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    id: 1,
    author: 'Марія Петренко',
    role: 'Власниця',
    company: 'Квіткова Майстерня',
    content:
      'Працюємо з Premium Flora вже 5 років. Завжди свіжі квіти, завжди вчасно. Рекомендую всім флористам Києва.',
    rating: 5,
    clientSince: '2019',
    image: '/testimonials/maria.jpg',
  },
  {
    id: 2,
    author: 'Олексій Ковальчук',
    role: 'Менеджер з закупівель',
    company: 'Hilton Kyiv',
    content:
      'Готель потребує стабільних поставок квітів преміум-якості. Premium Flora забезпечує це на 100%. Особливо цінуємо холодний ланцюг.',
    rating: 5,
    clientSince: '2020',
    image: '/testimonials/oleksiy.jpg',
  },
  {
    id: 3,
    author: 'Анна Савченко',
    role: 'Директор',
    company: 'Wedding Dreams Agency',
    content:
      'Premium Flora забезпечує нас квітами для 50+ весіль щомісяця. Жодного зриву за 3 роки співпраці. Персональний менеджер — це неймовірно зручно.',
    rating: 5,
    clientSince: '2021',
    image: '/testimonials/anna.jpg',
  },
  {
    id: 4,
    author: 'Дмитро Мельник',
    role: 'Власник мережі',
    company: 'Букет',
    content:
      'Маємо 12 магазинів по Україні. Premium Flora — єдиний постачальник, який стабільно забезпечує всі точки однаковою якістю.',
    rating: 5,
    clientSince: '2018',
    image: '/testimonials/dmytro.jpg',
  },
];

const certificates = [
  { name: 'ISO 9001:2015', image: '/certificates/iso.png' },
  { name: 'HACCP', image: '/certificates/haccp.png' },
  { name: 'Фітосанітарний', image: '/certificates/phyto.png' },
  { name: 'Якість України', image: '/certificates/quality.png' },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-slate-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={cn(
            'text-center mb-16 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
            Відгуки
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
            Що кажуть наші клієнти
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
            Понад 500 компаній довіряють нам свої квіткові потреби
          </p>
        </div>

        {/* Testimonial Card */}
        <div
          className={cn(
            'max-w-4xl mx-auto transition-all duration-700 delay-200',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="relative bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100">
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
              <Quote className="w-12 h-12 text-emerald-100" />
            </div>

            {/* Content */}
            <div className="relative">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl sm:text-2xl text-slate-700 leading-relaxed mb-8">
                "{currentTestimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full bg-slate-200 overflow-hidden">
                  {currentTestimonial.image ? (
                    <Image
                      src={currentTestimonial.image}
                      alt={currentTestimonial.author}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xl font-bold">
                      {currentTestimonial.author[0]}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {currentTestimonial.author}
                  </p>
                  <p className="text-sm text-slate-500">
                    {currentTestimonial.role}, {currentTestimonial.company}
                  </p>
                  <p className="text-xs text-emerald-600">
                    Клієнт з {currentTestimonial.clientSince} року
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-8 right-8 flex items-center gap-2">
              <button
                onClick={goToPrev}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                aria-label="Попередній відгук"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={goToNext}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                aria-label="Наступний відгук"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    index === currentIndex
                      ? 'bg-emerald-600 w-6'
                      : 'bg-slate-300 hover:bg-slate-400'
                  )}
                  aria-label={`Перейти до відгуку ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Certificates */}
        <div
          className={cn(
            'mt-16 transition-all duration-700 delay-400',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <h3 className="text-center text-lg font-semibold text-slate-900 mb-8">
            Сертифікати та документи
          </h3>
          <div className="flex flex-wrap justify-center gap-8">
            {certificates.map((cert) => (
              <div
                key={cert.name}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  {cert.image ? (
                    <Image
                      src={cert.image}
                      alt={cert.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-2xl">📜</span>
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {cert.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
