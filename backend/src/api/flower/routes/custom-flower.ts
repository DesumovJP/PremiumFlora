/**
 * Custom flower routes
 *
 * Adds safeUpdate endpoint that bypasses the problematic REST PUT behavior
 */

export default {
  routes: [
    {
      method: 'PUT',
      path: '/flowers/:documentId/safe-update',
      handler: 'flower.safeUpdate',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
