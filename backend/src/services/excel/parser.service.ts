/**
 * Excel Parser Service
 *
 * Парсинг Excel файлів з автодетектом формату
 * Підтримує формати:
 * - Colombia/Makavchuk: variety, type, grade, units, supplier, recipient, price, total, awb
 * - Ross: CULTIVOS, FB, VARIEDAD, GRADO, TALLOS, PRECIO, TOTAL PR
 */

import * as XLSX from 'xlsx';
import type {
  ExcelFormat,
  ColumnMapping,
  FormatDetectionResult,
  ParsedRow,
} from './types';

export class ParserService {
  /**
   * Ключові слова для детекції колонок (case-insensitive)
   */
  private readonly columnKeywords = {
    variety: ['variety', 'variedad', 'сорт', 'назва', 'name', 'flower'],
    type: ['type', 'тип', 'вид'],
    grade: ['grade', 'grado', 'length', 'height', 'довжина', 'розмір', 'size', 'cm', 'см'],
    units: ['units', 'qty', 'quantity', 'tallos', 'stems', 'кількість', 'шт', 'stock'],
    price: ['price', 'precio', 'ціна', 'цена', 'cost', 'uah', 'usd', 'eur'],
    total: ['total', 'suma', 'сума', 'сумма', 'amount'],
    supplier: ['supplier', 'farm', 'cultivos', 'постачальник', 'ферма'],  // FB видалено - це Full Box, не supplier
    awb: ['awb', 'waybill', 'накладна'],
    recipient: ['recipient', 'client', 'отримувач', 'клієнт'],
  };

