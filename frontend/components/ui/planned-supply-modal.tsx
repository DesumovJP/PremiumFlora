"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Plus, X, Search, Download, AlertTriangle, Package } from "lucide-react";
import {
  getLowStockVariants,
  searchFlowersForSupply,
} from "@/lib/strapi";
import type {
  LowStockVariant,
  PlannedSupplyItem,
  FlowerSearchResult,
} from "@/lib/planned-supply-types";

// Функція визначення статусу залишку
const getStockStatus = (stock: number): 'critical' | 'low' | 'good' => {
  if (stock < 150) return 'critical';
  if (stock < 300) return 'low';
  return 'good';
};

// Тип для згрупованих товарів
type GroupedSupplyItem = {
  groupKey: string;
  flowerName: string;
  flowerId?: number;
  imageUrl?: string | null;
  items: PlannedSupplyItem[];
  totalPlanned: number;
  hasNewItems: boolean;
};

// Функція групування товарів
function groupSupplyItems(items: PlannedSupplyItem[]): GroupedSupplyItem[] {
  const groups: Record<string, GroupedSupplyItem> = {};

  items.forEach((item) => {
    const key = item.isNew ? item.id : (item.flowerId?.toString() || item.flowerName);
    if (!groups[key]) {
      groups[key] = {
        groupKey: key,
        flowerName: item.flowerName,
        flowerId: item.flowerId,
        imageUrl: item.imageUrl,
        items: [],
        totalPlanned: 0,
        hasNewItems: false,
      };
    }
    groups[key].items.push(item);
    groups[key].totalPlanned += item.plannedQuantity;
    if (item.isNew) {
      groups[key].flowerName = item.flowerName;
      groups[key].hasNewItems = true;
    }
  });

  return Object.values(groups);
}

interface PlannedSupplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlannedSupplyModal({ open, onOpenChange }: PlannedSupplyModalProps) {
  const [items, setItems] = useState<PlannedSupplyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FlowerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [threshold, setThreshold] = useState(100);
  const [showManualAdd, setShowManualAdd] = useState(false);

  useEffect(() => {
    if (open) {
      loadLowStockItems();
    }
  }, [open, threshold]);

  const loadLowStockItems = async () => {
    setLoading(true);
    try {
      const result = await getLowStockVariants(threshold);
      if (result.success && result.data) {
        const lowStockItems: PlannedSupplyItem[] = result.data.map((variant: LowStockVariant) => ({
          id: `${variant.flowerId}-${variant.variantId}`,
          flowerId: variant.flowerId,
          flowerDocumentId: variant.flowerDocumentId,
          variantId: variant.variantId,
          variantDocumentId: variant.variantDocumentId,
          flowerName: variant.flowerName,
          flowerSlug: variant.flowerSlug,
          imageUrl: variant.imageUrl,
          length: variant.length,
          currentStock: variant.currentStock,
          plannedQuantity: 0,
          price: variant.price,
          isNew: false,
          isManual: false,
        }));

        const sorted = lowStockItems.sort((a, b) => {
          const statusA = getStockStatus(a.currentStock);
          const statusB = getStockStatus(b.currentStock);

          if (statusA === 'critical' && statusB !== 'critical') return -1;
          if (statusA !== 'critical' && statusB === 'critical') return 1;
          if (statusA === 'low' && statusB !== 'low') return -1;
          if (statusA !== 'low' && statusB === 'low') return 1;

          return a.currentStock - b.currentStock;
        });

        setItems(sorted);
      }
    } catch (error) {
      console.error("Error loading low stock items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const result = await searchFlowersForSupply(query);
      if (result.success && result.data) {
        setSearchResults(result.data);
      }
    } catch (error) {
      console.error("Error searching flowers:", error);
    } finally {
      setSearching(false);
    }
  }, []);

