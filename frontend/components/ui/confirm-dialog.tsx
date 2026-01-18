/**
 * ConfirmDialog Component
 *
 * Premium confirmation dialog with animated icons and
 * consistent styling for destructive actions
 */

"use client";

import { ReactNode } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Trash2, Info, HelpCircle, Loader2 } from "lucide-react";

type ConfirmVariant = "danger" | "warning" | "info" | "default";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Variant determines icon and button color */
  variant?: ConfirmVariant;
  /** Text for confirm button */
  confirmText?: string;
  /** Text for cancel button */
  cancelText?: string;
  /** Called when user confirms */
  onConfirm: () => void;
  /** Loading state for async actions */
  loading?: boolean;
  /** Disable confirm button (e.g., validation failed) */
  confirmDisabled?: boolean;
}

const variantConfig: Record<ConfirmVariant, {
  icon: typeof AlertTriangle;
  iconClass: string;
  iconBgClass: string;
  buttonClass: string;
}> = {
  danger: {
    icon: Trash2,
    iconClass: "text-rose-600 dark:text-rose-400",
    iconBgClass: "bg-rose-100 dark:bg-rose-900/30",
    buttonClass: "bg-rose-600 hover:bg-rose-700 text-white border-rose-600",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-600 dark:text-amber-400",
    iconBgClass: "bg-amber-100 dark:bg-amber-900/30",
    buttonClass: "bg-amber-600 hover:bg-amber-700 text-white border-amber-600",
  },
  info: {
    icon: Info,
    iconClass: "text-sky-600 dark:text-sky-400",
    iconBgClass: "bg-sky-100 dark:bg-sky-900/30",
    buttonClass: "bg-sky-600 hover:bg-sky-700 text-white border-sky-600",
  },
  default: {
    icon: HelpCircle,
    iconClass: "text-slate-600 dark:text-slate-400",
    iconBgClass: "bg-slate-100 dark:bg-slate-800",
    buttonClass: "",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  variant = "default",
  confirmText = "Підтвердити",
  cancelText = "Скасувати",
  onConfirm,
  loading = false,
  confirmDisabled = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    if (!loading && !confirmDisabled) {
      onConfirm();
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          onOpenChange(v);
        }
      }}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 sm:flex-initial"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || confirmDisabled}
            className={cn(
              "flex-1 sm:flex-initial min-w-[120px]",
              config.buttonClass
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Зачекайте...</span>
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
        {/* Animated Icon */}
        <div
          className={cn(
            "shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
            "animate-icon-pop",
            config.iconBgClass
          )}
        >
          <Icon className={cn("h-6 w-6", config.iconClass)} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Hook for managing confirm dialog state
 */
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant: ConfirmVariant;
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: "",
    description: undefined,
    variant: "default",
    onConfirm: () => {},
  });

  const [loading, setLoading] = useState(false);

  const confirm = async (options: {
    title: string;
    description?: string;
    variant?: ConfirmVariant;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title,
        description: options.description,
        variant: options.variant || "default",
        onConfirm: () => resolve(true),
      });
    });
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await state.onConfirm();
    } finally {
      setLoading(false);
      setState((s) => ({ ...s, open: false }));
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setState((s) => ({ ...s, open: false }));
    }
  };

  return {
    state,
    loading,
    confirm,
    handleConfirm,
    handleOpenChange,
  };
}

import { useState } from "react";
