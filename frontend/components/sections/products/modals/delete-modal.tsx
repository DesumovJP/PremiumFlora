/**
 * Delete Product Modal
 *
 * Premium delete confirmation with animated icon and clear warnings
 */

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

type DeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  isDeleting: boolean;
  onDelete: () => void;
};

export function DeleteModal({
  open,
  onOpenChange,
  product,
  isDeleting,
  onDelete,
}: DeleteModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        if (!isDeleting) {
          onOpenChange(v);
        }
      }}
      title="Видалити товар?"
      size="sm"
      footer={
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex-1"
          >
            Скасувати
          </Button>
          <Button
            onClick={onDelete}
            disabled={isDeleting || !product}
            className={cn(
              "flex-1",
              "bg-rose-600 hover:bg-rose-700 text-white border-rose-600",
              "transition-all duration-200"
            )}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Видалення...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Видалити</span>
              </>
            )}
          </Button>
        </div>
      }
    >
      {product && (() => {
        const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        const totalValue = product.variants.reduce((sum, v) => sum + (v.stock || 0) * (v.price || 0), 0);

        return (
          <div className="space-y-3">
            <div className="rounded-xl border border-rose-100 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-900/20 p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-admin-surface">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-admin-text-primary">{product.name}</p>
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    {product.variants.length} варіантів буде видалено
                  </p>
                </div>
              </div>
            </div>

            {totalStock > 0 && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">
                      Залишок буде списано
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      {totalStock.toLocaleString()} шт на суму {Math.round(totalValue).toLocaleString()} ₴
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </Modal>
  );
}
