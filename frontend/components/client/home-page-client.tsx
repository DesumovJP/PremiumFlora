'use client';

import { useState } from 'react';
import { HeroSectionPremium } from './hero-section-premium';
import { ValueStackingSection } from './value-stacking';
import { FeaturedProducts } from './featured-products';
import { BlogSection } from './blog-section';
import { CtaSection } from './cta-section';
import { ContactModalContent } from './contact-modal-content';
import { Modal } from '@/components/ui/modal';
import { Product, BlogPost } from '@/lib/types';

interface HomePageClientProps {
  products: Product[];
  posts: BlogPost[];
}

export function HomePageClient({ products, posts }: HomePageClientProps) {
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const openContactModal = () => setContactModalOpen(true);

  return (
    <div className="relative">
      {/* Global background - GPU composited for Telegram/in-app browsers */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          overscrollBehavior: 'none',
          overscrollBehaviorY: 'none',
          touchAction: 'none',
          // GPU compositing - prevents jitter in Telegram
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          // Isolate from scroll container
          contain: 'strict',
          willChange: 'transform',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#0d1117]" />
        {/* Removed bg-fixed - causes issues in in-app browsers */}
        <div className="absolute inset-0 bg-[url('/bg.webp')] bg-cover bg-center opacity-[0.02] dark:opacity-[0.01]" />
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
        size="sm"
      >
        <ContactModalContent onClose={() => setContactModalOpen(false)} />
      </Modal>
    </div>
  );
}
