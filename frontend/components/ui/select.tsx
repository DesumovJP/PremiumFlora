import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectGroup = SelectPrimitive.Group;
const SelectLabel = SelectPrimitive.Label;

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  error?: boolean;
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, error, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base
      "group flex h-10 w-full items-center justify-between gap-2",
      "rounded-lg px-3 text-sm",
      // Background & border
      "bg-white dark:bg-slate-800",
      error
        ? "border-2 border-rose-300 dark:border-rose-500/50"
        : "border border-slate-200 dark:border-slate-700",
      // Text
      "text-slate-900 dark:text-slate-100",
      "data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500",
      // Transition
      "transition-all duration-200",
      // Hover
      !error && "hover:border-slate-300 dark:hover:border-slate-600",
      // Focus
      "focus:outline-none",
      error
        ? "focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
        : "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
      // Open state
      "data-[state=open]:border-emerald-500 data-[state=open]:ring-2 data-[state=open]:ring-emerald-500/20",
      // Disabled
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900",
      className
    )}
    {...props}
  >
    <span className="flex-1 truncate text-left">{children}</span>
    <SelectPrimitive.Icon asChild>
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0",
          "text-slate-400 dark:text-slate-500",
          "transition-transform duration-200 ease-out",
          "group-data-[state=open]:rotate-180"
        )}
      />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        // Base
        "z-[100] min-w-[10rem] overflow-hidden",
        "rounded-xl",
        // Background & border
        "bg-white dark:bg-slate-800",
        "border border-slate-200 dark:border-slate-700",
        // Shadow - premium
        "shadow-lg shadow-slate-200/50 dark:shadow-black/30",
        // Animations
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
        "duration-150",
        position === "popper" && "translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton
        className={cn(
          "flex items-center justify-center py-1.5",
          "text-slate-400 dark:text-slate-500",
          "bg-gradient-to-b from-white dark:from-slate-800"
        )}
      >
        <ChevronUp className="h-4 w-4" />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className="p-1.5">
        {children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton
        className={cn(
          "flex items-center justify-center py-1.5",
          "text-slate-400 dark:text-slate-500",
          "bg-gradient-to-t from-white dark:from-slate-800"
        )}
      >
        <ChevronDown className="h-4 w-4" />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      // Base
      "relative flex w-full cursor-pointer select-none items-center justify-between",
      "rounded-lg px-2.5 py-2 text-sm",
      // Text
      "text-slate-700 dark:text-slate-300",
      // Outline
      "outline-none",
      // Transition
      "transition-colors duration-100",
      // Hover
      "hover:bg-slate-100 dark:hover:bg-slate-700/70",
      // Focus (keyboard nav)
      "focus:bg-slate-100 dark:focus:bg-slate-700/70",
      // Checked state
      "data-[state=checked]:bg-emerald-50 dark:data-[state=checked]:bg-emerald-900/20",
      "data-[state=checked]:text-emerald-700 dark:data-[state=checked]:text-emerald-400",
      // Disabled
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText className="flex-1 pr-2">{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="flex h-4 w-4 items-center justify-center shrink-0">
      <Check
        className={cn(
          "h-4 w-4",
          "text-emerald-600 dark:text-emerald-400",
          "animate-icon-pop"
        )}
        strokeWidth={2.5}
      />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
};
