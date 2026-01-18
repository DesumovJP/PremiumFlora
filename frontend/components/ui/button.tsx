import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles with premium micro-animations
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    // Micro-animation: scale down on click
    "active:scale-[0.98]",
    // Icon animation on hover
    "[&>svg]:transition-transform [&>svg]:duration-200",
    "[&:hover>svg]:scale-110",
  ].join(" "),
  {
    variants: {
      variant: {
        // Default/Primary - Clean white with green accent
        default: [
          "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400",
          "rounded-xl border border-emerald-500/20 dark:border-emerald-500/30",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]",
          "hover:border-emerald-500/40 dark:hover:border-emerald-400/50",
          "hover:shadow-[0_4px_12px_rgba(16,185,129,0.1),0_2px_4px_rgba(0,0,0,0.04)]",
          "hover:-translate-y-0.5",
        ].join(" "),
        primary: [
          "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400",
          "rounded-xl border border-emerald-500/20 dark:border-emerald-500/30",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]",
          "hover:border-emerald-500/40 dark:hover:border-emerald-400/50",
          "hover:shadow-[0_4px_12px_rgba(16,185,129,0.1),0_2px_4px_rgba(0,0,0,0.04)]",
          "hover:-translate-y-0.5",
        ].join(" "),
        // Outline - White with subtle green border
        outline: [
          "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400",
          "rounded-xl border border-emerald-500/30 dark:border-emerald-500/40",
          "shadow-[0_2px_6px_rgba(0,0,0,0.03)]",
          "hover:border-emerald-500/50 dark:hover:border-emerald-400/60",
          "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20",
          "hover:shadow-[0_3px_10px_rgba(16,185,129,0.08)]",
          "hover:-translate-y-0.5",
        ].join(" "),
        // Ghost - Minimal, no background
        ghost: [
          "bg-transparent text-slate-600 dark:text-slate-300",
          "rounded-lg",
          "hover:bg-slate-100 dark:hover:bg-slate-700/50",
          "hover:text-emerald-600 dark:hover:text-emerald-400",
        ].join(" "),
        // Muted - Soft gray background
        muted: [
          "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
          "rounded-xl border border-slate-100 dark:border-slate-700",
          "shadow-[0_1px_3px_rgba(0,0,0,0.02)]",
          "hover:bg-slate-100/80 dark:hover:bg-slate-700/80",
          "hover:shadow-[0_2px_6px_rgba(0,0,0,0.04)]",
          "hover:-translate-y-0.5",
        ].join(" "),
        // Danger - Clean white with red accent
        danger: [
          "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400",
          "rounded-xl border border-rose-200/50 dark:border-rose-500/30",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
          "hover:border-rose-300 dark:hover:border-rose-400/50",
          "hover:bg-rose-50/50 dark:hover:bg-rose-900/20",
          "hover:shadow-[0_4px_12px_rgba(244,63,94,0.1)]",
          "hover:-translate-y-0.5",
        ].join(" "),
        // Secondary - Pure white minimal
        secondary: [
          "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
          "rounded-xl border border-slate-200/60 dark:border-slate-600",
          "shadow-[0_2px_6px_rgba(0,0,0,0.03)]",
          "hover:text-emerald-600 dark:hover:text-emerald-400",
          "hover:border-emerald-200/50 dark:hover:border-emerald-500/40",
          "hover:shadow-[0_3px_10px_rgba(0,0,0,0.05)]",
          "hover:-translate-y-0.5",
        ].join(" "),
        // Filled - For CTAs that need more emphasis (green filled)
        filled: [
          "bg-emerald-500 text-white",
          "rounded-xl border border-emerald-400/30",
          "shadow-[0_2px_8px_rgba(16,185,129,0.25)]",
          "hover:bg-emerald-600",
          "hover:shadow-[0_4px_14px_rgba(16,185,129,0.3)]",
          "hover:-translate-y-0.5",
          "active:bg-emerald-700",
        ].join(" "),
        // Link style - just text
        link: [
          "bg-transparent text-emerald-600 dark:text-emerald-400",
          "underline-offset-4",
          "hover:underline hover:text-emerald-700 dark:hover:text-emerald-300",
          "p-0 h-auto",
        ].join(" "),
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-6",
        xl: "h-12 px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };






