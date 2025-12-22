import type {
  StrapiFlower,
  StrapiListResponse,
  StrapiResponse,
  StrapiBlock,
  StrapiImage,
} from "./strapi-types";
import type { Product, Variant } from "./types";

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const API_URL = `${STRAPI_URL}/api`;

// Helper функція для конвертації blocks в text
function blocksToText(blocks: StrapiBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "paragraph") {
        return block.children.map((child) => child.text).join("");
      }
      return "";
    })
    .join("\n");
}

// Helper функція для отримання URL зображення з різних форматів Strapi
function extractImageUrl(image: any): string {
  if (!image) return "";

  // Strapi v5 може повертати image у різних форматах
  let imageData: any = null;

  // Формат 1: масив зображень
  if (Array.isArray(image)) {
    imageData = image[0];
  }
  // Формат 2: об'єкт з полем data (старий Strapi формат)
  else if (image.data) {
    imageData = Array.isArray(image.data) ? image.data[0] : image.data;
    // Якщо є attributes, використовуємо їх
    if (imageData?.attributes) {
      imageData = imageData.attributes;
    }
  }
  // Формат 3: прямий об'єкт з url (Strapi v5)
  else {
    imageData = image;
  }

  if (!imageData) return "";

  // Отримуємо URL - перевіряємо різні можливі місця
  let url = imageData.url;

  // Якщо немає прямого url, шукаємо в formats
  if (!url && imageData.formats) {
    url = imageData.formats.large?.url ||
          imageData.formats.medium?.url ||
          imageData.formats.small?.url ||
          imageData.formats.thumbnail?.url;
  }

  // Якщо є attributes (Strapi v4 формат)
  if (!url && imageData.attributes) {
    url = imageData.attributes.url;
    if (!url && imageData.attributes.formats) {
      url = imageData.attributes.formats.large?.url ||
            imageData.attributes.formats.medium?.url ||
            imageData.attributes.formats.small?.url;
    }
  }

  if (!url) return "";

  // Якщо URL вже повний, використовуємо як є
  // Інакше додаємо базовий URL Strapi
  return url.startsWith("http")
    ? url
    : `${STRAPI_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

// Конвертуємо дані Strapi у формат який очікує frontend
function convertFlowerToProduct(flower: StrapiFlower): Product {
  // Формуємо повний URL зображення
  const imageUrl = extractImageUrl(flower.image);

  // Діагностика: логуємо якщо зображення відсутнє (тільки в development)
  if (!imageUrl && flower.name && process.env.NODE_ENV === 'development') {
    console.warn(`No image for flower: ${flower.name}`, {
      hasImage: !!flower.image,
      imageType: typeof flower.image,
      imageValue: JSON.stringify(flower.image),
    });
  }
  
  // Діагностика: перевірити наявність slug
  if (!flower.slug) {
    console.warn(`⚠️ Flower missing slug:`, {
      name: flower.name,
      documentId: flower.documentId,
      hasSlug: !!flower.slug,
    });
  }

  // Безпечно обробити варіанти
  const variants = (flower.variants || [])
    .filter((v) => v != null)
    .map((v) => ({
      size: `${v.length} см`,
      price: v.price ?? 0,
      stock: v.stock ?? 0,
      length: v.length ?? 0,
    }));

  // Діагностика: логуємо якщо немає варіантів
  if (variants.length === 0 && flower.name) {
    console.warn(`⚠️ Flower has no variants:`, {
      name: flower.name,
      slug: flower.slug,
      documentId: flower.documentId,
      variantsCount: flower.variants?.length || 0,
    });
  }

  return {
    id: flower.slug,
    documentId: flower.documentId,
    slug: flower.slug, // Додаємо slug для використання в API
    name: flower.name,
    image: imageUrl,
    variants,
  };
}

// Отримати всі квіти
export async function getFlowers(options?: { fresh?: boolean }): Promise<Product[]> {
  try {
    // Додаємо timestamp для cache-busting при fresh: true
    const timestamp = options?.fresh ? `&_t=${Date.now()}` : '';
    // Фільтруємо тільки опубліковані записи
    const response = await fetch(
      `${API_URL}/flowers?populate=*&pagination[pageSize]=100&publicationState=live&filters[publishedAt][$notNull]=true${timestamp}`,
      {
        // Для адмін-панелі використовуємо свіжі дані без кешування
        // Для публічних сторінок кешуємо на 1 хвилину
        ...(options?.fresh ? { cache: "no-store" } : { next: { revalidate: 60 } }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch flowers: ${response.statusText}`);
    }

    const data: StrapiListResponse<StrapiFlower> = await response.json();
    return data.data.map(convertFlowerToProduct);
  } catch (error) {
    console.error("Error fetching flowers:", error);
    return [];
  }
}

