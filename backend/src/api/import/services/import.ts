/**
 * Import Orchestration Service
 *
 * Координує весь процес імпорту Excel файлу:
 * 1. Checksum перевірка
 * 2. Парсинг
 * 3. Нормалізація
 * 4. Валідація
 * 5. Upsert (якщо не dry-run)
 * 6. Створення Supply запису
 */

import type { Core } from '@strapi/strapi';
import {
  checksumService,
  parserService,
  normalizerService,
  validatorService,
  UpserterService,
  applyFullCostCalculation,
  type ImportOptions,
  type ImportResult,
  type SupplyRowData,
  type SupplyStatus,
  type UpsertResult,
} from '../../../services/excel';
import { invalidateAnalyticsCache } from '../../analytics/services/analytics';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Обробити Excel файл
   */
  async processExcel(
    buffer: Buffer,
    filename: string,
    options: ImportOptions
  ): Promise<ImportResult> {
    // 1. Обчислити checksum
    const checksum = checksumService.compute(buffer);

    // 2. Перевірити на дублікат (якщо не forceImport)
    if (!options.forceImport) {
      const existing = await checksumService.findByChecksum(strapi, checksum);
      if (existing) {
        throw {
          code: 'DUPLICATE_CHECKSUM',
          message: `This file was already imported on ${new Date(existing.dateParsed).toLocaleString('uk-UA')}`,
          existingSupplyId: existing.id,
        };
      }
    } else {
      strapi.log.info('Force import enabled - skipping checksum validation', {
        checksum,
        filename,
      });
    }

    // 3. Парсинг Excel
    const { rows: parsedRows, detection } = parserService.parse(buffer);

    if (parsedRows.length === 0) {
      throw {
        code: 'VALIDATION_FAILED',
        message: 'No valid data rows found in the file',
      };
    }

    // Використати метадані з файлу якщо не вказано в options
    const effectiveAwb = options.awb || detection.metadata.awb || null;
    const effectiveSupplier = options.supplier || detection.metadata.supplier || null;

    // 4. Нормалізація
    const { normalized, warnings: normWarnings } = normalizerService.normalize(parsedRows);

    // 4.5 Застосування оверрайдів нормалізації (якщо є)
    if (options.rowOverrides && Object.keys(options.rowOverrides).length > 0) {
      strapi.log.info('Applying row overrides:', { count: Object.keys(options.rowOverrides).length });

      for (const row of normalized) {
        const override = options.rowOverrides[row.hash];
        if (override) {
          if (override.flowerName && override.flowerName !== row.flowerName) {
            strapi.log.info(`Overriding flowerName: "${row.flowerName}" → "${override.flowerName}"`);
            row.flowerName = override.flowerName;
            // Перерахуємо slug для нової назви
            row.slug = override.flowerName
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9а-яіїєґ\s-]/gi, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-');
          }
          if (override.length !== undefined && override.length !== row.length) {
            strapi.log.info(`Overriding length: ${row.length} → ${override.length}`);
            row.length = override.length;
          }
        }
      }
    }

    // 5. Валідація
    const { valid, errors, warnings: allWarnings } = validatorService.validate(
      normalized,
      normWarnings
    );

    // 5.5. Застосувати повний розрахунок собівартості (для обох dry-run і реального імпорту)
    // Це гарантує, що preview покаже ті ж ціни, що й остаточний результат
    let processedValid = valid;
    if (options.costCalculationMode === 'full' && detection.metadata) {
      strapi.log.info('💰 Applying full cost calculation (pre-upsert)');
      processedValid = applyFullCostCalculation(valid, options, detection.metadata, strapi.log);
    }

    // Підготувати row outcomes для Supply
    const rowOutcomes = new Map<string, SupplyRowData['outcome']>();

    // 6. Upsert (якщо не dry-run і є валідні рядки)
    let upsertResult: UpsertResult = {
      flowersCreated: 0,
      flowersUpdated: 0,
      variantsCreated: 0,
      variantsUpdated: 0,
      operations: [],
    };

    strapi.log.info(`🔍 Checking upsert conditions: dryRun=${options.dryRun}, validRows=${processedValid.length}, willUpsert=${!options.dryRun && processedValid.length > 0}`);

    // Для повернення з API - використовуємо агреговані рядки після upsert
    // Для dry-run використовуємо processedValid з розрахованими цінами
    let rowsToReturn = options.dryRun ? processedValid : normalized;

    if (!options.dryRun && processedValid.length > 0) {
      strapi.log.info('▶️ Starting upsert process...');
      const upserter = new UpserterService(strapi);
      // Передаємо processedValid - вже з розрахованими цінами якщо full mode
      // detection.metadata передаємо для агрегації (upsert може перерахувати якщо потрібно)
      const { result, rowOutcomes: outcomes, aggregationWarnings, aggregatedRows } = await upserter.upsert(processedValid, options, detection.metadata);
      upsertResult = result;
      rowsToReturn = aggregatedRows; // Повертаємо агреговані рядки з правильними цінами
      strapi.log.info('✅ Upsert completed', { result });

      // Додати попередження про агрегацію
      allWarnings.push(...aggregationWarnings);

      // Копіювати outcomes
      for (const [hash, outcome] of outcomes) {
        rowOutcomes.set(hash, outcome);
      }
    } else if (options.dryRun) {
      // Для dry-run позначити всі як skipped (вже з розрахованими цінами)
      for (const row of processedValid) {
        rowOutcomes.set(row.hash, 'skipped');
      }
    }

    // Позначити невалідні рядки як error
    for (const error of errors) {
      const row = normalized.find((r) => r.rowIndex === error.row);
      if (row) {
        rowOutcomes.set(row.hash, 'error');
      }
    }

    // 7. Визначити статус
    let supplyStatus: SupplyStatus;
    if (options.dryRun) {
      supplyStatus = 'dry-run';
    } else if (errors.length > 0 && valid.length === 0) {
      supplyStatus = 'failed';
    } else {
      supplyStatus = 'success';
    }

    // 8. Підготувати дані для Supply
    // Використовуємо rowsToReturn для збереження розрахованих цін (processedValid для dry-run, aggregatedRows для import)
    const supplyRows: SupplyRowData[] = rowsToReturn.map((row) => ({
      original: row.original,  // Містить _fullCostCalculation якщо mode=full
      normalized: {
        flowerName: row.flowerName,
        length: row.length,
        grade: row.grade,
        stock: row.stock,
        costPrice: row.price,  // Розрахована ціна (full cost або оригінальна)
        supplier: row.supplier,
        awb: row.awb,
      },
      hash: row.hash,
      outcome: rowOutcomes.get(row.hash) || 'skipped',
      error: errors.find((e) => e.row === row.rowIndex)?.message,
    }));

    // Логування для діагностики
    strapi.log.info('Creating Supply record', {
      filename,
      checksum,
      rowsCount: supplyRows.length,
      supplyStatus,
      errorsCount: errors.length,
      warningsCount: allWarnings.length,
      firstRowSample: supplyRows[0] ? {
        hash: supplyRows[0].hash,
        outcome: supplyRows[0].outcome,
        flowerName: supplyRows[0].normalized.flowerName,
      } : null,
    });

    // 9. Створити Supply запис через Documents API (для правильної роботи з draftAndPublish)
    const supply = await strapi.documents('api::supply.supply').create({
      data: {
        filename,
        checksum,
        dateParsed: new Date().toISOString(),
        awb: effectiveAwb,
        supplier: effectiveSupplier,
        rows: supplyRows as any, // JSON field
        supplyStatus,
        supplyErrors: errors as any, // JSON field
        supplyWarnings: allWarnings as any, // JSON field
        users_permissions_user: options.userId || null,
        costCalculationMode: options.costCalculationMode || 'simple',
        fullCostParams: options.fullCostParams as any || null,
      },
    });

    // Опублікувати Supply через Documents API
    await strapi.documents('api::supply.supply').publish({
      documentId: supply.documentId,
    });

    strapi.log.info('Supply record created and published via Documents API', {
      supplyId: supply.id,
      documentId: supply.documentId,
      filename: supply.filename,
      supplyStatus: supply.supplyStatus,
      rowsStored: supply.rows
        ? (Array.isArray(supply.rows) ? supply.rows.length : 'not an array')
        : 'null or undefined',
      rowsType: supply.rows ? typeof supply.rows : 'null',
      rowsSample: supply.rows && Array.isArray(supply.rows) && supply.rows.length > 0
        ? supply.rows[0]
        : null,
    });

    // 10. Інвалідуємо кеш аналітики (якщо не dry-run і були зміни)
    if (!options.dryRun && processedValid.length > 0) {
      invalidateAnalyticsCache();
    }

    // 11. Повернути результат
    return {
      supplyId: typeof supply.id === 'string' ? parseInt(supply.id, 10) : supply.id,
      status: supplyStatus,
      stats: {
        totalRows: parsedRows.length,
        validRows: processedValid.length,
        flowersCreated: upsertResult.flowersCreated,
        flowersUpdated: upsertResult.flowersUpdated,
        variantsCreated: upsertResult.variantsCreated,
        variantsUpdated: upsertResult.variantsUpdated,
      },
      errors,
      warnings: allWarnings,
      rows: rowsToReturn,
      operations: upsertResult.operations,
    };
  },
});
