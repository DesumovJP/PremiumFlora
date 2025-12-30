import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96] hover:-translate-y-[2px]",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/40 active:bg-emerald-700",
        primary:
          "bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/40 active:bg-emerald-700",
        outline:
          "border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text-primary)] hover:border-[var(--admin-border)] hover:shadow-md",
        ghost:
          "text-[var(--admin-text-tertiary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg)]",
        muted:
          "bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border-subtle)]",
        danger:
          "bg-rose-600 text-white hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/40 active:bg-rose-700",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
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






