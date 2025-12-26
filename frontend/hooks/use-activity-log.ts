/**
 * Activity Log Hook
 *
 * Трекінг всіх дій в адмін панелі для історії зміни
 * Синхронізація з Strapi для підтримки багатьох пристроїв
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { generateOperationId } from '@/lib/uuid';
import {
  getCurrentShift,
  addShiftActivity,
  type Shift,
  type ShiftActivity,
} from '@/lib/strapi';

// ============================================
// Types
// ============================================

export type ActivityType =
  | 'sale'
  | 'writeOff'
  | 'productEdit'
  | 'productCreate'
  | 'productDelete'
  | 'variantDelete'
  | 'paymentConfirm'
  | 'customerCreate'
  | 'customerDelete'
  | 'supply';

export interface ActivityDetails {
  // Sale
  customerName?: string;
  customerId?: string;
  items?: Array<{
    name: string;
    size: string;
    qty: number;
    price: number;
  }>;
  totalAmount?: number;
  discount?: number;
  paymentStatus?: string;

  // WriteOff
  flowerName?: string;
  length?: number;
  qty?: number;
  reason?: string;
  notes?: string;

  // Product
  productName?: string;
  productId?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;

  // Variant delete
  variantLength?: number;
  variantPrice?: number;
  variantStock?: number;

  // Customer
  phone?: string;
  email?: string;

  // Payment
  transactionId?: string;
  amount?: number;
  orderDate?: string;
  // Payment confirmation items (extended format)
  paymentItems?: Array<{
    name: string;
    qty: number;
    price: number;
    length?: number;
    subtotal?: number;
  }>;

  // Supply
  filename?: string;
  flowersCreated?: number;
  flowersUpdated?: number;
  variantsCreated?: number;
  variantsUpdated?: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  timestamp: string;
  details: ActivityDetails;
}

export interface ShiftSummary {
  totalSales: number;
  totalSalesAmount: number;
  totalSalesPaid: number;      // Оплачені продажі
  totalSalesExpected: number;  // Очікують оплати
  totalWriteOffs: number;
  totalWriteOffsQty: number;
  totalSupplies: number;       // Кількість поставок
  activitiesCount: number;
  productEdits: number;
  customersCreated: number;
}

interface UseActivityLogReturn {
  activities: Activity[];
  shiftStartedAt: string | null;
  shiftDocumentId: string | null;
  summary: ShiftSummary;
  logActivity: (type: ActivityType, details: ActivityDetails) => Promise<void>;
  refreshActivities: () => Promise<void>;
  isLoading: boolean;
  isShiftActive: boolean;
}

// ============================================
// Polling interval (30 seconds)
// ============================================

const POLL_INTERVAL = 30000;

// ============================================
// Hook Implementation
// ============================================

export function useActivityLog(): UseActivityLogReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [shiftStartedAt, setShiftStartedAt] = useState<string | null>(null);
  const [shiftDocumentId, setShiftDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current shift from Strapi
  const fetchCurrentShift = useCallback(async () => {
    try {
      const result = await getCurrentShift();
      if (result.success && result.data) {
        const shift = result.data;
        setActivities((shift.activities || []) as Activity[]);
        setShiftStartedAt(shift.startedAt);
        setShiftDocumentId(shift.documentId);
      }
    } catch (error) {
      console.error('Failed to fetch current shift:', error);
    }
  }, []);

  // Initial load and start polling
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchCurrentShift();
      setIsLoading(false);
    };

    init();

    // Start polling for updates (for multi-device sync)
    pollIntervalRef.current = setInterval(() => {
      fetchCurrentShift();
    }, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchCurrentShift]);

  // Log new activity (sends to Strapi immediately)
  const logActivity = useCallback(async (type: ActivityType, details: ActivityDetails) => {
    const newActivity: Activity = {
      id: generateOperationId(),
      type,
      timestamp: new Date().toISOString(),
      details,
    };

    // Optimistic update
    setActivities((prev) => [newActivity, ...prev]);

    try {
      const result = await addShiftActivity({
        activity: newActivity as ShiftActivity,
      });

      if (result.success && result.data) {
        // Update with server data
        setActivities((result.data.activities || []) as Activity[]);
        if (result.data.startedAt) {
          setShiftStartedAt(result.data.startedAt);
        }
        if (result.data.documentId) {
          setShiftDocumentId(result.data.documentId);
        }
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Revert optimistic update on error
      setActivities((prev) => prev.filter((a) => a.id !== newActivity.id));
    }
  }, []);

  // Refresh activities from server
  const refreshActivities = useCallback(async () => {
    await fetchCurrentShift();
  }, [fetchCurrentShift]);

  // Calculate summary
  // Спочатку збираємо суму підтверджених оплат
  const confirmedPaymentsTotal = activities
    .filter((a) => a.type === 'paymentConfirm')
    .reduce((sum, a) => sum + (a.details.amount || 0), 0);

  const summary: ShiftSummary = activities.reduce(
    (acc, activity) => {
      switch (activity.type) {
        case 'sale': {
          const amount = activity.details.totalAmount || 0;
          const status = activity.details.paymentStatus;
          acc.totalSales += 1;
          acc.totalSalesAmount += amount;
          // Без статусу або 'paid' = оплачено
          if (!status || status === 'paid') {
            acc.totalSalesPaid += amount;
          } else if (status === 'expected' || status === 'pending') {
            acc.totalSalesExpected += amount;
          }
          break;
        }
        case 'writeOff':
          acc.totalWriteOffs += 1;
          acc.totalWriteOffsQty += activity.details.qty || 0;
          break;
        case 'productEdit':
        case 'productCreate':
        case 'productDelete':
        case 'variantDelete':
          acc.productEdits += 1;
          break;
        case 'customerCreate':
          acc.customersCreated += 1;
          break;
        case 'supply':
          acc.totalSupplies += 1;
          break;
      }
      acc.activitiesCount += 1;
      return acc;
    },
    {
      totalSales: 0,
      totalSalesAmount: 0,
      totalSalesPaid: 0,
      totalSalesExpected: 0,
      totalWriteOffs: 0,
      totalWriteOffsQty: 0,
      totalSupplies: 0,
      activitiesCount: 0,
      productEdits: 0,
      customersCreated: 0,
    }
  );

  // Коригуємо суми з урахуванням підтверджених оплат
  // Підтверджені оплати переносимо з "очікується" в "оплачено"
  summary.totalSalesPaid += confirmedPaymentsTotal;
  summary.totalSalesExpected = Math.max(0, summary.totalSalesExpected - confirmedPaymentsTotal);

  return {
    activities,
    shiftStartedAt,
    shiftDocumentId,
    summary,
    logActivity,
    refreshActivities,
    isLoading,
    isShiftActive: shiftDocumentId !== null,
  };
}
