import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";
import type { KpiData } from "@/lib/api-types";

type KpiCardProps = {
  item: KpiData;
};

export function KpiCard({ item }: KpiCardProps) {
  return (
    <Card className="border-[var(--admin-border)] bg-[var(--admin-surface)]">
      <CardContent className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-[var(--admin-text-tertiary)]">{item.label}</p>
        <p className="text-lg font-semibold text-[var(--admin-text-primary)]">{item.value}</p>
        <p className={cn(
          "text-xs font-semibold",
          item.trend === "up" ? "text-emerald-700 dark:text-emerald-400" : item.trend === "down" ? "text-rose-600 dark:text-rose-400" : "text-[var(--admin-text-muted)]"
        )}>
          {item.change}
        </p>
      </CardContent>
    </Card>
  );
}






