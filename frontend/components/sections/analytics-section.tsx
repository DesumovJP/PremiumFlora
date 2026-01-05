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
    <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-[var(--admin-surface)]">
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
          <Card className="border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/20 dark:to-slate-900 flex flex-col justify-center overflow-hidden relative">
            {/* Декоративний елемент */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 dark:bg-emerald-800/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

            <CardHeader className="pb-2 sm:pb-3 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-800/40 ring-1 ring-emerald-200/50 dark:ring-emerald-700/50">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white">Дохід</CardTitle>
                    <p className="text-[10px] sm:text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium">≈{incomePercentage}% від виручки</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{income.toLocaleString("uk-UA")}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">грн</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-3 py-2.5 sm:px-4 sm:py-3 border border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Макс</p>
                  <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                    {(weeklyRevenue.length ? Math.max(...weeklyRevenue) : 0).toLocaleString("uk-UA")}
                  </p>
                </div>
                <div className="rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-3 py-2.5 sm:px-4 sm:py-3 border border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Мін</p>
                  <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                    {(weeklyRevenue.length ? Math.min(...weeklyRevenue) : 0).toLocaleString("uk-UA")}
                  </p>
                </div>
                <div className="rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-3 py-2.5 sm:px-4 sm:py-3 border border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Середнє</p>
                  <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
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

        <Card className="border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40 ring-1 ring-violet-200/50 dark:ring-violet-700/50">
                  <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-slate-800 dark:text-white">Календар продажів</CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedMonthName} {selectedYear}</p>
                </div>
              </div>
              {/* Легенда статусів */}
              <div className="hidden sm:flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                  <span className="text-slate-500 dark:text-slate-400">7+ замовлень</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
                  <span className="text-slate-500 dark:text-slate-400">4-6</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600 ring-2 ring-slate-300/20 dark:ring-slate-600/20" />
                  <span className="text-slate-500 dark:text-slate-400">0-3</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Мобільний варіант */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {dailySales.map((item, idx) => (
                <div
                  key={item.date}
                  className={cn(
                    "p-3 transition-colors",
                    item.orders > 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg font-semibold text-sm",
                        item.status === "high"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : item.status === "mid"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {item.date.split('.')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.day}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{item.date}</p>
                      </div>
                    </div>
                    {item.orders > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.revenue.toLocaleString("uk-UA")} ₴</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{item.orders} зам.</p>
                      </div>
                    )}
                  </div>
                  {(item.orders > 0 || item.supplyAmount > 0 || item.writeOffs > 0) && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 px-2.5 py-2 text-center">
                        <p className="text-slate-400 dark:text-slate-500 mb-0.5">Сер. чек</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                          {item.avg > 0 ? item.avg.toLocaleString("uk-UA") : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-sky-50 dark:bg-sky-900/20 px-2.5 py-2 text-center">
                        <p className="text-sky-500 dark:text-sky-400 mb-0.5">Поставка</p>
                        <p className="font-semibold text-sky-600 dark:text-sky-300">
                          {item.supplyAmount && item.supplyAmount > 0 ? item.supplyAmount.toLocaleString("uk-UA") : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 px-2.5 py-2 text-center">
                        <p className="text-rose-500 dark:text-rose-400 mb-0.5">Списано</p>
                        <p className="font-semibold text-rose-600 dark:text-rose-300">
                          {item.writeOffs > 0 ? `${item.writeOffs} шт` : "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Десктопна таблиця */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/50">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Дата</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">День</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Замовлень</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Виручка</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Сер. чек</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Поставка</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Списано</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dailySales.map((item) => (
                    <tr
                      key={item.date}
                      className={cn(
                        "transition-colors",
                        item.orders > 0
                          ? "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          : "bg-slate-50/30 dark:bg-slate-900/30 text-slate-400"
                      )}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg font-semibold text-xs",
                            item.status === "high"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                              : item.status === "mid"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                          )}>
                            {item.date.split('.')[0]}
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-200">{item.date}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{item.day}</td>
                      <td className="py-3 px-4 text-center">
                        {item.orders > 0 ? (
                          <span className={cn(
                            "inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full text-xs font-semibold",
                            item.status === "high"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                              : item.status === "mid"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          )}>
                            {item.orders}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.revenue > 0 ? (
                          <span className="font-semibold text-slate-900 dark:text-white">{item.revenue.toLocaleString("uk-UA")} ₴</span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400">
                        {item.avg > 0 ? `${item.avg.toLocaleString("uk-UA")} ₴` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.supplyAmount && item.supplyAmount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            {item.supplyAmount.toLocaleString("uk-UA")} ₴
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.writeOffs > 0 ? (
                          <span className="inline-flex items-center gap-1 text-rose-500 dark:text-rose-400 font-medium">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                            {item.writeOffs} шт
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Підсумковий рядок */}
                <tfoot>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-t-2 border-slate-200 dark:border-slate-700">
                    <td colSpan={2} className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">Всього за місяць</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
                        {dailySales.reduce((sum, d) => sum + d.orders, 0)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {dailySales.reduce((sum, d) => sum + d.revenue, 0).toLocaleString("uk-UA")} ₴
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400">
                      {(() => {
                        const totalOrders = dailySales.reduce((sum, d) => sum + d.orders, 0);
                        const totalRevenue = dailySales.reduce((sum, d) => sum + d.revenue, 0);
                        return totalOrders > 0 ? `${Math.round(totalRevenue / totalOrders).toLocaleString("uk-UA")} ₴` : "—";
                      })()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-sky-600 dark:text-sky-400">
                      {(() => {
                        const total = dailySales.reduce((sum, d) => sum + (d.supplyAmount || 0), 0);
                        return total > 0 ? `${total.toLocaleString("uk-UA")} ₴` : "—";
                      })()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-500 dark:text-rose-400">
                      {(() => {
                        const total = dailySales.reduce((sum, d) => sum + d.writeOffs, 0);
                        return total > 0 ? `${total} шт` : "—";
                      })()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
        </>
        )}
      </CardContent>
    </Card>
  );
}


