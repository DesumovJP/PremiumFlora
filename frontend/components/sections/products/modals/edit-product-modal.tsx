/**
 * Edit Product Modal
 *
 * Дозволяє редагувати: зображення, опис, ціну варіантів
 * Склад і варіанти змінюються через поставку/списання
 */

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Upload, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import type { EditData } from "../types";

type EditProductModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  editData: EditData;
  setEditData: (data: EditData | ((prev: EditData) => EditData)) => void;
  isLoading: boolean;
  isSaving: boolean;
  onSave: () => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVariantChange: (documentId: string, field: "price" | "stock" | "length", value: number) => void;
  // Застарілі пропси - залишені для сумісності
  addVariant?: () => void;
  removeVariant?: (documentId: string) => void;
  undoDeleteVariant?: (documentId: string) => void;
};

export function EditProductModal({
  open,
  onOpenChange,
  product,
  editData,
  setEditData,
  isLoading,
  isSaving,
  onSave,
  handleImageChange,
  handleVariantChange,
}: EditProductModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Редагувати товар"
      description={product ? `Редагування "${product.name}"` : ""}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Скасувати
          </Button>
          <Button onClick={onSave} disabled={isSaving || isLoading}>
            {isSaving ? "Збереження..." : "Зберегти зміни"}
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-slate-500">Завантаження даних...</div>
        </div>
      ) : product ? (
        <div className="space-y-4">
          {/* Image & Description - Two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
            {/* Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">Зображення</label>
              <label className="group block cursor-pointer">
                <div className={cn(
                  "relative h-32 w-32 sm:h-[120px] sm:w-[120px] rounded-xl overflow-hidden transition-all",
                  "ring-1 ring-slate-200 dark:ring-slate-700",
                  "group-hover:ring-2 group-hover:ring-emerald-400 dark:group-hover:ring-emerald-500"
                )}>
                  {editData.imagePreview ? (
                    <img
                      src={editData.imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Package className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">Опис</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Введіть опис квітки..."
                className="w-full h-[120px] rounded-xl border border-slate-200 dark:border-admin-border bg-white dark:bg-admin-surface px-3 py-2 text-sm text-slate-900 dark:text-admin-text-primary focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 transition-colors duration-200 resize-none"
              />
            </div>
          </div>

          {/* Variants - only price editable */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">Варіанти</label>
              <span className="text-xs text-slate-400">Склад змінюється через поставку/списання</span>
            </div>
            <div className="space-y-2">
              {editData.variants.filter(v => !v.isDeleted && !v.isNew).length === 0 ? (
                <p className="text-sm text-slate-500 py-2">Немає варіантів.</p>
              ) : (
                editData.variants.filter(v => !v.isDeleted && !v.isNew).map((variant) => (
                  <div
                    key={variant.documentId}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-admin-border dark:bg-admin-surface p-3"
                  >
                    {/* Length - readonly */}
                    <div className="w-20 shrink-0">
                      <p className="text-lg font-bold text-slate-800 dark:text-white">
                        {variant.length} см
                      </p>
                    </div>

                    {/* Stock - readonly */}
                    <div className="flex-1 text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {variant.stock} шт
                      </p>
                    </div>

                    {/* Price - editable */}
                    <div className="w-28 shrink-0">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.price || ""}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              handleVariantChange(variant.documentId, "price", value);
                            }
                          }}
                          className="text-right"
                        />
                        <span className="text-sm text-slate-500 shrink-0">₴</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
