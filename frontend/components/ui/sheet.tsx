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
    className={cn("text-lg font-semibold text-slate-900 dark:text-admin-text-primary", className)}
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
    className={cn("text-sm text-slate-500 dark:text-admin-text-secondary", className)}
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
      "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200",
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
        "fixed z-50 flex h-full flex-col bg-white dark:bg-[#0d1117]",
        "shadow-[-8px_0_32px_rgba(0,0,0,0.12)] dark:shadow-[-8px_0_32px_rgba(0,0,0,0.4)]",
        // Width
        "w-[min(85vw,320px)] sm:w-[360px]",
        // Animations - smoother cubic bezier for Apple-like feel
        side === "left" && [
          "left-0 top-0",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=open]:duration-500 data-[state=open]:ease-[cubic-bezier(0.32,0.72,0,1)]",
          "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=closed]:duration-300 data-[state=closed]:ease-[cubic-bezier(0.32,0.72,0,1)]",
        ],
        side === "right" && [
          "right-0 top-0",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-500 data-[state=open]:ease-[cubic-bezier(0.32,0.72,0,1)]",
          "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=closed]:duration-300 data-[state=closed]:ease-[cubic-bezier(0.32,0.72,0,1)]",
        ],
        // Focus trap styling
        "focus:outline-none",
        className
      )}
      {...props}
    >
      {/* Premium close button */}
      {!hideCloseButton && (
        <SheetClose className={cn(
          "absolute right-4 top-4 z-10",
          "flex h-10 w-10 items-center justify-center rounded-full",
          "bg-slate-100/80 dark:bg-white/10",
          "text-slate-600 dark:text-white/70",
          "backdrop-blur-sm",
          "transition-all duration-200 ease-out",
          "hover:bg-slate-200/90 dark:hover:bg-white/20 hover:scale-105",
          "active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        )}>
          <X className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Закрити меню</span>
        </SheetClose>
      )}
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export { Sheet, SheetClose, SheetContent, SheetOverlay, SheetPortal, SheetTrigger, SheetTitle, SheetDescription };
