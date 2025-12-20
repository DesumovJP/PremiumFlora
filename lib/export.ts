/**
 * Export Utilities
 *
 * Функції для експорту даних у CSV формат
 */

import type { Product } from "@/lib/types";
import type { Customer, DashboardData } from "@/lib/api-types";

// ============================================
// Helper Functions
// ============================================

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSV(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Download file with given content
 */
function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate timestamp for filename
 */
function getTimestamp(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// ============================================
// Products Export
// ============================================

export function exportProducts(products: Product[]): void {
  // BOM for UTF-8
  const BOM = '\uFEFF';

  const headers = ['Назва товару', 'Розмір (см)', 'Ціна (грн)', 'Кількість (шт)', 'Загальна вартість (грн)'];

  const rows: string[][] = [];

  products.forEach(product => {
    product.variants.forEach(variant => {
      rows.push([
        product.name,
        String(variant.length),
        String(variant.price),
        String(variant.stock),
        String(variant.price * variant.stock),
      ]);
    });
  });

  // Add summary row
  const totalStock = products.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.stock, 0), 0);
  const totalValue = products.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.price * v.stock, 0), 0);

  rows.push(['РАЗОМ', '', '', String(totalStock), String(totalValue)]);

  const csv = BOM + [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  downloadFile(csv, `products_${getTimestamp()}.csv`);
}

// ============================================
// Clients Export
// ============================================

export function exportClients(customers: Customer[]): void {
  const BOM = '\uFEFF';

  const headers = ["Ім'я / Компанія", 'Тип', 'Телефон', 'Email', 'Адреса', 'Замовлень', 'Витрачено (грн)'];

  const rows = customers.map(customer => [
    customer.name,
    customer.type === 'VIP' ? 'VIP' : customer.type === 'Wholesale' ? 'Оптовий' : 'Звичайний',
    customer.phone || '-',
    customer.email || '-',
    customer.address || '-',
    String(customer.orderCount),
    String(customer.totalSpent),
  ]);

  // Add summary row
  const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0);
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  rows.push(['РАЗОМ', `${customers.length} клієнтів`, '', '', '', String(totalOrders), String(totalSpent)]);

  const csv = BOM + [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  downloadFile(csv, `clients_${getTimestamp()}.csv`);
}

// ============================================
// Analytics Export
// ============================================

export function exportAnalytics(data: DashboardData): void {
  const BOM = '\uFEFF';

  const headers = ['Дата', 'День', 'Замовлень', 'Виручка (грн)', 'Середній чек (грн)', 'Статус продажів'];

  const rows = data.dailySales.map(sale => [
    sale.date,
    sale.day,
    String(sale.orders),
    String(sale.revenue),
    String(sale.avg),
    sale.status === 'high' ? 'Високі' : sale.status === 'mid' ? 'Середні' : 'Низькі',
  ]);

  // Add summary row
  const totalOrders = data.dailySales.reduce((sum, s) => sum + s.orders, 0);
  const totalRevenue = data.dailySales.reduce((sum, s) => sum + s.revenue, 0);
  const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  rows.push(['РАЗОМ', '', String(totalOrders), String(totalRevenue), String(avgCheck), '']);

  const csv = BOM + [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  downloadFile(csv, `analytics_${getTimestamp()}.csv`);
}
