"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/client/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ContactModalContent } from "@/components/client/contact-modal-content";
import { CtaSection } from "@/components/client/cta-section";
import { Search, X, Grid3x3, List, ArrowUpDown, Package, Truck, Sparkles } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

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
      {/* Hero Header - White Neumorphic */}
      <section className="bg-white py-4 sm:py-5 lg:py-6 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
            {/* Left: Title */}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                Каталог <span className="text-emerald-600">квітів</span>
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Свіжі квіти преміальної якості для вашого бізнесу
              </p>
            </div>

            {/* Right: Feature badges - centered on mobile */}
            <div className="flex justify-center sm:justify-end gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
              {[
                { icon: Package, label: 'Від 50 шт', color: 'emerald' },
                { icon: Truck, label: 'Щоп\'ятниці', color: 'cyan' },
                { icon: Sparkles, label: '7+ днів', color: 'amber' },
              ].map((f) => (
                <div
                  key={f.label}
                  className={cn(
                    "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium",
                    "bg-slate-50 border border-slate-100",
                    "flex-1 sm:flex-initial max-w-[120px] sm:max-w-none",
                    f.color === 'emerald' && "text-emerald-600",
                    f.color === 'cyan' && "text-cyan-600",
                    f.color === 'amber' && "text-amber-600",
                  )}
                >
                  <f.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters - White Sticky Bar */}
      <section className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm py-3 sm:py-4 border-b border-slate-100">
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
