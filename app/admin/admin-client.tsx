/* eslint-disable @next/next/no-img-element */
"use client";
import { Sidebar } from "@/components/layout/sidebar";
import { Header, MobileMenuButton } from "@/components/layout/header";
import { AnalyticsSection } from "@/components/sections/analytics-section";
import { ClientsSection } from "@/components/sections/clients-section";
import { PosSection } from "@/components/sections/pos-section";
import { ProductsSection } from "@/components/sections/products-section";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertToast } from "@/components/ui/alert-toast";
import {
  brandCard,
  navItems,
  supplyCard,
} from "@/lib/mock-data";
import { CartLine, Product, Variant } from "@/lib/types";
import { useEffect, useLayoutEffect, useMemo, useState, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlannedSupplyModal } from "@/components/ui/planned-supply-modal";
import { ShoppingBag, Download } from "lucide-react";
import { useAlerts } from "@/hooks/use-alerts";
import { generateOperationId } from "@/lib/uuid";
import {
  getCustomers,
  createCustomer,
  deleteCustomer,
  createSale,
  createWriteOff,
  getDashboardAnalytics,
  getFlowers,
} from "@/lib/strapi";
import type { Customer, DashboardData, WriteOffInput } from "@/lib/api-types";

interface AdminClientProps {
  products: Product[];
}

