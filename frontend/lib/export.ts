/**
 * Export Utilities
 *
 * Функції для експорту даних у XLSX формат з центруванням
 */

import * as XLSX from 'xlsx';
import type { Product } from "@/lib/types";
import type { Customer, DashboardData, Transaction, TransactionItem } from "@/lib/api-types";
import type { Activity, ShiftSummary } from "@/hooks/use-activity-log";

// ============================================
// Helper Functions
// ============================================

/**
 * Generate timestamp for filename
 */
function getTimestamp(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Apply center alignment to all cells in worksheet
 */
function applyCenterAlignment(ws: XLSX.WorkSheet): void {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;

      if (!ws[cellRef].s) ws[cellRef].s = {};
      ws[cellRef].s.alignment = { horizontal: 'center', vertical: 'center' };
    }
  }
}

/**
 * Set column widths based on content and limit range to actual data
 */
function setColumnWidths(ws: XLSX.WorkSheet, data: (string | number)[][]): void {
  if (data.length === 0) return;

  const numCols = data[0].length;
  const numRows = data.length;
  const colWidths: number[] = [];

  data.forEach(row => {
    row.forEach((cell, colIndex) => {
      const cellLength = String(cell).length;
      colWidths[colIndex] = Math.max(colWidths[colIndex] || 10, cellLength + 2);
    });
  });

  ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w, 40) }));

  // Explicitly set the range to only include actual data columns
  ws['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: numRows - 1, c: numCols - 1 }
  });
}

/**
 * Download workbook as xlsx file
 */
function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(wb, filename);
}

// ============================================
// Products Export
// ============================================

export function exportProducts(products: Product[]): void {
  const headers = ['Назва товару', 'Розмір (см)', 'Собівартість (грн)', 'Ціна (грн)', 'Кількість (шт)', 'Вартість закупки (грн)', 'Вартість продажу (грн)'];

  const rows: (string | number)[][] = [];

  products.forEach(product => {
    product.variants.forEach(variant => {
      const costPrice = (variant as { costPrice?: number }).costPrice ?? 0;
      const costValue = Math.round(costPrice * variant.stock * 100) / 100;
      const saleValue = Math.round(variant.price * variant.stock * 100) / 100;
      rows.push([
        product.name,
        variant.length,
        costPrice,
        variant.price,
        variant.stock,
        costValue,  // Вартість закупки
        saleValue,  // Вартість продажу
      ]);
    });
  });

  // Add summary row - сумуємо без проміжного округлення, округлюємо лише фінальний результат
  const totalStock = products.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.stock, 0), 0);
  const totalCostValue = products.reduce((sum, p) => sum + p.variants.reduce((s, v) => {
    const costPrice = (v as { costPrice?: number }).costPrice ?? 0;
    return s + costPrice * v.stock; // Без округлення
  }, 0), 0);
  const totalSaleValue = products.reduce((sum, p) => sum + p.variants.reduce((s, v) => {
    return s + v.price * v.stock; // Без округлення
  }, 0), 0);

  // Округлюємо тільки фінальні суми
  rows.push(['РАЗОМ', '', '', '', totalStock, Math.round(totalCostValue * 100) / 100, Math.round(totalSaleValue * 100) / 100]);

  const data = [headers, ...rows];

  const ws = XLSX.utils.aoa_to_sheet(data);
  applyCenterAlignment(ws);
  setColumnWidths(ws, data);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Товари');

  downloadWorkbook(wb, `products_${getTimestamp()}.xlsx`);
}

// ============================================
// Clients Export
// ============================================

export function exportClients(customers: Customer[]): void {
  const headers = ["Ім'я / Компанія", 'Тип', 'Телефон', 'Email', 'Адреса', 'Замовлень', 'Витрачено (грн)'];

  const rows: (string | number)[][] = customers.map(customer => [
    customer.name,
    customer.type === 'VIP' ? 'VIP' : customer.type === 'Wholesale' ? 'Оптовий' : 'Звичайний',
    customer.phone || '-',
    customer.email || '-',
    customer.address || '-',
    customer.orderCount,
    customer.totalSpent,
  ]);

  // Add summary row
  const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0);
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  rows.push(['РАЗОМ', `${customers.length} клієнтів`, '', '', '', totalOrders, totalSpent]);

  const data = [headers, ...rows];

  const ws = XLSX.utils.aoa_to_sheet(data);
  applyCenterAlignment(ws);
  setColumnWidths(ws, data);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Клієнти');

  downloadWorkbook(wb, `clients_${getTimestamp()}.xlsx`);
}

// ============================================
// Analytics Export
// ============================================

export function exportAnalytics(data: DashboardData): void {
  const headers = ['Дата', 'День', 'Замовлень', 'Виручка (грн)', 'Середній чек (грн)', 'Статус продажів'];

  const rows: (string | number)[][] = data.dailySales.map(sale => [
    sale.date,
    sale.day,
    sale.orders,
    sale.revenue,
    sale.avg,
    sale.status === 'high' ? 'Високі' : sale.status === 'mid' ? 'Середні' : 'Низькі',
  ]);

  // Add summary row
  const totalOrders = data.dailySales.reduce((sum, s) => sum + s.orders, 0);
  const totalRevenue = data.dailySales.reduce((sum, s) => sum + s.revenue, 0);
  const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  rows.push(['РАЗОМ', '', totalOrders, totalRevenue, avgCheck, '']);

  const sheetData = [headers, ...rows];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  applyCenterAlignment(ws);
  setColumnWidths(ws, sheetData);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Аналітика');

  downloadWorkbook(wb, `analytics_${getTimestamp()}.xlsx`);
}

// ============================================
// Shift Export
// ============================================

const activityTypeLabels: Record<string, string> = {
  sale: 'Продаж',
  writeOff: 'Списання',
  productEdit: 'Редагування товару',
  productCreate: 'Створення товару',
  productDelete: 'Видалення товару',
  paymentConfirm: 'Підтвердження оплати',
  customerCreate: 'Новий клієнт',
  customerDelete: 'Видалення клієнта',
  supply: 'Поставка',
};

function formatActivityDetails(activity: Activity): string {
  const { type, details } = activity;

  switch (type) {
    case 'sale':
      return `${details.customerName} - ${details.totalAmount} грн (${details.items?.length || 0} позицій)`;
    case 'writeOff':
      return `${details.flowerName} (${details.length} см) - ${details.qty} шт × ${details.price || 0} грн = ${details.amount || 0} грн`;
    case 'productEdit':
      return details.productName || '';
    case 'productCreate': {
      const variants = details.variants as Array<{ stock?: number; price?: number }> | undefined;
      const totalStock = variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
      const totalValue = variants?.reduce((sum, v) => sum + (v.stock || 0) * (v.price || 0), 0) || 0;
      return totalStock > 0
        ? `${details.productName} (+${totalStock} шт, ${Math.round(totalValue)} грн)`
        : details.productName || '';
    }
    case 'productDelete': {
      const variants = details.variants as Array<{ stock?: number; price?: number }> | undefined;
      const totalStock = variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
      const totalValue = variants?.reduce((sum, v) => sum + (v.stock || 0) * (v.price || 0), 0) || 0;
      return totalStock > 0
        ? `${details.productName} (−${totalStock} шт, −${Math.round(totalValue)} грн)`
        : details.productName || '';
    }
    case 'paymentConfirm':
      return `${details.customerName} - ${details.amount} грн`;
    case 'customerCreate':
      return `${details.customerName}${details.phone ? `, ${details.phone}` : ''}`;
    case 'supply': {
      const items = details.supplyItems as Array<{ flowerName?: string; stockBefore?: number; stockAfter?: number; priceAfter?: number }> | undefined;
      const totalQty = items?.reduce((sum, i) => sum + ((i.stockAfter || 0) - (i.stockBefore || 0)), 0) || 0;
      const totalValue = items?.reduce((sum, i) => sum + ((i.stockAfter || 0) - (i.stockBefore || 0)) * (i.priceAfter || 0), 0) || 0;
      return `+${totalQty} шт, ${Math.round(totalValue)} грн (${items?.length || 0} позицій)`;
    }
    default:
      return '';
  }
}

