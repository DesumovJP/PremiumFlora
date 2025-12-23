/**
 * Global policy: is-authenticated
 *
 * Перевіряє наявність валідного JWT токена в запиті.
 * Підтримує як Users & Permissions токени, так і Admin токени.
 */

import type { Core } from '@strapi/strapi';

export default (policyContext: any, config: any, { strapi }: { strapi: Core.Strapi }) => {
  const ctx = policyContext;

  // Отримуємо Authorization header
  const authHeader = ctx.request.header.authorization;

  if (!authHeader) {
    strapi.log.warn('🔒 Auth policy: No authorization header');
    return false;
  }

  // Перевіряємо формат Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    strapi.log.warn('🔒 Auth policy: Invalid authorization format');
    return false;
  }

  const token = authHeader.substring(7);

  if (!token) {
    strapi.log.warn('🔒 Auth policy: Empty token');
    return false;
  }

  try {
    // Спробуємо верифікувати як Users & Permissions токен
    const jwt = strapi.plugin('users-permissions').service('jwt');
    const decoded = jwt.verify(token);

    if (decoded && decoded.id) {
      strapi.log.info('🔓 Auth policy: Valid U&P token for user:', decoded.id);
      ctx.state.user = { id: decoded.id };
      return true;
    }
  } catch (upError) {
    // Токен не валідний для Users & Permissions, спробуємо Admin
    strapi.log.debug('🔒 Auth policy: Not a U&P token, trying admin...');
  }

  try {
    // Спробуємо верифікувати як Admin токен
    const adminJwt = strapi.admin.services.token;
    const decoded = adminJwt.decodeJwtToken(token);

    if (decoded && decoded.id) {
      strapi.log.info('🔓 Auth policy: Valid admin token for user:', decoded.id);
      ctx.state.user = { id: decoded.id, isAdmin: true };
      return true;
    }
  } catch (adminError) {
    strapi.log.warn('🔒 Auth policy: Invalid admin token');
  }

  strapi.log.warn('🔒 Auth policy: Token verification failed');
  return false;
};
