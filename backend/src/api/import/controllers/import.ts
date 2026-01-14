/**
 * Import Controller
 *
 * Контролер для обробки завантаження Excel файлів
 */

import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import fs from 'fs/promises';

// Оверрайди для редагування нормалізації
interface RowOverride {
  flowerName?: string;
  length?: number;
}

interface ImportRequestBody {
  dryRun?: string | boolean;
  stockMode?: 'replace' | 'add' | 'skip';
  priceMode?: 'replace' | 'lower' | 'skip';
  awb?: string;
  supplier?: string;
  forceImport?: string | boolean; // Дозволити імпорт навіть якщо файл вже був імпортований
  applyPriceCalculation?: string | boolean;
  exchangeRate?: string | number;
  marginMultiplier?: string | number;
  rowOverrides?: string; // JSON string: Record<hash, RowOverride>
  costCalculationMode?: 'simple' | 'full';
  fullCostParams?: string; // JSON string: { truckCostPerBox, transferFeePercent, taxPerStem }
}

interface FullCostParams {
  truckCostPerBox: number;
  transferFeePercent: number;
  taxPerStem: number;
}

interface ImportServiceOptions {
  dryRun: boolean;
  stockMode: 'replace' | 'add' | 'skip';
  priceMode: 'replace' | 'lower' | 'skip';
  awb?: string;
  supplier?: string;
  userId?: number;
  forceImport?: boolean;
  applyPriceCalculation?: boolean;
  exchangeRate?: number;
  marginMultiplier?: number;
  rowOverrides?: Record<string, RowOverride>;
  costCalculationMode?: 'simple' | 'full';
  fullCostParams?: FullCostParams;
}

/**
 * Перевірити чи файл є валідним Excel файлом через magic bytes
 * @param buffer Buffer файлу
 * @param ext Розширення файлу (опціонально)
 * @returns true якщо файл є валідним Excel файлом
 */
