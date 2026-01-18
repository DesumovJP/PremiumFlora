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
  FormatDetectionResult,
  FullCostParams,
} from './types';
import { getUsdRate } from '../currency/currency.service';

/**
 * Застосувати повний розрахунок собівартості (статична функція для використання в dry-run)
 *
 * Формула:
 * costPrice = (basePrice + airPerStem + truckPerStem) × (1 + transferFeePercent/100) + taxPerStem
 */
export function applyFullCostCalculation(
  rows: NormalizedRow[],
  options: ImportOptions,
  metadata: FormatDetectionResult['metadata'],
  logger?: { info: (msg: string) => void; warn: (msg: string) => void; debug: (msg: string) => void }
): NormalizedRow[] {
  const { transport, totalBoxes } = metadata;

  // Default параметри
  const params: FullCostParams = {
    truckCostPerBox: options.fullCostParams?.truckCostPerBox ?? 75,
    transferFeePercent: options.fullCostParams?.transferFeePercent ?? 3.5,
    taxPerStem: options.fullCostParams?.taxPerStem ?? 0.05,
  };

  // Якщо немає даних для розрахунку - повернути без змін
  if (!transport || !totalBoxes || totalBoxes <= 0) {
    logger?.warn('⚠️ Missing transport or box data for full cost calculation, using simple mode');
    return rows;
  }

  // Вартість авіа доставки за коробку
  const airPerBox = transport / totalBoxes;

  logger?.info(`💰 Full cost calculation: transport=$${transport}, totalBoxes=${totalBoxes}, airPerBox=$${airPerBox.toFixed(2)}`);
  logger?.info(`💰 Params: truckCostPerBox=$${params.truckCostPerBox}, transferFee=${params.transferFeePercent}%, taxPerStem=$${params.taxPerStem}`);

  // Групуємо рядки по boxId для підрахунку stemsPerBox
  const stemsPerBox = new Map<string, number>();
  for (const row of rows) {
    const boxId = (row.original as Record<string, unknown>)?.boxId as string || 'default';
    const current = stemsPerBox.get(boxId) || 0;
    stemsPerBox.set(boxId, current + row.stock);
  }

  logger?.info(`📦 Stems per box: ${Array.from(stemsPerBox.entries()).map(([id, stems]) => `${id}=${stems}`).join(', ')}`);

  // Застосовуємо формулу до кожного рядка
  return rows.map(row => {
    const boxId = (row.original as Record<string, unknown>)?.boxId as string || 'default';
    const stemsInBox = stemsPerBox.get(boxId) || row.stock;

    // Розрахунок
    const basePrice = row.price;
    const airPerStem = airPerBox / stemsInBox;
    const truckPerStem = params.truckCostPerBox / stemsInBox;

    // Собівартість = (basePrice + airPerStem + truckPerStem) × (1 + transferFeePercent/100) + taxPerStem
    const subtotal = (basePrice + airPerStem + truckPerStem) * (1 + params.transferFeePercent / 100);
    const fullCost = Math.round((subtotal + params.taxPerStem) * 100) / 100;

    logger?.debug(
      `📊 ${row.flowerName}: base=$${basePrice.toFixed(2)} + air=$${airPerStem.toFixed(2)} + truck=$${truckPerStem.toFixed(2)} ` +
      `= $${(basePrice + airPerStem + truckPerStem).toFixed(2)} × 1.${params.transferFeePercent.toString().replace('.', '')} + $${params.taxPerStem} = $${fullCost.toFixed(2)}`
    );

    return {
      ...row,
      price: fullCost, // Оновлюємо собівартість
      original: {
        ...row.original,
        _fullCostCalculation: {
          basePrice,
          airPerStem: Math.round(airPerStem * 100) / 100,
          truckPerStem: Math.round(truckPerStem * 100) / 100,
          transferFeePercent: params.transferFeePercent,
          taxPerStem: params.taxPerStem,
          fullCost,
        },
      },
    };
  });
}

/**
 * Метадані для розрахунку собівартості
 */
