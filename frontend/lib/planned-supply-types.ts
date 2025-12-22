/**
 * Planned Supply Types
 *
 * Типи для функціоналу запланованих поставок
 */

export interface LowStockVariant {
  variantId: number;
  variantDocumentId: string;
  flowerId: number;
  flowerDocumentId: string;
  flowerName: string;
  flowerSlug: string;
  length: number;
  currentStock: number;
  price: number;
}

export interface PlannedSupplyItem {
  id: string; // Унікальний ID для React key (flowerId-variantId або temporary-{uuid})
  flowerId?: number;
  flowerDocumentId?: string;
  variantId?: number;
  variantDocumentId?: string;
  flowerName: string;
  flowerSlug: string;
  length: number;
  currentStock: number;
  plannedQuantity: number; // Кількість для замовлення
  price: number;
  isNew?: boolean; // Чи це новий товар (не існує в системі)
  isManual?: boolean; // Чи додано вручну
}

export interface FlowerSearchResult {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  variants: Array<{
    id: number;
    documentId: string;
    length: number;
    stock: number;
    price: number;
  }>;
}

export interface PlannedSupplyExportData {
  flowerName: string;
  length: number;
  currentStock: number;
  plannedQuantity: number;
  price: number;
  total: number;
}
