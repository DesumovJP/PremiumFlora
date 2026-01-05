/**
 * Data Converters
 *
 * Функції конвертації даних між GraphQL/Strapi та внутрішніми типами
 */

import { STRAPI_URL } from './client';
import type {
  GraphQLFlower,
  GraphQLImage,
  GraphQLCustomer,
  GraphQLTransaction,
  GraphQLArticle,
  GraphQLBlock,
} from '../graphql/types';
import type { Product, Variant } from '../types';
import type { Customer, Transaction } from '../api-types';
import type { BlogPost } from '../types';

/**
 * Конвертує GraphQL зображення в URL
 */
export function extractImageUrl(image: GraphQLImage | null): string {
  if (!image?.url) return '';

  return image.url.startsWith('http')
    ? image.url
    : `${STRAPI_URL}${image.url.startsWith('/') ? image.url : `/${image.url}`}`;
}

/**
 * Конвертує blocks в текст
 */
export function blocksToText(blocks: unknown[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks
    .map((block: unknown) => {
      const b = block as { type?: string; children?: Array<{ text?: string }> };
      if (b.type === 'paragraph' && b.children) {
        return b.children.map((child) => child.text || '').join('');
      }
      return '';
    })
    .join('\n');
}

/**
 * Конвертує blocks в HTML
 */
export function blocksToHtml(blocks: GraphQLBlock[] | null): string {
  if (!blocks || !Array.isArray(blocks)) return '';

  return blocks
    .map((block) => {
      if (block.type === 'paragraph' && block.children) {
        const text = block.children.map((child) => child.text || '').join('');
        return `<p>${text}</p>`;
      }
      if (block.type === 'heading' && block.children) {
        const level = (block as unknown as { level?: number }).level || 2;
        const text = block.children.map((child) => child.text || '').join('');
        return `<h${level}>${text}</h${level}>`;
      }
      if (block.type === 'list') {
        const listBlock = block as unknown as { children?: Array<{ children?: Array<{ children?: Array<{ text?: string }> }> }> };
        if (listBlock.children) {
          const items = listBlock.children
            .map((item) => {
              const text = item.children
                ?.map((c) => c.children?.map((t) => t.text || '').join('') || '')
                .join('') || '';
              return `<li>${text}</li>`;
            })
            .join('');
          return `<ul>${items}</ul>`;
        }
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Конвертує GraphQL квітку в Product
 */
export function convertFlowerToProduct(flower: GraphQLFlower): Product {
  const imageUrl = extractImageUrl(flower.image);

  if (!imageUrl && flower.name && process.env.NODE_ENV === 'development') {
    console.warn(`No image for flower: ${flower.name}`);
  }

  if (!flower.slug) {
    console.warn(`Flower missing slug:`, {
      name: flower.name,
      documentId: flower.documentId,
    });
  }

  const variants: Variant[] = (flower.variants || [])
    .filter((v) => v != null)
    .map((v) => ({
      documentId: v.documentId,
      size: `${v.length} см`,
      price: v.price ?? 0,
      stock: v.stock ?? 0,
      length: v.length ?? 0,
    }));

  if (variants.length === 0 && flower.name) {
    console.warn(`Flower has no variants:`, {
      name: flower.name,
      slug: flower.slug,
      documentId: flower.documentId,
    });
  }

  return {
    id: flower.slug,
    documentId: flower.documentId,
    slug: flower.slug,
    name: flower.name,
    description: flower.description || undefined,
    image: imageUrl,
    variants,
    updatedAt: flower.updatedAt,
  };
}

/**
 * Конвертує GraphQL клієнта в Customer
 */
export function convertCustomer(c: GraphQLCustomer): Customer {
  return {
    id: 0,
    documentId: c.documentId,
    name: c.name,
    type: c.type || 'Regular',
    phone: c.phone || undefined,
    email: c.email || undefined,
    address: c.address || undefined,
    totalSpent: Number(c.totalSpent) || 0,
    orderCount: c.orderCount || 0,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

/**
 * Конвертує GraphQL транзакцію в Transaction
 */
export function convertTransaction(t: GraphQLTransaction): Transaction {
  return {
    id: 0,
    documentId: t.documentId,
    date: t.date,
    type: t.type,
    operationId: t.operationId,
    paymentStatus: t.paymentStatus,
    amount: t.amount,
    items: t.items || [],
    customer: t.customer
      ? {
          id: 0,
          documentId: t.customer.documentId,
          name: t.customer.name,
          type: t.customer.type || 'Regular',
          totalSpent: 0,
          orderCount: 0,
          createdAt: '',
          updatedAt: '',
        }
      : undefined,
    paymentDate: t.paymentDate || undefined,
    notes: t.notes || undefined,
    writeOffReason: t.writeOffReason || undefined,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

/**
 * Конвертує категорію в людську назву
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    blog: 'Блог',
    care: 'Догляд',
    guide: 'Гайд',
    info: 'Інформація',
    note: 'Нотатка',
    procedure: 'Процедура',
  };
  return labels[category] || category;
}

/**
 * Конвертує GraphQL статтю в BlogPost
 */
export function convertArticleToBlogPost(article: GraphQLArticle): BlogPost {
  const imageUrl = article.image ? extractImageUrl(article.image) : '';

  return {
    id: article.documentId,
    title: article.title,
    excerpt: article.excerpt || blocksToText(article.content as unknown[]).slice(0, 200) + '...',
    content: blocksToHtml(article.content),
    image: imageUrl || '/blog.jpg',
    date: article.createdAt,
    author: article.author || 'Premium Flora',
    category: getCategoryLabel(article.category),
  };
}
