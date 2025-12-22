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
  CheckCircle2,
  Info,
  Clock,
  Leaf,
} from "lucide-react";

const testProduct = products[0];

export default function ProductCardsVariantsPage() {
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
              Варіанти розвитку карток продуктів
            </h1>
            <p className="text-lg text-slate-600">
              10 варіантів мінімалістичного стилю + 10 варіантів з акцентом на зображення
            </p>
          </div>

          {/* Мінімалістичні варіанти */}
          <section className="mb-20">
            <h2 className="mb-8 text-3xl font-bold text-slate-900">
              Мінімалістичний стиль (10 варіантів)
            </h2>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
              {/* Мінімалістичний 1: Базовий мінімалізм */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">М1: Базовий мінімалізм</h3>
                <Card className="group overflow-hidden border border-slate-200 transition-all hover:border-slate-300 hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="mb-1.5 text-sm font-semibold text-slate-900">
                      {testProduct.name}
                    </h4>
                    <div className="text-base font-bold text-slate-900">{priceRange}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Мінімалістичний 2: З тонкою рамкою */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">М2: Тонка рамка</h3>
                <Card className="group overflow-hidden border-2 border-slate-100 bg-white transition-all hover:border-emerald-200 hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="mb-2 text-sm font-medium text-slate-800">
                      {testProduct.name}
                    </h4>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-slate-900">{priceRange}</span>
                      <span className="text-xs text-slate-400">→</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Мінімалістичний 3: З мінімальним padding */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">М3: Мінімальний padding</h3>
                <Card className="group overflow-hidden border border-slate-200 bg-white">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h4 className="mb-1 text-xs font-semibold text-slate-900">
                      {testProduct.name}
                    </h4>
                    <div className="text-sm font-bold text-slate-900">{priceRange}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Мінімалістичний 4: З розділювачем */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">М4: З розділювачем</h3>
                <Card className="group overflow-hidden border border-slate-200 transition-all hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="border-t border-slate-100 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-slate-900">
                      {testProduct.name}
                    </h4>
                    <div className="text-base font-bold text-slate-900">{priceRange}</div>
                  </div>
                </Card>
              </div>

              {/* Мінімалістичний 5: З іконкою */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">М5: З іконкою</h3>
                <Card className="group overflow-hidden border border-slate-200 transition-all hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start gap-2">
                      <Package className="mt-0.5 h-4 w-4 text-slate-400" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {testProduct.name}
                        </h4>
                      </div>
                    </div>
                    <div className="text-base font-bold text-slate-900">{priceRange}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Мінімалістичний 6: З варіантами */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">М6: З варіантами</h3>
                <Card className="group overflow-hidden border border-slate-200 transition-all hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="mb-2 text-sm font-semibold text-slate-900">
                      {testProduct.name}
                    </h4>
                    <div className="mb-2 flex gap-1">
                      {testProduct.variants.slice(0, 2).map((v) => (
                        <span
                          key={v.size}
                          className="text-xs text-slate-500"
                        >
                          {v.size}
                        </span>
                      ))}
                    </div>
                    <div className="text-base font-bold text-slate-900">{priceRange}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Мінімалістичний 7: З центрованим текстом */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">М7: Центрований текст</h3>
                <Card className="group overflow-hidden border border-slate-200 transition-all hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4 text-center">
                    <h4 className="mb-2 text-sm font-semibold text-slate-900">
                      {testProduct.name}
                    </h4>
                    <div className="text-base font-bold text-slate-900">{priceRange}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Мінімалістичний 8: З тінню */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">М8: З тінню</h3>
                <Card className="group overflow-hidden border-0 bg-white shadow-sm transition-all hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="mb-1.5 text-sm font-semibold text-slate-900">
                      {testProduct.name}
                    </h4>
                    <div className="text-base font-bold text-slate-900">{priceRange}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Мінімалістичний 9: З hover ефектом */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">М9: Hover ефект</h3>
                <Card className="group overflow-hidden border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4 transition-colors group-hover:bg-emerald-50/30">
                    <h4 className="mb-1.5 text-sm font-semibold text-slate-900 transition-colors group-hover:text-emerald-700">
                      {testProduct.name}
                    </h4>
                    <div className="text-base font-bold text-slate-900">{priceRange}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Мінімалістичний 10: Ультра мінімалізм */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">М10: Ультра мінімалізм</h3>
                <div className="group overflow-hidden border-b border-slate-200 bg-white pb-2 transition-all hover:border-emerald-300">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="mt-2 px-2">
                    <h4 className="text-xs font-medium text-slate-700">{testProduct.name}</h4>
                    <div className="mt-0.5 text-sm font-bold text-slate-900">{priceRange}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Варіанти з акцентом на зображення */}
          <section>
            <h2 className="mb-8 text-3xl font-bold text-slate-900">
              Акцент на зображення (10 варіантів)
            </h2>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
              {/* Акцент 1: Базовий з градієнтом */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">А1: Базовий градієнт</h3>
                <Card className="group relative overflow-hidden border-0 shadow-xl transition-all hover:shadow-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h4 className="mb-1 text-lg font-bold">{testProduct.name}</h4>
                      <div className="text-xl font-bold">{priceRange}</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Акцент 2: З badge */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">А2: З badge</h3>
                <Card className="group relative overflow-hidden border-0 shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    {isPopular && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm">
                          Популярне
                        </Badge>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h4 className="mb-1 text-lg font-bold">{testProduct.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">{priceRange}</span>
                        <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Акцент 3: З кнопкою */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">А3: З кнопкою</h3>
                <Card className="group relative overflow-hidden border-0 shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h4 className="mb-2 text-lg font-bold">{testProduct.name}</h4>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xl font-bold">{priceRange}</span>
                      </div>
                      <Button className="w-full bg-white text-slate-900 hover:bg-slate-100">
                        Детальніше
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Акцент 4: З варіантами */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">А4: З варіантами</h3>
                <Card className="group relative overflow-hidden border-0 shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h4 className="mb-2 text-lg font-bold">{testProduct.name}</h4>
                      <div className="mb-2 flex gap-1">
                        {testProduct.variants.slice(0, 3).map((v) => (
                          <Badge
                            key={v.size}
                            className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
                          >
                            {v.size}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xl font-bold">{priceRange}</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Акцент 5: З іконками */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">А5: З іконками</h3>
                <Card className="group relative overflow-hidden border-0 shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="text-xs opacity-90">{availableSizes} варіантів</span>
                      </div>
                      <h4 className="mb-1 text-lg font-bold">{testProduct.name}</h4>
                      <div className="text-xl font-bold">{priceRange}</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Акцент 6: З overlay текстом */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">А6: Overlay текст</h3>
                <Card className="group relative overflow-hidden border-0 shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                      <h4 className="mb-2 text-xl font-bold">{testProduct.name}</h4>
                      <div className="mb-3 text-2xl font-bold">{priceRange}</div>
                      <Button variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
                        Детальніше
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Акцент 7: З боковим текстом */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">А7: Боковий текст</h3>
                <Card className="group relative overflow-hidden border-0 shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h4 className="mb-1 text-lg font-bold">{testProduct.name}</h4>
                      <div className="text-xl font-bold">{priceRange}</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Акцент 8: З рамкою */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">А8: З рамкою</h3>
                <Card className="group relative overflow-hidden border-4 border-white shadow-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h4 className="mb-1 text-lg font-bold">{testProduct.name}</h4>
                      <div className="text-xl font-bold">{priceRange}</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Акцент 9: З анімацією */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">А9: З анімацією</h3>
                <Card className="group relative overflow-hidden border-0 shadow-xl transition-all duration-500 hover:shadow-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-125 group-hover:brightness-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80 group-hover:via-black/40" />
                    <div className="absolute bottom-4 left-4 right-4 translate-y-2 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <h4 className="mb-1 text-lg font-bold">{testProduct.name}</h4>
                      <div className="text-xl font-bold">{priceRange}</div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white opacity-100 transition-opacity duration-300 group-hover:opacity-0">
                      <h4 className="mb-1 text-lg font-bold">{testProduct.name}</h4>
                      <div className="text-xl font-bold">{priceRange}</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Акцент 10: Премиум overlay */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600">А10: Премиум overlay</h3>
                <Card className="group relative overflow-hidden border-0 shadow-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={testProduct.image}
                      alt={testProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-black/50 to-blue-900/40" />
                    {isPopular && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Популярне
                        </Badge>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 text-white">
                      <h4 className="mb-2 text-xl font-bold">{testProduct.name}</h4>
                      <div className="mb-3 flex items-center gap-2 text-sm opacity-90">
                        <Package className="h-4 w-4" />
                        <span>{availableSizes} варіантів</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{priceRange}</span>
                        <Button className="bg-white text-slate-900 hover:bg-slate-100">
                          Замовити
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}






