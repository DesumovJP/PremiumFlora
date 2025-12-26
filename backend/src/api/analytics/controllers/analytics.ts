/**
 * Analytics Controller
 *
 * Контролер для отримання аналітичних даних
 */

import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';

interface AnalyticsService {
  getDashboardData: (year?: number, month?: number) => Promise<unknown>;
  getStockLevels: () => Promise<unknown>;
  getSalesMetrics: (period: 'day' | 'week' | 'month') => Promise<unknown>;
  getWriteOffSummary: () => Promise<unknown>;
  getTopCustomers: (limit: number) => Promise<unknown>;
  getDailySales: (year?: number, month?: number) => Promise<unknown>;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * GET /api/analytics/dashboard
   * Отримати повну аналітику
   * Query params: year, month (0-11)
   */
  async dashboard(ctx: Context) {
    try {
      const year = ctx.query.year ? parseInt(ctx.query.year as string) : undefined;
      const month = ctx.query.month ? parseInt(ctx.query.month as string) : undefined;

      const analyticsService = strapi.service('api::analytics.analytics') as AnalyticsService;
      const data = await analyticsService.getDashboardData(year, month);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data,
      };
    } catch (error) {
      strapi.log.error('Analytics dashboard error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch dashboard analytics',
        },
      };
    }
  },

  /**
   * GET /api/analytics/stock
   * Отримати рівні складу
   */
  async stock(ctx: Context) {
    try {
      const analyticsService = strapi.service('api::analytics.analytics') as AnalyticsService;
      const data = await analyticsService.getStockLevels();

      ctx.status = 200;
      ctx.body = {
        success: true,
        data,
      };
    } catch (error) {
      strapi.log.error('Analytics stock error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch stock levels',
        },
      };
    }
  },

  /**
   * GET /api/analytics/sales
   * Отримати метрики продажів
   */
  async sales(ctx: Context) {
    try {
      const period = (ctx.query.period as 'day' | 'week' | 'month') || 'week';
      const validPeriods = ['day', 'week', 'month'];

      if (!validPeriods.includes(period)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'INVALID_PERIOD',
            message: `period must be one of: ${validPeriods.join(', ')}`,
          },
        };
        return;
      }

      const analyticsService = strapi.service('api::analytics.analytics') as AnalyticsService;
      const data = await analyticsService.getSalesMetrics(period);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data,
      };
    } catch (error) {
      strapi.log.error('Analytics sales error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch sales metrics',
        },
      };
    }
  },

  /**
   * GET /api/analytics/write-offs
   * Отримати підсумок списань
   */
  async writeOffs(ctx: Context) {
    try {
      const analyticsService = strapi.service('api::analytics.analytics') as AnalyticsService;
      const data = await analyticsService.getWriteOffSummary();

      ctx.status = 200;
      ctx.body = {
        success: true,
        data,
      };
    } catch (error) {
      strapi.log.error('Analytics writeOffs error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch write-off summary',
        },
      };
    }
  },

  /**
   * GET /api/analytics/customers/top
   * Отримати топ клієнтів
   */
  async topCustomers(ctx: Context) {
    try {
      const limit = parseInt(ctx.query.limit as string) || 10;
      const analyticsService = strapi.service('api::analytics.analytics') as AnalyticsService;
      const data = await analyticsService.getTopCustomers(Math.min(limit, 50));

      ctx.status = 200;
      ctx.body = {
        success: true,
        data,
      };
    } catch (error) {
      strapi.log.error('Analytics topCustomers error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch top customers',
        },
      };
    }
  },

  /**
   * GET /api/analytics/daily-sales
   * Отримати щоденні продажі
   */
  async dailySales(ctx: Context) {
    try {
      const analyticsService = strapi.service('api::analytics.analytics') as AnalyticsService;
      const data = await analyticsService.getDailySales();

      ctx.status = 200;
      ctx.body = {
        success: true,
        data,
      };
    } catch (error) {
      strapi.log.error('Analytics dailySales error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch daily sales',
        },
      };
    }
  },
});
