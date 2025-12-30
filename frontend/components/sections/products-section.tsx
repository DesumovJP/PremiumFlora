import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatPill } from "@/components/ui/stat-pill";
import { Product, Variant } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Trash, PackageMinus, Plus, X, Pencil, Eye, Download, Package, ArrowUpDown, Upload, FileSpreadsheet } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ImportModal } from "@/components/ui/import-modal";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { WriteOffInput } from "@/lib/api-types";
import { getFlowers, searchFlowers, getFlowerForEdit, updateFlower, updateVariant } from "@/lib/strapi";
import { getAuthHeaders } from "@/lib/auth";
import type { StrapiBlock } from "@/lib/strapi-types";

const stockTone = (stock: number) => {
  if (stock >= 300) return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-800/50";
  if (stock >= 150) return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-800/50";
  return "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 ring-1 ring-rose-100 dark:ring-rose-800/50";
};

type ProductsSectionProps = {
  summary: { totalItems: number; stock: number };
  products: Product[];
  onOpenSupply: () => void;
  onOpenExport: () => void;
  onWriteOff?: (data: Omit<WriteOffInput, "operationId">) => Promise<boolean>;
  onRefresh?: () => void;
  onLogActivity?: (type: 'variantDelete' | 'productEdit' | 'productCreate' | 'productDelete', details: {
    productName?: string;
    productId?: string;
    variantLength?: number;
    variantsCount?: number;
    variantPrice?: number;
    variantStock?: number;
    totalStock?: number;
    variants?: Array<{ length: number; price: number; stock: number }>;
    changes?: Record<string, { from: unknown; to: unknown }>;
  }) => void;
  showSuccess?: (title: string, message: string) => void;
  showError?: (title: string, message: string) => void;
  showWarning?: (title: string, message: string) => void;
};

type WriteOffReason = 'damage' | 'expiry' | 'adjustment' | 'other';

const reasonLabels: Record<WriteOffReason, string> = {
  damage: 'Пошкодження',
  expiry: 'Закінчення терміну',
  adjustment: 'Інвентаризація',
  other: 'Інша причина',
};

