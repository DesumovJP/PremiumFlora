"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/client/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Grid3x3, List, Package, Truck, Calendar } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

interface CatalogClientProps {
  products: Product[];
}

export function CatalogClient({ products }: CatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [selectedVariety, setSelectedVariety] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const varieties = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.name))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let filtered: Product[] = products;

    // Variety filter
    if (selectedVariety !== "all") {
      filtered = filtered.filter((p) => p.name === selectedVariety);
    }

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
  }, [products, searchQuery, sortBy, selectedVariety]);

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("name");
    setSelectedVariety("all");
  };

  const hasActiveFilters =
    !!searchQuery || sortBy !== "name" || selectedVariety !== "all";

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-slate-100 py-8 sm:py-10">
        {/* Background image with softer blurred overlay */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="h-full w-full bg-[url('/bg.webp')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-white/70 backdrop-blur-md" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Title, Description, Badges */}
          <div className="space-y-4">
            <div className="space-y-2 max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Каталог квітів
              </h1>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-relaxed">
                Широкий вибір свіжих квітів для вашого бізнесу. Від класичних троянд до екзотичних орхідей
              </p>
            </div>

            {/* Badges Row */}
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <Badge
                tone="outline"
                className="flex items-center gap-1.5 rounded-full border-emerald-100 bg-emerald-50/80 px-3 py-1 text-[10px] font-medium text-emerald-800 shadow-sm sm:px-3.5 sm:py-1.5 sm:text-[11px]"
              >
                <Package className="h-3.5 w-3.5" />
                Мінімальне замовлення від 50 шт
              </Badge>
              <Badge
                tone="outline"
                className="flex items-center gap-1.5 rounded-full border-emerald-100 bg-emerald-50/80 px-3 py-1 text-[10px] font-medium text-emerald-800 shadow-sm sm:px-3.5 sm:py-1.5 sm:text-[11px]"
              >
                <Truck className="h-3.5 w-3.5" />
                Поставка свіжих квітів щопʼятниці
              </Badge>
              <Badge
                tone="outline"
                className="flex items-center gap-1.5 rounded-full border-emerald-100 bg-emerald-50/80 px-3 py-1 text-[10px] font-medium text-emerald-800 shadow-sm sm:px-3.5 sm:py-1.5 sm:text-[11px]"
              >
                <Calendar className="h-3.5 w-3.5" />
                Гарантована свіжість для флористів
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="sticky top-[88px] z-40 border-b border-slate-100 bg-white/95 backdrop-blur-sm py-2.5 sm:py-3.5 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 sm:px-4 sm:py-3">
            {/* Search, Variety, Sort and View in one row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Bar + mobile view toggle */}
              <div className="flex items-center gap-1.5">
                <div className="relative w-full sm:max-w-xl sm:flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Пошук за назвою"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 sm:h-11 pl-10 pr-10 text-sm sm:text-base border-slate-200 bg-white/80 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-0"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Очистити пошук"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* View Mode Toggle - mobile (right of search) */}
                <div className="flex items-center gap-1 rounded-2xl border border-slate-100 bg-white/80 p-1 shadow-sm sm:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "h-8 w-8 p-0 text-slate-500 hover:text-slate-900",
                      viewMode === "grid" && "bg-emerald-50 text-emerald-700 shadow-sm"
                    )}
                    aria-label="Сітка"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "h-8 w-8 p-0 text-slate-500 hover:text-slate-900",
                      viewMode === "list" && "bg-emerald-50 text-emerald-700 shadow-sm"
                    )}
                    aria-label="Список"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Variety, Sort and View */}
              <div className="flex flex-nowrap items-center gap-1.5 sm:gap-3 justify-between sm:justify-end w-full">
                {/* Sort */}
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as typeof sortBy)}
                >
                  <SelectTrigger className="h-10 sm:h-11 w-1/2 sm:w-[180px] text-sm">
                    <SelectValue placeholder="Сортування" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">За назвою</SelectItem>
                    <SelectItem value="price-asc">Ціна: від низької</SelectItem>
                    <SelectItem value="price-desc">Ціна: від високої</SelectItem>
                  </SelectContent>
                </Select>

                {/* Variety Select */}
                <Select
                  value={selectedVariety}
                  onValueChange={(v) => setSelectedVariety(v)}
                >
                  <SelectTrigger className="h-10 sm:h-11 w-1/2 sm:w-[190px] text-sm">
                    <SelectValue placeholder="Сорт квітів" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Усі сорти</SelectItem>
                    {varieties.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode Toggle - tablet/desktop */}
                <div className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "h-8 w-8 p-0 text-slate-500 hover:text-slate-900",
                      viewMode === "grid" && "bg-emerald-50 text-emerald-700 shadow-sm"
                    )}
                    aria-label="Сітка"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "h-8 w-8 p-0 text-slate-500 hover:text-slate-900",
                      viewMode === "list" && "bg-emerald-50 text-emerald-700 shadow-sm"
                    )}
                    aria-label="Список"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-11 text-xs sm:text-sm text-slate-600 hover:text-slate-900"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Очистити
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-body-small text-slate-600">
                В наявності товарів: <span className="font-semibold text-slate-900">{filteredProducts.length}</span>
              </span>
              {hasActiveFilters && (
                <Badge tone="outline" className="ml-2 border-emerald-200 bg-emerald-50 text-emerald-700">
                  Фільтри активні
                </Badge>
              )}
            </div>
          </div>

          {/* Products Grid/List */}
          {filteredProducts.length > 0 ? (
            <div className={cn(
              "grid gap-4 sm:gap-6",
              viewMode === "grid"
                ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr"
                : "grid-cols-1 lg:grid-cols-2 auto-rows-fr"
            )}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant={viewMode} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="py-20 text-center">
                <div className="mx-auto max-w-md">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">
                    Товари не знайдено
                  </h3>
                  <p className="mb-6 text-body-small text-slate-600">
                    Спробуйте змінити параметри пошуку або фільтри, щоб знайти те, що вам потрібно
                  </p>
                  {hasActiveFilters && (
                    <Button variant="default" onClick={clearFilters} size="lg">
                      <X className="mr-2 h-4 w-4" />
                      Очистити всі фільтри
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