export function AdminClient({ products: initialProducts }: AdminClientProps) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<string>("pos");
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [supplyOpen, setSupplyOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'expected'>('expected');

  // Real data states
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analyticsData, setAnalyticsData] = useState<DashboardData | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Alerts
  const { alerts, showSuccess, showError, dismiss } = useAlerts();

  // Initialize theme from localStorage or system preference
  useLayoutEffect(() => {
    const stored = window.localStorage.getItem("pf-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (stored === "dark" || (!stored && prefersDark)) {
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("pf-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("pf-theme", "light");
    }
    setMounted(true);
  }, []);

  // Fetch customers function
  const fetchCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      showError("Помилка завантаження", "Не вдалося завантажити клієнтів");
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [showError]);

  // Load customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Fetch analytics when tab changes
  useEffect(() => {
    if (tab === "analytics" && !analyticsData) {
      fetchAnalytics();
    }
  }, [tab]);

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const result = await getDashboardAnalytics();
      if (result.success && result.data) {
        setAnalyticsData(result.data);
      } else {
        showError("Помилка аналітики", result.error?.message || "Не вдалося завантажити аналітику");
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      showError("Помилка завантаження", "Не вдалося завантажити аналітику");
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Refresh products after operations
  const refreshProducts = useCallback(async () => {
    try {
      // Використовуємо свіжі дані без кешування
      const data = await getFlowers({ fresh: true });
      setProducts(data);
    } catch (error) {
      console.error("Failed to refresh products:", error);
    }
  }, []);

  // Handle checkout
  const handleCheckout = async () => {
    if (!selectedClient || cart.length === 0) {
      showError("Помилка", "Оберіть клієнта та додайте товари до кошика");
      return;
    }

    setIsCheckingOut(true);
    try {
      const operationId = generateOperationId();
      const result = await createSale({
        operationId,
        customerId: selectedClient,
        items: cart.map((line) => ({
          flowerSlug: line.flowerSlug,
          length: line.length,
          qty: line.qty,
          price: line.price,
          name: line.name,
        })),
        discount,
        paymentStatus: paymentStatus,
      });

      if (result.success) {
        showSuccess(
          result.alert?.title || "Замовлення створено",
          result.alert?.message || "Замовлення успішно оформлено"
        );
        setCart([]);
        setSelectedClient(undefined);
        setDiscount(0);
        setPaymentStatus('expected');
        await refreshProducts();
        await fetchCustomers(); // Оновити дані клієнтів
        // Refresh analytics if needed
        if (analyticsData) {
          fetchAnalytics();
        }
      } else {
        showError(
          result.alert?.title || "Помилка",
          result.alert?.message || result.error?.message || "Не вдалося створити замовлення",
          result.error?.details
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showError("Помилка", "Сталася помилка при оформленні замовлення");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Handle write-off
  const handleWriteOff = async (data: Omit<WriteOffInput, "operationId">) => {
    try {
      const operationId = generateOperationId();
      const result = await createWriteOff({
        operationId,
        ...data,
      });

      if (result.success) {
        showSuccess(
          result.alert?.title || "Товар списано",
          result.alert?.message || "Товар успішно списано зі складу"
        );
        await refreshProducts();
        if (analyticsData) {
          fetchAnalytics();
        }
        return true;
      } else {
        showError(
          result.alert?.title || "Помилка списання",
          result.alert?.message || result.error?.message || "Не вдалося списати товар",
          result.error?.details
        );
        return false;
      }
    } catch (error) {
      console.error("Write-off error:", error);
      showError("Помилка", "Сталася помилка при списанні товару");
      return false;
    }
  };

  // Handle add customer
  const handleAddCustomer = async (data: { name: string; phone: string; email: string; address: string }) => {
    try {
      await createCustomer({
        ...data,
        type: 'Regular',  // Default type for new customers
      });
      showSuccess("Клієнта додано", "Новий клієнт успішно створений");
      await fetchCustomers();
    } catch (error) {
      console.error("Create customer error:", error);
      showError("Помилка", "Не вдалося створити клієнта");
      throw error;
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async (documentId: string) => {
    try {
      const result = await deleteCustomer(documentId);
      if (result.success) {
        showSuccess("Клієнта видалено", "Клієнт успішно видалений");
        await fetchCustomers();
      } else {
        showError(
          "Помилка видалення",
          result.error?.message || "Не вдалося видалити клієнта"
        );
        throw new Error(result.error?.message || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Delete customer error:", error);
      showError("Помилка", "Не вдалося видалити клієнта");
      throw error;
    }
  };

  // Convert customers to Client format for PosSection
  const clientsForPos = useMemo(() => {
    return customers.map((c) => ({
      id: c.documentId,
      name: c.name,
      contact: c.phone || "",
      email: c.email || "",
      city: c.address || "",
      orders: c.orderCount,
      spent: c.totalSpent,
      lastOrder: "",
      isVip: c.type === "VIP",
    }));
  }, [customers]);

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    return products.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const summary = useMemo(() => {
    const totalItems = products.length;
    const stock = products.reduce(
      (acc, p) => acc + p.variants.reduce((s, v) => s + v.stock, 0),
      0
    );
    return { totalItems, stock };
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.qty, 0),
    [cart]
  );

  const addToCart = (product: Product, variant: Variant) => {
    const id = `${product.id}-${variant.length}`;
    setCart((current) => {
      const existing = current.find((line) => line.id === id);
      if (existing) {
        return current.map((line) =>
          line.id === id ? { ...line, qty: line.qty + 25 } : line
        );
      }
      return [
        ...current,
        {
          id,
          name: product.name,
          size: variant.size,
          price: variant.price,
          qty: 25,
          image: product.image,
          flowerSlug: product.id,  // product.id is the slug
          length: variant.length,
        },
      ];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((line) => (line.id === id ? { ...line, qty: Math.max(1, line.qty + delta) } : line))
        .filter((line) => line.qty > 0)
    );
  };

  const removeLine = (id: string) => {
    setCart((current) => current.filter((line) => line.id !== id));
  };

  // Уникаємо hydration mismatch - рендеримо тільки після монтування
  if (!mounted) {
    return (
      <div className="admin-panel flex min-h-screen w-full items-center justify-center">
        <div className="text-admin-text-secondary">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="admin-panel flex min-h-screen w-full">
      {/* Фіксований сайдбар на планшеті/ПК */}
      <aside className="admin-surface fixed left-0 top-0 hidden h-screen w-64 border-r sm:flex admin-optimized">
        <div className="h-full w-full overflow-y-auto p-4">
          <Sidebar
            navItems={navItems}
            active={tab}
            onChange={setTab}
            brand={brandCard}
            supplyCard={supplyCard}
            onOpenSupply={() => setSupplyOpen(true)}
          />
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-col gap-5 px-3 py-4 sm:ml-64 sm:px-6 lg:px-8">
        {/* Мобільний хедер з меню і кошиком */}
        <div className="flex items-center justify-between sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <MobileMenuButton />
            </SheetTrigger>
            <SheetContent side="left" className="w-80" suppressHydrationWarning>
              <VisuallyHidden asChild>
                <Dialog.Title>Меню</Dialog.Title>
              </VisuallyHidden>
              <Sidebar
                navItems={navItems}
                active={tab}
                onChange={setTab}
                brand={brandCard}
                supplyCard={supplyCard}
                onOpenSupply={() => setSupplyOpen(true)}
              />
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="sm"
                className="relative rounded-full"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Кошик
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white dark:bg-admin-surface px-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 admin-surface" suppressHydrationWarning>
              <VisuallyHidden asChild>
                <Dialog.Title>Кошик</Dialog.Title>
              </VisuallyHidden>
              <PosSection
                products={filteredProducts}
                clients={clientsForPos}
                search={search}
                onSearch={setSearch}
                selectedClient={selectedClient}
                onClientChange={setSelectedClient}
                cart={cart}
                onAdd={addToCart}
                onUpdateQty={updateQty}
                onRemove={removeLine}
                cartTotal={cartTotal}
                onCheckout={handleCheckout}
                isCheckingOut={isCheckingOut}
                renderOnlyCart
                paymentStatus={paymentStatus}
                onPaymentStatusChange={setPaymentStatus}
              />
            </SheetContent>
          </Sheet>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-5" suppressHydrationWarning>
          <TabsList className="hidden sm:hidden">
            {navItems.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="space-y-5">
            <TabsContent value="pos" className="space-y-5">
              <PosSection
                products={filteredProducts}
                clients={clientsForPos}
                search={search}
                onSearch={setSearch}
                selectedClient={selectedClient}
                onClientChange={setSelectedClient}
                cart={cart}
                onAdd={addToCart}
                onUpdateQty={updateQty}
                onRemove={removeLine}
                cartTotal={cartTotal}
                onCheckout={handleCheckout}
                isCheckingOut={isCheckingOut}
                paymentStatus={paymentStatus}
                onPaymentStatusChange={setPaymentStatus}
              />
            </TabsContent>

            <TabsContent value="products" className="space-y-5">
              <ProductsSection
                summary={summary}
                products={products}
                onOpenSupply={() => setSupplyOpen(true)}
                onOpenExport={() => setExportModalOpen(true)}
                onWriteOff={handleWriteOff}
                onRefresh={refreshProducts}
              />
            </TabsContent>

            <TabsContent value="clients" className="space-y-5">
              <ClientsSection
                customers={customers}
                isLoading={isLoadingCustomers}
                onOpenExport={() => setExportModalOpen(true)}
                onAddCustomer={handleAddCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-5">
              <AnalyticsSection
                data={analyticsData}
                isLoading={isLoadingAnalytics}
                onRefresh={fetchAnalytics}
                onOpenExport={() => setExportModalOpen(true)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <PlannedSupplyModal open={supplyOpen} onOpenChange={setSupplyOpen} />

      <Modal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        title="Експорт даних"
        description="Виберіть формат, щоб експортувати поточну вкладку."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>
              Закрити
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setExportModalOpen(false)}>
              <Download className="mr-2 h-4 w-4" />
              Експортувати
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Оберіть формат файлу:</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button variant="outline">CSV</Button>
            <Button variant="outline">XLSX</Button>
            <Button variant="outline">PDF</Button>
          </div>
          <p className="text-xs text-slate-500">
            Дані експортуються для поточної вкладки (POS / Товари / Клієнти / Аналітика).
          </p>
        </div>
      </Modal>

      {/* Alert Toast Notifications */}
      <AlertToast alerts={alerts} onDismiss={dismiss} />
    </div>
  );
}



