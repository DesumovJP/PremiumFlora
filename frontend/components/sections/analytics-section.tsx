import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { TrendingUp, Loader2, RefreshCw, Download, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";

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
}: AnalyticsSectionProps) {
  const {
    kpis = [],
    weeklyRevenue = [],
    categorySplit = [],
    ordersPerWeek = [],
    topProducts = [],
    dailySales = [],
    topWriteOffFlowers = [],
    totalPendingAmount = 0,
    pendingOrdersCount = 0,
    pendingByCustomer = [],
  } = data ?? emptyData;

  // Стан для вибраного місяця
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Відсоток доходу - просто константа 50%
  const incomePercentage = 50;

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

  const categoryBars = useMemo(
    () => categorySplit.map((c) => ({ name: c.name, відсоток: c.value })),
    [categorySplit]
  );

  const totalRevenue = useMemo(
    () => weeklyRevenue.reduce((acc, val) => acc + val, 0),
    [weeklyRevenue]
  );
  const income = Math.round(totalRevenue * 0.3);

  const pieData = useMemo(() => {
    const colors = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#fef3c7"];
    return topProducts.map((item, idx) => ({
      name: item.name,
      value: item.share,
      color: colors[idx % colors.length],
    }));
  }, [topProducts]);


  return (
    <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161b22]">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Аналітика продажів</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400">Звіти, статистика та рекомендації</p>
        </div>
        <Button variant="outline" onClick={onOpenExport} size="icon" title="Експортувати">
          <Download className="h-4 w-4" />
          <span className="sr-only">Експортувати</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
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

        {/* Попередження про непогашені платежі */}
        {totalPendingAmount > 0 && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Очікуються оплати
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 ml-2">
                    {pendingOrdersCount} замовлень
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300 shrink-0">
                {Math.round(totalPendingAmount).toLocaleString('uk-UA')} ₴
              </span>
            </div>
            {pendingByCustomer.length > 0 && (
              <div className="mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-700/30">
                <div className="flex flex-wrap gap-1.5">
                  {pendingByCustomer.slice(0, 5).map((c) => (
                    <span
                      key={c.customerId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-800/30 text-xs text-amber-700 dark:text-amber-400"
                    >
                      {c.customerName}: {Math.round(c.amount).toLocaleString('uk-UA')} ₴
                    </span>
                  ))}
                  {pendingByCustomer.length > 5 && (
                    <span className="text-xs text-amber-500 dark:text-amber-500 self-center">
                      +{pendingByCustomer.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Дохід (50%) + KPIs (50% - 2x2 grid) */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Дохід - 50% */}
          <Card className="border-slate-200 dark:border-slate-700 flex flex-col justify-center">
            <CardHeader className="pb-1 sm:pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">Дохід</CardTitle>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">≈{incomePercentage}% від виручки</p>
                </div>
                <p className="text-base sm:text-2xl font-semibold text-slate-900 dark:text-white">{income.toLocaleString("uk-UA")} ₴</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <div className="rounded-md sm:rounded-lg bg-slate-50 dark:bg-slate-800 px-2 sm:px-2.5 py-1.5 sm:py-2">
                  <p className="text-[9px] sm:text-[10px] uppercase text-slate-400 dark:text-slate-500">Макс</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                    {(weeklyRevenue.length ? Math.max(...weeklyRevenue) : 0).toLocaleString("uk-UA")}
                  </p>
                </div>
                <div className="rounded-md sm:rounded-lg bg-slate-50 dark:bg-slate-800 px-2 sm:px-2.5 py-1.5 sm:py-2">
                  <p className="text-[9px] sm:text-[10px] uppercase text-slate-400 dark:text-slate-500">Мін</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                    {(weeklyRevenue.length ? Math.min(...weeklyRevenue) : 0).toLocaleString("uk-UA")}
                  </p>
                </div>
                <div className="rounded-md sm:rounded-lg bg-slate-50 dark:bg-slate-800 px-2 sm:px-2.5 py-1.5 sm:py-2">
                  <p className="text-[9px] sm:text-[10px] uppercase text-slate-400 dark:text-slate-500">Середнє</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                    {Math.round(totalRevenue / Math.max(weeklyRevenue.length, 1)).toLocaleString("uk-UA")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs - 50% (2x2 grid) */}
          <div className="grid grid-cols-2 gap-3">
            {kpis.slice(0, 4).map((item) => (
              <KpiCard key={item.label} item={item} />
            ))}
          </div>
        </div>

        {/* Виручка по тижнях (50%) + Кількість замовлень (50%) */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Виручка по тижнях</CardTitle>
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
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>Середнє зростання +12.5% на тиждень</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Кількість замовлень</CardTitle>
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
                    <Bar dataKey="замовлення" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <TrendingUp className="h-3.5 w-3.5 text-sky-500" />
                  <span>Стабільне зростання на 5–7%</span>
                </div>
                <span className="text-slate-400 dark:text-slate-500">Макс: {maxOrders}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Середній чек по тижнях (ліворуч) + Категорії продажів (праворуч) */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Середній чек по тижнях</CardTitle>
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

          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Категорії продажів</CardTitle>
            </CardHeader>
            <CardContent className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBars} layout="vertical" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" strokeWidth={0.5} opacity={0.6} horizontal={false} className="dark:stroke-slate-700" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                  />
                  <Bar dataKey="відсоток" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Топ-5 товарів за продажами (ліворуч) + Топ-5 квітів по списаннях (праворуч) */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Топ-5 товарів за продажами</CardTitle>
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

          {topWriteOffFlowers && topWriteOffFlowers.length > 0 && (
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Топ-5 квітів по списаннях</CardTitle>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Всього: {topWriteOffFlowers.reduce((sum, f) => sum + f.totalQty, 0)} шт
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {topWriteOffFlowers.map((flower, idx) => (
                    <div key={flower.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 w-4">
                            {idx + 1}.
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">{flower.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-rose-500 dark:text-rose-400 text-sm">{flower.totalQty} шт</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 w-10 text-right">{flower.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 ml-6">
                        <div
                          className="h-full rounded-full bg-rose-400 dark:bg-rose-500"
                          style={{ width: `${flower.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Календар продажів · {selectedMonthName} {selectedYear}</CardTitle>
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
                          : "bg-rose-400"
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
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {item.revenue.toLocaleString("uk-UA")}
                      </p>
                    </div>
                    <div className="rounded-md bg-slate-50 dark:bg-slate-700/50 px-2 py-1.5">
                      <p className="text-slate-400 dark:text-slate-500">Сер. чек</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {item.avg.toLocaleString("uk-UA")}
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
                        {item.supplyAmount && item.supplyAmount > 0 ? `${item.supplyAmount.toLocaleString("uk-UA")}` : "—"}
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
                        <td className="py-2.5 px-3 text-right font-medium text-slate-900 dark:text-white">
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
                                  : "bg-rose-400"
                              )}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
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


