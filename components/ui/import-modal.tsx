"use client";

import { useState, useCallback } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { importExcel } from "@/lib/strapi";
import type {
  ImportOptions,
  ImportResponse,
  StockMode,
  PriceMode,
} from "@/lib/import-types";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImportModal({ open, onOpenChange, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [options, setOptions] = useState<ImportOptions>({
    dryRun: true,
    stockMode: "replace",
    priceMode: "replace",
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
      stockMode: "replace", 
      priceMode: "replace",
      forceImport: false,
    });
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={(v) => !v && handleClose()} title="Імпорт накладної">
      <div className="space-y-4">
        {/* File upload */}
        <div>
          <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-emerald-200 bg-white px-4 py-3 text-sm text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 4v12m0 0 4-4m-4 4-4-4m-3 7h14a2 2 0 0 0 2-2V7.828a2 2 0 0 0-.586-1.414l-2.828-2.828A2 2 0 0 0 15.172 3H7a2 2 0 0 0-2 2v14Z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">
                {file ? file.name : "Виберіть файл"}
              </span>
              <span className="text-xs text-slate-500">xlsx, xls</span>
            </div>
            <input
              type="file"
              className="sr-only"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Режим залишків
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Режим цін
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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

        {/* Price calculation settings */}
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-3">
          <label className="mb-3 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={options.applyPriceCalculation || false}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  applyPriceCalculation: e.target.checked,
                }))
              }
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Розрахувати ціни (USD → UAH + маржа)
            </span>
          </label>

          {options.applyPriceCalculation && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Курс долара (UAH)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  placeholder="41.5"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Маржа (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="200"
                  placeholder="30"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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

        {/* Result */}
        {result && (
          <div
            className={`rounded-lg p-4 ${
              result.success
                ? result.data.status === "dry-run"
                  ? "bg-blue-50 text-blue-800"
                  : "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {result.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {result.data.status === "dry-run" ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  <span className="font-semibold">
                    {result.data.status === "dry-run"
                      ? "Попередній перегляд"
                      : "Імпорт завершено"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Рядків:</span>{" "}
                    {result.data.stats.totalRows}
                  </div>
                  <div>
                    <span className="text-slate-500">Валідних:</span>{" "}
                    {result.data.stats.validRows}
                  </div>
                  <div>
                    <span className="text-slate-500">Помилок:</span>{" "}
                    {result.data.errors.length}
                  </div>
                </div>
                {result.data.status !== "dry-run" && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">Нових квітів:</span>{" "}
                      {result.data.stats.flowersCreated}
                    </div>
                    <div>
                      <span className="text-slate-500">Оновлено:</span>{" "}
                      {result.data.stats.flowersUpdated}
                    </div>
                    <div>
                      <span className="text-slate-500">Нових варіантів:</span>{" "}
                      {result.data.stats.variantsCreated}
                    </div>
                    <div>
                      <span className="text-slate-500">Оновлено:</span>{" "}
                      {result.data.stats.variantsUpdated}
                    </div>
                  </div>
                )}
                {result.data.errors.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto rounded bg-red-100 p-2 text-xs text-red-700">
                    {result.data.errors.slice(0, 5).map((err, i) => (
                      <div key={i}>
                        Рядок {err.row}: {err.message}
                      </div>
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
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{result.error.message}</span>
                </div>
                {result.error.code === "DUPLICATE_CHECKSUM" && (
                  <div className="mt-2 rounded bg-yellow-50 p-2 text-xs text-yellow-800">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={options.forceImport || false}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            forceImport: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>
                        Примусово імпортувати файл (ігнорувати перевірку дублікату)
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Скасувати
          </Button>
          {result?.success && result.data.status === "dry-run" ? (
            <Button
              onClick={handleApplyImport}
              disabled={loading || result.data.errors.length > 0}
            >
              {loading ? "Застосування..." : "Застосувати імпорт"}
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
