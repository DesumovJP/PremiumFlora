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
        {/* Overlay */}
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200"
          )}
        />

        {/* Content */}
        <Dialog.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-white dark:bg-admin-bg outline-none",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200"
          )}
        >
          {/* Visually hidden title for accessibility */}
          <VisuallyHidden.Root>
            <Dialog.Title>{title}</Dialog.Title>
          </VisuallyHidden.Root>

          {/* Sticky Header/Navbar */}
          <header
            className={cn(
              "sticky top-0 z-20 flex-shrink-0",
              "bg-white/95 dark:bg-admin-bg/95 backdrop-blur-md",
              "border-b border-slate-200/80 dark:border-admin-border/50",
              "safe-area-inset-top"
            )}
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-14 sm:h-16 items-center justify-between gap-3">
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
                    "flex-shrink-0",
                    "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center",
                    "rounded-full",
                    "bg-slate-100 dark:bg-white/10",
                    "text-slate-600 dark:text-white/70",
                    "transition-all duration-200 ease-out",
                    "hover:bg-slate-200 dark:hover:bg-white/20 hover:scale-105",
                    "active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                  )}
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                  <span className="sr-only">Закрити</span>
                </Dialog.Close>
              </div>
            </div>
          </header>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
              {children}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
