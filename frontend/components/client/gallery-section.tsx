"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared blur placeholder for optimized image loading - neutral light grey
const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPjwvc3ZnPg==";

type GallerySectionProps = {
  images: string[];
  title?: string;
  description?: string;
};

// Generate random aspect ratios for Pinterest-style masonry
// Using seed-based randomization for consistent results across renders
function generateAspectRatios(count: number): number[] {
  const ratios: number[] = [];
  const possibleRatios = [0.75, 0.85, 1, 1.15, 1.3]; // Narrower range for better balance

  for (let i = 0; i < count; i++) {
    // Simple seeded random based on index
    const seed = (i * 7 + 3) % possibleRatios.length;
    ratios.push(possibleRatios[seed]);
  }
  return ratios;
}

// Distribute images across columns to balance heights
function distributeToColumns(
  images: string[],
  aspectRatios: number[],
  columnCount: number
): { image: string; ratio: number; originalIndex: number }[][] {
  const columns: { image: string; ratio: number; originalIndex: number }[][] =
    Array.from({ length: columnCount }, () => []);
  const columnHeights: number[] = Array(columnCount).fill(0);

  images.forEach((image, index) => {
    // Find the shortest column
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
    const ratio = aspectRatios[index];

    columns[shortestColumnIndex].push({ image, ratio, originalIndex: index });
    // Height is inverse of aspect ratio (taller images have smaller ratio)
    columnHeights[shortestColumnIndex] += 1 / ratio;
  });

  return columns;
}

export function GallerySection({
  images,
  title = "Наша галерея",
  description = "Погляньте на наші квіти та робочий процес"
}: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [columnCount, setColumnCount] = useState(2);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Memoize aspect ratios to prevent recalculation
  const aspectRatios = useMemo(() => generateAspectRatios(images.length), [images.length]);

  // Distribute images to columns for balanced heights
  const columns = useMemo(
    () => distributeToColumns(images, aspectRatios, columnCount),
    [images, aspectRatios, columnCount]
  );

  // Update column count based on screen size
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColumnCount(5);
      else if (width >= 1024) setColumnCount(4);
      else if (width >= 640) setColumnCount(3);
      else setColumnCount(2);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  useEffect(() => {
    // CRITICAL FIX: Set visible immediately to ensure images load
    // Images must be visible from the start to trigger proper loading
    // Animation will still work via CSS transitions
    setIsVisible(true);

    // Optional: Use IntersectionObserver for entrance animation timing
    // but images will already be loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "100px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setIsModalAnimating(true);
    document.body.style.overflow = "hidden";
    // Allow animation to complete
    setTimeout(() => setIsModalAnimating(false), 400);
  };

  const closeModal = () => {
    setIsModalAnimating(true);
    setTimeout(() => {
      setSelectedIndex(null);
      document.body.style.overflow = "";
      setIsModalAnimating(false);
    }, 250);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && !isImageTransitioning) {
      setIsImageTransitioning(true);
      setTimeout(() => {
        setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
        setIsImageTransitioning(false);
      }, 150);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && !isImageTransitioning) {
      setIsImageTransitioning(true);
      setTimeout(() => {
        setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
        setIsImageTransitioning(false);
      }, 150);
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
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg text-slate-600 px-4">
              {description}
            </p>
          </div>

          {/* Balanced Masonry Grid */}
          <div
            className={cn(
              "flex gap-3 sm:gap-4",
              isVisible ? "opacity-100" : "opacity-0"
            )}
            style={{
              transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
            }}
          >
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex-1 space-y-3 sm:space-y-4">
                {column.map((item) => (
                  <button
                    key={item.originalIndex}
                    onClick={() => openModal(item.originalIndex)}
                    className={cn(
                      "group relative block w-full overflow-hidden rounded-xl bg-slate-100",
                      "transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                      isVisible ? "opacity-100" : "opacity-0"
                    )}
                    style={{
                      aspectRatio: item.ratio,
                      transitionDelay: isVisible ? `${Math.min(item.originalIndex * 30, 500)}ms` : "0ms",
                      transform: isVisible ? "translateY(0) translateZ(0)" : "translateY(20px)",
                    }}
                    aria-label={`Відкрити зображення ${item.originalIndex + 1}`}
                  >
                    <Image
                      src={item.image}
                      alt={`Gallery image ${item.originalIndex + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                      priority={item.originalIndex < 4}
                      loading={item.originalIndex < 8 ? "eager" : "lazy"}
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      unoptimized={item.image.includes('digitaloceanspaces.com')}
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Zoom icon on hover */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center justify-center rounded-full bg-white p-3 shadow-xl ring-4 ring-white/20 backdrop-blur-md transition-all duration-300 ease-out scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <circle cx="11" cy="11" r="7" />
                          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                        </svg>
                      </div>
                    </div>

                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal - rendered via Portal to escape any transform/filter parent contexts */}
      {selectedIndex !== null && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/98 overlay-blur-subtle flex items-center justify-center p-4 animate-overlay-in"
          onClick={closeModal}
        >
          {/* Close Button with hover animation */}
          <button
            onClick={closeModal}
            className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm animate-hover-scale focus:outline-none"
            aria-label="Закрити"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Buttons with hover animation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                disabled={isImageTransitioning}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/10 text-white backdrop-blur-sm animate-hover-scale focus:outline-none disabled:opacity-50 flex items-center justify-center"
                aria-label="Попереднє зображення"
              >
                <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                disabled={isImageTransitioning}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/10 text-white backdrop-blur-sm animate-hover-scale focus:outline-none disabled:opacity-50 flex items-center justify-center"
                aria-label="Наступне зображення"
              >
                <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
            </>
          )}

          {/* Image Counter with transition */}
          {images.length > 1 && (
            <div
              className={cn(
                "absolute bottom-4 sm:bottom-6 left-1/2 z-20 rounded-full bg-black/60 px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-transform duration-300",
                isImageTransitioning ? "-translate-x-1/2 scale-95" : "-translate-x-1/2 scale-100"
              )}
            >
              {selectedIndex + 1} / {images.length}
            </div>
          )}

          {/* Image with zoom + crossfade animation */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[selectedIndex]}
            alt={`Gallery image ${selectedIndex + 1}`}
            className={cn(
              "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] sm:max-w-[calc(100vw-8rem)] sm:max-h-[calc(100vh-6rem)] w-auto h-auto object-contain rounded-xl",
              isImageTransitioning ? "animate-crossfade-out" : "animate-crossfade-in animate-gallery-zoom-in"
            )}
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  );
}



