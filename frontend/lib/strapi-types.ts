/**
 * Strapi Types Re-export
 *
 * Backward compatibility: реекспорт з нової структури types/
 * Всі нові імпорти мають використовувати @/lib/types
 */

export type {
  StrapiImage,
  ImageFormat,
  StrapiBlock,
  StrapiFlower,
  StrapiVariant,
  StrapiResponse,
  StrapiListResponse,
} from './types/strapi';
