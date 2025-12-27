/**
 * Types Re-export
 *
 * Backward compatibility: реекспорт з нової структури types/
 * Всі нові імпорти мають використовувати @/lib/types
 */

// Re-export all UI types (original content of this file)
export type {
  Variant,
  Product,
  Client,
  CartLine,
  Order,
  NavItem,
  Kpi,
  CategorySplit,
  SupplyPlan,
  BlogPost,
  WeeklyRevenue,
  OrdersPerWeek,
} from './types/index';

// Also export TopProduct for backward compatibility
export type { TopProduct } from './types/index';
