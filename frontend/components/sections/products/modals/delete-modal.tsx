/**
 * Delete Product Modal
 */

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
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
      description={product ? `Ви впевнені, що хочете видалити "${product.name}"? Цю дію не можна скасувати.` : ""}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Скасувати
          </Button>
          <Button
            onClick={onDelete}
            disabled={isDeleting || !product}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {isDeleting ? "Видалення..." : "Видалити"}
          </Button>
        </>
      }
    >
      {product && (
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
              <p className="text-sm text-rose-600">
                {product.variants.length} варіантів буде видалено
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
