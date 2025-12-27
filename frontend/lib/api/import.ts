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
  if (options.priceMode) {
    formData.append('priceMode', options.priceMode);
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
  if (options.applyPriceCalculation !== undefined) {
    formData.append('applyPriceCalculation', String(options.applyPriceCalculation));
  }
  if (options.exchangeRate !== undefined) {
    formData.append('exchangeRate', String(options.exchangeRate));
  }
  if (options.marginMultiplier !== undefined) {
    formData.append('marginMultiplier', String(options.marginMultiplier));
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
