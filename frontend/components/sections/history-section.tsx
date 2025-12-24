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
import { exportShift } from '@/lib/export';
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
  CheckCircle2,
  History,
  RefreshCw,
  XCircle,
  Calendar,
  Eye,
  CalendarDays,
} from 'lucide-react';

// ============================================
// Types
// ============================================

interface HistorySectionProps {
  activities: Activity[];
  shiftStartedAt: string | null;
  summary: ShiftSummary;
  onCloseShift: () => Promise<void>;
  onExportShift: () => void;
  onRefresh?: () => Promise<void>;
  isClosingShift?: boolean;
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
                <div className="ml-2 space-y-1">
                  {details.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="dark:text-admin-text-secondary">
                        {item.name} ({item.size}) x{item.qty}
                      </span>
                      <span className="font-medium dark:text-admin-text-primary">{item.price * item.qty} грн</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {details.discount && details.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Знижка:</span>
                <span className="text-rose-600">-{details.discount} грн</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 dark:border-admin-border">
              <span className="font-medium dark:text-admin-text-primary">Сума:</span>
              <span className="font-bold text-emerald-600">{details.totalAmount} грн</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Статус оплати:</span>
              <Badge
                tone={details.paymentStatus === 'paid' ? 'success' : 'warning'}
                className="text-xs"
              >
                {details.paymentStatus === 'paid' ? 'Сплачено' : 'Очікується'}
              </Badge>
            </div>
            {details.notes && (
              <div className="border-t pt-2 dark:border-admin-border">
                <span className="text-slate-500 dark:text-admin-text-tertiary block mb-1">Коментар:</span>
                <span className="text-slate-700 dark:text-admin-text-secondary text-sm">{details.notes}</span>
              </div>
            )}
          </div>
        );

      case 'writeOff':
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Товар:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.flowerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Розмір:</span>
              <span className="dark:text-admin-text-primary">{details.length} см</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Кількість:</span>
              <span className="font-medium text-amber-600">{details.qty} шт</span>
            </div>
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

      case 'productEdit':
      case 'productCreate':
      case 'productDelete':
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Товар:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.productName}</span>
            </div>
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
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Клієнт:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Сума:</span>
              <span className="font-bold text-emerald-600">{details.amount} грн</span>
            </div>
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

