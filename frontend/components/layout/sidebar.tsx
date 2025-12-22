/* eslint-disable @next/next/no-img-element */
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ComponentType, useEffect, useState } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

type SidebarProps = {
  navItems: NavItem[];
  active: string;
  onChange: (id: string) => void;
  brand: { title: string; subtitle: string; icon: ComponentType<{ className?: string }> };
  supplyCard: { title: string; subtitle: string; icon: ComponentType<{ className?: string }> };
  onOpenSupply?: () => void;
};

export function Sidebar({ navItems, active, onChange, brand, supplyCard, onOpenSupply }: SidebarProps) {
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
        {navItems.map(({ id, label, icon: Icon }) => (
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
          </Button>
        ))}
      </nav>
      <div className="mt-auto">
        <Card
          className="border-dashed border-emerald-100 dark:border-[#30363d] bg-emerald-50/60 dark:bg-emerald-900/20 cursor-pointer transition hover:border-emerald-200 dark:hover:border-emerald-500"
          onClick={onOpenSupply}
        >
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300">
              <SupplyIcon className="h-4 w-4" />
              {supplyCard.title}
            </CardTitle>
            {supplyCard.subtitle && (
              <CardDescription className="text-emerald-700 dark:text-emerald-400">{supplyCard.subtitle}</CardDescription>
            )}
          </CardHeader>
        </Card>
        <div className="mt-3 flex gap-1.5">
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

