/**
 * Скрипт для повного скидання квітів та варіантів
 *
 * Видаляє всі записи з таблиць flowers і variants,
 * щоб можна було перестворити їх через admin panel.
 *
 * Запуск: викликається з bootstrap один раз
 */

import type { Core } from '@strapi/strapi';

export async function resetFlowersAndVariants(strapi: Core.Strapi): Promise<void> {
  strapi.log.info('🗑️ Starting flowers and variants reset...');

  try {
    // 1. Видалити всі варіанти
    const variants = await strapi.db.query('api::variant.variant').findMany({});
    strapi.log.info(`Found ${variants.length} variants to delete`);

    for (const variant of variants) {
      await strapi.db.query('api::variant.variant').delete({
        where: { id: variant.id },
      });
    }
    strapi.log.info(`✅ Deleted ${variants.length} variants`);

    // 2. Видалити всі квіти
    const flowers = await strapi.db.query('api::flower.flower').findMany({});
    strapi.log.info(`Found ${flowers.length} flowers to delete`);

    for (const flower of flowers) {
      await strapi.db.query('api::flower.flower').delete({
        where: { id: flower.id },
      });
    }
    strapi.log.info(`✅ Deleted ${flowers.length} flowers`);

    strapi.log.info('🎉 Reset completed! You can now create flowers through admin panel.');

  } catch (error) {
    strapi.log.error('❌ Error during reset:', error);
    throw error;
  }
}