      case 'supply':
        return (
          <div className="space-y-2 text-sm">
            {details.filename && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Файл:</span>
                <span className="font-medium dark:text-admin-text-primary">{details.filename}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 dark:text-admin-text-tertiary">Нових квітів:</span>
                <span className="ml-2 font-medium dark:text-admin-text-primary">{details.flowersCreated || 0}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-admin-text-tertiary">Оновлено:</span>
                <span className="ml-2 font-medium dark:text-admin-text-primary">{details.flowersUpdated || 0}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-admin-text-tertiary">Нових варіантів:</span>
                <span className="ml-2 font-medium dark:text-admin-text-primary">{details.variantsCreated || 0}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-admin-text-tertiary">Оновлено:</span>
                <span className="ml-2 font-medium dark:text-admin-text-primary">{details.variantsUpdated || 0}</span>
              </div>
            </div>
          </div>
        );

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
      case 'sale':
        return `${details.customerName} - ${details.totalAmount} грн`;
      case 'writeOff':
        return `${details.flowerName} (${details.length} см) - ${details.qty} шт`;
      case 'productEdit':
      case 'productCreate':
      case 'productDelete':
        return details.productName || '';
      case 'variantDelete':
        return `${details.productName} - ${details.variantLength} см`;
      case 'paymentConfirm':
        return `${details.customerName} - ${details.amount} грн`;
      case 'customerCreate':
        return details.customerName || '';
      case 'customerDelete':
        return details.customerName || '';
      case 'supply':
        return details.filename || 'Імпорт';
      default:
        return '';
    }
  };

  return (
    <div className="border-b border-slate-100 dark:border-admin-border last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left bg-white dark:bg-admin-surface hover:bg-slate-50 dark:hover:bg-[#21262d] transition-colors"
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
        <div className="px-4 pb-4 pt-0 ml-12 animate-fade-in">
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
  const shiftsByDate = new Map<string, Shift[]>();
  shifts.forEach(shift => {
    const dateKey = new Date(shift.closedAt || shift.startedAt).toDateString();
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
                className={cn(
                  'h-20 p-1 border-t border-r border-slate-100 dark:border-admin-border last:border-r-0 relative',
                  hasShifts && 'bg-emerald-50/50 dark:bg-emerald-900/10'
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-sm',
                    isToday && 'bg-emerald-600 text-white font-bold',
                    !isToday && 'text-slate-700 dark:text-admin-text-primary'
                  )}
                >
                  {day}
                </span>
                {hasShifts && (
                  <div className="mt-1 space-y-0.5">
                    {dayShifts.slice(0, 2).map((shift) => (
                      <button
                        key={shift.documentId}
                        onClick={() => onSelectShift(shift)}
                        className="w-full text-left text-[10px] px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-700/50 truncate transition-colors"
                      >
                        {shift.totalSalesAmount.toLocaleString()} грн
                      </button>
                    ))}
                    {dayShifts.length > 2 && (
                      <span className="text-[10px] text-slate-500 px-1">
                        +{dayShifts.length - 2} ще
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
  const summary = shift.summary || {
    totalSales: shift.totalSales || 0,
    totalSalesAmount: shift.totalSalesAmount || 0,
    totalWriteOffs: shift.totalWriteOffs || 0,
    totalWriteOffsQty: shift.totalWriteOffsQty || 0,
    activitiesCount: activities.length,
    productEdits: 0,
    customersCreated: 0,
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Зміна ${formatShortDate(shift.startedAt)}`}
      description={
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {formatDateTime(shift.startedAt)} — {shift.closedAt ? formatDateTime(shift.closedAt) : 'Активна'}
          <span className="text-emerald-600 font-medium">
            ({formatDuration(shift.startedAt, shift.closedAt)})
          </span>
        </span>
      }
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрити
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onExport(shift)}
          >
            <Download className="mr-2 h-4 w-4" />
            Експортувати
          </Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Summary Stats */}
        <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-900/20 p-4">
          <h4 className="font-semibold text-slate-900 dark:text-admin-text-primary mb-3">
            Підсумок зміни
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-admin-text-secondary">Продажів:</span>
              <span className="font-medium dark:text-admin-text-primary">{summary.totalSales}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-admin-text-secondary">Виручка:</span>
              <span className="font-medium text-emerald-600">
                {Math.round(summary.totalSalesAmount).toLocaleString()} грн
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-admin-text-secondary">Списань:</span>
              <span className="font-medium dark:text-admin-text-primary">{summary.totalWriteOffs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-admin-text-secondary">Списано шт:</span>
              <span className="font-medium text-amber-600">{summary.totalWriteOffsQty}</span>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="rounded-xl border border-slate-100 dark:border-admin-border bg-white dark:bg-admin-surface overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 dark:bg-admin-surface-elevated border-b border-slate-100 dark:border-admin-border">
            <span className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">
              Дії ({activities.length})
            </span>
          </div>
          {activities.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-admin-text-tertiary">
              Немає записів
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
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
      // Load more shifts for calendar view
      const result = await getShifts(1, 100);
      if (result.success && result.data) {
        // Filter only closed shifts
        const closedShifts = result.data.filter(s => s.status === 'closed');
        setShifts(closedShifts);
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
          Немає закритих змін
        </h3>
        <p className="text-sm text-slate-500 dark:text-admin-text-tertiary max-w-xs">
          Після закриття зміни вона з'явиться тут у календарі
        </p>
      </div>
    );
  }

  return (
    <>
      <ShiftCalendar
        shifts={shifts}
        onSelectShift={handleSelectShift}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      {/* Recent Shifts List */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary mb-3">
          Останні зміни
        </h4>
        <div className="space-y-2">
          {shifts.slice(0, 5).map(shift => (
            <div
              key={shift.documentId}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-admin-border bg-white dark:bg-admin-surface hover:bg-slate-50 dark:hover:bg-[#21262d] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-admin-text-primary">
                    {formatShortDate(shift.startedAt)}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-admin-text-tertiary">
                    {shift.totalSales} продажів • {shift.totalSalesAmount.toLocaleString()} грн
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectShift(shift)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Деталі
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportShift(shift)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
  shiftStartedAt,
  summary,
  onCloseShift,
  onExportShift,
  onRefresh,
  isClosingShift = false,
  isLoading = false,
}: HistorySectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCloseShift = async () => {
    await onCloseShift();
    setCloseModalOpen(false);
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
    const shiftSummary: ShiftSummary = shift.summary || {
      totalSales: shift.totalSales || 0,
      totalSalesAmount: shift.totalSalesAmount || 0,
      totalWriteOffs: shift.totalWriteOffs || 0,
      totalWriteOffsQty: shift.totalWriteOffsQty || 0,
      activitiesCount: shiftActivities.length,
      productEdits: 0,
      customersCreated: 0,
    };
    exportShift(shiftActivities, shiftSummary, shift.startedAt, shift.closedAt);
  };

  return (
    <>
      <Card className="admin-card border-none bg-white/90 dark:bg-admin-surface shadow-md">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Історія зміни</CardTitle>
            <CardDescription>
              {activeTab === 'current' && shiftStartedAt ? (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Зміна розпочата: {formatDateTime(shiftStartedAt)}
                  <span className="text-emerald-600 font-medium">
                    ({formatDuration(shiftStartedAt)})
                  </span>
                </span>
              ) : activeTab === 'current' ? (
                'Історія дій поточної робочої зміни'
              ) : (
                'Архів закритих змін з можливістю експорту'
              )}
            </CardDescription>
          </div>
          {activeTab === 'current' && (
            <div className="flex flex-col gap-2 sm:flex-row">
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
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={onExportShift}
                disabled={activities.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Експортувати
              </Button>
              <Button
                variant="outline"
                onClick={() => setCloseModalOpen(true)}
                disabled={activities.length === 0}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Закрити зміну
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
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

          {activeTab === 'current' ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatPill
                  label="Продажів"
                  value={`${summary.totalSales}`}
                />
                <StatPill
                  label="Виручка"
                  value={`${Math.round(summary.totalSalesAmount)} грн`}
                />
                <StatPill
                  label="Списань"
                  value={`${summary.totalWriteOffs}`}
                />
                <StatPill
                  label="Всього дій"
                  value={`${summary.activitiesCount}`}
                />
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

      {/* Close Shift Modal */}
      <Modal
        open={closeModalOpen}
        onOpenChange={setCloseModalOpen}
        title="Закрити зміну?"
        description="Після закриття зміни всі дії будуть збережені в архів. Розпочнеться нова зміна."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setCloseModalOpen(false)}
              disabled={isClosingShift}
            >
              Скасувати
            </Button>
            <Button
              onClick={handleCloseShift}
              disabled={isClosingShift}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isClosingShift ? 'Закриття...' : 'Підтвердити'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-900/20 p-4">
            <h4 className="font-semibold text-slate-900 dark:text-admin-text-primary mb-3">
              Підсумок зміни
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-admin-text-secondary">Продажів:</span>
                <span className="font-medium dark:text-admin-text-primary">{summary.totalSales}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-admin-text-secondary">Виручка:</span>
                <span className="font-medium text-emerald-600">
                  {Math.round(summary.totalSalesAmount)} грн
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-admin-text-secondary">Списань:</span>
                <span className="font-medium dark:text-admin-text-primary">{summary.totalWriteOffs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-admin-text-secondary">Списано шт:</span>
                <span className="font-medium text-amber-600">{summary.totalWriteOffsQty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-admin-text-secondary">Редагувань:</span>
                <span className="font-medium dark:text-admin-text-primary">{summary.productEdits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-admin-text-secondary">Нових клієнтів:</span>
                <span className="font-medium dark:text-admin-text-primary">{summary.customersCreated}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-slate-500 dark:text-admin-text-tertiary">
            <Clock className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              {shiftStartedAt && (
                <>
                  Тривалість зміни: <strong>{formatDuration(shiftStartedAt)}</strong>
                </>
              )}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
