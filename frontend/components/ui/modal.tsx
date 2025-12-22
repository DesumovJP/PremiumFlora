import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-surface-overlay fixed inset-0 z-50 bg-black/30 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          className={cn(
            "admin-surface admin-optimized fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-100 dark:border-admin-border bg-white/95 dark:bg-admin-surface-elevated p-5 shadow-xl shadow-emerald-500/10 outline-none data-[state=open]:animate-scale-in data-[state=closed]:animate-out data-[state=closed]:fade-out sm:top-10 sm:-translate-y-0 sm:max-h-[calc(100%-5rem)]",
            sizeMap[size]
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-admin-text-primary">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="text-sm text-slate-500 dark:text-admin-text-secondary">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close className="rounded-full p-2 text-slate-500 dark:text-admin-text-tertiary transition hover:bg-slate-100 dark:hover:bg-admin-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="mt-4 space-y-4">{children}</div>
          {footer ? <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

