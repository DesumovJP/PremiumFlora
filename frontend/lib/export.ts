/**
 * Export Utilities
 *
 * Функції для експорту даних у XLSX формат з центруванням
 */

import * as XLSX from 'xlsx';
import type { Product } from "@/lib/types";
import type { Customer, DashboardData } from "@/lib/api-types";
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
 * Set column widths based on content
 */
function setColumnWidths(ws: XLSX.WorkSheet, data: (string | number)[][]): void {
  const colWidths: number[] = [];

  data.forEach(row => {
    row.forEach((cell, colIndex) => {
      const cellLength = String(cell).length;
      colWidths[colIndex] = Math.max(colWidths[colIndex] || 10, cellLength + 2);
    });
  });

  ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w, 40) }));
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
  const headers = ['Назва товару', 'Розмір (см)', 'Ціна (грн)', 'Кількість (шт)', 'Загальна вартість (грн)'];

  const rows: (string | number)[][] = [];

  products.forEach(product => {
    product.variants.forEach(variant => {
      rows.push([
        product.name,
        variant.length,
        variant.price,
        variant.stock,
        variant.price * variant.stock,
      ]);
    });
  });

  // Add summary row
  const totalStock = products.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.stock, 0), 0);
  const totalValue = products.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.price * v.stock, 0), 0);

  rows.push(['РАЗОМ', '', '', totalStock, totalValue]);

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
  supply: 'Поставка',
};

function formatActivityDetails(activity: Activity): string {
  const { type, details } = activity;

  switch (type) {
    case 'sale':
      return `${details.customerName} - ${details.totalAmount} грн (${details.items?.length || 0} позицій)`;
    case 'writeOff':
      return `${details.flowerName} (${details.length} см) - ${details.qty} шт, причина: ${details.reason}`;
    case 'productEdit':
    case 'productCreate':
    case 'productDelete':
      return details.productName || '';
    case 'paymentConfirm':
      return `${details.customerName} - ${details.amount} грн`;
    case 'customerCreate':
      return `${details.customerName}${details.phone ? `, ${details.phone}` : ''}`;
    default:
      return JSON.stringify(details);
  }
}

export function exportShift(
  activities: Activity[],
  summary: ShiftSummary,
  shiftStartedAt: string
): void {
  // Sheet 1: Summary
  const summaryHeaders = ['Показник', 'Значення'];
  const summaryRows: (string | number)[][] = [
    ['Початок зміни', new Date(shiftStartedAt).toLocaleString('uk-UA')],
    ['Закриття зміни', new Date().toLocaleString('uk-UA')],
    ['', ''],
    ['Кількість продажів', summary.totalSales],
    ['Сума продажів (грн)', summary.totalSalesAmount],
    ['Кількість списань', summary.totalWriteOffs],
    ['Списано штук', summary.totalWriteOffsQty],
    ['Редагувань товарів', summary.productEdits],
    ['Нових клієнтів', summary.customersCreated],
    ['Всього дій', summary.activitiesCount],
  ];

  const summaryData = [summaryHeaders, ...summaryRows];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  applyCenterAlignment(summaryWs);
  setColumnWidths(summaryWs, summaryData);

  // Sheet 2: Activities Detail
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

  // Create workbook with both sheets
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Підсумок');
  XLSX.utils.book_append_sheet(wb, activitiesWs, 'Деталі');

  downloadWorkbook(wb, `shift_${getTimestamp()}.xlsx`);
}
