/**
 * GraphQL типи для Strapi v5
 *
 * ВАЖЛИВО: В Strapi v5 GraphQL:
 * - Використовуємо documentId замість id для ідентифікації
 * - Немає обгортки "data" у відповідях
 * - Фільтрація працює через slug або documentId
 */

// ============================================
// Базові типи Strapi
// ============================================

export interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
  path: string | null;
}

export interface GraphQLImage {
  documentId: string;
  name: string;
  alternativeText: string | null;
  url: string;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  } | null;
}

export interface GraphQLBlock {
  type: string;
  children: Array<{
    type: string;
    text: string;
  }>;
}

// ============================================
// Flower типи
// ============================================

export interface GraphQLVariant {
  documentId: string;
  length: number;
  price: number;
  stock: number;
}

export interface GraphQLFlower {
  documentId: string;
  name: string;
  slug: string;
  description: GraphQLBlock[];
  image: GraphQLImage | null;
  variants: GraphQLVariant[];
  publishedAt: string | null;
}

export interface FlowersResponse {
  flowers: GraphQLFlower[];
}

export interface FlowerResponse {
  flowers: GraphQLFlower[];
}

export interface FlowerByDocumentIdResponse {
  flower: GraphQLFlower | null;
}

// ============================================
// Customer типи
// ============================================

export interface GraphQLCustomer {
  documentId: string;
  name: string;
  type: "VIP" | "Regular" | "Wholesale";
  phone: string | null;
  email: string | null;
  address: string | null;
  totalSpent: number;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  customers: GraphQLCustomer[];
}

export interface CustomerResponse {
  customer: GraphQLCustomer | null;
}

// ============================================
// Transaction типи
// ============================================

export interface GraphQLTransactionItem {
  flowerSlug: string;
  length: number;
  qty: number;
  price: number;
  name: string;
}

export interface GraphQLTransaction {
  documentId: string;
  date: string;
  type: "sale" | "writeOff";
  operationId: string;
  paymentStatus: "pending" | "paid" | "expected" | "cancelled";
  amount: number;
  items: GraphQLTransactionItem[];
  customer: GraphQLCustomer | null;
  paymentDate: string | null;
  notes: string | null;
  writeOffReason: "damage" | "expiry" | "adjustment" | "other" | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  transactions: GraphQLTransaction[];
}

// ============================================
// Variant типи для мутацій
// ============================================

export interface VariantResponse {
  variant: GraphQLVariant | null;
}

export interface UpdateVariantResponse {
  updateVariant: {
    documentId: string;
    length: number;
    price: number;
    stock: number;
  } | null;
}

export interface UpdateFlowerResponse {
  updateFlower: GraphQLFlower | null;
}

// ============================================
// Mutation Input типи
// ============================================

export interface UpdateVariantInput {
  price?: number;
  stock?: number;
  length?: number;
  flower?: string; // documentId зв'язаної квітки
}

export interface UpdateFlowerInput {
  name?: string;
  description?: GraphQLBlock[];
  image?: string; // documentId зображення
}

export interface CreateCustomerInput {
  name: string;
  type: "VIP" | "Regular" | "Wholesale";
  phone?: string;
  email?: string;
  address?: string;
}
