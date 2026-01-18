import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  /** Visual variant */
  variant?: "default" | "pills" | "underline";
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center text-sm",
      // Default variant - pill container
      variant === "default" && [
        "w-full justify-start gap-1",
        "rounded-xl p-1",
        "bg-slate-100/80 dark:bg-slate-800/80",
      ],
      // Pills variant - separate pills
      variant === "pills" && [
        "gap-2",
      ],
      // Underline variant
      variant === "underline" && [
        "w-full gap-0 border-b border-slate-200 dark:border-slate-700",
      ],
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /** Visual variant (should match TabsList variant) */
  variant?: "default" | "pills" | "underline";
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base
      "inline-flex items-center justify-center whitespace-nowrap",
      "font-medium",
      "transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      // Default variant
      variant === "default" && [
        "flex-1 min-w-0",
        "rounded-lg px-4 py-2 text-sm",
        "text-slate-600 dark:text-slate-400",
        "hover:text-slate-900 dark:hover:text-slate-200",
        // Active state
        "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700",
        "data-[state=active]:text-slate-900 dark:data-[state=active]:text-white",
        "data-[state=active]:shadow-sm",
      ],
      // Pills variant
      variant === "pills" && [
        "rounded-full px-4 py-2 text-sm",
        "bg-slate-100 dark:bg-slate-800",
        "text-slate-600 dark:text-slate-400",
        "hover:bg-slate-200 dark:hover:bg-slate-700",
        // Active state
        "data-[state=active]:bg-emerald-500",
        "data-[state=active]:text-white",
        "data-[state=active]:shadow-md",
      ],
      // Underline variant
      variant === "underline" && [
        "px-4 py-3 text-sm",
        "text-slate-600 dark:text-slate-400",
        "border-b-2 border-transparent -mb-px",
        "hover:text-slate-900 dark:hover:text-slate-200",
        "hover:border-slate-300 dark:hover:border-slate-600",
        // Active state
        "data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400",
        "data-[state=active]:border-emerald-500",
      ],
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "focus-visible:outline-none",
      // Animation for content change
      "data-[state=active]:animate-fade-in",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };






