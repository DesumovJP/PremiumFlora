import { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flower2 } from "lucide-react";

type FeaturedProductsProps = {
  products: Product[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const featured = products.slice(0, 4);

  return (
    <section className="relative bg-gradient-to-b from-white via-slate-50/30 to-white section-padding-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 sm:mb-16 text-center">
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

        {/* Products Grid - Improved spacing */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold border-2 shadow-md transition-all hover:shadow-lg">
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


