/**
 * POS Service
 *
 * Атомарні операції для POS терміналу:
 * - Створення продажів з декрементом складу
 * - Списання товарів
 * - Підтвердження оплати
 */

import type { Core } from '@strapi/strapi';

// Types
interface SaleItem {
  flowerSlug: string;
  length: number;
  qty: number;
  price: number;
  name: string;
}

interface CreateSaleInput {
  operationId: string;
  customerId: string;
  items: SaleItem[];
  discount?: number;
  notes?: string;
  paymentStatus?: 'pending' | 'paid' | 'expected';
}

interface CreateWriteOffInput {
  operationId: string;
  flowerSlug: string;
  length: number;
  qty: number;
  reason: 'damage' | 'expiry' | 'adjustment' | 'other';
  notes?: string;
}

interface VariantWithFlower {
  id: number;
  documentId: string;
  length: number;
  stock: number;
  price: number;
  flower?: {
    id: number;
    documentId: string;
    slug: string;
    name: string;
  };
}

interface StockValidationError {
  flowerSlug: string;
  length: number;
  requested: number;
  available: number;
  name: string;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Перевірка ідемпотентності - чи існує транзакція з даним operationId
   */
  async findByOperationId(operationId: string) {
    if (!operationId) return null;

    const existing = await strapi.db.query('api::transaction.transaction').findOne({
      where: { operationId },
      populate: ['customer'],
    });

    return existing;
  },

  /**
   * Знайти variant за flower.slug або flower.documentId + length
   */
  async findVariant(flowerSlug: string, length: number): Promise<VariantWithFlower | null> {
    strapi.log.info(`🔍 Finding variant with flowerSlug="${flowerSlug}", length=${length}`);

    // Спочатку шукаємо за slug
    let variant = await strapi.db.query('api::variant.variant').findOne({
      where: {
        flower: {
          slug: flowerSlug,
        },
        length: length,
      },
      populate: ['flower'],
    });

    // Якщо не знайдено, пробуємо за documentId (fallback для старих записів)
    if (!variant) {
      strapi.log.info(`⚠️ Not found by slug, trying documentId...`);
      variant = await strapi.db.query('api::variant.variant').findOne({
        where: {
          flower: {
            documentId: flowerSlug,
          },
          length: length,
        },
        populate: ['flower'],
      });
    }

    if (!variant) {
      strapi.log.warn(`❌ Variant not found for flowerSlug="${flowerSlug}", length=${length}`);

      // Показати всі варіанти для діагностики
      const allVariants = await strapi.db.query('api::variant.variant').findMany({
        where: {
          $or: [
            { flower: { slug: flowerSlug } },
            { flower: { documentId: flowerSlug } },
          ],
        },
        populate: ['flower'],
      });

      strapi.log.info(`📋 All variants for flower "${flowerSlug}":`, allVariants.map(v => ({
        documentId: v.documentId,
        length: v.length,
        stock: v.stock,
        price: v.price,
        flowerSlug: v.flower?.slug,
        flowerDocumentId: v.flower?.documentId,
        flowerName: v.flower?.name,
      })));
    } else {
      strapi.log.info(`✅ Variant found:`, {
        documentId: variant.documentId,
        length: variant.length,
        stock: variant.stock,
        price: variant.price,
        flowerSlug: variant.flower?.slug,
        flowerDocumentId: variant.flower?.documentId,
        flowerName: variant.flower?.name,
      });
    }

    return variant as VariantWithFlower | null;
  },

  /**
   * Валідація наявності stock для всіх items
   */
  async validateStock(items: SaleItem[]): Promise<{
    valid: boolean;
    errors: StockValidationError[];
    variants: Map<string, VariantWithFlower>;
  }> {
    const errors: StockValidationError[] = [];
    const variants = new Map<string, VariantWithFlower>();

    for (const item of items) {
      const key = `${item.flowerSlug}-${item.length}`;
      const variant = await this.findVariant(item.flowerSlug, item.length);

      if (!variant) {
        errors.push({
          flowerSlug: item.flowerSlug,
          length: item.length,
          requested: item.qty,
          available: 0,
          name: item.name,
        });
        continue;
      }

      if (variant.stock < item.qty) {
        errors.push({
          flowerSlug: item.flowerSlug,
          length: item.length,
          requested: item.qty,
          available: variant.stock,
          name: item.name,
        });
        continue;
      }

      variants.set(key, variant);
    }

    return {
      valid: errors.length === 0,
      errors,
      variants,
    };
  },

