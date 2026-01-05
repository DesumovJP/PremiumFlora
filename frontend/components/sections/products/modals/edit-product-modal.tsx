/**
 * Edit Product Modal
 */

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Upload, Package } from "lucide-react";
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
  addVariant: () => void;
  removeVariant: (documentId: string) => void;
  undoDeleteVariant: (documentId: string) => void;
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
  addVariant,
  removeVariant,
  undoDeleteVariant,
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

          {/* Variants */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Варіанти</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Додати варіант
              </Button>
            </div>
            <div className="space-y-3">
              {editData.variants.filter(v => !v.isDeleted).length === 0 ? (
                <p className="text-sm text-slate-500 py-2">Немає варіантів. Додайте хоча б один.</p>
              ) : (
                editData.variants.filter(v => !v.isDeleted).map((variant) => (
                  <div
                    key={variant.documentId}
                    className={cn(
                      "flex gap-2 rounded-lg border p-3",
                      variant.isNew
                        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20"
                        : "border-slate-200 bg-slate-50 dark:border-admin-border dark:bg-admin-surface"
                    )}
                  >
                    <div className="flex-1">
                      <label className="text-xs text-slate-600">Довжина, см</label>
                      {variant.isNew ? (
                        <Input
                          type="number"
                          min="1"
                          placeholder="60"
                          value={variant.length || ""}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                            if (!isNaN(value)) {
                              handleVariantChange(variant.documentId, "length", value);
                            }
                          }}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-slate-900 dark:text-admin-text-primary mt-2">
                          {variant.length} см
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-600">Ціна, грн</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="100"
                        value={variant.price || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            handleVariantChange(variant.documentId, "price", value);
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-600">Залишок, шт</label>
                      {variant.isNew ? (
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={variant.stock || ""}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                            if (!isNaN(value)) {
                              handleVariantChange(variant.documentId, "stock", value);
                            }
                          }}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-slate-900 dark:text-admin-text-primary mt-2" title="Змінюйте через списання або поставку">
                          {variant.stock} шт
                        </p>
                      )}
                    </div>
                    <div className="flex items-center self-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(variant.documentId)}
                        className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        title="Видалити варіант"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
              {/* Показуємо видалені варіанти як закреслені */}
              {editData.variants.filter(v => v.isDeleted).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-admin-border">
                  <p className="text-xs text-slate-500">Буде видалено після збереження:</p>
                  {editData.variants.filter(v => v.isDeleted).map((variant) => (
                    <div
                      key={variant.documentId}
                      className="flex items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-900/20 p-2"
                    >
                      <span className="text-sm text-rose-600 line-through">
                        {variant.length} см · {variant.price} грн · {variant.stock} шт
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => undoDeleteVariant(variant.documentId)}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs h-7 px-2"
                      >
                        Відмінити
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