  const addVariantFromSearch = (flower: FlowerSearchResult, variant: FlowerSearchResult["variants"][0]) => {
    const existingItem = items.find(
      (item) => item.flowerId === flower.id && item.variantId === variant.id
    );

    if (existingItem) {
      updatePlannedQuantity(existingItem.id, existingItem.plannedQuantity + 100);
    } else {
      const newItem: PlannedSupplyItem = {
        id: `manual-${flower.id}-${variant.id}`,
        flowerId: flower.id,
        flowerDocumentId: flower.documentId,
        variantId: variant.id,
        variantDocumentId: variant.documentId,
        flowerName: flower.name,
        flowerSlug: flower.slug,
        length: variant.length,
        currentStock: variant.stock,
        plannedQuantity: 100,
        price: variant.price,
        isNew: false,
        isManual: true,
      };
      setItems((prev) => [newItem, ...prev]);
    }

    setSearchQuery("");
    setSearchResults([]);
    setShowManualAdd(false);
  };

  const addNewItem = () => {
    const newItem: PlannedSupplyItem = {
      id: `new-${Date.now()}`,
      flowerName: "Нова квітка",
      flowerSlug: "",
      length: 50,
      currentStock: 0,
      plannedQuantity: 100,
      price: 0,
      isNew: true,
      isManual: true,
    };
    setItems((prev) => [newItem, ...prev]);
    setShowManualAdd(false);
  };

