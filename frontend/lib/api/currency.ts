/**
 * Currency API
 *
 * Отримання та встановлення курсу валют з бекенду
 */

import { API_URL, fetchWithRetry } from './client';

export interface CurrencyRateInfo {
  rate: number;
  date: string;
  source: 'NBU' | 'cache' | 'fallback' | 'manual';
  cached: boolean;
  isManual: boolean;
}

interface CurrencyResponse {
  success: boolean;
  data: CurrencyRateInfo;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

interface ManualRateResponse {
  success: boolean;
  data: {
    rate: number | null;
    isSet: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Отримати поточний курс USD/UAH
 */
export async function getUsdRate(): Promise<CurrencyRateInfo> {
  const response = await fetchWithRetry(`${API_URL}/currency/usd`, {});

  if (!response.ok) {
    throw new Error(`Failed to fetch USD rate: ${response.status}`);
  }

  const data = await response.json() as CurrencyResponse;

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch USD rate');
  }

  return data.data;
}

/**
 * Встановити ручний курс USD/UAH
 * @param rate - курс (наприклад 41.5), або null щоб скасувати ручний курс
 */
export async function setManualUsdRate(rate: number | null): Promise<CurrencyRateInfo> {
  const response = await fetchWithRetry(`${API_URL}/currency/usd/manual`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rate }),
  });

  if (!response.ok) {
    throw new Error(`Failed to set manual rate: ${response.status}`);
  }

  const data = await response.json() as CurrencyResponse;

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to set manual rate');
  }

  return data.data;
}

/**
 * Отримати поточний ручний курс (якщо встановлено)
 */
export async function getManualUsdRate(): Promise<{ rate: number | null; isSet: boolean }> {
  const response = await fetchWithRetry(`${API_URL}/currency/usd/manual`, {});

  if (!response.ok) {
    throw new Error(`Failed to get manual rate: ${response.status}`);
  }

  const data = await response.json() as ManualRateResponse;

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to get manual rate');
  }

  return data.data;
}

// Backward compatibility (deprecated)
/** @deprecated Use getUsdRate instead */
export const getEurRate = getUsdRate;
