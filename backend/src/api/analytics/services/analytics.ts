/**
 * Analytics Service
 *
 * Сервіс для агрегації реальних даних з БД:
 * - KPI метрики
 * - Рівні складу
 * - Продажі по періодах
 * - Списання
 * - Топ клієнти
 *
 * Включає in-memory кешування для оптимізації
 */

import type { Core } from '@strapi/strapi';

// ============================================
// Cache Configuration
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 3 * 60 * 1000; // 3 хвилини

// Глобальний кеш для аналітики
const analyticsCache: {
  dashboard?: CacheEntry<unknown>;
  stock?: CacheEntry<unknown>;
} = {};

/**
 * Інвалідувати кеш аналітики
 * Викликати після операцій що змінюють дані (продажі, списання, тощо)
 */
export function invalidateAnalyticsCache(): void {
  analyticsCache.dashboard = undefined;
  analyticsCache.stock = undefined;
  strapi.log.debug('[Analytics] Cache invalidated');
}

/**
 * Перевірити чи кеш валідний
 */
function isCacheValid<T>(entry?: CacheEntry<T>): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

// Types
interface StockLevel {
  flowerSlug: string;
  flowerName: string;
  length: number;
  stock: number;
  price: number;
  value: number;
}

interface SaleMetrics {
  period: string;
  totalSales: number;
  totalAmount: number;
  avgOrderValue: number;
  itemsSold: number;
}

interface WriteOffSummary {
  totalWriteOffs: number;
  totalItems: number;
  byReason: Record<string, number>;
  recentWriteOffs: Array<{
    date: string;
    flowerName: string;
    length: number;
    qty: number;
    reason: string;
  }>;
}

interface TopCustomer {
  id: string;
  documentId: string;
  name: string;
  type: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string | null;
}

interface DailySale {
  date: string;
  day: string;
  orders: number;
  revenue: number;
  avg: number;
  status: 'high' | 'mid' | 'low';
  writeOffs: number; // Кількість списань за день
  supplyAmount: number; // Сума поставки за день
}

interface TopWriteOffFlower {
  name: string;
  totalQty: number;
  totalAmount: number;
  percentage: number;
}

interface KpiData {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

interface CategorySplit {
  name: string;
  value: number;
  color: string;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Отримати рівні складу (тільки варіанти з опублікованими квітками)
   */
  async getStockLevels(): Promise<StockLevel[]> {
    const variants = await strapi.db.query('api::variant.variant').findMany({
      where: {
        flower: { id: { $notNull: true } },
      },
      populate: ['flower'],
      orderBy: { stock: 'asc' },
    });

    // Фільтруємо тільки варіанти з опублікованими квітками
    const publishedVariants = variants.filter((v: { flower?: { publishedAt?: string } }) =>
      v.flower && v.flower.publishedAt
    );

    return publishedVariants.map((v: {
      id: number;
      length: number;
      stock: number;
      price: number;
      flower?: { slug: string; name: string };
    }) => ({
      flowerSlug: v.flower?.slug || 'unknown',
      flowerName: v.flower?.name || 'Unknown',
      length: v.length,
      stock: v.stock,
      price: Number(v.price),
      value: v.stock * Number(v.price),
    }));
  },

