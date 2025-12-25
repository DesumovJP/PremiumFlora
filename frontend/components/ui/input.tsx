import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "admin-optimized flex h-11 w-full rounded-xl border border-slate-200 dark:border-admin-border bg-white dark:bg-admin-surface px-4",
          // Typography - 16px on mobile to prevent iOS zoom, 14px on desktop
          "text-base sm:text-sm",
          // Colors
          "text-slate-900 dark:text-admin-text-primary placeholder:text-slate-400 dark:placeholder:text-admin-text-muted",
          // Effects
          "shadow-sm transition-all duration-200",
          // Focus states
          "focus:border-emerald-300 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 dark:focus:ring-emerald-500/30 focus:shadow-sm",
          // Touch optimization
          "touch-manipulation",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };






