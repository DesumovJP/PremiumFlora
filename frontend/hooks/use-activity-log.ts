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
  | 'saleReturn'
  | 'writeOff'
  | 'productEdit'
  | 'productCreate'
  | 'productDelete'
  | 'variantDelete'
  | 'paymentConfirm'
  | 'customerCreate'
  | 'customerDelete'
  | 'balanceEdit'
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
    originalPrice?: number; // Оригінальна ціна, якщо була змінена
    stockBefore?: number;
    stockAfter?: number;
    isCustom?: boolean; // Послуга / інше (не впливає на склад)
    customNote?: string; // Коментар до послуги
  }>;
  totalAmount?: number;
  paidAmount?: number; // Скільки сплачено (для часткової оплати)
  discount?: number;
  paymentStatus?: string;

  // WriteOff
  flowerName?: string;
  length?: number;
  qty?: number;
  price?: number;   // Ціна за одиницю
  amount?: number;  // Загальна сума (price * qty)
  stockBefore?: number; // Залишок до списання
  stockAfter?: number;  // Залишок після списання
  reason?: string;
  notes?: string;

  // Product
  productName?: string;
  productId?: string;
  variantsCount?: number;
  totalStock?: number; // Загальна кількість при видаленні (рахується як списання)
  variants?: Array<{
    length: number;
    price: number;
    stock: number;
  }>;
  changes?: Record<string, { from: unknown; to: unknown }>;

  // Variant delete
  variantLength?: number;
  variantPrice?: number;
  variantStock?: number;

  // Customer
  phone?: string;
  email?: string;
  // Balance edit
  balanceBefore?: number;
  balanceAfter?: number;

  // Payment
  transactionId?: string;
  // amount is shared with WriteOff above
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
  costCalculationMode?: 'simple' | 'full';  // Режим розрахунку собівартості
  // Детальний список змін по товарах
  supplyItems?: Array<{
    flowerName: string;
    length: number | null;
    stockBefore?: number;
    stockAfter: number;
    costPrice?: number;    // Собівартість (для розрахунку вартості поставки)
    priceBefore?: number;
    priceAfter: number;    // Ціна продажу (для балансу)
    isNew: boolean;
    // Деталі повного розрахунку собівартості (якщо використовувався full mode)
    costCalculation?: {
      basePrice: number;           // Базова ціна з Excel
      airPerStem: number;          // Авіа доставка за квітку
      truckPerStem: number;        // Трак за квітку
      transferFeePercent: number;  // Відсоток переказу
      taxPerStem: number;          // Податок за квітку
      fullCost: number;            // Фінальна собівартість
    };
  }>;

  // Sale Return (повернення)
  originalSaleId?: string;        // ID оригінального продажу
  originalSaleDate?: string;      // Дата оригінального продажу
  returnAmount?: number;          // Сума повернення
  returnReason?: string;          // Причина повернення
  // Товари що повертаються (використовуємо items[] з stockBefore/After)
  // Баланс клієнта (використовуємо balanceBefore/After)
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
  totalSalesQty: number;       // Кількість проданих квіток (шт)
  totalSalesPaid: number;      // Оплачені продажі
  totalSalesExpected: number;  // Очікують оплати
  totalReturns: number;        // Кількість повернень
  totalReturnsAmount: number;  // Сума повернень (грн)
  totalReturnsQty: number;     // Кількість повернутих квіток (шт)
  totalWriteOffs: number;
  totalWriteOffsQty: number;
  totalWriteOffsAmount: number; // Сума списань (грн)
  totalSupplies: number;       // Кількість поставок
  totalSuppliesQty: number;    // Кількість поставлених квіток (шт)
  totalSuppliesAmount: number; // Собівартість поставок ($)
  totalSuppliesSaleValue?: number; // Вартість поставок по ціні продажу (₴)
  activitiesCount: number;
  productEdits: number;
  customersCreated: number;
}