  /**
   * Отримати метрики продажів за період
   */
  async getSalesMetrics(period: 'day' | 'week' | 'month' = 'week'): Promise<SaleMetrics> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const transactions = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'sale',
        date: { $gte: startDate.toISOString() },
        paymentStatus: { $in: ['paid', 'expected'] },
      },
    });

    const totalSales = transactions.length;
    const totalAmount = transactions.reduce((sum: number, t: { amount: number }) => sum + (t.amount || 0), 0);
    const itemsSold = transactions.reduce((sum: number, t: { items: Array<{ qty: number }> }) => {
      const items = t.items || [];
      return sum + items.reduce((s, item) => s + (item.qty || 0), 0);
    }, 0);

    return {
      period,
      totalSales,
      totalAmount,
      avgOrderValue: totalSales > 0 ? Math.round(totalAmount / totalSales) : 0,
      itemsSold,
    };
  },

  /**
   * Отримати підсумок списань
   */
  async getWriteOffSummary(): Promise<WriteOffSummary> {
    const writeOffs = await strapi.db.query('api::transaction.transaction').findMany({
      where: { type: 'writeOff' },
      orderBy: { date: 'desc' },
      limit: 50,
    });

    const byReason: Record<string, number> = {
      damage: 0,
      expiry: 0,
      adjustment: 0,
      other: 0,
    };

    let totalItems = 0;

    writeOffs.forEach((wo: { writeOffReason: string; items: Array<{ qty: number }> }) => {
      const reason = wo.writeOffReason || 'other';
      const items = wo.items || [];
      const qty = items.reduce((s, item) => s + (item.qty || 0), 0);

      byReason[reason] = (byReason[reason] || 0) + qty;
      totalItems += qty;
    });

    const recentWriteOffs = writeOffs.slice(0, 10).map((wo: {
      date: string;
      writeOffReason: string;
      items: Array<{ name: string; length: number; qty: number }>;
    }) => {
      const item = (wo.items || [])[0] || { name: '', length: 0, qty: 0 };
      return {
        date: wo.date,
        flowerName: item.name || 'Unknown',
        length: item.length || 0,
        qty: item.qty || 0,
        reason: wo.writeOffReason || 'other',
      };
    });

    return {
      totalWriteOffs: writeOffs.length,
      totalItems,
      byReason,
      recentWriteOffs,
    };
  },

  /**
   * Отримати топ клієнтів
   */
  async getTopCustomers(limit: number = 10): Promise<TopCustomer[]> {
    const customers = await strapi.db.query('api::customer.customer').findMany({
      orderBy: { totalSpent: 'desc' },
      limit,
      populate: ['transactions'],
    });

    return customers.map((c: {
      id: number;
      documentId: string;
      name: string;
      type: string;
      totalSpent: number;
      orderCount: number;
      transactions?: Array<{ date: string }>;
    }) => {
      const lastOrder = (c.transactions || [])
        .map(t => new Date(t.date))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      return {
        id: String(c.id),
        documentId: c.documentId,
        name: c.name,
        type: c.type || 'Regular',
        totalSpent: Number(c.totalSpent) || 0,
        orderCount: c.orderCount || 0,
        lastOrderDate: lastOrder?.toISOString() || null,
      };
    });
  },

  /**
   * Отримати щоденні продажі та списання за вказаний місяць
   */
  async getDailySales(year?: number, month?: number): Promise<DailySale[]> {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth();
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

    // Отримуємо продажі
    const sales = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'sale',
        date: { $gte: startOfMonth.toISOString(), $lte: endOfMonth.toISOString() },
        paymentStatus: { $in: ['paid', 'expected'] },
      },
    });

    // Отримуємо списання за цей місяць
    const writeOffs = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'writeOff',
        date: { $gte: startOfMonth.toISOString(), $lte: endOfMonth.toISOString() },
      },
    });

    // Отримуємо поставки за цей місяць
    const supplies = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'supply',
        date: { $gte: startOfMonth.toISOString(), $lte: endOfMonth.toISOString() },
      },
    });

    // Групувати продажі по днях
    const dailyMap = new Map<string, { orders: number; revenue: number; writeOffs: number; supplyAmount: number }>();

    sales.forEach((t: { date: string; amount: number }) => {
      const date = new Date(t.date);
      const key = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;

      const existing = dailyMap.get(key) || { orders: 0, revenue: 0, writeOffs: 0, supplyAmount: 0 };
      dailyMap.set(key, {
        ...existing,
        orders: existing.orders + 1,
        revenue: existing.revenue + (t.amount || 0),
      });
    });

    // Додаємо списання по днях
    writeOffs.forEach((wo: { date: string; items: Array<{ qty: number }> }) => {
      const date = new Date(wo.date);
      const key = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;

      const items = wo.items || [];
      const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);

      const existing = dailyMap.get(key) || { orders: 0, revenue: 0, writeOffs: 0, supplyAmount: 0 };
      dailyMap.set(key, {
        ...existing,
        writeOffs: existing.writeOffs + totalQty,
      });
    });

    // Додаємо поставки по днях
    supplies.forEach((s: { date: string; amount: number }) => {
      const date = new Date(s.date);
      const key = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;

      const existing = dailyMap.get(key) || { orders: 0, revenue: 0, writeOffs: 0, supplyAmount: 0 };
      dailyMap.set(key, {
        ...existing,
        supplyAmount: existing.supplyAmount + (s.amount || 0),
      });
    });

    const daysOfWeek = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const result: DailySale[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      const key = `${String(day).padStart(2, '0')}.${String(targetMonth + 1).padStart(2, '0')}`;
      const data = dailyMap.get(key) || { orders: 0, revenue: 0, writeOffs: 0, supplyAmount: 0 };

      let status: 'high' | 'mid' | 'low' = 'low';
      if (data.orders >= 7) status = 'high';
      else if (data.orders >= 4) status = 'mid';

      result.push({
        date: key,
        day: daysOfWeek[date.getDay()],
        orders: data.orders,
        revenue: data.revenue,
        avg: data.orders > 0 ? Math.round(data.revenue / data.orders) : 0,
        status,
        writeOffs: data.writeOffs,
        supplyAmount: data.supplyAmount,
      });
    }

    return result;
  },

  /**
   * Отримати топ-5 квітів з найбільшим списанням
   */
  async getTopWriteOffFlowers(): Promise<TopWriteOffFlower[]> {
    const writeOffs = await strapi.db.query('api::transaction.transaction').findMany({
      where: { type: 'writeOff' },
    });

    // Агрегувати по квіткам
    const flowerMap = new Map<string, { qty: number; amount: number }>();
    let totalQty = 0;

    writeOffs.forEach((wo: { items: Array<{ name: string; qty: number; price: number }> }) => {
      (wo.items || []).forEach((item) => {
        const qty = item.qty || 0;
        const amount = qty * (item.price || 0);

        const existing = flowerMap.get(item.name) || { qty: 0, amount: 0 };
        flowerMap.set(item.name, {
          qty: existing.qty + qty,
          amount: existing.amount + amount,
        });
        totalQty += qty;
      });
    });

    // Сортувати по кількості і взяти топ-5
    const sorted = Array.from(flowerMap.entries())
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5);

    return sorted.map(([name, data]) => ({
      name,
      totalQty: data.qty,
      totalAmount: data.amount,
      percentage: totalQty > 0 ? Math.round((data.qty / totalQty) * 100) : 0,
    }));
  },

  /**
   * Отримати тижневу виручку (4 тижні вибраного місяця)
   */
  async getWeeklyRevenue(year?: number, month?: number): Promise<number[]> {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth();

    // Отримуємо всі транзакції за місяць
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const transactions = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'sale',
        date: {
          $gte: startOfMonth.toISOString(),
          $lte: endOfMonth.toISOString(),
        },
        paymentStatus: { $in: ['paid', 'expected'] },
      },
    });

    // Групуємо по тижнях місяця
    const weeklyRevenue: number[] = [0, 0, 0, 0, 0];

    transactions.forEach((t: { date: string; amount: number }) => {
      const transDate = new Date(t.date);
      const dayOfMonth = transDate.getDate();
      const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 4);
      weeklyRevenue[weekIndex] += t.amount || 0;
    });

    // Повертаємо тільки заповнені тижні (до 4)
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const weeksInMonth = Math.ceil(daysInMonth / 7);
    return weeklyRevenue.slice(0, Math.min(weeksInMonth, 4));
  },

  /**
   * Отримати кількість замовлень по тижнях вибраного місяця
   */
  async getOrdersPerWeek(year?: number, month?: number): Promise<number[]> {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth();

    // Отримуємо всі транзакції за місяць
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const transactions = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'sale',
        date: {
          $gte: startOfMonth.toISOString(),
          $lte: endOfMonth.toISOString(),
        },
        paymentStatus: { $in: ['paid', 'expected'] },
      },
    });

    // Групуємо по тижнях місяця
    const weeklyOrders: number[] = [0, 0, 0, 0, 0];

    transactions.forEach((t: { date: string }) => {
      const transDate = new Date(t.date);
      const dayOfMonth = transDate.getDate();
      const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 4);
      weeklyOrders[weekIndex] += 1;
    });

    // Повертаємо тільки заповнені тижні (до 4)
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const weeksInMonth = Math.ceil(daysInMonth / 7);
    return weeklyOrders.slice(0, Math.min(weeksInMonth, 4));
  },

  /**
   * Отримати KPI метрики за вказаний місяць
   */
  async getKpis(year?: number, month?: number): Promise<KpiData[]> {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
    const startOfLastMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfLastMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Продажі вибраного місяця
    const currentSales = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'sale',
        date: { $gte: startOfMonth.toISOString(), $lte: endOfMonth.toISOString() },
        paymentStatus: { $in: ['paid', 'expected'] },
      },
    });

    // Продажі попереднього місяця
    const lastSales = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'sale',
        date: {
          $gte: startOfLastMonth.toISOString(),
          $lte: endOfLastMonth.toISOString(),
        },
        paymentStatus: { $in: ['paid', 'expected'] },
      },
    });

    const currentRevenue = currentSales.reduce((sum: number, t: { amount: number }) => sum + (t.amount || 0), 0);
    const lastRevenue = lastSales.reduce((sum: number, t: { amount: number }) => sum + (t.amount || 0), 0);
    const revenueChange = lastRevenue > 0 ? Math.round((currentRevenue - lastRevenue) / lastRevenue * 100) : 0;

    const currentOrders = currentSales.length;
    const lastOrders = lastSales.length;
    const ordersChange = lastOrders > 0 ? Math.round((currentOrders - lastOrders) / lastOrders * 100) : 0;

    const avgOrderCurrent = currentOrders > 0 ? Math.round(currentRevenue / currentOrders) : 0;
    const avgOrderLast = lastOrders > 0 ? Math.round(lastRevenue / lastOrders) : 0;
    const avgOrderChange = avgOrderLast > 0 ? Math.round((avgOrderCurrent - avgOrderLast) / avgOrderLast * 100) : 0;

    // Клієнти
    const totalCustomers = await strapi.db.query('api::customer.customer').count({});
    const newCustomersThisMonth = await strapi.db.query('api::customer.customer').count({
      where: {
        createdAt: { $gte: startOfMonth.toISOString() },
      },
    });

    // Склад - рахуємо тільки варіанти що мають прив'язану квітку (для консистентності з UI)
    const variants = await strapi.db.query('api::variant.variant').findMany({
      where: {
        flower: { id: { $notNull: true } },
      },
      populate: ['flower'],
    });
    // Фільтруємо тільки варіанти з опублікованими квітками
    const publishedVariants = variants.filter((v: { flower?: { publishedAt?: string } }) =>
      v.flower && v.flower.publishedAt
    );
    const totalStock = publishedVariants.reduce((sum: number, v: { stock: number }) => sum + (v.stock || 0), 0);
    const stockValue = publishedVariants.reduce((sum: number, v: { stock: number; price: number }) =>
      sum + (v.stock || 0) * Number(v.price || 0), 0);

    return [
      {
        label: 'Виручка',
        value: `${currentRevenue.toLocaleString('uk-UA')} грн`,
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
        trend: revenueChange >= 0 ? 'up' : 'down',
      },
      {
        label: 'Замовлень',
        value: String(currentOrders),
        change: `${ordersChange >= 0 ? '+' : ''}${ordersChange}%`,
        trend: ordersChange >= 0 ? 'up' : 'down',
      },
      {
        label: 'Середній чек',
        value: `${avgOrderCurrent.toLocaleString('uk-UA')} грн`,
        change: `${avgOrderChange >= 0 ? '+' : ''}${avgOrderChange}%`,
        trend: avgOrderChange >= 0 ? 'up' : 'down',
      },
      {
        label: 'Клієнтів',
        value: String(totalCustomers),
        change: `+${newCustomersThisMonth} нових`,
        trend: 'up',
      },
      {
        label: 'На складі',
        value: `${totalStock.toLocaleString('uk-UA')} шт`,
        change: `${stockValue.toLocaleString('uk-UA')} грн`,
        trend: 'neutral',
      },
    ];
  },

  /**
   * Отримати розподіл по категоріях (топ квіти за продажами)
   */
  async getCategorySplit(): Promise<CategorySplit[]> {
    const transactions = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'sale',
        paymentStatus: { $in: ['paid', 'expected'] },
      },
    });

    // Агрегувати по квіткам
    const flowerSales = new Map<string, number>();
    let totalSales = 0;

    transactions.forEach((t: { items: Array<{ name: string; qty: number; price: number }> }) => {
      (t.items || []).forEach((item) => {
        const amount = (item.qty || 0) * (item.price || 0);
        flowerSales.set(item.name, (flowerSales.get(item.name) || 0) + amount);
        totalSales += amount;
      });
    });

    // Сортувати і взяти топ-5
    const sorted = Array.from(flowerSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const colors = ['bg-emerald-500', 'bg-emerald-400', 'bg-emerald-300', 'bg-amber-400', 'bg-slate-300'];

    return sorted.map(([name, amount], idx) => ({
      name,
      value: totalSales > 0 ? Math.round(amount / totalSales * 100) : 0,
      color: colors[idx] || 'bg-slate-300',
    }));
  },

  /**
   * Отримати топ продуктів
   */
  async getTopProducts(): Promise<Array<{ name: string; share: number }>> {
    const categorySplit = await this.getCategorySplit();
    return categorySplit.map((c: { name: string; value: number }) => ({
      name: c.name,
      share: c.value,
    }));
  },

  /**
   * Отримати суми оплачених та очікуваних платежів за вказаний місяць
   */
  async getPaymentSummary(year?: number, month?: number): Promise<{ paidAmount: number; expectedAmount: number }> {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const transactions = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'sale',
        date: { $gte: startOfMonth.toISOString(), $lte: endOfMonth.toISOString() },
      },
    });

    let paidAmount = 0;
    let expectedAmount = 0;

    transactions.forEach((t: { amount: number; paymentStatus?: string }) => {
      const amount = t.amount || 0;
      // Без статусу (старі) або 'paid' = оплачено
      if (!t.paymentStatus || t.paymentStatus === 'paid') {
        paidAmount += amount;
      } else if (t.paymentStatus === 'expected' || t.paymentStatus === 'pending') {
        expectedAmount += amount;
      }
    });

    return { paidAmount, expectedAmount };
  },

  /**
   * Отримати загальну суму непогашених платежів (всі часи)
   */
  async getTotalPendingPayments(): Promise<{
    totalPendingAmount: number;
    pendingOrdersCount: number;
    pendingByCustomer: Array<{ customerId: string; customerName: string; amount: number }>;
  }> {
    const transactions = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'sale',
        paymentStatus: { $in: ['expected', 'pending'] },
      },
      populate: ['customer'],
    });

    let totalPendingAmount = 0;
    const pendingByCustomerMap = new Map<string, { name: string; amount: number }>();

    transactions.forEach((t: { amount: number; customer?: { documentId: string; name: string } }) => {
      const amount = t.amount || 0;
      totalPendingAmount += amount;

      if (t.customer) {
        const existing = pendingByCustomerMap.get(t.customer.documentId) || { name: t.customer.name, amount: 0 };
        existing.amount += amount;
        pendingByCustomerMap.set(t.customer.documentId, existing);
      }
    });

    const pendingByCustomer = Array.from(pendingByCustomerMap.entries())
      .map(([customerId, data]) => ({
        customerId,
        customerName: data.name,
        amount: data.amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalPendingAmount,
      pendingOrdersCount: transactions.length,
      pendingByCustomer,
    };
  },

  /**
   * Отримати план поставок
   */
  async getSupplyPlan(): Promise<{
    nextDate: string;
    recommended: string;
    currentStock: number;
    forecast: string;
  }> {
    // Останній імпорт
    const lastSupply = await strapi.db.query('api::supply.supply').findOne({
      where: { supplyStatus: 'success' },
      orderBy: { dateParsed: 'desc' },
    });

    // Загальний склад
    const variants = await strapi.db.query('api::variant.variant').findMany({});
    const totalStock = variants.reduce((sum: number, v: { stock: number }) => sum + (v.stock || 0), 0);

    // Середні продажі за тиждень
    const weekSales = await this.getSalesMetrics('week');
    const avgWeeklySales = weekSales.itemsSold;

    // Рекомендована кількість (на 2 тижні вперед)
    const recommended = Math.max(0, avgWeeklySales * 2 - totalStock);

    // Наступна дата поставки (через тиждень від останньої)
    const lastDate = lastSupply?.dateParsed ? new Date(lastSupply.dateParsed) : new Date();
    const nextDate = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Прогноз на скільки вистачить
    const daysOfStock = avgWeeklySales > 0 ? Math.round(totalStock / (avgWeeklySales / 7)) : 99;

    return {
      nextDate: nextDate.toLocaleDateString('uk-UA'),
      recommended: `~${recommended} шт`,
      currentStock: totalStock,
      forecast: `Вистачить на ~${daysOfStock} днів`,
    };
  },

  /**
   * Отримати повну аналітику dashboard (з кешуванням)
   * @param year - рік (опційно, за замовчуванням поточний)
   * @param month - місяць 0-11 (опційно, за замовчуванням поточний)
   */
  async getDashboardData(year?: number, month?: number) {
    // Кеш тільки для поточного місяця без параметрів
    const now = new Date();
    const isCurrentMonth = (year === undefined || year === now.getFullYear()) &&
                           (month === undefined || month === now.getMonth());

    // Перевірити кеш тільки для поточного місяця
    if (isCurrentMonth && isCacheValid(analyticsCache.dashboard)) {
      strapi.log.debug('[Analytics] Returning cached dashboard data');
      return analyticsCache.dashboard.data;
    }

    strapi.log.debug('[Analytics] Fetching fresh dashboard data', { year, month });

    const [
      kpis,
      weeklyRevenue,
      ordersPerWeek,
      categorySplit,
      topProducts,
      supplyPlan,
      dailySales,
      stockLevels,
      writeOffSummary,
      topCustomers,
      topWriteOffFlowers,
      paymentSummary,
      pendingPayments,
    ] = await Promise.all([
      this.getKpis(year, month),
      this.getWeeklyRevenue(year, month),
      this.getOrdersPerWeek(year, month),
      this.getCategorySplit(),
      this.getTopProducts(),
      this.getSupplyPlan(),
      this.getDailySales(year, month),
      this.getStockLevels(),
      this.getWriteOffSummary(),
      this.getTopCustomers(5),
      this.getTopWriteOffFlowers(),
      this.getPaymentSummary(year, month),
      this.getTotalPendingPayments(),
    ]);

    const data = {
      kpis,
      weeklyRevenue,
      ordersPerWeek,
      categorySplit,
      topProducts,
      supplyPlan,
      dailySales,
      stockLevels,
      writeOffSummary,
      topCustomers,
      topWriteOffFlowers,
      paidAmount: paymentSummary.paidAmount,
      expectedAmount: paymentSummary.expectedAmount,
      totalPendingAmount: pendingPayments.totalPendingAmount,
      pendingOrdersCount: pendingPayments.pendingOrdersCount,
      pendingByCustomer: pendingPayments.pendingByCustomer,
    };

    // Зберегти в кеш
    analyticsCache.dashboard = {
      data,
      timestamp: Date.now(),
    };

    return data;
  },
});
