/**
 * Write-off Product Modal
 */

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/lib/types";
import type { WriteOffData, WriteOffReason } from "../types";
import { reasonLabels } from "../types";

type WriteOffModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  data: WriteOffData;
  onDataChange: (data: WriteOffData) => void;
  isWritingOff: boolean;
  onWriteOff: () => void;
};

export function WriteOffModal({
  open,
  onOpenChange,
  product,
  data,
  onDataChange,
  isWritingOff,
  onWriteOff,
}: WriteOffModalProps) {
  if (!product) return null;

  const selectedVariant = product.variants.find(
    v => v.size === data.selectedVariant
  );
  const maxQty = selectedVariant?.stock || 0;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Списання товару"
      description={`Списати "${product.name}"`}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isWritingOff}>
            Скасувати
          </Button>
          <Button
            onClick={onWriteOff}
            disabled={
              isWritingOff ||
              !data.selectedVariant ||
              data.qty === '' ||
              (typeof data.qty === 'number' && (data.qty < 1 || data.qty > maxQty))
            }
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isWritingOff ? 'Списання...' : 'Списати'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-100 dark:border-admin-border bg-slate-50/60 dark:bg-admin-surface p-3">
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
              <p className="font-semibold text-slate-900">{product.name}</p>
              <p className="text-sm text-slate-600">
                {product.variants.length} варіантів на складі
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Розмір (варіант)</label>
            <Select
              value={data.selectedVariant}
              onValueChange={(v) => onDataChange({ ...data, selectedVariant: v, qty: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Оберіть розмір" />
              </SelectTrigger>
              <SelectContent>
                {product.variants.map((variant) => (
                  <SelectItem key={variant.size} value={variant.size}>
                    {variant.size} · На складі: {variant.stock} шт
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Кількість для списання</label>
            <Input
              type="number"
              min={1}
              max={maxQty}
              value={data.qty}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  onDataChange({ ...data, qty: '' });
                } else {
                  const numValue = parseInt(value, 10);
                  if (!isNaN(numValue)) {
                    onDataChange({ ...data, qty: numValue });
                  }
                }
              }}
              disabled={!data.selectedVariant}
            />
            {typeof data.qty === 'number' && data.qty > maxQty && (
              <p className="text-xs text-rose-600">Максимум: {maxQty} шт</p>
            )}
            {data.qty === '' && (
              <p className="text-xs text-slate-500">Введіть кількість</p>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Причина списання</label>
            <Select
              value={data.reason}
              onValueChange={(v) => onDataChange({ ...data, reason: v as WriteOffReason })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(reasonLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Примітка (опціонально)</label>
            <Input
              placeholder="Додаткова інформація..."
              value={data.notes}
              onChange={(e) => onDataChange({ ...data, notes: e.target.value })}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
