"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Plus, Minus, X, Search, Download, Package, Eraser, Check, ShoppingCart, Loader2, Sparkles } from "lucide-react";
import {
  getAllFlowersForSupply,
  searchFlowersForSupply,
} from "@/lib/strapi";
import type {
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
      // Використовуємо getAllFlowersForSupply щоб отримати ВСІ квіти, включаючи з stock=0
      const result = await getAllFlowersForSupply();
      if (result.success && result.data) {
        const savedData = loadSavedItems();

        const allItems: PlannedSupplyItem[] = [];

        // Конвертуємо формат FlowerSearchResult[] в PlannedSupplyItem[]
        for (const flower of result.data) {
          for (const variant of flower.variants) {
            const id = `${flower.id}-${variant.id}`;
            const saved = savedData[id];
            allItems.push({
              id,
              flowerId: flower.id,
              flowerDocumentId: flower.documentId,
              variantId: variant.id,
              variantDocumentId: variant.documentId,
              flowerName: flower.name,
              flowerSlug: flower.slug,
              imageUrl: flower.imageUrl,
              length: variant.length,
              currentStock: variant.stock,
              plannedQuantity: saved?.qty || 0,
              price: variant.price,
              isNew: false,
              isManual: false,
              isActive: saved?.active || false,
            });
          }
        }

        // Sort: active first, then by stock ascending (0 will be at the top)
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
      <div className="space-y-4">
        {/* Summary pills */}
        {activeItems.length > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/50">
            <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                {activeItems.length} {activeItems.length === 1 ? 'позиція' : activeItems.length < 5 ? 'позиції' : 'позицій'} в замовленні
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Загалом: <span className="font-semibold tabular-nums">{totalQty.toLocaleString('uk-UA')}</span> шт
              </p>
            </div>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors shrink-0"
            >
              <Eraser className="h-3.5 w-3.5" />
              Очистити
            </button>
          </div>
        )}

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            type="text"
            placeholder="Пошук квітки за назвою..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
              if (e.target.value.length >= 2) {
                setShowSearch(true);
              }
            }}
            onFocus={() => searchQuery.length >= 2 && setShowSearch(true)}
            className="pl-10 h-10"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowSearch(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search results */}
        {showSearch && searchResults.length > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 max-h-48 overflow-y-auto shadow-lg">
            <div className="p-2 text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium border-b border-slate-100 dark:border-slate-700">
              Результати пошуку
            </div>
            {searchResults.map(flower =>
              flower.variants.map(variant => {
                const isAlreadyAdded = items.some(
                  item => item.flowerId === flower.id && item.variantId === variant.id && item.isActive
                );
                return (
                  <button
                    key={`${flower.id}-${variant.id}`}
                    onClick={() => !isAlreadyAdded && addFromSearch(flower, variant)}
                    disabled={isAlreadyAdded}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0",
                      isAlreadyAdded
                        ? "bg-emerald-50/50 dark:bg-emerald-900/10 cursor-default"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    )}
                  >
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                      {flower.imageUrl ? (
                        <img src={flower.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-white truncate">{flower.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {variant.length} см • <span className={variant.stock === 0 ? "text-rose-500" : ""}>{variant.stock} шт</span>
                      </div>
                    </div>
                    {isAlreadyAdded ? (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <Check className="h-4 w-4" />
                        <span>Додано</span>
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Searching indicator */}
        {searching && searchQuery.length >= 2 && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Пошук...</span>
          </div>
        )}

        {/* Items list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Завантаження товарів...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Package className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Немає товарів для поставки</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-2 scrollbar-thin">
            {groupSupplyItems(items).map(group => (
              <div
                key={group.groupKey}
                className={cn(
                  "rounded-xl border overflow-hidden transition-colors",
                  group.hasActiveItems
                    ? "border-emerald-200 dark:border-emerald-800/50 ring-1 ring-emerald-100 dark:ring-emerald-900/30"
                    : "border-slate-200 dark:border-slate-700"
                )}
              >
                {/* Group header */}
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5",
                  group.hasActiveItems
                    ? "bg-emerald-50/70 dark:bg-emerald-900/20"
                    : "bg-slate-50/70 dark:bg-slate-800/50"
                )}>
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white dark:bg-slate-700 ring-1 ring-slate-200/60 dark:ring-slate-600/50">
                    {group.imageUrl ? (
                      <img src={group.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm text-slate-800 dark:text-white truncate block">
                      {group.flowerName}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {group.items.length} {group.items.length === 1 ? 'варіант' : group.items.length < 5 ? 'варіанти' : 'варіантів'}
                    </span>
                  </div>
                  {group.totalPlanned > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500 text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="text-sm font-semibold tabular-nums">{group.totalPlanned}</span>
                    </div>
                  )}
                </div>

                {/* Variants */}
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {group.items.map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 transition-colors",
                        item.isActive
                          ? "bg-emerald-50/40 dark:bg-emerald-900/10"
                          : "bg-white dark:bg-slate-800/30"
                      )}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleActive(item.id)}
                        className={cn(
                          "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                          item.isActive
                            ? "bg-emerald-500 border-emerald-500 text-white scale-105"
                            : "border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-500"
                        )}
                      >
                        {item.isActive && <Check className="h-3 w-3" strokeWidth={3} />}
                      </button>

                      {/* Info */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-md font-medium",
                          item.isActive
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        )}>
                          {item.length} см
                        </span>
                        <span className={cn(
                          "text-xs tabular-nums",
                          item.currentStock === 0
                            ? "text-rose-500 font-medium"
                            : item.currentStock < 50
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-500 dark:text-slate-400"
                        )}>
                          {item.currentStock === 0 ? "Нема в наявності" : `${item.currentStock} шт`}
                        </span>
                      </div>

                      {/* Quantity controls */}
                      {item.isActive && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.plannedQuantity - 25)}
                            disabled={item.plannedQuantity <= 0}
                            className="h-7 w-7 rounded-md flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <Input
                            type="number"
                            value={item.plannedQuantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-16 h-7 text-sm text-center font-semibold tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.plannedQuantity + 25)}
                            className="h-7 w-7 rounded-md flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => updateQuantity(item.id, item.plannedQuantity + 100)}
                            className="px-2 h-7 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
                          >
                            +100
                          </button>
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
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            {activeItems.length > 0 ? (
              <>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeItems.length}</span> {activeItems.length === 1 ? 'товар' : activeItems.length < 5 ? 'товари' : 'товарів'}
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Всього:</span>{' '}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{totalQty.toLocaleString('uk-UA')}</span> шт
                </div>
              </>
            ) : (
              <span className="text-sm text-slate-400 dark:text-slate-500">
                Оберіть товари для замовлення
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Закрити
            </Button>
            <Button onClick={handleExport} disabled={activeItems.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Експорт CSV
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
