import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "admin-optimized flex h-11 w-full rounded-xl border border-slate-200 dark:border-admin-border bg-white/70 dark:bg-admin-surface px-4 text-sm text-slate-900 dark:text-admin-text-primary shadow-sm transition-all duration-200 focus:border-emerald-300 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 dark:focus:ring-emerald-500/30 focus:shadow-sm placeholder:text-slate-400 dark:placeholder:text-admin-text-muted",
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






