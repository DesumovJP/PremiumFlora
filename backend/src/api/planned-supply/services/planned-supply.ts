/**
 * Planned Supply Service
 *
 * Сервіс для роботи з запланованими поставками
 */

import type { Core } from '@strapi/strapi';

interface LowStockVariant {
  variantId: number;
  variantDocumentId: string;
  flowerId: number;
  flowerDocumentId: string;
  flowerName: string;
  flowerSlug: string;
  imageUrl: string | null;
  length: number;
  currentStock: number;
  price: number;
}

interface FlowerWithVariants {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  image?: {
    url: string;
  } | null;
  variants: Array<{
    id: number;
    documentId: string;
    length: number;
    stock: number;
    price: number;
  }>;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Отримати варіанти з низькими залишками
   * @param threshold - поріг для визначення низького залишку (за замовчуванням 100)
   */
  async getLowStockVariants(threshold: number = 100): Promise<LowStockVariant[]> {
    strapi.log.info(`🔍 Fetching low stock variants (threshold: ${threshold})`);

    // Отримати всі квіти з варіантами та зображеннями
    const flowers = await strapi.entityService.findMany('api::flower.flower', {
      filters: {
        locale: 'en',
      },
      populate: {
        image: true,
        variants: {
          filters: {
            stock: {
              $lte: threshold,
            },
          },
        },
      },
    }) as unknown as FlowerWithVariants[];

    // Перетворити в плоский масив варіантів з інформацією про квітку
    const lowStockVariants: LowStockVariant[] = [];

    for (const flower of flowers) {
      if (flower.variants && flower.variants.length > 0) {
        for (const variant of flower.variants) {
          lowStockVariants.push({
            variantId: variant.id,
            variantDocumentId: variant.documentId,
            flowerId: flower.id,
            flowerDocumentId: flower.documentId,
            flowerName: flower.name,
            flowerSlug: flower.slug,
            imageUrl: flower.image?.url || null,
            length: variant.length,
            currentStock: variant.stock,
            price: variant.price,
          });
        }
      }
    }

    strapi.log.info(`✅ Found ${lowStockVariants.length} low stock variants`);
    return lowStockVariants;
  },

  /**
   * Пошук квітів за назвою або slug
   * @param query - пошуковий запит
   */
  async searchFlowers(query: string): Promise<FlowerWithVariants[]> {
    strapi.log.info(`🔍 Searching flowers: "${query}"`);

    const flowers = await strapi.entityService.findMany('api::flower.flower', {
      filters: {
        $or: [
          { name: { $containsi: query } },
          { slug: { $containsi: query } },
        ],
        locale: 'en',
      },
      populate: {
        variants: true,
      },
      limit: 20,
    }) as unknown as FlowerWithVariants[];

    strapi.log.info(`✅ Found ${flowers.length} flowers matching "${query}"`);
    return flowers;
  },

  /**
   * Отримати всі квіти з варіантами
   */
  async getAllFlowersWithVariants(): Promise<FlowerWithVariants[]> {
    strapi.log.info('🔍 Fetching all flowers with variants');

    const flowers = await strapi.entityService.findMany('api::flower.flower', {
      filters: {
        locale: 'en',
      },
      populate: {
        variants: true,
      },
    }) as unknown as FlowerWithVariants[];

    strapi.log.info(`✅ Found ${flowers.length} flowers`);
    return flowers;
  },
});
