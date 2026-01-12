"use client";

import { useState, useCallback, useEffect } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { importExcel, updateVariantPrices, getEurRate, type CurrencyRateInfo } from "@/lib/strapi";
import { cn } from "@/lib/utils";
import { Upload, Check, AlertCircle, Info, RefreshCw } from "lucide-react";
import type {
  ImportOptions,
  ImportResponse,
  NormalizedRow,
  RowOverride,
} from "@/lib/import-types";

interface SupplyItem {
  flowerName: string;
  length: number | null;
  stockBefore: number;
  stockAfter: number;
  costPrice: number;    // Собівартість з Excel (для розрахунку вартості поставки)
  priceBefore: number;
  priceAfter: number;   // Ціна продажу (для відображення балансу)
  isNew: boolean;
}

// Тип для редагованих цін
interface PriceEntry {
  documentId: string;
  flowerName: string;
  length: number | null;
  costPrice: number;
  salePrice: string; // Зберігаємо як string для input
  originalStock: number;  // Оригінальна кількість з Excel
  importedStock: number;  // Імпортована кількість
  // Для activity log
  stockBefore: number;
  stockAfter: number;
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

type ModalStep = 'upload' | 'preview' | 'pricing';

export function ImportModal({ open, onOpenChange, onSuccess, onLogActivity }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [step, setStep] = useState<ModalStep>('upload');
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>([]);
  const [options, setOptions] = useState<ImportOptions>({
    dryRun: true,
    stockMode: "add",
  });
  // Стан для редагування нормалізації (hash -> { flowerName, length })
  const [rowEdits, setRowEdits] = useState<Record<string, RowOverride>>({});
  // Курс EUR/UAH
  const [eurRate, setEurRate] = useState<CurrencyRateInfo | null>(null);
  const [eurRateLoading, setEurRateLoading] = useState(false);

  // Завантажити курс при відкритті модалки
  useEffect(() => {
    if (open && !eurRate) {
      setEurRateLoading(true);
      getEurRate()
        .then(setEurRate)
        .catch(console.error)
        .finally(() => setEurRateLoading(false));
    }
  }, [open, eurRate]);

  const refreshEurRate = useCallback(async () => {
    setEurRateLoading(true);
    try {
      const rate = await getEurRate();
      setEurRate(rate);
    } catch (error) {
      console.error('Failed to refresh EUR rate:', error);
    } finally {
      setEurRateLoading(false);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setResult(null);
        setStep('upload');
        setPriceEntries([]);
        setRowEdits({}); // Очищаємо редагування при зміні файлу
      }
    },
    []
  );

  // Обробка редагування рядка
  const handleRowEdit = useCallback((hash: string, field: keyof RowOverride, value: string | number) => {
    setRowEdits(prev => ({
      ...prev,
      [hash]: {
        ...prev[hash],
        [field]: value,
      },
    }));
  }, []);

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await importExcel(file, options);
      setResult(res);

      if (res.success) {
        setStep('preview');
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
      // Передаємо rowOverrides якщо є редагування
      const importOptions: ImportOptions = {
        ...options,
        dryRun: false,
        rowOverrides: Object.keys(rowEdits).length > 0 ? rowEdits : undefined,
      };
      const res = await importExcel(file, importOptions);
      setResult(res);

      if (res.success && res.data.status === 'success') {
        // Підготувати дані для таблиці цін
        const entries: PriceEntry[] = [];
        const variantOps = res.data.operations?.filter(op => op.entity === 'variant') || [];
        const flowerOps = res.data.operations?.filter(op => op.entity === 'flower') || [];

        // Створюємо мапу slug → documentId для квіток
        const flowerDocIdBySlug = new Map<string, string>();
        for (const fOp of flowerOps) {
          if (fOp.data.slug) {
            flowerDocIdBySlug.set(fOp.data.slug, fOp.documentId);
          }
        }

        if (res.data.rows && res.data.rows.length > 0) {
          // Конвертація text grade в length (як в upserter)
          const gradeToLength = (grade: string | null): number => {
            if (!grade) return 0;
            const gradeMap: Record<string, number> = {
              mini: 10, standard: 40, select: 60,
              premium: 80, jumbo: 100, xl: 110, xxl: 120,
            };
            return gradeMap[grade.toLowerCase()] ?? 0;
          };

          // Групуємо рядки по slug + length для уникнення дублікатів (вони вже агреговані на бекенді)
          const processedKeys = new Set<string>();

          for (const row of res.data.rows) {
            // Враховуємо конвертацію grade в length
            const effectiveLength = row.length ?? gradeToLength(row.grade);
            const key = `${row.slug}:${effectiveLength}`;
            if (processedKeys.has(key)) continue;
            processedKeys.add(key);

            // Шукаємо відповідну операцію для варіанту по slug + effectiveLength
            const matchingOp = variantOps.find(op =>
              op.data.length === effectiveLength &&
              op.data.slug === row.slug
            );

            if (matchingOp) {
              const isNew = matchingOp.type === 'create';
              const stockBefore = matchingOp.before?.stock ?? 0;
              const stockAfter = matchingOp.after?.stock ?? row.stock;
              const priceAfter = matchingOp.after?.price ?? 0;

              // Для агрегованих рядків row.stock вже містить загальну кількість
              // stockAfter - stockBefore = кількість яку ми імпортували
              const importedQty = stockAfter - stockBefore;

              entries.push({
                documentId: matchingOp.documentId,
                flowerName: row.flowerName,
                length: effectiveLength, // Використовуємо конвертовану довжину (grade -> length)
                costPrice: row.price, // price в NormalizedRow - це собівартість (середньозважена для агрегованих)
                salePrice: '',
                originalStock: row.stock, // Агрегована кількість з Excel
                importedStock: importedQty, // Кількість яку імпортували (stockAfter - stockBefore)
                stockBefore,
                stockAfter,
                priceAfter,
                isNew,
              });
            }
          }
        }

        setPriceEntries(entries);
        setStep('pricing');

        // Логування з правильними даними
        if (onLogActivity) {
          const supplyItems: SupplyItem[] = entries.map(e => ({
            flowerName: e.flowerName,
            length: e.length,
            stockBefore: e.stockBefore,
            stockAfter: e.stockAfter,
            costPrice: e.costPrice,       // Собівартість для розрахунку вартості поставки
            priceBefore: 0,               // Ціна продажу до = 0 для нових
            priceAfter: e.priceAfter,     // Ціна продажу для балансу
            isNew: e.isNew,
          }));

          onLogActivity('supply', {
            filename: file.name,
            flowersCreated: res.data.stats.flowersCreated,
            flowersUpdated: res.data.stats.flowersUpdated,
            variantsCreated: res.data.stats.variantsCreated,
            variantsUpdated: res.data.stats.variantsUpdated,
            supplyItems: supplyItems.length > 0 ? supplyItems : undefined,
          });
        }
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

  const handlePriceChange = (index: number, value: string) => {
    setPriceEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], salePrice: value };
      return updated;
    });
  };

  const handleSavePrices = async () => {
    const pricesToSave = priceEntries
      .filter(e => e.salePrice && parseFloat(e.salePrice) > 0)
      .map(e => ({
        documentId: e.documentId,
        price: parseFloat(e.salePrice),
      }));

    if (pricesToSave.length === 0) {
      // Якщо немає цін для збереження, просто закриваємо
      onSuccess?.();
      handleClose();
      return;
    }

    setSavingPrices(true);
    try {
      await updateVariantPrices(pricesToSave);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Error saving prices:", error);
      alert("Помилка збереження цін. Спробуйте ще раз.");
    } finally {
      setSavingPrices(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setStep('upload');
    setPriceEntries([]);
    setRowEdits({});
    setOptions({
      dryRun: true,
      stockMode: "add",
      forceImport: false,
    });
    onOpenChange(false);
  };

  const handleSkipPricing = () => {
    onSuccess?.();
    handleClose();
  };

  // Рендер таблиці верифікації та цін
  const renderPricingTable = () => {
    if (priceEntries.length === 0) {
      return (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Немає даних для відображення
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Check className="h-5 w-5" />
          <span className="font-medium">Товари збережено в базу!</span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Кількість та собівартість оновлено. Перегляньте результат імпорту нижче.
        </p>

        <div className="max-h-[400px] overflow-auto border border-slate-200 dark:border-slate-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-slate-700 dark:text-slate-300">Назва</th>
                <th className="text-center px-3 py-2 font-medium text-slate-700 dark:text-slate-300 w-16">См</th>
                <th className="text-center px-3 py-2 font-medium text-slate-700 dark:text-slate-300 w-20">
                  <div className="flex flex-col">
                    <span>К-сть</span>
                    <span className="text-xs font-normal text-slate-500">(Excel)</span>
                  </div>
                </th>
                <th className="text-center px-3 py-2 font-medium text-slate-700 dark:text-slate-300 w-20">
                  <div className="flex flex-col">
                    <span>К-сть</span>
                    <span className="text-xs font-normal text-slate-500">(додано)</span>
                  </div>
                </th>
                <th className="text-right px-3 py-2 font-medium text-slate-700 dark:text-slate-300 w-20">Ціна €</th>
                <th className="text-right px-3 py-2 font-medium text-slate-700 dark:text-slate-300 w-24">Сума €</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {priceEntries.map((entry, index) => {
                const stockMismatch = entry.originalStock !== entry.importedStock;
                return (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-2 text-slate-900 dark:text-white">
                      {entry.flowerName}
                    </td>
                    <td className="px-3 py-2 text-center text-slate-600 dark:text-slate-400">
                      {entry.length || '-'}
                    </td>
                    <td className={cn(
                      "px-3 py-2 text-center",
                      stockMismatch
                        ? "text-amber-600 dark:text-amber-400 font-medium"
                        : "text-slate-600 dark:text-slate-400"
                    )}>
                      {entry.originalStock}
                    </td>
                    <td className={cn(
                      "px-3 py-2 text-center",
                      stockMismatch
                        ? "text-amber-600 dark:text-amber-400 font-medium"
                        : "text-slate-600 dark:text-slate-400"
                    )}>
                      {entry.importedStock}
                      {stockMismatch && (
                        <span className="ml-1 text-xs">!</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">
                      {entry.costPrice.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300 font-medium">
                      {(entry.originalStock * entry.costPrice).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Підсумковий рядок */}
            <tfoot className="bg-slate-50 dark:bg-slate-800 sticky bottom-0">
              <tr className="font-medium border-t border-slate-200 dark:border-slate-700">
                <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300" colSpan={2}>
                  ВСЬОГО:
                </td>
                <td className="px-3 py-2 text-center text-slate-700 dark:text-slate-300">
                  {priceEntries.reduce((sum, e) => sum + e.originalStock, 0)}
                </td>
                <td className="px-3 py-2 text-center text-slate-700 dark:text-slate-300">
                  {priceEntries.reduce((sum, e) => sum + e.importedStock, 0)}
                </td>
                <td className="px-3 py-2 text-right text-slate-500 dark:text-slate-400">
                  -
                </td>
                <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                  {priceEntries.reduce((sum, e) => sum + e.originalStock * e.costPrice, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {priceEntries.some(e => e.originalStock !== e.importedStock) && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Деякі рядки позначені жовтим - розбіжність між кількістю в Excel та імпортованою.
              Це може бути через агрегацію дублікатів.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Динамічний заголовок модалки
  const getModalTitle = () => {
    switch (step) {
      case 'upload':
        return "Імпорт накладної";
      case 'preview':
        return "Крок 1: Перевірка даних";
      case 'pricing':
        return "Крок 2: Дані збережено";
      default:
        return "Імпорт накладної";
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && handleClose()}
      title={getModalTitle()}
    >
      <div className="space-y-4">
        {step === 'pricing' ? (
          <>
            {renderPricingTable()}
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
              <Button onClick={handleSkipPricing}>
                Готово
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* EUR Rate Info */}
            <div className="flex items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Курс НБУ:
                </span>
                {eurRateLoading ? (
                  <span className="text-sm text-blue-600 dark:text-blue-400 animate-pulse">
                    Завантаження...
                  </span>
                ) : eurRate ? (
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {eurRate.rate.toFixed(2)} ₴/€
                  </span>
                ) : (
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Недоступно
                  </span>
                )}
                {eurRate && (
                  <span className="text-xs text-blue-500 dark:text-blue-400">
                    ({eurRate.date})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={refreshEurRate}
                disabled={eurRateLoading}
                className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                title="Оновити курс"
              >
                <RefreshCw className={cn("h-4 w-4 text-blue-600 dark:text-blue-400", eurRateLoading && "animate-spin")} />
              </button>
            </div>

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
                          ? "Файл прочитано та розпізнано"
                          : "Імпорт завершено"}
                      </span>
                    </div>

                    {result.data.status === "dry-run" && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Перевірте дані нижче. Якщо все вірно - натисніть «Застосувати» для збереження в базу.
                      </p>
                    )}

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
                      <div className="space-y-1 text-sm">
                        <div className="text-slate-600 dark:text-slate-400">
                          Квіти: <span className="font-medium text-emerald-600 dark:text-emerald-400">+{result.data.stats.flowersCreated} нових</span>, <span className="font-medium text-slate-900 dark:text-white">{result.data.stats.flowersUpdated} оновлено</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          Варіанти: <span className="font-medium text-emerald-600 dark:text-emerald-400">+{result.data.stats.variantsCreated} нових</span>, <span className="font-medium text-slate-900 dark:text-white">{result.data.stats.variantsUpdated} оновлено</span>
                        </div>
                      </div>
                    )}


                    {/* Preview table for dry-run - ПОВНА ТАБЛИЦЯ */}
                    {result.data.status === "dry-run" && result.data.rows && result.data.rows.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {/* Підсумок */}
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
                          <span>Всього рядків: <strong>{result.data.rows.length}</strong></span>
                          <span>
                            Загальна кількість: <strong>{result.data.rows.reduce((sum, r) => sum + r.stock, 0)}</strong> шт
                          </span>
                          <span>
                            Загальна вартість: <strong>{result.data.rows.reduce((sum, r) => sum + r.stock * r.price, 0).toFixed(2)}</strong> ₴
                          </span>
                        </div>

                        {/* Таблиця з усіма деталями */}
                        <div className="max-h-[400px] overflow-auto border border-blue-200 dark:border-blue-800 rounded-lg">
                          <table className="w-full text-xs">
                            <thead className="bg-blue-100 dark:bg-blue-900/40 sticky top-0 z-10">
                              <tr>
                                <th className="text-center px-1.5 py-1.5 font-medium text-blue-700 dark:text-blue-300 w-8">#</th>
                                <th className="text-left px-2 py-1.5 font-medium text-blue-700 dark:text-blue-300 min-w-[180px]">
                                  Оригінал (Excel)
                                </th>
                                <th className="text-left px-2 py-1.5 font-medium text-blue-700 dark:text-blue-300 min-w-[180px]">
                                  Нормалізовано
                                </th>
                                <th className="text-center px-2 py-1.5 font-medium text-blue-700 dark:text-blue-300 w-14">См</th>
                                <th className="text-center px-2 py-1.5 font-medium text-blue-700 dark:text-blue-300 w-20">
                                  К-сть
                                </th>
                                <th className="text-right px-2 py-1.5 font-medium text-blue-700 dark:text-blue-300 w-16">Ціна</th>
                                <th className="text-right px-2 py-1.5 font-medium text-blue-700 dark:text-blue-300 w-20">Сума</th>
                                <th className="text-left px-2 py-1.5 font-medium text-blue-700 dark:text-blue-300 w-24">Постачальник</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-100 dark:divide-blue-800">
                              {result.data.rows.map((row, i) => {
                                const originalQty = (row.original?.units as number) || row.stock;
                                const originalPrice = (row.original?.price as number) || row.price;
                                const qtyMismatch = originalQty !== row.stock;
                                const originalName = (row.original?.variety as string) || '';
                                const originalType = (row.original?.type as string) || '';
                                const originalGrade = (row.original?.grade as string) || '';
                                const originalSupplier = (row.original?.supplier as string) || row.supplier || '';
                                const nameChanged = originalName && originalName !== row.flowerName;

                                // Перевірка на агрегацію
                                const isAggregated = Array.isArray((row.original as Record<string, unknown>)?._aggregatedFromHashes);
                                const aggregatedCount = isAggregated
                                  ? ((row.original as Record<string, unknown>)?._aggregatedFromHashes as unknown[]).length
                                  : 0;
                                const aggregatedStocks = isAggregated
                                  ? ((row.original as Record<string, unknown>)?._aggregatedStocks as number[])
                                  : null;

                                // Редаговане значення
                                const editedName = rowEdits[row.hash]?.flowerName;
                                const displayName = editedName ?? row.flowerName;
                                const isEdited = editedName !== undefined && editedName !== row.flowerName;

                                const rowTotal = row.stock * row.price;

                                return (
                                  <tr key={i} className={cn(
                                    "hover:bg-blue-50 dark:hover:bg-blue-900/20",
                                    isAggregated && "bg-amber-50/50 dark:bg-amber-900/10",
                                    isEdited && "bg-emerald-50/50 dark:bg-emerald-900/10"
                                  )}>
                                    {/* Номер рядка */}
                                    <td className="px-1.5 py-1.5 text-center text-slate-400 dark:text-slate-500 text-[10px]">
                                      {row.rowIndex || i + 1}
                                    </td>

                                    {/* Оригінал з Excel */}
                                    <td className="px-2 py-1.5">
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                                          {originalName || '-'}
                                        </span>
                                        {originalType && (
                                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                            Тип: {originalType}
                                          </span>
                                        )}
                                        {originalGrade && (
                                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                            Grade: {originalGrade}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Нормалізовано (редаговане) */}
                                    <td className="px-2 py-1.5">
                                      <div className="flex flex-col gap-0.5">
                                        <input
                                          type="text"
                                          value={displayName}
                                          onChange={(e) => handleRowEdit(row.hash, 'flowerName', e.target.value)}
                                          className={cn(
                                            "w-full px-1.5 py-0.5 text-xs rounded border font-medium",
                                            isEdited
                                              ? "border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                              : nameChanged
                                                ? "border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                                : "border-transparent bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-600 focus:border-blue-300 dark:focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
                                          )}
                                          title="Клікніть щоб редагувати назву"
                                        />
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1">
                                          slug: {row.slug}
                                        </span>
                                        {isEdited && (
                                          <span className="text-[10px] text-emerald-500 px-1">✓ змінено</span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Довжина */}
                                    <td className="px-2 py-1.5 text-center">
                                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        {row.length || row.grade || '-'}
                                      </span>
                                    </td>

                                    {/* Кількість */}
                                    <td className="px-2 py-1.5 text-center">
                                      <div className="flex flex-col items-center gap-0.5">
                                        {qtyMismatch ? (
                                          <>
                                            <span className="text-slate-400 dark:text-slate-500 line-through text-[10px]">
                                              {originalQty}
                                            </span>
                                            <span className="text-amber-600 dark:text-amber-400 font-bold">
                                              {row.stock}
                                            </span>
                                          </>
                                        ) : (
                                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                                            {row.stock}
                                          </span>
                                        )}
                                        {isAggregated && aggregatedStocks && (
                                          <span className="text-[10px] text-amber-500" title={`Агреговано: ${aggregatedStocks.join(' + ')} = ${row.stock}`}>
                                            ({aggregatedStocks.join('+')})
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Ціна */}
                                    <td className="px-2 py-1.5 text-right">
                                      <span className="text-slate-700 dark:text-slate-300">
                                        {row.price.toFixed(2)}
                                      </span>
                                    </td>

                                    {/* Сума */}
                                    <td className="px-2 py-1.5 text-right">
                                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        {rowTotal.toFixed(2)}
                                      </span>
                                    </td>

                                    {/* Постачальник */}
                                    <td className="px-2 py-1.5">
                                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                                        {originalSupplier || '-'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            {/* Підсумковий рядок */}
                            <tfoot className="bg-blue-50 dark:bg-blue-900/30 sticky bottom-0">
                              <tr className="font-medium">
                                <td colSpan={4} className="px-2 py-2 text-right text-blue-700 dark:text-blue-300">
                                  ВСЬОГО:
                                </td>
                                <td className="px-2 py-2 text-center text-blue-700 dark:text-blue-300">
                                  {result.data.rows.reduce((sum, r) => sum + r.stock, 0)}
                                </td>
                                <td className="px-2 py-2 text-right text-slate-500 dark:text-slate-400">
                                  -
                                </td>
                                <td className="px-2 py-2 text-right text-blue-700 dark:text-blue-300">
                                  {result.data.rows.reduce((sum, r) => sum + r.stock * r.price, 0).toFixed(2)} ₴
                                </td>
                                <td></td>
                              </tr>
                            </tfoot>
                          </table>
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
                  {loading ? "Збереження..." : "Зберегти в базу"}
                </Button>
              ) : result?.success === false &&
                result.error.code === "DUPLICATE_CHECKSUM" &&
                options.forceImport ? (
                <Button onClick={handleImport} disabled={!file || loading}>
                  {loading ? "Імпорт..." : "Примусово імпортувати"}
                </Button>
              ) : (
                <Button onClick={handleImport} disabled={!file || loading}>
                  {loading ? "Читання файлу..." : "Прочитати файл"}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
