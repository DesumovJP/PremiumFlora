'use client';

import { cn } from '@/lib/utils';

// Gradient Orb - м'яка градієнтна пляма
export function GradientOrb({
  className,
  color = 'emerald',
  size = 'md',
  blur = 'default',
  animate = false,
}: {
  className?: string;
  color?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  blur?: 'default' | 'soft' | 'strong';
  animate?: boolean;
}) {
  const colors = {
    emerald: 'from-emerald-400/30 via-emerald-300/20 to-transparent',
    cyan: 'from-cyan-400/25 via-cyan-300/15 to-transparent',
    violet: 'from-violet-400/25 via-violet-300/15 to-transparent',
    amber: 'from-amber-400/20 via-amber-300/10 to-transparent',
    rose: 'from-rose-400/20 via-rose-300/10 to-transparent',
  };

  const sizes = {
    sm: 'w-48 h-48 sm:w-64 sm:h-64',
    md: 'w-72 h-72 sm:w-96 sm:h-96',
    lg: 'w-96 h-96 sm:w-[32rem] sm:h-[32rem]',
    xl: 'w-[28rem] h-[28rem] sm:w-[40rem] sm:h-[40rem]',
  };

  const blurs = {
    default: 'blur-3xl',
    soft: 'blur-2xl',
    strong: 'blur-[6.25rem]',
  };

  return (
    <div
      className={cn(
        'absolute rounded-full bg-gradient-radial pointer-events-none',
        colors[color],
        sizes[size],
        blurs[blur],
        animate && 'animate-float-slow',
        className
      )}
      style={{
        background: `radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 40%, var(--tw-gradient-to) 70%)`,
      }}
    />
  );
}

// Wave Divider - хвилястий роздільник між секціями
export function WaveDivider({
  className,
  position = 'bottom',
  variant = 'simple',
  color = 'white',
  flip = false,
}: {
  className?: string;
  position?: 'top' | 'bottom';
  variant?: 'simple' | 'layered' | 'curved';
  color?: 'white' | 'slate' | 'emerald-soft';
  flip?: boolean;
}) {
  const fills = {
    white: '#ffffff',
    slate: '#f8fafc',
    'emerald-soft': '#f0fdf4',
  };

  const positionClasses = {
    top: 'top-0',
    bottom: 'bottom-0',
  };

  const waves = {
    simple: (
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <path
          d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
          fill={fills[color]}
        />
      </svg>
    ),
    layered: (
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <path
          d="M0 120L48 110C96 100 192 80 288 75C384 70 480 80 576 85C672 90 768 90 864 82.5C960 75 1056 60 1152 55C1248 50 1344 55 1392 57.5L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
          fill={fills[color]}
          fillOpacity="0.5"
        />
        <path
          d="M0 120L48 115C96 110 192 100 288 92.5C384 85 480 80 576 82.5C672 85 768 95 864 97.5C960 100 1056 95 1152 87.5C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
          fill={fills[color]}
        />
      </svg>
    ),
    curved: (
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <path
          d="M0 80L1440 80L1440 40C1440 40 1200 0 720 0C240 0 0 40 0 40L0 80Z"
          fill={fills[color]}
        />
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        'absolute left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10',
        positionClasses[position],
        flip && 'rotate-180',
        className
      )}
      style={{ height: variant === 'curved' ? '5rem' : '7.5rem' }}
    >
      {waves[variant]}
    </div>
  );
}

// Noise Texture Overlay - subtle grain effect
export function NoiseTexture({
  className,
  opacity = 0.03,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none z-0',
        className
      )}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
      }}
    />
  );
}

// Decorative Line - тонка акцентна лінія
export function DecorativeLine({
  className,
  variant = 'gradient',
  direction = 'horizontal',
}: {
  className?: string;
  variant?: 'gradient' | 'solid' | 'dashed';
  direction?: 'horizontal' | 'vertical';
}) {
  const variants = {
    gradient: 'bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent',
    solid: 'bg-emerald-200/60',
    dashed: 'border-dashed border-emerald-200/60',
  };

  return (
    <div
      className={cn(
        'pointer-events-none',
        direction === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        variant === 'dashed' ? 'border-t' : variants[variant],
        className
      )}
    />
  );
}

// Floating Dots - декоративні точки
export function FloatingDots({
  className,
  count = 5,
}: {
  className?: string;
  count?: number;
}) {
  const dots = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 8,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 4,
  }));

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute rounded-full bg-emerald-400/20"
          style={{
            width: dot.size,
            height: dot.size,
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            animation: `floatDot ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Mesh Gradient Background
export function MeshGradient({
  className,
  variant = 'emerald',
}: {
  className?: string;
  variant?: 'emerald' | 'ocean' | 'sunset';
}) {
  const gradients = {
    emerald: `
      radial-gradient(at 40% 20%, rgba(16, 185, 129, 0.15) 0px, transparent 50%),
      radial-gradient(at 80% 0%, rgba(6, 182, 212, 0.1) 0px, transparent 50%),
      radial-gradient(at 0% 50%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
      radial-gradient(at 80% 50%, rgba(139, 92, 246, 0.08) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(6, 182, 212, 0.1) 0px, transparent 50%)
    `,
    ocean: `
      radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.2) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
      radial-gradient(at 50% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%)
    `,
    sunset: `
      radial-gradient(at 100% 0%, rgba(251, 146, 60, 0.15) 0px, transparent 50%),
      radial-gradient(at 0% 50%, rgba(236, 72, 153, 0.1) 0px, transparent 50%),
      radial-gradient(at 50% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)
    `,
  };

  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ background: gradients[variant] }}
    />
  );
}