interface UseActivityLogReturn {
  activities: Activity[];
  shiftDate: string | null; // YYYY-MM-DD - дата зміни
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
  const [shiftDate, setShiftDate] = useState<string | null>(null);
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
        setShiftDate(shift.shiftDate || null);
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
          const paid = activity.details.paidAmount || 0;
          const status = activity.details.paymentStatus;
          acc.totalSales += 1;
          acc.totalSalesAmount += amount;
          // Рахуємо кількість проданих квіток
          const salesQty = activity.details.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;
          acc.totalSalesQty += salesQty;
          // Без статусу або 'paid' = оплачено
          if (!status || status === 'paid') {
            acc.totalSalesPaid += amount;
          } else if (status === 'expected' || status === 'pending') {
            // Часткова оплата: paidAmount йде в paid, решта в expected
            acc.totalSalesPaid += paid;
            acc.totalSalesExpected += (amount - paid);
          }
          break;
        }
        case 'saleReturn': {
          // Повернення віднімає від продажів
          const returnAmount = activity.details.returnAmount || activity.details.totalAmount || 0;
          const returnPaid = activity.details.paidAmount || 0;
          const originalStatus = activity.details.paymentStatus;

          acc.totalReturns += 1;
          acc.totalReturnsAmount += returnAmount;

          // Віднімаємо від загальних продажів
          acc.totalSalesAmount -= returnAmount;

          // Рахуємо кількість повернутих квіток
          const returnQty = activity.details.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;
          acc.totalReturnsQty += returnQty;
          acc.totalSalesQty -= returnQty;

          // Коригуємо paid/expected залежно від оригінального статусу
          if (!originalStatus || originalStatus === 'paid') {
            // Було повністю сплачено - віднімаємо від оплачених
            acc.totalSalesPaid -= returnAmount;
          } else if (originalStatus === 'expected' || originalStatus === 'pending') {
            // Було частково сплачено або в борг
            acc.totalSalesPaid -= returnPaid;
            acc.totalSalesExpected -= (returnAmount - returnPaid);
          }
          break;
        }
        case 'writeOff': {
          acc.totalWriteOffs += 1;
          const qty = activity.details.qty || 0;
          acc.totalWriteOffsQty += qty;
          acc.totalWriteOffsAmount += activity.details.amount || 0;
          break;
        }
        case 'productEdit':
        case 'variantDelete':
          acc.productEdits += 1;
          break;
        case 'productCreate': {
          acc.productEdits += 1;
          // Якщо створено товар з варіантами зі складом - рахуємо як поставку
          if (activity.details.variants) {
            const totalStock = activity.details.variants.reduce(
              (sum, v) => sum + (v.stock || 0),
              0
            );
            if (totalStock > 0) {
              acc.totalSupplies += 1;
              acc.totalSuppliesQty += totalStock;
              const totalAmount = activity.details.variants.reduce(
                (sum, v) => sum + (v.stock || 0) * (v.price || 0),
                0
              );
              acc.totalSuppliesAmount += totalAmount;
            }
          }
          break;
        }
        case 'productDelete': {
          acc.productEdits += 1;
          // Якщо був залишок - рахуємо як списання
          const deletedStock = activity.details.totalStock || 0;
          if (deletedStock > 0) {
            acc.totalWriteOffs += 1;
            acc.totalWriteOffsQty += deletedStock;
            // Рахуємо суму списання з варіантів (stock * price)
            if (activity.details.variants) {
              const deletedAmount = activity.details.variants.reduce(
                (sum, v) => sum + (v.stock || 0) * (v.price || 0),
                0
              );
              acc.totalWriteOffsAmount += deletedAmount;
            }
          }
          break;
        }
        case 'customerCreate':
          acc.customersCreated += 1;
          break;
        case 'supply': {
          acc.totalSupplies += 1;
          // Рахуємо кількість та суму поставлених квіток (різниця між після і до)
          if (activity.details.supplyItems) {
            for (const item of activity.details.supplyItems) {
              const suppliedQty = (item.stockAfter || 0) - (item.stockBefore || 0);
              acc.totalSuppliesQty += suppliedQty;
              // Використовуємо costPrice (собівартість) для розрахунку вартості поставки
              // Якщо costPrice не вказано, fallback на priceAfter для сумісності
              const unitCost = item.costPrice ?? item.priceAfter ?? 0;
              acc.totalSuppliesAmount += suppliedQty * unitCost;
            }
          }
          break;
        }
      }
      acc.activitiesCount += 1;
      return acc;
    },
    {
      totalSales: 0,
      totalSalesAmount: 0,
      totalSalesQty: 0,
      totalSalesPaid: 0,
      totalSalesExpected: 0,
      totalReturns: 0,
      totalReturnsAmount: 0,
      totalReturnsQty: 0,
      totalWriteOffs: 0,
      totalWriteOffsQty: 0,
      totalWriteOffsAmount: 0,
      totalSupplies: 0,
      totalSuppliesQty: 0,
      totalSuppliesAmount: 0,
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
    shiftDate,
    shiftStartedAt,
    shiftDocumentId,
    summary,
    logActivity,
    refreshActivities,
    isLoading,
    isShiftActive: shiftDocumentId !== null,
  };
}
