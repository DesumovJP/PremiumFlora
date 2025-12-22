/**
 * Upserter Service
 *
 * Ідемпотентний upsert для Flower та Variant записів у Strapi
 */

import type { Core } from '@strapi/strapi';
import type {
  NormalizedRow,
  ImportOptions,
  UpsertResult,
  UpsertOperation,
  StockMode,
  PriceMode,
  SupplyRowData,
} from './types';

interface FlowerRecord {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

interface VariantRecord {
  id: number;
  documentId: string;
  length: number | null;
  stock: number;
  price: number;
  flower: { id: number } | null;
}

export class UpserterService {
  constructor(private strapi: Core.Strapi) {}

  /**
   * Виконати upsert для всіх рядків
   */
  async upsert(
    rows: NormalizedRow[],
    options: ImportOptions
  ): Promise<{ result: UpsertResult; rowOutcomes: Map<string, SupplyRowData['outcome']> }> {
    this.strapi.log.info(`🚀 Starting upsert: ${rows.length} rows, stockMode=${options.stockMode}, priceMode=${options.priceMode}`);
    this.strapi.log.info(`💰 Price calculation options: applyPriceCalculation=${options.applyPriceCalculation}, exchangeRate=${options.exchangeRate}, marginMultiplier=${options.marginMultiplier}`);

    const result: UpsertResult = {
      flowersCreated: 0,
      flowersUpdated: 0,
      variantsCreated: 0,
      variantsUpdated: 0,
      operations: [],
    };

    const rowOutcomes = new Map<string, SupplyRowData['outcome']>();

    // Групувати рядки по flower slug для оптимізації
    const rowsBySlug = new Map<string, NormalizedRow[]>();
    for (const row of rows) {
      const existing = rowsBySlug.get(row.slug) || [];
      existing.push(row);
      rowsBySlug.set(row.slug, existing);
    }

    this.strapi.log.info(`📊 Grouped into ${rowsBySlug.size} unique flowers: ${Array.from(rowsBySlug.keys()).join(', ')}`);

    // Обробити кожну квітку та її варіанти
    for (const [slug, flowerRows] of rowsBySlug) {
      const firstRow = flowerRows[0];

      // Upsert Flower
      const { flower, created: flowerCreated } = await this.upsertFlower(
        firstRow.flowerName,
        slug
      );

      if (flowerCreated) {
        result.flowersCreated++;
        result.operations.push({
          type: 'create',
          entity: 'flower',
          documentId: flower.documentId,
          data: { name: flower.name, slug: flower.slug },
        });
      } else {
        result.flowersUpdated++;
        result.operations.push({
          type: 'update',
          entity: 'flower',
          documentId: flower.documentId,
          data: { name: flower.name, slug: flower.slug },
        });
      }

      // Upsert Variants для цієї квітки
      for (const row of flowerRows) {
        const { created: variantCreated, operation } = await this.upsertVariant(
          flower,
          row,
          options
        );

        if (variantCreated) {
          result.variantsCreated++;
          rowOutcomes.set(row.hash, 'created');
        } else {
          result.variantsUpdated++;
          rowOutcomes.set(row.hash, 'updated');
        }

        if (operation) {
          result.operations.push(operation);
        }
      }
    }

    this.strapi.log.info(`✅ Upsert completed: flowers(+${result.flowersCreated}/~${result.flowersUpdated}), variants(+${result.variantsCreated}/~${result.variantsUpdated})`);

    return { result, rowOutcomes };
  }

  /**
   * Upsert Flower
   */
  private async upsertFlower(
    name: string,
    slug: string
  ): Promise<{ flower: FlowerRecord; created: boolean }> {
    // Шукати існуючу квітку за slug
    const existing = await this.strapi.db.query('api::flower.flower').findOne({
      where: { slug },
      select: ['id', 'documentId', 'name', 'slug', 'publishedAt'],
    });

    if (existing) {
      // Перевірити чи опублікована
      if (!existing.publishedAt) {
        this.strapi.log.info(`📤 Publishing existing flower: ${existing.name} (was draft)`);
        // Опублікувати через Entity Service update (використовуємо documentId)
        // В Strapi v5 потрібно явно вказати publishedAt та status
        await this.strapi.entityService.update('api::flower.flower', existing.documentId, {
          data: {
            publishedAt: new Date().toISOString(),
          },
          // Явно вказуємо статус published
        });
        
        // Перезавантажити для отримання оновленого publishedAt
        const updated = await this.strapi.db.query('api::flower.flower').findOne({
          where: { documentId: existing.documentId },
          select: ['id', 'documentId', 'name', 'slug', 'publishedAt'],
        });
        if (updated) {
          this.strapi.log.info(`✅ Flower published: ${updated.name}, publishedAt=${updated.publishedAt}`);
          return { flower: updated as FlowerRecord, created: false };
        }
      }
      this.strapi.log.debug('Flower already exists', { slug, id: existing.id, published: !!existing.publishedAt });
      return { flower: existing as FlowerRecord, created: false };
    }

    // Створити нову квітку через Entity Service (для draft/publish)
    this.strapi.log.info(`🌸 Creating new flower: ${name} (${slug})`);
    const created = await this.strapi.entityService.create('api::flower.flower', {
      data: {
        name,
        slug,
        locale: 'en', // Змінено на 'en' для сумісності з Content Manager
        publishedAt: new Date().toISOString(), // Явно вказуємо publishedAt
      },
      // Strapi v5: явно вказуємо статус published
    });

    this.strapi.log.info('Flower created successfully', {
      id: created.id,
      documentId: created.documentId,
      name: created.name,
      slug: created.slug,
    });

    return { flower: created as FlowerRecord, created: true };
  }

