/**
 * Checksum Service
 *
 * Обчислення SHA-256 хешу файлу для ідемпотентності імпорту
 */

import crypto from 'crypto';
import type { Core } from '@strapi/strapi';

export class ChecksumService {
  /**
   * Обчислити SHA-256 checksum з Buffer
   */
  compute(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Обчислити хеш рядка для унікальної ідентифікації
   * Використовується для дедуплікації рядків всередині файлу
   */
  computeRowHash(row: {
    flowerName: string;
    length: number | null;
    grade: string | null;
    stock: number;
    price: number;
    supplier: string | null;
    awb: string | null;
  }): string {
    const data = [
      row.flowerName.toLowerCase(),
      row.length ?? 'null',
      row.grade ?? 'null',
      row.stock,
      row.price,
      row.supplier ?? 'null',
      row.awb ?? 'null',
    ].join('|');

    return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
  }

  /**
   * Перевірити чи існує Supply з таким checksum
   */
  async exists(strapi: Core.Strapi, checksum: string): Promise<boolean> {
    const existing = await strapi.db.query('api::supply.supply').findOne({
      where: { checksum },
    });
    return existing !== null;
  }

  /**
   * Знайти Supply за checksum
   */
  async findByChecksum(
    strapi: Core.Strapi,
    checksum: string
  ): Promise<{ id: number; documentId: string; dateParsed: string } | null> {
    const existing = await strapi.db.query('api::supply.supply').findOne({
      where: { checksum },
      select: ['id', 'documentId', 'dateParsed'],
    });

    if (!existing) return null;

    return {
      id: existing.id,
      documentId: existing.documentId,
      dateParsed: existing.dateParsed,
    };
  }
}

export const checksumService = new ChecksumService();
