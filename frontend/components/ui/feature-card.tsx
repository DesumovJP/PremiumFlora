'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  index?: number;
  centered?: boolean;
  accentColor?: 'emerald' | 'sky' | 'amber' | 'rose' | 'violet' | 'slate';
}

const accentColors = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'group-hover:border-emerald-200',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    icon: 'text-sky-600 dark:text-sky-400',
    border: 'group-hover:border-sky-200',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'group-hover:border-amber-200',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    icon: 'text-rose-600 dark:text-rose-400',
    border: 'group-hover:border-rose-200',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    icon: 'text-violet-600 dark:text-violet-400',
    border: 'group-hover:border-violet-200',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800/50',
    icon: 'text-slate-600 dark:text-slate-400',
    border: 'group-hover:border-slate-300',
  },
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  children,
  index = 0,
  centered = false,
  accentColor = 'slate',
}: FeatureCardProps) {
  const colors = accentColors[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="group relative"
    >
      <motion.div
        className={cn(
          'relative h-full p-4 sm:p-6 rounded-2xl overflow-hidden',
          'bg-white dark:bg-[#1a1f2e]',
          'border border-slate-100 dark:border-slate-800',
          colors.border,
          'transition-all duration-300',
          'shadow-sm hover:shadow-lg hover:shadow-slate-200/50',
        )}
        whileHover={{
          y: -6,
          scale: 1.02,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Content */}
        <div className={cn("relative z-10", centered && "text-center")}>
          {/* Icon with accent color */}
          <motion.div
            className={cn(
              'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4',
              colors.bg,
              centered && "mx-auto"
            )}
            whileHover={{ scale: 1.1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", colors.icon)} strokeWidth={1.5} />
          </motion.div>

          {/* Title */}
          <h3 className="text-[14px] sm:text-base font-semibold text-slate-800 mb-1.5 sm:mb-2 group-hover:text-slate-900 transition-colors leading-tight">
            {title}
          </h3>

          {/* Description or Custom Content */}
          {children ? (
            <div className="text-[12px] sm:text-sm text-slate-500 leading-relaxed">
              {children}
            </div>
          ) : description ? (
            <p className="text-[12px] sm:text-sm text-slate-500 leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
