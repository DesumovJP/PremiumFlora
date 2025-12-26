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
  paidAmount: 0,
  expectedAmount: 0,
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
    paidAmount = 0,
    expectedAmount = 0,
    totalPendingAmount = 0,
    pendingOrdersCount = 0,
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
    <Card className="admin-card border border-slate-100 dark:border-[#30363d] bg-white/90 dark:bg-admin-surface shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-2xl">Аналітика продажів</CardTitle>
          <p className="text-sm text-slate-500 dark:text-admin-text-tertiary">Звіти, статистика та рекомендації</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={onOpenExport} size="icon" title="Експортувати">
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
        {/* Селектор місяця - центрований на десктопі */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-admin-border bg-white dark:bg-admin-surface px-2 py-1.5 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Попередній місяць"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-admin-text-secondary" />
            </button>
            <div className="px-4 py-1 min-w-[160px] text-center">
              <span className="text-lg font-semibold text-slate-900 dark:text-admin-text-primary">
                {selectedMonthName} {selectedYear}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isCurrentMonth
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              aria-label="Наступний місяць"
            >
              <ChevronRight className="h-5 w-5 text-slate-600 dark:text-admin-text-secondary" />
            </button>
          </div>
        </div>

        {/* Попередження про непогашені платежі */}
        {totalPendingAmount > 0 && (
          <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-800/50">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-200">
                    Очікуються оплати
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {pendingOrdersCount} замовлень від {pendingByCustomer.length} клієнтів
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                  {Math.round(totalPendingAmount).toLocaleString('uk-UA')} грн
                </p>
              </div>
            </div>
            {pendingByCustomer.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700/50">
                <p className="text-xs text-amber-700 dark:text-amber-500 mb-2">Клієнти з боргами:</p>
                <div className="flex flex-wrap gap-2">
                  {pendingByCustomer.slice(0, 5).map((c) => (
                    <span
                      key={c.customerId}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-800/50 text-xs text-amber-800 dark:text-amber-300"
                    >
                      {c.customerName}: {Math.round(c.amount).toLocaleString('uk-UA')} грн
                    </span>
                  ))}
                  {pendingByCustomer.length > 5 && (
                    <span className="text-xs text-amber-600 dark:text-amber-500">
                      +{pendingByCustomer.length - 5} ще
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
          <Card className="border-slate-100 dark:border-[#30363d] bg-white/90 dark:bg-admin-surface">
            <CardHeader className="pb-2">
              <CardTitle>Дохід</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-900 dark:text-admin-text-primary">{income.toLocaleString("uk-UA")} грн</p>
                <p className="text-sm text-slate-600 dark:text-admin-text-secondary">≈30% від виручки</p>
              </div>
              {/* Оплачено / Очікується розбивка */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs uppercase text-emerald-700 dark:text-emerald-400">Оплачено</p>
                  <p className="font-bold text-emerald-800 dark:text-emerald-300">
                    {paidAmount.toLocaleString("uk-UA")} грн
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 px-3 py-2 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs uppercase text-amber-700 dark:text-amber-400">Очікується</p>
                  <p className="font-bold text-amber-800 dark:text-amber-300">
                    {expectedAmount.toLocaleString("uk-UA")} грн
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-xl bg-slate-50 dark:bg-admin-surface px-3 py-2 border border-slate-100 dark:border-admin-border">
                  <p className="text-xs uppercase text-slate-500 dark:text-admin-text-muted">Макс тиждень</p>
                  <p className="font-semibold text-slate-800 dark:text-admin-text-primary">
                    {(weeklyRevenue.length ? Math.max(...weeklyRevenue) : 0).toLocaleString("uk-UA")} грн
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-admin-surface px-3 py-2 border border-slate-100 dark:border-admin-border">
                  <p className="text-xs uppercase text-slate-500 dark:text-admin-text-muted">Мін тиждень</p>
                  <p className="font-semibold text-slate-800 dark:text-admin-text-primary">
                    {(weeklyRevenue.length ? Math.min(...weeklyRevenue) : 0).toLocaleString("uk-UA")} грн
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-admin-surface px-3 py-2 border border-slate-100 dark:border-admin-border">
                  <p className="text-xs uppercase text-slate-500 dark:text-admin-text-muted">Середнє</p>
                  <p className="font-semibold text-slate-800 dark:text-admin-text-primary">
                    {Math.round(totalRevenue / Math.max(weeklyRevenue.length, 1)).toLocaleString("uk-UA")} грн
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
          <Card className="border-slate-100 dark:border-[#30363d]">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 dark:text-admin-text-primary">Виручка по тижнях</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-56 rounded-2xl bg-white dark:bg-admin-surface p-2 border border-slate-100 dark:border-[#30363d]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-admin-border" />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: "currentColor" }} className="dark:text-admin-text-tertiary" />
                    <YAxis tick={{ fontSize: 12, fill: "currentColor" }} className="dark:text-admin-text-tertiary" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--admin-surface)",
                        border: "1px solid var(--admin-border)",
                        borderRadius: "0.75rem",
                        color: "var(--admin-text-primary)"
                      }}
                    />
                    <Line type="monotone" dataKey="виручка" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-100 dark:bg-admin-surface p-3 text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-slate-800 dark:text-admin-text-primary">
                  Середнє зростання +12.5% на тиждень
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 dark:border-admin-border">
            <CardHeader className="pb-2">
              <CardTitle className="dark:text-admin-text-primary">Кількість замовлень</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-56 rounded-2xl bg-white dark:bg-admin-surface p-2 border border-slate-100 dark:border-admin-border">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersChart} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-admin-border" />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: "currentColor" }} className="dark:text-admin-text-tertiary" />
                    <YAxis tick={{ fontSize: 12, fill: "currentColor" }} className="dark:text-admin-text-tertiary" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--admin-surface)",
                        border: "1px solid var(--admin-border)",
                        borderRadius: "0.75rem",
                        color: "var(--admin-text-primary)"
                      }}
                    />
                    <Bar dataKey="замовлення" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-admin-text-secondary">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  Стабільне зростання на 5–7%
                </div>
                <p className="text-xs text-slate-500 dark:text-admin-text-muted">Макс: {maxOrders} зам.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Середній чек по тижнях (ліворуч) + Категорії продажів (праворуч) */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-100 dark:border-admin-border">
            <CardHeader className="pb-2">
              <CardTitle className="dark:text-admin-text-primary">Середній чек по тижнях</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={avgCheckChart} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="середній" stroke="#6366f1" fill="#c7d2fe" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-100 dark:border-admin-border">
            <CardHeader className="pb-2">
              <CardTitle className="dark:text-admin-text-primary">Категорії продажів</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBars} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="відсоток" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Топ-5 товарів за продажами (ліворуч) + Топ-5 квітів по списаннях (праворуч) */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-100 dark:border-admin-border">
            <CardHeader className="pb-2">
              <CardTitle className="dark:text-admin-text-primary">Топ-5 товарів за продажами</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pieData.map((entry, idx) => (
                  <div key={entry.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: entry.color }}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-admin-text-primary">{entry.name}</span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{entry.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-admin-border">
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
            <Card className="border-slate-100 dark:border-admin-border">
              <CardHeader className="pb-2">
                <CardTitle className="dark:text-admin-text-primary">Топ-5 квітів по списаннях</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topWriteOffFlowers.map((flower, idx) => (
                  <div key={flower.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-xs font-bold text-rose-600 dark:text-rose-400">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-admin-text-primary">{flower.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <span className="text-rose-600 dark:text-rose-400 font-medium">{flower.totalQty} шт</span>
                        <span className="text-slate-500 dark:text-admin-text-muted text-xs w-14">{flower.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-admin-border">
                      <div
                        className="h-full rounded-full bg-rose-500 dark:bg-rose-400"
                        style={{ width: `${flower.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-admin-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-admin-text-muted">Всього списано:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {topWriteOffFlowers.reduce((sum, f) => sum + f.totalQty, 0)} шт
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="border-slate-100 dark:border-admin-border bg-white/90 dark:bg-admin-surface">
          <CardHeader className="pb-2 pl-6 pr-5 pt-5">
            <CardTitle className="dark:text-admin-text-primary">Календар продажів по днях · {selectedMonthName} {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pl-6 pr-5">
            {/* Мобільний варіант без горизонтального скролу */}
            <div className="grid gap-3 sm:hidden">
              {dailySales.map((item) => (
                <div
                  key={item.date}
                  className="rounded-2xl border border-slate-100 dark:border-admin-border bg-white/90 dark:bg-admin-surface p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase text-slate-400 dark:text-admin-text-muted">{item.day}</p>
                      <p className="text-base font-semibold text-slate-900 dark:text-admin-text-primary">{item.date}</p>
                    </div>
                    <span
                      className={cn(
                        "h-3 w-3 rounded-full",
                        item.status === "high"
                          ? "bg-emerald-500"
                          : item.status === "mid"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      )}
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-admin-text-secondary">
                    <div className="rounded-xl bg-slate-50 dark:bg-admin-surface px-2 py-1.5 sm:px-3 sm:py-2">
                      <p className="text-xs uppercase text-slate-400 dark:text-admin-text-muted">Замовлень</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-admin-text-primary">{item.orders}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-admin-surface px-2 py-1.5 sm:px-3 sm:py-2">
                      <p className="text-xs uppercase text-slate-400 dark:text-admin-text-muted">Виручка</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-admin-text-primary">
                        {item.revenue.toLocaleString("uk-UA")} грн
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-admin-surface px-2 py-1.5 sm:px-3 sm:py-2">
                      <p className="text-xs uppercase text-slate-400 dark:text-admin-text-muted">Середній чек</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-admin-text-primary">
                        {item.avg.toLocaleString("uk-UA")} грн
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-admin-surface px-2 py-1.5 sm:px-3 sm:py-2">
                      <p className="text-xs uppercase text-slate-400 dark:text-admin-text-muted">Списано</p>
                      <p className={cn(
                        "text-sm font-semibold",
                        item.writeOffs > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-400 dark:text-admin-text-muted"
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
              <div className="rounded-xl border border-slate-200 dark:border-admin-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-admin-surface border-b border-slate-200 dark:border-admin-border">
                      <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-slate-500 dark:text-admin-text-muted">Дата</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-slate-500 dark:text-admin-text-muted">День</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold uppercase text-slate-500 dark:text-admin-text-muted">Замовлень</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold uppercase text-slate-500 dark:text-admin-text-muted">Виручка</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold uppercase text-slate-500 dark:text-admin-text-muted">Сер. чек</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold uppercase text-slate-500 dark:text-admin-text-muted">Списано</th>
                      <th className="py-3 px-4 text-center text-xs font-semibold uppercase text-slate-500 dark:text-admin-text-muted">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-admin-border">
                    {dailySales.map((item) => (
                      <tr
                        key={item.date}
                        className={cn(
                          "transition-colors duration-150",
                          item.status === "high"
                            ? "bg-emerald-50/30 dark:bg-emerald-900/5 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/10"
                            : item.status === "mid"
                            ? "bg-amber-50/30 dark:bg-amber-900/5 hover:bg-amber-50/60 dark:hover:bg-amber-900/10"
                            : "bg-rose-50/30 dark:bg-rose-900/5 hover:bg-rose-50/60 dark:hover:bg-rose-900/10"
                        )}
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-admin-text-primary">{item.date}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-admin-text-secondary">{item.day}</td>
                        <td className="py-3 px-4 text-right text-slate-700 dark:text-admin-text-secondary">{item.orders}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-admin-text-primary">
                          {item.revenue.toLocaleString("uk-UA")} ₴
                        </td>
                        <td className="py-3 px-4 text-right text-slate-700 dark:text-admin-text-secondary">
                          {item.avg.toLocaleString("uk-UA")} ₴
                        </td>
                        <td className="py-3 px-4 text-right">
                          {item.writeOffs > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400 font-medium">{item.writeOffs} шт</span>
                          ) : (
                            <span className="text-slate-400 dark:text-admin-text-muted">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                                item.status === "high"
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                  : item.status === "mid"
                                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                  : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  item.status === "high"
                                    ? "bg-emerald-500"
                                    : item.status === "mid"
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                )}
                              />
                              {item.status === "high" ? "Високі" : item.status === "mid" ? "Середні" : "Низькі"}
                            </span>
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


