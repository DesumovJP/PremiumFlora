"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Leaf, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Button asChild size="sm" className="font-semibold shadow-md">
            <Link href="/about#contact">Зв'язатися</Link>
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
                  <a
                    href="tel:+380671234567"
                    className="flex items-center gap-3 rounded-xl bg-white dark:bg-admin-surface px-3.5 py-3 text-sm font-medium text-slate-700 dark:text-admin-text-secondary shadow-sm transition-all duration-200 hover:shadow-md hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                      <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span>+380 67 123 4567</span>
                  </a>
                  <a
                    href="tel:+380501234567"
                    className="flex items-center gap-3 rounded-xl bg-white dark:bg-admin-surface px-3.5 py-3 text-sm font-medium text-slate-700 dark:text-admin-text-secondary shadow-sm transition-all duration-200 hover:shadow-md hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                      <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span>+380 50 123 4567</span>
                  </a>
                  <Button
                    asChild
                    className="mt-3 w-full justify-center font-semibold shadow-md"
                    size="lg"
                  >
                    <Link href="/about#contact" onClick={() => setMobileMenuOpen(false)}>
                      Зв'язатися з нами
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}



