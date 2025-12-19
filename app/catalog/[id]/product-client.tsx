"use client";

import Image from "next/image";
import { useState } from "react";
import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, Phone, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Product, Variant } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductPageClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants[0] || null
  );
  const [quantity, setQuantity] = useState(2);
  const [contactFormOpen, setContactFormOpen] = useState(false);

  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <section className="border-b border-slate-100 bg-white/80 backdrop-blur-sm py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-emerald-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад до каталогу
            </Link>
          </div>
        </section>

        {/* Product Details */}
        <section className="py-4 sm:py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <span className="text-sm">Без фото</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <h1 className="mb-3 text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl">
                    {product.name}
                  </h1>
                  <div className="mb-3">
                    {minPrice !== maxPrice ? (
                      <span className="text-base font-semibold text-slate-900 sm:text-lg">
                        {minPrice} - {maxPrice} грн <span className="text-xs font-light text-slate-500 sm:text-sm">за шт.</span>
                      </span>
                    ) : (
                      <span className="text-base font-semibold text-slate-900 sm:text-lg">{minPrice} грн <span className="text-xs font-light text-slate-500 sm:text-sm">за шт.</span></span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    Свіжі квіти височної якості. Ідеально підходять для оптових замовлень та
                    великих проектів. Гарантуємо свіжість та довготривалість. Нова поставка свіжих квітів щоп'ятниці.
                  </p>
                </div>

                {/* Variants */}
                <div>
                  <h2 className="mb-3 text-sm font-semibold text-slate-900 sm:text-base md:text-lg">Варіанти висоти</h2>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                    {product.variants.map((variant) => {
                      const isSelected = selectedVariant?.size === variant.size;
                      return (
                        <button
                          key={variant.size}
                          onClick={() => setSelectedVariant(variant)}
                          className={cn(
                            "group relative rounded-lg border-2 p-2.5 text-left transition-all sm:rounded-xl sm:p-3 md:p-4",
                            isSelected
                              ? "border-emerald-600 bg-emerald-50 shadow-md"
                              : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                          )}
                        >
                          {isSelected && (
                            <CheckCircle2 className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-emerald-600 sm:right-2 sm:top-2 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                          )}
                          <div className="mb-1 text-xs font-semibold text-slate-900 sm:text-sm md:mb-2 md:text-base">{variant.size}</div>
                          <div className="mb-1 text-[10px] text-slate-500 sm:text-xs">
                            {variant.stock || 0} шт на складі
                          </div>
                          <div className="text-sm font-bold text-emerald-600 sm:text-base md:text-lg">
                            {variant.price} грн
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Variant Info */}
                {selectedVariant && (
                  <Card className="border-emerald-100 bg-emerald-50/50">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-slate-600 sm:text-sm">Обрано:</div>
                            <div className="text-sm font-semibold text-slate-900 sm:text-base md:text-lg">
                              {selectedVariant.size} · {selectedVariant.price} грн
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-500 sm:mt-1 sm:text-xs">
                              Продаж пачками по 25 квітів
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Input
                              type="number"
                              min="2"
                              value={quantity === 0 ? '' : quantity}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  setQuantity(0);
                                } else {
                                  const val = parseInt(value, 10);
                                  if (!isNaN(val) && val >= 0) {
                                    setQuantity(val);
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const value = e.target.value;
                                const num = parseInt(value, 10);
                                if (value === '' || isNaN(num) || num < 2) {
                                  setQuantity(2);
                                }
                              }}
                              className="h-8 w-16 text-center text-xs sm:h-9 sm:w-20 sm:text-sm"
                            />
                            <span className="text-xs text-slate-600 sm:text-sm">пачок</span>
                          </div>
                        </div>
                        <div className="border-t border-emerald-200 pt-2 sm:pt-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-slate-600 sm:text-sm">
                              Приблизна вартість:
                            </div>
                            <div className="text-base font-bold text-emerald-700 sm:text-lg md:text-xl">
                              {Math.round((selectedVariant.price * quantity * 25) / 10) * 10} грн
                            </div>
                          </div>
                          <div className="mt-0.5 text-[10px] text-slate-500 sm:mt-1 sm:text-xs">
                            ({quantity} пачок × 25 квітів/пачка × {selectedVariant.price} грн/квітка) · ~{quantity * 25} квітів
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 italic sm:text-xs">
                          * Розрахунок приблизний, для точного замовлення зв'яжіться з нами
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    className="flex-1 h-10 min-h-[40px] items-center justify-center gap-1.5 text-sm font-semibold sm:h-11 sm:gap-2 sm:text-base md:h-12"
                    onClick={() => setContactFormOpen(true)}
                  >
                    <Phone className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span>Зв'язатися для замовлення</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-10 min-h-[40px] items-center justify-center gap-1.5 text-sm font-semibold sm:h-11 sm:gap-2 sm:text-base md:h-12"
                    asChild
                  >
                    <a href="https://t.me/premiumflora" target="_blank" rel="noopener noreferrer">
                      <Send className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                      <span>Написати в телеграм</span>
                    </a>
                  </Button>
                </div>

                {/* Info */}
                <Card className="border-slate-100 bg-slate-50/50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Package className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5 sm:h-5 sm:w-5" />
                      <div className="text-xs text-slate-600 sm:text-sm">
                        <div className="font-semibold text-slate-900 mb-0.5 sm:mb-1">Умови замовлення:</div>
                        <ul className="space-y-0.5 list-disc list-inside sm:space-y-1">
                          <li>Мінімальне замовлення: від 50 шт</li>
                          <li>Доставка по всій Україні</li>
                          <li>Індивідуальні умови для постійних клієнтів</li>
                          <li>Нова поставка свіжих квітів щоп'ятниці</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}