  /**
   * Створити продаж (sale)
   */
  async createSale(data: CreateSaleInput) {
    // 1. Перевірка ідемпотентності
    const existing = await this.findByOperationId(data.operationId);
    if (existing) {
      return {
        success: true,
        idempotent: true,
        data: existing,
        message: 'Transaction already exists with this operationId',
      };
    }

    // 2. Перевірка клієнта
    const customer = await strapi.db.query('api::customer.customer').findOne({
      where: { documentId: data.customerId },
    });

    if (!customer) {
      return {
        success: false,
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: `Customer with id ${data.customerId} not found`,
        },
      };
    }

    // 3. Валідація stock
    const { valid, errors, variants } = await this.validateStock(data.items);

    if (!valid) {
      return {
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: 'Not enough stock for some items',
          details: errors,
        },
      };
    }

    // 4. Атомарні операції (без справжньої транзакції БД, але послідовно)
    try {
      // 4a. Зменшити stock для кожного variant
      for (const item of data.items) {
        const key = `${item.flowerSlug}-${item.length}`;
        const variant = variants.get(key)!;

        await strapi.db.query('api::variant.variant').update({
          where: { documentId: variant.documentId },
          data: {
            stock: variant.stock - item.qty,
          },
        });
      }

      // 4b. Обчислити загальну суму
      const subtotal = data.items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const amount = Math.round(subtotal - (data.discount || 0));

      strapi.log.info('📝 Creating transaction with data:', {
        operationId: data.operationId,
        customerId: customer.id,
        amount,
        itemsCount: data.items.length,
      });

      // 4c. Створити Transaction
      const transaction = await strapi.db.query('api::transaction.transaction').create({
        data: {
          date: new Date().toISOString(),
          type: 'sale',
          operationId: data.operationId,
          paymentStatus: data.paymentStatus || 'pending',
          amount,
          items: data.items.map(item => ({
            flowerSlug: item.flowerSlug,
            length: item.length,
            qty: item.qty,
            price: item.price,
            name: item.name,
            subtotal: item.price * item.qty,
          })),
          customer: customer.id,
          notes: data.notes,
          // Не потрібен publishedAt, бо draftAndPublish: false
        },
      });

      strapi.log.info('✅ Transaction created:', {
        id: transaction?.id,
        documentId: transaction?.documentId,
        operationId: transaction?.operationId,
      });

      // 4d. Оновити статистику клієнта якщо оплачено
      if (data.paymentStatus === 'paid') {
        await strapi.db.query('api::customer.customer').update({
          where: { documentId: customer.documentId },
          data: {
            orderCount: (customer.orderCount || 0) + 1,
            totalSpent: (customer.totalSpent || 0) + amount,
          },
        });
      }

      // Завантажити повну транзакцію з relations
      strapi.log.info('🔍 Loading full transaction with documentId:', transaction.documentId);
      const fullTransaction = await strapi.db.query('api::transaction.transaction').findOne({
        where: { documentId: transaction.documentId },
        populate: ['customer'],
      });

      strapi.log.info('📦 Full transaction loaded:', {
        found: !!fullTransaction,
        hasCustomer: !!fullTransaction?.customer,
      });

      return {
        success: true,
        idempotent: false,
        data: fullTransaction,
        stockUpdates: data.items.map(item => ({
          flowerSlug: item.flowerSlug,
          length: item.length,
          decremented: item.qty,
        })),
      };
    } catch (error) {
      strapi.log.error('❌ Sale creation error:', error);
      strapi.log.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      });

      // В ідеалі тут був би rollback
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create sale transaction',
        },
      };
    }
  },

  /**
   * Створити списання (writeOff)
   */
  async createWriteOff(data: CreateWriteOffInput) {
    strapi.log.info('🗑️ Creating write-off:', {
      flowerSlug: data.flowerSlug,
      length: data.length,
      qty: data.qty,
      reason: data.reason,
      operationId: data.operationId,
    });

    // 1. Перевірка ідемпотентності
    const existing = await this.findByOperationId(data.operationId);
    if (existing) {
      strapi.log.info('⚠️ Write-off already exists (idempotent)');
      return {
        success: true,
        idempotent: true,
        data: existing,
        message: 'Transaction already exists with this operationId',
      };
    }

    // 2. Знайти variant
    const variant = await this.findVariant(data.flowerSlug, data.length);

    if (!variant) {
      return {
        success: false,
        error: {
          code: 'VARIANT_NOT_FOUND',
          message: `Variant not found for ${data.flowerSlug} with length ${data.length}cm`,
        },
      };
    }

    // 3. Перевірка stock
    if (variant.stock < data.qty) {
      return {
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: `Cannot write off ${data.qty} items. Only ${variant.stock} available.`,
          details: {
            flowerSlug: data.flowerSlug,
            length: data.length,
            requested: data.qty,
            available: variant.stock,
          },
        },
      };
    }

    try {
      // 4a. Зменшити stock
      strapi.log.info('📉 Updating stock:', {
        variantDocumentId: variant.documentId,
        oldStock: variant.stock,
        newStock: variant.stock - data.qty,
      });

      await strapi.db.query('api::variant.variant').update({
        where: { documentId: variant.documentId },
        data: {
          stock: variant.stock - data.qty,
        },
      });

      // 4b. Створити Transaction (без customer)
      strapi.log.info('📝 Creating write-off transaction:', {
        type: 'writeOff',
        operationId: data.operationId,
        flowerSlug: data.flowerSlug,
        reason: data.reason,
      });

      const transaction = await strapi.db.query('api::transaction.transaction').create({
        data: {
          date: new Date().toISOString(),
          type: 'writeOff',
          operationId: data.operationId,
          paymentStatus: 'cancelled', // Для списання немає оплати
          amount: 0,
          items: [{
            flowerSlug: data.flowerSlug,
            length: data.length,
            qty: data.qty,
            price: variant.price,
            name: variant.flower?.name || data.flowerSlug,
          }],
          writeOffReason: data.reason,
          notes: data.notes,
          // Не потрібен publishedAt, бо draftAndPublish: false
        },
      });

      strapi.log.info('✅ Write-off transaction created:', {
        id: transaction?.id,
        documentId: transaction?.documentId,
        type: transaction?.type,
        operationId: transaction?.operationId,
      });

      return {
        success: true,
        idempotent: false,
        data: transaction,
        stockUpdate: {
          flowerSlug: data.flowerSlug,
          length: data.length,
          decremented: data.qty,
          newStock: variant.stock - data.qty,
        },
      };
    } catch (error) {
      strapi.log.error('❌ WriteOff creation error:', error);
      strapi.log.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      });

      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create write-off transaction',
        },
      };
    }
  },

  /**
   * Підтвердити оплату транзакції
   */
  async confirmPayment(transactionId: string) {
    // Знайти транзакцію
    const transaction = await strapi.db.query('api::transaction.transaction').findOne({
      where: { documentId: transactionId },
      populate: ['customer'],
    });

    if (!transaction) {
      return {
        success: false,
        error: {
          code: 'TRANSACTION_NOT_FOUND',
          message: `Transaction with id ${transactionId} not found`,
        },
      };
    }

    if (transaction.type !== 'sale') {
      return {
        success: false,
        error: {
          code: 'INVALID_TRANSACTION_TYPE',
          message: 'Only sale transactions can be confirmed for payment',
        },
      };
    }

    if (transaction.paymentStatus === 'paid') {
      return {
        success: true,
        idempotent: true,
        data: transaction,
        message: 'Transaction already marked as paid',
      };
    }

    try {
      // Оновити статус транзакції
      await strapi.db.query('api::transaction.transaction').update({
        where: { documentId: transaction.documentId },
        data: {
          paymentStatus: 'paid',
          paymentDate: new Date().toISOString(),
        },
      });

      // Оновити статистику клієнта
      if (transaction.customer) {
        const customer = transaction.customer as { documentId: string; orderCount?: number; totalSpent?: number };
        await strapi.db.query('api::customer.customer').update({
          where: { documentId: customer.documentId },
          data: {
            orderCount: (customer.orderCount || 0) + 1,
            totalSpent: (customer.totalSpent || 0) + transaction.amount,
          },
        });
      }

      // Завантажити оновлену транзакцію
      const updated = await strapi.db.query('api::transaction.transaction').findOne({
        where: { id: transaction.id },
        populate: ['customer'],
      });

      return {
        success: true,
        idempotent: false,
        data: updated,
      };
    } catch (error) {
      strapi.log.error('Payment confirmation error:', error);

      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to confirm payment',
        },
      };
    }
  },
});
