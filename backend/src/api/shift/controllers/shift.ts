/**
 * Shift Controller
 *
 * Контролер для управління робочими змінами
 * Зміна = календарна доба (автоматичне створення о 00:00)
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

/**
 * Отримати дату у форматі YYYY-MM-DD для заданого timestamp
 * Використовує локальний час (UTC+2/+3 для України)
 */
function getDateString(date: Date = new Date()): string {
  // Форматуємо як локальну дату
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper для розрахунку summary
 */
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

/**
 * Helper для отримання поточної вартості запасів
 */
async function getCurrentInventory(strapi: Core.Strapi): Promise<{ value: number; qty: number }> {
  const variants = await strapi.db.query('api::variant.variant').findMany({});

  let totalValue = 0;
  let totalQty = 0;

  for (const v of variants) {
    const stock = Number(v.stock) || 0;
    const price = Number(v.price) || 0;
    totalQty += stock;
    totalValue += stock * price;
  }

  return { value: Math.round(totalValue), qty: totalQty };
}

/**
 * Автоматично закрити всі активні зміни за попередні дні
 */
async function autoClosePreviousDayShifts(strapi: Core.Strapi, todayDate: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docs = strapi.documents as any;

  // Знаходимо всі активні зміни з датою НЕ сьогодні
  const oldActiveShifts = await docs('api::shift.shift').findMany({
    filters: {
      status: 'active',
      shiftDate: { $ne: todayDate },
    },
  });

  // Закриваємо кожну стару зміну
  for (const shift of oldActiveShifts) {
    const activities = (shift.activities || []) as Activity[];
    const summary = calculateSummary(activities);

    // Час закриття = кінець того дня (23:59:59)
    const closedAt = `${shift.shiftDate}T23:59:59.999Z`;

    // Отримуємо поточну вартість запасів
    const inventory = await getCurrentInventory(strapi);

    await docs('api::shift.shift').update({
      documentId: shift.documentId,
      data: {
        closedAt,
        status: 'closed',
        summary,
        totalSales: summary.totalSales,
        totalSalesAmount: summary.totalSalesAmount,
        totalWriteOffs: summary.totalWriteOffs,
        totalWriteOffsQty: summary.totalWriteOffsQty,
        inventoryValue: inventory.value,
        inventoryQty: inventory.qty,
      },
    });

    strapi.log.info(`[Shift] Auto-closed shift for ${shift.shiftDate} with ${activities.length} activities, inventory: ${inventory.qty} items, ${inventory.value}₴`);
  }
}

/**
 * Знайти або створити зміну для вказаної дати
 */
async function findOrCreateShiftForDate(
  strapi: Core.Strapi,
  targetDate: string,
  initialActivity?: Activity
): Promise<{ shift: unknown; isNew: boolean }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docs = strapi.documents as any;

  // Шукаємо зміну за цю дату (активну або закриту)
  const existingShifts = await docs('api::shift.shift').findMany({
    filters: { shiftDate: targetDate },
    limit: 1,
  });

  if (existingShifts && existingShifts.length > 0) {
    const shift = existingShifts[0];

    // Якщо зміна закрита, але додається активність - перевідкриваємо
    if (shift.status === 'closed' && initialActivity) {
      const updatedShift = await docs('api::shift.shift').update({
        documentId: shift.documentId,
        data: {
          status: 'active',
          closedAt: null,
          activities: [initialActivity, ...(shift.activities || [])],
        },
      });
      strapi.log.info(`[Shift] Reopened shift for ${targetDate} to add activity`);
      return { shift: updatedShift, isNew: false };
    }

    return { shift, isNew: false };
  }

  // Створюємо нову зміну для цієї дати
  const now = new Date().toISOString();
  const newShift = await docs('api::shift.shift').create({
    data: {
      shiftDate: targetDate,
      startedAt: now,
      closedAt: null,
      status: 'active',
      activities: initialActivity ? [initialActivity] : [],
      summary: null,
      totalSales: 0,
      totalSalesAmount: 0,
      totalWriteOffs: 0,
      totalWriteOffsQty: 0,
      notes: null,
    },
  });

  strapi.log.info(`[Shift] Created new shift for ${targetDate}`);
  return { shift: newShift, isNew: true };
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * GET /api/shifts/current
   * Отримати або створити зміну на сьогодні
   * Автоматично закриває зміни за попередні дні
   */
  async getCurrent(ctx: Context) {
    try {
      const todayDate = getDateString();

      // Автоматично закриваємо старі зміни
      await autoClosePreviousDayShifts(strapi, todayDate);

      // Знаходимо або створюємо зміну на сьогодні
      const { shift, isNew } = await findOrCreateShiftForDate(strapi, todayDate);

      ctx.status = isNew ? 201 : 200;
      ctx.body = {
        success: true,
        data: shift,
        isNew,
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
   * Додати активність до зміни
   * Визначає дату зміни з timestamp активності
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

      // Визначаємо дату зміни з timestamp активності
      const activityDate = new Date(body.activity.timestamp);
      const targetDate = getDateString(activityDate);
      const todayDate = getDateString();

      // Автоматично закриваємо старі зміни (якщо активність на сьогодні)
      if (targetDate === todayDate) {
        await autoClosePreviousDayShifts(strapi, todayDate);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docs = strapi.documents as any;

      // Знаходимо зміну для дати активності
      const existingShifts = await docs('api::shift.shift').findMany({
        filters: { shiftDate: targetDate },
        limit: 1,
      });

      let shift;

      if (!existingShifts || existingShifts.length === 0) {
        // Створюємо нову зміну з цією активністю
        const result = await findOrCreateShiftForDate(strapi, targetDate, body.activity);
        shift = result.shift;
      } else {
        shift = existingShifts[0];
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

        // Якщо зміна була закрита - перевідкриваємо для сьогоднішньої дати
        const updateData: Record<string, unknown> = {
          activities: updatedActivities,
        };

        if (shift.status === 'closed' && targetDate === todayDate) {
          updateData.status = 'active';
          updateData.closedAt = null;
          strapi.log.info(`[Shift] Reopened shift for ${targetDate} to add activity`);
        }

        shift = await docs('api::shift.shift').update({
          documentId: shift.documentId,
          data: updateData,
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
   * Закрити поточну зміну (опційно - для додавання нотаток)
   * При автоматичних денних змінах це не обов'язково
   */
  async closeShift(ctx: Context) {
    try {
      const body = ctx.request.body as CloseShiftBody;
      const todayDate = getDateString();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docs = strapi.documents as any;

      // Знаходимо зміну на сьогодні
      const todayShifts = await docs('api::shift.shift').findMany({
        filters: { shiftDate: todayDate },
        limit: 1,
      });

      if (!todayShifts || todayShifts.length === 0) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: {
            code: 'NO_SHIFT_TODAY',
            message: 'No shift found for today',
          },
        };
        return;
      }

      const shift = todayShifts[0];

      // Якщо вже закрита - просто оновлюємо нотатки
      if (shift.status === 'closed') {
        if (body.notes) {
          const updatedShift = await docs('api::shift.shift').update({
            documentId: shift.documentId,
            data: { notes: body.notes },
          });
          ctx.body = {
            success: true,
            data: updatedShift,
            alert: {
              type: 'success',
              title: 'Нотатки збережено',
              message: 'Нотатки до зміни успішно оновлено.',
            },
          };
        } else {
          ctx.body = {
            success: true,
            data: shift,
            alert: {
              type: 'info',
              title: 'Зміна вже закрита',
              message: 'Сьогоднішня зміна вже була закрита раніше.',
            },
          };
        }
        return;
      }

      const activities = (shift.activities || []) as Activity[];
      const summary = calculateSummary(activities);
      const now = new Date().toISOString();

      // Отримуємо поточну вартість запасів
      const inventory = await getCurrentInventory(strapi);

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
          inventoryValue: inventory.value,
          inventoryQty: inventory.qty,
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
   * Отримати список всіх змін (для архіву)
   */
  async find(ctx: Context) {
    try {
      const { page = 1, pageSize = 10 } = ctx.query;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docs = strapi.documents as any;

      // Отримуємо всі зміни, сортовані по даті
      const shifts = await docs('api::shift.shift').findMany({
        sort: { shiftDate: 'desc' },
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize),
      });

      const total = await docs('api::shift.shift').count({});

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