function validateExcelFormat(buffer: Buffer, ext?: string): boolean {
  if (buffer.length < 8) {
    return false;
  }

  // Magic bytes для .xlsx (ZIP архів, починається з PK)
  // .xlsx файли - це ZIP архіви, які починаються з "PK" (50 4B)
  const isXlsx = buffer[0] === 0x50 && buffer[1] === 0x4B; // "PK"

  // Magic bytes для .xls (OLE2 формат)
  // .xls файли починаються з D0 CF 11 E0 A1 B1 1A E1
  const isXls = buffer[0] === 0xD0 && 
                buffer[1] === 0xCF && 
                buffer[2] === 0x11 && 
                buffer[3] === 0xE0 &&
                buffer[4] === 0xA1 && 
                buffer[5] === 0xB1 && 
                buffer[6] === 0x1A && 
                buffer[7] === 0xE1;

  // Якщо magic bytes вказують на Excel формат, дозволити
  if (isXlsx || isXls) {
    return true;
  }

  // Якщо розширення вказано і воно правильне, але magic bytes не співпадають,
  // все одно дозволити (можливо файл пошкоджений або має особливий формат)
  if (ext && ['xlsx', 'xls'].includes(ext)) {
    return true;
  }

  return false;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * POST /api/imports/excel
   * Імпорт Excel файлу з накладною
   */
  async excel(ctx: Context) {
    try {
      // Логування для діагностики
      strapi.log.info('Import request received', {
        hasFiles: !!ctx.request.files,
        filesKeys: ctx.request.files ? Object.keys(ctx.request.files) : [],
        bodyKeys: ctx.request.body ? Object.keys(ctx.request.body) : [],
        contentType: ctx.request.headers['content-type'],
      });

      // Отримати файл з запиту - спробуємо різні місця
      let files = ctx.request.files as unknown as Record<string, { path: string; name: string; size?: number } | { path: string; name: string; size?: number }[]> | undefined;
      
      // Якщо файли не в ctx.request.files, спробуємо в body
      if (!files && ctx.request.body && (ctx.request.body as any).files) {
        files = (ctx.request.body as any).files;
      }

      if (!files || !files.file) {
        strapi.log.warn('No file found in request', {
          files: files ? Object.keys(files) : 'no files object',
          body: ctx.request.body ? Object.keys(ctx.request.body) : 'no body',
        });
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'MISSING_FILE',
            message: 'File is required. Please upload an Excel file (.xlsx or .xls)',
          },
        };
        return;
      }

      // Підтримка одного файлу
      const file = Array.isArray(files.file) ? files.file[0] : files.file;

      if (!file) {
        strapi.log.warn('File object is null or undefined');
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'INVALID_FILE',
            message: 'Invalid file upload',
          },
        };
        return;
      }

      // Детальне логування структури файлу
      strapi.log.info('File object structure', {
        fileKeys: Object.keys(file),
        fileType: typeof file,
        fileValue: JSON.stringify(file, null, 2),
        hasPath: !!(file as any).path,
        hasBuffer: !!(file as any).buffer,
        hasStream: !!(file as any).stream,
        hasFilepath: !!(file as any).filepath,
        hasFilePath: !!(file as any).filePath,
      });

      // Перевірити наявність path або buffer або інші можливі поля
      const filePath = (file as any).path || (file as any).filepath || (file as any).filePath;
      const fileBuffer = (file as any).buffer;
      const fileStream = (file as any).stream;

      if (!filePath && !fileBuffer && !fileStream) {
        strapi.log.warn('File has no path, buffer, or stream', {
          fileKeys: Object.keys(file),
          fileType: typeof file,
          fileValue: file,
        });
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'INVALID_FILE',
            message: 'Invalid file upload - file path, buffer, or stream is missing',
          },
        };
        return;
      }

      // Отримати параметри з body
      const body = ctx.request.body as ImportRequestBody;

      // Парсимо rowOverrides з JSON
      let parsedRowOverrides: Record<string, RowOverride> | undefined;
      if (body.rowOverrides) {
        try {
          parsedRowOverrides = JSON.parse(body.rowOverrides);
          strapi.log.info('Parsed rowOverrides:', { count: Object.keys(parsedRowOverrides || {}).length });
        } catch (e) {
          strapi.log.warn('Failed to parse rowOverrides:', e);
        }
      }

      // Парсимо fullCostParams з JSON
      let parsedFullCostParams: FullCostParams | undefined;
      if (body.fullCostParams) {
        try {
          parsedFullCostParams = JSON.parse(body.fullCostParams);
          strapi.log.info('Parsed fullCostParams:', parsedFullCostParams);
        } catch (e) {
          strapi.log.warn('Failed to parse fullCostParams:', e);
        }
      }

      const options: ImportServiceOptions = {
        dryRun: body.dryRun === 'true' || body.dryRun === true,
        stockMode: body.stockMode || 'replace',
        priceMode: body.priceMode || 'replace',
        awb: body.awb,
        supplier: body.supplier,
        userId: ctx.state.user?.id,
        forceImport: body.forceImport === 'true' || body.forceImport === true,
        applyPriceCalculation: body.applyPriceCalculation === 'true' || body.applyPriceCalculation === true,
        exchangeRate: body.exchangeRate ? parseFloat(String(body.exchangeRate)) : undefined,
        marginMultiplier: body.marginMultiplier ? parseFloat(String(body.marginMultiplier)) : undefined,
        rowOverrides: parsedRowOverrides,
        costCalculationMode: body.costCalculationMode || 'simple',
        fullCostParams: parsedFullCostParams,
      };

      strapi.log.info('Import options:', {
        applyPriceCalculation: options.applyPriceCalculation,
        exchangeRate: options.exchangeRate,
        marginMultiplier: options.marginMultiplier,
        priceMode: options.priceMode,
        costCalculationMode: options.costCalculationMode,
        fullCostParams: options.fullCostParams,
      });

      // Читати файл - спробуємо різні способи
      let buffer: Buffer;
      
      if (fileBuffer) {
        // Якщо є buffer, використовуємо його
        buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
        strapi.log.info('Using file buffer');
      } else if (filePath) {
        // Якщо є path, читаємо з файлової системи
        buffer = await fs.readFile(filePath);
        strapi.log.info('Read file from path:', filePath);
      } else if (fileStream) {
        // Якщо є stream, читаємо з нього
        const chunks: Buffer[] = [];
        for await (const chunk of fileStream) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        buffer = Buffer.concat(chunks);
        strapi.log.info('Read file from stream');
      } else {
        // Спробуємо прочитати з будь-якого іншого поля, яке може містити дані
        strapi.log.warn('Trying alternative file reading methods', {
          allFileKeys: Object.keys(file),
        });
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'INVALID_FILE',
            message: 'Invalid file upload - cannot read file from any available source',
          },
        };
        return;
      }

      // Перевірити формат файлу через magic bytes та розширення
      // Спробуємо отримати оригінальне ім'я файлу з різних полів
      const fileName = (file as any).name || 
                       (file as any).originalFilename || 
                       (file as any).originalname ||
                       (filePath ? filePath.split(/[/\\]/).pop() || '' : '') || 
                       'unknown';
      
      // Витягнути розширення з імені файлу
      let ext: string | undefined;
      if (fileName && fileName !== 'unknown') {
        const parts = fileName.split('.');
        if (parts.length > 1) {
          ext = parts.pop()?.toLowerCase();
        }
      }

      // Перевірити magic bytes для визначення реального формату
      const isValidExcel = validateExcelFormat(buffer, ext);

      if (!isValidExcel) {
        strapi.log.warn('Invalid file format detected', {
          fileName,
          filePath,
          extractedExt: ext,
          fileSize: buffer.length,
          firstBytes: buffer.slice(0, 8).toString('hex'),
          fileKeys: Object.keys(file),
        });
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: `Invalid file format. Please use .xlsx or .xls files. Detected extension: ${ext || 'none'}, filename: ${fileName || 'unknown'}`,
          },
        };
        return;
      }

      // Виклик сервісу імпорту
      const importService = strapi.service('api::import.import') as {
        processExcel: (buffer: Buffer, filename: string, options: any) => Promise<unknown>;
      };

      // Переконатися, що всі опції передаються
      strapi.log.info('Passing options to service:', {
        applyPriceCalculation: options.applyPriceCalculation,
        exchangeRate: options.exchangeRate,
        marginMultiplier: options.marginMultiplier,
        priceMode: options.priceMode,
      });

      const result = await importService.processExcel(buffer, fileName, options);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string; existingSupplyId?: number };

      // Обробка дублікату checksum
      if (err.code === 'DUPLICATE_CHECKSUM') {
        ctx.status = 409;
        ctx.body = {
          success: false,
          error: {
            code: 'DUPLICATE_CHECKSUM',
            message: err.message,
            existingSupplyId: err.existingSupplyId,
          },
        };
        return;
      }

      // Обробка помилок валідації
      if (err.code === 'VALIDATION_FAILED') {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: err.message,
          },
        };
        return;
      }

      // Логування та загальна помилка
      strapi.log.error('Import error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while processing the import',
        },
      };
    }
  },

  /**
   * POST /api/imports/update-prices
   * Batch update цін продажу для варіантів
   */
  async updatePrices(ctx: Context) {
    try {
      const body = ctx.request.body as { prices?: Array<{ documentId: string; price: number }> };
      const prices = body.prices;

      if (!prices || !Array.isArray(prices) || prices.length === 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Prices array is required',
          },
        };
        return;
      }

      let updated = 0;

      for (const item of prices) {
        if (!item.documentId || typeof item.price !== 'number' || item.price < 0) {
          continue;
        }

        try {
          await strapi.db.query('api::variant.variant').update({
            where: { documentId: item.documentId },
            data: { price: item.price },
          });
          updated++;
        } catch (err) {
          strapi.log.warn(`Failed to update price for variant ${item.documentId}:`, err);
        }
      }

      strapi.log.info(`Updated ${updated} variant prices`);

      ctx.status = 200;
      ctx.body = {
        success: true,
        updated,
      };
    } catch (error) {
      strapi.log.error('Update prices error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating prices',
        },
      };
    }
  },

  /**
   * GET /api/imports/:id
   * Отримати деталі імпорту
   */
  async findOne(ctx: Context) {
    const { id } = ctx.params;

    try {
      const supply = await strapi.db.query('api::supply.supply').findOne({
        where: { id: parseInt(id, 10) },
      });

      if (!supply) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Import not found',
          },
        };
        return;
      }

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: supply,
      };
    } catch (error) {
      strapi.log.error('Find import error:', error);

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching the import',
        },
      };
    }
  },
});
