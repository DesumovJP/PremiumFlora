/**
 * Validator Service
 *
 * Валідація нормалізованих даних перед upsert
 */

import type {
  NormalizedRow,
  ValidationResult,
  ImportError,
  ImportWarning,
} from './types';

export class ValidatorService {
  /**
   * Правила валідації
   */
  private readonly rules = {
    name: { required: true, minLength: 2, maxLength: 200 },
    slug: { required: true, minLength: 2, maxLength: 200 },
    length: { min: 1, max: 500 }, // null дозволено для grade-based
    grade: { maxLength: 50 },
    stock: { required: true, min: 0, max: 1000000 },
    price: { required: true, min: 0.01, max: 100000 },
  };

  /**
   * Валідувати масив нормалізованих рядків
   */
  validate(rows: NormalizedRow[], existingWarnings: ImportWarning[] = []): ValidationResult {
    const valid: NormalizedRow[] = [];
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [...existingWarnings];

    for (const row of rows) {
      const rowErrors = this.validateRow(row);

      if (rowErrors.length === 0) {
        valid.push(row);
      } else {
        errors.push(...rowErrors);
      }
    }

    // Перевірити на дублікати по хешу
    const duplicateWarnings = this.checkDuplicates(valid);
    warnings.push(...duplicateWarnings);

    return { valid, errors, warnings };
  }

  /**
   * Валідувати один рядок
   */
  private validateRow(row: NormalizedRow): ImportError[] {
    const errors: ImportError[] = [];

    // Валідація name
    if (!row.flowerName || row.flowerName.trim().length === 0) {
      errors.push({
        row: row.rowIndex,
        field: 'name',
        message: 'Flower name is required',
        value: row.flowerName,
      });
    } else if (row.flowerName.length < this.rules.name.minLength) {
      errors.push({
        row: row.rowIndex,
        field: 'name',
        message: `Flower name must be at least ${this.rules.name.minLength} characters`,
        value: row.flowerName,
      });
    } else if (row.flowerName.length > this.rules.name.maxLength) {
      errors.push({
        row: row.rowIndex,
        field: 'name',
        message: `Flower name must be at most ${this.rules.name.maxLength} characters`,
        value: row.flowerName,
      });
    }

    // Валідація slug
    if (!row.slug || row.slug.trim().length === 0) {
      errors.push({
        row: row.rowIndex,
        field: 'slug',
        message: 'Slug is required',
        value: row.slug,
      });
    }

    // Валідація length (якщо вказано)
    if (row.length !== null) {
      if (row.length < this.rules.length.min) {
        errors.push({
          row: row.rowIndex,
          field: 'length',
          message: `Length must be at least ${this.rules.length.min} cm`,
          value: row.length,
        });
      } else if (row.length > this.rules.length.max) {
        errors.push({
          row: row.rowIndex,
          field: 'length',
          message: `Length must be at most ${this.rules.length.max} cm`,
          value: row.length,
        });
      }
    }

    // Валідація: потрібно мати або length, або grade
    if (row.length === null && !row.grade) {
      errors.push({
        row: row.rowIndex,
        field: 'length',
        message: 'Either length or grade is required',
        value: null,
      });
    }

    // Валідація stock
    if (typeof row.stock !== 'number' || isNaN(row.stock)) {
      errors.push({
        row: row.rowIndex,
        field: 'stock',
        message: 'Stock must be a valid number',
        value: row.stock,
      });
    } else if (row.stock < this.rules.stock.min) {
      errors.push({
        row: row.rowIndex,
        field: 'stock',
        message: `Stock must be at least ${this.rules.stock.min}`,
        value: row.stock,
      });
    } else if (row.stock > this.rules.stock.max) {
      errors.push({
        row: row.rowIndex,
        field: 'stock',
        message: `Stock must be at most ${this.rules.stock.max}`,
        value: row.stock,
      });
    }

    // Валідація price
    if (typeof row.price !== 'number' || isNaN(row.price)) {
      errors.push({
        row: row.rowIndex,
        field: 'price',
        message: 'Price must be a valid number',
        value: row.price,
      });
    } else if (row.price < this.rules.price.min) {
      errors.push({
        row: row.rowIndex,
        field: 'price',
        message: `Price must be at least ${this.rules.price.min}`,
        value: row.price,
      });
    } else if (row.price > this.rules.price.max) {
      errors.push({
        row: row.rowIndex,
        field: 'price',
        message: `Price must be at most ${this.rules.price.max}`,
        value: row.price,
      });
    }

    return errors;
  }

  /**
   * Перевірити на дублікати в межах файлу
   */
  private checkDuplicates(rows: NormalizedRow[]): ImportWarning[] {
    const warnings: ImportWarning[] = [];
    const seenHashes = new Map<string, number>();

    for (const row of rows) {
      const existingRow = seenHashes.get(row.hash);
      if (existingRow !== undefined) {
        warnings.push({
          row: row.rowIndex,
          field: 'hash',
          message: `Duplicate of row ${existingRow}`,
          originalValue: row.hash,
          normalizedValue: `Duplicate: ${row.flowerName} (${row.length ?? row.grade})`,
        });
      } else {
        seenHashes.set(row.hash, row.rowIndex);
      }
    }

    return warnings;
  }
}

export const validatorService = new ValidatorService();
