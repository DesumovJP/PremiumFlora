"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Leaf, Phone, ChevronRight, MapPin, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

// Navigation link for mobile drawer
function MobileNavLink({
  href,
  label,
  isActive,
  onClick,
  index
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-between",
        "px-2 py-4",
        "transition-all duration-300 ease-out",
        // Animation delay based on index
        "opacity-0 translate-x-4 animate-[slideInNav_0.4s_ease-out_forwards]",
      )}
      style={{ animationDelay: `${100 + index * 60}ms` }}
    >
      {/* Active indicator */}
      <div className={cn(
        "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-full",
        "transition-all duration-300",
        isActive
          ? "bg-emerald-500 opacity-100"
          : "bg-transparent opacity-0 group-hover:bg-slate-200 group-hover:opacity-100"
      )} />

      <span className={cn(
        "text-[17px] font-medium tracking-[-0.01em] pl-4",
        "transition-colors duration-200",
        isActive
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
      )}>
        {label}
      </span>

      <ChevronRight className={cn(
        "h-4 w-4 transition-all duration-200",
        isActive
          ? "text-emerald-500 opacity-100"
          : "text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
      )} />
    </Link>
  );
}

// Contact button for mobile drawer
function MobileContactButton({
  href,
  icon: Icon,
  iconComponent: IconComponent,
  label,
  sublabel,
  variant,
  index,
}: {
  href: string;
  icon?: typeof Phone;
  iconComponent?: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
  variant: "emerald" | "purple" | "sky";
  index: number;
}) {
  const variantStyles = {
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      icon: "text-emerald-600 dark:text-emerald-400",
      hover: "hover:bg-emerald-100 dark:hover:bg-emerald-500/20",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-500/10",
      icon: "text-purple-600 dark:text-purple-400",
      hover: "hover:bg-purple-100 dark:hover:bg-purple-500/20",
    },
    sky: {
      bg: "bg-sky-50 dark:bg-sky-500/10",
      icon: "text-sky-600 dark:text-sky-400",
      hover: "hover:bg-sky-100 dark:hover:bg-sky-500/20",
    },
  };

  const styles = variantStyles[variant];

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={cn(
        "flex items-center gap-3.5 rounded-2xl p-3",
        "transition-all duration-200 ease-out",
        styles.bg,
        styles.hover,
        "active:scale-[0.98]",
        // Staggered animation
        "opacity-0 translate-y-2 animate-[slideUpFade_0.4s_ease-out_forwards]",
      )}
      style={{ animationDelay: `${300 + index * 50}ms` }}
    >
      <div className={cn(
        "flex h-11 w-11 items-center justify-center rounded-xl",
        "bg-white dark:bg-white/10",
        "shadow-sm"
      )}>
        {Icon && <Icon className={cn("h-5 w-5", styles.icon)} strokeWidth={1.5} />}
        {IconComponent && <IconComponent className={cn("h-5 w-5", styles.icon)} />}
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-medium text-slate-800 dark:text-white">
          {label}
        </span>
        {sublabel && (
          <span className="text-[13px] text-slate-500 dark:text-slate-400">
            {sublabel}
          </span>
        )}
      </div>
    </a>
  );
}

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Головна" },
    { href: "/catalog", label: "Каталог" },
    { href: "/blog", label: "Блог" },
    { href: "/about", label: "Про нас" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200/80">
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
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-150",
                isActive(link.href)
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                  : "text-slate-700 dark:text-admin-text-secondary hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400"
              )}
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
            <button
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                "bg-slate-100/80 dark:bg-white/10",
                "text-slate-700 dark:text-white",
                "transition-all duration-200",
                "hover:bg-slate-200/90 dark:hover:bg-white/20",
                "active:scale-95",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              )}
              aria-label="Відкрити меню"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="p-0 border-0">
            <SheetTitle className="sr-only">Навігаційне меню</SheetTitle>

            <div className="flex h-full flex-col">
              {/* Header with Logo */}
              <div className="flex items-center gap-3 px-6 pt-6 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Leaf className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                    Premium Flora
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">
                    Оптовий магазин
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 h-px bg-gradient-to-r from-slate-200 via-slate-200 to-transparent dark:from-white/10 dark:via-white/10" />

              {/* Navigation Links */}
              <nav className="flex flex-col px-6 py-6">
                {navLinks.map((link, index) => (
                  <MobileNavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    isActive={isActive(link.href)}
                    onClick={() => setMobileMenuOpen(false)}
                    index={index}
                  />
                ))}
              </nav>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Contact Section */}
              <div className="border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-6 py-6">
                {/* Section header */}
                <div className="flex items-center gap-2 mb-4 opacity-0 animate-[slideUpFade_0.4s_ease-out_forwards]" style={{ animationDelay: "250ms" }}>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Зв'яжіться з нами
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-white/10" />
                </div>

                {/* Contact buttons */}
                <div className="space-y-2.5">
                  {/* Phone */}
                  <MobileContactButton
                    href={contacts.phones[0].href}
                    icon={Phone}
                    label="Зателефонувати"
                    sublabel={contacts.phones[0].number}
                    variant="emerald"
                    index={0}
                  />

                  {/* Viber */}
                  <MobileContactButton
                    href={contacts.viber.href}
                    iconComponent={ViberIcon}
                    label="Viber"
                    sublabel="Написати в месенджер"
                    variant="purple"
                    index={1}
                  />

                  {/* Telegram */}
                  <MobileContactButton
                    href={contacts.telegram.href}
                    iconComponent={TelegramIcon}
                    label="Telegram"
                    sublabel={contacts.telegram.username}
                    variant="sky"
                    index={2}
                  />
                </div>

                {/* Work hours */}
                <div
                  className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-slate-200/60 dark:border-white/5 opacity-0 animate-[slideUpFade_0.4s_ease-out_forwards]"
                  style={{ animationDelay: "500ms" }}
                >
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[13px] text-slate-500 dark:text-slate-400">
                    {contacts.workHours}
                  </span>
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

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes slideInNav {
          from {
            opacity: 0;
            transform: translateX(16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}
