import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";
import type { KpiData } from "@/lib/api-types";

type KpiCardProps = {
  item: KpiData;
};

export function KpiCard({ item }: KpiCardProps) {
  return (
    <Card className="border-slate-100 dark:border-[#30363d] bg-white/90 dark:bg-admin-surface">
      <CardContent className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-admin-text-tertiary">{item.label}</p>
        <p className="text-lg font-semibold text-slate-900 dark:text-admin-text-primary">{item.value}</p>
        <p className={cn(
          "text-xs font-semibold",
          item.trend === "up" ? "text-emerald-700 dark:text-emerald-400" : item.trend === "down" ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-admin-text-muted"
        )}>
          {item.change}
        </p>
      </CardContent>
    </Card>
  );
}






