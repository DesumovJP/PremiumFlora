/**
 * API Types
 *
 * Типи для взаємодії з Strapi API
 */

// ============================================
// POS API Types
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
  paymentStatus?: 'pending' | 'paid' | 'expected';
}

export interface WriteOffInput {
  operationId: string;
  flowerSlug: string;
  length: number;
  qty: number;
  reason: 'damage' | 'expiry' | 'adjustment' | 'other';
  notes?: string;
}

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

export interface SaleResponse {
  success: boolean;
  idempotent?: boolean;
  data?: Transaction;
  stockUpdates?: Array<{
    flowerSlug: string;
    length: number;
    decremented: number;
  }>;
  message?: string;
  error?: ApiError;
  alert?: ApiAlert;
}

export interface WriteOffResponse {
  success: boolean;
  idempotent?: boolean;
  data?: Transaction;
  stockUpdate?: {
    flowerSlug: string;
    length: number;
    decremented: number;
    newStock: number;
  };
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
// Transaction Types
// ============================================

export interface TransactionItem {
  flowerSlug: string;
  length: number;
  qty: number;
  price: number;
  name: string;
  subtotal?: number;
}

export interface Transaction {
  id: number;
  documentId: string;
  date: string;
  type: 'sale' | 'writeOff';
  operationId: string;
  paymentStatus: 'pending' | 'paid' | 'expected' | 'cancelled';
  amount: number;
  items: TransactionItem[];
  customer?: Customer;
  paymentDate?: string;
  notes?: string;
  writeOffReason?: 'damage' | 'expiry' | 'adjustment' | 'other';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Customer Types
// ============================================

export interface Customer {
  id: number;
  documentId: string;
  name: string;
  type: 'VIP' | 'Regular' | 'Wholesale';
  phone?: string;
  email?: string;
  address?: string;
  totalSpent: number;
  orderCount: number;
  transactions?: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  type: 'VIP' | 'Regular' | 'Wholesale';
  phone?: string;
  email?: string;
  address?: string;
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
}

export interface SupplyPlanData {
  nextDate: string;
  recommended: string;
  currentStock: number;
  forecast: string;
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
}

// ============================================
// Generic API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  alert?: ApiAlert;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// ============================================
// Transaction Filters
// ============================================

export interface TransactionFilters {
  type?: 'sale' | 'writeOff';
  paymentStatus?: 'pending' | 'paid' | 'expected' | 'cancelled';
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}
