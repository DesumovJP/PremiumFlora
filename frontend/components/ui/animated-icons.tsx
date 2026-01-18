/**
 * Animated Icons
 *
 * Premium animated icons for success, error, warning, loading states
 * SVG-based with smooth CSS animations
 */

"use client";

import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const strokeWidthMap = {
  sm: 2.5,
  md: 2,
  lg: 1.8,
  xl: 1.5,
};

/**
 * Animated Success Checkmark
 * Draws a checkmark with smooth animation
 */
export function AnimatedCheckmark({ size = "md", className }: AnimatedIconProps) {
  return (
    <svg
      className={cn(sizeMap[size], "text-emerald-500", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidthMap[size]}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Background circle */}
      <circle
        cx="12"
        cy="12"
        r="10"
        className="opacity-20"
        fill="currentColor"
        stroke="none"
      />
      {/* Animated circle border */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        className="animate-circle-draw"
        style={{
          strokeDasharray: 63,
          strokeDashoffset: 63,
          animation: "circleDraw 0.5s ease-out forwards",
        }}
      />
      {/* Animated checkmark */}
      <path
        d="M8 12l2.5 2.5L16 9"
        className="animate-checkmark-draw"
        style={{
          strokeDasharray: 14,
          strokeDashoffset: 14,
          animation: "checkmarkDraw 0.3s ease-out 0.3s forwards",
        }}
      />
    </svg>
  );
}

/**
 * Animated Error X
 * Draws an X with shake animation
 */
export function AnimatedError({ size = "md", className }: AnimatedIconProps) {
  return (
    <svg
      className={cn(sizeMap[size], "text-rose-500 animate-icon-pop", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidthMap[size]}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Background circle */}
      <circle
        cx="12"
        cy="12"
        r="10"
        className="opacity-20"
        fill="currentColor"
        stroke="none"
      />
      {/* Circle border */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
      />
      {/* X lines */}
      <path d="M15 9l-6 6" />
      <path d="M9 9l6 6" />
    </svg>
  );
}

/**
 * Animated Warning Triangle
 * Pulses subtly to draw attention
 */
export function AnimatedWarning({ size = "md", className }: AnimatedIconProps) {
  return (
    <svg
      className={cn(sizeMap[size], "text-amber-500 animate-icon-pop", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidthMap[size]}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Background triangle */}
      <path
        d="M12 2L2 20h20L12 2z"
        className="opacity-20"
        fill="currentColor"
        stroke="none"
      />
      {/* Triangle border */}
      <path d="M12 2L2 20h20L12 2z" fill="none" />
      {/* Exclamation mark */}
      <line x1="12" y1="9" x2="12" y2="13" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Animated Info Circle
 */
export function AnimatedInfo({ size = "md", className }: AnimatedIconProps) {
  return (
    <svg
      className={cn(sizeMap[size], "text-sky-500 animate-icon-pop", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidthMap[size]}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Background circle */}
      <circle
        cx="12"
        cy="12"
        r="10"
        className="opacity-20"
        fill="currentColor"
        stroke="none"
      />
      {/* Circle border */}
      <circle cx="12" cy="12" r="10" fill="none" />
      {/* Info i */}
      <line x1="12" y1="16" x2="12" y2="12" />
      <circle cx="12" cy="8" r="0.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Premium Spinner
 * Smooth rotating loader with gradient
 */
export function AnimatedSpinner({ size = "md", className }: AnimatedIconProps) {
  return (
    <svg
      className={cn(sizeMap[size], "animate-spin text-emerald-500", className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      {/* Background track */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeWidthMap[size]}
        className="opacity-20"
      />
      {/* Spinning arc */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeWidthMap[size]}
        strokeLinecap="round"
        strokeDasharray="32 32"
        strokeDashoffset="8"
      />
    </svg>
  );
}

/**
 * Loading Dots
 * Three bouncing dots for loading states
 */
export function AnimatedDots({ size = "md", className }: AnimatedIconProps) {
  const dotSize = size === "sm" ? "w-1 h-1" : size === "md" ? "w-1.5 h-1.5" : size === "lg" ? "w-2 h-2" : "w-3 h-3";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className={cn(dotSize, "rounded-full bg-current animate-loading-dot")} />
      <span className={cn(dotSize, "rounded-full bg-current animate-loading-dot")} />
      <span className={cn(dotSize, "rounded-full bg-current animate-loading-dot")} />
    </div>
  );
}

/**
 * Premium Pulse Ring
 * Expanding rings for active/recording states
 */
export function AnimatedPulseRing({ size = "md", className }: AnimatedIconProps) {
  return (
    <div className={cn("relative", sizeMap[size], className)}>
      {/* Outer ring - slow pulse */}
      <span
        className="absolute inset-0 rounded-full bg-current opacity-30"
        style={{
          animation: "pulseRing 2s ease-out infinite",
        }}
      />
      {/* Inner ring - faster pulse */}
      <span
        className="absolute inset-2 rounded-full bg-current opacity-50"
        style={{
          animation: "pulseRing 2s ease-out 0.5s infinite",
        }}
      />
      {/* Center dot */}
      <span className="absolute inset-1/4 rounded-full bg-current" />
    </div>
  );
}

/**
 * Success Animation with Confetti-like particles
 */
export function AnimatedSuccessWithParticles({ size = "lg", className }: AnimatedIconProps) {
  return (
    <div className={cn("relative", sizeMap[size], className)}>
      {/* Particles */}
      <span
        className="absolute -top-1 left-1/2 w-1 h-1 rounded-full bg-emerald-400"
        style={{ animation: "particleUp 0.6s ease-out forwards" }}
      />
      <span
        className="absolute top-1/4 -left-1 w-1 h-1 rounded-full bg-emerald-300"
        style={{ animation: "particleLeft 0.5s ease-out 0.1s forwards" }}
      />
      <span
        className="absolute top-1/4 -right-1 w-1 h-1 rounded-full bg-emerald-400"
        style={{ animation: "particleRight 0.5s ease-out 0.15s forwards" }}
      />
      <span
        className="absolute -bottom-1 left-1/3 w-1 h-1 rounded-full bg-emerald-300"
        style={{ animation: "particleDown 0.6s ease-out 0.2s forwards" }}
      />

      {/* Main checkmark */}
      <AnimatedCheckmark size={size} />
    </div>
  );
}

// Add these keyframes to globals.css
const keyframesCSS = `
@keyframes circleDraw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes checkmarkDraw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes pulseRing {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

@keyframes particleUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px) scale(0);
  }
}

@keyframes particleDown {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(10px) scale(0);
  }
}

@keyframes particleLeft {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-10px) scale(0);
  }
}

@keyframes particleRight {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(10px) scale(0);
  }
}
`;

// Export for documentation
export const __keyframes = keyframesCSS;
