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
          "flex h-9 w-full rounded-md px-3",
          // Border & Background - CSS змінні
          "border border-[var(--admin-border)] bg-[var(--admin-surface)]",
          // Typography
          "text-base sm:text-sm",
          // Colors - CSS змінні
          "text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)]",
          // Effects
          "transition-all duration-200",
          // Focus states - elegant thin border
          "focus:outline-none focus:border-emerald-500",
          "focus:ring-1 focus:ring-emerald-500/20",
          // Hover
          "hover:border-[var(--admin-border)]",
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






