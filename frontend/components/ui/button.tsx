import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default/Primary - Clean white with green accent
        default:
          "bg-white text-emerald-600 rounded-xl border border-emerald-500/20 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] hover:border-emerald-500/40 hover:shadow-[0_4px_12px_rgba(16,185,129,0.1),0_2px_4px_rgba(0,0,0,0.04)] hover:-translate-y-px active:translate-y-0 active:shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        primary:
          "bg-white text-emerald-600 rounded-xl border border-emerald-500/20 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] hover:border-emerald-500/40 hover:shadow-[0_4px_12px_rgba(16,185,129,0.1),0_2px_4px_rgba(0,0,0,0.04)] hover:-translate-y-px active:translate-y-0 active:shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        // Outline - White with subtle green border
        outline:
          "bg-white text-emerald-600 rounded-xl border border-emerald-500/30 shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:border-emerald-500/50 hover:bg-emerald-50/50 hover:shadow-[0_3px_10px_rgba(16,185,129,0.08)] hover:-translate-y-px active:translate-y-0",
        // Ghost - Minimal, no background
        ghost:
          "bg-transparent text-slate-600 rounded-lg hover:bg-slate-50 hover:text-emerald-600",
        // Muted - Soft gray background
        muted:
          "bg-slate-50 text-slate-600 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:bg-slate-100/80 hover:shadow-[0_2px_6px_rgba(0,0,0,0.04)] hover:-translate-y-px",
        // Danger - Clean white with red accent
        danger:
          "bg-white text-rose-600 rounded-xl border border-rose-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-rose-300 hover:bg-rose-50/50 hover:shadow-[0_4px_12px_rgba(244,63,94,0.1)] hover:-translate-y-px active:translate-y-0",
        // Secondary - Pure white minimal
        secondary:
          "bg-white text-slate-700 rounded-xl border border-slate-200/60 shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:text-emerald-600 hover:border-emerald-200/50 hover:shadow-[0_3px_10px_rgba(0,0,0,0.05)] hover:-translate-y-px active:translate-y-0",
        // Filled - For CTAs that need more emphasis (green filled)
        filled:
          "bg-emerald-500 text-white rounded-xl border border-emerald-400/30 shadow-[0_2px_8px_rgba(16,185,129,0.25)] hover:bg-emerald-600 hover:shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:-translate-y-px active:translate-y-0 active:bg-emerald-700",
        // Link style - just text
        link: "bg-transparent text-emerald-600 underline-offset-4 hover:underline hover:text-emerald-700 p-0 h-auto",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-6",
        xl: "h-12 px-8 text-base",
        icon: "h-10 w-10",
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






