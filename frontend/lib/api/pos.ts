/**
 * POS API
 *
 * Операції точки продажу (REST)
 */

import { fetchWithRetry, API_URL, getAuthHeaders, createNetworkErrorWithAlert } from './client';
import type {
  CreateSaleInput,
  WriteOffInput,
  SaleResponse,
  WriteOffResponse,
  ConfirmPaymentResponse,
} from '../api-types';

/**
 * Створити продаж (sale)
 * Використовує retry логіку для надійності
 */
export async function createSale(data: CreateSaleInput): Promise<SaleResponse> {
  try {
    const response = await fetchWithRetry(
      `${API_URL}/pos/sales`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
      { retries: 3, backoff: 1000 }
    );

    return response.json();
  } catch (error) {
    console.error('Error creating sale:', error);
    const errorResponse = createNetworkErrorWithAlert('Failed to connect to server after retries');
    return {
      ...errorResponse,
      success: false,
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
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
      { retries: 3, backoff: 1000 }
    );

    return response.json();
  } catch (error) {
    console.error('Error creating write-off:', error);
    const errorResponse = createNetworkErrorWithAlert('Failed to connect to server after retries');
    return {
      ...errorResponse,
      success: false,
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
        method: 'PUT',
        headers: getAuthHeaders(),
      },
      { retries: 3, backoff: 1000 }
    );

    return response.json();
  } catch (error) {
    console.error('Error confirming payment:', error);
    const errorResponse = createNetworkErrorWithAlert('Failed to connect to server after retries');
    return {
      ...errorResponse,
      success: false,
    };
  }
}
