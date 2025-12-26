"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { Plus, X, Search, Download, AlertCircle, AlertTriangle } from "lucide-react";
import {
  getLowStockVariants,
  searchFlowersForSupply,
} from "@/lib/strapi";
import type {
  LowStockVariant,
  PlannedSupplyItem,
  FlowerSearchResult,
} from "@/lib/planned-supply-types";

// Функція визначення статусу залишку (як у ProductsSection)
const getStockStatus = (stock: number): 'critical' | 'low' | 'good' => {
  if (stock < 150) return 'critical'; // червоний
  if (stock < 300) return 'low';      // жовтий
  return 'good';                      // зелений
};

const stockBadgeClass = (stock: number) => {
  if (stock < 150) return "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 ring-1 ring-rose-100 dark:ring-rose-800/50";
  if (stock < 300) return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-800/50";
  return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-800/50";
};

// Тип для згрупованих товарів
type GroupedSupplyItem = {
  groupKey: string; // Stable key for React
  flowerName: string;
  flowerId?: number;
  imageUrl?: string | null;
  items: PlannedSupplyItem[];
  totalPlanned: number;
  hasNewItems: boolean;
};

// Функція групування товарів за назвою квітки
function groupSupplyItems(items: PlannedSupplyItem[]): GroupedSupplyItem[] {
  const groups: Record<string, GroupedSupplyItem> = {};

  items.forEach((item) => {
    // Для нових товарів (isNew) використовуємо item.id як ключ групи
    // щоб уникнути проблем з фокусом при зміні назви
    const key = item.isNew ? item.id : (item.flowerId?.toString() || item.flowerName);
    if (!groups[key]) {
      groups[key] = {
        groupKey: key, // Stable key based on flowerId or item.id for new items
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
    // Оновлюємо flowerName для групи (для нових товарів)
    if (item.isNew) {
      groups[key].flowerName = item.flowerName;
    }
    if (item.isNew) {
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
  const [threshold, setThreshold] = useState(300); // Змінено на 300 для включення червоних і жовтих
  const [showManualAdd, setShowManualAdd] = useState(false);

  // Завантажити товари з низькими залишками при відкритті модального вікна
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
          plannedQuantity: 0, // Початково 0, користувач заповнить вручну
          price: variant.price,
          isNew: false,
          isManual: false,
        }));

        // Сортувати: спочатку червоні (critical < 150), потім жовті (low < 300)
        const sorted = lowStockItems.sort((a, b) => {
          const statusA = getStockStatus(a.currentStock);
          const statusB = getStockStatus(b.currentStock);

          if (statusA === 'critical' && statusB !== 'critical') return -1;
          if (statusA !== 'critical' && statusB === 'critical') return 1;
          if (statusA === 'low' && statusB !== 'low') return -1;
          if (statusA !== 'low' && statusB === 'low') return 1;

          // Якщо однаковий статус, сортувати за залишком (менший спочатку)
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

  // Пошук квітів для ручного додавання
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

  // Додати варіант з результатів пошуку
  const addVariantFromSearch = (flower: FlowerSearchResult, variant: FlowerSearchResult["variants"][0]) => {
    const existingItem = items.find(
      (item) => item.flowerId === flower.id && item.variantId === variant.id
    );

    if (existingItem) {
      // Якщо товар вже існує, просто збільшуємо plannedQuantity
      updatePlannedQuantity(existingItem.id, existingItem.plannedQuantity + 100);
    } else {
      // Додаємо новий товар НА ПОЧАТОК списку
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
        plannedQuantity: 100, // За замовчуванням 100
        price: variant.price,
        isNew: false,
        isManual: true,
      };
      setItems((prev) => [newItem, ...prev]); // Додаємо на початок
    }

    // Очистити пошук
    setSearchQuery("");
    setSearchResults([]);
    setShowManualAdd(false);
  };

  // Додати новий товар (який не існує в системі)
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
    setItems((prev) => [newItem, ...prev]); // Додаємо на початок
    setShowManualAdd(false);
  };

  // Оновити плановану кількість
  const updatePlannedQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, plannedQuantity: Math.max(0, quantity) } : item
      )
    );
  };

  // Оновити дані нового товару
  const updateNewItem = (id: string, field: keyof PlannedSupplyItem, value: any) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Видалити товар
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Експортувати в Excel
  const handleExport = () => {
    // Фільтруємо тільки товари з plannedQuantity > 0
    const itemsToExport = items.filter((item) => item.plannedQuantity > 0);

    if (itemsToExport.length === 0) {
      alert("Додайте кількість для хоча б одного товару");
      return;
    }

    // Створюємо CSV дані
    const headers = ["Назва квітки", "Довжина (см)", "Замовлення"];
    const rows = itemsToExport.map((item) => [
      item.flowerName,
      item.length,
      item.plannedQuantity,
    ]);

    // Створюємо CSV контент
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Завантажуємо файл
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

  // Очистити при закритті
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
      title="Запланована поставка"
      size="lg"
    >
      <div className="space-y-4">
        {/* Поріг низьких залишків */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-admin-text-secondary">
              Поріг низьких залишків
            </label>
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
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadLowStockItems}
            disabled={loading}
            className="mt-5"
          >
            {loading ? "Завантаження..." : "Оновити"}
          </Button>
        </div>

        {/* Інформаційна панель */}
        {items.length === 0 && !loading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
            <AlertCircle className="h-4 w-4" />
            <span>Немає товарів з низькими залишками. Додайте товари вручну.</span>
          </div>
        )}

        {/* Ручне додавання */}
        <div className="space-y-2">
          {!showManualAdd ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManualAdd(true)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Додати товар вручну
            </Button>
          ) : (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">Додати товар</span>
                <button
                  onClick={() => {
                    setShowManualAdd(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="text-slate-400 dark:text-admin-text-muted hover:text-slate-600 dark:hover:text-admin-text-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Пошук існуючих товарів */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-admin-text-muted" />
                <Input
                  type="text"
                  placeholder="Пошук квітки..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Результати пошуку */}
              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {searchResults.map((flower) =>
                    flower.variants.map((variant) => (
                      <button
                        key={`${flower.id}-${variant.id}`}
                        onClick={() => addVariantFromSearch(flower, variant)}
                        className="w-full rounded-lg border border-slate-100 dark:border-admin-border bg-white dark:bg-slate-800/50 p-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <div className="font-semibold text-slate-900 dark:text-admin-text-primary">{flower.name}</div>
                        <div className="text-xs text-slate-600 dark:text-admin-text-secondary">
                          {variant.length} см • Залишок: {variant.stock}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {searching && (
                <div className="text-center text-sm text-slate-500 dark:text-admin-text-tertiary">Пошук...</div>
              )}

              {/* Додати новий товар */}
              <Button variant="outline" size="sm" onClick={addNewItem} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Додати неіснуючий товар
              </Button>
            </div>
          )}
        </div>

        {/* Список товарів (згрупований) */}
        {items.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-admin-text-primary">
              Позиції поставки ({items.length} варіантів, {groupSupplyItems(items).length} квіток)
            </p>
            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
              {groupSupplyItems(items).map((group) => (
                <div
                  key={group.groupKey}
                  className="rounded-2xl border border-slate-100 dark:border-admin-border bg-white/90 dark:bg-admin-surface-elevated shadow-sm overflow-hidden"
                >
                  {/* Заголовок групи */}
                  <div className="flex items-center justify-between gap-3 p-3 pb-2 border-b border-slate-100 dark:border-[#30363d] bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-admin-surface">
                      {group.imageUrl ? (
                        <img
                          src={group.imageUrl}
                          alt={group.flowerName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-admin-text-muted">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900 dark:text-admin-text-primary truncate">
                          {group.flowerName}
                        </h4>
                        {group.hasNewItems && (
                          <Badge className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                            Новий
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-admin-text-tertiary">
                        {group.items.length} {group.items.length === 1 ? 'варіант' : group.items.length < 5 ? 'варіанти' : 'варіантів'}
                      </p>
                    </div>
                    {group.totalPlanned > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-admin-text-tertiary">Разом</p>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          {group.totalPlanned} шт
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Варіанти */}
                  <div className="divide-y divide-slate-100 dark:divide-[#30363d]">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2.5 dark:bg-slate-800/30"
                      >
                        {item.isNew ? (
                          // Новий товар - редаговані поля
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <label className="block text-[10px] text-slate-500 dark:text-admin-text-muted mb-0.5">Назва</label>
                              <Input
                                type="text"
                                value={item.flowerName}
                                onChange={(e) => updateNewItem(item.id, "flowerName", e.target.value)}
                                placeholder="Введіть назву"
                                className="text-sm font-semibold h-8"
                              />
                            </div>
                            <div className="w-20 shrink-0">
                              <label className="block text-[10px] text-slate-500 dark:text-admin-text-muted mb-0.5">Довжина</label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  value={item.length}
                                  onChange={(e) =>
                                    updateNewItem(item.id, "length", parseInt(e.target.value) || 0)
                                  }
                                  placeholder="50"
                                  className="text-xs h-8 pr-7"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-admin-text-muted">см</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Існуючий товар
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Badge tone="outline" className="shrink-0 text-xs px-2 py-0.5">
                              {item.length} см
                            </Badge>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-admin-text-tertiary">
                              <span>Залишок: {item.currentStock}</span>
                              {getStockStatus(item.currentStock) === 'critical' && (
                                <AlertTriangle className="h-3 w-3 text-rose-500" />
                              )}
                              {getStockStatus(item.currentStock) === 'low' && (
                                <AlertCircle className="h-3 w-3 text-amber-500" />
                              )}
                              {item.isManual && (
                                <span className="text-emerald-600">(вручну)</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Кількість */}
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            value={item.plannedQuantity}
                            onChange={(e) =>
                              updatePlannedQuantity(item.id, parseInt(e.target.value) || 0)
                            }
                            min="0"
                            step="25"
                            className="w-20 h-8 text-sm text-center"
                          />
                          <span className="text-xs text-slate-400 dark:text-admin-text-muted">шт</span>
                        </div>

                        {/* Видалити */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-slate-400 dark:text-admin-text-muted hover:text-rose-500 dark:hover:text-rose-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Підсумок */}
        {itemsWithPlannedQty.length > 0 && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Товарів для замовлення:</span>
              <span className="font-semibold text-slate-900">{itemsWithPlannedQty.length}</span>
            </div>
          </div>
        )}

        {/* Дії */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Закрити
          </Button>
          <Button
            onClick={handleExport}
            disabled={itemsWithPlannedQty.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
            size="icon"
            title="Експортувати"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
