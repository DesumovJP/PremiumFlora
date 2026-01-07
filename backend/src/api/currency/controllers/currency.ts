/**
 * Currency Controller
 *
 * Отримання курсу валют з НБУ
 */

import type { Context } from 'koa';
import { getEurRateInfo } from '../../../services/currency/currency.service';

export default {
  /**
   * GET /api/currency/eur
   * Отримати поточний курс EUR/UAH
   */
  async getEurRate(ctx: Context) {
    try {
      const rateInfo = await getEurRateInfo();

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: rateInfo,
      };
    } catch (error) {
      console.error('Currency getEurRate error:', error);

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
};
