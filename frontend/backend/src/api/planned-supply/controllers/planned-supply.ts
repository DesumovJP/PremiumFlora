/**
 * Planned Supply Controller
 *
 * Контролер для роботи з запланованими поставками
 */

import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';

interface PlannedSupplyService {
  getLowStockVariants: (threshold: number) => Promise<unknown>;
  searchFlowers: (query: string) => Promise<unknown>;
  getAllFlowersWithVariants: () => Promise<unknown>;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * GET /api/planned-supply/low-stock
   * Отримати варіанти з низькими залишками
   */
  async lowStock(ctx: Context) {
    try {
      const threshold = parseInt(ctx.query.threshold as string) || 100;

      if (threshold < 0 || threshold > 10000) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'INVALID_THRESHOLD',
            message: 'Threshold must be between 0 and 10000',
          },
        };
        return;
      }

      const service = strapi.service('api::planned-supply.planned-supply') as PlannedSupplyService;
      const data = await service.getLowStockVariants(threshold);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data,
      };
    } catch (error) {
      strapi.log.error('Planned supply lowStock error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch low stock variants',
        },
      };
    }
  },

  /**
   * GET /api/planned-supply/search
   * Пошук квітів за назвою або slug
   */
  async search(ctx: Context) {
    try {
      const query = ctx.query.q as string;

      if (!query || query.trim().length < 2) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'INVALID_QUERY',
            message: 'Query must be at least 2 characters long',
          },
        };
        return;
      }

      const service = strapi.service('api::planned-supply.planned-supply') as PlannedSupplyService;
      const data = await service.searchFlowers(query.trim());

      ctx.status = 200;
      ctx.body = {
        success: true,
        data,
      };
    } catch (error) {
      strapi.log.error('Planned supply search error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to search flowers',
        },
      };
    }
  },

  /**
   * GET /api/planned-supply/all-flowers
   * Отримати всі квіти з варіантами
   */
  async allFlowers(ctx: Context) {
    try {
      const service = strapi.service('api::planned-supply.planned-supply') as PlannedSupplyService;
      const data = await service.getAllFlowersWithVariants();

      ctx.status = 200;
      ctx.body = {
        success: true,
        data,
      };
    } catch (error) {
      strapi.log.error('Planned supply allFlowers error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch all flowers',
        },
      };
    }
  },
});
