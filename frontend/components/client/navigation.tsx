"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Leaf, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

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

      {/* Messengers */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Месенджери
        </div>
        <div className="space-y-2">
          {/* Viber */}
          <a
            href={contacts.viber.href}
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <ViberIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span>Viber</span>
              <span className="text-xs text-slate-500">{contacts.viber.number}</span>
            </div>
          </a>

          {/* Telegram */}
          <a
            href={contacts.telegram.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-sky-50 hover:text-sky-700 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <TelegramIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span>Telegram</span>
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

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Головна" },
    { href: "/catalog", label: "Каталог" },
    { href: "/blog", label: "Блог" },
    { href: "/about", label: "Про нас" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <Leaf className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex flex-col">
            <div className="text-base font-bold tracking-tight text-slate-900 dark:text-admin-text-primary sm:text-xl">
              Premium Flora
            </div>
            <div className="text-[0.625rem] font-medium uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400 sm:text-[0.6875rem]">
              Оптовий магазин квітів
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-admin-text-secondary transition-colors duration-150 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Contact Button Desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="hidden lg:block">
            <div className="flex flex-col gap-1 border-r border-slate-200 dark:border-admin-border pr-3">
              <a
                href="tel:+380671234567"
                className="text-xs font-medium text-slate-700 dark:text-admin-text-secondary transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                +380 67 123 4567
              </a>
              <a
                href="tel:+380501234567"
                className="text-xs font-medium text-slate-700 dark:text-admin-text-secondary transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                +380 50 123 4567
              </a>
              <div className="mt-1 text-[0.625rem] text-slate-500 dark:text-admin-text-muted">
                Пн-Нд: 9:00-18:00
              </div>
            </div>
          </div>

          {/* Contact Modal Trigger */}
          <Button size="sm" className="font-semibold shadow-md" onClick={() => setContactModalOpen(true)}>
            Зв'язатися
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Відкрити меню">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[20rem] sm:w-[23.75rem] border-l border-slate-200/60 dark:border-admin-border px-0 bg-white dark:bg-[#161b22]"
          >
            <SheetTitle className="sr-only">Навігаційне меню</SheetTitle>
            <div className="flex h-full flex-col">
              {/* Header / Title */}
              <div className="border-b border-slate-100 dark:border-admin-border px-4 py-4">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-admin-text-muted">
                  Навігація
                </span>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col gap-0.5 px-4 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-700 dark:text-admin-text-secondary transition-all duration-200 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 active:scale-[0.98]"
                  >
                    <span>{link.label}</span>
                    <span className="text-[0.625rem] uppercase tracking-[0.16em] text-slate-300">
                      ↵
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Contact Section */}
              <div className="mt-auto border-t border-slate-100 dark:border-admin-border bg-slate-50/80 dark:bg-admin-surface/80 px-4 py-5">
                <div className="mb-4 text-center text-[0.6875rem] font-semibold text-emerald-700 dark:text-emerald-400">
                  Свіжа поставка щоп'ятниці
                </div>
                <div className="mb-3 flex items-center justify-between text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-admin-text-muted">
                  <span>Контакти</span>
                  <span className="text-[0.625rem] font-semibold normal-case tracking-normal text-slate-600 dark:text-admin-text-tertiary">
                    Пн-Нд: 9:00-18:00
                  </span>
                </div>
                <div className="space-y-2">
                  {/* Phone buttons */}
                  {contacts.phones.map((phone, index) => (
                    <a
                      key={index}
                      href={phone.href}
                      className="flex items-center gap-3 rounded-xl bg-white dark:bg-admin-surface px-3.5 py-3 text-sm font-medium text-slate-700 dark:text-admin-text-secondary shadow-sm transition-all duration-200 hover:shadow-md hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                        <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span>{phone.number}</span>
                    </a>
                  ))}

                  {/* Viber */}
                  <a
                    href={contacts.viber.href}
                    className="flex items-center gap-3 rounded-xl bg-white dark:bg-admin-surface px-3.5 py-3 text-sm font-medium text-slate-700 dark:text-admin-text-secondary shadow-sm transition-all duration-200 hover:shadow-md hover:text-purple-600"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30">
                      <ViberIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span>Viber</span>
                  </a>

                  {/* Telegram */}
                  <a
                    href={contacts.telegram.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl bg-white dark:bg-admin-surface px-3.5 py-3 text-sm font-medium text-slate-700 dark:text-admin-text-secondary shadow-sm transition-all duration-200 hover:shadow-md hover:text-sky-600"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-900/30">
                      <TelegramIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>

      {/* Contact Modal */}
      <Modal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        title="Зв'яжіться з нами"
        size="sm"
      >
        <ContactModalContent onClose={() => setContactModalOpen(false)} />
      </Modal>
    </header>
  );
}
