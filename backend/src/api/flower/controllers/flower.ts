/**
 * flower controller
 *
 * Includes custom safeUpdate method that uses Documents API
 * to update published flowers without draft/publish cycle issues
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::flower.flower', ({ strapi }) => ({
  /**
   * Safe update for flowers - uses Documents API to update published version directly
   * This avoids the draft/publish cycle that breaks variant relations
   */
  async safeUpdate(ctx) {
    const { documentId } = ctx.params;
    const { data } = ctx.request.body;

    strapi.log.info(`🌸 safeUpdate called for flower: ${documentId}`, { data });

    if (!documentId) {
      return ctx.badRequest('documentId is required');
    }

    try {
      // Use Documents API to update the published version directly
      const updated = await strapi.documents('api::flower.flower').update({
        documentId,
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.image !== undefined && { image: data.image }),
        },
        status: 'published', // Update published version directly
      });

      strapi.log.info(`🌸 Flower updated successfully via Documents API:`, {
        documentId: updated.documentId,
        name: updated.name,
      });

      return { data: updated };
    } catch (error) {
      strapi.log.error(`🌸 Error in safeUpdate:`, error);
      return ctx.badRequest(error.message || 'Failed to update flower');
    }
  },
}));
