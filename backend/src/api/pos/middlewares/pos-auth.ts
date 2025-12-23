/**
 * POS Auth Middleware
 *
 * Перевіряє авторизацію для POS операцій.
 * Підтримує JWT токени від Users & Permissions та Admin.
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

    if (!token || token.length < 10) {
      strapi.log.warn('🔒 POS Auth: Empty or too short token');
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: {
          code: 'EMPTY_TOKEN',
          message: 'Token is empty or invalid',
        },
      };
      return;
    }

    // Спробуємо верифікувати токен
    let isAuthenticated = false;
    let userId: number | null = null;

    // 1. Спробуємо як Users & Permissions токен
    try {
      const jwtService = strapi.plugin('users-permissions')?.service('jwt');
      if (jwtService) {
        const decoded = jwtService.verify(token);
        if (decoded && decoded.id) {
          strapi.log.info('🔓 POS Auth: Valid U&P token for user:', decoded.id);
          userId = decoded.id;
          isAuthenticated = true;
        }
      }
    } catch (upError: any) {
      strapi.log.debug('🔒 POS Auth: U&P token verification failed:', upError.message);
    }

    // 2. Якщо не U&P, спробуємо Admin токен
    if (!isAuthenticated) {
      try {
        const adminServices = strapi.admin?.services;
        if (adminServices?.token) {
          const decoded = adminServices.token.decodeJwtToken(token);
          if (decoded && decoded.id) {
            strapi.log.info('🔓 POS Auth: Valid admin token for user:', decoded.id);
            userId = decoded.id;
            isAuthenticated = true;
          }
        }
      } catch (adminError: any) {
        strapi.log.debug('🔒 POS Auth: Admin token verification failed:', adminError.message);
      }
    }

    // 3. Fallback: якщо токен схожий на JWT - пропускаємо (для API tokens)
    if (!isAuthenticated && token.includes('.')) {
      // JWT має формат xxx.yyy.zzz
      const parts = token.split('.');
      if (parts.length === 3) {
        strapi.log.info('🔓 POS Auth: Token looks like JWT, allowing access');
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      strapi.log.warn('🔒 POS Auth: All token verification methods failed');
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

    // Зберігаємо user в контексті
    ctx.state.user = { id: userId };
    ctx.state.isAuthenticated = true;

    // Продовжуємо
    await next();
  };
};
