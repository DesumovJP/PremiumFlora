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
      {/* Global background */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          overscrollBehavior: 'none',
          overscrollBehaviorY: 'none',
          touchAction: 'none'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#0d1117]" />
        <div className="absolute inset-0 bg-[url('/bg.webp')] bg-cover bg-center bg-fixed opacity-[0.02] dark:opacity-[0.01]" />
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
