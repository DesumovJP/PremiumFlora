/**
 * Скрипт для очищення дублікатів у базі даних
 *
 * Проблема: Strapi v5 може створювати кілька версій одного документа
 * з однаковим documentId але різними id та publishedAt.
 *
 * Рішення: Залишаємо тільки найновішу версію з варіантами,
 * видаляємо старі/пусті версії.
 *
 * Запуск: npx ts-node src/scripts/cleanup-duplicates.ts
 */

import type { Core } from '@strapi/strapi';

interface FlowerRecord {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface VariantRecord {
  id: number;
  documentId: string;
  length: number;
  price: number;
  stock: number;
  flower?: { id: number; documentId: string } | null;
}

export async function cleanupDuplicates(strapi: Core.Strapi): Promise<void> {
  strapi.log.info('🧹 Starting duplicate cleanup...');

  try {
    // 1. Знайти всі квіти
    const allFlowers = await strapi.db.query('api::flower.flower').findMany({
      select: ['id', 'documentId', 'name', 'slug', 'publishedAt', 'createdAt', 'updatedAt'],
      orderBy: { id: 'asc' },
    }) as FlowerRecord[];

    strapi.log.info(`Found ${allFlowers.length} total flower records`);

    // 2. Групувати по documentId
    const flowersByDocumentId = new Map<string, FlowerRecord[]>();
    for (const flower of allFlowers) {
      const existing = flowersByDocumentId.get(flower.documentId) || [];
      existing.push(flower);
      flowersByDocumentId.set(flower.documentId, existing);
    }

    // 3. Знайти дублікати
    let duplicatesRemoved = 0;
    let variantsReassigned = 0;

    for (const [documentId, flowers] of flowersByDocumentId) {
      if (flowers.length <= 1) continue;

      strapi.log.info(`\n📋 Found ${flowers.length} duplicates for documentId: ${documentId} (${flowers[0].name})`);

      // Знайти всі варіанти для цього documentId
      const variants = await strapi.db.query('api::variant.variant').findMany({
        where: {
          flower: { documentId },
        },
        populate: ['flower'],
        select: ['id', 'documentId', 'length', 'price', 'stock'],
      }) as VariantRecord[];

      strapi.log.info(`  Found ${variants.length} variants for this flower`);

      // Визначити "головний" запис - той що має варіанти або найстаріший
      let mainFlower: FlowerRecord | null = null;

      // Спочатку шукаємо запис з варіантами
      for (const flower of flowers) {
        const flowerVariants = await strapi.db.query('api::variant.variant').findMany({
          where: {
            flower: { id: flower.id },
          },
        });
        if (flowerVariants.length > 0) {
          mainFlower = flower;
          strapi.log.info(`  Main flower (has ${flowerVariants.length} variants): id=${flower.id}`);
          break;
        }
      }

      // Якщо немає з варіантами - беремо найстаріший
      if (!mainFlower) {
        mainFlower = flowers.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0];
        strapi.log.info(`  Main flower (oldest): id=${mainFlower.id}`);
      }

      // Видалити інші записи
      for (const flower of flowers) {
        if (flower.id === mainFlower.id) continue;

        // Перепризначити варіанти якщо є
        const orphanVariants = await strapi.db.query('api::variant.variant').findMany({
          where: {
            flower: { id: flower.id },
          },
        });

        for (const variant of orphanVariants) {
          await strapi.db.query('api::variant.variant').update({
            where: { id: variant.id },
            data: { flower: mainFlower.id },
          });
          variantsReassigned++;
          strapi.log.info(`    Reassigned variant id=${variant.id} to flower id=${mainFlower.id}`);
        }

        // Видалити дублікат
        await strapi.db.query('api::flower.flower').delete({
          where: { id: flower.id },
        });
        duplicatesRemoved++;
        strapi.log.info(`  ❌ Deleted duplicate flower id=${flower.id} (publishedAt: ${flower.publishedAt})`);
      }
    }

    // 4. Очистити осиротілі варіанти (без flower)
    const orphanVariants = await strapi.db.query('api::variant.variant').findMany({
      where: {
        flower: null,
      },
    });

    if (orphanVariants.length > 0) {
      strapi.log.info(`\n🗑️ Found ${orphanVariants.length} orphan variants (no flower)`);
      for (const variant of orphanVariants) {
        await strapi.db.query('api::variant.variant').delete({
          where: { id: variant.id },
        });
      }
      strapi.log.info(`  Deleted ${orphanVariants.length} orphan variants`);
    }

    strapi.log.info(`\n✅ Cleanup completed!`);
    strapi.log.info(`   Duplicates removed: ${duplicatesRemoved}`);
    strapi.log.info(`   Variants reassigned: ${variantsReassigned}`);
    strapi.log.info(`   Orphan variants deleted: ${orphanVariants.length}`);

  } catch (error) {
    strapi.log.error('❌ Error during cleanup:', error);
    throw error;
  }
}
