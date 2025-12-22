"use client";

import { useState, useEffect, useCallback } from "react";
import { graphqlRequest } from "@/lib/graphql/client";
import { GET_TRANSACTIONS } from "@/lib/graphql/queries";
import type { GraphQLTransaction, TransactionsResponse } from "@/lib/graphql/types";
import type { Transaction, TransactionFilters, ApiResponse } from "@/lib/api-types";

// ============================================
// Helper функції
// ============================================

/**
 * Конвертує GraphQL транзакцію в Transaction
 */
function convertTransaction(t: GraphQLTransaction): Transaction {
  return {
    id: 0, // GraphQL не повертає числовий id
    documentId: t.documentId,
    date: t.date,
    type: t.type,
    operationId: t.operationId,
    paymentStatus: t.paymentStatus,
    amount: t.amount,
    items: t.items || [],
    customer: t.customer
      ? {
          id: 0,
          documentId: t.customer.documentId,
          name: t.customer.name,
          type: t.customer.type || "Regular",
          totalSpent: 0,
          orderCount: 0,
          createdAt: "",
          updatedAt: "",
        }
      : undefined,
    paymentDate: t.paymentDate || undefined,
    notes: t.notes || undefined,
    writeOffReason: t.writeOffReason || undefined,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

// ============================================
// Хуки для транзакцій
// ============================================

interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Хук для отримання транзакцій з фільтрами
 */
export function useTransactions(filters?: TransactionFilters): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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

      setTransactions(data.transactions.map(convertTransaction));
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch transactions")
      );
    } finally {
      setLoading(false);
    }
  }, [filters?.type, filters?.paymentStatus, filters?.customerId, filters?.dateFrom, filters?.dateTo, filters?.limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}

// ============================================
// Серверні функції для транзакцій
// ============================================

/**
 * Отримати транзакції з фільтрами
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

    return {
      success: true,
      data: data.transactions.map(convertTransaction),
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      success: false,
      error: {
        code: "FETCH_FAILED",
        message:
          error instanceof Error ? error.message : "Failed to fetch transactions",
      },
    };
  }
}
