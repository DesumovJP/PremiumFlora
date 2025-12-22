/**
 * Strapi API Module - GraphQL based
 *
 * Всі запити до стандартних колекцій Strapi (flowers, customers, transactions, variants)
 * використовують GraphQL. Кастомні ендпоінти (POS, analytics, planned-supply, import)
 * залишаються REST, оскільки вони не генеруються Strapi GraphQL плагіном.
 *
 * ВАЖЛИВО для Strapi v5 GraphQL:
 * - Використовуємо documentId замість id
 * - Не використовуємо обгортку "data" у відповідях
 * - Фільтрація працює через slug або documentId
 */

import { graphqlRequest, STRAPI_URL, getAuthClient } from "./graphql/client";
import {
  GET_FLOWERS,
  GET_FLOWER_BY_SLUG,
  GET_FLOWER_BY_DOCUMENT_ID,
  SEARCH_FLOWERS,
  GET_CUSTOMERS,
  GET_CUSTOMER_BY_ID,
  GET_TRANSACTIONS,
  GET_VARIANT_BY_ID,
} from "./graphql/queries";
import {
  UPDATE_FLOWER,
  UPDATE_VARIANT,
  CREATE_CUSTOMER,
  DELETE_CUSTOMER,
} from "./graphql/mutations";
import type {
  GraphQLFlower,
  GraphQLImage,
  GraphQLCustomer,
  GraphQLTransaction,
  FlowersResponse,
  FlowerResponse,
  FlowerByDocumentIdResponse,
  CustomersResponse,
  CustomerResponse,
  TransactionsResponse,
} from "./graphql/types";
import type {
  StrapiFlower,
  StrapiBlock,
  StrapiImage,
} from "./strapi-types";
import type { Product, Variant } from "./types";
import type {
  CreateSaleInput,
  WriteOffInput,
  SaleResponse,
  WriteOffResponse,
  ConfirmPaymentResponse,
  Customer,
  CreateCustomerInput,
  DashboardData,
  Transaction,
  TransactionFilters,
  ApiResponse,
} from "./api-types";
import type { ImportOptions, ImportResponse } from "./import-types";
import type { LowStockVariant, FlowerSearchResult } from "./planned-supply-types";
import { getAuthHeaders } from "./auth";

// REST API URL для кастомних ендпоінтів
const API_URL = `${STRAPI_URL}/api`;

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

/**
 * Конвертує GraphQL квітку в Product
 */
function convertFlowerToProduct(flower: GraphQLFlower): Product {
  const imageUrl = extractImageUrl(flower.image);

  if (!imageUrl && flower.name && process.env.NODE_ENV === "development") {
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
    image: imageUrl,
    variants,
  };
}

/**
 * Конвертує GraphQL клієнта в Customer
 */
