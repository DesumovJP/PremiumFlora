/**
 * Import API
 *
 * Excel імпорт операції (REST)
 */

import { API_URL, getAuthHeaders } from './client';
import type { ImportOptions, ImportResponse } from '../import-types';

/**
 * Імпортувати Excel файл з накладною
 */
export async function importExcel(
  file: File,
  options: ImportOptions = {}
): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append('file', file);

  if (options.dryRun !== undefined) {
    formData.append('dryRun', String(options.dryRun));
  }
  if (options.stockMode) {
    formData.append('stockMode', options.stockMode);
  }
  if (options.awb) {
    formData.append('awb', options.awb);
  }
  if (options.supplier) {
    formData.append('supplier', options.supplier);
  }
  if (options.forceImport !== undefined) {
    formData.append('forceImport', String(options.forceImport));
  }
  // Передаємо оверрайди нормалізації як JSON
  if (options.rowOverrides && Object.keys(options.rowOverrides).length > 0) {
    formData.append('rowOverrides', JSON.stringify(options.rowOverrides));
  }

  const authHeaders = getAuthHeaders();
  const headers: Record<string, string> = {};
  if (
    typeof authHeaders === 'object' &&
    authHeaders !== null &&
    'Authorization' in authHeaders
  ) {
    headers.Authorization = (authHeaders as Record<string, string>).Authorization;
  }

  const response = await fetch(`${API_URL}/imports/excel`, {
    method: 'POST',
    headers,
    body: formData,
  });

  return response.json();
}

/**
 * Оновити ціни продажу для варіантів (batch update)
 */
export async function updateVariantPrices(
  prices: Array<{ documentId: string; price: number }>
): Promise<{ success: boolean; updated: number }> {
  const authHeaders = getAuthHeaders();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (
    typeof authHeaders === 'object' &&
    authHeaders !== null &&
    'Authorization' in authHeaders
  ) {
    headers.Authorization = (authHeaders as Record<string, string>).Authorization;
  }

  const response = await fetch(`${API_URL}/imports/update-prices`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prices }),
  });

  if (!response.ok) {
    throw new Error('Failed to update prices');
  }

  return response.json();
}
