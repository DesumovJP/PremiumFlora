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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out" />
        <Dialog.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white dark:bg-admin-bg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out"
          )}
        >
          <VisuallyHidden.Root>
            <Dialog.Title>{title}</Dialog.Title>
          </VisuallyHidden.Root>
          <div className="relative mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
            <div className="sticky top-4 z-10 mb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-2 -mt-6 sm:-mt-8 lg:-mt-12 bg-white/80 dark:bg-admin-bg/80 backdrop-blur-md border-b border-slate-200/50 dark:border-admin-border/50">
              <div className="mx-auto max-w-3xl flex items-center justify-between gap-4">
                {breadcrumb && (
                  <div className="flex-1 min-w-0">
                    {breadcrumb}
                  </div>
                )}
                <Dialog.Close className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-admin-surface-elevated text-slate-500 dark:text-admin-text-tertiary shadow-lg backdrop-blur-sm transition hover:bg-white dark:hover:bg-admin-surface hover:text-slate-900 dark:hover:text-admin-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Закрити</span>
                </Dialog.Close>
              </div>
            </div>
            <div>{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}



