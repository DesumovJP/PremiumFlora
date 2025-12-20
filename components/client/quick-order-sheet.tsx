'use client';

import { useState, useEffect } from 'react';
import { X, Send, Phone, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickOrderSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickOrderSheet({ isOpen, onClose }: QuickOrderSheetProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setFormData({ name: '', phone: '', company: '' });
    onClose();

    // TODO: Show success toast
    alert('Дякуємо! Ми зв\'яжемося з вами протягом 24 годин.');
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (clientY: number, startY: number) => {
    const diff = clientY - startY;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm',
          'animate-fade-in'
        )}
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white rounded-t-3xl shadow-2xl',
          'max-h-[90vh] max-h-[90dvh]',
          'animate-slide-in-up',
          isDragging && 'transition-none'
        )}
        style={{
          transform: `translateY(${dragY}px)`,
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={(e) => {
            handleDragStart();
            const startY = e.clientY;

            const handlePointerMove = (moveEvent: PointerEvent) => {
              handleDrag(moveEvent.clientY, startY);
            };

            const handlePointerUp = () => {
              handleDragEnd();
              document.removeEventListener('pointermove', handlePointerMove);
              document.removeEventListener('pointerup', handlePointerUp);
            };

            document.addEventListener('pointermove', handlePointerMove);
            document.addEventListener('pointerup', handlePointerUp);
          }}
        >
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            Швидке замовлення
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Закрити"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Ваше ім'я *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/50 transition-all outline-none"
                placeholder="Олена Коваленко"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Телефон *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/50 transition-all outline-none"
                placeholder="+380 (XX) XXX-XX-XX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Компанія (опційно)
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/50 transition-all outline-none"
                placeholder="Назва компанії"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Надсилаємо...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Отримати пропозицію
              </span>
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center mt-4">
            Натискаючи кнопку, ви погоджуєтесь з{' '}
            <a href="/privacy" className="text-emerald-600 hover:underline">
              політикою конфіденційності
            </a>
          </p>
        </form>

        {/* Safe area spacer for iOS */}
        <div
          className="h-0"
          style={{ height: 'env(safe-area-inset-bottom)' }}
        />
      </div>
    </>
  );
}