export function exportShift(
  activities: Activity[],
  summary: ShiftSummary,
  shiftStartedAt: string,
  shiftClosedAt?: string | null
): void {
  // Calculate detailed stats from activities
  let totalSuppliesAmount = 0;
  let totalSuppliesQty = 0;
  let totalWriteOffsAmount = 0;
  let totalWriteOffsQty = 0;
  let totalProductCreateQty = 0;
  let totalProductCreateAmount = 0;
  let totalProductDeleteQty = 0;
  let totalProductDeleteAmount = 0;

  activities.forEach(a => {
    if (a.type === 'supply' && a.details.supplyItems) {
      const items = a.details.supplyItems as Array<{ stockBefore?: number; stockAfter?: number; priceAfter?: number }>;
      items.forEach(item => {
        const qty = (item.stockAfter || 0) - (item.stockBefore || 0);
        totalSuppliesQty += qty;
        totalSuppliesAmount += qty * (item.priceAfter || 0);
      });
    } else if (a.type === 'writeOff') {
      totalWriteOffsQty += a.details.qty || 0;
      totalWriteOffsAmount += a.details.amount || 0;
    } else if (a.type === 'productCreate' && a.details.variants) {
      const variants = a.details.variants as Array<{ stock?: number; price?: number }>;
      variants.forEach(v => {
        totalProductCreateQty += v.stock || 0;
        totalProductCreateAmount += (v.stock || 0) * (v.price || 0);
      });
    } else if (a.type === 'productDelete' && a.details.variants) {
      const variants = a.details.variants as Array<{ stock?: number; price?: number }>;
      variants.forEach(v => {
        totalProductDeleteQty += v.stock || 0;
        totalProductDeleteAmount += (v.stock || 0) * (v.price || 0);
      });
    }
  });

  // Sheet 1: Summary
  const summaryHeaders = ['Показник', 'Значення'];
  const closedAtDate = shiftClosedAt ? new Date(shiftClosedAt) : new Date();
  const summaryRows: (string | number)[][] = [
    ['Початок зміни', new Date(shiftStartedAt).toLocaleString('uk-UA')],
    ['Закриття зміни', closedAtDate.toLocaleString('uk-UA')],
    ['', ''],
    ['═══ ПРОДАЖІ ═══', ''],
    ['Кількість продажів', summary.totalSales],
    ['Сума продажів (грн)', Math.round(summary.totalSalesAmount)],
    ['  - Оплачено (грн)', Math.round(summary.totalSalesPaid || 0)],
    ['  - Очікує оплати (грн)', Math.round(summary.totalSalesExpected || 0)],
    ['', ''],
    ['═══ ПОСТАВКИ ═══', ''],
    ['Кількість поставок', summary.totalSupplies || 0],
    ['Поставлено (шт)', totalSuppliesQty],
    ['Сума поставок (грн)', Math.round(totalSuppliesAmount)],
    ['', ''],
    ['═══ СПИСАННЯ ═══', ''],
    ['Кількість списань', summary.totalWriteOffs],
    ['Списано (шт)', totalWriteOffsQty],
    ['Сума списань (грн)', Math.round(totalWriteOffsAmount)],
    ['', ''],
  ];

  // Add product create/delete if any
  if (totalProductCreateQty > 0 || totalProductDeleteQty > 0) {
    summaryRows.push(['═══ ТОВАРИ ═══', '']);
    if (totalProductCreateQty > 0) {
      summaryRows.push(['Створено товарів з залишком (шт)', totalProductCreateQty]);
      summaryRows.push(['Вартість створених (грн)', Math.round(totalProductCreateAmount)]);
    }
    if (totalProductDeleteQty > 0) {
      summaryRows.push(['Видалено товарів з залишком (шт)', totalProductDeleteQty]);
      summaryRows.push(['Вартість видалених (грн)', Math.round(totalProductDeleteAmount)]);
    }
    summaryRows.push(['', '']);
  }

  // Balance change
  const balanceQtyChange = totalSuppliesQty + totalProductCreateQty - totalWriteOffsQty - totalProductDeleteQty;
  const balanceAmountChange = totalSuppliesAmount + totalProductCreateAmount - totalWriteOffsAmount - totalProductDeleteAmount;
  summaryRows.push(['═══ БАЛАНС СКЛАДУ ═══', '']);
  summaryRows.push(['Зміна залишків (шт)', balanceQtyChange >= 0 ? `+${balanceQtyChange}` : balanceQtyChange]);
  summaryRows.push(['Зміна вартості (грн)', balanceAmountChange >= 0 ? `+${Math.round(balanceAmountChange)}` : Math.round(balanceAmountChange)]);
  summaryRows.push(['', '']);
  summaryRows.push(['Всього дій за зміну', summary.activitiesCount]);

  const summaryData = [summaryHeaders, ...summaryRows];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  // Force range to exactly 2 columns
  summaryWs['!ref'] = `A1:B${summaryData.length}`;
  summaryWs['!cols'] = [{ wch: 30 }, { wch: 25 }];

  // Sheet 2: Sales Detail (with items breakdown)
  const salesActivities = activities.filter(a => a.type === 'sale');
  const salesHeaders = ['Час', 'Клієнт', 'Товар', 'Розмір', 'К-сть', 'Ціна', 'Сума', 'Статус оплати', 'Коментар'];
  const salesRows: (string | number)[][] = [];

  salesActivities.forEach(activity => {
    const { details, timestamp } = activity;
    const time = new Date(timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    const items = details.items || [];
    const paymentStatus = details.paymentStatus === 'paid' ? 'Оплачено' : 'Очікує оплати';
    const notes = details.notes || '';

    if (items.length === 0) {
      // Якщо немає деталей товарів
      salesRows.push([time, details.customerName || '-', '-', '-', '-', '-', details.totalAmount || 0, paymentStatus, notes]);
    } else {
      // Перший рядок з клієнтом
      items.forEach((item: { name: string; size: string; qty: number; price: number }, index: number) => {
        salesRows.push([
          index === 0 ? time : '',
          index === 0 ? (details.customerName || '-') : '',
          item.name,
          item.size,
          item.qty,
          item.price,
          item.qty * item.price,
          index === 0 ? paymentStatus : '',
          index === 0 ? notes : '',
        ]);
      });
      // Рядок з підсумком продажу
      salesRows.push(['', '', '', '', '', 'РАЗОМ:', details.totalAmount || 0, '', '']);
    }
  });

  // Загальний підсумок продажів
  if (salesRows.length > 0) {
    salesRows.push(['', '', '', '', '', '', '', '', '']);
    salesRows.push(['', '', '', '', '', 'ВСЬОГО:', summary.totalSalesAmount, '', '']);
  }

  const salesData = [salesHeaders, ...salesRows];
  const salesWs = XLSX.utils.aoa_to_sheet(salesData);
  applyCenterAlignment(salesWs);
  setColumnWidths(salesWs, salesData);

  // Sheet 3: Payment Confirmations
  const paymentConfirmActivities = activities.filter(a => a.type === 'paymentConfirm');
  const paymentsHeaders = ['Дата підтвердження', 'Клієнт', 'Дата замовлення', 'Товари', 'Сума (грн)', 'Примітка'];
  const paymentsRows: (string | number)[][] = paymentConfirmActivities.map(activity => {
    const { details, timestamp } = activity;
    const confirmDate = new Date(timestamp).toLocaleString('uk-UA');
    const orderDate = details.orderDate ? new Date(details.orderDate).toLocaleDateString('uk-UA') : '-';
    const items = Array.isArray(details.paymentItems)
      ? details.paymentItems.map((item) =>
          `${item.name}${item.length ? ` (${item.length} см)` : ''} × ${item.qty}`
        ).join(', ')
      : '-';
    return [
      confirmDate,
      details.customerName || '-',
      orderDate,
      items,
      Math.round(details.amount || 0),
      details.notes || '',
    ];
  });

  const paymentsData = [paymentsHeaders, ...paymentsRows];
  const paymentsWs = XLSX.utils.aoa_to_sheet(paymentsData);
  applyCenterAlignment(paymentsWs);
  setColumnWidths(paymentsWs, paymentsData);

  // Sheet 4: Supplies Detail
  const supplyActivities = activities.filter(a => a.type === 'supply');
  const suppliesHeaders = ['Час', 'Товар', 'Розмір', 'Було (шт)', 'Стало (шт)', 'Додано (шт)', 'Ціна (грн)', 'Сума (грн)'];
  const suppliesRows: (string | number)[][] = [];

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

    items.forEach((item, index) => {
      const qty = (item.stockAfter || 0) - (item.stockBefore || 0);
      suppliesRows.push([
        index === 0 ? time : '',
        item.flowerName || '-',
        item.length ? `${item.length} см` : '-',
        item.stockBefore || 0,
        item.stockAfter || 0,
        qty,
        item.priceAfter || 0,
        Math.round(qty * (item.priceAfter || 0)),
      ]);
    });
  });

  // Add totals
  if (suppliesRows.length > 0) {
    suppliesRows.push(['', '', '', '', '', '', '', '']);
    suppliesRows.push(['', '', '', '', 'РАЗОМ:', totalSuppliesQty, '', Math.round(totalSuppliesAmount)]);
  }

  const suppliesData = [suppliesHeaders, ...suppliesRows];
  const suppliesWs = XLSX.utils.aoa_to_sheet(suppliesData);
  applyCenterAlignment(suppliesWs);
  setColumnWidths(suppliesWs, suppliesData);

  // Sheet 5: Write-offs Detail
  const writeOffActivities = activities.filter(a => a.type === 'writeOff' || a.type === 'productDelete');
  const writeOffsHeaders = ['Час', 'Тип', 'Товар', 'Розмір', 'К-сть (шт)', 'Ціна (грн)', 'Сума (грн)', 'Причина'];
  const writeOffsRows: (string | number)[][] = [];

  const reasonLabels: Record<string, string> = {
    damaged: 'Пошкоджено',
    expired: 'Зів\'яло',
    lost: 'Втрачено',
    sample: 'Зразок',
    gift: 'Подарунок',
    other: 'Інше',
  };

  writeOffActivities.forEach(activity => {
    const { type, details, timestamp } = activity;
    const time = new Date(timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

    if (type === 'writeOff') {
      writeOffsRows.push([
        time,
        'Списання',
        details.flowerName || '-',
        details.length ? `${details.length} см` : '-',
        details.qty || 0,
        details.price || 0,
        Math.round(details.amount || 0),
        (details.reason && reasonLabels[details.reason]) || details.reason || '-',
      ]);
    } else if (type === 'productDelete') {
      const variants = (details.variants || []) as Array<{ size?: string; stock?: number; price?: number }>;
      variants.forEach((v, index) => {
        if ((v.stock || 0) > 0) {
          writeOffsRows.push([
            index === 0 ? time : '',
            index === 0 ? 'Видалення товару' : '',
            index === 0 ? (details.productName || '-') : '',
            v.size || '-',
            v.stock || 0,
            v.price || 0,
            Math.round((v.stock || 0) * (v.price || 0)),
            'Видалено з каталогу',
          ]);
        }
      });
    }
  });

  // Add totals
  const totalWriteOffQtyForSheet = totalWriteOffsQty + totalProductDeleteQty;
  const totalWriteOffAmountForSheet = totalWriteOffsAmount + totalProductDeleteAmount;
  if (writeOffsRows.length > 0) {
    writeOffsRows.push(['', '', '', '', '', '', '', '']);
    writeOffsRows.push(['', '', '', 'РАЗОМ:', totalWriteOffQtyForSheet, '', Math.round(totalWriteOffAmountForSheet), '']);
  }

  const writeOffsData = [writeOffsHeaders, ...writeOffsRows];
  const writeOffsWs = XLSX.utils.aoa_to_sheet(writeOffsData);
  applyCenterAlignment(writeOffsWs);
  setColumnWidths(writeOffsWs, writeOffsData);

  // Sheet 6: All Activities
  const activitiesHeaders = ['Час', 'Тип дії', 'Деталі'];
  const activitiesRows: (string | number)[][] = [...activities].reverse().map(activity => [
    new Date(activity.timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    activityTypeLabels[activity.type] || activity.type,
    formatActivityDetails(activity),
  ]);

  const activitiesData = [activitiesHeaders, ...activitiesRows];
  const activitiesWs = XLSX.utils.aoa_to_sheet(activitiesData);
  applyCenterAlignment(activitiesWs);
  setColumnWidths(activitiesWs, activitiesData);

  // Create workbook with all sheets
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Підсумок');
  XLSX.utils.book_append_sheet(wb, salesWs, 'Продажі');
  if (paymentConfirmActivities.length > 0) {
    XLSX.utils.book_append_sheet(wb, paymentsWs, 'Оплати');
  }
  if (supplyActivities.length > 0) {
    XLSX.utils.book_append_sheet(wb, suppliesWs, 'Поставки');
  }
  if (writeOffActivities.length > 0) {
    XLSX.utils.book_append_sheet(wb, writeOffsWs, 'Списання');
  }
  XLSX.utils.book_append_sheet(wb, activitiesWs, 'Всі дії');

  const shiftDate = new Date(shiftStartedAt);
  const dateStr = `${shiftDate.getFullYear()}-${String(shiftDate.getMonth() + 1).padStart(2, '0')}-${String(shiftDate.getDate()).padStart(2, '0')}`;
  downloadWorkbook(wb, `shift_${dateStr}.xlsx`);
}

// ============================================
// Client Transactions Export
// ============================================

/**
 * Export client transactions with detailed information
 */
export function exportClientTransactions(
  customer: Customer,
  transactions: Transaction[],
  balance: number
): void {
  // Sheet 1: Client Summary
  const summaryHeaders = ['Показник', 'Значення'];
  const summaryRows: (string | number)[][] = [
    ["Ім'я / Компанія", customer.name],
    ['Тип клієнта', customer.type === 'VIP' ? 'VIP' : customer.type === 'Wholesale' ? 'Оптовий' : 'Звичайний'],
    ['Телефон', customer.phone || '-'],
    ['Email', customer.email || '-'],
    ['Адреса', customer.address || '-'],
    ['', ''],
    ['═══ СТАТИСТИКА ═══', ''],
    ['Всього замовлень', transactions.length],
    ['Загальна сума покупок (грн)', Math.round(transactions.reduce((sum, t) => sum + (t.amount || 0), 0))],
    ['', ''],
    ['═══ БАЛАНС ═══', ''],
    ['Поточний баланс (грн)', balance],
    ['Статус', balance > 0 ? 'Переплата' : balance < 0 ? 'Борг' : 'По нулях'],
  ];

  const summaryData = [summaryHeaders, ...summaryRows];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs['!ref'] = `A1:B${summaryData.length}`;
  summaryWs['!cols'] = [{ wch: 25 }, { wch: 35 }];

  // Sheet 2: All Transactions
  const transactionsHeaders = ['Дата', 'Час', 'Товар', 'Розмір', 'К-сть', 'Ціна (грн)', 'Сума (грн)', 'Статус оплати', 'Коментар'];
  const transactionsRows: (string | number)[][] = [];

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const dateStr = date.toLocaleDateString('uk-UA');
    const timeStr = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    const paymentStatus = transaction.paymentStatus === 'paid' ? 'Оплачено' :
                          transaction.paymentStatus === 'expected' ? 'Очікує оплати' :
                          transaction.paymentStatus === 'cancelled' ? 'Скасовано' : 'В очікуванні';

    if (!transaction.items || transaction.items.length === 0) {
      transactionsRows.push([dateStr, timeStr, '-', '-', '-', '-', transaction.amount || 0, paymentStatus, transaction.notes || '']);
    } else {
      transaction.items.forEach((item: TransactionItem, index: number) => {
        transactionsRows.push([
          index === 0 ? dateStr : '',
          index === 0 ? timeStr : '',
          item.name,
          item.length ? `${item.length} см` : '-',
          item.qty,
          item.price,
          item.subtotal || (item.qty * item.price),
          index === 0 ? paymentStatus : '',
          index === 0 ? (transaction.notes || '') : '',
        ]);
      });
      // Add subtotal row for this transaction
      transactionsRows.push(['', '', '', '', '', 'Разом:', transaction.amount || 0, '', '']);
    }
  });

  // Add total summary
  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const paidAmount = transactions.filter(t => t.paymentStatus === 'paid').reduce((sum, t) => sum + (t.amount || 0), 0);
  const pendingAmount = transactions.filter(t => t.paymentStatus === 'expected' || t.paymentStatus === 'pending').reduce((sum, t) => sum + (t.amount || 0), 0);

  transactionsRows.push(['', '', '', '', '', '', '', '', '']);
  transactionsRows.push(['', '', '', '', '', 'ВСЬОГО:', Math.round(totalAmount), '', '']);
  transactionsRows.push(['', '', '', '', '', 'Оплачено:', Math.round(paidAmount), '', '']);
  transactionsRows.push(['', '', '', '', '', 'Очікується:', Math.round(pendingAmount), '', '']);

  const transactionsData = [transactionsHeaders, ...transactionsRows];
  const transactionsWs = XLSX.utils.aoa_to_sheet(transactionsData);
  applyCenterAlignment(transactionsWs);
  setColumnWidths(transactionsWs, transactionsData);

  // Sheet 3: Payment History (only paid transactions)
  const paidTransactions = transactions.filter(t => t.paymentStatus === 'paid');
  const paymentsHeaders = ['Дата оплати', 'Дата замовлення', 'Сума (грн)', 'Товари'];
  const paymentsRows: (string | number)[][] = paidTransactions.map(t => {
    const paymentDate = t.paymentDate ? new Date(t.paymentDate).toLocaleDateString('uk-UA') : new Date(t.date).toLocaleDateString('uk-UA');
    const orderDate = new Date(t.date).toLocaleDateString('uk-UA');
    const itemsStr = t.items?.map((item: TransactionItem) => `${item.name} (${item.length}см) × ${item.qty}`).join(', ') || '-';
    return [paymentDate, orderDate, t.amount || 0, itemsStr];
  });

  // Add totals
  if (paymentsRows.length > 0) {
    paymentsRows.push(['', 'ВСЬОГО:', Math.round(paidAmount), '']);
  }

  const paymentsData = [paymentsHeaders, ...paymentsRows];
  const paymentsWs = XLSX.utils.aoa_to_sheet(paymentsData);
  applyCenterAlignment(paymentsWs);
  setColumnWidths(paymentsWs, paymentsData);

  // Sheet 4: Pending Payments
  const pendingTransactions = transactions.filter(t => t.paymentStatus === 'expected' || t.paymentStatus === 'pending');
  const pendingHeaders = ['Дата замовлення', 'Сума (грн)', 'Товари', 'Коментар'];
  const pendingRows: (string | number)[][] = pendingTransactions.map(t => {
    const orderDate = new Date(t.date).toLocaleDateString('uk-UA');
    const itemsStr = t.items?.map((item: TransactionItem) => `${item.name} (${item.length}см) × ${item.qty}`).join(', ') || '-';
    return [orderDate, t.amount || 0, itemsStr, t.notes || ''];
  });

  // Add totals
  if (pendingRows.length > 0) {
    pendingRows.push(['ВСЬОГО:', Math.round(pendingAmount), '', '']);
  }

  const pendingData = [pendingHeaders, ...pendingRows];
  const pendingWs = XLSX.utils.aoa_to_sheet(pendingData);
  applyCenterAlignment(pendingWs);
  setColumnWidths(pendingWs, pendingData);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Клієнт');
  XLSX.utils.book_append_sheet(wb, transactionsWs, 'Всі замовлення');
  if (paidTransactions.length > 0) {
    XLSX.utils.book_append_sheet(wb, paymentsWs, 'Оплачені');
  }
  if (pendingTransactions.length > 0) {
    XLSX.utils.book_append_sheet(wb, pendingWs, 'Очікують оплати');
  }

  // Generate safe filename
  const safeName = customer.name.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄ0-9]/g, '_').slice(0, 30);
  downloadWorkbook(wb, `client_${safeName}_${getTimestamp()}.xlsx`);
}
