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
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-40 bg-black/50 dark:bg-black/60 overlay-blur-subtle animate-overlay-in",
      className
    )}
    {...props}
  />
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
        // Background & Border - CSS змінні
        "bg-[var(--admin-surface)]",
        "border-r border-[var(--admin-border-subtle)]",
        // Width - more compact
        "w-[280px] sm:w-[300px]",
        // Position and animations using our CSS classes
        side === "left" && "left-0 top-0 animate-slide-in-left",
        side === "right" && "right-0 top-0 border-l border-r-0 animate-slide-in-right",
        // Focus trap styling
        "focus:outline-none",
        className
      )}
      {...props}
    >
      {/* Minimal close button */}
      {!hideCloseButton && (
        <SheetClose className={cn(
          "absolute right-3 top-3 z-10",
          "flex h-8 w-8 items-center justify-center rounded-lg",
          "text-[var(--admin-text-muted)]",
          "animate-hover-scale",
          "hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text-primary)]",
          "focus:outline-none"
        )}>
          <X className="h-4 w-4" />
          <span className="sr-only">Закрити меню</span>
        </SheetClose>
      )}
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export { Sheet, SheetClose, SheetContent, SheetOverlay, SheetPortal, SheetTrigger, SheetTitle, SheetDescription };
