import type { Product } from "@/lib/types";
import type { WriteOffInput } from "@/lib/api-types";

// Stock tone utility
export const stockTone = (stock: number) => {
  if (stock >= 300) return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-800/50";
  if (stock >= 150) return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-800/50";
  return "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 ring-1 ring-rose-100 dark:ring-rose-800/50";
};

// Main props for ProductsSection
export type ProductsSectionProps = {
  summary: { totalItems: number; stock: number };
  products: Product[];
  onOpenSupply: () => void;
  onOpenExport: () => void;
  onWriteOff?: (data: Omit<WriteOffInput, "operationId">) => Promise<boolean>;
  onRefresh?: () => void;
  onLogActivity?: (type: 'variantDelete' | 'productEdit' | 'productCreate' | 'productDelete' | 'supply', details: {
    productName?: string;
    productId?: string;
    variantLength?: number;
    variantsCount?: number;
    variantPrice?: number;
    variantStock?: number;
    totalStock?: number;
    variants?: Array<{ length: number; price: number; stock: number }>;
    changes?: Record<string, { from: unknown; to: unknown }>;
    supplyItems?: Array<{
      flowerName: string;
      length: number | null;
      stockBefore?: number;
      stockAfter: number;
      costPrice?: number;    // Собівартість
      priceBefore?: number;
      priceAfter: number;
      isNew: boolean;
    }>;
  }) => void;
  showSuccess?: (title: string, message: string) => void;
  showError?: (title: string, message: string) => void;
  showWarning?: (title: string, message: string) => void;
};

// Write-off reason type
export type WriteOffReason = 'damage' | 'expiry' | 'adjustment' | 'other';

export const reasonLabels: Record<WriteOffReason, string> = {
  damage: 'Пошкодження',
  expiry: 'Закінчення терміну',
  adjustment: 'Інвентаризація',
  other: 'Інша причина',
};

// Sorting types
export type SortKey = 'name' | 'price' | 'stock' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

// Draft variant for add form (new variant)
export type DraftVariant = {
  id: string;
  length: string;
  price: string;
  stock: string;
  costPrice: string; // Собівартість (закупівельна ціна)
};

// Existing variant for supply (shows current stock + amount to add)
export type ExistingVariantSupply = {
  documentId: string;
  length: number;
  price: number;
  costPrice?: number;   // Поточна собівартість
  currentStock: number;
  addQuantity: number;  // How much to add in this supply
  addCostPrice: string; // Собівартість нових одиниць
};

// Draft state for add product form
export type ProductDraft = {
  flowerId: string | null;
  flowerName: string;
  image: File | null;
  imagePreview: string | null;
  variants: DraftVariant[]; // New variants
  existingVariants: ExistingVariantSupply[]; // Existing variants for supply
  isSupplyMode: boolean; // true when adding to existing product
};

// Edit variant type
export type EditVariant = {
  documentId: string;
  length: number;
  price: number;
  stock: number;
  isNew?: boolean;
  isDeleted?: boolean;
};

// Edit data state
export type EditData = {
  image: File | null;
  imagePreview: string | null;
  description: string;
  originalDescription: string;
  variants: EditVariant[];
  originalVariants: Array<{
    documentId: string;
    length: number;
    price: number;
    stock: number;
  }>;
};

// Write-off data state
export type WriteOffData = {
  selectedVariant: string;
  qty: number | string;
  reason: WriteOffReason;
  notes: string;
};

// Low stock item
export type LowStockItem = {
  productName: string;
  variant: string;
  stock: number;
};

// Notification helper type
export type NotifyFunctions = {
  success: (title: string, message: string) => void;
  error: (title: string, message: string) => void;
  warning: (title: string, message: string) => void;
};
