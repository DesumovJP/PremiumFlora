/**
 * Activity Log Hook
 *
 * Трекінг всіх дій в адмін панелі для історії зміни
 */

import { useState, useCallback, useEffect } from 'react';
import { generateOperationId } from '@/lib/uuid';

// ============================================
// Types
// ============================================

export type ActivityType =
  | 'sale'
  | 'writeOff'
  | 'productEdit'
  | 'productCreate'
  | 'productDelete'
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

  // Customer
  phone?: string;
  email?: string;

  // Payment
  transactionId?: string;
  amount?: number;
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
  totalWriteOffs: number;
  totalWriteOffsQty: number;
  activitiesCount: number;
  productEdits: number;
  customersCreated: number;
}

interface UseActivityLogReturn {
  activities: Activity[];
  shiftStartedAt: string | null;
  summary: ShiftSummary;
  logActivity: (type: ActivityType, details: ActivityDetails) => void;
  clearActivities: () => void;
  getActivitiesForExport: () => Activity[];
  isShiftActive: boolean;
}

// ============================================
// Storage Keys
// ============================================

const STORAGE_KEY = 'pf-shift-activities';
const SHIFT_START_KEY = 'pf-shift-started-at';

// ============================================
// Hook Implementation
// ============================================

export function useActivityLog(): UseActivityLogReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [shiftStartedAt, setShiftStartedAt] = useState<string | null>(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setActivities(JSON.parse(stored));
      }

      const storedStart = sessionStorage.getItem(SHIFT_START_KEY);
      if (storedStart) {
        setShiftStartedAt(storedStart);
      } else {
        // Start new shift
        const now = new Date().toISOString();
        sessionStorage.setItem(SHIFT_START_KEY, now);
        setShiftStartedAt(now);
      }
    } catch (e) {
      console.error('Failed to load activities from storage:', e);
    }
  }, []);

  // Save to sessionStorage when activities change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch (e) {
      console.error('Failed to save activities to storage:', e);
    }
  }, [activities]);

  // Log new activity
  const logActivity = useCallback((type: ActivityType, details: ActivityDetails) => {
    const newActivity: Activity = {
      id: generateOperationId(),
      type,
      timestamp: new Date().toISOString(),
      details,
    };

    setActivities((prev) => [newActivity, ...prev]);
  }, []);

  // Clear all activities (after closing shift)
  const clearActivities = useCallback(() => {
    setActivities([]);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SHIFT_START_KEY);

    // Start new shift immediately
    const now = new Date().toISOString();
    sessionStorage.setItem(SHIFT_START_KEY, now);
    setShiftStartedAt(now);
  }, []);

  // Get activities for export
  const getActivitiesForExport = useCallback(() => {
    return [...activities].reverse(); // Chronological order
  }, [activities]);

  // Calculate summary
  const summary: ShiftSummary = activities.reduce(
    (acc, activity) => {
      switch (activity.type) {
        case 'sale':
          acc.totalSales += 1;
          acc.totalSalesAmount += activity.details.totalAmount || 0;
          break;
        case 'writeOff':
          acc.totalWriteOffs += 1;
          acc.totalWriteOffsQty += activity.details.qty || 0;
          break;
        case 'productEdit':
        case 'productCreate':
        case 'productDelete':
          acc.productEdits += 1;
          break;
        case 'customerCreate':
          acc.customersCreated += 1;
          break;
      }
      acc.activitiesCount += 1;
      return acc;
    },
    {
      totalSales: 0,
      totalSalesAmount: 0,
      totalWriteOffs: 0,
      totalWriteOffsQty: 0,
      activitiesCount: 0,
      productEdits: 0,
      customersCreated: 0,
    }
  );

  return {
    activities,
    shiftStartedAt,
    summary,
    logActivity,
    clearActivities,
    getActivitiesForExport,
    isShiftActive: activities.length > 0 || shiftStartedAt !== null,
  };
}
