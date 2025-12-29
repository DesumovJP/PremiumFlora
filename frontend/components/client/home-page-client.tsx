'use client';

import { useState } from 'react';
import { HeroSectionPremium } from './hero-section-premium';
import { ValueStackingSection } from './value-stacking';
import { FeaturedProducts } from './featured-products';
import { BlogSection } from './blog-section';
import { CtaSection } from './cta-section';
import { Modal } from '@/components/ui/modal';
import { Phone } from 'lucide-react';
import { Product, BlogPost } from '@/lib/types';

// Viber icon component - clean phone icon
function ViberIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

// Telegram icon component
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

// Contact Modal Content - Notion-style minimal design
function ContactModalContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="space-y-6">
      {/* Primary CTA - Phone */}
      <a
        href="tel:+380671234567"
        onClick={onClose}
        className="group flex items-center gap-4 p-4 -mx-1 rounded-xl transition-colors hover:bg-slate-50"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
          <Phone className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-slate-900">Зателефонувати</div>
          <div className="text-sm text-slate-500">+380 67 123 4567</div>
        </div>
        <div className="ml-auto text-slate-300 group-hover:text-slate-400 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </a>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* Secondary options */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-slate-400 mb-2">Месенджери</div>

        {/* Telegram */}
        <a
          href="https://t.me/premiumflora"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="group flex items-center gap-3 p-3 -mx-1 rounded-lg transition-colors hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#229ED9] text-white shrink-0">
            <TelegramIcon className="h-4 w-4" />
          </div>
          <div className="text-sm font-medium text-slate-700">Telegram</div>
          <div className="ml-auto text-xs text-slate-400">@premiumflora</div>
        </a>

        {/* Viber */}
        <a
          href="viber://chat?number=%2B380671234567"
          onClick={onClose}
          className="group flex items-center gap-3 p-3 -mx-1 rounded-lg transition-colors hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7360F2] text-white shrink-0">
            <ViberIcon className="h-4 w-4" />
          </div>
          <div className="text-sm font-medium text-slate-700">Viber</div>
          <div className="ml-auto text-xs text-slate-400">+380 67 123 4567</div>
        </a>
      </div>

      {/* Footer - Work hours */}
      <div className="pt-2 text-center text-xs text-slate-400">
        Пн-Нд: 9:00-18:00
      </div>
    </div>
  );
}

interface HomePageClientProps {
  products: Product[];
  posts: BlogPost[];
}

export function HomePageClient({ products, posts }: HomePageClientProps) {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const openContactModal = () => setContactModalOpen(true);

  return (
    <div className="relative">
      {/* Global background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white" />
        <div className="absolute inset-0 bg-[url('/bg.webp')] bg-cover bg-center bg-fixed opacity-[0.02]" />
      </div>

      {/* Hero з value proposition */}
      <HeroSectionPremium onContactClick={openContactModal} />

      {/* Чому обирають нас */}
      <ValueStackingSection />

      {/* Каталог товарів */}
      <FeaturedProducts products={products} />

      {/* Блог */}
      <BlogSection posts={posts} />

      {/* CTA */}
      <CtaSection onContactClick={openContactModal} />

      {/* Contact Modal */}
      <Modal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        title="Зв'яжіться з нами"
        description="Оберіть зручний спосіб зв'язку"
        size="sm"
      >
        <ContactModalContent onClose={() => setContactModalOpen(false)} />
      </Modal>
    </div>
  );
}
