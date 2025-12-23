/**
 * History Section
 *
 * Відображення історії дій поточної зміни з можливістю закриття
 */

import { useState } from 'react';
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
import {
  ChevronDown,
  ChevronRight,
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

function formatDuration(startIso: string): string {
  const start = new Date(startIso);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} год ${minutes} хв`;
  }
  return `${minutes} хв`;
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

  return (
    <>
      <Card className="admin-card border-none bg-white/90 dark:bg-admin-surface shadow-md">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Історія зміни</CardTitle>
            <CardDescription>
              {shiftStartedAt ? (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Зміна розпочата: {formatDateTime(shiftStartedAt)}
                  <span className="text-emerald-600 font-medium">
                    ({formatDuration(shiftStartedAt)})
                  </span>
                </span>
              ) : (
                'Історія дій поточної робочої зміни'
              )}
            </CardDescription>
          </div>
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
        </CardHeader>

        <CardContent className="space-y-4">
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
              <div className="max-h-[500px] overflow-y-auto">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
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
