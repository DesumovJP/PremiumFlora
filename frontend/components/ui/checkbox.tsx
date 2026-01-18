"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Show indeterminate state */
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, indeterminate, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base
      "peer h-5 w-5 shrink-0 rounded-md",
      // Border
      "border-2 border-slate-300 dark:border-slate-600",
      // Background
      "bg-white dark:bg-slate-800",
      // Transition
      "transition-all duration-200",
      // Focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900",
      // Hover
      "hover:border-emerald-400 dark:hover:border-emerald-500",
      // Checked state
      "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500",
      "data-[state=checked]:text-white",
      // Indeterminate state
      "data-[state=indeterminate]:bg-emerald-500 data-[state=indeterminate]:border-emerald-500",
      "data-[state=indeterminate]:text-white",
      // Disabled
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Active press effect
      "active:scale-95",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "flex items-center justify-center text-current",
        // Animation for the check icon
        "animate-icon-pop"
      )}
    >
      {indeterminate ? (
        <Minus className="h-3.5 w-3.5" strokeWidth={3} />
      ) : (
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }









