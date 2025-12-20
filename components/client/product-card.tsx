"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type ProductCardProps = {
  product: Product;
  className?: string;
  variant?: "grid" | "list";
};

export function ProductCard({ product, className, variant = "grid" }: ProductCardProps) {
  // Безпечна обробка варіантів
  const variants = product.variants || [];
  
  if (variants.length === 0) {
    return (
      <Card className={cn("overflow-hidden border-slate-200/80 dark:border-admin-border bg-white dark:bg-admin-surface shadow-sm", className)}>
        <CardContent className="p-4">
          <div className="text-center text-sm text-slate-500 dark:text-admin-text-tertiary">
            <p className="font-semibold">{product.name}</p>
            <p className="mt-1 text-xs">Немає варіантів</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const prices = variants.map((v) => v?.price ?? 0).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const priceRange = minPrice === maxPrice ? `${minPrice} грн` : `${minPrice} - ${maxPrice} грн`;
  
  // Check if product has many variants (popular)
  const isPopular = variants.length >= 4;
  
  // Get available sizes count
  const availableSizes = variants.length;

  if (variant === "list") {
    return (
      <Link href={`/catalog/${product.id}`} className="h-full gpu-accelerated">
        <Card
          className={cn(
            "group flex h-full overflow-hidden rounded-2xl card-premium hover-lift-3d transform-3d",
            className
          )}
        >
          <div className="flex w-full flex-col lg:flex-row">
            {/* Image Container - Horizontal - Optimized */}
            <div className="relative w-full lg:w-64 lg:flex-shrink-0 aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[180px] overflow-hidden bg-slate-50 dark:bg-admin-surface gpu-accelerated">
              {product.image && product.image.trim() !== "" ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover image-optimized transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 1024px) 100vw, 256px"
                  loading="lazy"
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  unoptimized={false}
                />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('/bg.webp')] bg-cover bg-center opacity-30" />
              <div className="relative z-10 flex items-center justify-center text-slate-400 dark:text-admin-text-muted">
                <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
              
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200/70 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/40 backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="sr-only">Популярне</span>
                  </Badge>
                </div>
              )}
            </div>

            {/* Content - Horizontal */}
            <CardContent className="flex flex-1 flex-col justify-between p-4 lg:p-5 transition-premium group-hover:bg-gradient-emerald/10">
              <div className="flex-1">
                {/* Product Name */}
                <h3 className="mb-2 line-clamp-2 text-sm lg:text-base font-semibold leading-tight text-slate-900 dark:text-admin-text-primary transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {product.name}
                </h3>

                {/* Variants/Sizes - Показуємо всі варіанти */}
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  {variants
                    .filter((v) => v != null)
                    .map((v) => (
                      <span
                        key={v.size || Math.random()}
                        className="rounded-full bg-slate-50 dark:bg-admin-surface-elevated px-2 py-0.5 text-[10px] font-medium leading-tight text-slate-600 dark:text-admin-text-secondary"
                      >
                        {v.size || "N/A"}
                      </span>
                    ))}
                </div>
              </div>

              {/* Price and Info */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-admin-border pt-3">
                <div className="text-lg lg:text-xl font-semibold text-slate-900 dark:text-admin-text-primary">
                  {priceRange}
                </div>
                <div className="flex items-center text-xs font-medium text-slate-500 dark:text-admin-text-tertiary transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  <span>Детальніше</span>
                  <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid view (default) - Premium 3D Style
  return (
    <Link href={`/catalog/${product.id}`} className="h-full gpu-accelerated">
      <Card
          className={cn(
            "group relative flex h-full flex-col overflow-hidden rounded-2xl card-premium hover-lift-3d transform-3d",
            className
          )}
      >
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200/70 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/40 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="sr-only">Популярне</span>
            </Badge>
          </div>
        )}

        {/* Image Container - Optimized */}
        <div className="relative aspect-[4/3] w-full flex-shrink-0 overflow-hidden bg-slate-50 dark:bg-admin-surface gpu-accelerated">
          {product.image && product.image.trim() !== "" ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover image-optimized transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              unoptimized={false}
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('/bg.webp')] bg-cover bg-center opacity-30" />
              <div className="relative z-10 flex items-center justify-center text-slate-400 dark:text-admin-text-muted">
                <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col p-3.5 transition-premium group-hover:bg-gradient-emerald/10">
          {/* Product Name */}
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-tight text-slate-900 dark:text-admin-text-primary transition-premium group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
            {product.name}
          </h3>

          {/* Variants/Sizes */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {variants
              .filter((v) => v != null)
              .map((v) => (
                <span
                  key={v.size || Math.random()}
                  className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium leading-tight text-slate-600"
                >
                  {v.size || "N/A"}
                </span>
              ))}
          </div>

          {/* Price - вирівнюємо вниз */}
          <div className="mt-auto text-sm font-semibold text-slate-900 dark:text-admin-text-primary">{priceRange}</div>
        </CardContent>
      </Card>
    </Link>
  );
}



