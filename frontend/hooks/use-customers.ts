"use client";

import { useState, useEffect, useCallback } from "react";
import { graphqlRequest } from "@/lib/graphql/client";
import { GET_CUSTOMERS, GET_CUSTOMER_BY_ID } from "@/lib/graphql/queries";
import {
  CREATE_CUSTOMER,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER,
} from "@/lib/graphql/mutations";
import type {
  GraphQLCustomer,
  CustomersResponse,
  CustomerResponse,
  CreateCustomerInput,
} from "@/lib/graphql/types";
import type { Customer, ApiResponse } from "@/lib/api-types";

// ============================================
// Helper функції
// ============================================

/**
 * Конвертує GraphQL клієнта в Customer
 */
function convertCustomer(c: GraphQLCustomer): Customer {
  return {
    id: 0, // GraphQL не повертає числовий id
    documentId: c.documentId,
    name: c.name,
    type: c.type || "Regular",
    phone: c.phone || undefined,
    email: c.email || undefined,
    address: c.address || undefined,
    totalSpent: Number(c.totalSpent) || 0,
    orderCount: c.orderCount || 0,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

// ============================================
// Хуки для клієнтів
// ============================================

interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Хук для отримання всіх клієнтів
 */
export function useCustomers(): UseCustomersResult {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await graphqlRequest<CustomersResponse>(GET_CUSTOMERS, {
        pageSize: 100,
      });

      setCustomers(data.customers.map(convertCustomer));
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch customers"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, error, refetch: fetchCustomers };
}

// ============================================
// Серверні функції для клієнтів
// ============================================

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
    console.error("Error fetching customers:", error);
    return [];
  }
}

/**
 * Отримати клієнта за documentId
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
    console.error("Error fetching customer:", error);
    return null;
  }
}

/**
 * Створити нового клієнта
 */
export async function createCustomer(
  input: CreateCustomerInput
): Promise<ApiResponse<Customer>> {
  try {
    const data = await graphqlRequest<{ createCustomer: GraphQLCustomer }>(
      CREATE_CUSTOMER,
      { data: input }
    );

    return {
      success: true,
      data: convertCustomer(data.createCustomer),
    };
  } catch (error) {
    console.error("Error creating customer:", error);
    return {
      success: false,
      error: {
        code: "CREATE_FAILED",
        message: error instanceof Error ? error.message : "Failed to create customer",
      },
    };
  }
}

/**
 * Видалити клієнта
 */
export async function deleteCustomer(documentId: string): Promise<ApiResponse<void>> {
  try {
    await graphqlRequest(
      DELETE_CUSTOMER,
      { documentId },
      true // requireAuth
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return {
      success: false,
      error: {
        code: "DELETE_FAILED",
        message: error instanceof Error ? error.message : "Failed to delete customer",
      },
    };
  }
}
