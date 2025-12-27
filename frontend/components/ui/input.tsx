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
          "flex h-9 w-full rounded-md border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3",
          // Typography
          "text-base sm:text-sm",
          // Colors
          "text-stone-800 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500",
          // Effects
          "transition-all duration-200",
          // Focus states with glow
          "focus:outline-none focus:border-emerald-500/50 dark:focus:border-emerald-500/50",
          "focus:ring-2 focus:ring-emerald-500/10 dark:focus:ring-emerald-500/20",
          // Hover
          "hover:border-stone-300 dark:hover:border-slate-600",
          // Touch
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






