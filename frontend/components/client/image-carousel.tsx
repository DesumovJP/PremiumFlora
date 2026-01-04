"use client";

import { useState, useRef, TouchEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Shared blur placeholder for optimized image loading - neutral light grey
const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIvPjwvc3ZnPg==";

type ImageCarouselProps = {
  images: string[];
  className?: string;
};

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setDirection('prev');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 150);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setDirection('next');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      setIsTransitioning(false);
    }, 150);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setDirection(index > currentIndex ? 'next' : 'prev');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 150);
  };

  if (images.length === 0) return null;

  return (
    <div className={cn("relative w-full", className)}>
      {/* Main Image with crossfade + subtle scale */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          fill
          className={cn(
            "object-cover",
            isTransitioning ? "animate-crossfade-out" : "animate-crossfade-in"
          )}
          sizes="100vw"
          priority={currentIndex === 0}
          loading="eager"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          unoptimized={images[currentIndex].includes('digitaloceanspaces.com')}
        />
        
        {/* Navigation Buttons - hidden on mobile (use swipe instead) */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white animate-hover-scale disabled:opacity-50 hidden sm:flex"
              aria-label="Попереднє зображення"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white animate-hover-scale disabled:opacity-50 hidden sm:flex"
              aria-label="Наступне зображення"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Image Counter with subtle animation */}
        {images.length > 1 && (
          <div
            className={cn(
              "absolute bottom-4 left-1/2 rounded-full bg-black/50 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-white transition-transform duration-300",
              isTransitioning ? "-translate-x-1/2 scale-95" : "-translate-x-1/2 scale-100"
            )}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation with smooth selection */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                currentIndex === index
                  ? "border-emerald-500 shadow-lg shadow-emerald-500/20 scale-105"
                  : "border-slate-200 hover:border-emerald-300 opacity-60 hover:opacity-100 hover:scale-[1.02]",
                isTransitioning && "pointer-events-none"
              )}
              aria-label={`Перейти до зображення ${index + 1}`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className={cn(
                  "object-cover transition-transform duration-300",
                  currentIndex === index && "scale-[1.05]"
                )}
                sizes="80px"
                loading="eager"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                unoptimized={image.includes('digitaloceanspaces.com')}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}










