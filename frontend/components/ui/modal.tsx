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
  size?: "sm" | "md" | "lg" | "xl";
  fullscreenOnMobile?: boolean;
  showClose?: boolean;
  headerActions?: ReactNode;
};

const sizeMap = {
  sm: "max-w-[360px]",
  md: "max-w-[480px]",
  lg: "max-w-[600px]",
  xl: "max-w-[720px]",
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
        {/* Overlay - subtle with blur */}
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-stone-900/20 dark:bg-black/60 backdrop-blur-[2px]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-200",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150"
          )}
        />

        {/* Content */}
        <Dialog.Content
          className={cn(
            // Base
            "fixed z-50 flex flex-col",
            "bg-white dark:bg-slate-800",
            "border border-stone-200/80 dark:border-slate-700",
            "rounded-lg shadow-lg shadow-stone-900/5 dark:shadow-black/20",
            "outline-none",
            // Position
            "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[calc(100%-2rem)]",
            // Animation
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] data-[state=open]:duration-150",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98] data-[state=closed]:duration-100",
            // Height
            fullscreenOnMobile
              ? "max-h-[calc(100vh-2rem)]"
              : "max-h-[calc(100vh-4rem)]",
            sizeMap[size]
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-0">
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-sm font-medium text-stone-800 dark:text-white leading-tight">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-xs text-stone-500 dark:text-slate-400">
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
                  "flex h-7 w-7 items-center justify-center rounded-md",
                  "text-stone-400 dark:text-slate-500",
                  "transition-colors duration-100",
                  "hover:bg-stone-100 dark:hover:bg-slate-700 hover:text-stone-600 dark:hover:text-slate-300",
                  "focus:outline-none"
                )}
              >
                <X className="h-4 w-4" />
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
