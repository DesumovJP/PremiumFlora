"use client";

import { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flower2 } from "lucide-react";
import { useIntersection } from "@/hooks/use-intersection";
import { useEffect } from "react";
import { WaveDivider } from "@/components/ui/decorations";

type FeaturedProductsProps = {
  products: Product[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const featured = products.slice(0, 8);
  const { ref, isVisible } = useIntersection({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (ref.current && isVisible) {
      ref.current.classList.add("visible");
    }
  }, [isVisible, ref]);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative overflow-hidden section-padding-sm fade-in-up-animate"
    >
      {/* Premium background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white" />

      {/* Top gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-gradient-radial from-emerald-100/40 via-emerald-50/20 to-transparent blur-3xl pointer-events-none" />

      {/* Side decorative orbs */}
      <div className="absolute top-1/3 left-0 w-64 h-64 bg-gradient-radial from-amber-100/30 to-transparent rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-gradient-radial from-rose-100/25 to-transparent rounded-full blur-3xl translate-x-1/2 pointer-events-none" />

      {/* Subtle noise texture */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Wave divider at bottom */}
      <WaveDivider position="bottom" variant="simple" color="white" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 sm:mb-10 lg:mb-12 text-center fade-in-up">
          <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-emerald-700 border border-emerald-100/50 shadow-sm">
            <Flower2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Каталог</span>
          </div>
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Популярні <span className="text-emerald-600">товари</span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg text-slate-600 px-4">
            Найбільш затребувані квіти серед наших клієнтів. Свіжість та якість гарантовані.
          </p>
        </div>

        {/* Products Grid - Premium with animations */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {featured.map((product, index) => (
            <div
              key={product.id}
              className="fade-in-up"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* CTA - Premium */}
        <div className="mt-8 sm:mt-12 text-center fade-in-up">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold border-2 border-slate-200 bg-white/80 backdrop-blur-sm hover:border-emerald-300 hover:bg-emerald-50/50 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Link href="/catalog" className="flex items-center gap-2">
              Переглянути весь каталог
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
