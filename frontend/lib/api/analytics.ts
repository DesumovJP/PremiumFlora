/**
 * Analytics API
 *
 * Операції аналітики (REST)
 */

import { API_URL, createNetworkError } from './client';
import type {
  DashboardData,
  StockLevel,
  ApiResponse,
} from '../api-types';

/**
 * Отримати повну аналітику dashboard
 */
export async function getDashboardAnalytics(
  year?: number,
  month?: number
): Promise<ApiResponse<DashboardData>> {
  try {
    const params = new URLSearchParams();
    if (year !== undefined) params.append('year', String(year));
    if (month !== undefined) params.append('month', String(month));

    const queryString = params.toString();
    const url = `${API_URL}/analytics/dashboard${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      cache: 'no-store',
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
    console.error('Error fetching dashboard analytics:', error);
    return createNetworkError();
  }
}

/**
 * Отримати рівні складу
 */
export async function getStockLevels(): Promise<ApiResponse<StockLevel[]>> {
  try {
    const response = await fetch(`${API_URL}/analytics/stock`, {
      cache: 'no-store',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching stock levels:', error);
    return createNetworkError();
  }
}
