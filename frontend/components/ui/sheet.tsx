"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-[var(--admin-text-primary)]", className)}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-[var(--admin-text-tertiary)]", className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Close asChild>
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-40 bg-slate-900/20 dark:bg-black/60 backdrop-blur-sm animate-overlay-in cursor-pointer",
        className
      )}
      {...props}
    />
  </DialogPrimitive.Close>
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "left" | "right";
  hideCloseButton?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = "right", hideCloseButton = false, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Base styles
        "fixed z-50 flex h-full flex-col",
        // Background - neumorphic white/cream
        "bg-white dark:bg-[var(--admin-surface)]",
        // Width
        "w-[280px] sm:w-[300px]",
        // Position and animations
        side === "left" && "left-0 top-0 animate-slide-in-left",
        side === "right" && "right-0 top-0 animate-slide-in-right",
        // Focus trap styling
        "focus:outline-none",
        className
      )}
      style={{
        boxShadow: side === "right"
          ? "-8px 0 24px rgba(0, 0, 0, 0.08), -2px 0 8px rgba(0, 0, 0, 0.04)"
          : "8px 0 24px rgba(0, 0, 0, 0.08), 2px 0 8px rgba(0, 0, 0, 0.04)"
      }}
      {...props}
    >
      {/* Soft close button */}
      {!hideCloseButton && (
        <SheetClose className={cn(
          "absolute right-4 top-4 z-10",
          "flex h-8 w-8 items-center justify-center rounded-full",
          "bg-slate-100/80 dark:bg-white/10",
          "text-slate-500 dark:text-slate-400",
          "transition-all duration-200",
          "hover:bg-slate-200/90 dark:hover:bg-white/20 hover:text-slate-700",
          "active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
        )}>
          <X className="h-4 w-4" strokeWidth={1.5} />
          <span className="sr-only">Закрити меню</span>
        </SheetClose>
      )}
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export { Sheet, SheetClose, SheetContent, SheetOverlay, SheetPortal, SheetTrigger, SheetTitle, SheetDescription };
