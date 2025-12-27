/**
 * Activity Item Component
 *
 * Displays a single activity with expandable details
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils/date';
import type { Activity } from '@/hooks/use-activity-log';
import { activityConfig } from '../config/activity-config';

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
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
                  {details.items.map((item: { name: string; size: string; qty: number; price: number }, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="dark:text-admin-text-secondary">
                        {item.name} ({item.size}) x{item.qty}
                      </span>
                      <span className="font-medium dark:text-admin-text-primary">{Math.round(item.price * item.qty)} грн</span>
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
              <span className="font-bold text-emerald-600">{Math.round(details.totalAmount || 0)} грн</span>
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
                  {details.variants.map((v: { length: number; price: number; stock: number }, idx: number) => (
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
                        {String((value as { from: unknown; to: unknown }).from)} → {String((value as { from: unknown; to: unknown }).to)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'productDelete':
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Товар:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.productName}</span>
            </div>
            {details.totalStock !== undefined && details.totalStock > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-admin-text-tertiary">Списано:</span>
                <span className="font-medium text-rose-600 dark:text-rose-400">{details.totalStock} шт</span>
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
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Клієнт:</span>
              <span className="font-medium dark:text-admin-text-primary">{details.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-admin-text-tertiary">Сума оплати:</span>
              <span className="font-bold text-emerald-600">{Math.round(details.amount || 0)} грн</span>
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
          </div>
        );

      case 'supply':
        return (
          <div className="space-y-3 text-sm">
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

  const getSummaryText = (): string => {
    const { details } = activity;
    switch (activity.type) {
      case 'sale':
        return `${details.customerName} - ${Math.round(details.totalAmount || 0)} грн`;
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
        <div className="px-4 pb-4 pt-0 animate-fade-in">
          <div className="rounded-lg border border-slate-100 dark:border-admin-border bg-slate-50/70 dark:bg-admin-surface-elevated p-3">
            {renderDetails()}
          </div>
        </div>
      )}
    </div>
  );
}
