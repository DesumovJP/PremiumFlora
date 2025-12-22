/**
 * Shift Controller
 *
 * Контролер для управління робочими змінами
 */

import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';

interface Activity {
  id: string;
  type: 'sale' | 'writeOff' | 'productEdit' | 'productCreate' | 'paymentConfirm' | 'customerCreate' | 'supply';
  timestamp: string;
  details: Record<string, unknown>;
}

interface CloseShiftBody {
  activities: Activity[];
  summary: {
    totalSales: number;
    totalSalesAmount: number;
    totalWriteOffs: number;
    totalWriteOffsQty: number;
    activitiesCount: number;
  };
  startedAt: string;
  notes?: string;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * POST /api/shifts/close
   * Закрити зміну та зберегти історію
   */
  async closeShift(ctx: Context) {
    try {
      const body = ctx.request.body as CloseShiftBody;

      if (!body.activities || !Array.isArray(body.activities)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'MISSING_ACTIVITIES',
            message: 'activities array is required',
          },
        };
        return;
      }

      if (!body.startedAt) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'MISSING_STARTED_AT',
            message: 'startedAt is required',
          },
        };
        return;
      }

      const now = new Date().toISOString();

      // Створюємо закриту зміну
      const shift = await strapi.documents('api::shift.shift').create({
        data: {
          startedAt: body.startedAt,
          closedAt: now,
          status: 'closed',
          activities: body.activities,
          summary: body.summary,
          totalSales: body.summary?.totalSales || 0,
          totalSalesAmount: body.summary?.totalSalesAmount || 0,
          totalWriteOffs: body.summary?.totalWriteOffs || 0,
          totalWriteOffsQty: body.summary?.totalWriteOffsQty || 0,
          notes: body.notes || null,
        },
      });

      ctx.status = 201;
      ctx.body = {
        success: true,
        data: shift,
        alert: {
          type: 'success',
          title: 'Зміну закрито',
          message: `Зміну успішно закрито. Записано ${body.activities.length} дій.`,
        },
      };
    } catch (error) {
      strapi.log.error('Shift closeShift error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while closing the shift',
        },
        alert: {
          type: 'error',
          title: 'Помилка закриття зміни',
          message: 'Сталася помилка при закритті зміни. Спробуйте пізніше.',
        },
      };
    }
  },

  /**
   * GET /api/shifts
   * Отримати список закритих змін
   */
  async find(ctx: Context) {
    try {
      const { page = 1, pageSize = 10 } = ctx.query;

      const shifts = await strapi.documents('api::shift.shift').findMany({
        sort: { closedAt: 'desc' },
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize),
      });

      const total = await strapi.documents('api::shift.shift').count({});

      ctx.body = {
        success: true,
        data: shifts,
        meta: {
          pagination: {
            page: Number(page),
            pageSize: Number(pageSize),
            pageCount: Math.ceil(total / Number(pageSize)),
            total,
          },
        },
      };
    } catch (error) {
      strapi.log.error('Shift find error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching shifts',
        },
      };
    }
  },

  /**
   * GET /api/shifts/:documentId
   * Отримати деталі зміни
   */
  async findOne(ctx: Context) {
    try {
      const { documentId } = ctx.params;

      const shift = await strapi.documents('api::shift.shift').findOne({
        documentId,
      });

      if (!shift) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: {
            code: 'SHIFT_NOT_FOUND',
            message: 'Shift not found',
          },
        };
        return;
      }

      ctx.body = {
        success: true,
        data: shift,
      };
    } catch (error) {
      strapi.log.error('Shift findOne error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching shift',
        },
      };
    }
  },
});
