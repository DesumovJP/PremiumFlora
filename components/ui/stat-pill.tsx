import { cn } from "@/lib/utils";
import React from "react";

type StatPillProps = {
  label: string;
  value: string;
  className?: string;
};

export function StatPill({ label, value, className }: StatPillProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 shadow-sm",
        className
      )}
    >
      <p className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-base sm:text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}






