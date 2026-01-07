/**
 * Currency API
 *
 * Отримання курсу валют з бекенду (НБУ)
 */

import { API_URL, fetchWithRetry } from './client';

export interface CurrencyRateInfo {
  rate: number;
  date: string;
  source: 'NBU' | 'cache' | 'fallback';
  cached: boolean;
}

interface CurrencyResponse {
  success: boolean;
  data: CurrencyRateInfo;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Отримати поточний курс EUR/UAH
 */
export async function getEurRate(): Promise<CurrencyRateInfo> {
  const response = await fetchWithRetry(`${API_URL}/currency/eur`);

  if (!response.ok) {
    throw new Error(`Failed to fetch EUR rate: ${response.status}`);
  }

  const data = await response.json() as CurrencyResponse;

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch EUR rate');
  }

  return data.data;
}
