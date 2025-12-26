/* eslint-disable @next/next/no-img-element */
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ComponentType, useEffect, useState, useCallback } from "react";
import {
  Moon,
  Sun,
  LogOut,
  Package,
  CreditCard,
  Zap,
  Clock,
  Loader2,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getUpcomingTasks, type GraphQLTask } from "@/lib/strapi";

type SidebarProps = {
  navItems: NavItem[];
  active: string;
  onChange: (id: string) => void;
  brand: { title: string; subtitle: string; icon: ComponentType<{ className?: string }> };
  supplyCard: { title: string; subtitle: string; icon: ComponentType<{ className?: string }> };
  onOpenSupply?: () => void;
  pendingPaymentsCount?: number;
  onShowPendingPayments?: () => void;
};


export function Sidebar({ navItems, active, onChange, brand, supplyCard, onOpenSupply, pendingPaymentsCount = 0, onShowPendingPayments }: SidebarProps) {
  const router = useRouter();
  const BrandIcon = brand.icon;
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [upcomingTasks, setUpcomingTasks] = useState<GraphQLTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
    router.refresh();
  };

  // Fetch upcoming tasks
  const fetchUpcomingTasks = useCallback(async () => {
    try {
      const result = await getUpcomingTasks();
      if (result.success && result.data) {
        // Filter only pending and in_progress tasks, limit to 4
        const activeTasks = result.data
          .filter((t) => t.status === "pending" || t.status === "in_progress")
          .slice(0, 4);
        setUpcomingTasks(activeTasks);
      }
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("pf-theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      applyTheme(stored);
    } else {
      applyTheme("light");
    }

    // Fetch tasks
    fetchUpcomingTasks();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUpcomingTasks, 30000);
    return () => clearInterval(interval);
  }, [fetchUpcomingTasks]);

  const applyTheme = (value: "light" | "dark") => {
    const root = document.documentElement;
    if (value === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("pf-theme", value);
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
  };

  // Format due date for display
  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const isOverdue = date < now;

    if (isOverdue) {
      return { text: "Прострочено", urgent: true };
    }
    if (isToday) {
      return { text: `Сьогодні, ${date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`, urgent: true };
    }
    if (isTomorrow) {
      return { text: `Завтра, ${date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`, urgent: false };
    }
    return {
      text: date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" }),
      urgent: false,
    };
  };

  return (
    <div className="flex h-full w-full max-w-[16.25rem] flex-col gap-3">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
          <BrandIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{brand.title}</p>
          <p className="font-semibold text-lg text-slate-900 dark:text-admin-text-primary">{brand.subtitle}</p>
        </div>
      </div>
      <nav className="grid gap-2 text-sm font-semibold animate-stagger">
        {navItems.map(({ id, label, icon: Icon, badge }) => (
          <Button
            key={id}
            variant={active === id ? "default" : "ghost"}
            className={cn(
              "group justify-start rounded-2xl px-4 py-3 text-base transition-all duration-200",
              active === id
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 animate-scale-in"
                : "bg-white dark:bg-admin-surface border border-slate-100 dark:border-admin-border shadow-sm text-slate-800 dark:text-admin-text-primary hover:border-emerald-200 dark:hover:border-emerald-500 hover-scale"
            )}
            onClick={() => onChange(id)}
          >
            <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            {label}
            {badge && (
              <Badge className={cn(
                "ml-auto text-[10px] px-1.5 py-0",
                active === id
                  ? "bg-white/20 text-white"
                  : "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
              )}>
                {badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      {/* Upcoming Tasks - compact list */}
      {!isLoadingTasks && upcomingTasks.length > 0 && (
        <div className="space-y-1">
          {upcomingTasks.slice(0, 3).map((task) => {
            const dueInfo = formatDueDate(task.dueDate);
            return (
              <button
                key={task.documentId}
                onClick={() => onChange("todo")}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors",
                  "hover:bg-slate-50 dark:hover:bg-admin-surface-elevated",
                  dueInfo.urgent && "bg-rose-50/50 dark:bg-rose-900/10"
                )}
              >
                <Clock className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  dueInfo.urgent ? "text-rose-500" : "text-slate-400"
                )} />
                <span className="text-sm text-slate-700 dark:text-admin-text-primary truncate flex-1">
                  {task.title}
                </span>
                <span className={cn(
                  "text-[11px] shrink-0",
                  dueInfo.urgent
                    ? "text-rose-600 dark:text-rose-400 font-medium"
                    : "text-slate-400 dark:text-admin-text-tertiary"
                )}>
                  {dueInfo.text}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-auto space-y-3">
        {/* Quick Actions Block */}
        <div className="rounded-2xl border border-slate-100 dark:border-[#30363d] bg-white dark:bg-admin-surface p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-admin-text-tertiary px-1">
            <Zap className="h-3 w-3" />
            Швидкі дії
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-sm border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:border-emerald-200 dark:hover:border-emerald-700"
            onClick={onOpenSupply}
          >
            <Package className="h-4 w-4" />
            Наступна поставка
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-sm border-amber-100 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:border-amber-200 dark:hover:border-amber-700"
            onClick={onShowPendingPayments}
          >
            <CreditCard className="h-4 w-4" />
            Очікує оплати
            {pendingPaymentsCount > 0 && (
              <Badge className="ml-auto bg-amber-500 text-white text-xs px-1.5 py-0">
                {pendingPaymentsCount}
              </Badge>
            )}
          </Button>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-center px-2 text-xs dark:bg-admin-surface dark:border-[#30363d] dark:text-admin-text-secondary dark:hover:border-emerald-500"
            onClick={toggleTheme}
            title={theme === "light" ? "Світла тема" : "Темна тема"}
          >
            {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-center px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:bg-admin-surface dark:border-[#30363d] dark:text-rose-400 dark:hover:bg-rose-900/20 dark:hover:border-rose-500"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
