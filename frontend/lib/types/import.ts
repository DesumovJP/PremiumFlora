/**
 * Import Types
 *
 * Типи для функціоналу імпорту Excel
 */

// ============================================
// Import Options & Modes
// ============================================

export type StockMode = 'replace' | 'add' | 'skip';
export type PriceMode = 'replace' | 'lower' | 'skip';  // Legacy, kept for compatibility
export type SupplyStatus = 'success' | 'failed' | 'dry-run';

// Оверрайди для редагування нормалізації
export interface RowOverride {
  flowerName?: string;
  length?: number;
}

export interface ImportOptions {
  dryRun?: boolean;
  stockMode?: StockMode;
  awb?: string;
  supplier?: string;
  forceImport?: boolean;
  rowOverrides?: Record<string, RowOverride>; // hash -> override values
}

// ============================================
// Import Results
// ============================================

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: unknown;
}

export interface ImportWarning {
  row: number;
  field: string;
  message: string;
  originalValue: unknown;
  normalizedValue: unknown;
}

export interface ImportStats {
  totalRows: number;
  validRows: number;
  flowersCreated: number;
  flowersUpdated: number;
  variantsCreated: number;
  variantsUpdated: number;
}

// ============================================
// Upsert Operations
// ============================================

export interface UpsertOperation {
  type: 'create' | 'update';
  entity: 'flower' | 'variant';
  documentId: string;
  data: {
    name?: string;
    slug?: string;
    length?: number;
    stock?: number;
    costPrice?: number;
    price?: number;
    flowerId?: number;
  };
  before?: {
    stock?: number;
    costPrice?: number;
    price?: number;
  };
  after?: {
    stock?: number;
    costPrice?: number;
    price?: number;
  };
}

export interface NormalizedRow {
  flowerName: string;
  slug: string;
  length: number | null;
  grade: string | null;
  stock: number;
  price: number;  // Це собівартість з Excel (costPrice)
  supplier: string | null;
  awb: string | null;
  rowIndex: number;
  hash: string;
  original: Record<string, unknown>;
}

// ============================================
// Import Response
// ============================================

export interface ImportResultData {
  supplyId: number;
  status: SupplyStatus;
  stats: ImportStats;
  errors: ImportError[];
  warnings: ImportWarning[];
  rows?: NormalizedRow[];
  operations?: UpsertOperation[];
}

export interface ImportSuccessResponse {
  success: true;
  data: ImportResultData;
}

export interface ImportErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    existingSupplyId?: number;
  };
}

export type ImportResponse = ImportSuccessResponse | ImportErrorResponse;
