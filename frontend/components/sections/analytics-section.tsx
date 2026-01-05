import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Download, ChevronLeft, ChevronRight, AlertCircle, DollarSign, ShoppingCart, Receipt, Package, Trash2, Calendar, Users, Warehouse, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

// Функція для отримання назви місяця українською
const getMonthName = (date: Date): string => {
  const months = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];
  return months[date.getMonth()];
};
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  AreaChart,
  Area,
} from "recharts";

import type { DashboardData } from "@/lib/api-types";

type AnalyticsSectionProps = {
  data: DashboardData | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  onOpenExport: () => void;
  onMonthChange?: (year: number, month: number) => void;
  globalPendingAmount?: number;
  globalPendingCount?: number;
};

// Default empty data
const emptyData: DashboardData = {
  kpis: [],
  weeklyRevenue: [],
  ordersPerWeek: [],
  categorySplit: [],
  topProducts: [],
  dailySales: [],
  stockLevels: [],
  writeOffSummary: { totalWriteOffs: 0, totalItems: 0, byReason: {}, recentWriteOffs: [] },
  topCustomers: [],
  supplyPlan: { nextDate: '', recommended: '', currentStock: 0, forecast: '' },
  topWriteOffFlowers: [],
  totalPendingAmount: 0,
  pendingOrdersCount: 0,
  pendingByCustomer: [],
};

// Масив назв місяців для індексації
const MONTHS = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

