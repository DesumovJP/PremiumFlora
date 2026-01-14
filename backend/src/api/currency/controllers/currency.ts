/**
 * Currency Controller
 *
 * Отримання та встановлення курсу валют
 */

import type { Context } from 'koa';
import { getUsdRateInfo, setManualUsdRate, getManualUsdRate } from '../../../services/currency/currency.service';

export default {
  /**
   * GET /api/currency/usd
   * Отримати поточний курс USD/UAH
   */
  async getUsdRate(ctx: Context) {
    try {
      const rateInfo = await getUsdRateInfo();

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: rateInfo,
      };
    } catch (error) {
      console.error('Currency getUsdRate error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'CURRENCY_ERROR',
          message: 'Failed to fetch exchange rate',
        },
      };
    }
  },

  /**
   * POST /api/currency/usd/manual
   * Встановити ручний курс USD/UAH
   * Body: { rate: number | null }
   */
  async setManualRate(ctx: Context) {
    try {
      const body = ctx.request.body as { rate?: number | null };
      const rate = body?.rate;

      // Валідація
      if (rate !== null && rate !== undefined) {
        if (typeof rate !== 'number' || isNaN(rate) || rate <= 0) {
          ctx.status = 400;
          ctx.body = {
            success: false,
            error: {
              code: 'INVALID_RATE',
              message: 'Rate must be a positive number or null',
            },
          };
          return;
        }
      }

      // Встановити курс
      setManualUsdRate(rate ?? null);

      // Повернути оновлену інформацію
      const rateInfo = await getUsdRateInfo();

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: rateInfo,
        message: rate === null || rate === undefined
          ? 'Manual rate cleared, using NBU rate'
          : `Manual rate set to ${rate} UAH`,
      };
    } catch (error) {
      console.error('Currency setManualRate error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'CURRENCY_ERROR',
          message: 'Failed to set manual rate',
        },
      };
    }
  },

  /**
   * GET /api/currency/usd/manual
   * Отримати поточний ручний курс (якщо встановлено)
   */
  async getManualRate(ctx: Context) {
    try {
      const manualRate = getManualUsdRate();

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          rate: manualRate,
          isSet: manualRate !== null,
        },
      };
    } catch (error) {
      console.error('Currency getManualRate error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'CURRENCY_ERROR',
          message: 'Failed to get manual rate',
        },
      };
    }
  },
};
