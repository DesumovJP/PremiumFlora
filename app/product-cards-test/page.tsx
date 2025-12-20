"use client";

import { Navigation } from "@/components/client/navigation";
import { Footer } from "@/components/client/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { products } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Package,
  ShoppingCart,
  Heart,
  Star,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
} from "lucide-react";

const testProduct = products[0]; // Використовуємо перший продукт для тестування

export default function ProductCardsTestPage() {
  const minPrice = Math.min(...testProduct.variants.map((v) => v.price));
  const maxPrice = Math.max(...testProduct.variants.map((v) => v.price));
  const priceRange = minPrice === maxPrice ? `${minPrice} грн` : `${minPrice} - ${maxPrice} грн`;
  const isPopular = testProduct.variants.length >= 4;
  const availableSizes = testProduct.variants.length;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-slate-900">
              Тестова сторінка карток продуктів
            </h1>
            <p className="text-lg text-slate-600">
              10 різних варіантів дизайну карток продуктів
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Варіант 1: Мінімалістичний */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Варіант 1: Мінімалістичний</h2>
              <Card className="group overflow-hidden border-slate-200 transition-all hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image
                    src={testProduct.image}
                    alt={testProduct.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="400px"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-2 text-base font-semibold text-slate-900">
                    {testProduct.name}
                  </h3>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900">{priceRange}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Package className="h-3 w-3" />
                    <span>{availableSizes} варіантів</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Варіант 2: З акцентом на зображення */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Варіант 2: Акцент на зображення</h2>
              <Card className="group relative overflow-hidden border-0 shadow-xl transition-all hover:shadow-2xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={testProduct.image}
                    alt={testProduct.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                  {isPopular && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm">
                        Популярне
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="mb-1 text-xl font-bold">{testProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{priceRange}</span>
                      <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Варіант 3: З градієнтним фоном */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Варіант 3: Градієнтний фон</h2>
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 transition-all hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={testProduct.image}
                    alt={testProduct.name}
                    fill
                    className="object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                    sizes="400px"
                  />
                </div>
                <CardContent className="relative p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-lg font-bold text-slate-900">
                        {testProduct.name}
                      </h3>
                      <div className="mb-2 flex flex-wrap gap-1">
                        {testProduct.variants.slice(0, 2).map((v) => (
                          <Badge
                            key={v.size}
                            className="bg-emerald-100 text-emerald-700 border-0"
                          >
                            {v.size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {isPopular && (
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-emerald-100 pt-3">
                    <span className="text-xl font-bold text-emerald-600">{priceRange}</span>
                    <Button variant="outline" size="sm">
                      Детальніше
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Варіант 4: З кнопкою додавання */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Варіант 4: З кнопкою додавання</h2>
              <Card className="group overflow-hidden border-slate-200 transition-all hover:border-emerald-300 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image
                    src={testProduct.image}
                    alt={testProduct.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
                    <Button
                      className="translate-y-4 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
                      size="lg"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Додати в кошик
                    </Button>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">{testProduct.name}</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {testProduct.variants.slice(0, 3).map((v) => (
                      <Badge key={v.size} tone="outline" className="text-xs">
                        {v.size}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-slate-900">{priceRange}</div>
                      <div className="text-xs text-slate-500">{availableSizes} варіантів</div>
                    </div>
                    <Button size="sm" variant="outline">
                      Детальніше
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Варіант 5: З рейтингом */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Варіант 5: З рейтингом</h2>
              <Card className="overflow-hidden border-slate-200 shadow-md transition-all hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={testProduct.image}
                    alt={testProduct.name}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold">4.8</span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{testProduct.name}</h3>
                  <div className="mb-3 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i <= 4 ? "fill-amber-400 text-amber-400" : "text-slate-300"
                        )}
                      />
                    ))}
                    <span className="ml-2 text-xs text-slate-500">(24 відгуки)</span>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {testProduct.variants.slice(0, 2).map((v) => (
                      <Badge key={v.size} tone="outline" className="text-xs">
                        {v.size}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-2xl font-bold text-emerald-600">{priceRange}</span>
                    <Button size="sm">Замовити</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Варіант 6: Компактний горизонтальний */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Варіант 6: Горизонтальний</h2>
              <Card className="overflow-hidden border-slate-200">
                <div className="flex">
                  <div className="relative w-32 flex-shrink-0 overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                  <CardContent className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <h3 className="mb-1 text-base font-semibold text-slate-900">
                        {testProduct.name}
                      </h3>
                      <div className="mb-2 flex flex-wrap gap-1">
                        {testProduct.variants.slice(0, 2).map((v) => (
                          <Badge key={v.size} tone="outline" className="text-xs">
                            {v.size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900">{priceRange}</span>
                      <Button size="sm" variant="ghost">
                        →
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Варіант 7: З анімацією та ефектами */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Варіант 7: З анімаціями</h2>
              <Card className="group relative overflow-hidden border-2 border-transparent transition-all duration-500 hover:border-emerald-300 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-blue-500/0 transition-all duration-500 group-hover:from-emerald-500/10 group-hover:to-blue-500/10" />
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={testProduct.image}
                    alt={testProduct.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-125 group-hover:rotate-2"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  {isPopular && (
                    <div className="absolute top-3 left-3 animate-pulse">
                      <Badge className="bg-emerald-500 text-white">
                        <Zap className="mr-1 h-3 w-3" />
                        Популярне
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="relative p-5">
                  <h3 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
                    {testProduct.name}
                  </h3>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {testProduct.variants.slice(0, 3).map((v) => (
                      <Badge
                        key={v.size}
                        tone="outline"
                        className="transition-all group-hover:border-emerald-300 group-hover:bg-emerald-50"
                      >
                        {v.size}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-slate-900">{priceRange}</div>
                      <div className="text-xs text-slate-500">{availableSizes} варіантів</div>
                    </div>
                    <Button
                      variant="outline"
                      className="translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                    >
                      Детальніше
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Варіант 8: Темний стиль */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Варіант 8: Темний стиль</h2>
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={testProduct.image}
                    alt={testProduct.name}
                    fill
                    className="object-cover opacity-80"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                </div>
                <CardContent className="p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-bold text-white">{testProduct.name}</h3>
                    {isPopular && (
                      <Badge className="bg-emerald-500 text-white">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Топ
                      </Badge>
                    )}
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {testProduct.variants.slice(0, 2).map((v) => (
                      <Badge
                        key={v.size}
                        className="bg-white/10 text-white border-white/20 backdrop-blur-sm"
                      >
                        {v.size}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <div>
                      <div className="text-2xl font-bold text-white">{priceRange}</div>
                      <div className="text-xs text-white/60">{availableSizes} варіантів</div>
                    </div>
                    <Button className="bg-emerald-500 text-white hover:bg-emerald-600">
                      Замовити
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Варіант 9: З великою кнопкою */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Варіант 9: З великою кнопкою</h2>
              <Card className="group overflow-hidden border-slate-200 transition-all hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image
                    src={testProduct.image}
                    alt={testProduct.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="400px"
                  />
                </div>
                <CardContent className="p-5">
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {testProduct.name}
                  </h3>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {testProduct.variants.slice(0, 3).map((v) => (
                      <Badge key={v.size} tone="outline" className="text-xs">
                        {v.size}
                      </Badge>
                    ))}
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">{priceRange}</div>
                      <div className="text-xs text-slate-500">{availableSizes} варіантів</div>
                    </div>
                  </div>
                  <Button className="w-full" size="lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Додати в кошик
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Варіант 10: Премиум стиль */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Варіант 10: Премиум стиль</h2>
              <Card className="group relative overflow-hidden border-2 border-emerald-100 bg-white shadow-lg transition-all hover:border-emerald-300 hover:shadow-2xl">
                <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 blur-3xl" />
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={testProduct.image}
                    alt={testProduct.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
                  {isPopular && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Популярне
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="relative p-6">
                  <h3 className="mb-3 text-xl font-bold text-slate-900">{testProduct.name}</h3>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {testProduct.variants.slice(0, 3).map((v) => (
                      <Badge
                        key={v.size}
                        className="bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        {v.size}
                      </Badge>
                    ))}
                    {testProduct.variants.length > 3 && (
                      <Badge tone="outline" className="text-emerald-600">
                        +{testProduct.variants.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="mb-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <div className="text-3xl font-bold text-slate-900">{priceRange}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Package className="h-3 w-3" />
                        <span>{availableSizes} варіантів доступно</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" size="lg">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Замовити
                    </Button>
                    <Button variant="outline" size="lg">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}




