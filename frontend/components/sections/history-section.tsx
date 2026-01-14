/**
 * History Section
 *
 * Відображення історії дій поточної зміни та архіву закритих змін
 */

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatPill } from '@/components/ui/stat-pill';
import { Modal } from '@/components/ui/modal';
import {
  Activity,
  ActivityType,
  ShiftSummary,
} from '@/hooks/use-activity-log';
import { cn } from '@/lib/utils';
import { getShifts, Shift } from '@/lib/strapi';
import { exportShift, exportSaleInvoice, exportReturnInvoice } from '@/lib/export';
import type { Transaction } from '@/lib/api-types';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  PackageMinus,
  Pencil,
  Plus,
  Trash,
  CreditCard,
  UserPlus,
  Truck,
  Download,
  Clock,
  History,
  RefreshCw,
  XCircle,
  Wallet,
  Calendar,
  CalendarDays,
  Warehouse,
  Calculator,
} from 'lucide-react';

// ============================================
// Types
// ============================================

interface HistorySectionProps {
  activities: Activity[];
  shiftDate: string | null; // YYYY-MM-DD
  shiftStartedAt: string | null;
  summary: ShiftSummary;
  inventoryValue?: number; // Поточна вартість запасів
  totalStockItems?: number; // Загальна кількість на складі
  onExportShift: () => void;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
}

type TabType = 'current' | 'archive';

// ============================================
// Activity Icons and Labels
// ============================================

const activityConfig: Record<
  ActivityType,
  { icon: typeof ShoppingBag; label: string; color: string }
> = {
  sale: {
    icon: ShoppingBag,
    label: 'Продаж',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
  },
  saleReturn: {
    icon: RefreshCw,
    label: 'Повернення',
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30',
  },
  writeOff: {
    icon: PackageMinus,
    label: 'Списання',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
  },
  productEdit: {
    icon: Pencil,
    label: 'Редагування товару',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
  },
  productCreate: {
    icon: Plus,
    label: 'Створення товару',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
  },
  productDelete: {
    icon: Trash,
    label: 'Видалення товару',
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30',
  },
  variantDelete: {
    icon: XCircle,
    label: 'Видалення варіанту',
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30',
  },
  paymentConfirm: {
    icon: CreditCard,
    label: 'Підтвердження оплати',
    color: 'text-green-600 bg-green-50 dark:bg-green-900/30',
  },
  customerCreate: {
    icon: UserPlus,
    label: 'Новий клієнт',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
  },
  customerDelete: {
    icon: Trash,
    label: 'Видалення клієнта',
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30',
  },
  balanceEdit: {
    icon: Wallet,
    label: 'Зміна балансу',
    color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30',
  },
  supply: {
    icon: Truck,
    label: 'Поставка',
    color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30',
  },
};

