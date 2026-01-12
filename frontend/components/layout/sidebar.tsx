/* eslint-disable @next/next/no-img-element */
"use client";
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
  Clock,
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
  pendingPaymentsAmount?: number;
  onShowPendingPayments?: () => void;
};


export function Sidebar({ navItems, active, onChange, brand, supplyCard, onOpenSupply, pendingPaymentsAmount = 0, onShowPendingPayments }: SidebarProps) {
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

  // Fetch upcoming tasks (active: pending/in_progress, including overdue)
  const fetchUpcomingTasks = useCallback(async () => {
    try {
      const result = await getUpcomingTasks();
      if (result.success && result.data) {
        // Limit to 4 tasks (query already filters by status)
        setUpcomingTasks(result.data.slice(0, 4));
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

    // Listen for task updates from todo-section
    const handleTasksUpdated = () => {
      fetchUpcomingTasks();
    };
    window.addEventListener("tasks-updated", handleTasksUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener("tasks-updated", handleTasksUpdated);
    };
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
    <div className="flex h-full w-full max-w-[16rem] flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-3 pb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <BrandIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">{brand.title}</p>
          <p className="font-semibold text-[var(--admin-text-primary)]">{brand.subtitle}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 px-2">
        {navItems.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-all duration-150",
              active === id
                ? "bg-[var(--admin-bg)] text-[var(--admin-text-primary)]"
                : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border-subtle)] hover:text-[var(--admin-text-primary)]"
            )}
            onClick={() => onChange(id)}
          >
            <Icon className={cn(
              "h-[18px] w-[18px] transition-colors",
              active === id
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-[var(--admin-text-muted)] group-hover:text-[var(--admin-text-tertiary)]"
            )} />
            <span className="flex-1 text-left">{label}</span>
            {badge && (
              <span className={cn(
                "text-[11px] font-medium tabular-nums",
                active === id
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-[var(--admin-text-muted)]"
              )}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Upcoming Tasks */}
      {!isLoadingTasks && upcomingTasks.length > 0 && (
        <div className="mt-6 px-2">
          <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
            Найближчі завдання
          </p>
          <div className="space-y-0.5">
            {upcomingTasks.slice(0, 3).map((task) => {
              const dueInfo = formatDueDate(task.dueDate);
              return (
                <button
                  key={task.documentId}
                  onClick={() => onChange("todo")}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors",
                    "hover:bg-[var(--admin-border-subtle)]",
                    dueInfo.urgent && "bg-rose-50/50 dark:bg-rose-500/10"
                  )}
                >
                  <Clock className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    dueInfo.urgent ? "text-rose-500" : "text-[var(--admin-text-muted)]"
                  )} />
                  <span className="text-sm text-[var(--admin-text-secondary)] truncate flex-1">
                    {task.title}
                  </span>
                  <span className={cn(
                    "text-[11px] shrink-0 tabular-nums",
                    dueInfo.urgent
                      ? "text-rose-500 font-medium"
                      : "text-[var(--admin-text-muted)]"
                  )}>
                    {dueInfo.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom section */}
      <div className="mt-auto space-y-4 px-2 pt-4">
        {/* Quick Actions */}
        <div className="space-y-1">
          <button
            onClick={onOpenSupply}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-[var(--admin-border-subtle)] group"
          >
            <Package className="h-[18px] w-[18px] text-[var(--admin-text-muted)] group-hover:text-emerald-500 transition-colors" />
            <span className="flex-1 text-[15px] font-medium text-[var(--admin-text-secondary)] group-hover:text-[var(--admin-text-primary)]">
              Поставка
            </span>
          </button>
          <button
            onClick={onShowPendingPayments}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-[var(--admin-border-subtle)] group"
          >
            <CreditCard className="h-[18px] w-[18px] text-[var(--admin-text-muted)] group-hover:text-amber-500 transition-colors" />
            <span className="flex-1 text-[15px] font-medium text-[var(--admin-text-secondary)] group-hover:text-[var(--admin-text-primary)]">
              Очікування
            </span>
            {pendingPaymentsAmount > 0 && (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 tabular-nums">
                {Math.round(pendingPaymentsAmount).toLocaleString('uk-UA')}₴
              </span>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--admin-border-subtle)]" />

        {/* Theme & Logout */}
        <div className="flex items-center gap-1 px-1">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[var(--admin-text-tertiary)] hover:bg-[var(--admin-border-subtle)] hover:text-[var(--admin-text-primary)] transition-colors"
            title={theme === "light" ? "Темна тема" : "Світла тема"}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="text-sm">{theme === "light" ? "Темна" : "Світла"}</span>
          </button>
          <div className="w-px h-5 bg-[var(--admin-border-subtle)]" />
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[var(--admin-text-tertiary)] hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
