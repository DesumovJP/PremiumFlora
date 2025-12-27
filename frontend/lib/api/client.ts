/**
 * API Client Utilities
 *
 * Базові утиліти для HTTP запитів
 */

import { graphqlRequest, STRAPI_URL } from '../graphql/client';
import { getAuthHeaders } from '../auth';

// REST API URL для кастомних ендпоінтів
export const API_URL = `${STRAPI_URL}/api`;

// Re-export для зручності
export { graphqlRequest, STRAPI_URL, getAuthHeaders };

// ============================================
// Retry Logic
// ============================================

export interface RetryOptions {
  retries?: number;
  backoff?: number;
  retryOn?: number[];
}

/**
 * Fetch з автоматичним retry при тимчасових помилках
 * Використовує exponential backoff
 */
export async function fetchWithRetry(
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

/**
 * Створює стандартну помилку мережі
 */
export function createNetworkError(message = 'Failed to connect to server') {
  return {
    success: false as const,
    error: {
      code: 'NETWORK_ERROR',
      message,
    },
  };
}

/**
 * Створює стандартний alert про помилку мережі
 */
export function createNetworkErrorWithAlert(message = 'Failed to connect to server') {
  return {
    ...createNetworkError(message),
    alert: {
      type: 'error' as const,
      title: 'Помилка мережі',
      message: "Не вдалося з'єднатися з сервером. Перевірте підключення та спробуйте ще раз.",
    },
  };
}