export function AnalyticsSection({
  data,
  isLoading = false,
  onRefresh,
  onOpenExport,
  onMonthChange,
  globalPendingAmount = 0,
  globalPendingCount = 0,
}: AnalyticsSectionProps) {
  const {
    weeklyRevenue = [],
    ordersPerWeek = [],
    topProducts = [],
    dailySales = [],
    stockLevels = [],
    topWriteOffFlowers = [],
    topCustomers = [],
    pendingByCustomer = [],
  } = data ?? emptyData;

  // Стан для вибраного місяця
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());


  const handlePrevMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    onMonthChange?.(newYear, newMonth);
  };

  const handleNextMonth = () => {
    // Не дозволяємо вибирати майбутні місяці
    const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
    if (isCurrentMonth) return;

    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    onMonthChange?.(newYear, newMonth);
  };

  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  const selectedMonthName = MONTHS[selectedMonth];

  const maxRevenue = Math.max(...(weeklyRevenue.length ? weeklyRevenue : [0]));
  const maxOrders = Math.max(...(ordersPerWeek.length ? ordersPerWeek : [0]));

  const revenueChart = useMemo(() => {
    return weeklyRevenue.map((v, idx) => ({ week: `Тиж ${idx + 1}`, виручка: v }));
  }, [weeklyRevenue, maxRevenue]);

  const ordersChart = useMemo(() => {
    return ordersPerWeek.map((v, idx) => ({ week: `Тиж ${idx + 1}`, замовлення: v }));
  }, [ordersPerWeek, maxOrders]);

  const avgCheckChart = useMemo(() => {
    return weeklyRevenue.map((v, idx) => ({
      week: `Тиж ${idx + 1}`,
      середній: Math.round(v / Math.max(ordersPerWeek[idx] || 1, 1)),
    }));
  }, [weeklyRevenue, ordersPerWeek]);

  const totalRevenue = useMemo(
    () => weeklyRevenue.reduce((acc, val) => acc + val, 0),
    [weeklyRevenue]
  );

  // Орієнтовний дохід (≈50% від виручки)
  const estimatedIncome = Math.round(totalRevenue * 0.5);

  // Вартість запасів = сума (кількість × ціна) для всіх варіантів
  const inventoryValue = useMemo(
    () => stockLevels.reduce((acc, item) => acc + (item.value || item.stock * item.price), 0),
    [stockLevels]
  );
  const totalStockItems = useMemo(
    () => stockLevels.reduce((acc, item) => acc + item.stock, 0),
    [stockLevels]
  );

  const pieData = useMemo(() => {
    const colors = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#fef3c7"];
    return topProducts.map((item, idx) => ({
      name: item.name,
      value: item.share,
      color: colors[idx % colors.length],
    }));
  }, [topProducts]);


  return (
    <Card className="admin-card border border-slate-100 dark:border-[var(--admin-border)] bg-[var(--admin-bg)] dark:bg-[var(--admin-bg)] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Аналітика продажів</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">Звіти, статистика та рекомендації</p>
        </div>
        <Button variant="outline" onClick={onOpenExport} size="icon" title="Експортувати" className="bg-white dark:bg-admin-surface">
          <Download className="h-4 w-4" />
          <span className="sr-only">Експортувати</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
        <>
        {/* Селектор місяця */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1 py-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Попередній місяць"
            >
              <ChevronLeft className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>
            <div className="px-3 py-0.5 min-w-[140px] text-center">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {selectedMonthName} {selectedYear}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isCurrentMonth
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
              aria-label="Наступний місяць"
            >
              <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Дохід + Вартість запасів + Очікуються оплати */}
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Орієнтовний дохід */}
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-800/40">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      Дохід
                    </span>
                    <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">
                      за місяць
                    </span>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    50% від {totalRevenue.toLocaleString('uk-UA')}₴
                  </span>
                </div>
              </div>
              <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                {estimatedIncome.toLocaleString('uk-UA')} ₴
              </span>
            </div>
          </div>

          {/* Вартість запасів */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                  <Warehouse className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      На складі
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      зараз
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {totalStockItems.toLocaleString('uk-UA')} шт
                  </span>
                </div>
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-white shrink-0">
                {Math.round(inventoryValue).toLocaleString('uk-UA')} ₴
              </span>
            </div>
          </div>

          {/* Очікуються оплати */}
          <div className={`rounded-lg border p-3 ${globalPendingAmount > 0 ? 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${globalPendingAmount > 0 ? 'bg-amber-100 dark:bg-amber-800/40' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  <AlertCircle className={`h-4 w-4 ${globalPendingAmount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-sm font-medium ${globalPendingAmount > 0 ? 'text-amber-800 dark:text-amber-300' : 'text-slate-700 dark:text-slate-300'}`}>
                      Очікує оплати
                    </span>
                    <span className={`text-[10px] ${globalPendingAmount > 0 ? 'text-amber-600/70 dark:text-amber-400/70' : 'text-slate-400 dark:text-slate-500'}`}>
                      зараз
                    </span>
                  </div>
                  {globalPendingCount > 0 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {globalPendingCount} зам.
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-lg font-semibold shrink-0 ${globalPendingAmount > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-white'}`}>
                {Math.round(globalPendingAmount).toLocaleString('uk-UA')} ₴
              </span>
            </div>
          </div>
        </div>

        {/* Виручка по тижнях (50%) + Кількість замовлень (50%) */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-200 dark:border-[var(--admin-border)] bg-white dark:bg-admin-surface shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Виручка по тижнях</CardTitle>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {totalRevenue.toLocaleString("uk-UA")} ₴
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChart} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" strokeWidth={0.5} opacity={0.6} className="dark:stroke-slate-700" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                    />
                    <Line type="monotone" dataKey="виручка" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-[var(--admin-border)] bg-white dark:bg-admin-surface shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/30">
                    <ShoppingCart className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Кількість замовлень</CardTitle>
                </div>
                <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
                  {ordersPerWeek.reduce((sum, v) => sum + v, 0)} замовлень
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersChart} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" strokeWidth={0.5} opacity={0.6} className="dark:stroke-slate-700" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                    />
                    <Bar dataKey="замовлення" fill="#0ea5e9" fillOpacity={0.4} stroke="#0ea5e9" strokeWidth={1} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Середній чек + Топ-5 товарів + Топ-5 клієнтів */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="border-slate-200 dark:border-[var(--admin-border)] bg-white dark:bg-admin-surface shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                    <Receipt className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Середній чек</CardTitle>
                </div>
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {Math.round(totalRevenue / Math.max(ordersPerWeek.reduce((sum, v) => sum + v, 0), 1)).toLocaleString("uk-UA")} ₴
                </span>
              </div>
            </CardHeader>
            <CardContent className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={avgCheckChart} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" strokeWidth={0.5} opacity={0.6} className="dark:stroke-slate-700" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                  />
                  <Area type="monotone" dataKey="середній" stroke="#6366f1" fill="#e0e7ff" fillOpacity={0.5} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-[var(--admin-border)] bg-white dark:bg-admin-surface shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                    <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Топ-5 товарів</CardTitle>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">за продажами</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {pieData.map((entry, idx) => (
                  <div key={entry.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 w-4">
                          {idx + 1}.
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">{entry.name}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{entry.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 ml-6">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${entry.value}%`, backgroundColor: entry.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Топ-5 клієнтів */}
          {topCustomers && topCustomers.length > 0 && (
            <Card className="border-slate-200 dark:border-[var(--admin-border)] bg-white dark:bg-admin-surface shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/30">
                      <Users className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Топ-5 клієнтів</CardTitle>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">за виручкою</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {topCustomers.slice(0, 5).map((customer, idx) => (
                    <div key={customer.documentId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 w-4">
                            {idx + 1}.
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{customer.name}</span>
                          {customer.type === 'wholesale' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">опт</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white shrink-0">
                          {customer.totalSpent.toLocaleString("uk-UA")} ₴
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 ml-6">
                        <span>{customer.orderCount} замовлень</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Топ-5 списань - окремий рядок */}
        {topWriteOffFlowers && topWriteOffFlowers.length > 0 && (
          <Card className="border-slate-200 dark:border-[var(--admin-border)] bg-white dark:bg-admin-surface shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/30">
                    <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Топ-5 списань</CardTitle>
                </div>
                <span className="text-xs font-medium text-rose-500 dark:text-rose-400">
                  {topWriteOffFlowers.reduce((sum, f) => sum + f.totalQty, 0)} шт
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {topWriteOffFlowers.map((flower, idx) => (
                  <div key={flower.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 w-4">
                          {idx + 1}.
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 truncate">{flower.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-rose-400 dark:bg-rose-500"
                          style={{ width: `${flower.percentage}%` }}
                        />
                      </div>
                      <span className="text-rose-500 dark:text-rose-400 text-xs font-medium shrink-0">{flower.totalQty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 dark:border-[var(--admin-border)] bg-white dark:bg-admin-surface shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Календар продажів · {selectedMonthName} {selectedYear}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Мобільний варіант */}
            <div className="grid gap-2 sm:hidden">
              {dailySales.map((item) => (
                <div
                  key={item.date}
                  className="rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.date}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{item.day}</span>
                    </div>
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        item.status === "high"
                          ? "bg-emerald-500"
                          : item.status === "mid"
                          ? "bg-amber-500"
                          : "bg-slate-300 dark:bg-slate-600"
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <div className="rounded-md bg-slate-50 dark:bg-slate-700/50 px-2 py-1.5">
                      <p className="text-slate-400 dark:text-slate-500">Замовлень</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{item.orders}</p>
                    </div>
                    <div className="rounded-md bg-slate-50 dark:bg-slate-700/50 px-2 py-1.5">
                      <p className="text-slate-400 dark:text-slate-500">Виручка</p>
                      <p className="font-medium text-emerald-600 dark:text-emerald-400">
                        {item.revenue.toLocaleString("uk-UA")} ₴
                      </p>
                    </div>
                    <div className="rounded-md bg-slate-50 dark:bg-slate-700/50 px-2 py-1.5">
                      <p className="text-slate-400 dark:text-slate-500">Сер. чек</p>
                      <p className="font-medium text-slate-600 dark:text-slate-300">
                        {item.avg.toLocaleString("uk-UA")} ₴
                      </p>
                    </div>
                    <div className="rounded-md bg-slate-50 dark:bg-slate-700/50 px-2 py-1.5">
                      <p className="text-slate-400 dark:text-slate-500">Поставка</p>
                      <p className={cn(
                        "font-medium",
                        item.supplyAmount && item.supplyAmount > 0
                          ? "text-sky-500 dark:text-sky-400"
                          : "text-slate-400 dark:text-slate-500"
                      )}>
                        {item.supplyAmount && item.supplyAmount > 0 ? `${item.supplyAmount.toLocaleString("uk-UA")} ₴` : "—"}
                      </p>
                    </div>
                    <div className="rounded-md bg-slate-50 dark:bg-slate-700/50 px-2 py-1.5">
                      <p className="text-slate-400 dark:text-slate-500">Списано</p>
                      <p className={cn(
                        "font-medium",
                        item.writeOffs > 0
                          ? "text-rose-500 dark:text-rose-400"
                          : "text-slate-400 dark:text-slate-500"
                      )}>
                        {item.writeOffs > 0 ? `${item.writeOffs} шт` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Десктопна таблиця */}
            <div className="hidden sm:block">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2.5 px-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Дата</th>
                      <th className="py-2.5 px-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">День</th>
                      <th className="py-2.5 px-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Замовлень</th>
                      <th className="py-2.5 px-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Виручка</th>
                      <th className="py-2.5 px-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Сер. чек</th>
                      <th className="py-2.5 px-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Поставка</th>
                      <th className="py-2.5 px-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Списано</th>
                      <th className="py-2.5 px-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {dailySales.map((item) => (
                      <tr
                        key={item.date}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{item.date}</td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{item.day}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">{item.orders}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {item.revenue.toLocaleString("uk-UA")} ₴
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                          {item.avg.toLocaleString("uk-UA")} ₴
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {item.supplyAmount && item.supplyAmount > 0 ? (
                            <span className="text-sky-500 dark:text-sky-400">{item.supplyAmount.toLocaleString("uk-UA")} ₴</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {item.writeOffs > 0 ? (
                            <span className="text-rose-500 dark:text-rose-400">{item.writeOffs} шт</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex justify-center">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                item.status === "high"
                                  ? "bg-emerald-500"
                                  : item.status === "mid"
                                  ? "bg-amber-500"
                                  : "bg-slate-300 dark:bg-slate-600"
                              )}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Підсумковий рядок */}
                  <tfoot>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 font-medium">
                      <td colSpan={2} className="py-2.5 px-3 text-slate-700 dark:text-slate-200">Всього</td>
                      <td className="py-2.5 px-3 text-right text-slate-900 dark:text-white">
                        {dailySales.reduce((sum, d) => sum + d.orders, 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">
                        {dailySales.reduce((sum, d) => sum + d.revenue, 0).toLocaleString("uk-UA")} ₴
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                        {(() => {
                          const totalOrders = dailySales.reduce((sum, d) => sum + d.orders, 0);
                          const totalRevenue = dailySales.reduce((sum, d) => sum + d.revenue, 0);
                          return totalOrders > 0 ? `${Math.round(totalRevenue / totalOrders).toLocaleString("uk-UA")} ₴` : "—";
                        })()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-sky-500 dark:text-sky-400">
                        {(() => {
                          const total = dailySales.reduce((sum, d) => sum + (d.supplyAmount || 0), 0);
                          return total > 0 ? `${total.toLocaleString("uk-UA")} ₴` : "—";
                        })()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-500 dark:text-rose-400">
                        {(() => {
                          const total = dailySales.reduce((sum, d) => sum + d.writeOffs, 0);
                          return total > 0 ? `${total} шт` : "—";
                        })()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
        </>
        )}
      </CardContent>
    </Card>
  );
}


