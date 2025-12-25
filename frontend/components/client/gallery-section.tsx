"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GallerySectionProps = {
  images: string[];
  title?: string;
  description?: string;
};

// Generate random aspect ratios for Pinterest-style masonry
// Using seed-based randomization for consistent results across renders
function generateAspectRatios(count: number): number[] {
  const ratios: number[] = [];
  const possibleRatios = [0.7, 0.8, 1, 1.2, 1.4, 1.6]; // Various portrait to landscape ratios

  for (let i = 0; i < count; i++) {
    // Simple seeded random based on index
    const seed = (i * 7 + 3) % possibleRatios.length;
    ratios.push(possibleRatios[seed]);
  }
  return ratios;
}

export function GallerySection({
  images,
  title = "Наша галерея",
  description = "Погляньте на наші квіти та робочий процес"
}: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Memoize aspect ratios to prevent recalculation
  const aspectRatios = useMemo(() => generateAspectRatios(images.length), [images.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedIndex(null);
    document.body.style.overflow = "";
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  if (images.length === 0) return null;

  return (
    <>
      <section
        ref={sectionRef}
        className="relative overflow-hidden py-10 sm:py-16 lg:py-24"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/20 to-slate-50/50" />

        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-gradient-radial from-emerald-200/20 via-emerald-100/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-gradient-radial from-teal-200/20 via-teal-100/10 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div
            className={cn(
              "mb-6 sm:mb-10 lg:mb-12 text-center",
              isVisible ? "opacity-100" : "opacity-0"
            )}
            style={{
              transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <span className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100/50 bg-emerald-50 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-emerald-700 shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Галерея
            </span>
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg text-slate-600 px-4">
              {description}
            </p>
          </div>

          {/* Pinterest-style Masonry Grid */}
          <div
            className={cn(
              "columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 xl:columns-5",
              isVisible ? "opacity-100" : "opacity-0"
            )}
            style={{
              transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
            }}
          >
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => openModal(index)}
                className={cn(
                  "group relative mb-3 block w-full overflow-hidden rounded-xl bg-slate-100 sm:mb-4",
                  "transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                  isVisible ? "opacity-100" : "opacity-0"
                )}
                style={{
                  aspectRatio: aspectRatios[index],
                  transitionDelay: isVisible ? `${Math.min(index * 30, 500)}ms` : "0ms",
                  transform: isVisible ? "translateY(0)" : "translateY(20px)",
                }}
                aria-label={`Відкрити зображення ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Zoom icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm">
                    <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>

                {/* Corner decoration */}
                <div className="absolute right-2 top-2 h-2 w-2 scale-0 rounded-full bg-emerald-400 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Закрити"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 h-14 w-14 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Попереднє зображення"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 h-14 w-14 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Наступне зображення"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}

          {/* Image Container */}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedIndex]}
              alt={`Gallery image ${selectedIndex + 1}`}
              width={1400}
              height={1000}
              className="max-h-[90vh] w-auto rounded-xl object-contain shadow-2xl"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}



