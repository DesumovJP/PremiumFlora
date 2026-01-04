"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  fullscreenOnMobile?: boolean;
  showClose?: boolean;
  headerActions?: ReactNode;
};

const sizeMap = {
  sm: "max-w-[360px]",
  md: "max-w-[480px]",
  lg: "max-w-[600px]",
  xl: "max-w-[720px]",
  "2xl": "max-w-[900px]",
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  fullscreenOnMobile = false,
  showClose = true,
  headerActions,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay - soft blur */}
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-slate-900/20 dark:bg-black/60 backdrop-blur-sm animate-overlay-in"
        />

        {/* Content - white clean style */}
        <Dialog.Content
          className={cn(
            // Base
            "fixed z-50 flex flex-col",
            "bg-white dark:bg-slate-800",
            "rounded-2xl border border-slate-100",
            "outline-none",
            // Position
            "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[calc(100%-2rem)]",
            // Animation
            "animate-modal-in",
            // Height
            fullscreenOnMobile
              ? "max-h-[calc(100vh-2rem)]"
              : "max-h-[calc(100vh-4rem)]",
            sizeMap[size]
          )}
          style={{
            boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-0">
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-base font-semibold text-slate-800 dark:text-white leading-tight">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {description}
                </Dialog.Description>
              )}
            </div>

            {headerActions && (
              <div className="flex items-center gap-2 shrink-0">
                {headerActions}
              </div>
            )}

            {showClose && (
              <Dialog.Close
                className={cn(
                  "shrink-0 -mr-1 -mt-1",
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  "bg-slate-100/80 text-slate-500",
                  "transition-all duration-200",
                  "hover:bg-slate-200/90 hover:text-slate-700",
                  "active:scale-95",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                )}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </Dialog.Close>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-2">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
