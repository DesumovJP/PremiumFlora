'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  gradient?: string;
  iconBg?: string;
  iconColor?: string;
  index?: number;
  centered?: boolean;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  children,
  gradient = 'from-emerald-50 to-teal-50',
  iconBg = 'bg-emerald-100',
  iconColor = 'text-emerald-600',
  index = 0,
  centered = false,
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <motion.div
        className={cn(
          'relative h-full p-4 sm:p-8 rounded-2xl sm:rounded-3xl cursor-default overflow-hidden',
          'bg-[#faf8f5] dark:bg-[#1a1f2e]',
          'transition-all duration-300',
        )}
        style={{
          boxShadow: isHovered
            ? '4px 4px 12px rgba(200, 190, 175, 0.35), -4px -4px 12px rgba(255, 255, 255, 0.6)'
            : '3px 3px 8px rgba(200, 190, 175, 0.25), -3px -3px 8px rgba(255, 255, 255, 0.5)',
        }}
        whileHover={{
          y: -2,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Subtle inner glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, transparent 40%)',
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />

        {/* Content */}
        <div className={cn("relative z-10", centered && "text-center")}>
          {/* Icon - subtle neumorphic style */}
          <motion.div
            className={cn(
              'w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4',
              'transition-all duration-300 bg-[#f8f6f3] dark:bg-[#1a1f2e]',
              centered && "mx-auto"
            )}
            style={{
              boxShadow: 'inset 1px 1px 2px rgba(200, 190, 175, 0.15), inset -1px -1px 2px rgba(255, 255, 255, 0.4)',
            }}
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Icon className={cn('w-5 h-5 sm:w-7 sm:h-7', iconColor)} strokeWidth={1.5} />
          </motion.div>

          {/* Title */}
          <h3 className="text-sm sm:text-xl font-semibold text-slate-800 mb-1 sm:mb-2 group-hover:text-slate-900 transition-colors leading-tight">
            {title}
          </h3>

          {/* Description or Custom Content */}
          {children ? (
            <div className="text-xs sm:text-base text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">
              {children}
            </div>
          ) : description ? (
            <p className="text-xs sm:text-base text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors line-clamp-3 sm:line-clamp-none">
              {description}
            </p>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