  /**
   * Парсити Excel файл
   */
  parse(buffer: Buffer): { rows: ParsedRow[]; detection: FormatDetectionResult } {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Конвертувати в JSON з header опцією
    const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false,
    });

    if (rawData.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Детектувати формат
    const detection = this.detectFormat(rawData);

    // Парсити рядки
    const rows = this.extractRows(rawData, detection);

    return { rows, detection };
  }

  /**
   * Автодетект формату файлу
   */
  private detectFormat(data: unknown[][]): FormatDetectionResult {
    // Спробувати формат Ross (має заголовки CULTIVOS, VARIEDAD, GRADO тощо)
    const rossResult = this.tryDetectRossFormat(data);
    if (rossResult) return rossResult;

    // Спробувати формат Colombia (має колонки variety, type, grade, units, supplier, price, awb)
    const colombiaResult = this.tryDetectColombiaFormat(data);
    if (colombiaResult) return colombiaResult;

    // Якщо формат не визначено, спробувати універсальний підхід
    return this.detectGenericFormat(data);
  }

  /**
   * Детектувати формат Ross (іспанські заголовки)
   */
  private tryDetectRossFormat(data: unknown[][]): FormatDetectionResult | null {
    // Шукати рядок з заголовками CULTIVOS, VARIEDAD, GRADO, TALLOS, PRECIO
    for (let rowIdx = 0; rowIdx < Math.min(10, data.length); rowIdx++) {
      const row = data[rowIdx];
      if (!row) continue;

      const rowStr = row.map((c) => String(c ?? '').toLowerCase()).join('|');

      if (
        rowStr.includes('cultivos') &&
        rowStr.includes('variedad') &&
        rowStr.includes('grado') &&
        rowStr.includes('tallos')
      ) {
        // Знайшли заголовки Ross формату
        const mapping = this.mapColumnsFromHeader(row as string[]);

        // Витягнути метадані з перших рядків
        const metadata = this.extractRossMetadata(data, rowIdx);

        return {
          format: 'ross',
          mapping,
          headerRow: rowIdx,
          dataStartRow: rowIdx + 1,
          metadata,
        };
      }
    }

    return null;
  }

  /**
   * Детектувати формат Colombia (позиційний без заголовків)
   */
  private tryDetectColombiaFormat(data: unknown[][]): FormatDetectionResult | null {
    // Формат Colombia не має явних заголовків
    // Перший рядок містить метадані: номер документа, дату, "цена", "сумма", "AWB"
    const firstRow = data[0];
    if (!firstRow) return null;

    const firstRowStr = firstRow.map((c) => String(c ?? '').toLowerCase()).join('|');

    // Перевірити чи є "цена" та "сумма" або "awb" в першому рядку
    if (
      (firstRowStr.includes('цена') || firstRowStr.includes('price')) &&
      (firstRowStr.includes('сумма') || firstRowStr.includes('total') || firstRowStr.includes('awb'))
    ) {
      // Colombia формат - фіксоване позиціювання колонок
      const mapping: ColumnMapping = {
        qbCode: 0,
        variety: 1,
        type: 2,
        grade: 3,
        units: 4,
        supplier: 5,
        recipient: 6,
        price: 7,
        total: 8,
        awb: 9,
      };

      // Витягнути метадані
      const metadata = this.extractColombiaMetadata(firstRow);

      return {
        format: 'colombia',
        mapping,
        headerRow: 0,
        dataStartRow: 1,
        metadata,
      };
    }

    return null;
  }

  /**
   * Універсальний детектор формату
   */
  private detectGenericFormat(data: unknown[][]): FormatDetectionResult {
    // Шукати рядок який виглядає як заголовок
    for (let rowIdx = 0; rowIdx < Math.min(10, data.length); rowIdx++) {
      const row = data[rowIdx];
      if (!row || row.length < 3) continue;

      const mapping = this.mapColumnsFromHeader(row as string[]);

      // Перевірити чи є обов'язкові колонки
      if (mapping.variety !== -1 && mapping.units !== -1 && mapping.price !== -1) {
        return {
          format: 'unknown',
          mapping,
          headerRow: rowIdx,
          dataStartRow: rowIdx + 1,
          metadata: {},
        };
      }
    }

    // Fallback: позиційне мапування
    return {
      format: 'unknown',
      mapping: {
        variety: 0,
        grade: 1,
        units: 2,
        price: 3,
      },
      headerRow: -1,
      dataStartRow: 0,
      metadata: {},
    };
  }

  /**
   * Мапування колонок за заголовками
   */
  private mapColumnsFromHeader(headerRow: string[]): ColumnMapping {
    const mapping: ColumnMapping = {
      variety: -1,
      grade: -1,
      units: -1,
      price: -1,
    };

    for (let colIdx = 0; colIdx < headerRow.length; colIdx++) {
      const cell = String(headerRow[colIdx] ?? '').toLowerCase().trim();

      for (const [field, keywords] of Object.entries(this.columnKeywords)) {
        if (keywords.some((kw) => cell.includes(kw))) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mapping as any)[field] = colIdx;
          break;
        }
      }
    }

    return mapping;
  }

  /**
   * Витягнути метадані з формату Ross
   */
  private extractRossMetadata(
    data: unknown[][],
    headerRowIdx: number
  ): FormatDetectionResult['metadata'] {
    const metadata: FormatDetectionResult['metadata'] = {};

    // Перший рядок може містити дату
    for (let rowIdx = 0; rowIdx < headerRowIdx; rowIdx++) {
      const row = data[rowIdx];
      if (!row) continue;

      for (const cell of row) {
        if (cell instanceof Date) {
          metadata.date = cell;
        } else if (typeof cell === 'string') {
          // Спробувати розпарсити дату у форматі DD,MM,YYYY
          const dateMatch = cell.match(/(\d{1,2})[,./](\d{1,2})[,./](\d{4})/);
          if (dateMatch) {
            const [, day, month, year] = dateMatch;
            metadata.date = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day)
            );
          }
        }
      }
    }

    // Шукати Transport та FB total у підсумкових рядках (після даних)
    for (let rowIdx = headerRowIdx + 1; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      if (!row) continue;

      const firstCell = String(row[0] ?? '').toLowerCase().trim();

      // Шукати "Transport" в будь-якій колонці рядка
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const cellValue = String(row[colIdx] ?? '').toLowerCase().trim();
        if (cellValue === 'transport' || cellValue.includes('transport')) {
          // Transport значення - шукаємо число праворуч від "Transport" або в кінці рядка
          for (let i = colIdx + 1; i < row.length; i++) {
            const val = row[i];
            if (typeof val === 'number' && val > 0) {
              metadata.transport = val;
              break;
            }
          }
          // Якщо не знайшли праворуч, шукаємо з кінця
          if (!metadata.transport) {
            for (let i = row.length - 1; i >= 0; i--) {
              const val = row[i];
              if (typeof val === 'number' && val > 0) {
                metadata.transport = val;
                break;
              }
            }
          }
          break;
        }
      }

      // Рахувати FB total - шукати рядок де є "total" або підсумковий рядок
      // FB total знаходиться в колонці FB (індекс 1 зазвичай) для підсумкового рядка
      if (firstCell.includes('total') || firstCell === '' || firstCell === 'rosa' || firstCell === 'rosas') {
        // Перевірити чи є значення FB в колонці 1
        const fbValue = row[1];
        if (typeof fbValue === 'number' && fbValue > 0 && fbValue < 100) {
          metadata.totalFB = fbValue;
          metadata.totalBoxes = Math.round(fbValue * 2); // 0.5 FB = 1 коробка
        }
      }
    }

    return metadata;
  }

  /**
   * Витягнути метадані з формату Colombia
   */
  private extractColombiaMetadata(
    firstRow: unknown[]
  ): FormatDetectionResult['metadata'] {
    const metadata: FormatDetectionResult['metadata'] = {};

    for (const cell of firstRow) {
      if (cell instanceof Date) {
        metadata.date = cell;
      } else if (typeof cell === 'number' && cell > 1000 && cell < 10000) {
        // Номер документа (наприклад 1550)
        metadata.documentId = String(cell);
      } else if (typeof cell === 'string') {
        // AWB номер (формат: 071-5898 5975)
        const awbMatch = cell.match(/\d{3}-\d{4}\s?\d{4}/);
        if (awbMatch) {
          metadata.awb = awbMatch[0];
        }

        // Дата у форматі DD.MM.YYYY
        const dateMatch = cell.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          metadata.date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );
        }
      }
    }

    return metadata;
  }

  /**
   * Витягнути рядки даних
   */
  private extractRows(
    data: unknown[][],
    detection: FormatDetectionResult
  ): ParsedRow[] {
    const rows: ParsedRow[] = [];
    const { mapping, dataStartRow, format } = detection;

    let currentSupplier: string | null = null;
    // Для Ross формату: трекінг поточної коробки
    let currentBoxId: string | null = null;
    let currentBoxFB: number | undefined = undefined;

    for (let rowIdx = dataStartRow; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      if (!row || row.length < 3) continue;

      // Пропустити підсумкові рядки
      if (this.isSummaryRow(row, format)) continue;

      // Пропустити порожні рядки
      const varietyValue = row[mapping.variety];
      if (!varietyValue || String(varietyValue).trim() === '') {
        // Для Colombia формату: порожній variety з даними в інших колонках = продовження попередньої ферми
        if (format === 'colombia' && row[mapping.units] && row[mapping.price]) {
          // Використовувати попередній supplier
        } else {
          continue;
        }
      }

      // Оновити поточного постачальника для Ross формату
      if (format === 'ross' && mapping.supplier !== undefined && mapping.supplier >= 0) {
        const supplierValue = row[mapping.supplier];
        if (supplierValue && String(supplierValue).trim() !== '') {
          currentSupplier = String(supplierValue).trim();
          // CULTIVOS - це ідентифікатор коробки
          currentBoxId = currentSupplier;
          // FB значення коробки знаходиться в колонці 1 (FB колонка)
          // Для Ross формату: колонка supplier (CULTIVOS) = 0, FB = 1
          const fbValue = row[1];
          if (typeof fbValue === 'number' && fbValue > 0 && fbValue <= 1) {
            currentBoxFB = fbValue;
          }
        }
      }

      // Для Colombia формату взяти supplier з колонки
      if (format === 'colombia' && mapping.supplier !== undefined && mapping.supplier >= 0) {
        const supplierValue = row[mapping.supplier];
        if (supplierValue && String(supplierValue).trim() !== '') {
          currentSupplier = String(supplierValue).trim();
        }
      }

      // Оригінальні дані рядка з додаванням boxId/boxFB для розрахунку собівартості
      const originalData = this.rowToObject(row, mapping);
      if (format === 'ross' && currentBoxId) {
        originalData.boxId = currentBoxId;
        originalData.boxFB = currentBoxFB;
      }

      const parsed: ParsedRow = {
        rowIndex: rowIdx + 1, // 1-based для користувача
        original: originalData,
        variety: String(varietyValue ?? '').trim(),
        type: mapping.type !== undefined && mapping.type >= 0
          ? String(row[mapping.type] ?? '').trim() || null
          : null,
        grade: String(row[mapping.grade] ?? '').trim(),
        units: this.parseNumber(row[mapping.units]),
        price: this.parseDecimal(row[mapping.price]),
        total: mapping.total !== undefined && mapping.total >= 0
          ? this.parseDecimal(row[mapping.total])
          : null,
        supplier: currentSupplier,
        awb: mapping.awb !== undefined && mapping.awb >= 0
          ? String(row[mapping.awb] ?? '').trim() || null
          : detection.metadata.awb ?? null,
        qbCode: mapping.qbCode !== undefined && mapping.qbCode >= 0
          ? String(row[mapping.qbCode] ?? '').trim() || null
          : null,
        recipient: mapping.recipient !== undefined && mapping.recipient >= 0
          ? String(row[mapping.recipient] ?? '').trim() || null
          : null,
        // Дані для розрахунку собівартості (Ross формат)
        boxId: format === 'ross' ? currentBoxId ?? undefined : undefined,
        boxFB: format === 'ross' ? currentBoxFB : undefined,
      };

      // Валідація: пропустити рядки без кількості або ціни
      if (parsed.units <= 0 || parsed.price <= 0) continue;

      rows.push(parsed);
    }

    return rows;
  }

  /**
   * Перевірити чи рядок є підсумковим
   */
  private isSummaryRow(row: unknown[], format: ExcelFormat): boolean {
    const firstCell = String(row[0] ?? '').toLowerCase().trim();
    const secondCell = String(row[1] ?? '').toLowerCase().trim();

    // Colombia format summary indicators
    // НЕ фільтруємо HB/QB/FB самі по собі - це коди типів боксів
    // Фільтруємо тільки якщо це summary рядок (наприклад "HB Total" або рядок де тільки total)
    if (format === 'colombia') {
      if (firstCell === 'total') return true;
      if (secondCell === 'total') return true;
      // HB/QB/FB + total в іншій колонці = summary рядок
      if (['hb', 'qb', 'fb'].includes(firstCell) && row.some((cell, idx) =>
        idx > 0 && String(cell ?? '').toLowerCase().trim() === 'total'
      )) return true;
    }

    // Ross format summary indicators
    if (format === 'ross') {
      if (firstCell.includes('total') || secondCell.includes('total')) return true;
    }

    return false;
  }

  /**
   * Конвертувати рядок в об'єкт для зберігання оригіналу
   */
  private rowToObject(row: unknown[], mapping: ColumnMapping): Record<string, unknown> {
    const obj: Record<string, unknown> = {};

    if (mapping.variety >= 0) obj.variety = row[mapping.variety];
    if (mapping.type !== undefined && mapping.type >= 0) obj.type = row[mapping.type];
    if (mapping.grade >= 0) obj.grade = row[mapping.grade];
    if (mapping.units >= 0) obj.units = row[mapping.units];
    if (mapping.price >= 0) obj.price = row[mapping.price];
    if (mapping.total !== undefined && mapping.total >= 0) obj.total = row[mapping.total];
    if (mapping.supplier !== undefined && mapping.supplier >= 0) obj.supplier = row[mapping.supplier];
    if (mapping.awb !== undefined && mapping.awb >= 0) obj.awb = row[mapping.awb];
    if (mapping.qbCode !== undefined && mapping.qbCode >= 0) obj.qbCode = row[mapping.qbCode];
    if (mapping.recipient !== undefined && mapping.recipient >= 0) obj.recipient = row[mapping.recipient];

    return obj;
  }

  /**
   * Парсити число (integer)
   */
  private parseNumber(value: unknown): number {
    if (typeof value === 'number') return Math.round(value);
    if (typeof value !== 'string') return 0;

    // Видалити нечислові символи крім крапки та коми
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? 0 : Math.round(parsed);
  }

  /**
   * Парсити десяткове число
   */
  private parseDecimal(value: unknown): number {
    if (typeof value === 'number') return Math.round(value * 100) / 100;
    if (typeof value !== 'string') return 0;

    // Видалити нечислові символи крім крапки та коми
    let cleaned = value.replace(/[^\d.,]/g, '');

    // Визначити десятковий роздільник
    // Якщо є і крапка, і кома - остання є десятковим роздільником
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');

    if (lastComma > lastDot) {
      // Кома є десятковим роздільником (європейський формат)
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > lastComma) {
      // Крапка є десятковим роздільником
      cleaned = cleaned.replace(/,/g, '');
    } else if (lastComma >= 0) {
      // Тільки кома
      cleaned = cleaned.replace(',', '.');
    }

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }
}

export const parserService = new ParserService();
