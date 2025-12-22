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
      "admin-surface-overlay fixed inset-0 z-40 bg-black/30 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "left" | "right";
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = "left", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "admin-surface admin-optimized fixed z-50 flex h-full w-80 flex-col gap-4 bg-white dark:bg-admin-surface-elevated p-5 shadow-2xl transition",
        side === "left" &&
          "left-0 top-0 data-[state=open]:animate-slide-in-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left",
        side === "right" &&
          "right-0 top-0 data-[state=open]:animate-slide-in-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
        className
      )}
      {...props}
    >
      <SheetClose className="absolute right-4 top-4 rounded-full p-2 text-slate-500 dark:text-admin-text-tertiary transition hover:bg-slate-100 dark:hover:bg-admin-surface focus:outline-none focus:ring-2 focus:ring-emerald-200">
        <X className="h-4 w-4" />
      </SheetClose>
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export { Sheet, SheetClose, SheetContent, SheetOverlay, SheetPortal, SheetTrigger, SheetTitle, SheetDescription };

