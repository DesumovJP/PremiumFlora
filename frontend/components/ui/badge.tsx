import { cn } from "@/lib/utils";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  // Base styles with micro-animation
  [
    "inline-flex items-center gap-1.5 rounded-full font-medium",
    "transition-all duration-200",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        neutral: [
          "bg-slate-100 dark:bg-slate-800",
          "text-slate-700 dark:text-slate-300",
        ].join(" "),
        success: [
          "bg-emerald-50 dark:bg-emerald-900/30",
          "text-emerald-700 dark:text-emerald-400",
          "ring-1 ring-emerald-200/50 dark:ring-emerald-800/50",
        ].join(" "),
        warning: [
          "bg-amber-50 dark:bg-amber-900/30",
          "text-amber-700 dark:text-amber-400",
          "ring-1 ring-amber-200/50 dark:ring-amber-800/50",
        ].join(" "),
        error: [
          "bg-rose-50 dark:bg-rose-900/30",
          "text-rose-700 dark:text-rose-400",
          "ring-1 ring-rose-200/50 dark:ring-rose-800/50",
        ].join(" "),
        info: [
          "bg-sky-50 dark:bg-sky-900/30",
          "text-sky-700 dark:text-sky-400",
          "ring-1 ring-sky-200/50 dark:ring-sky-800/50",
        ].join(" "),
        outline: [
          "bg-transparent",
          "text-slate-700 dark:text-slate-300",
          "ring-1 ring-slate-200 dark:ring-slate-700",
        ].join(" "),
        // Premium filled variants
        "success-solid": [
          "bg-emerald-500",
          "text-white",
        ].join(" "),
        "error-solid": [
          "bg-rose-500",
          "text-white",
        ].join(" "),
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:shadow-sm",
        false: "",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
      interactive: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** @deprecated Use `variant` instead */
  tone?: "neutral" | "success" | "warning" | "outline";
  /** Left icon slot */
  leftIcon?: React.ReactNode;
  /** Right icon slot (useful for close button) */
  rightIcon?: React.ReactNode;
}

export function Badge({
  className,
  variant,
  size,
  interactive,
  tone,
  leftIcon,
  rightIcon,
  children,
  ...props
}: BadgeProps) {
  // Support legacy `tone` prop
  const resolvedVariant = variant ?? (tone as BadgeProps["variant"]) ?? "neutral";

  return (
    <div
      className={cn(badgeVariants({ variant: resolvedVariant, size, interactive }), className)}
      {...props}
    >
      {leftIcon && <span className="shrink-0 -ml-0.5">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0 -mr-0.5">{rightIcon}</span>}
    </div>
  );
}






