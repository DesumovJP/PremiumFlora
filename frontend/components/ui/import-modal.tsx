"use client";

import { useState, useCallback } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { importExcel } from "@/lib/strapi";
import { cn } from "@/lib/utils";
import { Upload, Check, AlertCircle, Info } from "lucide-react";
import type {
  ImportOptions,
  ImportResponse,
  StockMode,
  PriceMode,
} from "@/lib/import-types";

interface SupplyItem {
  flowerName: string;
  length: number | null;
  stockBefore?: number;
  stockAfter: number;
  priceBefore?: number;
  priceAfter: number;
  isNew: boolean;
}

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onLogActivity?: (type: 'supply', details: {
    filename: string;
    flowersCreated: number;
    flowersUpdated: number;
    variantsCreated: number;
    variantsUpdated: number;
    supplyItems?: SupplyItem[];
  }) => void;
}

export function ImportModal({ open, onOpenChange, onSuccess, onLogActivity }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [options, setOptions] = useState<ImportOptions>({
    dryRun: true,
    stockMode: "add",
    priceMode: "skip",
  });

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setResult(null);
      }
    },
    []
  );

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await importExcel(file, options);
      setResult(res);

      if (res.success && !options.dryRun) {
        onSuccess?.();
      }
    } catch (error) {
      console.error("Import error:", error);
      setResult({
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Помилка з'єднання з сервером",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyImport = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await importExcel(file, { ...options, dryRun: false });
      setResult(res);

      if (res.success) {
        if (onLogActivity && res.data.status === 'success') {
          const supplyItems: SupplyItem[] = [];

          // Функція для конвертації ціни якщо потрібно
          const calculatePrice = (basePrice: number): number => {
            if (!options.applyPriceCalculation) return basePrice;
            const rate = options.exchangeRate ?? 1;
            const margin = options.marginMultiplier ?? 1;
            return Math.round(basePrice * rate * margin * 100) / 100;
          };

          // Використовуємо rows як основне джерело (містять flowerName)
          // і збагачуємо даними з operations (before/after)
          if (res.data.rows && res.data.rows.length > 0) {
            const variantOps = res.data.operations?.filter(op => op.entity === 'variant') || [];

            for (const row of res.data.rows) {
              // Шукаємо відповідну operation по length
              const matchingOp = variantOps.find(op =>
                op.data.length === row.length
              );

              supplyItems.push({
                flowerName: row.flowerName,
                length: row.length,
                stockBefore: matchingOp?.before?.stock,
                stockAfter: matchingOp?.after?.stock ?? row.stock,
                priceBefore: matchingOp?.before?.price,
                priceAfter: matchingOp?.after?.price ?? calculatePrice(row.price),
                isNew: matchingOp?.type === 'create' || false,
              });
            }
          } else if (res.data.operations) {
            // Fallback: якщо rows порожні, використовуємо operations
            const variantOps = res.data.operations.filter(op => op.entity === 'variant');
            for (const op of variantOps) {
              supplyItems.push({
                flowerName: op.data.name || op.data.slug || 'Невідомо',
                length: op.data.length || null,
                stockBefore: op.before?.stock,
                stockAfter: op.after?.stock ?? op.data.stock ?? 0,
                priceBefore: op.before?.price,
                priceAfter: op.after?.price ?? calculatePrice(op.data.price ?? 0),
                isNew: op.type === 'create',
              });
            }
          }

          onLogActivity('supply', {
            filename: file.name,
            flowersCreated: res.data.stats.flowersCreated,
            flowersUpdated: res.data.stats.flowersUpdated,
            variantsCreated: res.data.stats.variantsCreated,
            variantsUpdated: res.data.stats.variantsUpdated,
            supplyItems: supplyItems.length > 0 ? supplyItems : undefined,
          });
        }
        onSuccess?.();
      }
    } catch (error) {
      console.error("Import error:", error);
      setResult({
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Помилка з'єднання з сервером",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setOptions({
      dryRun: true,
      stockMode: "add",
      priceMode: "skip",
      forceImport: false,
    });
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={(v) => !v && handleClose()} title="Імпорт накладної">
      <div className="space-y-4">
        {/* File upload */}
        <label className="group flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 px-4 py-4 transition-colors hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
            <Upload className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <span className="block text-sm font-medium text-slate-900 dark:text-white">
              {file ? file.name : "Виберіть файл"}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">xlsx, xls</span>
          </div>
          <input
            type="file"
            className="sr-only"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
        </label>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Режим залишків
            </label>
            <select
              className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-300 dark:focus:border-slate-600"
              value={options.stockMode}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  stockMode: e.target.value as StockMode,
                }))
              }
            >
              <option value="replace">Замінити</option>
              <option value="add">Додати</option>
              <option value="skip">Пропустити</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Режим цін
            </label>
            <select
              className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-300 dark:focus:border-slate-600"
              value={options.priceMode}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  priceMode: e.target.value as PriceMode,
                }))
              }
            >
              <option value="replace">Замінити</option>
              <option value="lower">Мінімальна</option>
              <option value="skip">Залишити стару</option>
            </select>
          </div>
        </div>

        {/* Price calculation - only show when prices will be updated */}
        {options.priceMode !== "skip" && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={options.applyPriceCalculation || false}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    applyPriceCalculation: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Розрахувати ціни (USD → UAH + маржа)
              </span>
            </label>

            {options.applyPriceCalculation && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Курс долара
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    placeholder="41.5"
                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-300 dark:focus:border-slate-600"
                    value={options.exchangeRate || ""}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        exchangeRate: parseFloat(e.target.value) || undefined,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Маржа (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="200"
                    placeholder="30"
                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-300 dark:focus:border-slate-600"
                    value={
                      options.marginMultiplier
                        ? ((options.marginMultiplier - 1) * 100).toFixed(0)
                        : ""
                    }
                    onChange={(e) => {
                      const percentage = parseFloat(e.target.value) || 0;
                      const multiplier = 1 + percentage / 100;
                      setOptions((prev) => ({
                        ...prev,
                        marginMultiplier: multiplier,
                      }));
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className={cn(
              "rounded-lg p-4",
              result.success
                ? result.data.status === "dry-run"
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "bg-emerald-50 dark:bg-emerald-900/20"
                : "bg-rose-50 dark:bg-rose-900/20"
            )}
          >
            {result.success ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {result.data.status === "dry-run" ? (
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    result.data.status === "dry-run"
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-emerald-700 dark:text-emerald-300"
                  )}>
                    {result.data.status === "dry-run"
                      ? "Попередній перегляд"
                      : "Імпорт завершено"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-slate-600 dark:text-slate-400">
                    Рядків: <span className="font-medium text-slate-900 dark:text-white">{result.data.stats.totalRows}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Валідних: <span className="font-medium text-slate-900 dark:text-white">{result.data.stats.validRows}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Помилок: <span className="font-medium text-slate-900 dark:text-white">{result.data.errors.length}</span>
                  </div>
                </div>

                {result.data.status !== "dry-run" && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-600 dark:text-slate-400">
                      Нових квітів: <span className="font-medium text-slate-900 dark:text-white">{result.data.stats.flowersCreated}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Оновлено: <span className="font-medium text-slate-900 dark:text-white">{result.data.stats.flowersUpdated}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Нових варіантів: <span className="font-medium text-slate-900 dark:text-white">{result.data.stats.variantsCreated}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Оновлено: <span className="font-medium text-slate-900 dark:text-white">{result.data.stats.variantsUpdated}</span>
                    </div>
                  </div>
                )}

                {result.data.errors.length > 0 && (
                  <div className="max-h-24 overflow-y-auto rounded bg-rose-100 dark:bg-rose-900/30 p-2 text-xs text-rose-700 dark:text-rose-300">
                    {result.data.errors.slice(0, 5).map((err, i) => (
                      <div key={i}>Рядок {err.row}: {err.message}</div>
                    ))}
                    {result.data.errors.length > 5 && (
                      <div>...та ще {result.data.errors.length - 5} помилок</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-sm text-rose-700 dark:text-rose-300">{result.error.message}</span>
                </div>
                {result.error.code === "DUPLICATE_CHECKSUM" && (
                  <label className="flex cursor-pointer items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={options.forceImport || false}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          forceImport: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Примусово імпортувати (ігнорувати дублікат)
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={handleClose}>
            Скасувати
          </Button>
          {result?.success && result.data.status === "dry-run" ? (
            <Button
              onClick={handleApplyImport}
              disabled={loading || result.data.errors.length > 0}
            >
              {loading ? "Застосування..." : "Застосувати"}
            </Button>
          ) : result?.success === false &&
            result.error.code === "DUPLICATE_CHECKSUM" &&
            options.forceImport ? (
            <Button onClick={handleImport} disabled={!file || loading}>
              {loading ? "Імпорт..." : "Примусово імпортувати"}
            </Button>
          ) : (
            <Button onClick={handleImport} disabled={!file || loading}>
              {loading ? "Обробка..." : "Перевірити"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
