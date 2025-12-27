'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
} from 'framer-motion';

// === SCROLL REVEAL HOOK ===
interface UseScrollRevealOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.2, triggerOnce = true, rootMargin = '-50px' } = options;
  const ref = useRef<T>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isInView = useInView(ref, {
    once: triggerOnce,
    margin: rootMargin as any,
    amount: threshold,
  });

  return { ref, isInView };
}

// === PARALLAX HOOK ===
interface UseParallaxOptions {
  offset?: [string, string];
  distance?: number;
}

export function useParallax(options: UseParallaxOptions = {}) {
  const { offset = ['start end', 'end start'], distance = 100 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    offset: offset as any,
  });

  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return { ref, y: smoothY, progress: scrollYProgress };
}

// === HEADER SCROLL EFFECT ===
interface UseHeaderScrollOptions {
  threshold?: number;
}

export function useHeaderScroll(options: UseHeaderScrollOptions = {}) {
  const { threshold = 50 } = options;
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.9]);
  const blur = useTransform(scrollY, [0, 100], [0, 20]);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (value) => {
      setIsScrolled(value > threshold);
    });
    return () => unsubscribe();
  }, [scrollY, threshold]);

  return { isScrolled, bgOpacity, blur };
}

// === 3D TILT EFFECT ===
interface UseTiltOptions {
  maxRotation?: number;
}

export function useTilt<T extends HTMLElement = HTMLDivElement>(
  options: UseTiltOptions = {}
) {
  const { maxRotation = 10 } = options;
  const ref = useRef<T>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [maxRotation, -maxRotation]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-maxRotation, maxRotation]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return {
    ref,
    style: {
      rotateX,
      rotateY,
      transformStyle: 'preserve-3d' as const,
    },
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}

// === COUNT UP ANIMATION ===
interface UseCountUpOptions {
  duration?: number;
  start?: number;
}

export function useCountUp(end: number, options: UseCountUpOptions = {}) {
  const { duration = 2, start = 0 } = options;
  const [count, setCount] = useState(start);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(start + progress * (end - start)));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [inView, end, duration, start]);

  return { count, ref };
}

// === REDUCED MOTION CHECK ===
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// === SCROLL DIRECTION ===
export function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > prevScrollY) {
        setDirection('down');
      } else if (currentScrollY < prevScrollY) {
        setDirection('up');
      }
      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY]);

  return direction;
}