interface CostCalculationContext {
  transport?: number;       // Загальна вартість авіа доставки
  totalBoxes?: number;      // Загальна кількість коробок
  totalFB?: number;         // Сума FB
  totalStems?: number;      // Загальна кількість квіток
  stemsPerBox: Map<string, number>; // Квіток на коробку
}

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
    options: ImportOptions,
    detectionMetadata?: FormatDetectionResult['metadata']
  ): Promise<{
    result: UpsertResult;
    rowOutcomes: Map<string, SupplyRowData['outcome']>;
    aggregationWarnings: ImportWarning[];
    aggregatedRows: NormalizedRow[];
  }> {
    this.strapi.log.info(`🚀 Starting upsert: ${rows.length} rows, stockMode=${options.stockMode}, costMode=${options.costCalculationMode || 'simple'}`);

    // Примітка: повний розрахунок собівартості (applyFullCostCalculation)
    // тепер викликається ЦЕНТРАЛІЗОВАНО в import.ts ДО виклику upsert
    // Це забезпечує однакові ціни для dry-run preview та реального імпорту

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

      // Парсимо ціну (може бути string, null, undefined, 0)
      const existingPrice = typeof existing.price === 'string'
        ? parseFloat(existing.price)
        : (existing.price ?? 0);

      this.strapi.log.info(`🔍 Existing variant price check: raw=${existing.price}, parsed=${existingPrice}, type=${typeof existing.price}`);

      // Якщо ціна продажу відсутня або 0 - розрахувати базову ціну
      let salePrice: number;
      if (!existingPrice || existingPrice <= 0 || isNaN(existingPrice)) {
        const usdRate = await getUsdRate();
        const marginPercent = options.salePriceMarginPercent ?? 10;
        const marginMultiplier = 1 + marginPercent / 100;
        salePrice = Math.round(costPrice * marginMultiplier * usdRate * 100) / 100;
        this.strapi.log.info(`💰 Calculating sale price: ${costPrice}$ × ${marginMultiplier.toFixed(2)} (+${marginPercent}%) × ${usdRate} = ${salePrice}₴`);

        // Оновлюємо ціну в базі
        await this.strapi.db.query('api::variant.variant').update({
          where: { documentId: existing.documentId },
          data: {
            stock: newStock,
            costPrice: costPrice,
            price: salePrice,
          },
        });
      } else {
        salePrice = existingPrice;
        this.strapi.log.info(`🔄 Updating variant: ${flower.name} ${variantLength}cm - stock ${existing.stock}→${newStock}, costPrice ${existing.costPrice}→${costPrice}, keeping price=${salePrice}₴`);

        await this.strapi.db.query('api::variant.variant').update({
          where: { documentId: existing.documentId },
          data: {
            stock: newStock,
            costPrice: costPrice,
          },
        });
      }

      this.strapi.log.info(`✅ Returning operation with price=${salePrice}`);

      return {
        created: false,
        operation: {
          type: 'update',
          entity: 'variant',
          documentId: existing.documentId,
          data: { length: variantLength, stock: newStock, costPrice: costPrice, price: salePrice, slug: row.slug },
          before: { stock: existing.stock, costPrice: existing.costPrice, price: existingPrice },
          after: { stock: newStock, costPrice: costPrice, price: salePrice },
        },
      };
    }

    // Створити новий варіант
    // Базова ціна продажу = собівартість (USD) × (1 + маржа%) × курс USD/UAH
    const usdRate = await getUsdRate();
    const marginPercent = options.salePriceMarginPercent ?? 10;
    const marginMultiplier = 1 + marginPercent / 100;
    const basePrice = Math.round(costPrice * marginMultiplier * usdRate * 100) / 100;
    this.strapi.log.info(`🌱 Creating variant: ${flower.name} ${variantLength}cm - stock ${row.stock}, costPrice ${costPrice}$, basePrice ${basePrice}₴ (+${marginPercent}% × ${usdRate} USD/UAH)`);

    const created = await this.strapi.db.query('api::variant.variant').create({
      data: {
        length: variantLength,
        stock: row.stock,
        costPrice: costPrice,
        price: basePrice, // Базова ціна продажу = собівартість × (1 + маржа%) × курс
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

    // DEBUG: логуємо ціну в operation для CREATE
    this.strapi.log.info(`📤 CREATE operation return: price=${basePrice}, costPrice=${costPrice}, slug=${row.slug}`);

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