export function ProductsSection({ summary, products, onOpenSupply, onOpenExport, onWriteOff, onRefresh, onLogActivity, showSuccess, showError, showWarning }: ProductsSectionProps) {
  // Fallback to alert if toast functions not provided
  const notify = {
    success: showSuccess || ((title: string, message: string) => alert(`${title}: ${message}`)),
    error: showError || ((title: string, message: string) => alert(`${title}: ${message}`)),
    warning: showWarning || ((title: string, message: string) => alert(`${title}: ${message}`)),
  };
  const LowStockIcon = AlertTriangle;
  
  // Знаходимо продукти з низьким залишком (< 150)
  const lowStockItems = useMemo(() => {
    const items: Array<{ productName: string; variant: string; stock: number }> = [];
    products.forEach((product) => {
      product.variants.forEach((variant) => {
        if (variant.stock < 150) {
          items.push({
            productName: product.name,
            variant: variant.size,
            stock: variant.stock,
          });
        }
      });
    });
    // Сортуємо за залишком (від найменшого)
    return items.sort((a, b) => a.stock - b.stock).slice(0, 3); // Показуємо до 3 найнижчих
  }, [products]);
  
  const hasLowStock = lowStockItems.length > 0;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{
    flowerId: string | null;
    flowerName: string;
    image: File | null;
    imagePreview: string | null;
    variants: Array<{
      id: string;
      length: string;
      price: string;
      stock: string;
    }>;
  }>({
    flowerId: null,
    flowerName: "",
    image: null,
    imagePreview: null,
    variants: [],
  });
  const [addMode, setAddMode] = useState<"manual" | "invoice">("manual");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [flowerSearchQuery, setFlowerSearchQuery] = useState("");
  const [availableFlowers, setAvailableFlowers] = useState<Product[]>([]);

  // Write-off state
  const [writeOffModalOpen, setWriteOffModalOpen] = useState(false);
  const [writeOffTarget, setWriteOffTarget] = useState<Product | null>(null);
  const [writeOffData, setWriteOffData] = useState<{
    selectedVariant: string;
    qty: number | string; // Дозволяємо string для порожнього значення
    reason: WriteOffReason;
    notes: string;
  }>({
    selectedVariant: '',
    qty: 1,
    reason: 'damage',
    notes: '',
  });
  const [isWritingOff, setIsWritingOff] = useState(false);

  // Sorting state
  type SortKey = 'name' | 'price' | 'stock' | 'updatedAt';
  type SortDirection = 'asc' | 'desc';
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Sorted products
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'uk');
          break;
        case 'price':
          // Сортуємо за мінімальною ціною
          const minPriceA = Math.min(...a.variants.map(v => v.price));
          const minPriceB = Math.min(...b.variants.map(v => v.price));
          comparison = minPriceA - minPriceB;
          break;
        case 'stock':
          // Сортуємо за загальною кількістю на складі
          const totalStockA = a.variants.reduce((sum, v) => sum + v.stock, 0);
          const totalStockB = b.variants.reduce((sum, v) => sum + v.stock, 0);
          comparison = totalStockA - totalStockB;
          break;
        case 'updatedAt':
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [products, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Якщо клікаємо по тому ж ключу, змінюємо напрямок
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Новий ключ - встановлюємо його та дефолтний напрямок
      setSortKey(key);
      setSortDirection(key === 'updatedAt' || key === 'stock' ? 'desc' : 'asc');
    }
  };

  // Edit state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editData, setEditData] = useState<{
    image: File | null;
    imagePreview: string | null;
    description: string;
    originalDescription: string;
    variants: Array<{
      documentId: string;
      length: number;
      price: number;
      stock: number;
      isNew?: boolean;
      isDeleted?: boolean;
    }>;
    originalVariants: Array<{
      documentId: string;
      length: number;
      price: number;
      stock: number;
    }>;
  }>({
    image: null,
    imagePreview: null,
    description: "",
    originalDescription: "",
    variants: [],
    originalVariants: [],
  });
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetForm = () => {
    setDraft({
      flowerId: null,
      flowerName: "",
      image: null,
      imagePreview: null,
      variants: [],
    });
    setFlowerSearchQuery("");
    setAvailableFlowers([]);
  };

  const addVariant = () => {
    setDraft((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: Date.now().toString(),
          length: "",
          price: "",
          stock: "",
        },
      ],
    }));
  };

  const removeVariant = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== id),
    }));
  };

  const updateDraftVariant = (id: string, field: "length" | "price" | "stock", value: string) => {
    setDraft((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDraft((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const resetWriteOffForm = () => {
    setWriteOffData({ selectedVariant: '', qty: 1, reason: 'damage', notes: '' });
    setWriteOffTarget(null);
  };

  const openWriteOffModal = (product: Product) => {
    setWriteOffTarget(product);
    // Встановлюємо перший варіант за замовчуванням, якщо є
    const firstVariant = product.variants.length > 0 ? product.variants[0].size : '';
    setWriteOffData({ selectedVariant: firstVariant, qty: 1, reason: 'damage', notes: '' });
    setWriteOffModalOpen(true);
  };

  const openEditModal = async (product: Product) => {
    setEditingProduct(product);
    setIsLoadingEditData(true);
    setEditModalOpen(true);

    try {
      if (!product.documentId) {
        console.error("Product missing documentId");
        return;
      }

      const STRAPI_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337").replace(/\/$/, '');
      const flowerData = await getFlowerForEdit(product.documentId);
      if (flowerData) {
        // Конвертуємо StrapiBlock[] в текст для textarea
        const descriptionText = flowerData.description
          ? flowerData.description
              .map((block) => {
                if (block.type === "paragraph") {
                  return block.children.map((child) => child.text).join("");
                }
                return "";
              })
              .join("\n")
          : "";

        // Для картинок з DO Spaces URL вже повний, для локальних - додаємо STRAPI_URL
        const imageUrl = flowerData.image?.url;
        const imagePreview = imageUrl
          ? (imageUrl.startsWith('http') ? imageUrl : `${STRAPI_URL}${imageUrl}`)
          : null;

        const mappedVariants = flowerData.variants.map((v) => ({
          documentId: v.documentId,
          length: v.length,
          price: v.price,
          stock: v.stock,
        }));
        setEditData({
          image: null,
          imagePreview,
          description: descriptionText,
          originalDescription: descriptionText,
          variants: mappedVariants,
          originalVariants: mappedVariants.map(v => ({ ...v })),
        });
      }
    } catch (error) {
      console.error("Error loading flower data:", error);
    } finally {
      setIsLoadingEditData(false);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleEditVariantChange = (documentId: string, field: "price" | "stock" | "length", value: number) => {
    setEditData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.documentId === documentId ? { ...v, [field]: value } : v
      ),
    }));
  };

  const addEditVariant = () => {
    setEditData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          documentId: `new-${Date.now()}`,
          length: 0,
          price: 0,
          stock: 0,
          isNew: true,
        },
      ],
    }));
  };

  const removeEditVariant = (documentId: string) => {
    setEditData((prev) => {
      // Для нових варіантів - просто видаляємо зі списку
      const variant = prev.variants.find(v => v.documentId === documentId);
      if (variant?.isNew) {
        return {
          ...prev,
          variants: prev.variants.filter((v) => v.documentId !== documentId),
        };
      }
      // Для існуючих - позначаємо як видалені
      return {
        ...prev,
        variants: prev.variants.map((v) =>
          v.documentId === documentId ? { ...v, isDeleted: true } : v
        ),
      };
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct?.documentId) return;

    setIsSavingEdit(true);
    try {
      const STRAPI_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337").replace(/\/$/, '');
      const API_URL = `${STRAPI_URL}/api`;
      const authHeaders = getAuthHeaders();

      // 1. Завантажити нове зображення, якщо є
      let imageId: number | null = null;
      let imageUploadError: string | null = null;
      if (editData.image) {
        try {
          const imageFormData = new FormData();
          imageFormData.append("files", editData.image);

          const uploadHeaders: Record<string, string> = {};
          if (typeof authHeaders === 'object' && authHeaders !== null && 'Authorization' in authHeaders) {
            uploadHeaders.Authorization = (authHeaders as Record<string, string>).Authorization;
          }

          const imageResponse = await fetch(`${STRAPI_URL}/api/upload`, {
            method: "POST",
            headers: uploadHeaders,
            body: imageFormData,
          });
          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            imageId = imageData[0]?.id || null;
            if (!imageId) {
              imageUploadError = "Зображення завантажено, але не отримано ID";
            }
          } else {
            const errorText = await imageResponse.text();
            console.error("Failed to upload image:", errorText);
            imageUploadError = `Помилка завантаження зображення: ${imageResponse.status}`;
          }
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          imageUploadError = imageError instanceof Error ? imageError.message : "Невідома помилка завантаження";
        }
      }

      // Попередити користувача про помилку завантаження зображення
      if (imageUploadError) {
        const continueWithoutImage = window.confirm(
          `${imageUploadError}\n\nПродовжити збереження без зміни зображення?`
        );
        if (!continueWithoutImage) {
          setIsSavingEdit(false);
          return;
        }
      }

      // 2. Конвертуємо текст опису в StrapiBlock[]
      const descriptionBlocks: StrapiBlock[] = editData.description
        ? editData.description.split("\n").map((line) => ({
            type: "paragraph",
            children: [{ type: "text", text: line }],
          }))
        : [];

      // 3. Оновити квітку
      let updateResult;
      try {
        const updateData: {
          description: StrapiBlock[];
          imageId?: number;
        } = {
          description: descriptionBlocks,
        };
        
        // Додаємо imageId тільки якщо він не null
        if (imageId !== null) {
          updateData.imageId = imageId;
        }

        updateResult = await updateFlower(editingProduct.documentId, updateData);
      } catch (error) {
        console.error("Error calling updateFlower:", error);
        notify.error("Помилка оновлення", error instanceof Error ? error.message : "Невідома помилка");
        return;
      }

      if (!updateResult || !updateResult.success) {
        const errorMessage = updateResult?.error?.message || "Невідома помилка оновлення квітки";
        notify.error("Помилка оновлення", errorMessage);
        return;
      }

      // 4. Видалити позначені варіанти
      const variantErrors: string[] = [];
      const deletedVariants = editData.variants.filter(v => v.isDeleted && !v.isNew);

      for (const variant of deletedVariants) {
        try {
          const deleteResponse = await fetch(`${STRAPI_URL}/api/variants/${variant.documentId}`, {
            method: "DELETE",
            headers: authHeaders,
          });

          if (deleteResponse.ok) {
            // Логуємо видалення в історію
            if (onLogActivity) {
              onLogActivity('variantDelete', {
                productName: editingProduct.name,
                productId: editingProduct.documentId,
                variantLength: variant.length,
                variantPrice: variant.price,
                variantStock: variant.stock,
              });
            }
          } else {
            const errorData = await deleteResponse.json().catch(() => ({}));
            variantErrors.push(`Видалення варіанту ${variant.length} см: ${errorData.error?.message || "Помилка видалення"}`);
          }
        } catch (deleteError) {
          const errorMessage = deleteError instanceof Error ? deleteError.message : "Невідома помилка";
          variantErrors.push(`Видалення варіанту ${variant.length} см: ${errorMessage}`);
        }
      }

      // 5. Оновити існуючі варіанти та створити нові
      const activeVariants = editData.variants.filter(v => !v.isDeleted);
      const changesLog: Record<string, { from: unknown; to: unknown }> = {};

      // Логуємо зміну опису
      if (editData.description !== editData.originalDescription) {
        const fromDesc = editData.originalDescription.trim() || '(пусто)';
        const toDesc = editData.description.trim() || '(пусто)';
        changesLog['Опис'] = { from: fromDesc.slice(0, 50) + (fromDesc.length > 50 ? '...' : ''), to: toDesc.slice(0, 50) + (toDesc.length > 50 ? '...' : '') };
      }

      // Логуємо зміну зображення
      if (editData.image) {
        changesLog['Зображення'] = { from: 'старе', to: 'нове' };
      }

      for (const variant of activeVariants) {
        try {
          if (variant.isNew) {
            // Створити новий варіант
            if (!variant.length || variant.length <= 0) {
              variantErrors.push(`Новий варіант: довжина повинна бути більше 0`);
              continue;
            }

            const createResponse = await fetch(`${STRAPI_URL}/api/variants`, {
              method: "POST",
              headers: authHeaders,
              body: JSON.stringify({
                data: {
                  length: variant.length,
                  price: variant.price,
                  stock: variant.stock,
                  // Strapi v5: use connect syntax for relations
                  flower: {
                    connect: [{ documentId: editingProduct.documentId }]
                  },
                },
              }),
            });

            if (!createResponse.ok) {
              const errorData = await createResponse.json().catch(() => ({}));
              variantErrors.push(`Новий варіант ${variant.length} см: ${errorData.error?.message || "Помилка створення"}`);
            } else {
              // Логуємо створення нового варіанту
              changesLog[`Новий варіант ${variant.length} см`] = { from: '-', to: `${variant.stock} шт, ${variant.price} грн` };
            }
          } else {
            // Знаходимо оригінальний варіант для порівняння
            const originalVariant = editData.originalVariants.find(ov => ov.documentId === variant.documentId);

            // Оновити існуючий варіант
            const variantResult = await updateVariant(variant.documentId, {
              price: variant.price,
              stock: variant.stock,
            });

            if (!variantResult || !variantResult.success) {
              const errorMessage = variantResult?.error?.message || variantResult?.error?.code || "Невідома помилка";
              variantErrors.push(`Варіант ${variant.length} см: ${errorMessage}`);
            } else if (originalVariant) {
              // Логуємо зміни, якщо вони є
              if (originalVariant.stock !== variant.stock) {
                changesLog[`${variant.length} см - кількість`] = { from: originalVariant.stock, to: variant.stock };
              }
              if (originalVariant.price !== variant.price) {
                changesLog[`${variant.length} см - ціна`] = { from: originalVariant.price, to: variant.price };
              }
            }
          }
        } catch (variantError) {
          const errorMessage = variantError instanceof Error ? variantError.message : "Невідома помилка";
          variantErrors.push(`Варіант ${variant.length} см: ${errorMessage}`);
        }
      }

      // Логуємо редагування продукту, якщо були зміни
      if (onLogActivity && Object.keys(changesLog).length > 0) {
        onLogActivity('productEdit', {
          productName: editingProduct.name,
          productId: editingProduct.documentId,
          changes: changesLog,
        });
      }

      // Показуємо попередження, якщо були помилки
      if (variantErrors.length > 0) {
        notify.warning("Увага", `Деякі варіанти не вдалося обробити: ${variantErrors.join(", ")}`);
      } else {
        // Показуємо повідомлення про успіх
        notify.success("Збережено", "Зміни успішно збережено");
      }

      // 5. Оновити список продуктів
      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }

      setEditModalOpen(false);
      setEditingProduct(null);
      setEditData({ image: null, imagePreview: null, description: "", originalDescription: "", variants: [], originalVariants: [] });
    } catch (error) {
      console.error("Error saving edit:", error);
      notify.error("Помилка", "Помилка збереження. Спробуйте ще раз.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleWriteOff = async () => {
    if (!writeOffTarget || !onWriteOff || !writeOffData.selectedVariant) return;

    // Валідація кількості
    const qty = typeof writeOffData.qty === 'string' 
      ? (writeOffData.qty === '' ? 0 : parseInt(writeOffData.qty, 10))
      : writeOffData.qty;

    if (!qty || qty < 1) {
      notify.warning("Увага", "Будь ласка, введіть кількість для списання (мінімум 1)");
      return;
    }

    setIsWritingOff(true);
    try {
      // Знаходимо вибраний варіант
      const selectedVariant = writeOffTarget.variants.find(
        v => v.size === writeOffData.selectedVariant
      );

      if (!selectedVariant) {
        return;
      }

      // Parse length from size string (e.g., "70 см" -> 70)
      // Переконуємося, що length - це число
      const length = typeof selectedVariant.length === 'number'
        ? selectedVariant.length
        : parseInt(String(selectedVariant.length), 10);

      const success = await onWriteOff({
        flowerSlug: writeOffTarget.slug || writeOffTarget.documentId || writeOffTarget.id,
        length,
        qty,
        reason: writeOffData.reason,
        notes: writeOffData.notes || undefined,
      });

      if (success) {
        setWriteOffModalOpen(false);
        resetWriteOffForm();
      }
    } finally {
      setIsWritingOff(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setDeleteTarget(product);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget?.documentId) return;

    setIsDeleting(true);
    try {
      const STRAPI_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337").replace(/\/$/, '');
      const authHeaders = getAuthHeaders();

      const response = await fetch(`${STRAPI_URL}/api/flowers/${deleteTarget.documentId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Помилка видалення:", errorText);
        notify.error("Помилка", "Помилка видалення товару. Спробуйте ще раз.");
        return;
      }

      // Логуємо видалення товару
      if (onLogActivity) {
        // Рахуємо загальну кількість по всіх варіантах
        const totalStock = deleteTarget.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

        onLogActivity('productDelete', {
          productName: deleteTarget.name,
          productId: deleteTarget.documentId,
          variantsCount: deleteTarget.variants.length,
          totalStock: totalStock, // Буде враховано як списання якщо > 0
          variants: deleteTarget.variants.map(v => ({
            length: v.length,
            price: v.price,
            stock: v.stock,
          })),
        });
      }

      notify.success("Успіх", `Товар "${deleteTarget.name}" успішно видалено`);

      // Оновити список продуктів
      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }

      setDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      notify.error("Помилка", "Помилка видалення. Спробуйте ще раз.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Завантажити список квітів при відкритті модального вікна
  useEffect(() => {
    if (open && addMode === "manual") {
      getFlowers({ fresh: true }).then(setAvailableFlowers);
    }
  }, [open, addMode]);

  // Пошук квітів
  useEffect(() => {
    if (flowerSearchQuery.trim()) {
      searchFlowers(flowerSearchQuery).then(setAvailableFlowers);
    } else {
      getFlowers({ fresh: true }).then(setAvailableFlowers);
    }
  }, [flowerSearchQuery]);

  const handleSave = async () => {
    if (!draft.flowerName.trim()) {
      notify.warning("Увага", "Будь ласка, вкажіть назву квітки");
      return;
    }

    if (draft.variants.length === 0) {
      notify.warning("Увага", "Будь ласка, додайте хоча б один варіант");
      return;
    }

    // Валідація варіантів
    for (const variant of draft.variants) {
      if (!variant.length || !variant.price || !variant.stock) {
        notify.warning("Увага", "Будь ласка, заповніть всі поля для варіантів");
        return;
      }
    }

    setIsSaving(true);
    try {
      const STRAPI_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337").replace(/\/$/, '');
      const API_URL = `${STRAPI_URL}/api`;
      const authHeaders = getAuthHeaders();

      // 1. Створити або оновити квітку
      let flowerId: number;
      let flowerDocumentId: string;
      let flowerSlug: string | undefined;

      // Спочатку завантажити зображення, якщо є
      let imageId: number | null = null;
      let imageUploadError: string | null = null;
      if (draft.image) {
        const imageFormData = new FormData();
        imageFormData.append("files", draft.image);

        // Для FormData не передаємо Content-Type - браузер встановить автоматично
        const uploadHeaders: Record<string, string> = {};
        if (typeof authHeaders === 'object' && authHeaders !== null && 'Authorization' in authHeaders) {
          uploadHeaders.Authorization = (authHeaders as Record<string, string>).Authorization;
        }

        try {
          const imageResponse = await fetch(`${STRAPI_URL}/api/upload`, {
            method: "POST",
            headers: uploadHeaders,
            body: imageFormData,
          });
          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            imageId = imageData[0]?.id || null;
            if (!imageId) {
              imageUploadError = "Зображення завантажено, але не отримано ID";
            }
          } else {
            const errorText = await imageResponse.text();
            console.error("Помилка завантаження зображення:", errorText);
            imageUploadError = `Помилка завантаження: ${imageResponse.status}`;
          }
        } catch (err) {
          console.error("Помилка завантаження зображення:", err);
          imageUploadError = err instanceof Error ? err.message : "Невідома помилка";
        }
      }

      // Попередити користувача про помилку завантаження зображення
      if (imageUploadError) {
        const continueWithoutImage = window.confirm(
          `${imageUploadError}\n\nПродовжити створення товару без зображення?`
        );
        if (!continueWithoutImage) {
          setIsSaving(false);
          return;
        }
      }

      if (draft.flowerId) {
        // Оновити існуючу квітку
        const updateData: any = {
          name: draft.flowerName,
        };
        if (imageId) {
          updateData.image = imageId;
        }

        const response = await fetch(`${API_URL}/flowers/${draft.flowerId}`, {
          method: "PUT",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: updateData,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Помилка оновлення квітки: ${errorText}`);
        }
        const flowerData = await response.json();
        flowerId = flowerData.data.id;
        flowerDocumentId = flowerData.data.documentId;
        flowerSlug = flowerData.data.slug;
      } else {
        // Створити нову квітку
        // Генеруємо slug з назви
        const generateSlug = (name: string): string => {
          const translitMap: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ie',
            'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'i', 'й': 'i', 'к': 'k', 'л': 'l',
            'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '',
            'ю': 'iu', 'я': 'ia', "'": '', 'ъ': '', 'ы': 'y', 'э': 'e',
          };
          return name
            .toLowerCase()
            .split('')
            .map(char => translitMap[char] || char)
            .join('')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 100);
        };

        const slug = generateSlug(draft.flowerName) + '-' + Date.now();

        const createData: any = {
          name: draft.flowerName,
          slug: slug,
          locale: "en", // Strapi v5 uses "en" as default locale
          publishedAt: new Date().toISOString(),
        };
        if (imageId) {
          createData.image = imageId;
        }

        const response = await fetch(`${API_URL}/flowers`, {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: createData,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Помилка створення квітки: ${errorText}`);
        }
        const flowerData = await response.json();
        flowerId = flowerData.data.id;
        flowerDocumentId = flowerData.data.documentId;
        flowerSlug = flowerData.data.slug;

        console.log("🌸 Flower created:", {
          id: flowerData.data.id,
          documentId: flowerData.data.documentId,
          name: flowerData.data.name,
          slug: flowerData.data.slug,
        });
      }

      // 2. Створити варіанти
      for (const variant of draft.variants) {
        const length = parseInt(variant.length);
        const price = parseFloat(variant.price);
        const stock = parseInt(variant.stock);

        if (isNaN(length) || isNaN(price) || isNaN(stock)) {
          continue;
        }

        // Перевірити чи існує варіант (використовуємо documentId для Strapi v5)
        const existingVariantResponse = await fetch(
          `${API_URL}/variants?filters[flower][documentId][$eq]=${flowerDocumentId}&filters[length][$eq]=${length}`,
          { headers: authHeaders }
        );
        const existingVariantData = await existingVariantResponse.json();

        if (existingVariantData.data && existingVariantData.data.length > 0) {
          // Оновити існуючий варіант
          const variantDocumentId = existingVariantData.data[0].documentId;
          const updateResponse = await fetch(`${API_URL}/variants/${variantDocumentId}`, {
            method: "PUT",
            headers: {
              ...authHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                length,
                price,
                stock,
                // Strapi v5: use connect syntax for relations
                flower: {
                  connect: [{ documentId: flowerDocumentId }]
                },
              },
            }),
          });
          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error("Помилка оновлення варіанту:", errorText);
          }
        } else {
          // Створити новий варіант
          const createResponse = await fetch(`${API_URL}/variants`, {
            method: "POST",
            headers: {
              ...authHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                length,
                price,
                stock,
                // Strapi v5: use connect syntax for relations
                flower: {
                  connect: [{ documentId: flowerDocumentId }]
                },
              },
            }),
          });
          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error("Помилка створення варіанту:", errorText);
          } else {
            console.log(`✅ Variant created: ${length}cm for flower ${flowerDocumentId}`);
          }
        }
      }

      // Логуємо створення товару
      if (onLogActivity) {
        onLogActivity('productCreate', {
          productName: draft.flowerName,
          productId: flowerDocumentId,
          variantsCount: draft.variants.length,
          variants: draft.variants.map(v => ({
            length: parseInt(v.length) || 0,
            price: parseFloat(v.price) || 0,
            stock: parseInt(v.stock) || 0,
          })),
        });
      }

      // Сповіщення про успіх
      notify.success("Успіх", `Товар "${draft.flowerName}" успішно створено`);

      // Оновити список продуктів
      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Помилка збереження:", error);
      const errorMessage = error instanceof Error ? error.message : "Невідома помилка";
      notify.error("Помилка збереження", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const totalVariants = products.reduce((acc, p) => acc + p.variants.length, 0);
  const totalPrice = products.reduce(
    (acc, p) => acc + p.variants.reduce((s, v) => s + v.price, 0),
    0
  );
  const avgPrice = totalVariants ? Math.round(totalPrice / totalVariants) : 0;
  const avgStockPerVariant = totalVariants ? Math.round(summary.stock / totalVariants) : 0;
  return (
    <>
    <Card className="admin-card border-none bg-white/90 dark:bg-admin-surface shadow-md">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start justify-between gap-2 sm:block">
          <div>
            <CardTitle className="text-2xl">Управління товарами</CardTitle>
            <CardDescription>Каталог квітів з варіантами висоти, залишками та діями</CardDescription>
          </div>
          {/* Mobile: Export button next to title */}
          <Button variant="outline" className="sm:hidden shrink-0 text-slate-500 dark:text-admin-text-tertiary" onClick={onOpenExport} size="icon" title="Експортувати">
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          {/* Mobile: 50/50 buttons */}
          <div className="flex gap-2 sm:contents">
            <Button variant="outline" onClick={onOpenSupply} className="flex-1 sm:flex-none sm:w-auto bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
              Заплановані закупки
            </Button>
            <Button onClick={() => setOpen(true)} className="flex-1 sm:flex-none sm:w-auto">
              Додати товар
            </Button>
          </div>
          {/* Desktop: Export button */}
          <Button variant="outline" className="hidden sm:flex text-slate-500 dark:text-admin-text-tertiary" onClick={onOpenExport} size="icon" title="Експортувати">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill label="Всього товарів" value={`${summary.totalItems}`} />
          <StatPill label="Загальний запас" value={`${summary.stock} шт`} />
          <StatPill label="Середня ціна варіанта" value={`${avgPrice} грн`} />
          <StatPill label="Середній запас/варіант" value={`${avgStockPerVariant} шт`} />
        </div>
        {/* Сортування */}
        <div className="flex items-center gap-2">
          <Select value={`${sortKey}-${sortDirection}`} onValueChange={(value) => {
            const [key, dir] = value.split('-') as [SortKey, SortDirection];
            setSortKey(key);
            setSortDirection(dir);
          }}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Сортування" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Назва (А-Я)</SelectItem>
              <SelectItem value="name-desc">Назва (Я-А)</SelectItem>
              <SelectItem value="price-asc">Ціна (зростання)</SelectItem>
              <SelectItem value="price-desc">Ціна (спадання)</SelectItem>
              <SelectItem value="stock-asc">Кількість (зростання)</SelectItem>
              <SelectItem value="stock-desc">Кількість (спадання)</SelectItem>
              <SelectItem value="updatedAt-desc">Нові спочатку</SelectItem>
              <SelectItem value="updatedAt-asc">Старі спочатку</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Мобільна карткова версія без горизонтального скролу */}
        <div className="grid gap-3 sm:hidden animate-stagger">
          {sortedProducts.map((product, index) => {
            const total = product.variants.reduce((acc, variant) => acc + variant.stock, 0);
            // Використовуємо стабільний ключ: documentId, slug або комбінацію з індексом
            const key = product.documentId || product.slug || `product-fallback-${index}-${product.name}`;
            return (
              <Card key={key} className="admin-card border border-slate-100 dark:border-admin-border bg-white/90 dark:bg-admin-surface animate-fade-in">
                <CardContent className="flex gap-3 p-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-admin-surface">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-admin-text-primary">{product.name}</p>
                        <p className="text-xs text-slate-500 dark:text-admin-text-tertiary">Загальний запас: {total} шт</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          aria-label="Редагувати товар" 
                          title="Редагувати товар"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(product);
                          }}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Списати товар"
                          title="Списати товар"
                          onClick={(e) => {
                            e.stopPropagation();
                            openWriteOffModal(product);
                          }}
                          className="h-8 w-8"
                        >
                          <PackageMinus className="h-4 w-4 text-amber-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Видалити товар"
                          title="Видалити товар"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(product);
                          }}
                          className="h-8 w-8"
                        >
                          <Trash className="h-4 w-4 text-rose-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <Badge
                          key={variant.size}
                          className={cn("text-xs px-2.5 py-1 w-auto", stockTone(variant.stock))}
                        >
                          {variant.size} · {variant.price} грн · {variant.stock} шт
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Десктопна таблиця */}
        <div className="hidden overflow-x-auto sm:block">
          <Table className="min-w-[56.25rem] overflow-hidden rounded-2xl border border-slate-100 table-border-dark bg-white dark:bg-admin-surface">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 text-center">Назва</TableHead>
                <TableHead className="text-center">Висоти / ціни / кількість</TableHead>
                <TableHead className="text-center min-w-[7.5rem] px-6">Загальний запас</TableHead>
                <TableHead className="text-center min-w-[6.5rem] px-4">Оновлено</TableHead>
                <TableHead className="text-center min-w-[11.25rem] px-6">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product, index) => {
                const total = product.variants.reduce((acc, variant) => acc + variant.stock, 0);
                // Використовуємо стабільний ключ: documentId, slug або комбінацію з індексом
                const key = product.documentId || product.slug || `product-fallback-${index}-${product.name}`;
                return (
                  <TableRow key={key} className="align-top">
                    <TableCell className="px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-100 dark:bg-admin-surface">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-admin-text-primary">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="space-y-1">
                      <div className="flex flex-wrap gap-2 max-w-md">
                        {product.variants.map((variant) => (
                          <Badge
                            key={variant.size}
                            className={cn("text-xs px-2.5 py-1 w-auto flex items-center gap-1", stockTone(variant.stock))}
                          >
                            {variant.size} · {variant.price} грн · <Package className="h-3 w-3 shrink-0" /> {variant.stock} шт
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-700 min-w-[7.5rem] px-6 text-center align-middle">{total} шт</TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-admin-text-tertiary min-w-[7.5rem] px-4 text-center align-middle">
                      {product.updatedAt
                        ? (
                          <div className="flex flex-col">
                            <span>{new Date(product.updatedAt).toLocaleDateString('uk-UA', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                            })}</span>
                            <span className="text-slate-400">{new Date(product.updatedAt).toLocaleTimeString('uk-UA', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}</span>
                          </div>
                        )
                        : '—'}
                    </TableCell>
                    <TableCell className="min-w-[11.25rem] px-6 text-center align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Показувати на сайті"
                          title="Показувати на сайті"
                          onClick={() => {
                            const productUrl = `/catalog/${product.slug || product.documentId}`;
                            if (productUrl !== '/catalog/') {
                              window.open(productUrl, '_blank');
                            }
                          }}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Редагувати товар"
                          title="Редагувати товар"
                          onClick={() => openEditModal(product)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Списати товар"
                          title="Списати товар"
                          onClick={() => openWriteOffModal(product)}
                          className="h-8 w-8"
                        >
                          <PackageMinus className="h-4 w-4 text-amber-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Видалити товар"
                          title="Видалити товар"
                          onClick={() => openDeleteModal(product)}
                          className="h-8 w-8"
                        >
                          <Trash className="h-4 w-4 text-rose-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {hasLowStock && (
          <div className="rounded-2xl border border-rose-200/80 dark:border-rose-700/40 bg-gradient-to-r from-rose-50 via-rose-50/80 to-red-50/60 dark:from-rose-900/30 dark:via-rose-900/20 dark:to-red-900/10 p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-800/40 shadow-sm">
                  <LowStockIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-rose-900 dark:text-rose-200">Низькі залишки</p>
                  <div className="flex flex-wrap gap-2">
                    {lowStockItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-700/60 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-300 shadow-sm"
                      >
                        <span>{item.productName}</span>
                        <span className="text-rose-500 dark:text-rose-400">·</span>
                        <span>{item.variant}</span>
                        <span className="text-rose-500 dark:text-rose-400">·</span>
                        <span className="font-bold">{item.stock} шт</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="shrink-0 border-rose-300 dark:border-rose-600 bg-white/60 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-800/50 hover:border-rose-400 dark:hover:border-rose-500"
                onClick={onOpenSupply}
              >
                Запланувати закупку
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    <Modal
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
      title="Додати товар"
      description="Створіть нову позицію: назва, висота/розмір, ціна та кількість."
      footer={
        <>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Скасувати
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !draft.flowerName || draft.variants.length === 0}>
            {isSaving ? "Збереження..." : "Зберегти"}
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
                      getFlowers({ fresh: true }).then(setAvailableFlowers);
                    }
                  }}
                />
                {flowerSearchQuery && availableFlowers.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-admin-border bg-white dark:bg-admin-surface">
                    {availableFlowers.map((flower) => (
                      <button
                        key={flower.id}
                        type="button"
                        onClick={() => {
                          // Використовуємо documentId для Strapi v5
                          setDraft((prev) => ({
                            ...prev,
                            flowerId: flower.documentId || flower.id,
                            flowerName: flower.name,
                          }));
                          setFlowerSearchQuery(flower.name);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-admin-surface"
                      >
                        {flower.name}
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

            {/* Завантаження зображення */}
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

            {/* Варіанти */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Розміри</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Додати розмір
                </Button>
              </div>

              {draft.variants.length === 0 ? (
                <p className="text-sm text-slate-500">Додайте хоча б один розмір</p>
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
                        onChange={(e) =>
                          updateDraftVariant(variant.id, "length", e.target.value)
                        }
                        className="flex-1"
              />
              <Input
                type="number"
                placeholder="Ціна, грн"
                        value={variant.price}
                        onChange={(e) =>
                          updateDraftVariant(variant.id, "price", e.target.value)
                        }
                        className="flex-1"
              />
              <Input
                type="number"
                        placeholder="Кількість"
                        value={variant.stock}
                        onChange={(e) =>
                          updateDraftVariant(variant.id, "stock", e.target.value)
                        }
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
                setOpen(false);
                setImportModalOpen(true);
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

    <ImportModal
      open={importModalOpen}
      onOpenChange={setImportModalOpen}
      onSuccess={() => {
        // Оновлюємо список продуктів після успішного імпорту
        if (onRefresh) {
          onRefresh();
        } else {
          // Fallback: перезавантажуємо сторінку, якщо callback не передано
          window.location.reload();
        }
      }}
      onLogActivity={onLogActivity ? (type, details) => onLogActivity(type as any, details as any) : undefined}
    />

    {/* Write-off Modal */}
    <Modal
      open={writeOffModalOpen}
      onOpenChange={(v) => {
        setWriteOffModalOpen(v);
        if (!v) resetWriteOffForm();
      }}
      title="Списання товару"
      description={writeOffTarget ? `Списати "${writeOffTarget.name}"` : ''}
      footer={
        <>
          <Button variant="outline" onClick={() => setWriteOffModalOpen(false)} disabled={isWritingOff}>
            Скасувати
          </Button>
          <Button
            onClick={handleWriteOff}
            disabled={
              isWritingOff || 
              !writeOffTarget || 
              !writeOffData.selectedVariant ||
              writeOffData.qty === '' ||
              (typeof writeOffData.qty === 'number' && (writeOffData.qty < 1 || writeOffData.qty > (writeOffTarget.variants.find(v => v.size === writeOffData.selectedVariant)?.stock || 0)))
            }
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isWritingOff ? 'Списання...' : 'Списати'}
          </Button>
        </>
      }
    >
      {writeOffTarget && (() => {
        const selectedVariant = writeOffTarget.variants.find(
          v => v.size === writeOffData.selectedVariant
        );
        const maxQty = selectedVariant?.stock || 0;

        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 dark:border-admin-border bg-slate-50/60 dark:bg-admin-surface p-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-admin-surface">
                  {writeOffTarget.image ? (
                    <img
                      src={writeOffTarget.image}
                      alt={writeOffTarget.name}
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
                  <p className="font-semibold text-slate-900">{writeOffTarget.name}</p>
                  <p className="text-sm text-slate-600">
                    {writeOffTarget.variants.length} варіантів на складі
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-slate-600">Розмір (варіант)</label>
                <Select
                  value={writeOffData.selectedVariant}
                  onValueChange={(v) => setWriteOffData((d) => ({ ...d, selectedVariant: v, qty: 1 }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть розмір" />
                  </SelectTrigger>
                  <SelectContent>
                    {writeOffTarget.variants.map((variant) => (
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
                  value={writeOffData.qty}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Дозволяємо порожнє значення або число
                    if (value === '') {
                      setWriteOffData((d) => ({ ...d, qty: '' }));
                    } else {
                      const numValue = parseInt(value, 10);
                      if (!isNaN(numValue)) {
                        setWriteOffData((d) => ({ ...d, qty: numValue }));
                      }
                    }
                  }}
                  disabled={!writeOffData.selectedVariant}
                />
                {typeof writeOffData.qty === 'number' && writeOffData.qty > maxQty && (
                  <p className="text-xs text-rose-600">Максимум: {maxQty} шт</p>
                )}
                {writeOffData.qty === '' && (
                  <p className="text-xs text-slate-500">Введіть кількість</p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-slate-600">Причина списання</label>
                <Select
                  value={writeOffData.reason}
                  onValueChange={(v) => setWriteOffData((d) => ({ ...d, reason: v as WriteOffReason }))}
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
                  value={writeOffData.notes}
                  onChange={(e) => setWriteOffData((d) => ({ ...d, notes: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );
      })()}
    </Modal>

    {/* Edit Modal */}
    <Modal
      open={editModalOpen}
      onOpenChange={(v) => {
        setEditModalOpen(v);
        if (!v) {
          setEditingProduct(null);
          setEditData({ image: null, imagePreview: null, description: "", originalDescription: "", variants: [], originalVariants: [] });
        }
      }}
      title="Редагувати товар"
      description={editingProduct ? `Редагування "${editingProduct.name}"` : ""}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={isSavingEdit}>
            Скасувати
          </Button>
          <Button onClick={handleSaveEdit} disabled={isSavingEdit || isLoadingEditData}>
            {isSavingEdit ? "Збереження..." : "Зберегти зміни"}
          </Button>
        </>
      }
    >
      {isLoadingEditData ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-slate-500">Завантаження даних...</div>
        </div>
      ) : editingProduct ? (
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
                  onChange={handleEditImageChange}
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
                onClick={addEditVariant}
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
                              handleEditVariantChange(variant.documentId, "length", value);
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
                            handleEditVariantChange(variant.documentId, "price", value);
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-600">Кількість, шт</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="100"
                        value={variant.stock || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                          if (!isNaN(value)) {
                            handleEditVariantChange(variant.documentId, "stock", value);
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center self-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEditVariant(variant.documentId)}
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
                        onClick={() => {
                          // Відмінити видалення
                          setEditData((prev) => ({
                            ...prev,
                            variants: prev.variants.map((v) =>
                              v.documentId === variant.documentId ? { ...v, isDeleted: false } : v
                            ),
                          }));
                        }}
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

    {/* Delete Confirmation Modal */}
    <Modal
      open={deleteModalOpen}
      onOpenChange={(v) => {
        if (!isDeleting) {
          setDeleteModalOpen(v);
          if (!v) setDeleteTarget(null);
        }
      }}
      title="Видалити товар?"
      description={deleteTarget ? `Ви впевнені, що хочете видалити "${deleteTarget.name}"? Цю дію не можна скасувати.` : ""}
      footer={
        <>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
            Скасувати
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting || !deleteTarget}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {isDeleting ? "Видалення..." : "Видалити"}
          </Button>
        </>
      }
    >
      {deleteTarget && (
        <div className="rounded-xl border border-rose-100 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-900/20 p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-admin-surface">
              {deleteTarget.image ? (
                <img
                  src={deleteTarget.image}
                  alt={deleteTarget.name}
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
              <p className="font-semibold text-slate-900 dark:text-admin-text-primary">{deleteTarget.name}</p>
              <p className="text-sm text-rose-600">
                {deleteTarget.variants.length} варіантів буде видалено
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
    </>
  );
}

