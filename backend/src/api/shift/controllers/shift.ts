/**
 * Shift Controller
 *
 * Контролер для управління робочими змінами з підтримкою багатьох пристроїв
 */

import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';

interface Activity {
  id: string;
  type: 'sale' | 'writeOff' | 'productEdit' | 'productCreate' | 'productDelete' | 'paymentConfirm' | 'customerCreate' | 'customerDelete' | 'supply';
  timestamp: string;
  details: Record<string, unknown>;
}

interface AddActivityBody {
  activity: Activity;
}

interface CloseShiftBody {
  notes?: string;
}

// Helper для розрахунку summary
function calculateSummary(activities: Activity[]) {
  return activities.reduce(
    (acc, activity) => {
      switch (activity.type) {
        case 'sale':
          acc.totalSales += 1;
          acc.totalSalesAmount += (activity.details.totalAmount as number) || 0;
          break;
        case 'writeOff':
          acc.totalWriteOffs += 1;
          acc.totalWriteOffsQty += (activity.details.qty as number) || 0;
          break;
      }
      acc.activitiesCount += 1;
      return acc;
    },
    {
      totalSales: 0,
      totalSalesAmount: 0,
      totalWriteOffs: 0,
      totalWriteOffsQty: 0,
      activitiesCount: 0,
    }
  );
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * GET /api/shifts/current
   * Отримати або створити поточну активну зміну
   */
  async getCurrent(ctx: Context) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docs = strapi.documents as any;

      // Шукаємо активну зміну
      const activeShifts = await docs('api::shift.shift').findMany({
        filters: { status: 'active' },
        limit: 1,
      });

      if (activeShifts && activeShifts.length > 0) {
        ctx.body = {
          success: true,
          data: activeShifts[0],
        };
        return;
      }

      // Якщо немає активної зміни - створюємо нову
      const now = new Date().toISOString();
      const newShift = await docs('api::shift.shift').create({
        data: {
          startedAt: now,
          closedAt: null,
          status: 'active',
          activities: [],
          summary: null,
          totalSales: 0,
          totalSalesAmount: 0,
          totalWriteOffs: 0,
          totalWriteOffsQty: 0,
          notes: null,
        },
      });

      ctx.status = 201;
      ctx.body = {
        success: true,
        data: newShift,
        isNew: true,
      };
    } catch (error) {
      strapi.log.error('Shift getCurrent error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while getting current shift',
        },
      };
    }
  },

  /**
   * POST /api/shifts/current/activity
   * Додати активність до поточної зміни
   */
  async addActivity(ctx: Context) {
    try {
      const body = ctx.request.body as AddActivityBody;

      if (!body.activity || !body.activity.id || !body.activity.type) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'INVALID_ACTIVITY',
            message: 'activity with id and type is required',
          },
        };
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docs = strapi.documents as any;

      // Знаходимо активну зміну
      const activeShifts = await docs('api::shift.shift').findMany({
        filters: { status: 'active' },
        limit: 1,
      });

      let shift;
      if (!activeShifts || activeShifts.length === 0) {
        // Створюємо нову зміну якщо немає активної
        const now = new Date().toISOString();
        shift = await docs('api::shift.shift').create({
          data: {
            startedAt: now,
            closedAt: null,
            status: 'active',
            activities: [body.activity],
            summary: null,
            totalSales: 0,
            totalSalesAmount: 0,
            totalWriteOffs: 0,
            totalWriteOffsQty: 0,
            notes: null,
          },
        });
      } else {
        shift = activeShifts[0];
        const currentActivities = (shift.activities || []) as Activity[];

        // Перевіряємо чи активність вже не існує (idempotency)
        const exists = currentActivities.some((a: Activity) => a.id === body.activity.id);
        if (exists) {
          ctx.body = {
            success: true,
            data: shift,
            idempotent: true,
          };
          return;
        }

        // Додаємо нову активність
        const updatedActivities = [body.activity, ...currentActivities];

        shift = await docs('api::shift.shift').update({
          documentId: shift.documentId,
          data: {
            activities: updatedActivities,
          },
        });
      }

      ctx.body = {
        success: true,
        data: shift,
      };
    } catch (error) {
      strapi.log.error('Shift addActivity error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while adding activity',
        },
      };
    }
  },

  /**
   * POST /api/shifts/close
   * Закрити поточну активну зміну
   */
  async closeShift(ctx: Context) {
    try {
      const body = ctx.request.body as CloseShiftBody;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docs = strapi.documents as any;

      // Знаходимо активну зміну
      const activeShifts = await docs('api::shift.shift').findMany({
        filters: { status: 'active' },
        limit: 1,
      });

      if (!activeShifts || activeShifts.length === 0) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: {
            code: 'NO_ACTIVE_SHIFT',
            message: 'No active shift found to close',
          },
        };
        return;
      }

      const shift = activeShifts[0];
      const activities = (shift.activities || []) as Activity[];
      const summary = calculateSummary(activities);
      const now = new Date().toISOString();

      // Закриваємо зміну
      const closedShift = await docs('api::shift.shift').update({
        documentId: shift.documentId,
        data: {
          closedAt: now,
          status: 'closed',
          summary,
          totalSales: summary.totalSales,
          totalSalesAmount: summary.totalSalesAmount,
          totalWriteOffs: summary.totalWriteOffs,
          totalWriteOffsQty: summary.totalWriteOffsQty,
          notes: body.notes || null,
        },
      });

      ctx.body = {
        success: true,
        data: closedShift,
        alert: {
          type: 'success',
          title: 'Зміну закрито',
          message: `Зміну успішно закрито. Записано ${activities.length} дій.`,
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docs = strapi.documents as any;

      const shifts = await docs('api::shift.shift').findMany({
        filters: { status: 'closed' },
        sort: { closedAt: 'desc' },
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize),
      });

      const total = await docs('api::shift.shift').count({
        filters: { status: 'closed' },
      });

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const shift = await (strapi.documents as any)('api::shift.shift').findOne({
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
