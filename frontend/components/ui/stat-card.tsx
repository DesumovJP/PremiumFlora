'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

export interface StatCardProps {
  value: string;
  label: string;
  icon: LucideIcon;
  index?: number;
  gradient?: string;
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({
  value,
  label,
  icon: Icon,
  index = 0,
  gradient = 'from-emerald-50 to-teal-50',
  iconBg = 'bg-emerald-100',
  iconColor = 'text-emerald-600',
}: StatCardProps) {
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
          'relative h-full p-4 sm:p-8 rounded-xl sm:rounded-2xl cursor-default overflow-hidden',
          'bg-white border border-slate-100',
          'text-center',
        )}
        whileHover={{
          y: -4,
          boxShadow: '0 20px 40px -15px rgba(16, 185, 129, 0.15), 0 8px 20px -10px rgba(0, 0, 0, 0.08)',
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Gradient background on hover */}
        <motion.div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300',
            gradient
          )}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            className={cn(
              'mx-auto w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4',
              'transition-all duration-300',
              iconBg
            )}
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Icon className={cn('w-5 h-5 sm:w-7 sm:h-7', iconColor)} strokeWidth={1.5} />
          </motion.div>

          {/* Value */}
          <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-1 sm:mb-2 group-hover:text-slate-800 transition-colors">
            {value}
          </div>

          {/* Label */}
          <div className="text-[11px] sm:text-sm font-medium text-slate-500 group-hover:text-slate-600 transition-colors">
            {label}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
