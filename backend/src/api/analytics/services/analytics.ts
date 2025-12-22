/**
 * Analytics Service
 *
 * Сервіс для агрегації реальних даних з БД:
 * - KPI метрики
 * - Рівні складу
 * - Продажі по періодах
 * - Списання
 * - Топ клієнти
 */

import type { Core } from '@strapi/strapi';

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
   * Отримати рівні складу
   */
  async getStockLevels(): Promise<StockLevel[]> {
    const variants = await strapi.db.query('api::variant.variant').findMany({
      populate: ['flower'],
      orderBy: { stock: 'asc' },
    });

    return variants.map((v: {
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
   * Отримати щоденні продажі за поточний місяць
   */
  async getDailySales(): Promise<DailySale[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const transactions = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'sale',
        date: { $gte: startOfMonth.toISOString() },
        paymentStatus: { $in: ['paid', 'expected'] },
      },
    });

    // Групувати по днях
    const dailyMap = new Map<string, { orders: number; revenue: number }>();

    transactions.forEach((t: { date: string; amount: number }) => {
      const date = new Date(t.date);
      const key = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;

      const existing = dailyMap.get(key) || { orders: 0, revenue: 0 };
      dailyMap.set(key, {
        orders: existing.orders + 1,
        revenue: existing.revenue + (t.amount || 0),
      });
    });

    const daysOfWeek = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const result: DailySale[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      const key = `${String(day).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}`;
      const data = dailyMap.get(key) || { orders: 0, revenue: 0 };

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
      });
    }

    return result;
  },

  /**
   * Отримати тижневу виручку (4 тижні)
   */
  async getWeeklyRevenue(): Promise<number[]> {
    const now = new Date();
    const result: number[] = [];

    for (let week = 3; week >= 0; week--) {
      const weekStart = new Date(now.getTime() - (week + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000);

      const transactions = await strapi.db.query('api::transaction.transaction').findMany({
        where: {
          type: 'sale',
          date: {
            $gte: weekStart.toISOString(),
            $lt: weekEnd.toISOString(),
          },
          paymentStatus: { $in: ['paid', 'expected'] },
        },
      });

      const revenue = transactions.reduce((sum: number, t: { amount: number }) => sum + (t.amount || 0), 0);
      result.push(revenue);
    }

    return result;
  },

  /**
   * Отримати кількість замовлень по тижнях
   */
  async getOrdersPerWeek(): Promise<number[]> {
    const now = new Date();
    const result: number[] = [];

    for (let week = 3; week >= 0; week--) {
      const weekStart = new Date(now.getTime() - (week + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000);

      const count = await strapi.db.query('api::transaction.transaction').count({
        where: {
          type: 'sale',
          date: {
            $gte: weekStart.toISOString(),
            $lt: weekEnd.toISOString(),
          },
          paymentStatus: { $in: ['paid', 'expected'] },
        },
      });

      result.push(count);
    }

    return result;
  },

  /**
   * Отримати KPI метрики
   */
  async getKpis(): Promise<KpiData[]> {
    // Поточний період (цей місяць)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Продажі цього місяця
    const currentSales = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'sale',
        date: { $gte: startOfMonth.toISOString() },
        paymentStatus: { $in: ['paid', 'expected'] },
      },
    });

    // Продажі минулого місяця
    const lastSales = await strapi.db.query('api::transaction.transaction').findMany({
      where: {
        type: 'sale',
        date: {
          $gte: startOfLastMonth.toISOString(),
          $lt: endOfLastMonth.toISOString(),
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

    // Склад
    const variants = await strapi.db.query('api::variant.variant').findMany({});
    const totalStock = variants.reduce((sum: number, v: { stock: number }) => sum + (v.stock || 0), 0);
    const stockValue = variants.reduce((sum: number, v: { stock: number; price: number }) =>
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
   * Отримати повну аналітику dashboard
   */
  async getDashboardData() {
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
    ] = await Promise.all([
      this.getKpis(),
      this.getWeeklyRevenue(),
      this.getOrdersPerWeek(),
      this.getCategorySplit(),
      this.getTopProducts(),
      this.getSupplyPlan(),
      this.getDailySales(),
      this.getStockLevels(),
      this.getWriteOffSummary(),
      this.getTopCustomers(5),
    ]);

    return {
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
    };
  },
});
