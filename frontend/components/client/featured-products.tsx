"use client";

import { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type FeaturedProductsProps = {
  products: Product[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const featured = products.slice(0, 8);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px -200px 0px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  return (
    <section
      ref={ref}
      className="relative overflow-hidden pt-10 sm:pt-20 lg:pt-28 pb-10 lg:pb-14 bg-white"
    >

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 mb-3 sm:mb-4">
            Популярні{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              товари
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-500 max-w-2xl mx-auto">
            Найбільш затребувані квіти серед наших клієнтів. Свіжість та якість гарантовані.
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
        >
          {featured.map((product, index) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group"
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 lg:mt-16 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              asChild
              size="lg"
              className="group relative overflow-hidden bg-white hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 shadow-sm hover:shadow-md h-10 sm:h-12 px-5 sm:px-8 text-sm sm:text-base font-semibold transition-all duration-300"
            >
              <Link href="/catalog" className="flex items-center gap-2">
                <span className="relative z-10">Переглянути весь каталог</span>
                <motion.span
                  className="relative z-10"
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
