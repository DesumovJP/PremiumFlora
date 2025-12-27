/**
 * Flowers API
 *
 * CRUD операції для квітів (GraphQL + REST)
 */

import { graphqlRequest, API_URL, getAuthHeaders } from './client';
import { convertFlowerToProduct, blocksToText } from './converters';
import {
  GET_FLOWERS,
  GET_FLOWER_BY_SLUG,
  GET_FLOWER_BY_DOCUMENT_ID,
  SEARCH_FLOWERS,
} from '../graphql/queries';
import type {
  FlowersResponse,
  FlowerResponse,
  FlowerByDocumentIdResponse,
} from '../graphql/types';
import type { Product } from '../types';
import type { StrapiBlock, StrapiImage } from '../strapi-types';
import type { ApiResponse } from '../api-types';

/**
 * Отримати всі квіти
 */
export async function getFlowers(options?: { fresh?: boolean }): Promise<Product[]> {
  try {
    const data = await graphqlRequest<FlowersResponse>(GET_FLOWERS, {
      pageSize: 500,
    });

    // Дедуплікація по documentId (Strapi v5 може повертати кілька версій)
    const seen = new Set<string>();
    const uniqueFlowers = data.flowers.filter((flower) => {
      if (seen.has(flower.documentId)) {
        return false;
      }
      seen.add(flower.documentId);
      return true;
    });

    // Конвертуємо та відкидаємо квітки без варіантів
    return uniqueFlowers
      .map(convertFlowerToProduct)
      .filter((product) => product.variants && product.variants.length > 0);
  } catch (error) {
    console.error('Error fetching flowers:', error);
    return [];
  }
}

/**
 * Отримати одну квітку за slug
 */
export async function getFlowerBySlug(slug: string): Promise<Product | null> {
  try {
    const data = await graphqlRequest<FlowerResponse>(GET_FLOWER_BY_SLUG, {
      slug,
    });

    if (!data.flowers || data.flowers.length === 0) {
      return null;
    }

    const product = convertFlowerToProduct(data.flowers[0]);

    if (!product.variants || product.variants.length === 0) {
      return null;
    }

    if (!product.image && data.flowers[0].name) {
      console.warn(`Product "${data.flowers[0].name}" has no image`);
    }

    return product;
  } catch (error) {
    console.error('Error fetching flower:', error);
    return null;
  }
}

/**
 * Отримати одну квітку за ID (slug)
 */
export async function getFlowerById(id: string): Promise<Product | null> {
  return getFlowerBySlug(id);
}

/**
 * Пошук квітів за назвою
 */
export async function searchFlowers(query: string): Promise<Product[]> {
  try {
    const data = await graphqlRequest<FlowersResponse>(SEARCH_FLOWERS, {
      query,
      pageSize: 500,
    });

    return data.flowers
      .map(convertFlowerToProduct)
      .filter((product) => product.variants && product.variants.length > 0);
  } catch (error) {
    console.error('Error searching flowers:', error);
    return [];
  }
}

/**
 * Отримати детальну інформацію про квітку з описом
 */
export async function getFlowerDetails(slug: string) {
  try {
    const data = await graphqlRequest<FlowerResponse>(GET_FLOWER_BY_SLUG, {
      slug,
    });

    if (!data.flowers || data.flowers.length === 0) {
      return null;
    }

    const flower = data.flowers[0];
    const product = convertFlowerToProduct(flower);

    if (!product.variants || product.variants.length === 0) {
      return null;
    }

    return {
      ...product,
      description: blocksToText(flower.description as unknown[]),
      slug: flower.slug,
    };
  } catch (error) {
    console.error('Error fetching flower details:', error);
    return null;
  }
}

/**
 * Отримати повну інформацію про квітку для редагування
 */
