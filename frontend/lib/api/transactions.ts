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
