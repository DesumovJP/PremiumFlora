/**
 * POS Controller
 *
 * Контролер для POS операцій: продажі, списання, підтвердження оплати
 */

import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';

interface SaleItem {
  flowerSlug: string;
  length: number;
  qty: number;
  price: number;
  name: string;
}

interface CreateSaleBody {
  operationId: string;
  customerId: string;
  items: SaleItem[];
  discount?: number;
  notes?: string;
  paymentStatus?: 'pending' | 'paid' | 'expected';
}

interface CreateWriteOffBody {
  operationId: string;
  flowerSlug: string;
  length: number;
  qty: number;
  reason: 'damage' | 'expiry' | 'adjustment' | 'other';
  notes?: string;
}

interface PosService {
  createSale: (data: CreateSaleBody) => Promise<{
    success: boolean;
    idempotent?: boolean;
    data?: unknown;
    message?: string;
    error?: { code: string; message: string; details?: unknown };
    stockUpdates?: unknown;
  }>;
  createWriteOff: (data: CreateWriteOffBody) => Promise<{
    success: boolean;
    idempotent?: boolean;
    data?: unknown;
    message?: string;
    error?: { code: string; message: string; details?: unknown };
    stockUpdate?: unknown;
  }>;
  confirmPayment: (transactionId: string) => Promise<{
    success: boolean;
    idempotent?: boolean;
    data?: unknown;
    message?: string;
    error?: { code: string; message: string };
  }>;
  syncBalances: () => Promise<{
    success: boolean;
    updated: number;
    error?: { code: string; message: string };
  }>;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * POST /api/pos/sales
   * Створити продаж
   */
  async createSale(ctx: Context) {
    try {
      const body = ctx.request.body as CreateSaleBody;

      // Валідація обов'язкових полів
      if (!body.operationId) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'MISSING_OPERATION_ID',
            message: 'operationId is required for idempotency',
          },
        };
        return;
      }

      if (!body.customerId) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'MISSING_CUSTOMER_ID',
            message: 'customerId is required',
          },
        };
        return;
      }

      if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'MISSING_ITEMS',
            message: 'items array is required and must not be empty',
          },
        };
        return;
      }

      // Валідація кожного item
      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        if (!item.flowerSlug || !item.length || !item.qty || !item.price || !item.name) {
          ctx.status = 400;
          ctx.body = {
            success: false,
            error: {
              code: 'INVALID_ITEM',
              message: `Item at index ${i} is missing required fields (flowerSlug, length, qty, price, name)`,
            },
          };
          return;
        }
      }

      // Виклик сервісу
      const posService = strapi.service('api::pos.pos') as PosService;
      const result = await posService.createSale(body);

      if (result.success) {
        ctx.status = result.idempotent ? 200 : 201;
        ctx.body = {
          success: true,
          idempotent: result.idempotent || false,
          data: result.data,
          stockUpdates: result.stockUpdates,
          message: result.message,
          alert: {
            type: 'success',
            title: result.idempotent ? 'Замовлення вже існує' : 'Замовлення створено',
            message: result.idempotent
              ? 'Транзакція з цим operationId вже була створена раніше'
              : 'Замовлення успішно оформлено. Склад оновлено.',
          },
        };
      } else {
        ctx.status = result.error?.code === 'INSUFFICIENT_STOCK' ? 409 : 400;
        ctx.body = {
          success: false,
          error: result.error,
          alert: {
            type: 'error',
            title: 'Помилка створення замовлення',
            message: result.error?.message || 'Невідома помилка',
            details: result.error?.details,
          },
        };
      }
    } catch (error) {
      strapi.log.error('POS createSale error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while processing the sale',
        },
        alert: {
          type: 'error',
          title: 'Внутрішня помилка',
          message: 'Сталася помилка при обробці замовлення. Спробуйте пізніше.',
        },
      };
    }
  },

  /**
   * POST /api/pos/write-offs
   * Створити списання
   */
  async createWriteOff(ctx: Context) {
    try {
      const body = ctx.request.body as CreateWriteOffBody;

      // Валідація
      if (!body.operationId) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'MISSING_OPERATION_ID',
            message: 'operationId is required for idempotency',
          },
        };
        return;
      }

      if (!body.flowerSlug || !body.length || !body.qty) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'flowerSlug, length, and qty are required',
          },
        };
        return;
      }

      if (!body.reason) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'MISSING_REASON',
            message: 'reason is required (damage, expiry, adjustment, other)',
          },
        };
        return;
      }

      const validReasons = ['damage', 'expiry', 'adjustment', 'other'];
      if (!validReasons.includes(body.reason)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'INVALID_REASON',
            message: `reason must be one of: ${validReasons.join(', ')}`,
          },
        };
        return;
      }

      // Виклик сервісу
      const posService = strapi.service('api::pos.pos') as PosService;
      const result = await posService.createWriteOff(body);

      if (result.success) {
        ctx.status = result.idempotent ? 200 : 201;
        ctx.body = {
          success: true,
          idempotent: result.idempotent || false,
          data: result.data,
          stockUpdate: result.stockUpdate,
          message: result.message,
          alert: {
            type: 'success',
            title: result.idempotent ? 'Списання вже існує' : 'Товар списано',
            message: result.idempotent
              ? 'Списання з цим operationId вже було створено раніше'
              : `Товар успішно списано. Склад зменшено на ${body.qty} шт.`,
          },
        };
      } else {
        ctx.status = result.error?.code === 'INSUFFICIENT_STOCK' ? 409 : 400;
        ctx.body = {
          success: false,
          error: result.error,
          alert: {
            type: 'error',
            title: 'Помилка списання',
            message: result.error?.message || 'Невідома помилка',
            details: result.error?.details,
          },
        };
      }
    } catch (error) {
      strapi.log.error('POS createWriteOff error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while processing the write-off',
        },
        alert: {
          type: 'error',
          title: 'Внутрішня помилка',
          message: 'Сталася помилка при списанні. Спробуйте пізніше.',
        },
      };
    }
  },

  /**
   * POST /api/pos/sync-balances
   * Синхронізувати баланси клієнтів з їх неоплаченими транзакціями
   */
  async syncBalances(ctx: Context) {
    try {
      const posService = strapi.service('api::pos.pos') as PosService;
      const result = await posService.syncBalances();

      if (result.success) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          updated: result.updated,
          alert: {
            type: 'success',
            title: 'Баланси синхронізовано',
            message: `Оновлено балансів: ${result.updated}`,
          },
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: result.error,
          alert: {
            type: 'error',
            title: 'Помилка синхронізації',
            message: result.error?.message || 'Невідома помилка',
          },
        };
      }
    } catch (error) {
      strapi.log.error('POS syncBalances error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while syncing balances',
        },
        alert: {
          type: 'error',
          title: 'Внутрішня помилка',
          message: 'Сталася помилка при синхронізації балансів. Спробуйте пізніше.',
        },
      };
    }
  },

  /**
   * PUT /api/pos/transactions/:id/confirm-payment
   * Підтвердити оплату
   */
  async confirmPayment(ctx: Context) {
    try {
      const { id } = ctx.params;

      if (!id) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'MISSING_ID',
            message: 'Transaction ID is required',
          },
        };
        return;
      }

      // Виклик сервісу
      const posService = strapi.service('api::pos.pos') as PosService;
      const result = await posService.confirmPayment(id);

      if (result.success) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          idempotent: result.idempotent || false,
          data: result.data,
          message: result.message,
          alert: {
            type: 'success',
            title: result.idempotent ? 'Вже оплачено' : 'Оплату підтверджено',
            message: result.idempotent
              ? 'Ця транзакція вже була позначена як оплачена'
              : 'Оплату успішно підтверджено. Статистику клієнта оновлено.',
          },
        };
      } else {
        ctx.status = result.error?.code === 'TRANSACTION_NOT_FOUND' ? 404 : 400;
        ctx.body = {
          success: false,
          error: result.error,
          alert: {
            type: 'error',
            title: 'Помилка підтвердження оплати',
            message: result.error?.message || 'Невідома помилка',
          },
        };
      }
    } catch (error) {
      strapi.log.error('POS confirmPayment error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while confirming payment',
        },
        alert: {
          type: 'error',
          title: 'Внутрішня помилка',
          message: 'Сталася помилка при підтвердженні оплати. Спробуйте пізніше.',
        },
      };
    }
  },
});
