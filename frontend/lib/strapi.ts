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
  GET_ARTICLES,
  GET_ARTICLE_BY_ID,
  GET_BLOG_POSTS,
  GET_TASKS,
  GET_TASK_BY_ID,
  GET_UPCOMING_TASKS,
} from "./graphql/queries";
import {
  CREATE_CUSTOMER,
  DELETE_CUSTOMER,
  CREATE_ARTICLE,
  UPDATE_ARTICLE,
  DELETE_ARTICLE,
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
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
  GraphQLArticle,
  ArticlesResponse,
  ArticleResponse,
  CreateArticleInput,
  UpdateArticleInput,
  GraphQLTask,
  TasksResponse,
  TaskResponse,
  CreateTaskInput,
  UpdateTaskInput,
  GraphQLBlock,
} from "./graphql/types";
import type { BlogPost } from "./types";
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
  ApiError,
} from "./api-types";
import type { ImportOptions, ImportResponse } from "./import-types";
import type { LowStockVariant, FlowerSearchResult } from "./planned-supply-types";
import { getAuthHeaders } from "./auth";

// REST API URL для кастомних ендпоінтів
const API_URL = `${STRAPI_URL}/api`;

// ============================================
// Retry Logic
// ============================================

interface RetryOptions {
  retries?: number;
  backoff?: number;
  retryOn?: number[];
}

/**
 * Fetch з автоматичним retry при тимчасових помилках
 * Використовує exponential backoff
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  { retries = 3, backoff = 1000, retryOn = [500, 502, 503, 504, 0] }: RetryOptions = {}
): Promise<Response> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Якщо успіх або клієнтська помилка - повертаємо одразу
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Серверна помилка - retry якщо потрібно
      if (!retryOn.includes(response.status)) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      // Мережева помилка (status 0)
      lastError = error as Error;
    }

    // Якщо не останній attempt - чекаємо і пробуємо знову
    if (attempt < retries - 1) {
      const delay = backoff * Math.pow(2, attempt);
      console.warn(`[Retry] Attempt ${attempt + 1}/${retries} failed. Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw lastError;
}

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
    description: flower.description || undefined,
    image: imageUrl,
    variants,
    updatedAt: flower.updatedAt,
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

    // Якщо немає варіантів – не показуємо цю квітку на клієнті
    if (!product.variants || product.variants.length === 0) {
      return null;
    }

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
      pageSize: 500,
    });

    // Пошук повертає тільки квітки з варіантами
    return data.flowers
      .map(convertFlowerToProduct)
      .filter((product) => product.variants && product.variants.length > 0);
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
    const product = convertFlowerToProduct(flower);

    // Якщо немає варіантів – не показуємо детальну сторінку
    if (!product.variants || product.variants.length === 0) {
      return null;
    }

    return {
      ...product,
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
 * Оновити квітку (REST API для стабільності)
 * Strapi v5: оновлюємо published версію напряму
 */
