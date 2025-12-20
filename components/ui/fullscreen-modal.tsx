"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type FullscreenModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export function FullscreenModal({
  open,
  onOpenChange,
  children,
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
          <div className="relative mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
            <Dialog.Close className="sticky top-4 z-10 ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-admin-surface-elevated text-slate-500 dark:text-admin-text-tertiary shadow-lg backdrop-blur-sm transition hover:bg-white dark:hover:bg-admin-surface hover:text-slate-900 dark:hover:text-admin-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
              <X className="h-5 w-5" />
              <span className="sr-only">Закрити</span>
            </Dialog.Close>
            <div className="mt-4">{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}



