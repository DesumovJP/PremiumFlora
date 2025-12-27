/**
 * API Types
 *
 * Типи для запитів та відповідей API
 */

import type {
  Customer,
  Transaction,
  TransactionItem,
  PaymentStatus,
  WriteOffReason,
  CustomerType,
} from './entities';

// ============================================
// Generic API Response
// ============================================

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiAlert {
  type: 'success' | 'error';
  title: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  alert?: ApiAlert;
}

// ============================================
// POS API Types (Sales, Write-offs)
// ============================================

export interface SaleItem {
  flowerSlug: string;
  length: number;
  qty: number;
  price: number;
  name: string;
}

export interface CreateSaleInput {
  operationId: string;
  customerId: string;
  items: SaleItem[];
  discount?: number;
  notes?: string;
  paymentStatus?: PaymentStatus;
}

export interface WriteOffInput {
  operationId: string;
  flowerSlug: string;
  length: number;
  qty: number;
  reason: WriteOffReason;
  notes?: string;
}

export interface StockUpdate {
  flowerSlug: string;
  length: number;
  decremented: number;
  newStock?: number;
}

export interface SaleResponse {
  success: boolean;
  idempotent?: boolean;
  data?: Transaction;
  stockUpdates?: StockUpdate[];
  message?: string;
  error?: ApiError;
  alert?: ApiAlert;
}

export interface WriteOffResponse {
  success: boolean;
  idempotent?: boolean;
  data?: Transaction;
  stockUpdate?: StockUpdate;
  message?: string;
  error?: ApiError;
  alert?: ApiAlert;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  idempotent?: boolean;
  data?: Transaction;
  message?: string;
  error?: ApiError;
  alert?: ApiAlert;
}

// ============================================
// Customer API Types
// ============================================

export interface CreateCustomerInput {
  name: string;
  type: CustomerType;
  phone?: string;
  email?: string;
  address?: string;
}

// ============================================
// Transaction Filters
// ============================================

export interface TransactionFilters {
  type?: 'sale' | 'writeOff';
  paymentStatus?: PaymentStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

// ============================================
// Analytics Types
// ============================================

export interface StockLevel {
  flowerSlug: string;
  flowerName: string;
  length: number;
  stock: number;
  price: number;
  value: number;
}

export interface SalesMetrics {
  period: 'day' | 'week' | 'month';
  totalSales: number;
  totalAmount: number;
  avgOrderValue: number;
  itemsSold: number;
}

export interface WriteOffSummary {
  totalWriteOffs: number;
  totalItems: number;
  byReason: Record<string, number>;
  recentWriteOffs: Array<{
    date: string;
    flowerName: string;
    length: number;
    qty: number;
    reason: string;
  }>;
}

export interface TopCustomer {
  id: string;
  documentId: string;
  name: string;
  type: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string | null;
}

export interface DailySale {
  date: string;
  day: string;
  orders: number;
  revenue: number;
  avg: number;
  status: 'high' | 'mid' | 'low';
  writeOffs: number;
  supplyAmount?: number;
}

export interface TopWriteOffFlower {
  name: string;
  totalQty: number;
  totalAmount: number;
  percentage: number;
}

export interface KpiData {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface CategorySplitData {
  name: string;
  value: number;
  color: string;
}

export interface TopProduct {
  name: string;
  share: number;
  /** @deprecated */
  sold?: number;
  /** @deprecated */
  revenue?: number;
}

export interface SupplyPlanData {
  nextDate: string;
  recommended: string;
  currentStock: number;
  forecast: string;
}

export interface PendingCustomer {
  customerId: string;
  customerName: string;
  amount: number;
}

export interface DashboardData {
  kpis: KpiData[];
  weeklyRevenue: number[];
  ordersPerWeek: number[];
  categorySplit: CategorySplitData[];
  topProducts: TopProduct[];
  supplyPlan: SupplyPlanData;
  dailySales: DailySale[];
  stockLevels: StockLevel[];
  writeOffSummary: WriteOffSummary;
  topCustomers: TopCustomer[];
  topWriteOffFlowers: TopWriteOffFlower[];
  totalPendingAmount: number;
  pendingOrdersCount: number;
  pendingByCustomer: PendingCustomer[];
}