// ============================================
// Helper Functions
// ============================================

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(startIso: string, endIso?: string | null): string {
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} год ${minutes} хв`;
  }
  return `${minutes} хв`;
}

function formatShortDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
  });
}

// ============================================
// Activity Item Component
// ============================================

function ActivityItem({ activity }: { activity: Activity }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  const renderDetails = () => {
    const { details } = activity;

    switch (activity.type) {
      case 'sale':
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Клієнт:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.customerName}</span>
            </div>
            {details.items && details.items.length > 0 && (
              <div className="space-y-1">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Товари:</span>
                <div className="ml-2 space-y-2">
                  {details.items.map((item, idx) => {
                    const origPrice = item.originalPrice ?? item.price;
                    const hasEditedPrice = item.originalPrice != null && item.originalPrice !== item.price;
                    const isDiscount = hasEditedPrice && item.price < origPrice;
                    const isMarkup = hasEditedPrice && item.price > origPrice;
                    const priceDiff = hasEditedPrice ? Math.round((item.price - origPrice) * item.qty) : 0;

                    return (
                      <div key={idx} className="rounded-lg bg-slate-50 dark:bg-admin-surface-elevated p-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            {/* Item name with custom badge */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.isCustom && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                                  Послуга
                                </span>
                              )}
                              <span className="text-xs font-medium dark:text-admin-text-secondary">
                                {item.name}
                              </span>
                            </div>

                            {/* Custom note if present */}
                            {item.customNote && (
                              <div className="mt-0.5 text-[10px] text-slate-500 dark:text-admin-text-muted italic">
                                "{item.customNote}"
                              </div>
                            )}

                            {/* Size, qty, stock info */}
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 dark:text-admin-text-muted">
                              {!item.isCustom && item.size && item.size !== '-' && (
                                <span>{item.size} см</span>
                              )}
                              <span>×{item.qty} шт</span>
                              {!item.isCustom && item.stockBefore !== undefined && item.stockAfter !== undefined && (
                                <span className="text-slate-400">
                                  (залишок: {item.stockBefore}→{item.stockAfter})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price section */}
                          <div className="shrink-0 text-right">
                            <div className="font-semibold text-xs dark:text-admin-text-primary">
                              {Math.round(item.price * item.qty)} грн
                            </div>
                            {hasEditedPrice && (
                              <div className="flex items-center justify-end gap-1 mt-0.5">
                                <span className="text-slate-400 line-through text-[10px]">
                                  {Math.round(item.originalPrice! * item.qty)}
                                </span>
                                <span className={cn(
                                  "text-[10px] font-medium",
                                  isDiscount ? "text-emerald-600" : "text-rose-600"
                                )}>
                                  {isDiscount ? `−${Math.abs(priceDiff)}` : `+${priceDiff}`}
                                </span>
                              </div>
                            )}
                            {/* Per unit price if qty > 1 */}
                            {item.qty > 1 && (
                              <div className="text-[10px] text-slate-400 dark:text-admin-text-muted">
                                {item.price} грн/шт
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {(details.discount || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Знижка:</span>
                <span className="text-rose-600">-{details.discount} грн</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 dark:border-admin-border">
              <span className="font-medium dark:text-admin-text-primary">Сума:</span>
              <span className="font-bold text-emerald-600">{Math.round(details.totalAmount || 0)} грн</span>
            </div>
            {/* Деталізація оплати */}
            {details.paymentStatus === 'paid' ? (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Оплата:</span>
                <span className="text-emerald-600 font-medium">Повністю сплачено</span>
              </div>
            ) : (
              <div className="space-y-1">
                {(details.paidAmount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-admin-text-tertiary">Сплачено:</span>
                    <span className="text-emerald-600 font-medium">{Math.round(details.paidAmount || 0)} грн</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-admin-text-tertiary">В борг:</span>
                  <span className="text-rose-600 font-medium">{Math.round((details.totalAmount || 0) - (details.paidAmount || 0))} грн</span>
                </div>
              </div>
            )}
            {details.notes && (
              <div className="border-t pt-2 dark:border-admin-border">
                <span className="text-slate-500 dark:text-admin-text-tertiary block mb-1">Коментар:</span>
                <span className="text-slate-700 dark:text-admin-text-secondary text-sm">{details.notes}</span>
              </div>
            )}
            {/* Export invoice button */}
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                // Convert activity to Transaction format
                const transaction: Transaction = {
                  id: 0,
                  documentId: activity.id,
                  date: activity.timestamp,
                  type: 'sale',
                  operationId: activity.id,
                  paymentStatus: (details.paymentStatus as 'pending' | 'paid' | 'expected' | 'cancelled') || 'pending',
                  amount: details.totalAmount || 0,
                  items: (details.items || []).map(item => ({
                    flowerSlug: item.isCustom ? 'custom' : '',
                    length: parseInt(item.size) || 0,
                    qty: item.qty,
                    price: item.price,
                    name: item.name,
                    subtotal: item.qty * item.price,
                    ...(item.originalPrice && { originalPrice: item.originalPrice }),
                    ...(item.isCustom && { isCustom: true }),
                    ...(item.customNote && { customNote: item.customNote }),
                  })),
                  customer: details.customerName ? {
                    id: 0,
                    documentId: '',
                    name: details.customerName,
                    type: 'Regular',
                    totalSpent: 0,
                    orderCount: 0,
                    balance: 0,
                    createdAt: '',
                    updatedAt: '',
                  } : undefined,
                  notes: details.notes,
                  createdAt: activity.timestamp,
                  updatedAt: activity.timestamp,
                };
                exportSaleInvoice(transaction);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Експорт накладної
            </Button>
          </div>
        );

      case 'saleReturn': {
        // Підраховуємо кількість повернутих товарів
        const returnedQty = details.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;
        const balanceDiff = (details.balanceAfter ?? 0) - (details.balanceBefore ?? 0);

        return (
          <div className="space-y-3 text-sm">
            {/* Підсумок повернення */}
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20">
              <div className="flex justify-between items-center">
                <span className="text-rose-700 dark:text-rose-300 font-medium">
                  Повернено: {returnedQty} шт
                </span>
                <span className="text-rose-700 dark:text-rose-300 font-semibold">
                  −{Math.round(details.returnAmount || details.totalAmount || 0).toLocaleString()} ₴
                </span>
              </div>
            </div>

            {/* Клієнт */}
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Клієнт:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.customerName}</span>
            </div>

            {/* Оригінальний продаж */}
            {details.originalSaleDate && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Дата продажу:</span>
                <span className="dark:text-admin-text-primary">
                  {new Date(details.originalSaleDate).toLocaleDateString('uk-UA', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}

            {/* Зміна балансу клієнта */}
            {(details.balanceBefore !== undefined || details.balanceAfter !== undefined) && (
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-admin-surface">
                <div className="text-xs text-slate-500 dark:text-admin-text-tertiary mb-1">Баланс клієнта:</div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium",
                    (details.balanceBefore ?? 0) < 0 ? "text-rose-600" : "text-slate-700 dark:text-admin-text-primary"
                  )}>
                    {Math.round(details.balanceBefore ?? 0)} ₴
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className={cn(
                    "font-medium",
                    (details.balanceAfter ?? 0) < 0 ? "text-rose-600" : "text-emerald-600"
                  )}>
                    {Math.round(details.balanceAfter ?? 0)} ₴
                  </span>
                  <span className={cn(
                    "text-xs font-medium ml-auto",
                    balanceDiff > 0 ? "text-emerald-600" : balanceDiff < 0 ? "text-rose-600" : "text-slate-500"
                  )}>
                    ({balanceDiff >= 0 ? '+' : ''}{Math.round(balanceDiff)} ₴)
                  </span>
                </div>
              </div>
            )}

            {/* Товари що повертаються */}
            {details.items && details.items.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Повернуті товари:</span>
                <div className="ml-2 space-y-2">
                  {details.items.map((item, idx) => (
                    <div key={idx} className="rounded-lg bg-rose-50/50 dark:bg-rose-900/10 p-2 border border-rose-100 dark:border-rose-800/30">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Item name with custom badge */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.isCustom && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                                Послуга
                              </span>
                            )}
                            <span className="text-xs font-medium dark:text-admin-text-secondary">
                              {item.name}
                            </span>
                          </div>

                          {/* Custom note if present */}
                          {item.customNote && (
                            <div className="mt-0.5 text-[10px] text-slate-500 dark:text-admin-text-muted italic">
                              "{item.customNote}"
                            </div>
                          )}

                          {/* Size, qty, stock info */}
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 dark:text-admin-text-muted">
                            {!item.isCustom && item.size && item.size !== '-' && (
                              <span>{item.size} см</span>
                            )}
                            <span>×{item.qty} шт</span>
                            {!item.isCustom && (
                              item.stockBefore !== undefined && item.stockAfter !== undefined ? (
                                <span className="text-emerald-600">
                                  (склад: {item.stockBefore}→{item.stockAfter})
                                </span>
                              ) : (
                                <span className="text-emerald-600">
                                  (повернено на склад)
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        {/* Price section */}
                        <div className="shrink-0 text-right">
                          <div className="font-semibold text-xs text-rose-600">
                            −{Math.round(item.price * item.qty)} грн
                          </div>
                          {item.qty > 1 && (
                            <div className="text-[10px] text-slate-400 dark:text-admin-text-muted">
                              {item.price} грн/шт
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Причина повернення */}
            {(details.returnReason || details.notes) && (
              <div className="border-t pt-2 dark:border-admin-border">
                <span className="text-slate-500 dark:text-admin-text-tertiary block mb-1">Причина:</span>
                <span className="text-slate-700 dark:text-admin-text-secondary text-sm italic">
                  {details.returnReason || details.notes}
                </span>
              </div>
            )}

            {/* Експорт накладної повернення */}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                exportReturnInvoice({
                  returnDate: activity.timestamp,
                  originalSaleDate: details.originalSaleDate,
                  originalSaleId: details.originalSaleId,
                  customerName: details.customerName,
                  returnAmount: details.returnAmount || details.totalAmount || 0,
                  balanceBefore: details.balanceBefore,
                  balanceAfter: details.balanceAfter,
                  items: (details.items || []).map(item => ({
                    name: item.name,
                    size: item.size,
                    qty: item.qty,
                    price: item.price,
                    stockBefore: item.stockBefore,
                    stockAfter: item.stockAfter,
                    isCustom: item.isCustom,
                    customNote: item.customNote,
                  })),
                  reason: details.returnReason || details.notes,
                });
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Експорт накладної
            </Button>
          </div>
        );
      }

      case 'writeOff':
        return (
          <div className="space-y-2 text-sm">
            {/* Підсумок списання */}
            {((details.qty || 0) > 0 || (details.amount || 0) > 0) && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <div className="flex justify-between items-center">
                  <span className="text-amber-700 dark:text-amber-300 font-medium">
                    −{details.qty || 0} шт
                  </span>
                  <span className="text-amber-700 dark:text-amber-300 font-semibold">
                    −{Math.round(details.amount || 0).toLocaleString()} ₴
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Товар:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.flowerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Розмір:</span>
              <span className="dark:text-admin-text-primary">{details.length} см</span>
            </div>
            {(details.stockBefore !== undefined || details.stockAfter !== undefined) && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Залишок:</span>
                <span className="dark:text-admin-text-primary">
                  {details.stockBefore ?? '?'} → {details.stockAfter ?? '?'} шт
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Причина:</span>
              <span className="dark:text-admin-text-primary">{details.reason}</span>
            </div>
            {details.notes && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Примітка:</span>
                <span className="text-right dark:text-admin-text-secondary">{details.notes}</span>
              </div>
            )}
          </div>
        );

      case 'productCreate': {
        // Розрахувати підсумки для нового товару
        const createTotals = details.variants?.reduce(
          (acc, v) => ({
            totalQty: acc.totalQty + (v.stock || 0),
            totalValue: acc.totalValue + (v.stock || 0) * (v.price || 0),
          }),
          { totalQty: 0, totalValue: 0 }
        ) || { totalQty: 0, totalValue: 0 };

        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Товар:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.productName}</span>
            </div>

            {/* Підсумок якщо є кількість */}
            {createTotals.totalQty > 0 && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    +{createTotals.totalQty.toLocaleString()} шт
                  </span>
                  <span className="text-blue-700 dark:text-blue-300 font-semibold">
                    +{Math.round(createTotals.totalValue).toLocaleString()} ₴
                  </span>
                </div>
              </div>
            )}

            {details.variants && details.variants.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Варіанти:</span>
                <div className="space-y-1">
                  {details.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-admin-surface text-xs"
                    >
                      <span className="font-medium text-slate-700 dark:text-admin-text-primary">
                        {v.length} см
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {v.price.toLocaleString('uk-UA')} грн
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 dark:text-admin-text-secondary">
                        {v.stock} шт
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'productEdit':
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Товар:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.productName}</span>
            </div>
            {details.variants && details.variants.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Варіанти:</span>
                <div className="space-y-1">
                  {details.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-admin-surface text-xs"
                    >
                      <span className="font-medium text-slate-700 dark:text-admin-text-primary">
                        {v.length} см
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {v.price.toLocaleString('uk-UA')} грн
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 dark:text-admin-text-secondary">
                        {v.stock} шт
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {details.changes && Object.keys(details.changes).length > 0 && (
              <div className="space-y-1">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Зміни:</span>
                <div className="ml-2 space-y-1">
                  {Object.entries(details.changes).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-admin-text-secondary">{key}:</span>
                      <span className="dark:text-admin-text-primary">
                        {String(value.from)} → {String(value.to)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'productDelete': {
        // Розрахувати підсумки для видаленого товару
        const deleteTotals = details.variants?.reduce(
          (acc, v) => ({
            totalQty: acc.totalQty + (v.stock || 0),
            totalValue: acc.totalValue + (v.stock || 0) * (v.price || 0),
          }),
          { totalQty: 0, totalValue: 0 }
        ) || { totalQty: details.totalStock || 0, totalValue: 0 };

        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Товар:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.productName}</span>
            </div>

            {/* Підсумок списання при видаленні */}
            {deleteTotals.totalQty > 0 && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                <div className="flex justify-between items-center">
                  <span className="text-rose-700 dark:text-rose-300 font-medium">
                    −{deleteTotals.totalQty.toLocaleString()} шт
                  </span>
                  <span className="text-rose-700 dark:text-rose-300 font-semibold">
                    −{Math.round(deleteTotals.totalValue).toLocaleString()} ₴
                  </span>
                </div>
              </div>
            )}

            {details.variants && details.variants.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Варіанти ({details.variantsCount || details.variants.length}):</span>
                <div className="space-y-1">
                  {details.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-xs"
                    >
                      <span className="font-medium text-slate-700 dark:text-admin-text-primary">
                        {v.length} см
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {v.price.toLocaleString('uk-UA')} грн
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-rose-600 dark:text-rose-400">
                        {v.stock} шт
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'variantDelete':
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Товар:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Висота:</span>
              <span className="dark:text-admin-text-primary">{details.variantLength} см</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Ціна:</span>
              <span className="dark:text-admin-text-primary">{details.variantPrice} грн</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Кількість на складі:</span>
              <span className="font-medium text-rose-600">{details.variantStock} шт</span>
            </div>
          </div>
        );

      case 'paymentConfirm':
        return (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Клієнт:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Сума оплати:</span>
              <span className="font-bold text-emerald-600">{Math.round(details.amount || 0)} грн</span>
            </div>
            {details.orderDate && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Дата замовлення:</span>
                <span className="dark:text-admin-text-primary">{new Date(details.orderDate).toLocaleDateString('uk-UA')}</span>
              </div>
            )}
            {Array.isArray(details.paymentItems) && details.paymentItems.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-admin-border">
                <p className="text-slate-500 dark:text-admin-text-tertiary mb-2">Товари в замовленні:</p>
                <div className="space-y-1.5 bg-slate-50 dark:bg-admin-surface rounded-lg p-2">
                  {details.paymentItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-slate-700 dark:text-admin-text-secondary">
                        {item.name} {item.length ? `(${item.length} см)` : ''} × {item.qty}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-admin-text-primary">
                        {(item.subtotal || item.price * item.qty).toLocaleString('uk-UA')} грн
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {details.notes && (
              <div className="pt-2 border-t border-slate-100 dark:border-admin-border">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Примітка: </span>
                <span className="text-slate-700 dark:text-admin-text-secondary italic">{details.notes}</span>
              </div>
            )}
          </div>
        );

      case 'customerCreate':
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Ім'я:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.customerName}</span>
            </div>
            {details.phone && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Телефон:</span>
                <span className="dark:text-admin-text-primary">{details.phone}</span>
              </div>
            )}
            {details.email && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Email:</span>
                <span className="dark:text-admin-text-primary">{details.email}</span>
              </div>
            )}
          </div>
        );

      case 'balanceEdit': {
        const balanceBefore = details.balanceBefore ?? 0;
        const balanceAfter = details.balanceAfter ?? 0;
        const diff = balanceAfter - balanceBefore;
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Клієнт:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.customerName}</span>
            </div>
            {/* Підсумок зміни балансу */}
            <div className={cn(
              "p-3 rounded-lg",
              diff > 0
                ? "bg-emerald-50 dark:bg-emerald-900/20"
                : diff < 0
                  ? "bg-rose-50 dark:bg-rose-900/20"
                  : "bg-slate-50 dark:bg-slate-800/50"
            )}>
              <div className="flex justify-between items-center">
                <span className={cn(
                  "font-medium",
                  diff > 0 ? "text-emerald-700 dark:text-emerald-300" :
                  diff < 0 ? "text-rose-700 dark:text-rose-300" :
                  "text-slate-600 dark:text-slate-400"
                )}>
                  {diff > 0 ? '+' : ''}{Math.round(diff)} ₴
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Було:</span>
              <span className={cn(
                "font-medium",
                balanceBefore < 0 ? "text-rose-600" : balanceBefore > 0 ? "text-emerald-600" : "dark:text-admin-text-primary"
              )}>
                {Math.round(balanceBefore)} ₴
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Стало:</span>
              <span className={cn(
                "font-medium",
                balanceAfter < 0 ? "text-rose-600" : balanceAfter > 0 ? "text-emerald-600" : "dark:text-admin-text-primary"
              )}>
                {Math.round(balanceAfter)} ₴
              </span>
            </div>
          </div>
        );
      }

      case 'supply': {
        // Розрахувати підсумки поставки
        const supplyTotals = details.supplyItems?.reduce(
          (acc, item) => {
            const qty = (item.stockAfter || 0) - (item.stockBefore || 0);
            // Для вартості поставки використовуємо costPrice (собівартість)
            const unitCost = (item as { costPrice?: number }).costPrice ?? item.priceAfter ?? 0;
            // Для балансу запасів теж використовуємо собівартість (costPrice)
            const valueBefore = (item.stockBefore || 0) * unitCost;
            const valueAfter = (item.stockAfter || 0) * unitCost;
            return {
              totalQty: acc.totalQty + qty,
              totalValue: acc.totalValue + qty * unitCost,  // Вартість поставки по собівартості
              balanceBefore: acc.balanceBefore + valueBefore,
              balanceAfter: acc.balanceAfter + valueAfter,
            };
          },
          { totalQty: 0, totalValue: 0, balanceBefore: 0, balanceAfter: 0 }
        ) || { totalQty: 0, totalValue: 0, balanceBefore: 0, balanceAfter: 0 };

        return (
          <div className="space-y-3 text-sm">
            {details.filename && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Файл:</span>
                <span className="font-medium dark:text-admin-text-primary">{details.filename}</span>
              </div>
            )}

            {/* Підсумок поставки */}
            {details.supplyItems && details.supplyItems.length > 0 && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    +{supplyTotals.totalQty.toLocaleString()} шт
                  </span>
                  <span className="text-blue-700 dark:text-blue-300 font-semibold">
                    +{Math.round(supplyTotals.totalValue).toLocaleString()} $
                  </span>
                </div>
              </div>
            )}

            {/* Показуємо статистику квітів/варіантів тільки для імпорту з файлу */}
            {details.filename && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-600 dark:text-admin-text-tertiary">
                  Квіти: <span className="font-medium text-emerald-600 dark:text-emerald-400">+{details.flowersCreated || 0}</span>, <span className="font-medium dark:text-admin-text-primary">{details.flowersUpdated || 0} онов.</span>
                </div>
                <div className="text-slate-600 dark:text-admin-text-tertiary">
                  Варіанти: <span className="font-medium text-emerald-600 dark:text-emerald-400">+{details.variantsCreated || 0}</span>, <span className="font-medium dark:text-admin-text-primary">{details.variantsUpdated || 0} онов.</span>
                </div>
              </div>
            )}

            {/* Режим розрахунку собівартості */}
            {details.costCalculationMode === 'full' && (
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  <Calculator className="h-3.5 w-3.5" />
                  Повний розрахунок: база + авіа + трак × переказ + податок
                </div>
              </div>
            )}

            {/* Детальний список товарів */}
            {details.supplyItems && details.supplyItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-admin-border">
                <div className="text-xs font-medium text-slate-500 dark:text-admin-text-tertiary mb-2">
                  Деталі по товарах ({details.supplyItems.length})
                </div>
                <div className="max-h-80 overflow-y-auto space-y-1.5">
                  {details.supplyItems.map((item, idx) => {
                    const costCalc = (item as { costCalculation?: {
                      basePrice: number;
                      airPerStem: number;
                      truckPerStem: number;
                      transferFeePercent: number;
                      taxPerStem: number;
                      fullCost: number;
                    } }).costCalculation;

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "px-2 py-1.5 rounded-lg text-xs",
                          item.isNew
                            ? "bg-emerald-50 dark:bg-emerald-900/20"
                            : "bg-slate-50 dark:bg-admin-surface"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {item.isNew && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium">
                                NEW
                              </span>
                            )}
                            <span className="truncate font-medium dark:text-admin-text-primary">
                              {item.flowerName}
                            </span>
                            {item.length && (
                              <span className="shrink-0 text-slate-400 dark:text-admin-text-muted">
                                {item.length}см
                              </span>
                            )}
                          </div>
                          <div className="shrink-0 text-right flex items-center gap-2">
                            <span className="text-slate-500 dark:text-admin-text-tertiary">
                              {item.stockBefore !== undefined ? (
                                <>
                                  <span className="text-slate-400">{item.stockBefore}</span>
                                  <span className="mx-1">→</span>
                                </>
                              ) : null}
                              <span className="font-medium text-slate-700 dark:text-admin-text-primary">
                                {item.stockAfter}
                              </span>
                              <span className="text-slate-400 ml-0.5">шт</span>
                            </span>
                            {/* Показуємо costPrice (собівартість в USD) */}
                            {((item as { costPrice?: number }).costPrice ?? 0) > 0 && (
                              <span className={cn(
                                "font-medium",
                                costCalc
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-500 dark:text-slate-400"
                              )} title="Собівартість (закупка)">
                                {(item as { costPrice?: number }).costPrice?.toFixed(2)} $
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Деталі розрахунку собівартості */}
                        {costCalc && (
                          <div className="mt-1.5 pt-1.5 border-t border-emerald-200/50 dark:border-emerald-700/30 text-[10px] text-emerald-700 dark:text-emerald-400">
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                              <span>База: {costCalc.basePrice.toFixed(2)}$</span>
                              <span>+ Авіа: {costCalc.airPerStem.toFixed(2)}$</span>
                              <span>+ Трак: {costCalc.truckPerStem.toFixed(2)}$</span>
                              <span>× {(1 + costCalc.transferFeePercent / 100).toFixed(3)}</span>
                              <span>+ Под: {costCalc.taxPerStem.toFixed(2)}$</span>
                              <span className="font-medium">= {costCalc.fullCost.toFixed(2)}$</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return (
          <div className="text-sm text-slate-500 dark:text-admin-text-tertiary">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        );
    }
  };

  // Get summary text for collapsed state
  const getSummaryText = (): string => {
    const { details } = activity;
    switch (activity.type) {
      case 'sale': {
        const total = Math.round(details.totalAmount || 0);
        const paid = Math.round(details.paidAmount || 0);
        const debt = total - paid;
        if (details.paymentStatus === 'paid') {
          return `${details.customerName} - ${total} грн (сплачено)`;
        }
        if (paid > 0) {
          return `${details.customerName} - ${total} грн (сплачено ${paid}, в борг ${debt})`;
        }
        return `${details.customerName} - ${total} грн (в борг)`;
      }
      case 'saleReturn': {
        const returnAmount = Math.round(details.returnAmount || details.totalAmount || 0);
        return `${details.customerName} - повернення ${returnAmount} грн`;
      }
      case 'writeOff':
        return `${details.flowerName} (${details.length} см) - ${details.qty} шт`;
      case 'productEdit':
      case 'productCreate':
      case 'productDelete':
        return details.productName || '';
      case 'variantDelete':
        return `${details.productName} - ${details.variantLength} см`;
      case 'paymentConfirm':
        return `${details.customerName} - ${Math.round(details.amount || 0)} грн`;
      case 'customerCreate':
        return details.customerName || '';
      case 'customerDelete':
        return details.customerName || '';
      case 'balanceEdit': {
        const diff = (details.balanceAfter ?? 0) - (details.balanceBefore ?? 0);
        return `${details.customerName} ${diff >= 0 ? '+' : ''}${Math.round(diff)} ₴`;
      }
      case 'supply':
        return details.productName || details.filename || 'Імпорт';
      default:
        return '';
    }
  };

  return (
    <div className="border-b border-slate-100 dark:border-admin-border last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left bg-white dark:bg-admin-surface hover:bg-slate-50 dark:hover:bg-[var(--admin-border-subtle)] transition-colors"
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            config.color
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 dark:text-admin-text-primary">
              {config.label}
            </span>
            <span className="text-xs text-slate-400 dark:text-admin-text-muted">
              {formatTime(activity.timestamp)}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-admin-text-tertiary truncate">
            {getSummaryText()}
          </p>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 animate-fade-in">
          <div className="rounded-lg border border-slate-100 dark:border-admin-border bg-slate-50/70 dark:bg-admin-surface-elevated p-3">
            {renderDetails()}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-admin-surface mb-4">
        <History className="h-8 w-8 text-slate-400 dark:text-admin-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-admin-text-primary mb-1">
        Поки що пусто
      </h3>
      <p className="text-sm text-slate-500 dark:text-admin-text-tertiary max-w-xs">
        Тут буде відображатись історія всіх дій поточної зміни: продажі, списання, редагування товарів
      </p>
    </div>
  );
}

// ============================================
// Calendar Component
// ============================================

interface CalendarProps {
  shifts: Shift[];
  onSelectShift: (shift: Shift) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

function ShiftCalendar({ shifts, onSelectShift, currentMonth, onMonthChange }: CalendarProps) {
  const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
  const MONTHS = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  // Get first day of month and total days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Get day of week for first day (0 = Sunday, convert to Monday-based)
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6;

  // Create map of shifts by date
  // Use shiftDate (YYYY-MM-DD) if available, fallback to startedAt
  const shiftsByDate = new Map<string, Shift[]>();
  shifts.forEach(shift => {
    // For the new auto-shift system, use shiftDate field
    const dateKey = shift.shiftDate
      ? new Date(shift.shiftDate + 'T00:00:00').toDateString()
      : new Date(shift.startedAt).toDateString();
    const existing = shiftsByDate.get(dateKey) || [];
    existing.push(shift);
    shiftsByDate.set(dateKey, existing);
  });

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const prevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold dark:text-admin-text-primary">
          {MONTHS[month]} {year}
        </h3>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-slate-200 dark:border-admin-border overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 bg-slate-50 dark:bg-admin-surface-elevated">
          {DAYS.map(day => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-slate-500 dark:text-admin-text-tertiary"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 bg-white dark:bg-admin-surface">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-20 border-t border-r border-slate-100 dark:border-admin-border last:border-r-0"
                />
              );
            }

            const date = new Date(year, month, day);
            const dateKey = date.toDateString();
            const dayShifts = shiftsByDate.get(dateKey) || [];
            const hasShifts = dayShifts.length > 0;
            const isToday = isCurrentMonth && day === today.getDate();

            return (
              <div
                key={day}
                onClick={hasShifts ? () => onSelectShift(dayShifts[0]) : undefined}
                className={cn(
                  'h-20 p-1 border-t border-r border-slate-100 dark:border-admin-border last:border-r-0 relative transition-colors',
                  hasShifts && 'bg-emerald-50/50 dark:bg-emerald-900/10 cursor-pointer hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30'
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded-full text-xs leading-none',
                    isToday && 'bg-emerald-600 text-white font-bold',
                    !isToday && 'text-slate-700 dark:text-admin-text-primary'
                  )}
                >
                  {day}
                </span>
                {hasShifts && (
                  <div className="mt-0.5 space-y-[1px]">
                    {dayShifts.slice(0, 1).map((shift) => {
                      // Підраховуємо суму поставок з activities (з supplyItems)
                      const supplyAmount = (shift.activities || [])
                        .filter((a: any) => a.type === 'supply')
                        .reduce((sum: number, a: any) => {
                          const items = (a.details as any)?.supplyItems || [];
                          return sum + items.reduce((itemSum: number, item: any) => {
                            const qty = (item.stockAfter || 0) - (item.stockBefore || 0);
                            // Використовуємо costPrice для вартості поставки
                            const unitCost = item.costPrice ?? item.priceAfter ?? 0;
                            return itemSum + qty * unitCost;
                          }, 0);
                        }, 0);

                      // Підраховуємо суму списань з activities
                      const writeOffAmount = (shift.activities || [])
                        .filter((a: any) => a.type === 'writeOff' || a.type === 'productDelete')
                        .reduce((sum: number, a: any) => {
                          if (a.type === 'writeOff') {
                            return sum + ((a.details as any)?.amount || 0);
                          }
                          // productDelete - рахуємо вартість видалених варіантів
                          const variants = (a.details as any)?.variants || [];
                          return sum + variants.reduce((vSum: number, v: any) =>
                            vSum + (v.stock || 0) * (v.price || 0), 0);
                        }, 0);
                      
                      return (
                        <div
                          key={shift.documentId}
                          className="w-full flex flex-col items-center space-y-[1px]"
                        >
                          {/* Виручка - просто число без "грн" */}
                          <div className="text-[9px] leading-tight px-1 py-[1px] rounded bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 inline-block text-center">
                            {Math.round(shift.totalSalesAmount).toLocaleString()}
                          </div>
                          {/* Поставка - синій квадратик */}
                          {supplyAmount > 0 && (
                            <div className="text-[9px] leading-tight px-1 py-[1px] rounded bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 inline-block text-center">
                              {Math.round(supplyAmount).toLocaleString()}
                            </div>
                          )}
                          {/* Списання - червоний квадратик */}
                          {writeOffAmount > 0 && (
                            <div className="text-[9px] leading-tight px-1 py-[1px] rounded bg-rose-100 dark:bg-rose-800/50 text-rose-700 dark:text-rose-300 inline-block text-center">
                              {Math.round(writeOffAmount).toLocaleString()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {dayShifts.length > 1 && (
                      <span className="text-[8px] text-slate-500 px-0.5 leading-tight">
                        +{dayShifts.length - 1}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Shift Detail Modal Component
// ============================================

interface ShiftDetailModalProps {
  shift: Shift | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (shift: Shift) => void;
}

function ShiftDetailModal({ shift, open, onOpenChange, onExport }: ShiftDetailModalProps) {
  if (!shift) return null;

  const activities = (shift.activities || []) as Activity[];

  // Підраховуємо paid/expected/supplies/returns з activities
  let totalSalesPaid = 0;
  let totalSalesExpected = 0;
  let totalSupplies = 0;
  let confirmedPaymentsTotal = 0;
  let totalReturns = 0;
  let totalReturnsAmount = 0;
  let totalReturnsQty = 0;

  activities.forEach((a) => {
    if (a.type === 'sale') {
      const amount = a.details.totalAmount || 0;
      const paid = a.details.paidAmount || 0;
      const status = a.details.paymentStatus;
      if (!status || status === 'paid') {
        totalSalesPaid += amount;
      } else if (status === 'expected' || status === 'pending') {
        // Часткова оплата: paidAmount йде в paid, решта в expected
        totalSalesPaid += paid;
        totalSalesExpected += (amount - paid);
      }
    } else if (a.type === 'saleReturn') {
      // Повернення
      const returnAmount = a.details.returnAmount || a.details.totalAmount || 0;
      const returnPaid = a.details.paidAmount || 0;
      const originalStatus = a.details.paymentStatus;
      totalReturns += 1;
      totalReturnsAmount += returnAmount;
      totalReturnsQty += a.details.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;
      // Віднімаємо від paid/expected
      if (!originalStatus || originalStatus === 'paid') {
        totalSalesPaid -= returnAmount;
      } else if (originalStatus === 'expected' || originalStatus === 'pending') {
        totalSalesPaid -= returnPaid;
        totalSalesExpected -= (returnAmount - returnPaid);
      }
    } else if (a.type === 'supply') {
      totalSupplies += 1;
    } else if (a.type === 'paymentConfirm') {
      confirmedPaymentsTotal += a.details.amount || 0;
    }
  });

  // Коригуємо суми з урахуванням підтверджених оплат
  totalSalesPaid += confirmedPaymentsTotal;
  totalSalesExpected = Math.max(0, totalSalesExpected - confirmedPaymentsTotal);

  // Підраховуємо нові поля з activities
  let totalSalesQty = 0;
  let totalWriteOffsQty = 0;
  let totalWriteOffsAmount = 0;
  let totalSuppliesQty = 0;
  let totalSuppliesAmount = 0; // Собівартість ($)
  let totalSuppliesSaleValue = 0; // Ціна продажу (₴)
  let totalSalesAmount = 0;

  activities.forEach((a) => {
    if (a.type === 'sale') {
      totalSalesAmount += a.details.totalAmount || 0;
      if (a.details.items) {
        totalSalesQty += a.details.items.reduce((sum, item) => sum + (item.qty || 0), 0);
      }
    } else if (a.type === 'saleReturn') {
      // Віднімаємо повернення від продажів
      totalSalesAmount -= a.details.returnAmount || a.details.totalAmount || 0;
      totalSalesQty -= a.details.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;
    } else if (a.type === 'writeOff') {
      totalWriteOffsQty += a.details.qty || 0;
      totalWriteOffsAmount += a.details.amount || 0;
    } else if (a.type === 'productDelete') {
      const stock = a.details.totalStock || 0;
      totalWriteOffsQty += stock;
      if (a.details.variants) {
        totalWriteOffsAmount += a.details.variants.reduce(
          (sum, v) => sum + (v.stock || 0) * (v.price || 0),
          0
        );
      }
    } else if (a.type === 'supply' && a.details.supplyItems) {
      for (const item of a.details.supplyItems) {
        const suppliedQty = (item.stockAfter || 0) - (item.stockBefore || 0);
        totalSuppliesQty += suppliedQty;
        // Собівартість ($)
        const unitCost = (item as { costPrice?: number }).costPrice ?? 0;
        totalSuppliesAmount += suppliedQty * unitCost;
        // Ціна продажу (₴) - якщо відсутня, розраховуємо з costPrice
        const USD_RATE = 41.5; // Приблизний курс для старих записів
        const salePrice = item.priceAfter && item.priceAfter > 0
          ? item.priceAfter
          : unitCost * 1.10 * USD_RATE; // costPrice × 1.10 × курс
        totalSuppliesSaleValue += suppliedQty * salePrice;
      }
    } else if (a.type === 'productCreate' && a.details.variants) {
      // Створення товару з варіантами зі складом - рахуємо як поставку
      const variants = a.details.variants as Array<{ stock?: number; price?: number; costPrice?: number }>;
      const createdStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      if (createdStock > 0) {
        totalSuppliesQty += createdStock;
        // Для створення товару використовуємо price як ціну продажу
        totalSuppliesSaleValue += variants.reduce((sum, v) => sum + (v.stock || 0) * (v.price || 0), 0);
        // Собівартість якщо є
        totalSuppliesAmount += variants.reduce((sum, v) => sum + (v.stock || 0) * (v.costPrice || 0), 0);
      }
    }
  });

  const summary: ShiftSummary = {
    totalSales: shift.summary?.totalSales ?? shift.totalSales ?? 0,
    totalSalesAmount: shift.summary?.totalSalesAmount ?? totalSalesAmount ?? shift.totalSalesAmount ?? 0,
    totalSalesQty: shift.summary?.totalSalesQty ?? totalSalesQty,
    totalSalesPaid: shift.summary?.totalSalesPaid ?? totalSalesPaid,
    totalSalesExpected: shift.summary?.totalSalesExpected ?? totalSalesExpected,
    totalReturns: shift.summary?.totalReturns ?? totalReturns,
    totalReturnsAmount: shift.summary?.totalReturnsAmount ?? totalReturnsAmount,
    totalReturnsQty: shift.summary?.totalReturnsQty ?? totalReturnsQty,
    totalWriteOffs: shift.summary?.totalWriteOffs ?? shift.totalWriteOffs ?? 0,
    totalWriteOffsQty: shift.summary?.totalWriteOffsQty ?? totalWriteOffsQty,
    totalWriteOffsAmount: shift.summary?.totalWriteOffsAmount ?? totalWriteOffsAmount,
    totalSupplies: totalSupplies,
    totalSuppliesQty: totalSuppliesQty,
    totalSuppliesAmount: totalSuppliesAmount,
    totalSuppliesSaleValue: totalSuppliesSaleValue,
    activitiesCount: shift.summary?.activitiesCount ?? activities.length,
    productEdits: shift.summary?.productEdits ?? 0,
    customersCreated: shift.summary?.customersCreated ?? 0,
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Зміна ${formatShortDate(shift.startedAt)}`}
      description={
        <span className="flex items-center gap-1 sm:gap-2">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
          <span className="whitespace-nowrap">{formatDateTime(shift.startedAt)}</span>
          <span className="shrink-0">—</span>
          <span className="whitespace-nowrap">{shift.closedAt ? formatDateTime(shift.closedAt) : 'Активна'}</span>
          <span className="text-emerald-600 font-medium whitespace-nowrap">
            ({formatDuration(shift.startedAt, shift.closedAt)})
          </span>
        </span>
      }
      size="lg"
      showClose={false}
      headerActions={
        <Button
          variant="outline"
          className="text-slate-500 dark:text-admin-text-tertiary"
          onClick={() => onExport(shift)}
          size="icon"
          title="Експортувати"
        >
          <Download className="h-4 w-4" />
        </Button>
      }
      footer={
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="flex-1 sm:flex-initial"
        >
          Закрити
        </Button>
      }
      fullscreenOnMobile
    >
      <div className="space-y-4 flex flex-col flex-1 min-h-0">
        {/* Summary Stats */}
        <div className="rounded-xl border border-slate-100 dark:border-admin-border bg-slate-50/50 dark:bg-admin-surface-elevated p-4 shrink-0">
          <h4 className="font-semibold text-slate-900 dark:text-admin-text-primary mb-3">
            Підсумок зміни
          </h4>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {/* Продажі */}
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Продажі</p>
              <p className="font-bold text-emerald-700 dark:text-emerald-300">
                {Math.round(summary.totalSalesAmount || 0).toLocaleString()} ₴
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                {summary.totalSalesQty || 0} шт
              </p>
              {/* Повернення */}
              {(summary.totalReturns || 0) > 0 && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">
                  −{Math.round(summary.totalReturnsAmount || 0).toLocaleString()} ₴ ({summary.totalReturns})
                </p>
              )}
            </div>
            {/* Списання */}
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-2">
              <p className="text-xs text-amber-600 dark:text-amber-400">Списання</p>
              <p className="font-bold text-amber-700 dark:text-amber-300">
                {Math.round(summary.totalWriteOffsAmount || 0).toLocaleString()} ₴
              </p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                {summary.totalWriteOffsQty || 0} шт · {summary.totalWriteOffs || 0} операцій
              </p>
            </div>
            {/* Поставки */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2">
              <p className="text-xs text-blue-600 dark:text-blue-400">Поставки</p>
              <div className="flex items-baseline gap-2">
                <p className="font-bold text-blue-700 dark:text-blue-300">
                  {Math.round(summary.totalSuppliesAmount || 0).toLocaleString()} $
                </p>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                  → {Math.round(summary.totalSuppliesSaleValue || 0).toLocaleString()} ₴
                </p>
              </div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                {summary.totalSuppliesQty || 0} шт · собівартість → ціна продажу
              </p>
            </div>
          </div>
        </div>

        {/* Activities List - займає вільне місце */}
        <div className="rounded-xl border border-slate-100 dark:border-admin-border bg-white dark:bg-admin-surface overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="px-4 py-2 bg-slate-50 dark:bg-admin-surface-elevated border-b border-slate-100 dark:border-admin-border shrink-0">
            <span className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">
              Дії ({activities.length})
            </span>
          </div>
          {activities.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-admin-text-tertiary">
              Немає записів
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// Archive Tab Component
// ============================================

interface ArchiveTabProps {
  onExportShift: (shift: Shift) => void;
}

function ArchiveTab({ onExportShift }: ArchiveTabProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadShifts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load all shifts for calendar view (including active ones)
      const result = await getShifts(1, 100);
      if (result.success && result.data) {
        // Show all shifts - both active and closed
        // The new system creates shifts automatically by date
        setShifts(result.data);
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const handleSelectShift = (shift: Shift) => {
    setSelectedShift(shift);
    setModalOpen(true);
  };

  const handleExportShift = (shift: Shift) => {
    onExportShift(shift);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-admin-surface mb-4">
          <CalendarDays className="h-8 w-8 text-slate-400 dark:text-admin-text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-admin-text-primary mb-1">
          Історія змін порожня
        </h3>
        <p className="text-sm text-slate-500 dark:text-admin-text-tertiary max-w-xs">
          Тут відображатиметься календар з усіма змінами
        </p>
      </div>
    );
  }

  // Масив назв місяців
  const MONTHS = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  // Фільтруємо зміни за поточний місяць календаря
  const shiftsInMonth = shifts.filter(shift => {
    // Use shiftDate field if available for accurate filtering
    const date = shift.shiftDate
      ? new Date(shift.shiftDate + 'T00:00:00')
      : new Date(shift.startedAt);
    return date.getMonth() === currentMonth.getMonth() &&
           date.getFullYear() === currentMonth.getFullYear();
  });

  // Функція експорту місячного звіту
  const handleExportMonthSummary = () => {
    if (shiftsInMonth.length === 0) return;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = MONTHS[month];

    // Агрегуємо дані по днях
    const dailyData: Record<number, { sales: number; writeOffs: number; supplies: number }> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      dailyData[day] = { sales: 0, writeOffs: 0, supplies: 0 };
    }

    shiftsInMonth.forEach(shift => {
      // Use shiftDate field for accurate day aggregation
      const date = shift.shiftDate
        ? new Date(shift.shiftDate + 'T00:00:00')
        : new Date(shift.startedAt);
      const day = date.getDate();

      // Додаємо продажі
      dailyData[day].sales += shift.totalSalesAmount || 0;

      // Рахуємо списання та поставки з activities
      (shift.activities || []).forEach((a: Activity) => {
        if (a.type === 'writeOff') {
          dailyData[day].writeOffs += (a.details as { amount?: number })?.amount || 0;
        } else if (a.type === 'productDelete') {
          // Видалення товару зі складом - рахуємо як списання
          const variants = (a.details as { variants?: Array<{ stock?: number; price?: number }> })?.variants || [];
          dailyData[day].writeOffs += variants.reduce((sum, v) => sum + (v.stock || 0) * (v.price || 0), 0);
        } else if (a.type === 'supply') {
          // Поставка - рахуємо з supplyItems
          const items = (a.details as { supplyItems?: Array<{ stockBefore?: number; stockAfter?: number; costPrice?: number; priceAfter?: number }> })?.supplyItems || [];
          dailyData[day].supplies += items.reduce((sum, item) => {
            const qty = (item.stockAfter || 0) - (item.stockBefore || 0);
            // Використовуємо costPrice для вартості поставки
            const unitCost = item.costPrice ?? item.priceAfter ?? 0;
            return sum + qty * unitCost;
          }, 0);
        } else if (a.type === 'productCreate') {
          // Створення товару з залишком - рахуємо як поставку
          const variants = (a.details as { variants?: Array<{ stock?: number; price?: number }> })?.variants || [];
          dailyData[day].supplies += variants.reduce((sum, v) => sum + (v.stock || 0) * (v.price || 0), 0);
        }
      });
    });

    // Формуємо CSV
    let csv = 'День,Продажі (грн),Списання (грн),Поставки (грн)\n';
    let totalSales = 0, totalWriteOffs = 0, totalSupplies = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const { sales, writeOffs, supplies } = dailyData[day];
      csv += `${day},${Math.round(sales)},${Math.round(writeOffs)},${Math.round(supplies)}\n`;
      totalSales += sales;
      totalWriteOffs += writeOffs;
      totalSupplies += supplies;
    }

    csv += `\nВСЬОГО,${Math.round(totalSales)},${Math.round(totalWriteOffs)},${Math.round(totalSupplies)}\n`;

    // Завантажуємо файл
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Звіт_${monthName}_${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <ShiftCalendar
        shifts={shifts}
        onSelectShift={handleSelectShift}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      {/* Кнопка експорту місячного звіту - по центру під календарем */}
      {shiftsInMonth.length > 0 && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={handleExportMonthSummary}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Експортувати звіт за {MONTHS[currentMonth.getMonth()]}</span>
            <span className="sm:hidden">Експорт {MONTHS[currentMonth.getMonth()]}</span>
          </Button>
        </div>
      )}

      <ShiftDetailModal
        shift={selectedShift}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onExport={handleExportShift}
      />
    </>
  );
}

