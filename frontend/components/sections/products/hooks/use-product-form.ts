import { useState, useEffect } from "react";
import type { Product } from "@/lib/types";
import type { ProductDraft, EditData, WriteOffData, WriteOffReason, NotifyFunctions } from "../types";
import { getFlowers, searchFlowers, getFlowerForEdit, updateFlower, updateVariant } from "@/lib/strapi";
import { getAuthHeaders } from "@/lib/auth";
import type { StrapiBlock } from "@/lib/strapi-types";

const initialDraft: ProductDraft = {
  flowerId: null,
  flowerName: "",
  image: null,
  imagePreview: null,
  variants: [],
};

const initialEditData: EditData = {
  image: null,
  imagePreview: null,
  description: "",
  originalDescription: "",
  variants: [],
  originalVariants: [],
};

const initialWriteOffData: WriteOffData = {
  selectedVariant: '',
  qty: 1,
  reason: 'damage',
  notes: '',
};

type UseProductFormProps = {
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
  notify: NotifyFunctions;
};

export function useProductForm({ onRefresh, onLogActivity, notify }: UseProductFormProps) {
  // Add product state
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(initialDraft);
  const [addMode, setAddMode] = useState<"manual" | "invoice">("manual");
  const [isSaving, setIsSaving] = useState(false);
  const [flowerSearchQuery, setFlowerSearchQuery] = useState("");
  const [availableFlowers, setAvailableFlowers] = useState<Product[]>([]);

  // Edit product state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editData, setEditData] = useState<EditData>(initialEditData);
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete product state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Write-off state
  const [writeOffModalOpen, setWriteOffModalOpen] = useState(false);
  const [writeOffTarget, setWriteOffTarget] = useState<Product | null>(null);
  const [writeOffData, setWriteOffData] = useState<WriteOffData>(initialWriteOffData);
  const [isWritingOff, setIsWritingOff] = useState(false);

  // Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Load flowers when modal opens
  useEffect(() => {
    if (open && addMode === "manual") {
      getFlowers({ fresh: true }).then(setAvailableFlowers);
    }
  }, [open, addMode]);

  // Search flowers
  useEffect(() => {
    if (flowerSearchQuery.trim()) {
      searchFlowers(flowerSearchQuery).then(setAvailableFlowers);
    } else {
      getFlowers({ fresh: true }).then(setAvailableFlowers);
    }
  }, [flowerSearchQuery]);

  // === Add Product Functions ===
  const resetForm = () => {
    setDraft(initialDraft);
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

  const handleSave = async () => {
    if (!draft.flowerName.trim()) {
      notify.warning("Uvaha", "Bud laska, vkazhit nazvu kvitky");
      return;
    }

    if (draft.variants.length === 0) {
      notify.warning("Uvaha", "Bud laska, dodajte khocha b odyn variant");
      return;
    }

    // Validate variants
    for (const variant of draft.variants) {
      if (!variant.length || !variant.price || !variant.stock) {
        notify.warning("Uvaha", "Bud laska, zapovnit vsi polia dlia variantiv");
        return;
      }
    }

    setIsSaving(true);
    try {
      const STRAPI_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337").replace(/\/$/, '');
      const API_URL = `${STRAPI_URL}/api`;
      const authHeaders = getAuthHeaders();

      let flowerId: number;
      let flowerDocumentId: string;
      let flowerSlug: string | undefined;

      // Upload image if exists
      let imageId: number | null = null;
      let imageUploadError: string | null = null;
      if (draft.image) {
        const imageFormData = new FormData();
        imageFormData.append("files", draft.image);

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
              imageUploadError = "Zobrazhennia zavantazheno, ale ne otrymano ID";
            }
          } else {
            const errorText = await imageResponse.text();
            console.error("Pomylka zavantazhennia zobrazhennia:", errorText);
            imageUploadError = `Pomylka zavantazhennia: ${imageResponse.status}`;
          }
        } catch (err) {
          console.error("Pomylka zavantazhennia zobrazhennia:", err);
          imageUploadError = err instanceof Error ? err.message : "Nevidoma pomylka";
        }
      }

      if (imageUploadError) {
        const continueWithoutImage = window.confirm(
          `${imageUploadError}\n\nProdovzhyty stvorennia tovaru bez zobrazhennia?`
        );
        if (!continueWithoutImage) {
          setIsSaving(false);
          return;
        }
      }

      if (draft.flowerId) {
        // Update existing flower
        const updateData: Record<string, unknown> = {
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
          throw new Error(`Pomylka onovlennia kvitky: ${errorText}`);
        }
        const flowerData = await response.json();
        flowerId = flowerData.data.id;
        flowerDocumentId = flowerData.data.documentId;
        flowerSlug = flowerData.data.slug;
      } else {
        // Create new flower
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

        const createData: Record<string, unknown> = {
          name: draft.flowerName,
          slug: slug,
          locale: "en",
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
          throw new Error(`Pomylka stvorennia kvitky: ${errorText}`);
        }
        const flowerData = await response.json();
        flowerId = flowerData.data.id;
        flowerDocumentId = flowerData.data.documentId;
        flowerSlug = flowerData.data.slug;

        console.log("Flower created:", {
          id: flowerData.data.id,
          documentId: flowerData.data.documentId,
          name: flowerData.data.name,
          slug: flowerData.data.slug,
        });
      }

      // Create variants
      for (const variant of draft.variants) {
        const length = parseInt(variant.length);
        const price = parseFloat(variant.price);
        const stock = parseInt(variant.stock);

        if (isNaN(length) || isNaN(price) || isNaN(stock)) {
          continue;
        }

        // Check if variant exists
        const existingVariantResponse = await fetch(
          `${API_URL}/variants?filters[flower][documentId][$eq]=${flowerDocumentId}&filters[length][$eq]=${length}`,
          { headers: authHeaders }
        );
        const existingVariantData = await existingVariantResponse.json();

        if (existingVariantData.data && existingVariantData.data.length > 0) {
          // Update existing variant
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
                flower: {
                  connect: [{ documentId: flowerDocumentId }]
                },
              },
            }),
          });
          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error("Pomylka onovlennia variantu:", errorText);
          }
        } else {
          // Create new variant
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
                flower: {
                  connect: [{ documentId: flowerDocumentId }]
                },
              },
            }),
          });
          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error("Pomylka stvorennia variantu:", errorText);
          } else {
            console.log(`Variant created: ${length}cm for flower ${flowerDocumentId}`);
          }
        }
      }

      // Log product creation
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

      notify.success("Uspikh", `Tovar "${draft.flowerName}" uspishno stvoreno`);

      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Pomylka zberezhennia:", error);
      const errorMessage = error instanceof Error ? error.message : "Nevidoma pomylka";
      notify.error("Pomylka zberezhennia", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // === Edit Product Functions ===
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
      const variant = prev.variants.find(v => v.documentId === documentId);
      if (variant?.isNew) {
        return {
          ...prev,
          variants: prev.variants.filter((v) => v.documentId !== documentId),
        };
      }
      return {
        ...prev,
        variants: prev.variants.map((v) =>
          v.documentId === documentId ? { ...v, isDeleted: true } : v
        ),
      };
    });
  };

  const undoDeleteVariant = (documentId: string) => {
    setEditData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.documentId === documentId ? { ...v, isDeleted: false } : v
      ),
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingProduct?.documentId) return;

    setIsSavingEdit(true);
    try {
      const STRAPI_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337").replace(/\/$/, '');
      const authHeaders = getAuthHeaders();

      // 1. Upload new image if exists
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
              imageUploadError = "Zobrazhennia zavantazheno, ale ne otrymano ID";
            }
          } else {
            const errorText = await imageResponse.text();
            console.error("Failed to upload image:", errorText);
            imageUploadError = `Pomylka zavantazhennia zobrazhennia: ${imageResponse.status}`;
          }
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          imageUploadError = imageError instanceof Error ? imageError.message : "Nevidoma pomylka zavantazhennia";
        }
      }

      if (imageUploadError) {
        const continueWithoutImage = window.confirm(
          `${imageUploadError}\n\nProdovzhyty zberezhennia bez zminy zobrazhennia?`
        );
        if (!continueWithoutImage) {
          setIsSavingEdit(false);
          return;
        }
      }

      // 2. Convert description to StrapiBlock[]
      const descriptionBlocks: StrapiBlock[] = editData.description
        ? editData.description.split("\n").map((line) => ({
            type: "paragraph",
            children: [{ type: "text", text: line }],
          }))
        : [];

      // 3. Update flower
      let updateResult;
      try {
        const updateData: {
          description: StrapiBlock[];
          imageId?: number;
        } = {
          description: descriptionBlocks,
        };

        if (imageId !== null) {
          updateData.imageId = imageId;
        }

        updateResult = await updateFlower(editingProduct.documentId, updateData);
      } catch (error) {
        console.error("Error calling updateFlower:", error);
        notify.error("Pomylka onovlennia", error instanceof Error ? error.message : "Nevidoma pomylka");
        return;
      }

      if (!updateResult || !updateResult.success) {
        const errorMessage = updateResult?.error?.message || "Nevidoma pomylka onovlennia kvitky";
        notify.error("Pomylka onovlennia", errorMessage);
        return;
      }

      // 4. Delete marked variants
      const variantErrors: string[] = [];
      const deletedVariants = editData.variants.filter(v => v.isDeleted && !v.isNew);

      for (const variant of deletedVariants) {
        try {
          const deleteResponse = await fetch(`${STRAPI_URL}/api/variants/${variant.documentId}`, {
            method: "DELETE",
            headers: authHeaders,
          });

          if (deleteResponse.ok) {
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
            variantErrors.push(`Vydalennia variantu ${variant.length} sm: ${errorData.error?.message || "Pomylka vydalennia"}`);
          }
        } catch (deleteError) {
          const errorMessage = deleteError instanceof Error ? deleteError.message : "Nevidoma pomylka";
          variantErrors.push(`Vydalennia variantu ${variant.length} sm: ${errorMessage}`);
        }
      }

      // 5. Update existing variants and create new ones
      const activeVariants = editData.variants.filter(v => !v.isDeleted);
      const changesLog: Record<string, { from: unknown; to: unknown }> = {};

      if (editData.description !== editData.originalDescription) {
        const fromDesc = editData.originalDescription.trim() || '(pusto)';
        const toDesc = editData.description.trim() || '(pusto)';
        changesLog['Opys'] = { from: fromDesc.slice(0, 50) + (fromDesc.length > 50 ? '...' : ''), to: toDesc.slice(0, 50) + (toDesc.length > 50 ? '...' : '') };
      }

      if (editData.image) {
        changesLog['Zobrazhennia'] = { from: 'stare', to: 'nove' };
      }

      for (const variant of activeVariants) {
        try {
          if (variant.isNew) {
            if (!variant.length || variant.length <= 0) {
              variantErrors.push(`Novyi variant: dovzhyna povynna buty bilshe 0`);
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
                  flower: {
                    connect: [{ documentId: editingProduct.documentId }]
                  },
                },
              }),
            });

            if (!createResponse.ok) {
              const errorData = await createResponse.json().catch(() => ({}));
              variantErrors.push(`Novyi variant ${variant.length} sm: ${errorData.error?.message || "Pomylka stvorennia"}`);
            } else {
              changesLog[`Novyi variant ${variant.length} sm`] = { from: '-', to: `${variant.stock} sht, ${variant.price} hrn` };
            }
          } else {
            const originalVariant = editData.originalVariants.find(ov => ov.documentId === variant.documentId);

            const variantResult = await updateVariant(variant.documentId, {
              price: variant.price,
              stock: variant.stock,
            });

            if (!variantResult || !variantResult.success) {
              const errorMessage = variantResult?.error?.message || variantResult?.error?.code || "Nevidoma pomylka";
              variantErrors.push(`Variant ${variant.length} sm: ${errorMessage}`);
            } else if (originalVariant) {
              if (originalVariant.stock !== variant.stock) {
                changesLog[`${variant.length} sm - kilkist`] = { from: originalVariant.stock, to: variant.stock };
              }
              if (originalVariant.price !== variant.price) {
                changesLog[`${variant.length} sm - tsina`] = { from: originalVariant.price, to: variant.price };
              }
            }
          }
        } catch (variantError) {
          const errorMessage = variantError instanceof Error ? variantError.message : "Nevidoma pomylka";
          variantErrors.push(`Variant ${variant.length} sm: ${errorMessage}`);
        }
      }

      if (onLogActivity && Object.keys(changesLog).length > 0) {
        onLogActivity('productEdit', {
          productName: editingProduct.name,
          productId: editingProduct.documentId,
          changes: changesLog,
        });
      }

      if (variantErrors.length > 0) {
        notify.warning("Uvaha", `Deiaki varianty ne vdalos obrobyty: ${variantErrors.join(", ")}`);
      } else {
        notify.success("Zberezheno", "Zminy uspishno zberezheno");
      }

      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }

      setEditModalOpen(false);
      setEditingProduct(null);
      setEditData(initialEditData);
    } catch (error) {
      console.error("Error saving edit:", error);
      notify.error("Pomylka", "Pomylka zberezhennia. Sprobuyte shche raz.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // === Delete Product Functions ===
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
        console.error("Pomylka vydalennia:", errorText);
        notify.error("Pomylka", "Pomylka vydalennia tovaru. Sprobuyte shche raz.");
        return;
      }

      if (onLogActivity) {
        const totalStock = deleteTarget.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

        onLogActivity('productDelete', {
          productName: deleteTarget.name,
          productId: deleteTarget.documentId,
          variantsCount: deleteTarget.variants.length,
          totalStock: totalStock,
          variants: deleteTarget.variants.map(v => ({
            length: v.length,
            price: v.price,
            stock: v.stock,
          })),
        });
      }

      notify.success("Uspikh", `Tovar "${deleteTarget.name}" uspishno vydaleno`);

      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }

      setDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      notify.error("Pomylka", "Pomylka vydalennia. Sprobuyte shche raz.");
    } finally {
      setIsDeleting(false);
    }
  };

  // === Write-off Functions ===
  const resetWriteOffForm = () => {
    setWriteOffData(initialWriteOffData);
    setWriteOffTarget(null);
  };

  const openWriteOffModal = (product: Product) => {
    setWriteOffTarget(product);
    const firstVariant = product.variants.length > 0 ? product.variants[0].size : '';
    setWriteOffData({ selectedVariant: firstVariant, qty: 1, reason: 'damage', notes: '' });
    setWriteOffModalOpen(true);
  };

  return {
    // Add product
    open,
    setOpen,
    draft,
    setDraft,
    addMode,
    setAddMode,
    isSaving,
    flowerSearchQuery,
    setFlowerSearchQuery,
    availableFlowers,
    resetForm,
    addVariant,
    removeVariant,
    updateDraftVariant,
    handleImageChange,
    handleSave,

    // Import modal
    importModalOpen,
    setImportModalOpen,

    // Edit product
    editModalOpen,
    setEditModalOpen,
    editingProduct,
    setEditingProduct,
    editData,
    setEditData,
    isLoadingEditData,
    isSavingEdit,
    openEditModal,
    handleEditImageChange,
    handleEditVariantChange,
    addEditVariant,
    removeEditVariant,
    undoDeleteVariant,
    handleSaveEdit,

    // Delete product
    deleteModalOpen,
    setDeleteModalOpen,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    openDeleteModal,
    handleDelete,

    // Write-off
    writeOffModalOpen,
    setWriteOffModalOpen,
    writeOffTarget,
    setWriteOffTarget,
    writeOffData,
    setWriteOffData,
    isWritingOff,
    setIsWritingOff,
    resetWriteOffForm,
    openWriteOffModal,
  };
}
