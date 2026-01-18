import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Show error state */
  error?: boolean;
  /** Icon to show on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to show on the right side */
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, leftIcon, rightIcon, ...props }, ref) => {
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon;

    const inputElement = (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-lg px-3",
          // Adjust padding for icons
          hasLeftIcon && "pl-10",
          hasRightIcon && "pr-10",
          // Border & Background
          "border bg-white dark:bg-slate-800",
          error
            ? "border-rose-300 dark:border-rose-500/50"
            : "border-slate-200 dark:border-slate-700",
          // Typography
          "text-sm",
          // Colors
          "text-slate-900 dark:text-slate-100",
          "placeholder:text-slate-400 dark:placeholder:text-slate-500",
          // Effects
          "transition-all duration-200",
          // Focus states - elegant ring
          "focus:outline-none",
          error
            ? "focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            : "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
          // Hover - subtle border change
          !error && "hover:border-slate-300 dark:hover:border-slate-600",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900",
          // Touch
          "touch-manipulation",
          // File input styling
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );

    // If no icons, return simple input
    if (!hasLeftIcon && !hasRightIcon) {
      return inputElement;
    }

    // With icons, wrap in a relative container
    return (
      <div className="relative">
        {hasLeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            {leftIcon}
          </div>
        )}
        {inputElement}
        {hasRightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };






