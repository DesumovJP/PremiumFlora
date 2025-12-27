/**
 * Customers API
 *
 * CRUD операції для клієнтів (GraphQL)
 */

import { graphqlRequest } from './client';
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