function convertCustomer(c: GraphQLCustomer): Customer {
  return {
    id: 0,
    documentId: c.documentId,
    name: c.name,
    type: c.type || "Regular",
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
function convertTransaction(t: GraphQLTransaction): Transaction {
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
          type: t.customer.type || "Regular",
          totalSpent: 0,
          orderCount: 0,
          createdAt: "",
          updatedAt: "",
        }
      : undefined,
    paymentDate: t.paymentDate || undefined,
    notes: t.notes || undefined,
    writeOffReason: t.writeOffReason || undefined,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

// ============================================
// Flowers - GraphQL
// ============================================

/**
 * Отримати всі квіти
 */
export async function getFlowers(options?: { fresh?: boolean }): Promise<Product[]> {
  try {
    const data = await graphqlRequest<FlowersResponse>(GET_FLOWERS, {
      pageSize: 100,
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

    return uniqueFlowers.map(convertFlowerToProduct);
  } catch (error) {
    console.error("Error fetching flowers:", error);
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

    if (!product.image && data.flowers[0].name) {
      console.warn(`Product "${data.flowers[0].name}" has no image`);
    }

    return product;
  } catch (error) {
    console.error("Error fetching flower:", error);
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
    console.error("Error fetching flower for edit:", error);
    return null;
  }
}

/**
 * Оновити квітку
 */
export async function updateFlower(
  documentId: string,
  data: {
    name?: string;
    description?: StrapiBlock[];
    imageId?: number | null;
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
      updateData.image = data.imageId ? String(data.imageId) : null;
    }

    await graphqlRequest(
      UPDATE_FLOWER,
      { documentId, data: updateData },
      true
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
  console.log("updateVariant called with:", { documentId, data });

  try {
    // Отримуємо поточний варіант
    const currentData = await graphqlRequest<{
      variant: {
        documentId: string;
        length: number;
        price: number;
        stock: number;
        flower?: { documentId: string };
      };
    }>(GET_VARIANT_BY_ID, { documentId }, true);

    if (!currentData.variant) {
      console.error("Variant not found:", documentId);
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Variant not found",
        },
      };
    }

    const currentVariant = currentData.variant;

    // НЕ включаємо flower в updateData - ми оновлюємо тільки price і stock!
    // Включення flower: null або невірного значення відключає варіант від квітки
    const updateData: Record<string, unknown> = {};

    if (data.price !== undefined) {
      const priceValue = Number(data.price);
      if (isNaN(priceValue)) {
        return {
          success: false,
          error: {
            code: "INVALID_PRICE",
            message: "Invalid price value",
          },
        };
      }
      updateData.price = priceValue;
    } else {
      updateData.price = currentVariant.price;
    }

    if (data.stock !== undefined) {
      const stockValue = Number(data.stock);
      if (isNaN(stockValue)) {
        return {
          success: false,
          error: {
            code: "INVALID_STOCK",
            message: "Invalid stock value",
          },
        };
      }
      updateData.stock = stockValue;
    } else {
      updateData.stock = currentVariant.stock;
    }

    console.log("Updating variant via GraphQL:", { documentId, updateData });

    await graphqlRequest(
      UPDATE_VARIANT,
      { documentId, data: updateData },
      true
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

// ============================================
// Customers - GraphQL
// ============================================

interface StrapiCustomer {
  id: number;
  documentId: string;
  name: string;
  type: "VIP" | "Regular" | "Wholesale";
  phone?: string;
  email?: string;
  address?: string;
  totalSpent: number;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Отримати всіх клієнтів
 */
export async function getCustomers(): Promise<Customer[]> {
  try {
    const data = await graphqlRequest<CustomersResponse>(GET_CUSTOMERS, {
      pageSize: 100,
    });

    return data.customers.map(convertCustomer);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

/**
 * Отримати клієнта за ID
 */
export async function getCustomerById(documentId: string): Promise<Customer | null> {
  try {
    const data = await graphqlRequest<CustomerResponse>(GET_CUSTOMER_BY_ID, {
      documentId,
    });

    if (!data.customer) {
      return null;
    }

    return convertCustomer(data.customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

/**
 * Створити нового клієнта
 */
export async function createCustomer(
  data: CreateCustomerInput
): Promise<ApiResponse<Customer>> {
  try {
    const result = await graphqlRequest<{ createCustomer: GraphQLCustomer }>(
      CREATE_CUSTOMER,
      { data }
    );

    return {
      success: true,
      data: convertCustomer(result.createCustomer),
    };
  } catch (error) {
    console.error("Error creating customer:", error);
    return {
      success: false,
      error: {
        code: "CREATE_FAILED",
        message: error instanceof Error ? error.message : "Failed to create customer",
      },
    };
  }
}

/**
 * Видалити клієнта
 */
export async function deleteCustomer(documentId: string): Promise<ApiResponse<void>> {
  try {
    await graphqlRequest(DELETE_CUSTOMER, { documentId }, true);

    return { success: true };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return {
      success: false,
      error: {
        code: "DELETE_FAILED",
        message: error instanceof Error ? error.message : "Failed to delete customer",
      },
    };
  }
}

// ============================================
// Transactions - GraphQL
// ============================================

/**
 * Отримати транзакції
 */
export async function getTransactions(
  filters?: TransactionFilters
): Promise<ApiResponse<Transaction[]>> {
  try {
    const variables: Record<string, unknown> = {
      pageSize: filters?.limit || 100,
    };

    if (filters?.type) variables.type = filters.type;
    if (filters?.paymentStatus) variables.paymentStatus = filters.paymentStatus;
    if (filters?.customerId) variables.customerId = filters.customerId;
    if (filters?.dateFrom) variables.dateFrom = filters.dateFrom;
    if (filters?.dateTo) variables.dateTo = filters.dateTo;

    const data = await graphqlRequest<TransactionsResponse>(
      GET_TRANSACTIONS,
      variables
    );

    if (filters?.customerId) {
      console.log("Transactions query result:", {
        hasData: !!data.transactions,
        dataLength: data.transactions?.length || 0,
        filters,
      });
    }

    return {
      success: true,
      data: data.transactions.map(convertTransaction),
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to server",
      },
    };
  }
}

// ============================================
// Excel Import - REST (кастомний ендпоінт)
// ============================================

/**
 * Імпортувати Excel файл з накладною
 */
export async function importExcel(
  file: File,
  options: ImportOptions = {}
): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  if (options.dryRun !== undefined) {
    formData.append("dryRun", String(options.dryRun));
  }
  if (options.stockMode) {
    formData.append("stockMode", options.stockMode);
  }
  if (options.priceMode) {
    formData.append("priceMode", options.priceMode);
  }
  if (options.awb) {
    formData.append("awb", options.awb);
  }
  if (options.supplier) {
    formData.append("supplier", options.supplier);
  }
  if (options.forceImport !== undefined) {
    formData.append("forceImport", String(options.forceImport));
  }
  if (options.applyPriceCalculation !== undefined) {
    formData.append("applyPriceCalculation", String(options.applyPriceCalculation));
  }
  if (options.exchangeRate !== undefined) {
    formData.append("exchangeRate", String(options.exchangeRate));
  }
  if (options.marginMultiplier !== undefined) {
    formData.append("marginMultiplier", String(options.marginMultiplier));
  }

  const authHeaders = getAuthHeaders();
  const headers: Record<string, string> = {};
  if (
    typeof authHeaders === "object" &&
    authHeaders !== null &&
    "Authorization" in authHeaders
  ) {
    headers.Authorization = (authHeaders as Record<string, string>).Authorization;
  }

  const response = await fetch(`${API_URL}/imports/excel`, {
    method: "POST",
    headers,
    body: formData,
  });

  return response.json();
}

// ============================================
// POS Operations - REST (кастомний ендпоінт)
// ============================================

/**
 * Створити продаж (sale)
 */
export async function createSale(data: CreateSaleInput): Promise<SaleResponse> {
  try {
    const response = await fetch(`${API_URL}/pos/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.json();
  } catch (error) {
    console.error("Error creating sale:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to server",
      },
      alert: {
        type: "error",
        title: "Помилка мережі",
        message: "Не вдалося з'єднатися з сервером",
      },
    };
  }
}

/**
 * Створити списання (writeOff)
 */
export async function createWriteOff(data: WriteOffInput): Promise<WriteOffResponse> {
  try {
    const response = await fetch(`${API_URL}/pos/write-offs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.json();
  } catch (error) {
    console.error("Error creating write-off:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to server",
      },
      alert: {
        type: "error",
        title: "Помилка мережі",
        message: "Не вдалося з'єднатися з сервером",
      },
    };
  }
}

/**
 * Підтвердити оплату транзакції
 */
export async function confirmPayment(
  transactionId: string
): Promise<ConfirmPaymentResponse> {
  try {
    const response = await fetch(
      `${API_URL}/pos/transactions/${transactionId}/confirm-payment`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.json();
  } catch (error) {
    console.error("Error confirming payment:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to server",
      },
      alert: {
        type: "error",
        title: "Помилка мережі",
        message: "Не вдалося з'єднатися з сервером",
      },
    };
  }
}

// ============================================
// Analytics - REST (кастомний ендпоінт)
// ============================================

/**
 * Отримати повну аналітику dashboard
 */
export async function getDashboardAnalytics(): Promise<ApiResponse<DashboardData>> {
  try {
    const response = await fetch(`${API_URL}/analytics/dashboard`, {
      cache: "no-store",
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to server",
      },
    };
  }
}

/**
 * Отримати рівні складу
 */
export async function getStockLevels(): Promise<
  ApiResponse<import("./api-types").StockLevel[]>
> {
  try {
    const response = await fetch(`${API_URL}/analytics/stock`, {
      cache: "no-store",
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching stock levels:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to server",
      },
    };
  }
}

// ============================================
// Planned Supply - REST (кастомний ендпоінт)
// ============================================

/**
 * Отримати варіанти з низькими залишками
 */
export async function getLowStockVariants(
  threshold: number = 100
): Promise<ApiResponse<LowStockVariant[]>> {
  try {
    const response = await fetch(
      `${API_URL}/planned-supply/low-stock?threshold=${threshold}`,
      {
        cache: "no-store",
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching low stock variants:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to server",
      },
    };
  }
}

/**
 * Пошук квітів для запланованої поставки
 */
export async function searchFlowersForSupply(
  query: string
): Promise<ApiResponse<FlowerSearchResult[]>> {
  try {
    const response = await fetch(
      `${API_URL}/planned-supply/search?q=${encodeURIComponent(query)}`,
      {
        cache: "no-store",
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error searching flowers for supply:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to server",
      },
    };
  }
}

/**
 * Отримати всі квіти з варіантами для запланованої поставки
 */
export async function getAllFlowersForSupply(): Promise<
  ApiResponse<FlowerSearchResult[]>
> {
  try {
    const response = await fetch(`${API_URL}/planned-supply/all-flowers`, {
      cache: "no-store",
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching all flowers for supply:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to server",
      },
    };
  }
}
