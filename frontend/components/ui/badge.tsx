import { cn } from "@/lib/utils";
import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "neutral" | "success" | "warning" | "outline";
}

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-slate-100 dark:bg-admin-surface text-slate-700 dark:text-admin-text-secondary",
  success: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-800/50",
  warning: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-800/50",
  outline: "border border-slate-200 dark:border-admin-border text-slate-700 dark:text-admin-text-secondary",
};

export function Badge({
  className,
  tone,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium w-auto transition-all duration-150 hover:scale-[1.02] hover:shadow-sm",
        tone ? toneStyles[tone] : "",
        className
      )}
      {...props}
    />
  );
}






