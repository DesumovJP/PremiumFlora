'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, X } from 'lucide-react';
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
        'fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-0',
        'transform transition-transform duration-300 ease-out',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="mx-auto max-w-4xl">
        <div className="relative bg-white rounded-2xl sm:rounded-b-none shadow-xl border border-slate-200 p-4 sm:p-6">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Закрити"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pr-8 sm:pr-10">
            <div className="text-center sm:text-left sm:pr-4">
              <p className="text-base sm:text-lg font-semibold text-slate-900">
                Готові обговорити оптову співпрацю?
              </p>
              <p className="text-sm text-slate-600">
                Отримайте персональну пропозицію за 24 години
              </p>
            </div>

            <Button size="default" asChild className="w-auto">
              <a href="tel:+380441234567" className="gap-2">
                <Phone className="w-4 h-4" />
                Зателефонувати
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Safe area spacer for iOS */}
      <div
        className="h-0 sm:hidden"
        style={{ height: 'env(safe-area-inset-bottom)' }}
      />
    </div>
  );
}
