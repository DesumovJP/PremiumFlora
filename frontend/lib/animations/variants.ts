import { Variants } from 'framer-motion';

// === EASING CURVES ===
export const easing = {
  smooth: [0.4, 0, 0.2, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  spring: [0.175, 0.885, 0.32, 1.275] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
};

// === FADE VARIANTS ===
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: easing.smooth },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easing.smooth },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easing.smooth },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easing.smooth },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easing.smooth },
  },
};

// === STAGGER VARIANTS ===
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easing.smooth },
  },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easing.spring },
  },
};

// === SCALE VARIANTS ===
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easing.spring },
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easing.bounce },
  },
};

// === SLIDE VARIANTS ===
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easing.smooth },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easing.smooth },
  },
};

// === PAGE TRANSITIONS ===
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easing.smooth },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: easing.smooth },
  },
};

// === HOVER ANIMATIONS ===
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.3, ease: easing.smooth },
};

export const hoverLift = {
  y: -8,
  transition: { duration: 0.3, ease: easing.smooth },
};

// === TAP ANIMATIONS ===
export const tapScale = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// === CARD VARIANTS ===
export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  },
  hover: {
    scale: 1.02,
    y: -8,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.3, ease: easing.smooth },
  },
};

// === IMAGE VARIANTS ===
export const imageZoom: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.08,
    transition: { duration: 0.6, ease: easing.smooth },
  },
};

// === MENU VARIANTS ===
export const menuSlideIn: Variants = {
  closed: {
    x: '100%',
    transition: { type: 'spring', damping: 25, stiffness: 200 },
  },
  open: {
    x: 0,
    transition: { type: 'spring', damping: 25, stiffness: 200 },
  },
};

// === BACKDROP VARIANTS ===
export const backdropFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// === UTILITY FUNCTIONS ===
export const createStaggerDelay = (index: number, baseDelay: number = 0.1) => ({
  delay: index * baseDelay,
});
