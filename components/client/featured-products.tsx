"use client";

import { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flower2 } from "lucide-react";
import { useIntersection } from "@/hooks/use-intersection";
import { useEffect } from "react";

type FeaturedProductsProps = {
  products: Product[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const featured = products.slice(0, 4);
  const { ref, isVisible } = useIntersection({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (ref.current && isVisible) {
      ref.current.classList.add("visible");
    }
  }, [isVisible, ref]);

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      className="relative bg-gradient-to-b from-white via-slate-50/30 to-white section-padding-sm fade-in-up-animate"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 sm:mb-16 text-center fade-in-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700">
            <Flower2 className="h-4 w-4" />
            <span>Каталог</span>
          </div>
          <h2 className="mb-4 text-display-sm font-extrabold tracking-tight text-slate-900">
            Популярні товари
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-body-large text-slate-600">
            Найбільш затребувані квіти серед наших клієнтів. Свіжість та якість гарантовані.
          </p>
        </div>

        {/* Products Grid - Premium with animations */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {featured.map((product, index) => (
            <div 
              key={product.id} 
              className="fade-in-up"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* CTA - Premium */}
        <div className="mt-16 text-center fade-in-up">
          <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold border-2 glass glass-soft btn-premium hover-lift-3d shadow-premium">
            <Link href="/catalog">
              Переглянути весь каталог
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}



