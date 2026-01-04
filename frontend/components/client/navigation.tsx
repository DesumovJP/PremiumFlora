"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Leaf, Phone, ChevronRight, MapPin, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ContactModalContent } from "./contact-modal-content";

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
        "opacity-0 translate-x-4 animate-[slideInNav_0.3s_ease-out_forwards]",
      )}
      style={{ animationDelay: `${50 + index * 40}ms` }}
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
        "text-[14px] font-medium tracking-[-0.01em] pl-4",
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

// Contact button for mobile drawer - soft neumorphic style
function MobileContactButton({
  href,
  icon: Icon,
  iconComponent: IconComponent,
  label,
  sublabel,
  index,
  className,
}: {
  href: string;
  icon?: typeof Phone;
  iconComponent?: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
  index: number;
  className?: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl p-3",
        "bg-[#faf8f5] transition-all duration-200",
        "hover:-translate-y-0.5 active:translate-y-0",
        // Staggered animation
        "opacity-0 translate-y-2 animate-[slideUpFade_0.3s_ease-out_forwards]",
        className,
      )}
      style={{
        animationDelay: `${180 + index * 40}ms`,
        boxShadow: '2px 2px 6px rgba(200, 190, 175, 0.15), -2px -2px 6px rgba(255, 255, 255, 0.5)',
      }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f8f6f3]"
        style={{
          boxShadow: 'inset 1px 1px 2px rgba(200, 190, 175, 0.1), inset -1px -1px 2px rgba(255, 255, 255, 0.3)',
        }}
      >
        {Icon && <Icon className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />}
        {IconComponent && <IconComponent className="h-4 w-4 text-emerald-600" />}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-slate-700">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] text-slate-500">
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
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
                  <span className="text-[14px] font-semibold tracking-tight text-slate-900 dark:text-white">
                    Premium Flora
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">
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
                <div className="flex items-center gap-2 mb-3 opacity-0 animate-[slideUpFade_0.3s_ease-out_forwards]" style={{ animationDelay: "150ms" }}>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Зв'яжіться з нами
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-white/10" />
                </div>

                {/* Contact buttons */}
                <div className="space-y-2">
                  {/* Phone */}
                  <MobileContactButton
                    href={contacts.phones[0].href}
                    icon={Phone}
                    label="Зателефонувати"
                    sublabel={contacts.phones[0].number}
                    index={0}
                  />

                  {/* Viber */}
                  <MobileContactButton
                    href={contacts.viber.href}
                    iconComponent={ViberIcon}
                    label="Viber"
                    sublabel="Написати в месенджер"
                    index={1}
                  />

                  {/* Telegram */}
                  <MobileContactButton
                    href={contacts.telegram.href}
                    iconComponent={TelegramIcon}
                    label="Telegram"
                    sublabel={contacts.telegram.username}
                    index={2}
                  />
                </div>

                {/* Work hours */}
                <div
                  className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-slate-200/60 dark:border-white/5 opacity-0 animate-[slideUpFade_0.3s_ease-out_forwards]"
                  style={{ animationDelay: "320ms" }}
                >
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
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
