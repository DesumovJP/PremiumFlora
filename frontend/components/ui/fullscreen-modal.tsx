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
        {/* Overlay - subtle */}
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/10 dark:bg-black/40",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-150",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-100"
          )}
        />

        {/* Content */}
        <Dialog.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#0d1117] outline-none",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-150",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-100"
          )}
        >
          {/* Visually hidden title for accessibility */}
          <VisuallyHidden.Root>
            <Dialog.Title>{title}</Dialog.Title>
          </VisuallyHidden.Root>

          {/* Header */}
          <header
            className={cn(
              "sticky top-0 z-20 shrink-0",
              "bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md",
              "border-b border-slate-100 dark:border-white/5",
              "safe-area-inset-top"
            )}
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <div className="flex h-14 items-center justify-between gap-4">
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
                    "text-slate-400 dark:text-slate-500",
                    "transition-colors duration-100",
                    "hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-300",
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
