/**
 * Stock Level Utilities
 *
 * Утиліти для роботи з рівнями запасів
 */

/**
 * Порогові значення для рівнів запасів
 */
export const STOCK_THRESHOLDS = {
  /** Критично низький рівень */
  CRITICAL: 10,
  /** Низький рівень */
  LOW: 50,
  /** Середній рівень */
  MEDIUM: 150,
  /** Високий рівень */
  HIGH: 300,
} as const;

/**
 * Типи рівнів запасів
 */
export type StockLevel = 'critical' | 'low' | 'medium' | 'high';

/**
 * Визначає рівень запасів
 */
export function getStockLevel(stock: number): StockLevel {
  if (stock <= STOCK_THRESHOLDS.CRITICAL) return 'critical';
  if (stock <= STOCK_THRESHOLDS.LOW) return 'low';
  if (stock <= STOCK_THRESHOLDS.MEDIUM) return 'medium';
  return 'high';
}

/**
 * Повертає Tailwind класи кольору для рівня запасів
 * Використовується для індикаторів та бейджів
 */
export function stockTone(stock: number): string {
  const level = getStockLevel(stock);

  switch (level) {
    case 'critical':
      return 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30';
    case 'low':
      return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30';
    case 'medium':
      return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30';
    case 'high':
      return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30';
  }
}

/**
 * Повертає текстовий колір для рівня запасів
 */
export function stockTextColor(stock: number): string {
  const level = getStockLevel(stock);

  switch (level) {
    case 'critical':
      return 'text-rose-600 dark:text-rose-400';
    case 'low':
      return 'text-amber-600 dark:text-amber-400';
    case 'medium':
      return 'text-blue-600 dark:text-blue-400';
    case 'high':
      return 'text-emerald-600 dark:text-emerald-400';
  }
}

/**
 * Перевіряє чи запас критично низький
 */
export function isCriticalStock(stock: number): boolean {
  return stock <= STOCK_THRESHOLDS.CRITICAL;
}

/**
 * Перевіряє чи запас низький (включаючи критичний)
 */
export function isLowStock(stock: number): boolean {
  return stock <= STOCK_THRESHOLDS.LOW;
}

/**
 * Повертає мітку рівня запасів українською
 */
export function getStockLabel(stock: number): string {
  const level = getStockLevel(stock);

  switch (level) {
    case 'critical':
      return 'Критично';
    case 'low':
      return 'Низький';
    case 'medium':
      return 'Середній';
    case 'high':
      return 'Достатній';
  }
}
