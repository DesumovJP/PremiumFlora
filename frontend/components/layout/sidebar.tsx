/* eslint-disable @next/next/no-img-element */
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ComponentType, useEffect, useState } from "react";
import { Moon, Sun, LogOut, Package, CreditCard, Zap } from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

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
  const SupplyIcon = supplyCard.icon;
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
    router.refresh();
  };

  useEffect(() => {
    const stored = window.localStorage.getItem("pf-theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      applyTheme(stored);
    } else {
      applyTheme("light");
    }
  }, []);

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

