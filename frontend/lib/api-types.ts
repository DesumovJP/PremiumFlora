/**
 * API Types Re-export
 *
 * Backward compatibility: реекспорт з нової структури types/
 * Всі нові імпорти мають використовувати @/lib/types
 */

export type {
  // POS API
  SaleItem,
  CreateSaleInput,
  WriteOffInput,
  ApiError,
  ApiAlert,
  SaleResponse,
  WriteOffResponse,
  ConfirmPaymentResponse,

  // Transaction
  TransactionItem,
  Transaction,

  // Customer
  Customer,
  CreateCustomerInput,

  // Analytics
  StockLevel,
  SalesMetrics,
  WriteOffSummary,
  TopCustomer,
  DailySale,
  TopWriteOffFlower,
  KpiData,
  CategorySplitData,
  TopProduct,
  SupplyPlanData,
  PendingCustomer,
  DashboardData,

  // Generic
  ApiResponse,
  TransactionFilters,
} from './types/index';

// Re-export StrapiListResponse for backward compatibility
export type { StrapiListResponse } from './types/strapi';