// Отримати одну квітку за slug
export async function getFlowerBySlug(slug: string): Promise<Product | null> {
  try {
    // Фільтруємо тільки опубліковані записи
    // Використовуємо populate=* для отримання всіх полів включаючи зображення
    const response = await fetch(
      `${API_URL}/flowers?filters[slug][$eq]=${slug}&filters[publishedAt][$notNull]=true&publicationState=live&populate=*`,
      {
        cache: "no-store", // Вимикаємо кеш для діагностики
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch flower: ${response.statusText}`);
    }

    const data: StrapiListResponse<StrapiFlower> = await response.json();

    if (data.data.length === 0) {
      return null;
    }

    const product = convertFlowerToProduct(data.data[0]);
    
    // Діагностика для відлагодження
    if (!product.image && data.data[0].name) {
      console.warn(`⚠️ Product "${data.data[0].name}" has no image:`, {
        hasImageField: !!data.data[0].image,
        imageValue: data.data[0].image,
        slug: slug,
      });
    }
    
    return product;
  } catch (error) {
    console.error("Error fetching flower:", error);
    return null;
  }
}

// Отримати одну квітку за ID
export async function getFlowerById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(
      `${API_URL}/flowers?filters[slug][$eq]=${id}&populate=*`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch flower: ${response.statusText}`);
    }

    const data: StrapiListResponse<StrapiFlower> = await response.json();

    if (data.data.length === 0) {
      return null;
    }

    return convertFlowerToProduct(data.data[0]);
  } catch (error) {
    console.error("Error fetching flower:", error);
    return null;
  }
}

