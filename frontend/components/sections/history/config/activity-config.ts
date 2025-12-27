/**
 * Activity Configuration
 *
 * Icons, labels, and colors for activity types
 */

import {
  ShoppingBag,
  PackageMinus,
  Pencil,
  Plus,
  Trash,
  CreditCard,
  UserPlus,
  Truck,
  XCircle,
} from 'lucide-react';
import type { ActivityType } from '@/hooks/use-activity-log';

export const activityConfig: Record<
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