  const updatePlannedQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, plannedQuantity: Math.max(0, quantity) } : item
      )
    );
  };

  const updateNewItem = (id: string, field: keyof PlannedSupplyItem, value: any) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleExport = () => {
    const itemsToExport = items.filter((item) => item.plannedQuantity > 0);

    if (itemsToExport.length === 0) {
      alert("Додайте кількість для хоча б одного товару");
      return;
    }

    const headers = ["Назва квітки", "Довжина (см)", "Замовлення"];
    const rows = itemsToExport.map((item) => [
      item.flowerName,
      item.length,
      item.plannedQuantity,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `planned-supply-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setItems([]);
    setSearchQuery("");
    setSearchResults([]);
    setShowManualAdd(false);
    onOpenChange(false);
  };

  const itemsWithPlannedQty = items.filter((item) => item.plannedQuantity > 0);

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && handleClose()}
      title="Планування поставки"
      description="Товари з низькими залишками для замовлення"
      size="2xl"
    >
      <div className="space-y-4">
        {/* Threshold control */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              type="number"
              value={threshold}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setThreshold(0);
                } else {
                  const num = parseInt(value);
                  if (!isNaN(num) && num >= 0) {
                    setThreshold(num);
                  }
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;
                const num = parseInt(value);
                if (value === '' || isNaN(num) || num < 0) {
                  setThreshold(100);
                }
              }}
              min="0"
              max="1000"
              className="pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="Поріг залишків"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
              шт
            </span>
          </div>
          <Button
            onClick={loadLowStockItems}
            disabled={loading}
            variant="outline"
          >
            {loading ? "..." : "Оновити"}
          </Button>
        </div>

        {/* Empty state */}
        {items.length === 0 && !loading && (
          <div className="py-8 text-center">
            <p className="text-sm text-stone-500 dark:text-slate-400">
              Немає товарів з низькими залишками
            </p>
          </div>
        )}

        {/* Manual add */}
        {!showManualAdd ? (
          <button
            onClick={() => setShowManualAdd(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-stone-200 dark:border-slate-700 text-sm text-stone-500 dark:text-slate-400 hover:border-stone-300 dark:hover:border-slate-600 hover:text-stone-600 dark:hover:text-slate-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Додати товар
          </button>
        ) : (
          <div className="rounded-lg border border-stone-200 dark:border-slate-700 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-700 dark:text-slate-300">Додати товар</span>
              <button
                onClick={() => {
                  setShowManualAdd(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                type="text"
                placeholder="Пошук квітки..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="pl-9"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {searchResults.map((flower) =>
                  flower.variants.map((variant) => (
                    <button
                      key={`${flower.id}-${variant.id}`}
                      onClick={() => addVariantFromSearch(flower, variant)}
                      className="w-full rounded-lg p-2 text-left text-sm hover:bg-stone-50 dark:hover:bg-slate-800"
                    >
                      <div className="font-medium text-stone-900 dark:text-white">{flower.name}</div>
                      <div className="text-xs text-stone-500 dark:text-slate-400">
                        {variant.length} см • Залишок: {variant.stock}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {searching && (
              <div className="text-center text-sm text-stone-500">Пошук...</div>
            )}

            <button
              onClick={addNewItem}
              className="w-full py-2 rounded-lg text-sm text-stone-600 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-800"
            >
              + Додати неіснуючий товар
            </button>
          </div>
        )}

        {/* Items list */}
        {items.length > 0 && (
          <div className="space-y-2">
            {/* Статус-бар */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--admin-bg)]">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[var(--admin-text-tertiary)]">
                  <span className="font-medium text-[var(--admin-text-primary)]">{items.length}</span> варіантів
                </span>
                <span className="text-[var(--admin-text-tertiary)]">
                  <span className="font-medium text-[var(--admin-text-primary)]">{groupSupplyItems(items).length}</span> квіток
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  критично
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  низько
                </span>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {groupSupplyItems(items).map((group) => (
                <div
                  key={group.groupKey}
                  className="rounded-lg border border-stone-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800/30"
                >
                  {/* Group header */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-stone-50 dark:bg-slate-800/50">
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-slate-700">
                      {group.imageUrl ? (
                        <img
                          src={group.imageUrl}
                          alt={group.flowerName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone-400 dark:text-slate-500">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-stone-900 dark:text-white truncate">
                          {group.flowerName}
                        </span>
                        {group.hasNewItems && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            Новий
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-stone-500 dark:text-slate-400">
                        {group.items.length} варіантів
                      </span>
                    </div>
                    {group.totalPlanned > 0 && (
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {group.totalPlanned} шт
                      </span>
                    )}
                  </div>

                  {/* Variants */}
                  <div className="divide-y divide-stone-100 dark:divide-slate-700">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-transparent"
                      >
                        {item.isNew ? (
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1">
                              <Input
                                type="text"
                                value={item.flowerName}
                                onChange={(e) => updateNewItem(item.id, "flowerName", e.target.value)}
                                placeholder="Назва"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="w-16">
                              <div className="relative">
                                <Input
                                  type="number"
                                  value={item.length}
                                  onChange={(e) =>
                                    updateNewItem(item.id, "length", parseInt(e.target.value) || 0)
                                  }
                                  className="h-8 text-xs pr-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stone-400">см</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300">
                              {item.length} см
                            </span>
                            <span className={cn(
                              "text-xs",
                              getStockStatus(item.currentStock) === 'critical'
                                ? "text-rose-600 dark:text-rose-400"
                                : getStockStatus(item.currentStock) === 'low'
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-stone-500 dark:text-slate-400"
                            )}>
                              {item.currentStock} шт
                            </span>
                            {getStockStatus(item.currentStock) === 'critical' && (
                              <AlertTriangle className="h-3 w-3 text-rose-500" />
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          {/* Швидкі кнопки */}
                          <div className="flex gap-0.5">
                            {[50, 100, 200].map((qty) => (
                              <button
                                key={qty}
                                onClick={() => updatePlannedQuantity(item.id, item.plannedQuantity + qty)}
                                className="px-1.5 py-1 text-[10px] font-medium rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                              >
                                +{qty}
                              </button>
                            ))}
                          </div>
                          <Input
                            type="number"
                            value={item.plannedQuantity}
                            onChange={(e) =>
                              updatePlannedQuantity(item.id, parseInt(e.target.value) || 0)
                            }
                            min="0"
                            step="25"
                            className="w-16 h-7 text-xs text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-stone-400 hover:text-rose-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {itemsWithPlannedQty.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <span className="text-sm text-emerald-700 dark:text-emerald-400">
              {itemsWithPlannedQty.length} позицій до експорту
            </span>
            <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
              {itemsWithPlannedQty.reduce((sum, item) => sum + item.plannedQuantity, 0)} шт
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-slate-800">
          <Button variant="outline" onClick={handleClose}>
            Закрити
          </Button>
          <Button
            onClick={handleExport}
            disabled={itemsWithPlannedQty.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Експортувати
          </Button>
        </div>
      </div>
    </Modal>
  );
}