export async function updateFlower(
  documentId: string,
  data: {
    name?: string;
    description?: StrapiBlock[];
    imageId?: number | null;
  }
): Promise<ApiResponse<void>> {
  console.log("🌸 updateFlower called:", { documentId, data });

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

    console.log("🌸 PUT request:", { url, updateData });

    // Simple PUT - works because draftAndPublish is disabled for Flower
    const response = await fetch(url, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ data: updateData }),
    });

    const responseData = await response.json().catch(() => ({}));
    console.log("🌸 PUT response:", { status: response.status, ok: response.ok, data: responseData });

    if (!response.ok) {
      console.error("🌸 Error updating flower via REST:", responseData);
      return {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: responseData.error?.message || `HTTP ${response.status}`,
        },
      };
    }

    console.log("🌸 Flower updated successfully");
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
 * Оновити варіант квітки (REST API для стабільності)
 * Оновлюємо тільки price і stock - НЕ чіпаємо flower relation!
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
    }

    const authHeaders = getAuthHeaders();

    // Спочатку отримуємо поточний варіант щоб зберегти flower relation
    console.log("🔍 Fetching current variant:", documentId);
    const currentResponse = await fetch(
      `${API_URL}/variants/${documentId}?populate=flower`,
      { headers: authHeaders }
    );

    if (!currentResponse.ok) {
      console.error("🔍 Variant not found:", documentId);
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Variant not found",
        },
      };
    }

    const currentVariant = await currentResponse.json();
    console.log("🔍 Current variant data:", currentVariant);

    const flowerDocumentId = currentVariant.data?.flower?.documentId;
    console.log("🔍 Flower documentId from current variant:", flowerDocumentId);

    // Зберігаємо flower relation якщо вона є
    if (flowerDocumentId) {
      updateData.flower = flowerDocumentId;
    }

    console.log("📝 Final updateData for variant:", updateData);

    // REST API: PUT /api/variants/:documentId
    const response = await fetch(`${API_URL}/variants/${documentId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ data: updateData }),
    });

    const responseData = await response.json().catch(() => ({}));
    console.log("📝 Variant PUT response:", { status: response.status, data: responseData });

    if (!response.ok) {
      console.error("Error updating variant via REST:", responseData);
      return {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: responseData.error?.message || `HTTP ${response.status}`,
        },
      };
    }

    console.log("Variant updated successfully via REST:", { documentId, updateData });
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
 * Використовує retry логіку для надійності
 */
export async function createSale(data: CreateSaleInput): Promise<SaleResponse> {
  try {
    const response = await fetchWithRetry(
      `${API_URL}/pos/sales`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
      { retries: 3, backoff: 1000 }
    );

    return response.json();
  } catch (error) {
    console.error("Error creating sale:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to server after retries",
      },
      alert: {
        type: "error",
        title: "Помилка мережі",
        message: "Не вдалося з'єднатися з сервером. Перевірте підключення та спробуйте ще раз.",
      },
    };
  }
}

/**
 * Створити списання (writeOff)
 * Використовує retry логіку для надійності
 */
export async function createWriteOff(data: WriteOffInput): Promise<WriteOffResponse> {
  try {
    const response = await fetchWithRetry(
      `${API_URL}/pos/write-offs`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
      { retries: 3, backoff: 1000 }
    );

    return response.json();
  } catch (error) {
    console.error("Error creating write-off:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to server after retries",
      },
      alert: {
        type: "error",
        title: "Помилка мережі",
        message: "Не вдалося з'єднатися з сервером. Перевірте підключення та спробуйте ще раз.",
      },
    };
  }
}

/**
 * Підтвердити оплату транзакції
 * Використовує retry логіку для надійності
 */
export async function confirmPayment(
  transactionId: string
): Promise<ConfirmPaymentResponse> {
  try {
    const response = await fetchWithRetry(
      `${API_URL}/pos/transactions/${transactionId}/confirm-payment`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      },
      { retries: 3, backoff: 1000 }
    );

    return response.json();
  } catch (error) {
    console.error("Error confirming payment:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to server after retries",
      },
      alert: {
        type: "error",
        title: "Помилка мережі",
        message: "Не вдалося з'єднатися з сервером. Перевірте підключення та спробуйте ще раз.",
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
export async function getDashboardAnalytics(year?: number, month?: number): Promise<ApiResponse<DashboardData>> {
  try {
    const params = new URLSearchParams();
    if (year !== undefined) params.append('year', String(year));
    if (month !== undefined) params.append('month', String(month));

    const queryString = params.toString();
    const url = `${API_URL}/analytics/dashboard${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
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

// ============================================
// Shift API
// ============================================

export interface ShiftActivity {
  id: string;
  type: 'sale' | 'writeOff' | 'productEdit' | 'productCreate' | 'productDelete' | 'paymentConfirm' | 'customerCreate' | 'customerDelete' | 'supply';
  timestamp: string;
  details: Record<string, unknown>;
}

export interface ShiftSummary {
  totalSales: number;
  totalSalesAmount: number;
  totalSalesPaid?: number;      // Оплачені продажі
  totalSalesExpected?: number;  // Очікують оплати
  totalWriteOffs: number;
  totalWriteOffsQty: number;
  totalSupplies?: number;       // Кількість поставок
  activitiesCount: number;
  productEdits: number;
  customersCreated: number;
}

export interface Shift {
  id: number;
  documentId: string;
  startedAt: string;
  closedAt: string;
  status: 'active' | 'closed';
  activities: ShiftActivity[];
  summary: ShiftSummary;
  totalSales: number;
  totalSalesAmount: number;
  totalWriteOffs: number;
  totalWriteOffsQty: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CloseShiftInput {
  notes?: string;
}

export interface AddActivityInput {
  activity: ShiftActivity;
}

/**
 * Отримати або створити поточну активну зміну
 */
export async function getCurrentShift(): Promise<ApiResponse<Shift> & { isNew?: boolean }> {
  try {
    const response = await fetch(`${API_URL}/shifts/current`, {
      cache: "no-store",
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting current shift:", error);
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
 * Додати активність до поточної зміни
 */
export async function addShiftActivity(data: AddActivityInput): Promise<ApiResponse<Shift> & { idempotent?: boolean }> {
  try {
    const response = await fetch(`${API_URL}/shifts/current/activity`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error adding shift activity:", error);
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
 * Закрити поточну активну зміну
 */
export async function closeShift(data?: CloseShiftInput): Promise<ApiResponse<Shift>> {
  try {
    const response = await fetch(`${API_URL}/shifts/close`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data || {}),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error closing shift:", error);
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
 * Отримати список закритих змін
 */
export async function getShifts(page: number = 1, pageSize: number = 10): Promise<{
  success: boolean;
  data?: Shift[];
  meta?: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
  error?: ApiError;
}> {
  try {
    const response = await fetch(`${API_URL}/shifts?page=${page}&pageSize=${pageSize}`, {
      cache: "no-store",
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching shifts:", error);
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
// Articles API - GraphQL
// ============================================

export type { GraphQLArticle, CreateArticleInput, UpdateArticleInput };

/**
 * Отримати всі статті
 */
export async function getArticles(): Promise<ApiResponse<GraphQLArticle[]>> {
  try {
    const data = await graphqlRequest<ArticlesResponse>(GET_ARTICLES, {
      pageSize: 100,
    });

    return {
      success: true,
      data: data.articles,
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to fetch articles",
      },
    };
  }
}

/**
 * Отримати статтю за ID
 */
export async function getArticleById(documentId: string): Promise<ApiResponse<GraphQLArticle>> {
  try {
    const data = await graphqlRequest<ArticleResponse>(GET_ARTICLE_BY_ID, {
      documentId,
    });

    if (!data.article) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Article not found",
        },
      };
    }

    return {
      success: true,
      data: data.article,
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to fetch article",
      },
    };
  }
}

/**
 * Створити статтю
 */
export async function createArticle(data: CreateArticleInput): Promise<ApiResponse<GraphQLArticle>> {
  try {
    const result = await graphqlRequest<{ createArticle: GraphQLArticle }>(
      CREATE_ARTICLE,
      { data },
      true
    );

    return {
      success: true,
      data: result.createArticle,
    };
  } catch (error) {
    console.error("Error creating article:", error);
    return {
      success: false,
      error: {
        code: "CREATE_FAILED",
        message: error instanceof Error ? error.message : "Failed to create article",
      },
    };
  }
}

/**
 * Оновити статтю
 */
export async function updateArticle(documentId: string, data: UpdateArticleInput): Promise<ApiResponse<GraphQLArticle>> {
  try {
    const result = await graphqlRequest<{ updateArticle: GraphQLArticle }>(
      UPDATE_ARTICLE,
      { documentId, data },
      true
    );

    return {
      success: true,
      data: result.updateArticle,
    };
  } catch (error) {
    console.error("Error updating article:", error);
    return {
      success: false,
      error: {
        code: "UPDATE_FAILED",
        message: error instanceof Error ? error.message : "Failed to update article",
      },
    };
  }
}

/**
 * Видалити статтю
 */
export async function deleteArticle(documentId: string): Promise<ApiResponse<void>> {
  try {
    await graphqlRequest(DELETE_ARTICLE, { documentId }, true);

    return { success: true };
  } catch (error) {
    console.error("Error deleting article:", error);
    return {
      success: false,
      error: {
        code: "DELETE_FAILED",
        message: error instanceof Error ? error.message : "Failed to delete article",
      },
    };
  }
}

/**
 * Конвертує blocks в HTML для відображення у блозі
 */
function blocksToHtml(blocks: GraphQLBlock[] | null): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      if (block.type === "paragraph" && block.children) {
        const text = block.children.map((child) => child.text || "").join("");
        return `<p>${text}</p>`;
      }
      if (block.type === "heading" && block.children) {
        const level = (block as any).level || 2;
        const text = block.children.map((child) => child.text || "").join("");
        return `<h${level}>${text}</h${level}>`;
      }
      if (block.type === "list" && (block as any).children) {
        const items = (block as any).children
          .map((item: any) => {
            const text = item.children
              ?.map((c: any) => c.children?.map((t: any) => t.text || "").join("") || "")
              .join("") || "";
            return `<li>${text}</li>`;
          })
          .join("");
        return `<ul>${items}</ul>`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * Конвертує GraphQL статтю в BlogPost для клієнтської частини
 */
function convertArticleToBlogPost(article: GraphQLArticle): BlogPost {
  const imageUrl = article.image ? extractImageUrl(article.image) : "";

  return {
    id: article.documentId,
    title: article.title,
    excerpt: article.excerpt || blocksToText(article.content).slice(0, 200) + "...",
    content: blocksToHtml(article.content),
    image: imageUrl || "/blog.jpg", // Fallback image
    date: article.createdAt,
    author: article.author || "Premium Flora",
    category: getCategoryLabel(article.category),
  };
}

/**
 * Конвертує категорію в людську назву
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    blog: "Блог",
    care: "Догляд",
    guide: "Гайд",
    info: "Інформація",
    note: "Нотатка",
    procedure: "Процедура",
  };
  return labels[category] || category;
}

/**
 * Отримати публічні статті для блогу
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const data = await graphqlRequest<ArticlesResponse>(GET_BLOG_POSTS, {
      pageSize: 20,
    });

    return data.articles.map(convertArticleToBlogPost);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

// ============================================
// Tasks API - GraphQL
// ============================================

export type { GraphQLTask, CreateTaskInput, UpdateTaskInput };

/**
 * Отримати всі завдання
 */
export async function getTasks(status?: string): Promise<ApiResponse<GraphQLTask[]>> {
  try {
    const data = await graphqlRequest<TasksResponse>(GET_TASKS, {
      pageSize: 100,
      status: status || undefined,
    });

    return {
      success: true,
      data: data.tasks,
    };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to fetch tasks",
      },
    };
  }
}

/**
 * Отримати майбутні завдання (від сьогодні)
 */
export async function getUpcomingTasks(): Promise<ApiResponse<GraphQLTask[]>> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = await graphqlRequest<TasksResponse>(GET_UPCOMING_TASKS, {
      dateFrom: today.toISOString(),
      pageSize: 50,
    });

    return {
      success: true,
      data: data.tasks,
    };
  } catch (error) {
    console.error("Error fetching upcoming tasks:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to fetch tasks",
      },
    };
  }
}

/**
 * Отримати завдання за ID
 */
export async function getTaskById(documentId: string): Promise<ApiResponse<GraphQLTask>> {
  try {
    const data = await graphqlRequest<TaskResponse>(GET_TASK_BY_ID, {
      documentId,
    });

    if (!data.task) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Task not found",
        },
      };
    }

    return {
      success: true,
      data: data.task,
    };
  } catch (error) {
    console.error("Error fetching task:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to fetch task",
      },
    };
  }
}

/**
 * Створити завдання
 */
export async function createTask(data: CreateTaskInput): Promise<ApiResponse<GraphQLTask>> {
  try {
    const result = await graphqlRequest<{ createTask: GraphQLTask }>(
      CREATE_TASK,
      { data },
      true
    );

    return {
      success: true,
      data: result.createTask,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      error: {
        code: "CREATE_FAILED",
        message: error instanceof Error ? error.message : "Failed to create task",
      },
    };
  }
}

/**
 * Оновити завдання
 */
export async function updateTask(documentId: string, data: UpdateTaskInput): Promise<ApiResponse<GraphQLTask>> {
  try {
    const result = await graphqlRequest<{ updateTask: GraphQLTask }>(
      UPDATE_TASK,
      { documentId, data },
      true
    );

    return {
      success: true,
      data: result.updateTask,
    };
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      success: false,
      error: {
        code: "UPDATE_FAILED",
        message: error instanceof Error ? error.message : "Failed to update task",
      },
    };
  }
}

/**
 * Видалити завдання
 */
export async function deleteTask(documentId: string): Promise<ApiResponse<void>> {
  try {
    await graphqlRequest(DELETE_TASK, { documentId }, true);

    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      success: false,
      error: {
        code: "DELETE_FAILED",
        message: error instanceof Error ? error.message : "Failed to delete task",
      },
    };
  }
}

/**
 * Позначити завдання як виконане
 */
export async function completeTask(documentId: string): Promise<ApiResponse<GraphQLTask>> {
  return updateTask(documentId, {
    status: "completed",
    completedAt: new Date().toISOString(),
  });
}
