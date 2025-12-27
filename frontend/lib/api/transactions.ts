/**
 * Transactions API
 *
 * Операції для транзакцій (GraphQL)
 */

import { graphqlRequest } from './client';
import { convertTransaction } from './converters';
import { GET_TRANSACTIONS } from '../graphql/queries';
import type { TransactionsResponse } from '../graphql/types';
import type {
  Transaction,
  TransactionFilters,
  ApiResponse,
} from '../api-types';

// Кеш для суми очікуваних оплат (5 хв)
let pendingPaymentsCache: { value: number; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 хвилин

/**
 * Отримати транзакції
 */
export async function getTransactions(
  filters?: TransactionFilters
): Promise<ApiResponse<Transaction[]>> {
  try {
    const variables: Record<string, unknown> = {
      pageSize: filters?.limit || 100,
    };

    if (filters?.type) variables.type = filters.type;
    if (filters?.paymentStatus) variables.paymentStatus = filters.paymentStatus;
    if (filters?.customerId) variables.customerId = filters.customerId;
    if (filters?.dateFrom) variables.dateFrom = filters.dateFrom;
    if (filters?.dateTo) variables.dateTo = filters.dateTo;

    const data = await graphqlRequest<TransactionsResponse>(
      GET_TRANSACTIONS,
      variables
    );

    if (filters?.customerId) {
      console.log('Transactions query result:', {
        hasData: !!data.transactions,
        dataLength: data.transactions?.length || 0,
        filters,
      });
    }

    return {
      success: true,
      data: data.transactions.map(convertTransaction),
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
      },
    };
  }
}

/**
 * Отримати загальну суму очікуваних оплат (з кешуванням)
 */
export async function getPendingPaymentsTotal(forceRefresh = false): Promise<number> {
  // Перевіряємо кеш
  if (!forceRefresh && pendingPaymentsCache) {
    const now = Date.now();
    if (now - pendingPaymentsCache.timestamp < CACHE_TTL) {
      return pendingPaymentsCache.value;
    }
  }

  try {
    // Отримуємо всі транзакції з paymentStatus = 'expected'
    const result = await getTransactions({
      paymentStatus: 'expected',
      limit: 500, // Більший ліміт для точного підрахунку
    });

    if (result.success && result.data) {
      const total = result.data.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      // Зберігаємо в кеш
      pendingPaymentsCache = {
        value: total,
        timestamp: Date.now(),
      };

      return total;
    }

    return 0;
  } catch (error) {
    console.error('Error fetching pending payments total:', error);
    return pendingPaymentsCache?.value || 0;
  }
}

/**
 * Інвалідувати кеш очікуваних оплат (викликати після підтвердження оплати)
 */
export function invalidatePendingPaymentsCache(): void {
  pendingPaymentsCache = null;
}
