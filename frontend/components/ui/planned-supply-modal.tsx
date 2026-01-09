"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Plus, X, Search, Download, Package, Eraser, Check } from "lucide-react";
import {
  getLowStockVariants,
  searchFlowersForSupply,
} from "@/lib/strapi";
import type {
  LowStockVariant,
  PlannedSupplyItem,
  FlowerSearchResult,
} from "@/lib/planned-supply-types";

// LocalStorage ключ для збереження
const STORAGE_KEY = 'pf-planned-supply-items';

const loadSavedItems = (): Record<string, { qty: number; active: boolean }> => {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveItemsToStorage = (items: PlannedSupplyItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    const data: Record<string, { qty: number; active: boolean }> = {};
    items.forEach(item => {
      if (item.plannedQuantity > 0 || item.isActive) {
        data[item.id] = { qty: item.plannedQuantity, active: item.isActive || false };
      }
    });
    if (Object.keys(data).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
};

// Тип для згрупованих товарів
type GroupedSupplyItem = {
  groupKey: string;
  flowerName: string;
  flowerId?: number;
  imageUrl?: string | null;
  items: PlannedSupplyItem[];
  totalPlanned: number;
  hasActiveItems: boolean;
};

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
        hasActiveItems: false,
      };
    }
    groups[key].items.push(item);
    if (item.isActive && item.plannedQuantity > 0) {
      groups[key].totalPlanned += item.plannedQuantity;
      groups[key].hasActiveItems = true;
    }
  });

  // Sort: active groups first
  return Object.values(groups).sort((a, b) => {
    if (a.hasActiveItems && !b.hasActiveItems) return -1;
    if (!a.hasActiveItems && b.hasActiveItems) return 1;
    return 0;
  });
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
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (open) {
      loadAllItems();
    }
  }, [open]);

  const loadAllItems = async () => {
    setLoading(true);
    try {
      const result = await getLowStockVariants(9999); // Завантажити всі
      if (result.success && result.data) {
        const savedData = loadSavedItems();

        const allItems: PlannedSupplyItem[] = result.data.map((variant: LowStockVariant) => {
          const id = `${variant.flowerId}-${variant.variantId}`;
          const saved = savedData[id];
          return {
            id,
            flowerId: variant.flowerId,
            flowerDocumentId: variant.flowerDocumentId,
            variantId: variant.variantId,
            variantDocumentId: variant.variantDocumentId,
            flowerName: variant.flowerName,
            flowerSlug: variant.flowerSlug,
            imageUrl: variant.imageUrl,
            length: variant.length,
            currentStock: variant.currentStock,
            plannedQuantity: saved?.qty || 0,
            price: variant.price,
            isNew: false,
            isManual: false,
            isActive: saved?.active || false,
          };
        });

        // Sort: active first, then by stock ascending
        const sorted = allItems.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return a.currentStock - b.currentStock;
        });

        setItems(sorted);
      }
    } catch (error) {
      console.error("Error loading items:", error);
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
      console.error("Error searching:", error);
    } finally {
      setSearching(false);
    }
  }, []);

  const toggleActive = (id: string) => {
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const newActive = !item.isActive;
          return {
            ...item,
            isActive: newActive,
            plannedQuantity: newActive && item.plannedQuantity === 0 ? 100 : item.plannedQuantity,
          };
        }
        return item;
      });
      saveItemsToStorage(updated);
      return updated;
    });
  };

  const updateQuantity = (id: string, qty: number) => {
    const newQty = Math.max(0, qty);
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, plannedQuantity: newQty, isActive: newQty > 0 ? true : item.isActive } : item
      );
      saveItemsToStorage(updated);
      return updated;
    });
  };

  const addFromSearch = (flower: FlowerSearchResult, variant: FlowerSearchResult["variants"][0]) => {
    const existingIdx = items.findIndex(
      item => item.flowerId === flower.id && item.variantId === variant.id
    );

    if (existingIdx >= 0) {
      // Activate existing
      setItems(prev => {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          isActive: true,
          plannedQuantity: updated[existingIdx].plannedQuantity || 100,
        };
        saveItemsToStorage(updated);
        return updated;
      });
    } else {
      // Add new
      const newItem: PlannedSupplyItem = {
        id: `manual-${flower.id}-${variant.id}`,
        flowerId: flower.id,
        flowerDocumentId: flower.documentId,
        variantId: variant.id,
        variantDocumentId: variant.documentId,
        flowerName: flower.name,
        flowerSlug: flower.slug,
        imageUrl: flower.imageUrl,
        length: variant.length,
        currentStock: variant.stock,
        plannedQuantity: 100,
        price: variant.price,
        isNew: false,
        isManual: true,
        isActive: true,
      };
      setItems(prev => {
        const updated = [newItem, ...prev];
        saveItemsToStorage(updated);
        return updated;
      });
    }

    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const clearAll = () => {
    setItems(prev => {
      const updated = prev.map(item => ({ ...item, plannedQuantity: 0, isActive: false }));
      localStorage.removeItem(STORAGE_KEY);
      return updated;
    });
  };

  const handleExport = () => {
    const toExport = items.filter(item => item.isActive && item.plannedQuantity > 0);
    if (toExport.length === 0) {
      alert("Оберіть товари для експорту");
      return;
    }

    const headers = ["Назва квітки", "Довжина (см)", "Замовлення"];
    const rows = toExport.map(item => [item.flowerName, item.length, item.plannedQuantity]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `supply-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
    onOpenChange(false);
  };

  const activeItems = items.filter(item => item.isActive && item.plannedQuantity > 0);
  const totalQty = activeItems.reduce((sum, item) => sum + item.plannedQuantity, 0);

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && handleClose()}
      title="Поставка"
      description="Оберіть товари для замовлення"
      size="2xl"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          {!showSearch ? (
            <>
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <Search className="h-4 w-4" />
                Пошук
              </button>
              {activeItems.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-stone-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-auto"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Скинути
                </button>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  type="text"
                  placeholder="Пошук квітки..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="pl-9 h-9"
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="p-2 text-stone-400 hover:text-stone-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Search results */}
        {showSearch && searchResults.length > 0 && (
          <div className="rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 max-h-40 overflow-y-auto">
            {searchResults.map(flower =>
              flower.variants.map(variant => (
                <button
                  key={`${flower.id}-${variant.id}`}
                  onClick={() => addFromSearch(flower, variant)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-stone-50 dark:hover:bg-slate-700/50 border-b border-stone-100 dark:border-slate-700 last:border-0"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-stone-900 dark:text-white">{flower.name}</div>
                    <div className="text-xs text-stone-500">{variant.length} см • {variant.stock} шт</div>
                  </div>
                  <Plus className="h-4 w-4 text-emerald-500" />
                </button>
              ))
            )}
          </div>
        )}

        {/* Items list */}
        {loading ? (
          <div className="py-8 text-center text-sm text-stone-500">Завантаження...</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm text-stone-500">Немає товарів</div>
        ) : (
          <div className="max-h-[450px] overflow-y-auto space-y-2">
            {groupSupplyItems(items).map(group => (
              <div
                key={group.groupKey}
                className={cn(
                  "rounded-lg border overflow-hidden transition-colors",
                  group.hasActiveItems
                    ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-900/10"
                    : "border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800/30"
                )}
              >
                {/* Group header */}
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2",
                  group.hasActiveItems
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : "bg-stone-50 dark:bg-slate-800/50"
                )}>
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-slate-700">
                    {group.imageUrl ? (
                      <img src={group.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone-400">
                        <Package className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-stone-900 dark:text-white truncate block">
                      {group.flowerName}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-slate-400">
                      {group.items.length} {group.items.length === 1 ? 'варіант' : 'варіанти'}
                    </span>
                  </div>
                  {group.totalPlanned > 0 && (
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {group.totalPlanned} шт
                    </span>
                  )}
                </div>

                {/* Variants */}
                <div className="divide-y divide-stone-100 dark:divide-slate-700">
                  {group.items.map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 transition-colors",
                        item.isActive ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""
                      )}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleActive(item.id)}
                        className={cn(
                          "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                          item.isActive
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-stone-300 dark:border-slate-600 hover:border-emerald-400"
                        )}
                      >
                        {item.isActive && <Check className="h-3 w-3" />}
                      </button>

                      {/* Info */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300">
                          {item.length} см
                        </span>
                        <span className="text-xs text-stone-500 dark:text-slate-400">
                          {item.currentStock} шт
                        </span>
                      </div>

                      {/* Quantity controls */}
                      {item.isActive && (
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5">
                            {[25, 100].map(qty => (
                              <button
                                key={qty}
                                onClick={() => updateQuantity(item.id, item.plannedQuantity + qty)}
                                className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60"
                              >
                                +{qty}
                              </button>
                            ))}
                          </div>
                          <Input
                            type="number"
                            value={item.plannedQuantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-16 h-7 text-xs text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-slate-800">
          {activeItems.length > 0 ? (
            <div className="text-sm">
              <span className="text-stone-500 dark:text-slate-400">Обрано: {activeItems.length}</span>
              <span className="mx-2 text-stone-300">•</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totalQty} шт</span>
            </div>
          ) : (
            <span className="text-sm text-stone-400">Оберіть товари</span>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} size="sm">
              Закрити
            </Button>
            <Button onClick={handleExport} disabled={activeItems.length === 0} size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              Експорт
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
