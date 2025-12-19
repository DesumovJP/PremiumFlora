import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";
import type { KpiData } from "@/lib/api-types";

type KpiCardProps = {
  item: KpiData;
};

export function KpiCard({ item }: KpiCardProps) {
  return (
    <Card className="border-slate-100 bg-white/90">
      <CardContent className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
        <p className="text-lg font-semibold text-slate-900">{item.value}</p>
        <p className={cn(
          "text-xs font-semibold",
          item.trend === "up" ? "text-emerald-700" : item.trend === "down" ? "text-rose-600" : "text-slate-500"
        )}>
          {item.change}
        </p>
      </CardContent>
    </Card>
  );
}






