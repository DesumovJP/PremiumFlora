/**
 * Excel Import Types (Frontend)
 */

export type StockMode = 'replace' | 'add' | 'skip';
export type PriceMode = 'replace' | 'lower' | 'skip';
export type SupplyStatus = 'success' | 'failed' | 'dry-run';

export interface ImportOptions {
  dryRun?: boolean;
  stockMode?: StockMode;
  priceMode?: PriceMode;
  awb?: string;
  supplier?: string;
  forceImport?: boolean; // Ігнорувати перевірку checksum і дозволити імпорт дублікату

  // Налаштування цін
  exchangeRate?: number; // Курс USD → UAH (наприклад, 41.5)
  marginMultiplier?: number; // Множник маржі (наприклад, 1.3 для 30% маржі)
  applyPriceCalculation?: boolean; // Чи застосовувати розрахунок ціни (курс * маржа)
}

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

export interface ImportResultData {
  supplyId: number;
  status: SupplyStatus;
  stats: ImportStats;
  errors: ImportError[];
  warnings: ImportWarning[];
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
