/**
 * Add Product Modal
 */

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Plus, X, Trash, Upload, FileSpreadsheet, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import type { ProductDraft } from "../types";

type AddProductModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: ProductDraft;
  setDraft: (draft: ProductDraft | ((prev: ProductDraft) => ProductDraft)) => void;
  addMode: "manual" | "invoice";
  setAddMode: (mode: "manual" | "invoice") => void;
  isSaving: boolean;
  flowerSearchQuery: string;
  setFlowerSearchQuery: (query: string) => void;
  availableFlowers: Product[];
  onSave: () => void;
  onReset: () => void;
  onOpenImport: () => void;
  addVariant: () => void;
  removeVariant: (id: string) => void;
  updateDraftVariant: (id: string, field: "length" | "price" | "stock", value: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadFlowers: () => void;
  selectExistingFlower: (flower: Product) => void;
  updateExistingVariantQuantity: (documentId: string, addQuantity: number) => void;
};

export function AddProductModal({
  open,
  onOpenChange,
  draft,
  setDraft,
  addMode,
  setAddMode,
  isSaving,
  flowerSearchQuery,
  setFlowerSearchQuery,
  availableFlowers,
  onSave,
  onReset,
  onOpenImport,
  addVariant,
  removeVariant,
  updateDraftVariant,
  handleImageChange,
  onLoadFlowers,
  selectExistingFlower,
  updateExistingVariantQuantity,
}: AddProductModalProps) {
  // Determine if save should be disabled
  const hasSupplyQuantity = draft.existingVariants.some(v => v.addQuantity > 0);
  const hasNewVariants = draft.variants.length > 0 && draft.variants.some(v => v.length && v.price && v.stock);
  const canSaveSupply = hasSupplyQuantity || hasNewVariants;
  const canSaveNew = draft.variants.length > 0;
  const isSaveDisabled = isSaving || !draft.flowerName || (draft.isSupplyMode ? !canSaveSupply : !canSaveNew);
  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) onReset();
      }}
      title={draft.isSupplyMode ? "Поставка товару" : "Додати товар"}
      description={draft.isSupplyMode
        ? "Додайте кількість до існуючих варіантів або створіть новий розмір."
        : "Створіть нову позицію: назва, висота/розмір, ціна та кількість."
      }
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Скасувати
          </Button>
          <Button onClick={onSave} disabled={isSaveDisabled}>
            {isSaving ? "Збереження..." : (draft.isSupplyMode ? "Оформити поставку" : "Зберегти")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-admin-surface-elevated rounded-lg">
          <button
            type="button"
            onClick={() => setAddMode("manual")}
            className={cn(
              "flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
              addMode === "manual"
                ? "bg-white dark:bg-admin-surface text-slate-900 dark:text-admin-text-primary shadow-sm"
                : "text-slate-600 dark:text-admin-text-tertiary hover:text-slate-900 dark:hover:text-admin-text-primary"
            )}
          >
            Поштучно
          </button>
          <button
            type="button"
            onClick={() => setAddMode("invoice")}
            className={cn(
              "flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
              addMode === "invoice"
                ? "bg-white dark:bg-admin-surface text-slate-900 dark:text-admin-text-primary shadow-sm"
                : "text-slate-600 dark:text-admin-text-tertiary hover:text-slate-900 dark:hover:text-admin-text-primary"
            )}
          >
            За накладною
          </button>
        </div>

        {addMode === "manual" ? (
          <div className="space-y-4">
            {/* Вибрати або створити квітку */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">Назва/сорт</label>
              <div className="space-y-2">
                <Input
                  placeholder="Введіть назву або виберіть зі списку"
                  value={flowerSearchQuery}
                  onChange={(e) => {
                    setFlowerSearchQuery(e.target.value);
                    if (!e.target.value) {
                      setDraft((prev) => ({ ...prev, flowerId: null, flowerName: "" }));
                    }
                  }}
                  onFocus={() => {
                    if (!flowerSearchQuery) {
                      onLoadFlowers();
                    }
                  }}
                />
                {flowerSearchQuery && availableFlowers.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-admin-border bg-white dark:bg-admin-surface">
                    {availableFlowers.map((flower) => (
                      <button
                        key={flower.id}
                        type="button"
                        onClick={() => selectExistingFlower(flower)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-admin-surface flex items-center justify-between"
                      >
                        <span>{flower.name}</span>
                        {flower.variants && flower.variants.length > 0 && (
                          <span className="text-xs text-slate-400 dark:text-admin-text-muted">
                            {flower.variants.length} розм.
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {flowerSearchQuery && !draft.flowerId && (
                  <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                      Квітку "{flowerSearchQuery}" не знайдено
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.flowerName === flowerSearchQuery}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDraft((prev) => ({ ...prev, flowerName: flowerSearchQuery }));
                          } else {
                            setDraft((prev) => ({ ...prev, flowerName: "" }));
                          }
                        }}
                        className="h-4 w-4 rounded border-amber-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">
                        Створити нову квітку з назвою "{flowerSearchQuery}"
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Завантаження зображення - only for new products */}
            {!draft.isSupplyMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">Зображення</label>
                <div className="flex items-center gap-3">
                  {draft.imagePreview ? (
                    <div className="relative">
                      <img
                        src={draft.imagePreview}
                        alt="Preview"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDraft((prev) => ({
                            ...prev,
                            image: null,
                            imagePreview: null,
                          }));
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-200 dark:border-admin-border bg-slate-50 dark:bg-admin-surface px-4 py-3 text-sm text-slate-600 dark:text-admin-text-secondary transition hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-800/50">
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-admin-text-primary">Завантажити зображення</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Existing variants for supply mode */}
            {draft.isSupplyMode && draft.existingVariants.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <label className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">Наявні розміри</label>
                </div>
                <div className="space-y-2">
                  {draft.existingVariants.map((variant) => (
                    <div
                      key={variant.documentId}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-admin-border bg-slate-50 dark:bg-admin-surface p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-slate-900 dark:text-admin-text-primary">{variant.length} см</span>
                          <span className="text-sm text-slate-500 dark:text-admin-text-muted">• {variant.price} грн</span>
                        </div>
                        <div className="text-xs text-slate-400 dark:text-admin-text-muted mt-0.5">
                          Зараз на складі: <span className="font-medium">{variant.currentStock} шт</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 dark:text-admin-text-muted">+</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={variant.addQuantity || ""}
                          onChange={(e) => updateExistingVariantQuantity(variant.documentId, parseInt(e.target.value) || 0)}
                          className="w-20 text-center"
                        />
                        <span className="text-sm text-slate-500 dark:text-admin-text-muted">шт</span>
                      </div>
                      {variant.addQuantity > 0 && (
                        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          → {variant.currentStock + variant.addQuantity}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Варіанти */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">
                  {draft.isSupplyMode ? "Додати новий розмір" : "Розміри"}
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {draft.isSupplyMode ? "Новий розмір" : "Додати розмір"}
                </Button>
              </div>

              {draft.variants.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-admin-text-muted">
                  {draft.isSupplyMode
                    ? "Можете додати новий розмір до цього товару"
                    : "Додайте хоча б один розмір"
                  }
                </p>
              ) : (
                <div className="space-y-3">
                  {draft.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex gap-2 rounded-lg border border-slate-200 dark:border-admin-border bg-slate-50 dark:bg-admin-surface p-3"
                    >
                      <Input
                        type="number"
                        placeholder="Довжина (см)"
                        value={variant.length}
                        onChange={(e) => updateDraftVariant(variant.id, "length", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Ціна, грн"
                        value={variant.price}
                        onChange={(e) => updateDraftVariant(variant.id, "price", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Кількість"
                        value={variant.stock}
                        onChange={(e) => updateDraftVariant(variant.id, "stock", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(variant.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-900/20 p-4">
            <div>
              <p className="text-base font-semibold text-slate-900">Імпорт за накладною</p>
              <p className="text-sm text-slate-600">Додайте накладну або таблицю, і ми додамо позиції автоматично.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onOpenImport();
              }}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-emerald-200 dark:border-emerald-800 bg-white dark:bg-admin-surface px-4 py-3 text-sm text-slate-600 dark:text-admin-text-secondary transition hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-800/50">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-slate-900 dark:text-admin-text-primary">Завантажити накладну</span>
                <span className="text-xs text-slate-500 dark:text-admin-text-muted">xlsx, xls</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
