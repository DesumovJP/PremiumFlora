/**
 * Export Utilities
 *
 * Функції для експорту даних у CSV формат
 */

import type { Product } from "@/lib/types";
import type { Customer, DashboardData, Transaction, TransactionItem } from "@/lib/api-types";
import type { Activity, ShiftSummary } from "@/hooks/use-activity-log";

// ============================================
// Helper Functions
// ============================================

function getTimestamp(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvRow(values: (string | number | null | undefined)[]): string {
  return values.map(escapeCsvValue).join(',');
}

function downloadCsv(content: string, filename: string): void {
  const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================
// Products Export
// ============================================

export function exportProducts(products: Product[]): void {
  const headers = ['Назва', 'Розмір (см)', 'Собівартість', 'Ціна', 'Кількість', 'Вартість закупки', 'Вартість продажу'];

  const rows: string[] = [toCsvRow(headers)];

  let totalStock = 0;
  let totalCostValue = 0;
  let totalSaleValue = 0;

  products.forEach(product => {
    product.variants.forEach(variant => {
      const costPrice = (variant as { costPrice?: number }).costPrice ?? 0;
      const costValue = costPrice * variant.stock;
      const saleValue = variant.price * variant.stock;

      totalStock += variant.stock;
      totalCostValue += costValue;
      totalSaleValue += saleValue;

      rows.push(toCsvRow([
        product.name,
        variant.length,
        Math.round(costPrice * 100) / 100,
        variant.price,
        variant.stock,
        Math.round(costValue * 100) / 100,
        Math.round(saleValue * 100) / 100,
      ]));
    });
  });

  // Summary row
  rows.push('');
  rows.push(toCsvRow(['РАЗОМ', '', '', '', totalStock, Math.round(totalCostValue * 100) / 100, Math.round(totalSaleValue * 100) / 100]));

  downloadCsv(rows.join('\n'), `products_${getTimestamp()}.csv`);
}

// ============================================
// Clients Export
// ============================================

export function exportClients(customers: Customer[]): void {
  const headers = ["Ім'я / Компанія", 'Тип', 'Телефон', 'Email', 'Адреса', 'Замовлень', 'Витрачено', 'Баланс'];

  const rows: string[] = [toCsvRow(headers)];

  customers.forEach(customer => {
    rows.push(toCsvRow([
      customer.name,
      customer.type === 'VIP' ? 'VIP' : customer.type === 'Wholesale' ? 'Оптовий' : 'Звичайний',
      customer.phone || '',
      customer.email || '',
      customer.address || '',
      customer.orderCount,
      customer.totalSpent,
      customer.balance || 0,
    ]));
  });

  // Summary
  const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0);
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalBalance = customers.reduce((sum, c) => sum + (c.balance || 0), 0);

  rows.push('');
  rows.push(toCsvRow(['РАЗОМ', `${customers.length} клієнтів`, '', '', '', totalOrders, totalSpent, totalBalance]));

  downloadCsv(rows.join('\n'), `clients_${getTimestamp()}.csv`);
}

// ============================================
// Analytics Export
// ============================================

export function exportAnalytics(data: DashboardData): void {
  const headers = ['Дата', 'День', 'Замовлень', 'Виручка', 'Середній чек', 'Списання'];

  const rows: string[] = [toCsvRow(headers)];

  data.dailySales.forEach(sale => {
    rows.push(toCsvRow([
      sale.date,
      sale.day,
      sale.orders,
      sale.revenue,
      sale.avg,
      sale.writeOffs || 0,
    ]));
  });

  // Summary
  const totalOrders = data.dailySales.reduce((sum, s) => sum + s.orders, 0);
  const totalRevenue = data.dailySales.reduce((sum, s) => sum + s.revenue, 0);
  const totalWriteOffs = data.dailySales.reduce((sum, s) => sum + (s.writeOffs || 0), 0);
  const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  rows.push('');
  rows.push(toCsvRow(['РАЗОМ', '', totalOrders, totalRevenue, avgCheck, totalWriteOffs]));

  downloadCsv(rows.join('\n'), `analytics_${getTimestamp()}.csv`);
}

// ============================================
// Shift Export
// ============================================

const activityTypeLabels: Record<string, string> = {
  sale: 'Продаж',
  saleReturn: 'Повернення',
  writeOff: 'Списання',
  productEdit: 'Редагування товару',
  productCreate: 'Створення товару',
  productDelete: 'Видалення товару',
  paymentConfirm: 'Підтвердження оплати',
  customerCreate: 'Новий клієнт',
  customerDelete: 'Видалення клієнта',
  balanceEdit: 'Зміна балансу',
  supply: 'Поставка',
};

export function exportShift(
  activities: Activity[],
  summary: ShiftSummary,
  shiftStartedAt: string,
  shiftClosedAt?: string | null,
  inventoryValue?: number,
  inventoryQty?: number
): void {
  const rows: string[] = [];
  const closedAtDate = shiftClosedAt ? new Date(shiftClosedAt) : new Date();

  // Header info
  rows.push(toCsvRow(['ЗВІТ ЗА ЗМІНУ']));
  rows.push(toCsvRow(['Початок', new Date(shiftStartedAt).toLocaleString('uk-UA')]));
  rows.push(toCsvRow(['Закриття', closedAtDate.toLocaleString('uk-UA')]));
  rows.push('');

  // Summary
  rows.push(toCsvRow(['ПІДСУМОК']));
  rows.push(toCsvRow(['Продажів', summary.totalSales]));
  rows.push(toCsvRow(['Сума продажів', round2(summary.totalSalesAmount)]));
  rows.push(toCsvRow(['  - оплачено', round2(summary.totalSalesPaid || 0)]));
  rows.push(toCsvRow(['  - в борг', round2(summary.totalSalesExpected || 0)]));
  if ((summary.totalReturns || 0) > 0) {
    rows.push(toCsvRow(['Повернень', summary.totalReturns]));
    rows.push(toCsvRow(['Сума повернень', round2(summary.totalReturnsAmount || 0)]));
  }
  rows.push(toCsvRow(['Списань', summary.totalWriteOffs]));
  rows.push(toCsvRow(['Поставок', summary.totalSupplies || 0]));
  rows.push('');

  // Inventory at shift end
  rows.push(toCsvRow(['ЗАЛИШКИ НА КІНЕЦЬ ЗМІНИ']));
  rows.push(toCsvRow(['Кількість товарів', inventoryQty || 0]));
  rows.push(toCsvRow(['Вартість запасів', Math.round(inventoryValue || 0)]));
  rows.push('');

  // Sales detail
  const salesActivities = activities.filter(a => a.type === 'sale');
  if (salesActivities.length > 0) {
    rows.push(toCsvRow(['ПРОДАЖІ']));
    rows.push(toCsvRow(['Час', 'Клієнт', 'Товар', 'Розмір', 'К-сть', 'Ціна', 'Сума', 'Статус']));

    salesActivities.forEach(activity => {
      const { details, timestamp } = activity;
      const time = new Date(timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
      const items = details.items || [];
      const status = details.paymentStatus === 'paid' ? 'Оплачено' : 'В борг';

      if (items.length === 0) {
        rows.push(toCsvRow([time, details.customerName, '-', '-', '-', '-', details.totalAmount, status]));
      } else {
        items.forEach((item: { name: string; size: string; qty: number; price: number }, idx: number) => {
          rows.push(toCsvRow([
            idx === 0 ? time : '',
            idx === 0 ? details.customerName : '',
            item.name,
            item.size,
            item.qty,
            item.price,
            item.qty * item.price,
            idx === 0 ? status : '',
          ]));
        });
        if (items.length > 1) {
          rows.push(toCsvRow(['', '', '', '', '', 'Разом:', details.totalAmount, '']));
        }
      }
    });
    rows.push('');
  }

  // Returns
  const returnActivities = activities.filter(a => a.type === 'saleReturn');
  if (returnActivities.length > 0) {
    rows.push(toCsvRow(['ПОВЕРНЕННЯ']));
    rows.push(toCsvRow(['Час', 'Клієнт', 'Товар', 'Розмір', 'К-сть', 'Ціна', 'Сума']));

    returnActivities.forEach(activity => {
      const { details, timestamp } = activity;
      const time = new Date(timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
      const items = details.items || [];

      if (items.length === 0) {
        rows.push(toCsvRow([time, details.customerName, '-', '-', '-', '-', details.returnAmount || details.totalAmount || 0]));
      } else {
        items.forEach((item: { name: string; size?: string; qty: number; price: number }, idx: number) => {
          rows.push(toCsvRow([
            idx === 0 ? time : '',
            idx === 0 ? details.customerName : '',
            item.name,
            item.size || '-',
            item.qty,
            round2(item.price),
            round2(item.qty * item.price),
          ]));
        });
        if (items.length > 1) {
          rows.push(toCsvRow(['', '', '', '', '', 'Разом:', round2(details.returnAmount || details.totalAmount || 0)]));
        }
      }
    });
    rows.push('');
  }

  // Write-offs
  const writeOffActivities = activities.filter(a => a.type === 'writeOff');
  if (writeOffActivities.length > 0) {
    rows.push(toCsvRow(['СПИСАННЯ']));
    rows.push(toCsvRow(['Час', 'Товар', 'Розмір', 'К-сть', 'Сума', 'Причина']));

    const reasonLabels: Record<string, string> = {
      damaged: 'Пошкоджено',
      expired: "Зів'яло",
      lost: 'Втрачено',
      sample: 'Зразок',
      gift: 'Подарунок',
      other: 'Інше',
    };

    writeOffActivities.forEach(activity => {
      const { details, timestamp } = activity;
      const time = new Date(timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
      rows.push(toCsvRow([
        time,
        details.flowerName,
        details.length ? `${details.length} см` : '-',
        details.qty,
        details.amount || 0,
        (details.reason ? reasonLabels[details.reason] : undefined) || details.reason || '-',
      ]));
    });
    rows.push('');
  }

  // Supplies
  const supplyActivities = activities.filter(a => a.type === 'supply');
  if (supplyActivities.length > 0) {
    rows.push(toCsvRow(['ПОСТАВКИ']));
    rows.push(toCsvRow(['Час', 'Товар', 'Розмір', 'Було', 'Стало', 'Додано', 'Сума']));

    supplyActivities.forEach(activity => {
      const { details, timestamp } = activity;
      const time = new Date(timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
      const items = (details.supplyItems || []) as Array<{
        flowerName?: string;
        length?: number;
        stockBefore?: number;
        stockAfter?: number;
        priceAfter?: number;
      }>;

      items.forEach((item, idx) => {
        const qty = (item.stockAfter || 0) - (item.stockBefore || 0);
        rows.push(toCsvRow([
          idx === 0 ? time : '',
          item.flowerName || '-',
          item.length ? `${item.length} см` : '-',
          item.stockBefore || 0,
          item.stockAfter || 0,
          qty,
          Math.round(qty * (item.priceAfter || 0)),
        ]));
      });
    });
    rows.push('');
  }

  // All activities
  rows.push(toCsvRow(['ВСІ ДІЇ']));
  rows.push(toCsvRow(['Час', 'Тип', 'Деталі']));

  [...activities].reverse().forEach(activity => {
    const time = new Date(activity.timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    const type = activityTypeLabels[activity.type] || activity.type;
    let details = '';

    switch (activity.type) {
      case 'sale':
        details = `${activity.details.customerName} - ${round2(activity.details.totalAmount || 0)} грн`;
        break;
      case 'saleReturn':
        details = `${activity.details.customerName} - повернення ${round2(activity.details.returnAmount || activity.details.totalAmount || 0)} грн`;
        break;
      case 'writeOff':
        details = `${activity.details.flowerName} - ${activity.details.qty} шт`;
        break;
      case 'paymentConfirm':
        details = `${activity.details.customerName} - ${round2(activity.details.amount || 0)} грн`;
        break;
      case 'customerCreate':
        details = activity.details.customerName || '';
        break;
      case 'balanceEdit': {
        const diff = (activity.details.balanceAfter ?? 0) - (activity.details.balanceBefore ?? 0);
        details = `${activity.details.customerName} ${diff >= 0 ? '+' : ''}${round2(diff)} грн`;
        break;
      }
      case 'supply':
        const supplyItems = activity.details.supplyItems as Array<{ stockBefore?: number; stockAfter?: number }> | undefined;
        const totalQty = supplyItems?.reduce((sum, i) => sum + ((i.stockAfter || 0) - (i.stockBefore || 0)), 0) || 0;
        details = `+${totalQty} шт (${supplyItems?.length || 0} позицій)`;
        break;
      default:
        details = activity.details.productName || '';
    }

    rows.push(toCsvRow([time, type, details]));
  });

  const shiftDate = new Date(shiftStartedAt);
  const dateStr = `${shiftDate.getFullYear()}-${String(shiftDate.getMonth() + 1).padStart(2, '0')}-${String(shiftDate.getDate()).padStart(2, '0')}`;
  downloadCsv(rows.join('\n'), `shift_${dateStr}.csv`);
}

// ============================================
// Client Transactions Export
// ============================================

export function exportClientTransactions(
  customer: Customer,
  transactions: Transaction[],
  balance: number
): void {
  const rows: string[] = [];

  // Client info
  rows.push(toCsvRow(['КЛІЄНТ']));
  rows.push(toCsvRow(["Ім'я", customer.name]));
  rows.push(toCsvRow(['Тип', customer.type === 'VIP' ? 'VIP' : customer.type === 'Wholesale' ? 'Оптовий' : 'Звичайний']));
  rows.push(toCsvRow(['Телефон', customer.phone || '-']));
  rows.push(toCsvRow(['Email', customer.email || '-']));
  rows.push(toCsvRow(['Баланс', balance]));
  rows.push('');

  // Stats
  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const paidAmount = transactions.filter(t => t.paymentStatus === 'paid').reduce((sum, t) => sum + (t.amount || 0), 0);
  const pendingAmount = transactions.filter(t => t.paymentStatus === 'expected' || t.paymentStatus === 'pending').reduce((sum, t) => sum + (t.amount || 0), 0);

  rows.push(toCsvRow(['СТАТИСТИКА']));
  rows.push(toCsvRow(['Всього замовлень', transactions.length]));
  rows.push(toCsvRow(['Загальна сума', Math.round(totalAmount)]));
  rows.push(toCsvRow(['Оплачено', Math.round(paidAmount)]));
  rows.push(toCsvRow(['Очікує оплати', Math.round(pendingAmount)]));
  rows.push('');

  // Transactions
  rows.push(toCsvRow(['ЗАМОВЛЕННЯ']));
  rows.push(toCsvRow(['№', 'Дата', 'Час', 'Товар', 'Розмір', 'К-сть', 'Ціна', 'Сума', 'Статус', 'Коментар']));

  transactions.forEach((transaction, idx) => {
    const date = new Date(transaction.date);
    const dateStr = date.toLocaleDateString('uk-UA');
    const timeStr = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    const status = transaction.paymentStatus === 'paid' ? 'Оплачено' :
                   transaction.paymentStatus === 'expected' ? 'Очікує' : 'Очікує';

    if (!transaction.items || transaction.items.length === 0) {
      rows.push(toCsvRow([idx + 1, dateStr, timeStr, '-', '-', '-', '-', transaction.amount, status, transaction.notes || '']));
    } else {
      transaction.items.forEach((item: TransactionItem, itemIdx: number) => {
        const isFirst = itemIdx === 0;
        rows.push(toCsvRow([
          isFirst ? idx + 1 : '',
          isFirst ? dateStr : '',
          isFirst ? timeStr : '',
          item.name,
          item.length ? `${item.length} см` : '-',
          item.qty,
          Math.round(item.price),
          Math.round(item.subtotal || item.qty * item.price),
          isFirst ? status : '',
          isFirst ? (transaction.notes || '') : '',
        ]));
      });
      if (transaction.items.length > 1) {
        rows.push(toCsvRow(['', '', '', '', '', '', 'Разом:', Math.round(transaction.amount || 0), '', '']));
      }
    }
  });

  rows.push('');
  rows.push(toCsvRow(['', '', '', '', '', '', 'ВСЬОГО:', Math.round(totalAmount), '', '']));

  // Pending payments detail
  const pendingTransactions = transactions.filter(t => t.paymentStatus === 'expected' || t.paymentStatus === 'pending');
  if (pendingTransactions.length > 0) {
    rows.push('');
    rows.push(toCsvRow(['БОРГИ']));
    rows.push(toCsvRow(['Дата', 'Товари', 'Сума', 'Днів']));

    const now = new Date();
    pendingTransactions.forEach(t => {
      const orderDate = new Date(t.date);
      const daysInDebt = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      const itemsStr = t.items?.map((item: TransactionItem) =>
        `${item.name} ${item.length ? `(${item.length}см)` : ''} × ${item.qty}`
      ).join('; ') || '-';

      rows.push(toCsvRow([
        orderDate.toLocaleDateString('uk-UA'),
        itemsStr,
        t.amount || 0,
        daysInDebt,
      ]));
    });

    rows.push(toCsvRow(['', 'ВСЬОГО БОРГ:', Math.round(pendingAmount), '']));
  }

  const safeName = customer.name.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄ0-9]/g, '_').slice(0, 30);
  downloadCsv(rows.join('\n'), `client_${safeName}_${getTimestamp()}.csv`);
}

// ============================================
// Sale Invoice Export
// ============================================

// Округлення до 2 знаків після коми
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function exportSaleInvoice(transaction: Transaction): void {
  const rows: string[] = [];
  const date = new Date(transaction.date);
  const dateStr = date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  // Header
  rows.push(toCsvRow(['НАКЛАДНА']));
  rows.push(toCsvRow(['Номер', transaction.operationId || transaction.documentId]));
  rows.push(toCsvRow(['Дата', dateStr]));
  rows.push(toCsvRow(['Час', timeStr]));

  // Customer info (if available)
  if (transaction.customer) {
    rows.push('');
    rows.push(toCsvRow(['КЛІЄНТ']));
    rows.push(toCsvRow(["Ім'я", transaction.customer.name]));
    if (transaction.customer.phone) {
      rows.push(toCsvRow(['Телефон', transaction.customer.phone]));
    }
  }

  rows.push('');

  // Items - check if any item has edited price
  const hasEditedPrices = transaction.items?.some(item =>
    item.originalPrice && item.originalPrice !== item.price
  );

  rows.push(toCsvRow(['ТОВАРИ']));
  if (hasEditedPrices) {
    rows.push(toCsvRow(['№', 'Назва', 'Розмір', 'К-сть', 'Каталог', 'Ціна', 'Сума']));
  } else {
    rows.push(toCsvRow(['№', 'Назва', 'Розмір', 'К-сть', 'Ціна', 'Сума']));
  }

  let itemsTotal = 0;
  transaction.items?.forEach((item: TransactionItem, idx: number) => {
    const subtotal = item.subtotal || item.qty * item.price;
    itemsTotal += subtotal;

    if (hasEditedPrices) {
      rows.push(toCsvRow([
        idx + 1,
        item.isCustom ? `${item.name} (${item.customNote || 'інше'})` : item.name,
        item.length ? `${item.length} см` : '-',
        item.qty,
        item.originalPrice && item.originalPrice !== item.price ? round2(item.originalPrice) : '-',
        round2(item.price),
        round2(subtotal),
      ]));
    } else {
      rows.push(toCsvRow([
        idx + 1,
        item.isCustom ? `${item.name} (${item.customNote || 'інше'})` : item.name,
        item.length ? `${item.length} см` : '-',
        item.qty,
        round2(item.price),
        round2(subtotal),
      ]));
    }
  });

  rows.push('');
  // Adjust column count based on whether we have edited prices
  if (hasEditedPrices) {
    rows.push(toCsvRow(['', '', '', '', '', 'Разом товари:', round2(itemsTotal)]));
  } else {
    rows.push(toCsvRow(['', '', '', '', 'Разом товари:', round2(itemsTotal)]));
  }

  // Additional charges (discount, service, etc.)
  const totalAmount = transaction.amount || 0;
  const diff = totalAmount - itemsTotal;

  if (Math.abs(diff) > 0.01) {
    if (diff < 0) {
      if (hasEditedPrices) {
        rows.push(toCsvRow(['', '', '', '', '', 'Знижка:', round2(diff)]));
      } else {
        rows.push(toCsvRow(['', '', '', '', 'Знижка:', round2(diff)]));
      }
    } else {
      if (hasEditedPrices) {
        rows.push(toCsvRow(['', '', '', '', '', 'Додатково:', round2(diff)]));
      } else {
        rows.push(toCsvRow(['', '', '', '', 'Додатково:', round2(diff)]));
      }
    }
  }

  if (hasEditedPrices) {
    rows.push(toCsvRow(['', '', '', '', '', 'ДО СПЛАТИ:', round2(totalAmount)]));
  } else {
    rows.push(toCsvRow(['', '', '', '', 'ДО СПЛАТИ:', round2(totalAmount)]));
  }

  // Payment status
  rows.push('');
  const statusLabel = transaction.paymentStatus === 'paid' ? 'Оплачено' :
                      transaction.paymentStatus === 'expected' ? 'Очікує оплати' :
                      transaction.paymentStatus === 'pending' ? 'В очікуванні' : 'Скасовано';
  rows.push(toCsvRow(['Статус оплати', statusLabel]));

  // Notes
  if (transaction.notes) {
    rows.push(toCsvRow(['Коментар', transaction.notes]));
  }

  const invoiceNum = (transaction.operationId || transaction.documentId).slice(-8);
  downloadCsv(rows.join('\n'), `invoice_${invoiceNum}_${dateStr.replace(/\./g, '-')}.csv`);
}

// ============================================
// Return Invoice Export
// ============================================

export interface ReturnInvoiceData {
  returnDate: string;
  originalSaleDate?: string;
  originalSaleId?: string;
  customerName?: string;
  customerPhone?: string;
  returnAmount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  items: Array<{
    name: string;
    size?: string;
    qty: number;
    price: number;
    stockBefore?: number;
    stockAfter?: number;
    isCustom?: boolean;
    customNote?: string;
  }>;
  reason?: string;
}

export function exportReturnInvoice(data: ReturnInvoiceData): void {
  const rows: string[] = [];
  const date = new Date(data.returnDate);
  const dateStr = date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  // Header
  rows.push(toCsvRow(['НАКЛАДНА ПОВЕРНЕННЯ']));
  rows.push(toCsvRow(['Дата повернення', dateStr]));
  rows.push(toCsvRow(['Час', timeStr]));

  if (data.originalSaleDate) {
    const origDate = new Date(data.originalSaleDate);
    rows.push(toCsvRow(['Дата продажу', origDate.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })]));
  }
  if (data.originalSaleId) {
    rows.push(toCsvRow(['№ продажу', data.originalSaleId.slice(-8)]));
  }

  // Customer info
  if (data.customerName) {
    rows.push('');
    rows.push(toCsvRow(['КЛІЄНТ']));
    rows.push(toCsvRow(["Ім'я", data.customerName]));
    if (data.customerPhone) {
      rows.push(toCsvRow(['Телефон', data.customerPhone]));
    }
    if (data.balanceBefore !== undefined && data.balanceAfter !== undefined) {
      rows.push(toCsvRow(['Баланс до', round2(data.balanceBefore)]));
      rows.push(toCsvRow(['Баланс після', round2(data.balanceAfter)]));
    }
  }

  rows.push('');

  // Items
  rows.push(toCsvRow(['ПОВЕРНЕНІ ТОВАРИ']));
  rows.push(toCsvRow(['№', 'Назва', 'Розмір', 'К-сть', 'Ціна', 'Сума', 'Склад до', 'Склад після']));

  let itemsTotal = 0;
  data.items.forEach((item, idx) => {
    const subtotal = item.qty * item.price;
    itemsTotal += subtotal;

    rows.push(toCsvRow([
      idx + 1,
      item.isCustom ? `${item.name} (${item.customNote || 'послуга'})` : item.name,
      item.size && item.size !== '-' ? `${item.size} см` : '-',
      item.qty,
      round2(item.price),
      round2(subtotal),
      item.stockBefore !== undefined ? item.stockBefore : '-',
      item.stockAfter !== undefined ? item.stockAfter : '-',
    ]));
  });

  rows.push('');
  rows.push(toCsvRow(['', '', '', '', '', 'СУМА ПОВЕРНЕННЯ:', round2(data.returnAmount), '']));

  // Reason
  if (data.reason) {
    rows.push('');
    rows.push(toCsvRow(['Причина', data.reason]));
  }

  const returnDateForFile = dateStr.replace(/\./g, '-');
  downloadCsv(rows.join('\n'), `return_${returnDateForFile}_${timeStr.replace(/:/g, '')}.csv`);
}
