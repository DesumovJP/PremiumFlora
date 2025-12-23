/**
 * POS Service
 *
 * Атомарні операції для POS терміналу:
 * - Створення продажів з декрементом складу
 * - Списання товарів
 * - Підтвердження оплати
 *
 * ВАЖЛИВО: Всі операції використовують транзакції БД для атомарності
 */

import type { Core } from '@strapi/strapi';
import type { Knex } from 'knex';

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
   * Отримати Knex connection для транзакцій
   */
  getKnex(): Knex {
    return strapi.db.connection as Knex;
  },

  /**
   * Перевірка ідемпотентності - чи існує транзакція з даним operationId
   */
  async findByOperationId(operationId: string, trx?: Knex.Transaction) {
    if (!operationId) return null;

    const query = trx
      ? trx('transactions').where('operation_id', operationId).first()
      : strapi.db.query('api::transaction.transaction').findOne({
          where: { operationId },
          populate: ['customer'],
        });

    return query;
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
    } else {
      strapi.log.info(`✅ Variant found:`, {
        documentId: variant.documentId,
        length: variant.length,
        stock: variant.stock,
        price: variant.price,
        flowerSlug: variant.flower?.slug,
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
   * Створити продаж (sale) - АТОМАРНА ОПЕРАЦІЯ З ТРАНЗАКЦІЄЮ
   */
  async createSale(data: CreateSaleInput) {
    const knex = this.getKnex();

    // 1. Перевірка ідемпотентності (поза транзакцією для швидкості)
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

    // 3. Валідація stock (попередня перевірка)
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

    // 4. АТОМАРНА ТРАНЗАКЦІЯ
    try {
      const result = await knex.transaction(async (trx) => {
        // 4a. Повторна перевірка ідемпотентності всередині транзакції
        const existingInTrx = await trx('transactions')
          .where('operation_id', data.operationId)
          .first();

        if (existingInTrx) {
          return {
            success: true,
            idempotent: true,
            data: existingInTrx,
            message: 'Transaction already exists with this operationId',
          };
        }

        // 4b. Атомарний декремент stock з перевіркою (захист від race condition)
        const stockUpdates: Array<{ flowerSlug: string; length: number; decremented: number }> = [];

        for (const item of data.items) {
          const key = `${item.flowerSlug}-${item.length}`;
          const variant = variants.get(key)!;

          // Атомарний UPDATE з перевіркою stock >= qty
          const updated = await trx('variants')
            .where('id', variant.id)
            .andWhere('stock', '>=', item.qty)
            .update({
              stock: trx.raw('stock - ?', [item.qty]),
            });

          if (updated === 0) {
            // Race condition: stock змінився між валідацією і оновленням
            throw new Error(`RACE_CONDITION:${item.name}:${item.flowerSlug}:${item.length}`);
          }

          stockUpdates.push({
            flowerSlug: item.flowerSlug,
            length: item.length,
            decremented: item.qty,
          });
        }

        // 4c. Обчислити загальну суму
        const subtotal = data.items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const amount = Math.round(subtotal - (data.discount || 0));

        strapi.log.info('📝 Creating transaction in DB transaction:', {
          operationId: data.operationId,
          customerId: customer.id,
          amount,
          itemsCount: data.items.length,
        });

        // 4d. Створити Transaction (без customer - relation буде додано після)
        const transactionDocumentId = `trx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const [transactionResult] = await trx('transactions').insert({
          document_id: transactionDocumentId,
          date: new Date().toISOString(),
          type: 'sale',
          operation_id: data.operationId,
          payment_status: data.paymentStatus || 'pending',
          amount,
          items: JSON.stringify(data.items.map(item => ({
            flowerSlug: item.flowerSlug,
            length: item.length,
            qty: item.qty,
            price: item.price,
            name: item.name,
            subtotal: item.price * item.qty,
          }))),
          notes: data.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).returning(['id', 'document_id']);

        const transactionId = typeof transactionResult === 'object' ? transactionResult.id : transactionResult;
        const txDocId = typeof transactionResult === 'object' ? transactionResult.document_id : transactionDocumentId;

        // 4e. Оновити статистику клієнта якщо оплачено
        if (data.paymentStatus === 'paid') {
          await trx('customers')
            .where('id', customer.id)
            .update({
              order_count: trx.raw('COALESCE(order_count, 0) + 1'),
              total_spent: trx.raw('COALESCE(total_spent, 0) + ?', [amount]),
              updated_at: new Date().toISOString(),
            });
        }

        strapi.log.info('✅ Transaction created successfully in DB transaction:', {
          transactionId,
          operationId: data.operationId,
        });

        return {
          transactionId,
          transactionDocumentId: txDocId,
          customerId: customer.id,
          customerDocumentId: customer.documentId,
          stockUpdates,
          amount,
        };
      });

      // Якщо ідемпотентний результат
      if ('idempotent' in result && result.idempotent) {
        return result;
      }

      // Прив'язати customer до transaction через Strapi (relation)
      if (result.transactionDocumentId && result.customerDocumentId) {
        try {
          await strapi.documents('api::transaction.transaction').update({
            documentId: result.transactionDocumentId,
            data: {
              customer: result.customerDocumentId,
            },
          });
          strapi.log.info('✅ Customer linked to transaction:', {
            transactionDocumentId: result.transactionDocumentId,
            customerDocumentId: result.customerDocumentId,
          });
        } catch (linkError) {
          strapi.log.warn('⚠️ Failed to link customer to transaction:', linkError);
          // Не фейлимо всю операцію через це
        }
      }

      // Завантажити повну транзакцію з relations
      const fullTransaction = await strapi.db.query('api::transaction.transaction').findOne({
        where: { id: result.transactionId },
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
        stockUpdates: result.stockUpdates,
      };
    } catch (error: any) {
      strapi.log.error('❌ Sale creation error:', error);

      // Обробка race condition помилки
      if (error.message?.startsWith('RACE_CONDITION:')) {
        const [, name, flowerSlug, length] = error.message.split(':');
        return {
          success: false,
          error: {
            code: 'CONCURRENT_MODIFICATION',
            message: `Товар "${name}" було змінено іншим користувачем. Оновіть сторінку та спробуйте знову.`,
            details: {
              flowerSlug,
              length: Number(length),
              name,
            },
          },
        };
      }

      strapi.log.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      });

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
   * Створити списання (writeOff) - АТОМАРНА ОПЕРАЦІЯ З ТРАНЗАКЦІЄЮ
   */
  async createWriteOff(data: CreateWriteOffInput) {
    const knex = this.getKnex();

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

    // 3. Попередня перевірка stock
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

    // 4. АТОМАРНА ТРАНЗАКЦІЯ
    try {
      const result = await knex.transaction(async (trx) => {
        // 4a. Повторна перевірка ідемпотентності
        const existingInTrx = await trx('transactions')
          .where('operation_id', data.operationId)
          .first();

        if (existingInTrx) {
          return {
            success: true,
            idempotent: true,
            data: existingInTrx,
            message: 'Transaction already exists with this operationId',
          };
        }

        // 4b. Атомарний декремент stock з перевіркою
        strapi.log.info('📉 Updating stock atomically:', {
          variantId: variant.id,
          oldStock: variant.stock,
          decrementBy: data.qty,
        });

        const updated = await trx('variants')
          .where('id', variant.id)
          .andWhere('stock', '>=', data.qty)
          .update({
            stock: trx.raw('stock - ?', [data.qty]),
          });

        if (updated === 0) {
          throw new Error('RACE_CONDITION');
        }

        // 4c. Створити Transaction
        strapi.log.info('📝 Creating write-off transaction:', {
          type: 'writeOff',
          operationId: data.operationId,
          flowerSlug: data.flowerSlug,
          reason: data.reason,
        });

        const [transactionId] = await trx('transactions').insert({
          document_id: `trx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString(),
          type: 'writeOff',
          operation_id: data.operationId,
          payment_status: 'cancelled',
          amount: 0,
          items: JSON.stringify([{
            flowerSlug: data.flowerSlug,
            length: data.length,
            qty: data.qty,
            price: variant.price,
            name: variant.flower?.name || data.flowerSlug,
          }]),
          write_off_reason: data.reason,
          notes: data.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).returning('id');

        // Отримуємо новий stock
        const updatedVariant = await trx('variants')
          .where('id', variant.id)
          .first();

        return {
          transactionId: typeof transactionId === 'object' ? transactionId.id : transactionId,
          newStock: updatedVariant?.stock ?? (variant.stock - data.qty),
        };
      });

      // Якщо ідемпотентний результат
      if ('idempotent' in result && result.idempotent) {
        return result;
      }

      strapi.log.info('✅ Write-off transaction created:', {
        transactionId: result.transactionId,
        operationId: data.operationId,
      });

      // Завантажити повну транзакцію
      const fullTransaction = await strapi.db.query('api::transaction.transaction').findOne({
        where: { id: result.transactionId },
      });

      return {
        success: true,
        idempotent: false,
        data: fullTransaction,
        stockUpdate: {
          flowerSlug: data.flowerSlug,
          length: data.length,
          decremented: data.qty,
          newStock: result.newStock,
        },
      };
    } catch (error: any) {
      strapi.log.error('❌ WriteOff creation error:', error);

      if (error.message === 'RACE_CONDITION') {
        return {
          success: false,
          error: {
            code: 'CONCURRENT_MODIFICATION',
            message: 'Склад було змінено іншим користувачем. Оновіть сторінку та спробуйте знову.',
          },
        };
      }

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
   * Підтвердити оплату транзакції - АТОМАРНА ОПЕРАЦІЯ З ТРАНЗАКЦІЄЮ
   */
  async confirmPayment(transactionId: string) {
    const knex = this.getKnex();

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
      await knex.transaction(async (trx) => {
        // Оновити статус транзакції
        await trx('transactions')
          .where('id', transaction.id)
          .update({
            payment_status: 'paid',
            payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        // Оновити статистику клієнта
        if (transaction.customer) {
          const customer = transaction.customer as { id: number };
          await trx('customers')
            .where('id', customer.id)
            .update({
              order_count: trx.raw('COALESCE(order_count, 0) + 1'),
              total_spent: trx.raw('COALESCE(total_spent, 0) + ?', [transaction.amount]),
              updated_at: new Date().toISOString(),
            });
        }
      });

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
    } catch (error: any) {
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
