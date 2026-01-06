/**
 * Core Business Entities
 *
 * Основні бізнес-сутності системи
 */

import type { StrapiBlock } from './strapi';

// ============================================
// Flower & Variant (Product)
// ============================================

/**
 * Варіант квітки (довжина/ціна/запас)
 */
export interface Variant {
  id?: number;
  documentId?: string;
  length: number;
  price: number;
  costPrice?: number;  // Собівартість (ціна закупки)
  stock: number;
  /**
   * Текстове представлення розміру (напр. "50 см")
   * Зазвичай генерується з length
   */
  size: string;
}

/**
 * Квітка (основна сутність товару)
 */
export interface Flower {
  id: number;
  documentId: string;
  slug: string;
  name: string;
  description?: StrapiBlock[];
  image: string | null;
  variants: Variant[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * @deprecated Використовуйте Flower замість Product
 * Збережено для backward compatibility
 */
export interface Product {
  id: string;
  documentId?: string;
  slug?: string;
  name: string;
  description?: Array<{ type: string; children: Array<{ type: string; text: string }> }>;
  image: string;
  variants: Variant[];
  updatedAt?: string;
}

// ============================================
// Customer
// ============================================

export type CustomerType = 'VIP' | 'Regular' | 'Wholesale';

/**
 * Клієнт (покупець)
 */
export interface Customer {
  id: number;
  documentId: string;
  name: string;
  type: CustomerType;
  phone?: string;
  email?: string;
  address?: string;
  totalSpent: number;
  orderCount: number;
  transactions?: Transaction[];
  createdAt: string;
  updatedAt: string;
}

/**
 * @deprecated Використовуйте Customer
 * Збережено для backward compatibility з UI компонентами
 */
export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  city: string;
  orders: number;
  spent: number;
  lastOrder: string;
  isVip?: boolean;
  pendingPayment?: number;
}

// ============================================
// Transaction
// ============================================

export type TransactionType = 'sale' | 'writeOff';
export type PaymentStatus = 'pending' | 'paid' | 'expected' | 'cancelled';
export type WriteOffReason = 'damage' | 'expiry' | 'adjustment' | 'other';

/**
 * Елемент транзакції
 */
export interface TransactionItem {
  flowerSlug: string;
  length: number;
  qty: number;
  price: number;
  name: string;
  subtotal?: number;
}

/**
 * Транзакція (продаж або списання)
 */
export interface Transaction {
  id: number;
  documentId: string;
  date: string;
  type: TransactionType;
  operationId: string;
  paymentStatus: PaymentStatus;
  amount: number;
  items: TransactionItem[];
  customer?: Customer;
  paymentDate?: string;
  notes?: string;
  writeOffReason?: WriteOffReason;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Order (Legacy)
// ============================================

/**
 * @deprecated Використовуйте Transaction
 */
export interface Order {
  id: string;
  status: string;
  date: string;
  list: string;
  amount: number;
}