// Пошук квітів за назвою
export async function searchFlowers(query: string): Promise<Product[]> {
  try {
    const response = await fetch(
      `${API_URL}/flowers?filters[name][$containsi]=${query}&populate=*&pagination[pageSize]=100`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search flowers: ${response.statusText}`);
    }

    const data: StrapiListResponse<StrapiFlower> = await response.json();
    return data.data.map(convertFlowerToProduct);
  } catch (error) {
    console.error("Error searching flowers:", error);
    return [];
  }
}

// Отримати детальну інформацію про квітку з описом
export async function getFlowerDetails(slug: string) {
  try {
    const response = await fetch(
      `${API_URL}/flowers?filters[slug][$eq]=${slug}&populate=*`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch flower details: ${response.statusText}`);
    }

    const data: StrapiListResponse<StrapiFlower> = await response.json();

    if (data.data.length === 0) {
      return null;
    }

    const flower = data.data[0];

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
 * Отримати повну інформацію про квітку для редагування (з описом та всіма даними)
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
    const response = await fetch(
      `${API_URL}/flowers/${documentId}?populate=*`,
      {
        cache: "no-store",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch flower: ${response.statusText}`);
    }

    const data: { data: StrapiFlower } = await response.json();
    const flower = data.data;

    return {
      id: flower.id,
      documentId: flower.documentId,
      name: flower.name,
      slug: flower.slug,
      description: flower.description || [],
      image: flower.image,
      variants: flower.variants.map((v) => ({
        id: v.id,
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
    const authHeaders = getAuthHeaders();
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.imageId !== undefined) {
      updateData.image = data.imageId;
    }

    const response = await fetch(`${API_URL}/flowers/${documentId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ data: updateData }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: result.error?.message || "Failed to update flower",
        },
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating flower:", error);
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
    const authHeaders = getAuthHeaders();
    console.log("Auth headers:", authHeaders);
    
    const updateData: any = {};

    if (data.price !== undefined) {
      // Strapi decimal може вимагати рядок або число, переконуємося що це число
      const priceValue = Number(data.price);
      console.log("Price processing:", { original: data.price, converted: priceValue, isNaN: isNaN(priceValue) });
      if (isNaN(priceValue)) {
        console.error("Invalid price value:", data.price);
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
      console.log("Stock processing:", { original: data.stock, converted: stockValue, isNaN: isNaN(stockValue) });
      if (isNaN(stockValue)) {
        console.error("Invalid stock value:", data.stock);
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

    // Перевіряємо, чи є що оновлювати
    if (Object.keys(updateData).length === 0) {
      console.warn("No data to update for variant:", documentId);
      return {
        success: false,
        error: {
          code: "NO_DATA",
          message: "No data provided for update",
        },
      };
    }

    // Діагностика: логуємо що відправляємо
    console.log("Updating variant - sending:", {
      documentId,
      updateData,
      fullPayload: { data: updateData },
      url: `${API_URL}/variants/${documentId}`,
    });

    const response = await fetch(`${API_URL}/variants/${documentId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ data: updateData }),
    });

    // Діагностика: логуємо відповідь
    console.log("Variant update response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update variant";
      try {
        const result = await response.json();
        // Strapi може повертати помилку в різних форматах
        errorMessage = result.error?.message || 
                      result.error?.details?.message || 
                      result.message || 
                      `HTTP ${response.status}: ${response.statusText}`;
        console.error("Variant update error response:", result);
      } catch (parseError) {
        const text = await response.text().catch(() => "");
        errorMessage = `HTTP ${response.status}: ${response.statusText}${text ? ` - ${text}` : ""}`;
        console.error("Failed to parse error response:", parseError);
      }
      
      return {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: errorMessage,
        },
      };
    }

    // Перевіряємо, чи відповідь успішна
    try {
      const result = await response.json();
      console.log("Variant update result:", result);
      
      // Перевіряємо, чи дані дійсно оновилися
      if (result.data) {
        console.log("Updated variant data:", {
          price: result.data.price,
          stock: result.data.stock,
          length: result.data.length,
        });
      }
      
      return {
        success: true,
      };
    } catch (parseError) {
      // Якщо не вдалося розпарсити, але статус OK, вважаємо успішним
      console.warn("Could not parse variant update response, but status is OK");
      return {
        success: true,
      };
    }
  } catch (error) {
    console.error("Error updating variant:", error);
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
// Excel Import
// ============================================

import type { ImportOptions, ImportResponse } from "./import-types";
import { getAuthHeaders } from "./auth";

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

  // Отримуємо заголовки з токеном аутентифікації
  const authHeaders = getAuthHeaders();
  // Для FormData не встановлюємо Content-Type, браузер встановить його автоматично з boundary
  const headers: Record<string, string> = {};
  if (typeof authHeaders === 'object' && authHeaders !== null && 'Authorization' in authHeaders) {
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
// POS Operations
// ============================================

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
export async function confirmPayment(transactionId: string): Promise<ConfirmPaymentResponse> {
  try {
    const response = await fetch(`${API_URL}/pos/transactions/${transactionId}/confirm-payment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
// Customers
// ============================================

interface StrapiCustomer {
  id: number;
  documentId: string;
  name: string;
  type: 'VIP' | 'Regular' | 'Wholesale';
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
    const response = await fetch(
      `${API_URL}/customers?pagination[pageSize]=100&sort=name:asc`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.statusText}`);
    }

    const data: { data: StrapiCustomer[] } = await response.json();
    return data.data.map((c) => ({
      id: c.id,
      documentId: c.documentId,
      name: c.name,
      type: c.type || 'Regular',
      phone: c.phone,
      email: c.email,
      address: c.address,
      totalSpent: Number(c.totalSpent) || 0,
      orderCount: c.orderCount || 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
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
    const response = await fetch(
      `${API_URL}/customers/${documentId}?populate=transactions`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch customer: ${response.statusText}`);
    }

    const data: { data: StrapiCustomer & { transactions?: any[] } } = await response.json();
    const c = data.data;

    return {
      id: c.id,
      documentId: c.documentId,
      name: c.name,
      type: c.type || 'Regular',
      phone: c.phone,
      email: c.email,
      address: c.address,
      totalSpent: Number(c.totalSpent) || 0,
      orderCount: c.orderCount || 0,
      transactions: c.transactions || [],
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

/**
 * Створити нового клієнта
 */
export async function createCustomer(data: CreateCustomerInput): Promise<ApiResponse<Customer>> {
  try {
    const response = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: "CREATE_FAILED",
          message: result.error?.message || "Failed to create customer",
        },
      };
    }

    const c = result.data;
    return {
      success: true,
      data: {
        id: c.id,
        documentId: c.documentId,
        name: c.name,
        type: c.type || 'Regular',
        phone: c.phone,
        email: c.email,
        address: c.address,
        totalSpent: 0,
        orderCount: 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error creating customer:", error);
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
 * Видалити клієнта
 */
export async function deleteCustomer(documentId: string): Promise<ApiResponse<void>> {
  try {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_URL}/customers/${documentId}`, {
      method: "DELETE",
      headers: authHeaders,
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: "DELETE_FAILED",
          message: result.error?.message || "Failed to delete customer",
        },
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting customer:", error);
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
// Analytics
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
export async function getStockLevels(): Promise<ApiResponse<import("./api-types").StockLevel[]>> {
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

/**
 * Отримати транзакції
 */
export async function getTransactions(filters?: TransactionFilters): Promise<ApiResponse<Transaction[]>> {
  try {
    const params = new URLSearchParams();
    params.append("pagination[pageSize]", String(filters?.limit || 100));
    params.append("sort", "date:desc");
    params.append("populate", "customer");

    if (filters?.type) {
      params.append("filters[type][$eq]", filters.type);
    }
    if (filters?.paymentStatus) {
      params.append("filters[paymentStatus][$eq]", filters.paymentStatus);
    }
    if (filters?.customerId) {
      // Спробуємо обидва формати для сумісності з різними версіями Strapi
      // Формат 1: через documentId (Strapi v5)
      params.append("filters[customer][documentId][$eq]", filters.customerId);
      // Формат 2: через id (якщо documentId не працює)
      // params.append("filters[customer][id][$eq]", filters.customerId);
    }
    if (filters?.dateFrom) {
      params.append("filters[date][$gte]", filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append("filters[date][$lte]", filters.dateTo);
    }

    const response = await fetch(`${API_URL}/transactions?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Діагностика: логуємо структуру відповіді
    if (filters?.customerId) {
      console.log('Transactions query result:', {
        hasData: !!result.data,
        dataLength: result.data?.length || 0,
        filters,
        firstItem: result.data?.[0],
      });
    }
    
    return {
      success: true,
      data: result.data || [],
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
// Planned Supply
// ============================================

import type { LowStockVariant, FlowerSearchResult } from "./planned-supply-types";

/**
 * Отримати варіанти з низькими залишками
 */
export async function getLowStockVariants(threshold: number = 100): Promise<ApiResponse<LowStockVariant[]>> {
  try {
    const response = await fetch(`${API_URL}/planned-supply/low-stock?threshold=${threshold}`, {
      cache: "no-store",
    });

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
export async function searchFlowersForSupply(query: string): Promise<ApiResponse<FlowerSearchResult[]>> {
  try {
    const response = await fetch(`${API_URL}/planned-supply/search?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });

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
export async function getAllFlowersForSupply(): Promise<ApiResponse<FlowerSearchResult[]>> {
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
