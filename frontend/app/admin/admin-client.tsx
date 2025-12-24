/* eslint-disable @next/next/no-img-element */
"use client";
import { Sidebar } from "@/components/layout/sidebar";
import { Header, MobileMenuButton } from "@/components/layout/header";
import { AnalyticsSection } from "@/components/sections/analytics-section";
import { ClientsSection } from "@/components/sections/clients-section";
import { HistorySection } from "@/components/sections/history-section";
import { PosSection } from "@/components/sections/pos-section";
import { ProductsSection } from "@/components/sections/products-section";
import { TodoSection } from "@/components/sections/todo-section";
import { ArticlesSection } from "@/components/sections/articles-section";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlannedSupplyModal } from "@/components/ui/planned-supply-modal";
import { ShoppingBag } from "lucide-react";
import { exportProducts, exportClients, exportAnalytics, exportShift } from "@/lib/export";
import { useAlerts } from "@/hooks/use-alerts";
import { useActivityLog } from "@/hooks/use-activity-log";
import { generateOperationId } from "@/lib/uuid";
import {
  getCustomers,
  createCustomer,
  deleteCustomer,
  createSale,
  createWriteOff,
  getDashboardAnalytics,
  getFlowers,
  closeShift as closeShiftApi,
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
  const [discount, setDiscount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'expected'>('expected');
  const [posComment, setPosComment] = useState<string>('');

  // Real data states
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analyticsData, setAnalyticsData] = useState<DashboardData | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Alerts
  const { alerts, showSuccess, showError, showWarning, dismiss } = useAlerts();

  // Activity Log for shift history
  const {
    activities,
    shiftStartedAt,
    summary: shiftSummary,
    logActivity,
    refreshActivities,
    isLoading: isLoadingShift,
  } = useActivityLog();
  const [isClosingShift, setIsClosingShift] = useState(false);

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
        notes: posComment || undefined,
      });

      if (result.success) {
        // Log activity for shift history
        const customerName = customers.find(c => c.documentId === selectedClient)?.name || 'Невідомий';
        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0) - discount;
        logActivity('sale', {
          customerName,
          customerId: selectedClient,
          items: cart.map((line) => ({
            name: line.name,
            size: line.size,
            qty: line.qty,
            price: line.price,
          })),
          totalAmount,
          discount,
          paymentStatus,
          notes: posComment || undefined,
        });

        showSuccess(
          result.alert?.title || "Замовлення створено",
          result.alert?.message || "Замовлення успішно оформлено"
        );
        setCart([]);
        setSelectedClient(undefined);
        setDiscount(0);
        setPaymentStatus('expected');
        setPosComment('');
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
        // Log activity for shift history
        const flower = products.find(p => p.id === data.flowerSlug || p.slug === data.flowerSlug);
        const reasonLabels: Record<string, string> = {
          damage: 'Пошкодження',
          expiry: 'Закінчення терміну',
          adjustment: 'Інвентаризація',
          other: 'Інша причина',
        };
        logActivity('writeOff', {
          flowerName: flower?.name || data.flowerSlug,
          length: data.length,
          qty: data.qty,
          reason: reasonLabels[data.reason] || data.reason,
          notes: data.notes,
        });

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

      // Log activity for shift history
      logActivity('customerCreate', {
        customerName: data.name,
        phone: data.phone,
        email: data.email,
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
      // Знаходимо клієнта перед видаленням для логування
      const customerToDelete = customers.find(c => c.documentId === documentId);

      const result = await deleteCustomer(documentId);
      if (result.success) {
        // Log activity for shift history
        if (customerToDelete) {
          logActivity('customerDelete', {
            customerName: customerToDelete.name,
            phone: customerToDelete.phone,
            email: customerToDelete.email,
          });
        }

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
  }, [search, products]);

  const summary = useMemo(() => {
    const totalItems = products.length;
    const stock = products.reduce(
      (acc, p) => acc + p.variants.reduce((s, v) => s + v.stock, 0),
      0
    );
    return { totalItems, stock };
  }, [products]);

  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cart]
  );

  // Calculate pending payments count from shift activities
  const pendingPaymentsCount = useMemo(() => {
    return activities.filter(
      (a) => a.type === 'sale' && a.details.paymentStatus === 'expected'
    ).length;
  }, [activities]);

  // Handler to show pending payments (navigate to clients tab)
  const handleShowPendingPayments = () => {
    setTab('clients');
  };

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.qty, 0),
    [cart]
  );

  const addToCart = (product: Product, variant: Variant) => {
    const id = `${product.id}-${variant.length}`;
    let addQty = 25;

    // Перевірка stock перед додаванням
    const currentInCart = cart.find((line) => line.id === id)?.qty || 0;
    const availableToAdd = variant.stock - currentInCart;

    // Якщо не можна додати 25, додаємо скільки є
    if (availableToAdd <= 0) {
      showWarning(
        "Недостатньо на складі",
        `${product.name} (${variant.size}): весь доступний запас вже в кошику (${currentInCart} шт)`
      );
      return;
    }

    if (addQty > availableToAdd) {
      // Додаємо скільки є і показуємо інфо
      addQty = availableToAdd;
      showWarning(
        "Додано залишок",
        `${product.name} (${variant.size}): додано ${addQty} шт (весь доступний залишок)`
      );
    }

    setCart((current) => {
      const existing = current.find((line) => line.id === id);
      if (existing) {
        return current.map((line) =>
          line.id === id ? { ...line, qty: line.qty + addQty } : line
        );
      }
      return [
        ...current,
        {
          id,
          name: product.name,
          size: variant.size,
          price: variant.price,
          qty: addQty,
          image: product.image,
          flowerSlug: product.id,  // product.id is the slug
          length: variant.length,
        },
      ];
    });
  };

  const updateQty = (id: string, delta: number) => {
    // При збільшенні кількості - перевіряємо stock
    if (delta > 0) {
      const line = cart.find((l) => l.id === id);
      if (line) {
        // Знаходимо варіант в продуктах для перевірки stock
        const product = products.find((p) => p.id === line.flowerSlug);
        const variant = product?.variants.find((v) => v.length === line.length);
        if (variant && line.qty + delta > variant.stock) {
          showWarning(
            "Недостатньо на складі",
            `${line.name} (${line.size}): доступно ${variant.stock} шт`
          );
          return;
        }
      }
    }

    setCart((current) =>
      current
        .map((line) => (line.id === id ? { ...line, qty: Math.max(1, line.qty + delta) } : line))
        .filter((line) => line.qty > 0)
    );
  };

  const removeLine = (id: string) => {
    setCart((current) => current.filter((line) => line.id !== id));
  };

  // Handle close shift
  const handleCloseShift = async () => {
    if (!shiftStartedAt || activities.length === 0) return;

    setIsClosingShift(true);
    try {
      const result = await closeShiftApi();

      if (result.success) {
        showSuccess(
          result.alert?.title || "Зміну закрито",
          result.alert?.message || "Зміна успішно збережена в архів"
        );
        // Refresh to get the new empty shift
        await refreshActivities();
      } else {
        showError(
          result.alert?.title || "Помилка",
          result.alert?.message || result.error?.message || "Не вдалося закрити зміну"
        );
      }
    } catch (error) {
      console.error("Close shift error:", error);
      showError("Помилка", "Сталася помилка при закритті зміни");
    } finally {
      setIsClosingShift(false);
    }
  };

  // Handle export shift
  const handleExportShift = () => {
    if (!shiftStartedAt || activities.length === 0) return;
    exportShift(activities, shiftSummary, shiftStartedAt);
  };

  // Уникаємо hydration mismatch - рендеримо тільки після монтування
  if (!mounted) {
    return (
      <div className="admin-panel flex min-h-screen w-full items-center justify-center">
        <div className="text-admin-text-secondary">Завантаження...</div>
      </div>
    );
  }

  // Desktop Tabs Content (shared between layouts)
  const tabsContent = (
    <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-5" suppressHydrationWarning>
      <TabsList className="hidden">
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
            comment={posComment}
            onCommentChange={setPosComment}
            onAddCustomer={handleAddCustomer}
            hideDesktopCart
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-5">
          <ProductsSection
            summary={summary}
            products={products}
            onOpenSupply={() => setSupplyOpen(true)}
            onOpenExport={() => exportProducts(products)}
            onWriteOff={handleWriteOff}
            onRefresh={refreshProducts}
            onLogActivity={logActivity}
            showSuccess={showSuccess}
            showError={showError}
            showWarning={showWarning}
          />
        </TabsContent>

        <TabsContent value="clients" className="space-y-5">
          <ClientsSection
            customers={customers}
            isLoading={isLoadingCustomers}
            onOpenExport={() => exportClients(customers)}
            onAddCustomer={handleAddCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-5">
          <AnalyticsSection
            data={analyticsData}
            isLoading={isLoadingAnalytics}
            onRefresh={fetchAnalytics}
            onOpenExport={() => {
              if (analyticsData) {
                exportAnalytics(analyticsData);
              }
            }}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-5">
          <HistorySection
            activities={activities}
            shiftStartedAt={shiftStartedAt}
            summary={shiftSummary}
            onCloseShift={handleCloseShift}
            onExportShift={handleExportShift}
            onRefresh={refreshActivities}
            isClosingShift={isClosingShift}
            isLoading={isLoadingShift}
          />
        </TabsContent>

        <TabsContent value="todo" className="space-y-5">
          <TodoSection />
        </TabsContent>

        <TabsContent value="articles" className="space-y-5">
          <ArticlesSection />
        </TabsContent>
      </div>
    </Tabs>
  );

  // Cart Panel for desktop (only shown on POS tab)
  const desktopCartPanel = tab === "pos" && (
    <aside className="h-full overflow-y-auto border-l border-slate-100 dark:border-[#30363d] bg-white/95 dark:bg-admin-surface-elevated">
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
        comment={posComment}
        onCommentChange={setPosComment}
        onAddCustomer={handleAddCustomer}
      />
    </aside>
  );

  // Визначаємо чи показувати кошик (тільки на POS вкладці)
  const showCart = tab === "pos";

  return (
    <div className="admin-panel h-screen h-[100dvh] overflow-hidden">
      {/* ===================== DESKTOP LAYOUT ===================== */}
      <div
        className={`hidden h-full sm:grid ${
          showCart
            ? "sm:grid-cols-[16rem_1fr] lg:grid-cols-[16rem_1fr_20rem] xl:grid-cols-[16rem_1fr_22.5rem]"
            : "sm:grid-cols-[16rem_1fr]"
        }`}
      >
        {/* Sidebar */}
        <aside className="admin-surface h-full overflow-y-auto border-r border-slate-100 dark:border-[#30363d] p-4">
          <Sidebar
            navItems={navItems}
            active={tab}
            onChange={setTab}
            brand={brandCard}
            supplyCard={supplyCard}
            onOpenSupply={() => setSupplyOpen(true)}
            pendingPaymentsCount={pendingPaymentsCount}
            onShowPendingPayments={handleShowPendingPayments}
          />
        </aside>

        {/* Main Content - scrollable */}
        <main className="h-full overflow-y-auto px-6 py-4 lg:px-8">
          {tabsContent}
        </main>

        {/* Cart Panel (desktop, only on POS tab and lg+) */}
        {showCart && (
          <div className="hidden lg:block h-full">
            {desktopCartPanel}
          </div>
        )}
      </div>

      {/* ===================== MOBILE LAYOUT ===================== */}
      <div className="flex h-full flex-col sm:hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-2 py-2 border-b border-slate-100 dark:border-[#30363d]">
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
                pendingPaymentsCount={pendingPaymentsCount}
                onShowPendingPayments={handleShowPendingPayments}
              />
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" className="relative rounded-full">
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
                comment={posComment}
                onCommentChange={setPosComment}
                onAddCustomer={handleAddCustomer}
              />
            </SheetContent>
          </Sheet>
        </header>

        {/* Mobile Content - scrollable */}
        <main className="flex-1 overflow-y-auto px-2 py-2">
          {tabsContent}
        </main>
      </div>

      <PlannedSupplyModal open={supplyOpen} onOpenChange={setSupplyOpen} />

      {/* Alert Toast Notifications */}
      <AlertToast alerts={alerts} onDismiss={dismiss} />
    </div>
  );
}



