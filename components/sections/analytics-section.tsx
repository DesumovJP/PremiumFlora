import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { TrendingUp, Loader2, RefreshCw, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

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
};

export function AnalyticsSection({
  data,
  isLoading = false,
  onRefresh,
  onOpenExport,
}: AnalyticsSectionProps) {
  const {
    kpis,
    weeklyRevenue,
    categorySplit,
    ordersPerWeek,
    topProducts,
    dailySales,
  } = data ?? emptyData;

  const maxRevenue = Math.max(...(weeklyRevenue.length ? weeklyRevenue : [0]));
  const maxOrders = Math.max(...(ordersPerWeek.length ? ordersPerWeek : [0]));

  const revenueChart = useMemo(() => {
    return weeklyRevenue.map((v, idx) => ({ week: `Тиж ${idx + 1}`, value: v }));
  }, [weeklyRevenue, maxRevenue]);

  const ordersChart = useMemo(() => {
    return ordersPerWeek.map((v, idx) => ({ week: `Тиж ${idx + 1}`, value: v }));
  }, [ordersPerWeek, maxOrders]);

  const avgCheckChart = useMemo(() => {
    return weeklyRevenue.map((v, idx) => ({
      week: `Тиж ${idx + 1}`,
      avg: Math.round(v / Math.max(ordersPerWeek[idx] || 1, 1)),
    }));
  }, [weeklyRevenue, ordersPerWeek]);

  const categoryBars = useMemo(
    () => categorySplit.map((c) => ({ name: c.name, value: c.value })),
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

  // Актуальна дата для відображення місяця
  const currentDate = new Date();
  const currentMonth = getMonthName(currentDate);
  const currentYear = currentDate.getFullYear();

  return (
    <Card className="admin-card border border-slate-100 dark:border-[#30363d] bg-white/90 dark:bg-admin-surface shadow-md">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-2xl">Аналітика продажів</CardTitle>
          <p className="text-sm text-slate-500 dark:text-admin-text-tertiary">Звіти, статистика та рекомендації</p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          )}
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={onOpenExport}>
            <Download className="mr-2 h-4 w-4" />
            Експортувати
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
        <>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 animate-stagger">
          {kpis.map((item) => (
            <KpiCard key={item.label} item={item} />
          ))}
        </div>

        <Card className="border-slate-100 dark:border-[#30363d] bg-white/90 dark:bg-admin-surface">
          <CardHeader className="pb-2">
            <CardTitle>Дохід</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-900 dark:text-admin-text-primary">{income.toLocaleString("uk-UA")} грн</p>
              <p className="text-sm text-slate-600 dark:text-admin-text-secondary">≈30% від виручки</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-admin-text-secondary sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2">
                <p className="text-xs uppercase text-emerald-700">Макс тиждень</p>
                <p className="font-semibold text-emerald-800">
                  {Math.max(...weeklyRevenue).toLocaleString("uk-UA")} грн
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-admin-surface px-3 py-2">
                <p className="text-xs uppercase text-slate-500 dark:text-admin-text-muted">Мін тиждень</p>
                <p className="font-semibold text-slate-800 dark:text-admin-text-primary">
                  {Math.min(...weeklyRevenue).toLocaleString("uk-UA")} грн
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-admin-surface px-3 py-2 sm:col-span-1 col-span-2">
                <p className="text-xs uppercase text-slate-500 dark:text-admin-text-muted">Середнє / тиждень</p>
                <p className="font-semibold text-slate-800 dark:text-admin-text-primary">
                  {Math.round(totalRevenue / Math.max(weeklyRevenue.length, 1)).toLocaleString("uk-UA")} грн
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-100 dark:border-[#30363d]">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 dark:text-admin-text-primary">Виручка по тижнях · {currentMonth}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-100 dark:bg-admin-surface p-3 text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-slate-800 dark:text-admin-text-primary">
                  Середнє зростання +12.5% на тиждень, піковий тиждень 3 — 520 000 грн.
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 dark:border-[#30363d]">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 dark:text-admin-text-primary">Розподіл продажів по категоріях</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categorySplit.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-admin-text-primary">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", item.color)} />
                      {item.name}
                    </div>
                    <span className="text-slate-700 dark:text-admin-text-secondary">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-admin-border">
                    <div 
                      className={cn("h-full rounded-full", item.color)}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-100 dark:border-admin-border">
            <CardHeader className="pb-2">
              <CardTitle className="dark:text-admin-text-primary">Кількість замовлень</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 h-full">
              <div className="h-64 rounded-2xl bg-white dark:bg-admin-surface p-2 border border-slate-100 dark:border-admin-border">
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
                    <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-admin-text-secondary">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Стабільне зростання на 5–7% протягом місяця.
                </div>
                <p className="text-xs text-slate-500 dark:text-admin-text-muted">Макс: {maxOrders} зам.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 dark:border-admin-border">
            <CardHeader className="pb-2">
              <CardTitle className="dark:text-admin-text-primary">Топ-5 товарів за продажами</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <ResponsiveContainer width="100%" height={240} className="lg:w-1/2">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.value}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {pieData.map((entry) => (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-admin-border bg-slate-50/60 dark:bg-slate-800/50 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="font-semibold text-slate-900 dark:text-admin-text-primary">{entry.name}</span>
                      </div>
                      <span className="text-slate-600 dark:text-admin-text-secondary">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  <Area type="monotone" dataKey="avg" stroke="#6366f1" fill="#c7d2fe" strokeWidth={2} />
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
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-100 dark:border-admin-border bg-white/90 dark:bg-admin-surface">
          <CardHeader className="pb-2 pl-6 pr-5 pt-5">
            <CardTitle className="dark:text-admin-text-primary">Календар продажів по днях · {currentMonth} {currentYear}</CardTitle>
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
                        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold",
                        item.status === "high"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-800"
                          : item.status === "mid"
                          ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-800"
                          : "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 ring-1 ring-rose-100 dark:ring-rose-800"
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          item.status === "high"
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : item.status === "mid"
                            ? "bg-amber-500 dark:bg-amber-400"
                            : "bg-rose-500 dark:bg-rose-400"
                        )}
                      />
                      {item.status === "high"
                        ? "Високі продажі"
                        : item.status === "mid"
                        ? "Середні продажі"
                        : "Низькі продажі"}
                    </span>
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
                  </div>
                </div>
              ))}
            </div>

            {/* Десктопна таблиця */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="min-w-full text-sm text-slate-700 dark:text-admin-text-secondary">
                <thead>
                  <tr className="text-left text-xs uppercase text-slate-400 dark:text-admin-text-muted">
                    <th className="py-2 pl-4 pr-4">Дата</th>
                    <th className="py-2 pl-4 pr-4">День</th>
                    <th className="py-2 pl-4 pr-4">Замовлень</th>
                    <th className="py-2 pl-4 pr-4">Виручка (грн)</th>
                    <th className="py-2 pl-4 pr-4">Середній чек</th>
                    <th className="py-2 pl-4 pr-4">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 table-divider-dark">
                  {dailySales.map((item) => (
                    <tr key={item.date} className="hover:bg-slate-50/70 table-hover-dark transition-colors duration-150 cursor-pointer">
                      <td className="py-2 pl-4 pr-4 font-semibold text-slate-900 dark:text-admin-text-primary">{item.date}</td>
                      <td className="py-2 pl-4 pr-4 text-slate-700 dark:text-admin-text-secondary">{item.day}</td>
                      <td className="py-2 pl-4 pr-4 text-slate-700 dark:text-admin-text-secondary">{item.orders}</td>
                      <td className="py-2 pl-4 pr-4 font-semibold text-slate-900 dark:text-admin-text-primary">
                        {item.revenue.toLocaleString("uk-UA")}
                      </td>
                      <td className="py-2 pl-4 pr-4 text-slate-700 dark:text-admin-text-secondary">{item.avg.toLocaleString("uk-UA")}</td>
                      <td className="py-2 pl-4 pr-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                            item.status === "high"
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-800/50"
                              : item.status === "mid"
                              ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-800/50"
                              : "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 ring-1 ring-rose-100 dark:ring-rose-800/50"
                          )}
                        >
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              item.status === "high"
                                ? "bg-emerald-500"
                                : item.status === "mid"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            )}
                          />
                          {item.status === "high"
                            ? "Високі продажі"
                            : item.status === "mid"
                            ? "Середні продажі"
                            : "Низькі продажі"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
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


