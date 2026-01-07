/**
 * Customers API
 *
 * CRUD операції для клієнтів (GraphQL + REST)
 */

import { graphqlRequest, API_URL, fetchWithRetry, getAuthHeaders } from './client';
import { convertCustomer } from './converters';
import {
  GET_CUSTOMERS,
  GET_CUSTOMER_BY_ID,
} from '../graphql/queries';
import {
  CREATE_CUSTOMER,
  DELETE_CUSTOMER,
} from '../graphql/mutations';
import type {
  GraphQLCustomer,
  CustomersResponse,
  CustomerResponse,
} from '../graphql/types';
import type {
  Customer,
  CreateCustomerInput,
  ApiResponse,
} from '../api-types';

/**
 * Отримати всіх клієнтів
 */
export async function getCustomers(): Promise<Customer[]> {
  try {
    const data = await graphqlRequest<CustomersResponse>(GET_CUSTOMERS, {
      pageSize: 100,
    });

    return data.customers.map(convertCustomer);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

/**
 * Отримати клієнта за ID
 */
export async function getCustomerById(documentId: string): Promise<Customer | null> {
  try {
    const data = await graphqlRequest<CustomerResponse>(GET_CUSTOMER_BY_ID, {
      documentId,
    });

    if (!data.customer) {
      return null;
    }

    return convertCustomer(data.customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

/**
 * Створити нового клієнта
 */
export async function createCustomer(
  data: CreateCustomerInput
): Promise<ApiResponse<Customer>> {
  try {
    const result = await graphqlRequest<{ createCustomer: GraphQLCustomer }>(
      CREATE_CUSTOMER,
      { data }
    );

    return {
      success: true,
      data: convertCustomer(result.createCustomer),
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to create customer',
      },
    };
  }
}

/**
 * Видалити клієнта
 */
export async function deleteCustomer(documentId: string): Promise<ApiResponse<void>> {
  try {
    await graphqlRequest(DELETE_CUSTOMER, { documentId }, true);

    return { success: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    return {
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to delete customer',
      },
    };
  }
}

/**
 * Оновити баланс клієнта (через REST API)
 * @param documentId - ID клієнта
 * @param balance - нове значення балансу (>0 переплата, <0 борг)
 */
export async function updateCustomerBalance(
  documentId: string,
  balance: number
): Promise<ApiResponse<{ documentId: string; name: string; balance: number }>> {
  try {
    const response = await fetchWithRetry(
      `${API_URL}/pos/customers/${documentId}/balance`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ balance }),
      },
      { retries: 3, backoff: 1000 }
    );

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.error('Error updating customer balance:', error);
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update customer balance',
      },
    };
  }
}
