"use client";

import { useState, useEffect, useCallback } from "react";
import { graphqlRequest, STRAPI_URL } from "@/lib/graphql/client";
import {
  GET_FLOWERS,
  GET_FLOWER_BY_SLUG,
  GET_FLOWER_BY_DOCUMENT_ID,
  SEARCH_FLOWERS,
} from "@/lib/graphql/queries";
import { UPDATE_FLOWER, UPDATE_VARIANT } from "@/lib/graphql/mutations";
import type {
  GraphQLFlower,
  GraphQLImage,
  FlowersResponse,
  FlowerResponse,
  FlowerByDocumentIdResponse,
} from "@/lib/graphql/types";
import type { Product, Variant } from "@/lib/types";
import type { StrapiBlock, StrapiImage } from "@/lib/strapi-types";

// ============================================
// Helper функції
// ============================================

/**
 * Конвертує GraphQL зображення в URL
 */
function extractImageUrl(image: GraphQLImage | null): string {
  if (!image?.url) return "";

  return image.url.startsWith("http")
    ? image.url
    : `${STRAPI_URL}${image.url.startsWith("/") ? image.url : `/${image.url}`}`;
}

/**
 * Конвертує GraphQL квітку в Product
 */
function convertFlowerToProduct(flower: GraphQLFlower): Product {
  const imageUrl = extractImageUrl(flower.image);

  const variants: Variant[] = (flower.variants || []).map((v) => ({
    size: `${v.length} см`,
    price: v.price ?? 0,
    stock: v.stock ?? 0,
    length: v.length ?? 0,
  }));

  return {
    id: flower.slug,
    documentId: flower.documentId,
    slug: flower.slug,
    name: flower.name,
    image: imageUrl,
    variants,
  };
}

/**
 * Конвертує blocks в текст
 */
function blocksToText(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block.type === "paragraph" && block.children) {
        return block.children.map((child: any) => child.text || "").join("");
      }
      return "";
    })
    .join("\n");
}

// ============================================
// Хуки для квітів
// ============================================

interface UseFlowersOptions {
  fresh?: boolean;
}

interface UseFlowersResult {
  flowers: Product[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Хук для отримання всіх квітів
 */
export function useFlowers(options?: UseFlowersOptions): UseFlowersResult {
  const [flowers, setFlowers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFlowers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await graphqlRequest<FlowersResponse>(GET_FLOWERS, {
        pageSize: 100,
      });

      const products = data.flowers.map(convertFlowerToProduct);
      setFlowers(products);
    } catch (err) {
      console.error("Error fetching flowers:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch flowers"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlowers();
  }, [fetchFlowers]);

  return { flowers, loading, error, refetch: fetchFlowers };
}

/**
 * Хук для отримання квітки за slug
 */
export function useFlowerBySlug(slug: string | null) {
  const [flower, setFlower] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchFlower = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await graphqlRequest<FlowerResponse>(GET_FLOWER_BY_SLUG, {
          slug,
        });

        if (data.flowers && data.flowers.length > 0) {
          setFlower(convertFlowerToProduct(data.flowers[0]));
        } else {
          setFlower(null);
        }
      } catch (err) {
        console.error("Error fetching flower:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch flower"));
      } finally {
        setLoading(false);
      }
    };

    fetchFlower();
  }, [slug]);

  return { flower, loading, error };
}

// ============================================
// Серверні функції для квітів (Server Components / Server Actions)
// ============================================

/**
 * Отримати всі квіти (серверна функція)
 */
export async function getFlowers(options?: { fresh?: boolean }): Promise<Product[]> {
  try {
    const data = await graphqlRequest<FlowersResponse>(GET_FLOWERS, {
      pageSize: 100,
      status: "LIVE",
    });

    return data.flowers.map(convertFlowerToProduct);
  } catch (error) {
    console.error("Error fetching flowers:", error);
    return [];
  }
}

/**
 * Отримати квітку за slug (серверна функція)
 */
