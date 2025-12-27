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

// Viber icon component
function ViberIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.4 0C9.473.028 5.333.344 3.027 2.467 1.2 4.24.535 6.867.472 10.093c-.063 3.227-.144 9.28 5.68 10.947v2.507s-.04.987.616 1.187c.793.24 1.253-.508 2.013-1.32.413-.453.987-1.12 1.413-1.627 3.893.333 6.88-.413 7.227-.533.8-.267 5.32-.84 6.053-6.84.76-6.2-.36-10.12-2.36-11.88C19.027.48 12.56-.012 11.4 0zm.4 2.08c4.147.04 7.36.88 8.907 2.293 1.573 1.44 2.28 4.28 1.64 9.347-.56 4.653-3.813 5.213-4.48 5.44-.28.093-2.88.733-6.12.52 0 0-2.427 2.933-3.187 3.707-.12.12-.253.16-.347.147-.133-.027-.173-.173-.173-.387l.027-4.04c-4.68-1.347-4.413-6.147-4.36-8.813.053-2.667.56-4.84 2.053-6.307C7.16 2.627 10.32 2.08 11.8 2.08zM11.52 4.6a.4.4 0 00-.28.12.4.4 0 000 .56c1.653 1.667 2.56 3.373 2.56 5.32a.4.4 0 00.8 0c0-2.173-1.013-4.067-2.8-5.88a.4.4 0 00-.28-.12zm-3.4.493c-.16-.013-.36.053-.56.16l-.04.027c-.373.24-.72.533-1 .84a1.88 1.88 0 00-.507.907c-.013.053-.02.107-.02.16-.027.36.04.747.173 1.133.347 1.013 1.08 2.267 2.253 3.573l.013.013.013.013.013.014.014.013c1.307 1.173 2.56 1.907 3.573 2.253.387.133.773.2 1.133.173.053 0 .107-.006.16-.02a1.88 1.88 0 00.907-.506c.307-.28.6-.627.84-1l.027-.04c.213-.4.24-.787.067-1.053a1.8 1.8 0 00-.16-.187l-1.52-1.52c-.307-.307-.747-.347-1.04-.107l-.76.627c-.107.08-.253.067-.347-.013L9.76 9.227c-.027-.013-.04-.04-.067-.067l-.36-.36-.36-.36c-.027-.027-.053-.04-.067-.067l-1.36-1.24c-.08-.093-.093-.24-.013-.347l.627-.76c.24-.293.2-.733-.107-1.04L6.56 5.08l-.187-.16c-.133-.093-.293-.147-.48-.16a.63.63 0 00-.173-.013v-.053zm3.72.627a.4.4 0 00-.107.027.4.4 0 00-.24.52c.24.627.6 1.2 1.08 1.693a4.69 4.69 0 001.693 1.08.4.4 0 00.28-.747 3.95 3.95 0 01-1.4-.893 3.95 3.95 0 01-.893-1.4.4.4 0 00-.413-.28zm-1.413.733a.4.4 0 00-.08.014.4.4 0 00-.28.493c.387 1.36 1.28 2.533 2.52 3.28a.4.4 0 00.413-.68c-1.053-.64-1.827-1.64-2.16-2.813a.4.4 0 00-.413-.294z"/>
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

// Contact data
const contacts = {
  phones: [
    { number: "+380 67 123 4567", href: "tel:+380671234567" },
    { number: "+380 50 123 4567", href: "tel:+380501234567" },
  ],
  viber: { number: "+380 67 123 4567", href: "viber://chat?number=%2B380671234567" },
  telegram: { username: "@premiumflora", href: "https://t.me/premiumflora" },
  workHours: "Пн-Нд: 9:00-18:00",
};

// Contact Modal Content
function ContactModalContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="space-y-4">
      {/* Phones */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Телефони
        </div>
        <div className="space-y-2">
          {contacts.phones.map((phone, index) => (
            <a
              key={index}
              href={phone.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Phone className="h-5 w-5" />
              </div>
              <span>{phone.number}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Messengers - 50% width each */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Месенджери
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* Viber */}
          <a
            href={contacts.viber.href}
            onClick={onClose}
            className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <ViberIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-semibold">Viber</span>
              <span className="text-xs text-slate-500">{contacts.viber.number}</span>
            </div>
          </a>

          {/* Telegram */}
          <a
            href={contacts.telegram.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-sky-50 hover:text-sky-700 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <TelegramIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-semibold">Telegram</span>
              <span className="text-xs text-slate-500">{contacts.telegram.username}</span>
            </div>
          </a>
        </div>
      </div>

      {/* Work hours */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-center">
        <div className="text-xs font-medium text-slate-500">Графік роботи</div>
        <div className="text-sm font-semibold text-slate-700">{contacts.workHours}</div>
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
        size="sm"
      >
        <ContactModalContent onClose={() => setContactModalOpen(false)} />
      </Modal>
    </div>
  );
}
