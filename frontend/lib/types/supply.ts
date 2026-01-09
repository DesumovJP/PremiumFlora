/**
 * Supply Types
 *
 * Типи для функціоналу поставок
 */

// ============================================
// Low Stock & Supply Planning
// ============================================

export interface LowStockVariant {
  variantId: number;
  variantDocumentId: string;
  flowerId: number;
  flowerDocumentId: string;
  flowerName: string;
  flowerSlug: string;
  imageUrl: string | null;
  length: number;
  currentStock: number;
  price: number;
}

export interface PlannedSupplyItem {
  id: string;
  flowerId?: number;
  flowerDocumentId?: string;
  variantId?: number;
  variantDocumentId?: string;
  flowerName: string;
  flowerSlug: string;
  imageUrl?: string | null;
  length: number;
  currentStock: number;
  plannedQuantity: number;
  price: number;
  isNew?: boolean;
  isManual?: boolean;
  isActive?: boolean;
}

export interface FlowerSearchResult {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
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
