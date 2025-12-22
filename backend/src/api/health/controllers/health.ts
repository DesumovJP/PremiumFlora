/**
 * Health Controller
 *
 * Простий healthcheck endpoint для Railway
 */

import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';

export default (_: { strapi: Core.Strapi }) => ({
  /**
   * GET /api/health
   */
  async index(ctx: Context) {
    ctx.status = 200;
    ctx.body = {
      status: 'ok',
      env: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };
  },
});


