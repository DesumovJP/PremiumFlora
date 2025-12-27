/**
 * Supply API
 *
 * Операції планування поставок (REST)
 */

import { API_URL, createNetworkError } from './client';
import type { ApiResponse } from '../api-types';
import type { LowStockVariant, FlowerSearchResult } from '../planned-supply-types';

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
        cache: 'no-store',
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching low stock variants:', error);
    return createNetworkError();
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
        cache: 'no-store',
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error searching flowers for supply:', error);
    return createNetworkError();
  }
}

/**
 * Отримати всі квіти з варіантами для запланованої поставки
 */
export async function getAllFlowersForSupply(): Promise<ApiResponse<FlowerSearchResult[]>> {
  try {
    const response = await fetch(`${API_URL}/planned-supply/all-flowers`, {
      cache: 'no-store',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching all flowers for supply:', error);
    return createNetworkError();
  }
}
