/**
 * UI Types
 *
 * Типи для UI компонентів
 */

import type { LucideIcon } from 'lucide-react';

// ============================================
// Navigation
// ============================================

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

// ============================================
// Cart
// ============================================

export interface CartLine {
  id: string;
  name: string;
  size: string;
  price: number;
  qty: number;
  image?: string;
  flowerSlug: string;
  length: number;
  // Для кастомних цін (знижка/націнка для клієнта)
  originalPrice?: number; // Оригінальна ціна, якщо змінена
  // Для кастомних позицій (послуги, товари з чужого складу)
  isCustom?: boolean; // true = кастомна позиція без впливу на склад
  customNote?: string; // Коментар до кастомної позиції
}

// ============================================
// Analytics UI
// ============================================

/**
 * @deprecated Використовуйте KpiData з api.ts
 */
export interface Kpi {
  label: string;
  value: string;
  delta: string;
}

/**
 * @deprecated Використовуйте CategorySplitData з api.ts
 */
export interface CategorySplit {
  name: string;
  value: number;
  color: string;
}

/**
 * @deprecated Використовуйте SupplyPlanData з api.ts
 */
export interface SupplyPlan {
  nextDate: string;
  recommended: string;
  currentStock: string;
  forecast: string;
}

export type WeeklyRevenue = number[];
export type OrdersPerWeek = number[];

// ============================================
// Blog
// ============================================

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
}