export async function getFlowerForEdit(documentId: string): Promise<{
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: StrapiBlock[];
  image: StrapiImage | null;
  variants: Array<{
    id: number;
    documentId: string;
    length: number;
    price: number;
    stock: number;
  }>;
} | null> {
  try {
    const data = await graphqlRequest<FlowerByDocumentIdResponse>(
      GET_FLOWER_BY_DOCUMENT_ID,
      { documentId },
      true
    );

    if (!data.flower) {
      return null;
    }

    const flower = data.flower;

    let imageData: StrapiImage | null = null;
    if (flower.image) {
      imageData = {
        id: 0,
        name: flower.image.name,
        alternativeText: flower.image.alternativeText,
        caption: null,
        width: flower.image.width,
        height: flower.image.height,
        formats: flower.image.formats || {
          thumbnail: undefined,
          small: undefined,
          medium: undefined,
          large: undefined,
        },
        hash: '',
        ext: '',
        mime: '',
        size: 0,
        url: flower.image.url,
        previewUrl: null,
        provider: '',
        createdAt: '',
        updatedAt: '',
      };
    }

    return {
      id: 0,
      documentId: flower.documentId,
      name: flower.name,
      slug: flower.slug,
      description: flower.description || [],
      image: imageData,
      variants: flower.variants.map((v) => ({
        id: 0,
        documentId: v.documentId,
        length: v.length,
        price: v.price,
        stock: v.stock,
      })),
    };
  } catch (error) {
    console.error('Error fetching flower for edit:', error);
    return null;
  }
}

/**
 * Оновити квітку (REST API)
 */
export async function updateFlower(
  documentId: string,
  data: {
    name?: string;
    description?: StrapiBlock[];
    imageId?: number | null;
  }
): Promise<ApiResponse<void>> {
  console.log('updateFlower called:', { documentId, data });

  try {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.imageId !== undefined) {
      updateData.image = data.imageId || null;
    }

    const authHeaders = getAuthHeaders();
    const url = `${API_URL}/flowers/${documentId}`;

    console.log('PUT request:', { url, updateData });

    const response = await fetch(url, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ data: updateData }),
    });

    const responseData = await response.json().catch(() => ({}));
    console.log('PUT response:', { status: response.status, ok: response.ok, data: responseData });

    if (!response.ok) {
      console.error('Error updating flower via REST:', responseData);
      return {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: responseData.error?.message || `HTTP ${response.status}`,
        },
      };
    }

    console.log('Flower updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating flower:', error);
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update flower',
      },
    };
  }
}

/**
 * Оновити варіант квітки (REST API)
 */
export async function updateVariant(
  documentId: string,
  data: {
    price?: number;
    stock?: number;
  }
): Promise<ApiResponse<void>> {
  console.log('updateVariant called with:', { documentId, data });

  try {
    const updateData: Record<string, unknown> = {};

    if (data.price !== undefined) {
      const priceValue = Number(data.price);
      if (isNaN(priceValue)) {
        return {
          success: false,
          error: {
            code: 'INVALID_PRICE',
            message: 'Invalid price value',
          },
        };
      }
      updateData.price = priceValue;
    }

    if (data.stock !== undefined) {
      const stockValue = Number(data.stock);
      if (isNaN(stockValue)) {
        return {
          success: false,
          error: {
            code: 'INVALID_STOCK',
            message: 'Invalid stock value',
          },
        };
      }
      updateData.stock = stockValue;
    }

    const authHeaders = getAuthHeaders();

    // Спочатку отримуємо поточний варіант щоб зберегти flower relation
    console.log('Fetching current variant:', documentId);
    const currentResponse = await fetch(
      `${API_URL}/variants/${documentId}?populate=flower`,
      { headers: authHeaders }
    );

    if (!currentResponse.ok) {
      console.error('Variant not found:', documentId);
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Variant not found',
        },
      };
    }

    const currentVariant = await currentResponse.json();
    console.log('Current variant data:', currentVariant);

    const flowerDocumentId = currentVariant.data?.flower?.documentId;
    console.log('Flower documentId from current variant:', flowerDocumentId);

    if (flowerDocumentId) {
      updateData.flower = flowerDocumentId;
    }

    console.log('Final updateData for variant:', updateData);

    const response = await fetch(`${API_URL}/variants/${documentId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ data: updateData }),
    });

    const responseData = await response.json().catch(() => ({}));
    console.log('Variant PUT response:', { status: response.status, data: responseData });

    if (!response.ok) {
      console.error('Error updating variant via REST:', responseData);
      return {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: responseData.error?.message || `HTTP ${response.status}`,
        },
      };
    }

    console.log('Variant updated successfully via REST:', { documentId, updateData });
    return { success: true };
  } catch (error) {
    console.error('Error updating variant:', error);
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update variant',
      },
    };
  }
}
