/**
 * POS Auth Middleware
 *
 * Перевіряє авторизацію для POS операцій.
 * Підтримує як Users & Permissions токени, так і Admin токени.
 */

import type { Core } from '@strapi/strapi';

export default (config: any, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    // Отримуємо Authorization header
    const authHeader = ctx.request.header.authorization;

    if (!authHeader) {
      strapi.log.warn('🔒 POS Auth: No authorization header');
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header is required',
        },
        alert: {
          type: 'error',
          title: 'Не авторизовано',
          message: 'Будь ласка, увійдіть в систему',
        },
      };
      return;
    }

    // Перевіряємо формат Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      strapi.log.warn('🔒 POS Auth: Invalid authorization format');
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: {
          code: 'INVALID_TOKEN_FORMAT',
          message: 'Invalid authorization format. Expected: Bearer <token>',
        },
      };
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      strapi.log.warn('🔒 POS Auth: Empty token');
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: {
          code: 'EMPTY_TOKEN',
          message: 'Token is empty',
        },
      };
      return;
    }

    let isAuthenticated = false;

    // Спробуємо верифікувати як Users & Permissions токен
    try {
      const jwt = strapi.plugin('users-permissions').service('jwt');
      const decoded = jwt.verify(token);

      if (decoded && decoded.id) {
        strapi.log.info('🔓 POS Auth: Valid U&P token for user:', decoded.id);
        ctx.state.user = { id: decoded.id };
        isAuthenticated = true;
      }
    } catch (upError) {
      strapi.log.debug('🔒 POS Auth: Not a U&P token, trying admin...');
    }

    // Якщо не U&P, спробуємо Admin токен
    if (!isAuthenticated) {
      try {
        const adminJwt = strapi.admin.services.token;
        const decoded = adminJwt.decodeJwtToken(token);

        if (decoded && decoded.id) {
          strapi.log.info('🔓 POS Auth: Valid admin token for user:', decoded.id);
          ctx.state.user = { id: decoded.id, isAdmin: true };
          isAuthenticated = true;
        }
      } catch (adminError) {
        strapi.log.debug('🔒 POS Auth: Invalid admin token');
      }
    }

    if (!isAuthenticated) {
      strapi.log.warn('🔒 POS Auth: Token verification failed');
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
        alert: {
          type: 'error',
          title: 'Сесія закінчилась',
          message: 'Будь ласка, увійдіть знову',
        },
      };
      return;
    }

    // Авторизація успішна - продовжуємо
    await next();
  };
};
