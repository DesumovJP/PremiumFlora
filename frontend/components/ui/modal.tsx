"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  fullscreenOnMobile?: boolean;
  showClose?: boolean;
  headerActions?: ReactNode;
  /** Allow horizontal scroll for wide content like tables */
  allowHorizontalScroll?: boolean;
  /** Custom class for the content wrapper */
  contentClassName?: string;
};

const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-[360px]",
  md: "max-w-[480px]",
  lg: "max-w-[600px]",
  xl: "max-w-[720px]",
  "2xl": "max-w-[900px]",
  "3xl": "max-w-[1100px]",
  "4xl": "max-w-[1280px]",
  full: "max-w-[calc(100vw-2rem)]",
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
  allowHorizontalScroll = false,
  contentClassName,
}: ModalProps) {
  const isLargeModal = size === "3xl" || size === "4xl" || size === "full";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay - soft blur with premium fade */}
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-slate-900/20 dark:bg-black/60 backdrop-blur-sm animate-overlay-in"
        />

        {/* Content - white clean style with premium animation */}
        <Dialog.Content
          className={cn(
            // Base
            "fixed z-50 flex flex-col",
            "bg-white dark:bg-slate-800",
            "rounded-2xl border border-slate-100 dark:border-slate-700",
            "outline-none",
            // Position
            "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[calc(100%-2rem)]",
            // Animation - premium spring effect
            "animate-modal-in",
            // Height - adaptive based on size
            fullscreenOnMobile || isLargeModal
              ? "max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]"
              : "max-h-[calc(100vh-4rem)]",
            // Fullscreen on mobile for large modals
            isLargeModal && "sm:rounded-2xl rounded-xl",
            sizeMap[size],
            contentClassName
          )}
          style={{
            boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.18), 0 8px 16px -4px rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* Header - sticky with subtle bottom border */}
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 border-b border-transparent shrink-0">
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
                  "bg-slate-100/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400",
                  "transition-all duration-200",
                  "hover:bg-slate-200/90 dark:hover:bg-slate-600/90 hover:text-slate-700 dark:hover:text-slate-200",
                  "active:scale-95",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30",
                  // Micro animation on hover
                  "group"
                )}
              >
                <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" strokeWidth={1.5} />
              </Dialog.Close>
            )}
          </div>

          {/* Body - with optional horizontal scroll */}
          <div
            className={cn(
              "flex-1 min-h-0 px-5 py-4",
              allowHorizontalScroll
                ? "overflow-auto"
                : "overflow-y-auto overflow-x-hidden"
            )}
          >
            {children}
          </div>

          {/* Footer - sticky with subtle top border */}
          {footer && (
            <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-700 shrink-0">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