  /**
   * Розрахувати фінальну ціну з урахуванням курсу та маржі
   */
  private calculatePrice(basePrice: number, options: ImportOptions): number {
    if (!options.applyPriceCalculation) {
      return basePrice;
    }

    const exchangeRate = options.exchangeRate ?? 1;
    const marginMultiplier = options.marginMultiplier ?? 1;
    const calculatedPrice = basePrice * exchangeRate * marginMultiplier;

    this.strapi.log.info(`💰 Price calculation: ${basePrice} USD × ${exchangeRate} UAH × ${marginMultiplier} margin = ${calculatedPrice.toFixed(2)} UAH`);

    return Math.round(calculatedPrice * 100) / 100; // Округлити до копійок
  }

  /**
   * Upsert Variant
   */
  private async upsertVariant(
    flower: FlowerRecord,
    row: NormalizedRow,
    options: ImportOptions
  ): Promise<{ created: boolean; operation: UpsertOperation | null }> {
    // Визначити критерій пошуку: length або grade
    // Для Strapi v5 Variant має тільки length (integer), тому grade зберігаємо як особливий length
    const variantLength = row.length ?? this.gradeToLength(row.grade);

    // Розрахувати фінальну ціну
    this.strapi.log.info(`💵 Before price calculation: row.price=${row.price}, options.applyPriceCalculation=${options.applyPriceCalculation}, options.exchangeRate=${options.exchangeRate}, options.marginMultiplier=${options.marginMultiplier}`);
    const finalPrice = this.calculatePrice(row.price, options);
    this.strapi.log.info(`💵 After price calculation: finalPrice=${finalPrice}`);

    // Шукати існуючий варіант (використовуємо documentId для flower relation)
    const existing = await this.strapi.db.query('api::variant.variant').findOne({
      where: {
        flower: { documentId: flower.documentId },
        length: variantLength,
      },
      select: ['id', 'documentId', 'length', 'stock', 'price'],
    }) as VariantRecord | null;

    if (existing) {
      // Оновити існуючий варіант
      const newStock = this.applyStockMode(existing.stock, row.stock, options.stockMode);
      this.strapi.log.info(`💵 Price mode: ${options.priceMode}, existing.price=${existing.price}, finalPrice=${finalPrice}`);
      const newPrice = this.applyPriceMode(existing.price, finalPrice, options.priceMode);
      this.strapi.log.info(`💵 Applied price mode result: newPrice=${newPrice}`);

      this.strapi.log.info(`🔄 Updating variant: ${flower.name} ${variantLength}cm - stock ${existing.stock}→${newStock}, price ${existing.price}→${newPrice}`);

      // Використовуємо documentId для оновлення в Strapi v5
      const updated = await this.strapi.db.query('api::variant.variant').update({
        where: { documentId: existing.documentId },
        data: {
          stock: newStock,
          price: newPrice,
        },
      });

      // Перевірити, чи оновлення спрацювало
      const verify = await this.strapi.db.query('api::variant.variant').findOne({
        where: { documentId: existing.documentId },
        select: ['id', 'documentId', 'price', 'stock'],
      });
      this.strapi.log.info(`✅ Verification after update: variant documentId=${existing.documentId}, price=${verify?.price}, stock=${verify?.stock}, expected price=${newPrice}, match=${verify?.price === newPrice}`);

      return {
        created: false,
        operation: {
          type: 'update',
          entity: 'variant',
          documentId: existing.documentId,
          data: { length: variantLength, stock: newStock, price: newPrice },
          before: { stock: existing.stock, price: existing.price },
          after: { stock: newStock, price: newPrice },
        },
      };
    }

    // Створити новий варіант
    this.strapi.log.info(`🌱 Creating variant: ${flower.name} ${variantLength}cm - stock ${row.stock}, price ${finalPrice} UAH`);

    const created = await this.strapi.db.query('api::variant.variant').create({
      data: {
        length: variantLength,
        stock: row.stock,
        price: finalPrice, // Використовуємо розраховану ціну
        flower: flower.id,
        locale: 'en', // Змінено на 'en' для сумісності з Content Manager
        // Не потрібен publishedAt, бо draftAndPublish: false
      },
    });

    this.strapi.log.info('Variant created successfully', {
      variantId: created.id,
      documentId: (created as VariantRecord).documentId,
      flowerId: flower.id,
      length: variantLength,
    });

    return {
      created: true,
      operation: {
        type: 'create',
        entity: 'variant',
        documentId: (created as VariantRecord).documentId,
        data: { length: variantLength, stock: row.stock, price: finalPrice, flowerId: flower.id },
      },
    };
  }

  /**
   * Конвертувати текстовий grade в числове значення
   * Використовується коли Variant schema не підтримує текстовий grade
   */
  private gradeToLength(grade: string | null): number {
    if (!grade) return 0;

    const gradeMap: Record<string, number> = {
      mini: 10,
      standard: 40,
      select: 60,
      premium: 80,
      jumbo: 100,
      xl: 110,
      xxl: 120,
    };

    const lowerGrade = grade.toLowerCase();
    return gradeMap[lowerGrade] ?? 0;
  }

  /**
   * Застосувати режим stock
   */
  private applyStockMode(current: number, incoming: number, mode: StockMode): number {
    switch (mode) {
      case 'replace':
        return incoming;
      case 'add':
        return current + incoming;
      case 'skip':
        return current;
      default:
        return incoming;
    }
  }

  /**
   * Застосувати режим price
   */
  private applyPriceMode(current: number, incoming: number, mode: PriceMode): number {
    switch (mode) {
      case 'replace':
        return incoming;
      case 'lower':
        return Math.min(current, incoming);
      case 'skip':
        return current;
      default:
        return incoming;
    }
  }
}
