"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/client/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { CtaSection } from "@/components/client/cta-section";
import { Search, X, Grid3x3, List, Package, Truck, Sparkles, ArrowUpDown, Phone } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

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

type ViewMode = "grid" | "list";

interface CatalogClientProps {
  products: Product[];
}

export function CatalogClient({ products }: CatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const openContactModal = () => setContactModalOpen(true);

  const filteredProducts = useMemo(() => {
    let filtered: Product[] = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      const aMinPrice = Math.min(...a.variants.map((v) => v.price));
      const bMinPrice = Math.min(...b.variants.map((v) => v.price));
      return sortBy === "price-asc" ? aMinPrice - bMinPrice : bMinPrice - aMinPrice;
    });

    return filtered;
  }, [products, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("name");
  };

  const hasActiveFilters =
    !!searchQuery || sortBy !== "name";

  return (
    <main className="min-h-screen pt-16 lg:pt-20">
      {/* Hero Header - Compact Premium Design */}
      <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 -z-10">
          <div className="h-full w-full bg-[url('https://mymediastorage.fra1.digitaloceanspaces.com/premiumFlora/2147760920_14fa35030d.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/60" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-12">
            {/* Left: Title & Description */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-slate-900 mb-2 sm:mb-3">
                Каталог{' '}
                <span className="relative inline-block">
                  <span className="text-emerald-600">квітів</span>
                  <svg className="absolute -bottom-1 left-0 w-full h-2 text-emerald-300/50" viewBox="0 0 200 8" preserveAspectRatio="none">
                    <path d="M0 6c40-3 80-3 120-1.5s80 3 80 0" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
                Широкий вибір свіжих квітів для вашого бізнесу — від класичних троянд до екзотичних орхідей
              </p>
            </div>

            {/* Right: Feature badges */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:flex lg:gap-3">
              {[
                { icon: Package, title: 'Від 50 шт', desc: 'Мін. замовлення', color: 'emerald' },
                { icon: Truck, title: 'Щоп\'ятниці', desc: 'Свіжа поставка', color: 'cyan' },
                { icon: Sparkles, title: '7+ днів', desc: 'Гарантія свіжості', color: 'amber' },
              ].map((f) => (
                <div
                  key={f.title}
                  className={cn(
                    "flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5 px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl",
                    "bg-white border border-slate-100",
                    "transition-colors duration-150 hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg flex items-center justify-center",
                    f.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                    f.color === 'cyan' && "bg-cyan-50 text-cyan-600",
                    f.color === 'amber' && "bg-amber-50 text-amber-600",
                  )}>
                    <f.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 text-center sm:text-left">
                    <div className="font-semibold text-slate-900 text-[0.625rem] sm:text-sm leading-tight">{f.title}</div>
                    <div className="text-[0.5625rem] sm:text-[0.6875rem] text-slate-500 leading-tight hidden sm:block">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </section>

      {/* Search and Filters - Premium Sticky Bar */}
      <section className="sticky top-0 z-40 border-b border-slate-200 bg-white py-3 sm:py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Mobile: Single row with search, sort, view toggle */}
          <div className="flex items-center gap-2 sm:hidden">
            {/* Search - compact */}
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Пошук..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 pr-8 text-sm bg-slate-50/80 border-slate-200/60 rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  aria-label="Очистити пошук"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort - compact dropdown */}
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as typeof sortBy)}
            >
              <SelectTrigger className="h-10 w-auto min-w-[100px] max-w-[120px] text-xs bg-slate-50/80 border-slate-200/60 rounded-xl hover:bg-white hover:border-slate-300 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 px-2.5">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">
                    {sortBy === "name" ? "Назва" : sortBy === "price-asc" ? "Ціна ↑" : "Ціна ↓"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg bg-white min-w-[160px]">
                <SelectItem value="name" className="rounded-lg cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 text-sm">
                  За назвою
                </SelectItem>
                <SelectItem value="price-asc" className="rounded-lg cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 text-sm">
                  Ціна: від низької
                </SelectItem>
                <SelectItem value="price-desc" className="rounded-lg cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 text-sm">
                  Ціна: від високої
                </SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle - compact */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100/80 flex-shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  viewMode === "grid"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
                aria-label="Сітка"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  viewMode === "list"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
                aria-label="Список"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Desktop: Two-column layout */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            {/* Search Bar */}
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Пошук квітів..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-11 pr-10 text-sm bg-slate-50/80 border-slate-200/60 rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  aria-label="Очистити пошук"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort and View */}
            <div className="flex items-center gap-3">
              {/* Sort Select */}
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as typeof sortBy)}
              >
                <SelectTrigger className="h-11 w-[12.5rem] text-sm bg-slate-50/80 border-slate-200/60 rounded-xl hover:bg-white hover:border-slate-300 focus:ring-2 focus:ring-emerald-100 transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Сортування" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-lg bg-white">
                  <SelectItem value="name" className="rounded-lg cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                    За назвою
                  </SelectItem>
                  <SelectItem value="price-asc" className="rounded-lg cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                    Ціна: від низької
                  </SelectItem>
                  <SelectItem value="price-desc" className="rounded-lg cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                    Ціна: від високої
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === "grid"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                  aria-label="Сітка"
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === "list"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                  aria-label="Список"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-11 px-4 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Скинути
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-6 sm:py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                Знайдено: <span className="font-semibold text-slate-900">{filteredProducts.length}</span> товарів
              </span>
              {hasActiveFilters && (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60">
                  Фільтри активні
                </Badge>
              )}
            </div>
          </div>

          {/* Products Grid/List */}
          {filteredProducts.length > 0 ? (
            <div className={cn(
              "grid gap-3 sm:gap-5",
              viewMode === "grid"
                ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr"
                : "grid-cols-1 lg:grid-cols-2 auto-rows-fr"
            )}>
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up-premium"
                  style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                >
                  <ProductCard product={product} variant={viewMode} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
              <CardContent className="py-20 text-center">
                <div className="mx-auto max-w-md">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">
                    Товари не знайдено
                  </h3>
                  <p className="mb-6 text-sm text-slate-600">
                    Спробуйте змінити параметри пошуку або фільтри
                  </p>
                  {hasActiveFilters && (
                    <Button variant="default" onClick={clearFilters} size="lg" className="rounded-xl">
                      <X className="mr-2 h-4 w-4" />
                      Очистити фільтри
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <CtaSection variant="catalog" onContactClick={openContactModal} />

      {/* Contact Modal */}
      <Modal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        title="Зв'яжіться з нами"
        size="sm"
      >
        <ContactModalContent onClose={() => setContactModalOpen(false)} />
      </Modal>
    </main>
  );
}