// ============================================
// Main Component
// ============================================

export function HistorySection({
  activities,
  shiftDate,
  shiftStartedAt,
  summary,
  inventoryValue = 0,
  totalStockItems = 0,
  onExportShift,
  onRefresh,
  isLoading = false,
}: HistorySectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Форматування дати зміни
  const formatShiftDateDisplay = (dateStr: string | null): string => {
    if (!dateStr) return 'Сьогодні';
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const shiftDay = new Date(date);
    shiftDay.setHours(0, 0, 0, 0);

    if (shiftDay.getTime() === today.getTime()) {
      return 'Сьогодні';
    }

    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportArchivedShift = (shift: Shift) => {
    const shiftActivities = (shift.activities || []) as Activity[];
    // Підраховуємо paid/expected/supplies/returns та нові поля з activities для архівних змін
    let totalSalesPaid = 0;
    let totalSalesExpected = 0;
    let totalSupplies = 0;
    let confirmedPaymentsTotal = 0;
    let totalSalesQty = 0;
    let totalSalesAmount = 0;
    let totalReturns = 0;
    let totalReturnsAmount = 0;
    let totalReturnsQty = 0;
    let totalWriteOffsQty = 0;
    let totalWriteOffsAmount = 0;
    let totalSuppliesQty = 0;
    let totalSuppliesAmount = 0; // Собівартість ($)
    let totalSuppliesSaleValue = 0; // Ціна продажу (₴)

    shiftActivities.forEach((a) => {
      if (a.type === 'sale') {
        const amount = a.details.totalAmount || 0;
        const paid = a.details.paidAmount || 0;
        const status = a.details.paymentStatus;
        totalSalesAmount += amount;
        if (!status || status === 'paid') {
          totalSalesPaid += amount;
        } else if (status === 'expected' || status === 'pending') {
          // Часткова оплата: paidAmount йде в paid, решта в expected
          totalSalesPaid += paid;
          totalSalesExpected += (amount - paid);
        }
        if (a.details.items) {
          totalSalesQty += a.details.items.reduce((sum, item) => sum + (item.qty || 0), 0);
        }
      } else if (a.type === 'saleReturn') {
        // Повернення
        const returnAmount = a.details.returnAmount || a.details.totalAmount || 0;
        const returnPaid = a.details.paidAmount || 0;
        const originalStatus = a.details.paymentStatus;
        totalReturns += 1;
        totalReturnsAmount += returnAmount;
        totalSalesAmount -= returnAmount;
        const returnQty = a.details.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;
        totalReturnsQty += returnQty;
        totalSalesQty -= returnQty;
        // Віднімаємо від paid/expected
        if (!originalStatus || originalStatus === 'paid') {
          totalSalesPaid -= returnAmount;
        } else if (originalStatus === 'expected' || originalStatus === 'pending') {
          totalSalesPaid -= returnPaid;
          totalSalesExpected -= (returnAmount - returnPaid);
        }
      } else if (a.type === 'supply') {
        totalSupplies += 1;
        if (a.details.supplyItems) {
          for (const item of a.details.supplyItems) {
            const suppliedQty = (item.stockAfter || 0) - (item.stockBefore || 0);
            totalSuppliesQty += suppliedQty;
            // Собівартість ($)
            const unitCost = (item as { costPrice?: number }).costPrice ?? 0;
            totalSuppliesAmount += suppliedQty * unitCost;
            // Ціна продажу (₴) - якщо відсутня, розраховуємо з costPrice
            const USD_RATE = 41.5; // Приблизний курс для старих записів
            const salePrice = item.priceAfter && item.priceAfter > 0
              ? item.priceAfter
              : unitCost * 1.10 * USD_RATE; // costPrice × 1.10 × курс
            totalSuppliesSaleValue += suppliedQty * salePrice;
          }
        }
      } else if (a.type === 'paymentConfirm') {
        confirmedPaymentsTotal += a.details.amount || 0;
      } else if (a.type === 'writeOff') {
        totalWriteOffsQty += a.details.qty || 0;
        totalWriteOffsAmount += a.details.amount || 0;
      } else if (a.type === 'productDelete') {
        const stock = a.details.totalStock || 0;
        totalWriteOffsQty += stock;
        if (a.details.variants) {
          totalWriteOffsAmount += a.details.variants.reduce(
            (sum, v) => sum + (v.stock || 0) * (v.price || 0),
            0
          );
        }
      } else if (a.type === 'productCreate' && a.details.variants) {
        // Створення товару з варіантами зі складом - рахуємо як поставку
        const variants = a.details.variants as Array<{ stock?: number; price?: number; costPrice?: number }>;
        const createdStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        if (createdStock > 0) {
          totalSuppliesQty += createdStock;
          totalSuppliesSaleValue += variants.reduce((sum, v) => sum + (v.stock || 0) * (v.price || 0), 0);
          totalSuppliesAmount += variants.reduce((sum, v) => sum + (v.stock || 0) * (v.costPrice || 0), 0);
        }
      }
    });

    // Коригуємо суми з урахуванням підтверджених оплат
    totalSalesPaid += confirmedPaymentsTotal;
    totalSalesExpected = Math.max(0, totalSalesExpected - confirmedPaymentsTotal);

    const shiftSummary: ShiftSummary = {
      totalSales: shift.summary?.totalSales ?? shift.totalSales ?? 0,
      totalSalesAmount: shift.summary?.totalSalesAmount ?? totalSalesAmount ?? shift.totalSalesAmount ?? 0,
      totalSalesQty: shift.summary?.totalSalesQty ?? totalSalesQty,
      totalSalesPaid: shift.summary?.totalSalesPaid ?? totalSalesPaid,
      totalSalesExpected: shift.summary?.totalSalesExpected ?? totalSalesExpected,
      totalReturns: shift.summary?.totalReturns ?? totalReturns,
      totalReturnsAmount: shift.summary?.totalReturnsAmount ?? totalReturnsAmount,
      totalReturnsQty: shift.summary?.totalReturnsQty ?? totalReturnsQty,
      totalWriteOffs: shift.summary?.totalWriteOffs ?? shift.totalWriteOffs ?? 0,
      totalWriteOffsQty: shift.summary?.totalWriteOffsQty ?? totalWriteOffsQty,
      totalWriteOffsAmount: shift.summary?.totalWriteOffsAmount ?? totalWriteOffsAmount,
      totalSupplies: totalSupplies,
      totalSuppliesQty: totalSuppliesQty,
      totalSuppliesAmount: totalSuppliesAmount,
      totalSuppliesSaleValue: totalSuppliesSaleValue,
      activitiesCount: shift.summary?.activitiesCount ?? shiftActivities.length,
      productEdits: shift.summary?.productEdits ?? 0,
      customersCreated: shift.summary?.customersCreated ?? 0,
    };
    exportShift(shiftActivities, shiftSummary, shift.startedAt, shift.closedAt, shift.inventoryValue, shift.inventoryQty);
  };

  return (
    <>
      <Card className="admin-card border-none bg-white/90 dark:bg-admin-surface shadow-md">
        <CardHeader className="space-y-3">
          {/* Title and Export Button Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-2xl">Історія зміни</CardTitle>
              <CardDescription>
                {activeTab === 'current' ? (
                  <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                    <span className="whitespace-nowrap font-medium text-slate-700 dark:text-admin-text-primary">
                      {formatShiftDateDisplay(shiftDate)}
                    </span>
                    {shiftStartedAt && (
                      <>
                        <span className="text-slate-300 dark:text-admin-text-muted">·</span>
                        <span className="text-slate-500 dark:text-admin-text-tertiary">
                          з {formatTime(shiftStartedAt)}
                        </span>
                      </>
                    )}
                  </span>
                ) : (
                  'Архів змін з можливістю експорту'
                )}
              </CardDescription>
            </div>
            {activeTab === 'current' ? (
              <div className="flex gap-2">
                {onRefresh && (
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isRefreshing || isLoading}
                    size="icon"
                    title="Оновити (синхронізація з іншими пристроями)"
                    className="shrink-0"
                  >
                    <RefreshCw
                      className={cn(
                        "h-4 w-4",
                        (isRefreshing || isLoading) && "animate-spin"
                      )}
                    />
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="text-slate-500 dark:text-admin-text-tertiary"
                  onClick={onExportShift}
                  disabled={activities.length === 0}
                  size="icon"
                  title="Експортувати"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-admin-surface-elevated rounded-lg">
            <button
              onClick={() => setActiveTab('current')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'current'
                  ? 'bg-white dark:bg-admin-surface text-slate-900 dark:text-admin-text-primary shadow-sm'
                  : 'text-slate-600 dark:text-admin-text-tertiary hover:text-slate-900 dark:hover:text-admin-text-primary'
              )}
            >
              <History className="h-4 w-4" />
              Поточна зміна
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'archive'
                  ? 'bg-white dark:bg-admin-surface text-slate-900 dark:text-admin-text-primary shadow-sm'
                  : 'text-slate-600 dark:text-admin-text-tertiary hover:text-slate-900 dark:hover:text-admin-text-primary'
              )}
            >
              <Calendar className="h-4 w-4" />
              Архів змін
            </button>
          </div>

        </CardHeader>

        <CardContent className="space-y-4">
          {activeTab === 'current' ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Продажі */}
                <div className="rounded-xl border border-emerald-100 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 p-3">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Продажі</p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {Math.round(summary.totalSalesAmount || 0).toLocaleString()} ₴
                  </p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                    {summary.totalSalesQty || 0} шт · {summary.totalSales || 0} продажів
                  </p>
                  {/* Показуємо повернення якщо вони є */}
                  {(summary.totalReturns || 0) > 0 && (
                    <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">
                      −{Math.round(summary.totalReturnsAmount || 0).toLocaleString()} ₴ повернено ({summary.totalReturns})
                    </p>
                  )}
                </div>

                {/* Списання */}
                <div className="rounded-xl border border-amber-100 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-3">
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Списання</p>
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                    {Math.round(summary.totalWriteOffsAmount || 0).toLocaleString()} ₴
                  </p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                    {summary.totalWriteOffsQty || 0} шт · {summary.totalWriteOffs || 0} операцій
                  </p>
                </div>

                {/* Поставки */}
                <div className="rounded-xl border border-blue-100 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20 p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Поставки</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {Math.round(summary.totalSuppliesAmount || 0).toLocaleString()} $
                    </p>
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                      → {Math.round(summary.totalSuppliesSaleValue || 0).toLocaleString()} ₴
                    </p>
                  </div>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                    {summary.totalSuppliesQty || 0} шт · собівартість → ціна продажу
                  </p>
                </div>

                {/* Вартість запасів */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 p-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Залишки (зараз)</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                    {Math.round(inventoryValue).toLocaleString()} ₴
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400/70">
                    {totalStockItems.toLocaleString()} шт · ціна продажу
                  </p>
                </div>
              </div>

              {/* Activities List */}
              <div className="rounded-xl border border-slate-100 dark:border-admin-border bg-white dark:bg-admin-surface overflow-hidden">
                {activities.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div>
                    {activities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <ArchiveTab onExportShift={handleExportArchivedShift} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
