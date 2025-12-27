/**
 * Shifts API
 *
 * Операції управління змінами (REST)
 */

import { API_URL, getAuthHeaders, createNetworkError } from './client';
import type { ApiError, ApiResponse } from '../api-types';

// ============================================
// Types
// ============================================

export interface ShiftActivity {
  id: string;
  type: 'sale' | 'writeOff' | 'productEdit' | 'productCreate' | 'productDelete' | 'paymentConfirm' | 'customerCreate' | 'customerDelete' | 'supply' | 'variantDelete';
  timestamp: string;
  details: Record<string, unknown>;
}

export interface ShiftSummary {
  totalSales: number;
  totalSalesAmount: number;
  totalSalesQty?: number;
  totalSalesPaid?: number;
  totalSalesExpected?: number;
  totalWriteOffs: number;
  totalWriteOffsQty: number;
  totalWriteOffsAmount?: number;
  totalSupplies?: number;
  totalSuppliesQty?: number;
  totalSuppliesAmount?: number;
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

// ============================================
// API Functions
// ============================================

/**
 * Отримати або створити поточну активну зміну
 */
export async function getCurrentShift(): Promise<ApiResponse<Shift> & { isNew?: boolean }> {
  try {
    const response = await fetch(`${API_URL}/shifts/current`, {
      cache: 'no-store',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting current shift:', error);
    return createNetworkError();
  }
}

/**
 * Додати активність до поточної зміни
 */
export async function addShiftActivity(
  data: AddActivityInput
): Promise<ApiResponse<Shift> & { idempotent?: boolean }> {
  try {
    const response = await fetch(`${API_URL}/shifts/current/activity`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error adding shift activity:', error);
    return createNetworkError();
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
    console.error('Error closing shift:', error);
    return createNetworkError();
  }
}

/**
 * Отримати список закритих змін
 */
export async function getShifts(
  page: number = 1,
  pageSize: number = 10
): Promise<{
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
      cache: 'no-store',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return createNetworkError();
  }
}
