/**
 * Normalizer Service
 *
 * Нормалізація даних з Excel:
 * - Назви квітів: Title Case, об'єднання variety + type
 * - Slug: транслітерація + kebab-case
 * - Length: витягування числового значення в см
 * - Grade: збереження текстових grade (jumbo, premium)
 * - Price/Stock: числова нормалізація
 */

import slugify from 'slugify';
import { checksumService } from './checksum.service';
import type {
  ParsedRow,
  NormalizedRow,
  NormalizationResult,
  ImportWarning,
} from './types';

export class NormalizerService {
  /**
   * Текстові grade які не конвертуються в числа
   */
  private readonly textGrades = ['jumbo', 'premium', 'select', 'standard', 'mini', 'xl', 'xxl'];

  /**
   * Нормалізувати масив ParsedRow
   */
  normalize(rows: ParsedRow[]): NormalizationResult {
    const normalized: NormalizedRow[] = [];
    const warnings: ImportWarning[] = [];

    for (const row of rows) {
      const { normalized: normalizedRow, rowWarnings } = this.normalizeRow(row);
      normalized.push(normalizedRow);
      warnings.push(...rowWarnings);
    }

    return { normalized, warnings };
  }

  /**
   * Нормалізувати один рядок
   */
  private normalizeRow(row: ParsedRow): {
    normalized: NormalizedRow;
    rowWarnings: ImportWarning[];
  } {
    const rowWarnings: ImportWarning[] = [];

    // Нормалізувати ім'я квітки
    const { flowerName, nameWarning } = this.normalizeFlowerName(
      row.variety,
      row.type,
      row.rowIndex
    );
    if (nameWarning) rowWarnings.push(nameWarning);

    // Створити slug
    const slug = this.createSlug(flowerName);

    // Нормалізувати length/grade
    const { length, grade, lengthWarning } = this.normalizeGrade(
      row.grade,
      row.rowIndex
    );
    if (lengthWarning) rowWarnings.push(lengthWarning);

    // Нормалізувати stock
    const { stock, stockWarning } = this.normalizeStock(row.units, row.rowIndex);
    if (stockWarning) rowWarnings.push(stockWarning);

    // Нормалізувати price
    const { price, priceWarning } = this.normalizePrice(row.price, row.rowIndex);
    if (priceWarning) rowWarnings.push(priceWarning);

    const normalized: NormalizedRow = {
      rowIndex: row.rowIndex,
      original: row.original,
      flowerName,
      slug,
      length,
      grade,
      stock,
      price,
      supplier: row.supplier,
      awb: row.awb,
      hash: checksumService.computeRowHash({
        flowerName,
        length,
        grade,
        stock,
        price,
        supplier: row.supplier,
        awb: row.awb,
      }),
    };

    return { normalized, rowWarnings };
  }

  /**
   * Нормалізувати ім'я квітки
   * Об'єднує variety + type в Title Case
   */
  private normalizeFlowerName(
    variety: string,
    type: string | null,
    rowIndex: number
  ): { flowerName: string; nameWarning?: ImportWarning } {
    let warning: ImportWarning | undefined;

    // Очистити variety
    let cleanVariety = variety.trim();

    // Перевірити чи variety не порожній
    if (!cleanVariety) {
      return { flowerName: 'Unknown', nameWarning: undefined };
    }

    // Title Case для variety
    const titleVariety = this.toTitleCase(cleanVariety);

    // Якщо є type, додати його
    let flowerName = titleVariety;
    if (type && type.trim()) {
      const titleType = this.toTitleCase(type.trim());

      // Уникнути дублювання (якщо variety вже містить type)
      if (!titleVariety.toLowerCase().includes(type.toLowerCase())) {
        flowerName = `${titleVariety} ${titleType}`;
      }
    }

    // Попередження якщо ім'я було змінено
    const originalName = type ? `${variety} ${type}` : variety;
    if (originalName !== flowerName) {
      warning = {
        row: rowIndex,
        field: 'name',
        message: 'Name normalized to Title Case',
        originalValue: originalName,
        normalizedValue: flowerName,
      };
    }

    return { flowerName, nameWarning: warning };
  }

  /**
   * Конвертувати в Title Case
   */
  private toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(/\s+/)
      .map((word) => {
        if (word.length === 0) return word;
        // Зберегти скорочення великими (QB, FB, HB)
        if (word.length <= 2 && /^[a-z]+$/i.test(word)) {
          return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  /**
   * Створити slug з назви
   */
  private createSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      locale: 'uk',
    });
  }

  /**
   * Нормалізувати grade/length
   * "90cm" -> length: 90, grade: null
   * "jumbo" -> length: null, grade: "jumbo"
   * "90" -> length: 90, grade: null
   */
  private normalizeGrade(
    gradeStr: string,
    rowIndex: number
  ): { length: number | null; grade: string | null; lengthWarning?: ImportWarning } {
    const cleaned = gradeStr.toLowerCase().trim();

    // Перевірити чи це текстовий grade
    const isTextGrade = this.textGrades.some((g) => cleaned.includes(g));

    if (isTextGrade) {
      // Текстовий grade - зберегти як є
      return {
        length: null,
        grade: this.toTitleCase(cleaned),
        lengthWarning: undefined,
      };
    }

    // Спробувати витягнути число
    const numberMatch = cleaned.match(/(\d+)/);

    if (numberMatch) {
      const length = parseInt(numberMatch[1], 10);

      // Валідація діапазону (1-500 см)
      if (length < 1 || length > 500) {
        return {
          length: null,
          grade: cleaned,
          lengthWarning: {
            row: rowIndex,
            field: 'length',
            message: `Length ${length} out of range (1-500), treating as grade`,
            originalValue: gradeStr,
            normalizedValue: cleaned,
          },
        };
      }

      return { length, grade: null, lengthWarning: undefined };
    }

    // Не вдалося розпарсити - зберегти як grade
    return {
      length: null,
      grade: cleaned || null,
      lengthWarning: cleaned
        ? {
            row: rowIndex,
            field: 'length',
            message: 'Could not parse as number, treating as grade',
            originalValue: gradeStr,
            normalizedValue: cleaned,
          }
        : undefined,
    };
  }

  /**
   * Нормалізувати stock
   */
  private normalizeStock(
    units: number,
    rowIndex: number
  ): { stock: number; stockWarning?: ImportWarning } {
    const stock = Math.round(Math.abs(units));

    if (stock !== units) {
      return {
        stock,
        stockWarning: {
          row: rowIndex,
          field: 'stock',
          message: 'Stock rounded to integer',
          originalValue: units,
          normalizedValue: stock,
        },
      };
    }

    return { stock, stockWarning: undefined };
  }

  /**
   * Нормалізувати price
   */
  private normalizePrice(
    price: number,
    rowIndex: number
  ): { price: number; priceWarning?: ImportWarning } {
    const normalized = Math.round(Math.abs(price) * 100) / 100;

    if (normalized !== price) {
      return {
        price: normalized,
        priceWarning: {
          row: rowIndex,
          field: 'price',
          message: 'Price normalized',
          originalValue: price,
          normalizedValue: normalized,
        },
      };
    }

    return { price: normalized, priceWarning: undefined };
  }
}

export const normalizerService = new NormalizerService();
