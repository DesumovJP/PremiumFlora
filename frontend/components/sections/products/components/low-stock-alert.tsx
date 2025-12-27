import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LowStockItem } from "../types";

type LowStockAlertProps = {
  items: LowStockItem[];
  onOpenSupply: () => void;
};

export function LowStockAlert({ items, onOpenSupply }: LowStockAlertProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-rose-200/80 dark:border-rose-700/40 bg-gradient-to-r from-rose-50 via-rose-50/80 to-red-50/60 dark:from-rose-900/30 dark:via-rose-900/20 dark:to-red-900/10 p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-800/40 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-rose-900 dark:text-rose-200">Низькі залишки</p>
            <div className="flex flex-wrap gap-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-700/60 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-300 shadow-sm"
                >
                  <span>{item.productName}</span>
                  <span className="text-rose-500 dark:text-rose-400">·</span>
                  <span>{item.variant}</span>
                  <span className="text-rose-500 dark:text-rose-400">·</span>
                  <span className="font-bold">{item.stock} шт</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="shrink-0 border-rose-300 dark:border-rose-600 bg-white/60 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-800/50 hover:border-rose-400 dark:hover:border-rose-500"
          onClick={onOpenSupply}
        >
          Запланувати закупку
        </Button>
      </div>
    </div>
  );
}