export async function getFlowerBySlug(slug: string): Promise<Product | null> {
  try {
    const data = await graphqlRequest<FlowerResponse>(GET_FLOWER_BY_SLUG, {
      slug,
    });

    if (data.flowers && data.flowers.length > 0) {
      return convertFlowerToProduct(data.flowers[0]);
    }
    return null;
  } catch (error) {
    console.error("Error fetching flower:", error);
    return null;
  }
}

/**
 * Отримати квітку за ID (slug) - для сумісності
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
      pageSize: 100,
    });

    return data.flowers.map(convertFlowerToProduct);
  } catch (error) {
    console.error("Error searching flowers:", error);
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
    return {
      ...convertFlowerToProduct(flower),
      description: blocksToText(flower.description),
      slug: flower.slug,
    };
  } catch (error) {
    console.error("Error fetching flower details:", error);
    return null;
  }
}

/**
 * Отримати квітку для редагування (з повними даними)
 */
export async function getFlowerForEdit(documentId: string): Promise<{
  documentId: string;
  name: string;
  slug: string;
  description: StrapiBlock[];
  image: StrapiImage | null;
  variants: Array<{
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
      true // requireAuth
    );

    if (!data.flower) {
      return null;
    }

    const flower = data.flower;

    // Конвертуємо image до потрібного формату
    let imageData: StrapiImage | null = null;
    if (flower.image) {
      imageData = {
        id: 0, // GraphQL не повертає числовий id
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
        hash: "",
        ext: "",
        mime: "",
        size: 0,
        url: flower.image.url,
        previewUrl: null,
        provider: "",
        createdAt: "",
        updatedAt: "",
      };
    }

    return {
      documentId: flower.documentId,
      name: flower.name,
      slug: flower.slug,
      description: flower.description || [],
      image: imageData,
      variants: flower.variants.map((v) => ({
        documentId: v.documentId,
        length: v.length,
        price: v.price,
        stock: v.stock,
      })),
    };
  } catch (error) {
    console.error("Error fetching flower for edit:", error);
    return null;
  }
}

// ============================================
// Мутації для квітів та варіантів
// ============================================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Оновити квітку
 */
export async function updateFlower(
  documentId: string,
  data: {
    name?: string;
    description?: StrapiBlock[];
    imageId?: string | null;
  }
): Promise<ApiResponse<void>> {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.imageId !== undefined) {
      updateData.image = data.imageId;
    }

    await graphqlRequest(
      UPDATE_FLOWER,
      { documentId, data: updateData },
      true // requireAuth
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating flower:", error);
    return {
      success: false,
      error: {
        code: "UPDATE_FAILED",
        message: error instanceof Error ? error.message : "Failed to update flower",
      },
    };
  }
}

/**
 * Оновити варіант квітки
 */
export async function updateVariant(
  documentId: string,
  data: {
    price?: number;
    stock?: number;
  }
): Promise<ApiResponse<void>> {
  try {
    // Спочатку отримуємо поточний варіант, щоб зберегти зв'язок з flower
    const currentData = await graphqlRequest<{
      variant: { documentId: string; length: number; price: number; stock: number; flower?: { documentId: string } };
    }>(
      `query GetVariant($documentId: ID!) {
        variant(documentId: $documentId) {
          documentId
          length
          price
          stock
          flower {
            documentId
          }
        }
      }`,
      { documentId },
      true
    );

    if (!currentData.variant) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Variant not found" },
      };
    }

    const updateData: Record<string, unknown> = {
      length: currentData.variant.length,
      flower: currentData.variant.flower?.documentId || null,
    };

    if (data.price !== undefined) {
      updateData.price = Number(data.price);
    } else {
      updateData.price = currentData.variant.price;
    }

    if (data.stock !== undefined) {
      updateData.stock = Number(data.stock);
    } else {
      updateData.stock = currentData.variant.stock;
    }

    await graphqlRequest(
      UPDATE_VARIANT,
      { documentId, data: updateData },
      true // requireAuth
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating variant:", error);
    return {
      success: false,
      error: {
        code: "UPDATE_FAILED",
        message: error instanceof Error ? error.message : "Failed to update variant",
      },
    };
  }
}
