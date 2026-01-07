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
  SupplyRowData,
  ImportWarning,
} from './types';
import { getEurRate } from '../currency/currency.service';

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
  costPrice: number | null;
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
  ): Promise<{
    result: UpsertResult;
    rowOutcomes: Map<string, SupplyRowData['outcome']>;
    aggregationWarnings: ImportWarning[];
    aggregatedRows: NormalizedRow[];
  }> {
    this.strapi.log.info(`🚀 Starting upsert: ${rows.length} rows, stockMode=${options.stockMode}`);

    const result: UpsertResult = {
      flowersCreated: 0,
      flowersUpdated: 0,
      variantsCreated: 0,
      variantsUpdated: 0,
      operations: [],
    };

    const rowOutcomes = new Map<string, SupplyRowData['outcome']>();
    const aggregationWarnings: ImportWarning[] = [];

    // 1. Спочатку агрегуємо дублікати по slug + length
    const { aggregated, warnings } = this.aggregateVariants(rows);
    aggregationWarnings.push(...warnings);

    if (warnings.length > 0) {
      this.strapi.log.warn(`⚠️ Found ${warnings.length} duplicate variants that were aggregated`);
    }

    // 2. Групувати агреговані рядки по flower slug
    const rowsBySlug = new Map<string, NormalizedRow[]>();
    for (const row of aggregated) {
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

      // Upsert Variants для цієї квітки (вже агреговані по length)
      for (const row of flowerRows) {
        const { created: variantCreated, operation } = await this.upsertVariant(
          flower,
          row,
          options
        );

        if (variantCreated) {
          result.variantsCreated++;
          // Маркуємо всі оригінальні хеші як created
          this.markOriginalHashes(row, 'created', rowOutcomes);
        } else {
          result.variantsUpdated++;
          // Маркуємо всі оригінальні хеші як updated
          this.markOriginalHashes(row, 'updated', rowOutcomes);
        }

        if (operation) {
          result.operations.push(operation);
        }
      }
    }

    this.strapi.log.info(`✅ Upsert completed: flowers(+${result.flowersCreated}/~${result.flowersUpdated}), variants(+${result.variantsCreated}/~${result.variantsUpdated})`);

    return { result, rowOutcomes, aggregationWarnings, aggregatedRows: aggregated };
  }

  /**
   * Агрегувати рядки з однаковим slug + length
   * Сумує stock, бере останню ціну
   */
  private aggregateVariants(rows: NormalizedRow[]): {
    aggregated: NormalizedRow[];
    warnings: ImportWarning[];
  } {
    const grouped = new Map<string, NormalizedRow[]>();
    const warnings: ImportWarning[] = [];

    // Групуємо по slug + length
    for (const row of rows) {
      const variantLength = row.length ?? this.gradeToLength(row.grade);
      const key = `${row.slug}:${variantLength}`;
      const existing = grouped.get(key) || [];
      existing.push(row);
      grouped.set(key, existing);
    }

    const aggregated: NormalizedRow[] = [];

    for (const [key, groupRows] of grouped) {
      if (groupRows.length > 1) {
        // Знайдено дублікат - агрегуємо
        const totalStock = groupRows.reduce((sum, r) => sum + r.stock, 0);
        // Розраховуємо середньозважену ціну (собівартість) - без округлення для точності
        const totalCost = groupRows.reduce((sum, r) => sum + r.stock * r.price, 0);
        const weightedAvgPrice = totalStock > 0 ? totalCost / totalStock : 0;

        const lastRow = groupRows[groupRows.length - 1];
        const firstRow = groupRows[0];

        this.strapi.log.warn(
          `🔀 Aggregating ${groupRows.length} duplicate rows for ${lastRow.flowerName} ${lastRow.length ?? lastRow.grade}cm: ` +
          `${groupRows.map(r => r.stock).join(' + ')} = ${totalStock} stems, ` +
          `weighted avg price: ${weightedAvgPrice} (was: ${groupRows.map(r => r.price).join(', ')})`
        );

        warnings.push({
          row: firstRow.rowIndex,
          field: 'stock',
          message: `Знайдено ${groupRows.length} рядків для "${lastRow.flowerName}" ${lastRow.length ?? lastRow.grade}см. Кількість агреговано: ${groupRows.map(r => r.stock).join(' + ')} = ${totalStock} шт`,
          originalValue: groupRows.map(r => r.stock),
          normalizedValue: totalStock,
        });

        // Створюємо агрегований рядок з середньозваженою ціною
        aggregated.push({
          ...lastRow,
          stock: totalStock,
          price: weightedAvgPrice,  // Середньозважена собівартість
          // Зберігаємо оригінальні хеші для відстеження
          original: {
            ...lastRow.original,
            _aggregatedFromHashes: groupRows.map(r => r.hash),
            _aggregatedStocks: groupRows.map(r => r.stock),
            _aggregatedPrices: groupRows.map(r => r.price),
          },
        });
      } else {
        aggregated.push(groupRows[0]);
      }
    }

    return { aggregated, warnings };
  }

  /**
   * Маркувати всі оригінальні хеші (включаючи агреговані)
   */
  private markOriginalHashes(
    row: NormalizedRow,
    outcome: SupplyRowData['outcome'],
    rowOutcomes: Map<string, SupplyRowData['outcome']>
  ): void {
    // Маркуємо основний хеш
    rowOutcomes.set(row.hash, outcome);

    // Якщо рядок був агрегований - маркуємо всі оригінальні хеші
    const aggregatedHashes = (row.original as Record<string, unknown>)?._aggregatedFromHashes;
    if (Array.isArray(aggregatedHashes)) {
      for (const hash of aggregatedHashes) {
        if (typeof hash === 'string') {
          rowOutcomes.set(hash, outcome);
        }
      }
    }
  }

  /**
   * Upsert Flower
   * Використовує db.query для простоти і надійності
   */
  private async upsertFlower(
    name: string,
    slug: string
  ): Promise<{ flower: FlowerRecord; created: boolean }> {
    // Шукати існуючу квітку за slug через db.query
    const existing = await this.strapi.db.query('api::flower.flower').findOne({
      where: { slug },
      select: ['id', 'documentId', 'name', 'slug'],
    });

    if (existing) {
      this.strapi.log.debug('Flower already exists', { slug, id: existing.id });
      return { flower: existing as FlowerRecord, created: false };
    }

    // Створити нову квітку через db.query
    // draftAndPublish вимкнено - не потрібен publishedAt
    this.strapi.log.info(`🌸 Creating new flower: ${name} (${slug})`);
    const created = await this.strapi.db.query('api::flower.flower').create({
      data: {
        name,
        slug,
        locale: 'en',
      },
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
   * Upsert Variant
   * Зберігає costPrice (собівартість) з Excel, price (ціна продажу) не змінюється
   */
  private async upsertVariant(
    flower: FlowerRecord,
    row: NormalizedRow,
    options: ImportOptions
  ): Promise<{ created: boolean; operation: UpsertOperation | null }> {
    // Визначити критерій пошуку: length або grade
    const variantLength = row.length ?? this.gradeToLength(row.grade);

    // Собівартість з Excel (оригінальна ціна)
    const costPrice = row.price;
    this.strapi.log.info(`💵 Cost price from Excel: ${costPrice}`);

    // Шукати існуючий варіант
    const existing = await this.strapi.db.query('api::variant.variant').findOne({
      where: {
        flower: { documentId: flower.documentId },
        length: variantLength,
      },
      select: ['id', 'documentId', 'length', 'stock', 'price', 'costPrice'],
    }) as VariantRecord | null;

    if (existing) {
      // Оновити існуючий варіант
      const newStock = this.applyStockMode(existing.stock, row.stock, options.stockMode);

      // Собівартість завжди оновлюється з нового імпорту
      this.strapi.log.info(`🔄 Updating variant: ${flower.name} ${variantLength}cm - stock ${existing.stock}→${newStock}, costPrice ${existing.costPrice}→${costPrice}`);

      await this.strapi.db.query('api::variant.variant').update({
        where: { documentId: existing.documentId },
        data: {
          stock: newStock,
          costPrice: costPrice,
          // price (ціна продажу) НЕ оновлюється - адміністратор встановлює вручну
        },
      });

      return {
        created: false,
        operation: {
          type: 'update',
          entity: 'variant',
          documentId: existing.documentId,
          data: { length: variantLength, stock: newStock, costPrice: costPrice, slug: row.slug },
          before: { stock: existing.stock, costPrice: existing.costPrice, price: existing.price },
          after: { stock: newStock, costPrice: costPrice, price: existing.price },
        },
      };
    }

    // Створити новий варіант
    // Базова ціна продажу = собівартість (EUR) × 1.10 × курс EUR/UAH
    const eurRate = await getEurRate();
    const basePrice = Math.round(costPrice * 1.10 * eurRate * 100) / 100;
    this.strapi.log.info(`🌱 Creating variant: ${flower.name} ${variantLength}cm - stock ${row.stock}, costPrice ${costPrice}€, basePrice ${basePrice}₴ (+10% × ${eurRate} EUR/UAH)`);

    const created = await this.strapi.db.query('api::variant.variant').create({
      data: {
        length: variantLength,
        stock: row.stock,
        costPrice: costPrice,
        price: basePrice, // Базова ціна продажу = собівартість + 10%
        flower: flower.id,
        locale: 'en',
      },
    });

    this.strapi.log.info('Variant created successfully', {
      variantId: created.id,
      flowerId: flower.id,
      length: variantLength,
      costPrice: costPrice,
    });

    return {
      created: true,
      operation: {
        type: 'create',
        entity: 'variant',
        documentId: (created as VariantRecord).documentId,
        data: { length: variantLength, stock: row.stock, costPrice: costPrice, price: basePrice, flowerId: flower.id, slug: row.slug },
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

}
