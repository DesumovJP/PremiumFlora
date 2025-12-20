'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'Всі' },
  { id: 'ordering', label: 'Замовлення' },
  { id: 'delivery', label: 'Доставка' },
  { id: 'payment', label: 'Оплата' },
  { id: 'returns', label: 'Повернення' },
  { id: 'seasonality', label: 'Сезонність' },
];

const faqs = [
  {
    category: 'ordering',
    question: 'Який мінімальний обсяг замовлення?',
    answer:
      'Мінімальне замовлення від 50 одиниць одного виду. Для постійних клієнтів можливі індивідуальні умови та зниження MOQ.',
  },
  {
    category: 'delivery',
    question: 'Як відбувається доставка в регіони?',
    answer:
      'Доставка здійснюється власним рефрижераторним транспортом. Київ — 4-6 годин, область — 12-24 години, вся Україна — 24-48 годин. Температурний режим -20°C підтримується весь шлях.',
  },
  {
    category: 'ordering',
    question: 'Чи можна замовити нестандартні сорти?',
    answer:
      'Так, ми працюємо з індивідуальними замовленнями. Зв\'яжіться з менеджером, і ми підберемо потрібні сорти з наших партнерських плантацій в Нідерландах, Еквадорі та Кенії.',
  },
  {
    category: 'returns',
    question: 'Яка гарантія на свіжість квітів?',
    answer:
      'Гарантуємо свіжість 7+ днів з моменту доставки при правильному зберіганні. Якщо якість не відповідає стандартам — безкоштовна заміна або повернення коштів.',
  },
  {
    category: 'payment',
    question: 'Які способи оплати доступні?',
    answer:
      'Приймаємо безготівковий розрахунок (з ПДВ та без), оплату картою, готівку при доставці. Для постійних клієнтів доступна кредитна лінія до 30 днів.',
  },
  {
    category: 'seasonality',
    question: 'Як змінюються ціни в сезон свят?',
    answer:
      'Ціни можуть коригуватися в період високого попиту (14 лютого, 8 березня). Рекомендуємо бронювати заздалегідь — за 2-3 тижні до свята для фіксації ціни.',
  },
  {
    category: 'delivery',
    question: 'Чи доставляєте в інші країни?',
    answer:
      'Наразі працюємо тільки по території України. Міжнародна доставка планується у 2025 році.',
  },
  {
    category: 'ordering',
    question: 'Як оформити перше замовлення?',
    answer:
      'Заповніть форму на сайті або зателефонуйте нам. Менеджер зв\'яжеться протягом години, обговорить деталі та надішле комерційну пропозицію.',
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border overflow-hidden transition-all duration-200',
        isOpen ? 'border-emerald-200 shadow-lg' : 'border-slate-200 shadow-sm'
      )}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-5 text-left font-semibold text-slate-900 hover:text-emerald-600 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="pr-4">{question}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 flex-shrink-0 text-slate-400 transition-transform duration-300',
            isOpen && 'rotate-180 text-emerald-600'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <div className="px-5 pb-5 text-slate-600 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section ref={ref} id="faq" className="py-20 sm:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div
          className={cn(
            'text-center mb-12 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Часті питання
          </h2>
          <p className="text-lg text-slate-600">
            Відповіді на популярні питання про співпрацю
          </p>
        </div>

        {/* Search */}
        <div
          className={cn(
            'relative mb-6 transition-all duration-700 delay-100',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Пошук по питаннях..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/50 transition-all outline-none"
          />
        </div>

        {/* Categories */}
        <div
          className={cn(
            'flex flex-wrap gap-2 mb-8 transition-all duration-700 delay-200',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setOpenIndex(null);
              }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                activeCategory === category.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div
              key={faq.question}
              className={cn(
                'transition-all duration-500',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{
                transitionDelay: isVisible ? `${300 + index * 50}ms` : '0ms',
              }}
            >
              <FAQItem
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <p className="text-center text-slate-500 py-8">
            Питань не знайдено. Спробуйте інший пошук.
          </p>
        )}

        {/* Contact CTA */}
        <div
          className={cn(
            'text-center mt-12 transition-all duration-700 delay-500',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <p className="text-slate-600 mb-4">Не знайшли відповідь?</p>
          <a
            href="#contact-form"
            className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
          >
            Напишіть нам
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
