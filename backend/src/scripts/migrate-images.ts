/**
 * Скрипт для міграції картинок зі старих квітів на нові
 *
 * Знаходить квіти без картинок та копіює image зі старих квітів
 * (які мали суфікси Rose, Spray, Garden)
 *
 * Запуск: MIGRATE_IMAGES=true npm run develop
 */

import type { Core } from '@strapi/strapi';

// Суфікси які видалялись при нормалізації
const SUFFIXES_TO_REMOVE = [' Rose', ' Spray', ' Garden'];

export async function migrateFlowerImages(strapi: Core.Strapi): Promise<void> {
  strapi.log.info('🖼️ Starting flower images migration...');

  try {
    // Знайти всі квіти з populate image
    const flowers = await strapi.db.query('api::flower.flower').findMany({
      populate: ['image'],
    });

    strapi.log.info(`Found ${flowers.length} total flowers`);

    // Розділити на квіти з картинками і без
    const flowersWithImages = flowers.filter((f: any) => f.image);
    const flowersWithoutImages = flowers.filter((f: any) => !f.image);

    strapi.log.info(`Flowers with images: ${flowersWithImages.length}`);
    strapi.log.info(`Flowers without images: ${flowersWithoutImages.length}`);

    if (flowersWithoutImages.length === 0) {
      strapi.log.info('✅ All flowers already have images');
      return;
    }

    // Створити мапу: ім'я -> квітка з картинкою
    const imageMap = new Map<string, any>();
    for (const flower of flowersWithImages) {
      imageMap.set(flower.name, flower);
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const flower of flowersWithoutImages) {
      let sourceFlower = null;

      // Спробувати знайти стару квітку з суфіксом
      for (const suffix of SUFFIXES_TO_REMOVE) {
        const oldName = flower.name + suffix;
        if (imageMap.has(oldName)) {
          sourceFlower = imageMap.get(oldName);
          break;
        }
      }

      if (sourceFlower && sourceFlower.image) {
        // Оновити квітку з image
        await strapi.db.query('api::flower.flower').update({
          where: { id: flower.id },
          data: {
            image: sourceFlower.image.id,
          },
        });

        strapi.log.info(`✅ Migrated image: "${sourceFlower.name}" -> "${flower.name}"`);
        migratedCount++;
      } else {
        strapi.log.warn(`⚠️ No source image found for: "${flower.name}"`);
        skippedCount++;
      }
    }

    strapi.log.info('');
    strapi.log.info('📊 Migration summary:');
    strapi.log.info(`   Migrated: ${migratedCount}`);
    strapi.log.info(`   Skipped: ${skippedCount}`);
    strapi.log.info('🎉 Image migration completed!');

  } catch (error) {
    strapi.log.error('❌ Error during image migration:', error);
    throw error;
  }
}
