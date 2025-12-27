/**
 * Types Index
 *
 * Централізований експорт всіх типів
 *
 * Структура:
 * - entities.ts - Основні бізнес-сутності (Flower, Customer, Transaction)
 * - api.ts - API request/response типи
 * - ui.ts - UI компонент типи
 * - strapi.ts - Strapi CMS типи
 * - import.ts - Excel import типи
 * - supply.ts - Supply planning типи
 */

// Core business entities
export type {
  Variant,
  Flower,
  Product,
  Customer,
  CustomerType,
  Client,
  Transaction,
  TransactionType,
  TransactionItem,
  PaymentStatus,
  WriteOffReason,
  Order,
} from './entities';

// API types
export type {
  ApiError,
  ApiAlert,
  ApiResponse,
  SaleItem,
  CreateSaleInput,
  WriteOffInput,
  StockUpdate,
  SaleResponse,
  WriteOffResponse,
  ConfirmPaymentResponse,
  CreateCustomerInput,
  TransactionFilters,
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
} from './api';

// UI types
export type {
  NavItem,
  CartLine,
  Kpi,
  CategorySplit,
  SupplyPlan,
  WeeklyRevenue,
  OrdersPerWeek,
  BlogPost,
} from './ui';

// Strapi types
export type {
  StrapiImage,
  ImageFormat,
  StrapiBlock,
  StrapiVariant,
  StrapiFlower,
  StrapiResponse,
  StrapiListResponse,
  StrapiPagination,
} from './strapi';

// Import types
export type {
  StockMode,
  PriceMode,
  SupplyStatus,
  ImportOptions,
  ImportError,
  ImportWarning,
  ImportStats,
  UpsertOperation,
  NormalizedRow,
  ImportResultData,
  ImportSuccessResponse,
  ImportErrorResponse,
  ImportResponse,
} from './import';

// Supply types
export type {
  LowStockVariant,
  PlannedSupplyItem,
  FlowerSearchResult,
  PlannedSupplyExportData,
} from './supply';
