/**
 * Global Policies
 *
 * Експортуємо всі глобальні політики для реєстрації в Strapi
 */

import isAuthenticated from './is-authenticated';

export default {
  'is-authenticated': isAuthenticated,
};
