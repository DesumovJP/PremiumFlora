'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function StickyCTA() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show on admin pages
  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    // Don't set up timer on admin pages
    if (isAdminPage) return;

    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem('sticky-cta-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show after 15 seconds on the site
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [isDismissed, isAdminPage]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem('sticky-cta-dismissed', 'true');
  };

  // Don't render on admin pages or if not visible
  if (isAdminPage || !isVisible || isDismissed) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4',
        'transform transition-all duration-500 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto max-w-lg sm:max-w-2xl">
        {/* Premium card with subtle gradient border */}
        <div className="relative rounded-2xl bg-gradient-to-r from-emerald-400/60 via-teal-400/60 to-emerald-400/60 p-0.5 shadow-2xl shadow-slate-900/10">
          <div className="relative bg-white rounded-[14px] px-4 py-4 sm:px-5 sm:py-3.5">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2.5 right-2.5 sm:top-1/2 sm:-translate-y-1/2 sm:right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
              aria-label="Закрити"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content - stacked on mobile, horizontal on desktop */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pr-8">
              {/* Text content */}
              <div className="pr-6 sm:pr-0">
                <div className="flex items-center gap-1.5 mb-1 sm:mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">
                    Оптова пропозиція
                  </span>
                </div>
                <h3 className="text-base sm:text-[15px] font-semibold text-slate-900 leading-snug">
                  Готові до співпраці?
                </h3>
                <p className="text-sm sm:text-[13px] text-slate-500 mt-0.5 sm:mt-0">
                  Персональна пропозиція за 24 години
                </p>
              </div>

              {/* CTA Button - full width on mobile, auto on desktop */}
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white h-11 sm:h-10 px-5 rounded-xl font-medium shadow-lg shadow-emerald-500/25 transition-all duration-200 flex-shrink-0"
              >
                <a href="tel:+380441234567" className="gap-2">
                  <Phone className="w-4 h-4" />
                  Зателефонувати
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
