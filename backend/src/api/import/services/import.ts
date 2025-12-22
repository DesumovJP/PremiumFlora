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
  type ImportOptions,
  type ImportResult,
  type SupplyRowData,
  type SupplyStatus,
} from '../../../services/excel';

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

    // 5. Валідація
    const { valid, errors, warnings: allWarnings } = validatorService.validate(
      normalized,
      normWarnings
    );

    // Підготувати row outcomes для Supply
    const rowOutcomes = new Map<string, SupplyRowData['outcome']>();

    // 6. Upsert (якщо не dry-run і є валідні рядки)
    let upsertResult = {
      flowersCreated: 0,
      flowersUpdated: 0,
      variantsCreated: 0,
      variantsUpdated: 0,
    };

    strapi.log.info(`🔍 Checking upsert conditions: dryRun=${options.dryRun}, validRows=${valid.length}, willUpsert=${!options.dryRun && valid.length > 0}`);

    if (!options.dryRun && valid.length > 0) {
      strapi.log.info('▶️ Starting upsert process...');
      const upserter = new UpserterService(strapi);
      const { result, rowOutcomes: outcomes } = await upserter.upsert(valid, options);
      upsertResult = result;
      strapi.log.info('✅ Upsert completed', { result });

      // Копіювати outcomes
      for (const [hash, outcome] of outcomes) {
        rowOutcomes.set(hash, outcome);
      }
    } else if (options.dryRun) {
      // Для dry-run позначити всі як skipped
      for (const row of valid) {
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
    const supplyRows: SupplyRowData[] = normalized.map((row) => ({
      original: row.original,
      normalized: {
        flowerName: row.flowerName,
        length: row.length,
        grade: row.grade,
        stock: row.stock,
        price: row.price,
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

    // 10. Повернути результат
    return {
      supplyId: typeof supply.id === 'string' ? parseInt(supply.id, 10) : supply.id,
      status: supplyStatus,
      stats: {
        totalRows: parsedRows.length,
        validRows: valid.length,
        ...upsertResult,
      },
      errors,
      warnings: allWarnings,
      rows: normalized,
    };
  },
});
