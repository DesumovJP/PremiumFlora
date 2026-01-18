/**
 * Excel Import Pipeline Types
 *
 * Типи для пайплайну імпорту Excel файлів з накладними квітів
 */

// ============================================
// Import Options & Modes
// ============================================

export type StockMode = 'replace' | 'add' | 'skip';
export type PriceMode = 'replace' | 'lower' | 'skip';
export type SupplyStatus = 'success' | 'failed' | 'dry-run';
export type CostCalculationMode = 'simple' | 'full';

/**
 * Параметри для повного розрахунку собівартості
 * Формула: (basePrice + airPerStem + truckPerStem) × (1 + transferFee) + taxPerStem
 */
export interface FullCostParams {
  truckCostPerBox: number;     // Вартість доставки траком за коробку (default: 75$)
  transferFeePercent: number;  // Відсоток за переказ (default: 3.5 = 3.5%)
  taxPerStem: number;          // Податок за квітку (default: 0.05$)
}

// Оверрайди для редагування нормалізації під час імпорту
export interface RowOverride {
  flowerName?: string;
  length?: number;
}

export interface ImportOptions {
  dryRun: boolean;
  stockMode: StockMode;
  priceMode: PriceMode;
  awb?: string;
  supplier?: string;
  userId?: number;
  forceImport?: boolean; // Ігнорувати перевірку checksum і дозволити імпорт дублікату
  rowOverrides?: Record<string, RowOverride>; // hash -> override values

  // Налаштування цін
  exchangeRate?: number; // Курс USD → UAH (наприклад, 41.5)
  marginMultiplier?: number; // Множник маржі (наприклад, 1.3 для 30% маржі)
  applyPriceCalculation?: boolean; // Чи застосовувати розрахунок ціни (курс * маржа)

  // Розрахунок собівартості
  costCalculationMode?: CostCalculationMode; // 'simple' | 'full' (default: 'simple')
  fullCostParams?: FullCostParams;           // Параметри для повного розрахунку

  // Маржа для ціни продажу
  salePriceMarginPercent?: number;           // Маржа у % (default: 10%)
}

// ============================================
// Excel Format Detection
// ============================================

export type ExcelFormat = 'colombia' | 'ross' | 'unknown';

export interface ColumnMapping {
  variety: number;      // Назва сорту
  type?: number;        // Тип квітки (rose, hydrangea, etc.)
  grade: number;        // Довжина або grade (90cm, jumbo, premium)
  units: number;        // Кількість
  price: number;        // Ціна за одиницю
  supplier?: number;    // Постачальник
  total?: number;       // Загальна сума (для валідації)
  awb?: number;         // Air Waybill
  qbCode?: number;      // QB/HB/FB code
  recipient?: number;   // Отримувач
}

export interface FormatDetectionResult {
  format: ExcelFormat;
  mapping: ColumnMapping;
  headerRow: number;
  dataStartRow: number;
  metadata: {
    documentId?: string;
    date?: Date;
    awb?: string;
    supplier?: string;
    // Дані для повного розрахунку собівартості (Ross формат)
    transport?: number;       // Вартість авіа доставки (Transport)
    totalBoxes?: number;      // Загальна кількість коробок (FB * 2)
    totalFB?: number;         // Сума FB з таблиці
  };
}

// ============================================
// Raw & Parsed Data
// ============================================

export interface RawExcelRow {
  rowIndex: number;
  variety?: unknown;
  type?: unknown;
  grade?: unknown;
  units?: unknown;
  price?: unknown;
  total?: unknown;
  supplier?: unknown;
  awb?: unknown;
  qbCode?: unknown;
  recipient?: unknown;
  [key: string]: unknown;
}

export interface ParsedRow {
  rowIndex: number;
  original: Record<string, unknown>;
  variety: string;
  type: string | null;
  grade: string;
  units: number;
  price: number;
  total: number | null;
  supplier: string | null;
  awb: string | null;
  qbCode: string | null;
  recipient: string | null;
  // Дані для групування по коробках (Ross формат)
  boxId?: string;         // Ідентифікатор коробки (CULTIVOS)
  boxFB?: number;         // FB значення коробки (0.5 = 1 коробка)
}

// ============================================
// Normalized Data
// ============================================

export interface NormalizedRow {
  rowIndex: number;
  original: Record<string, unknown>;
  flowerName: string;           // Title Case combined name
  slug: string;                 // kebab-case slug
  length: number | null;        // cm або null для grade-based
  grade: string | null;         // jumbo, premium, або null
  stock: number;                // integer кількість
  price: number;                // decimal ціна
  supplier: string | null;
  awb: string | null;
  hash: string;                 // Унікальний хеш рядка
}

export interface NormalizationResult {
  normalized: NormalizedRow[];
  warnings: ImportWarning[];
}

// ============================================
// Validation
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

export interface ValidationResult {
  valid: NormalizedRow[];
  errors: ImportError[];
  warnings: ImportWarning[];
}

// ============================================
// Upsert Operations
// ============================================

export interface UpsertOperation {
  type: 'create' | 'update';
  entity: 'flower' | 'variant';
  documentId?: string;
  data: Record<string, unknown>;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

export interface UpsertResult {
  flowersCreated: number;
  flowersUpdated: number;
  variantsCreated: number;
  variantsUpdated: number;
  operations: UpsertOperation[];
}

// ============================================
// Import Result
// ============================================

export interface ImportStats {
  totalRows: number;
  validRows: number;
  flowersCreated: number;
  flowersUpdated: number;
  variantsCreated: number;
  variantsUpdated: number;
}

export interface ImportResult {
  supplyId: number;
  status: SupplyStatus;
  stats: ImportStats;
  errors: ImportError[];
  warnings: ImportWarning[];
  rows: NormalizedRow[];
  operations?: UpsertOperation[];
}

// ============================================
// Supply Record (for Strapi)
// ============================================

export interface SupplyRowData {
  original: Record<string, unknown>;
  normalized: {
    flowerName: string;
    length: number | null;
    grade: string | null;
    stock: number;
    costPrice: number;  // Собівартість з Excel
    supplier: string | null;
    awb: string | null;
  };
  hash: string;
  outcome: 'created' | 'updated' | 'skipped' | 'error';
  error?: string;
}

export interface SupplyData {
  filename: string;
  checksum: string;
  dateParsed: string;
  awb: string | null;
  supplier: string | null;
  rows: SupplyRowData[];
  supplyStatus: SupplyStatus;
  supplyErrors: ImportError[];
  supplyWarnings: ImportWarning[];
  users_permissions_user: number | null;
  publishedAt: string;
}
