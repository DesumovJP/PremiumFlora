"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type FullscreenModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  breadcrumb?: ReactNode;
  title?: string;
};

export function FullscreenModal({
  open,
  onOpenChange,
  children,
  breadcrumb,
  title = "Модальне вікно",
}: FullscreenModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay - subtle blur with CSS animation */}
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/10 dark:bg-black/40 overlay-blur-subtle animate-overlay-in"
        />

        {/* Content - slide up from bottom with CSS animation */}
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900 outline-none animate-fullscreen-in"
        >
          {/* Visually hidden title for accessibility */}
          <VisuallyHidden.Root>
            <Dialog.Title>{title}</Dialog.Title>
          </VisuallyHidden.Root>

          {/* Header */}
          <header
            className={cn(
              "sticky top-0 z-20 shrink-0",
              "bg-white dark:bg-slate-900",
              "border-b border-slate-100 dark:border-slate-800",
              "safe-area-inset-top"
            )}
          >
            <div className="mx-auto max-w-4xl px-3 sm:px-6">
              <div className="flex h-11 sm:h-14 items-center justify-between gap-2 sm:gap-4">
                {/* Breadcrumb */}
                {breadcrumb ? (
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="overflow-x-auto scrollbar-hide">
                      {breadcrumb}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1" />
                )}

                {/* Close Button */}
                <Dialog.Close
                  className={cn(
                    "shrink-0",
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    "text-[var(--admin-text-muted)]",
                    "animate-hover-scale",
                    "hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text-primary)]",
                    "focus:outline-none"
                  )}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Закрити</span>
                </Dialog.Close>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
              {children}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
