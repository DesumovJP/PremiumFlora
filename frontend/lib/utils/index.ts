/**
 * Utilities Index
 *
 * Централізований експорт всіх утиліт
 */

// Tailwind merge utility
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export {
  formatTime,
  formatDateTime,
  formatDuration,
  formatShortDate,
  formatUkrainianDate,
  formatFullDate,
  formatRelativeTime,
} from './date';

// Currency utilities
export {
  formatPrice,
  formatPriceWithCents,
  formatPriceShort,
  formatPercent,
  formatQuantity,
} from './currency';

// Stock utilities
export {
  STOCK_THRESHOLDS,
  type StockLevel,
  getStockLevel,
  stockTone,
  stockTextColor,
  isCriticalStock,
  isLowStock,
  getStockLabel,
} from './stock';
