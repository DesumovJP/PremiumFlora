"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Client } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Mail, MapPin, Phone, Plus, Minus, X, Loader2, Trash, Download, Check, ChevronDown, Wallet, FileSpreadsheet, ShoppingBag, CreditCard, Calendar, ArrowUpRight, ArrowDownRight, Clock, MoreHorizontal, Edit3, FileDown, UserX, TrendingUp, TrendingDown, RotateCcw, Receipt } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import type { Customer, Transaction } from "@/lib/api-types";
import type { ActivityType, ActivityDetails } from "@/hooks/use-activity-log";
import { getTransactions, confirmPayment, invalidatePendingPaymentsCache, updateCustomerBalance } from "@/lib/strapi";
import { returnSale } from "@/lib/api";
import { exportClientTransactions, exportSaleInvoice } from "@/lib/export";

type ClientsSectionProps = {
  customers: Customer[];
  isLoading?: boolean;
  onOpenExport: () => void;
  onAddCustomer: (data: { name: string; phone: string; email: string; address: string }) => Promise<void>;
  onDeleteCustomer: (documentId: string) => Promise<void>;
  onLogActivity?: (type: ActivityType, details: ActivityDetails) => Promise<void>;
  onPendingPaymentsChange?: (total: number) => void;
  onCustomersUpdate?: () => void; // Callback to refresh customers list after balance change
  initialSelectedClientId?: string | null; // Auto-open history for this client
  onInitialClientHandled?: () => void; // Clear after handling
};

export function ClientsSection({ customers, isLoading = false, onOpenExport, onAddCustomer, onDeleteCustomer, onLogActivity, onPendingPaymentsChange, onCustomersUpdate, initialSelectedClientId, onInitialClientHandled }: ClientsSectionProps) {
  // State for payment confirmation
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);
  // State for confirmation dialog
  const [paymentToConfirm, setPaymentToConfirm] = useState<Transaction | null>(null);
  // State for balance modal
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState<string>("");
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [selectedCustomerForBalance, setSelectedCustomerForBalance] = useState<Customer | null>(null);
  // State for client modal tab
  const [clientModalTab, setClientModalTab] = useState<'info' | 'history'>('info');
  // State for return sale modal
  const [transactionToReturn, setTransactionToReturn] = useState<Transaction | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  // Convert Customer to Client for display (including balance)
  const baseClients: (Client & { balance?: number })[] = useMemo(() => {
    return customers.map((c) => ({
      id: c.documentId,
      name: c.name,
      contact: c.phone || '-',
      email: c.email || '-',
      city: c.address || '-',
      orders: c.orderCount,
      spent: c.totalSpent,
      lastOrder: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('uk-UA') : '-',
      isVip: c.type === 'VIP',
      balance: c.balance || 0,
    }));
  }, [customers]);

  // Локальний стан для оновлених даних клієнтів (після завантаження транзакцій)
  const [updatedClients, setUpdatedClients] = useState<Record<string, Partial<Client & { balance?: number }>>>({});

  // Об'єднуємо базові дані з оновленими
  const clients: (Client & { balance?: number })[] = useMemo(() => {
    return baseClients.map((client) => {
      const updates = updatedClients[client.id];
      return updates ? { ...client, ...updates } : client;
    });
  }, [baseClients, updatedClients]);

  // Примітка: загальну суму боргів отримуємо з API в батьківському компоненті
  // Оновлюємо тільки після підтвердження оплати (див. handleConfirmPayment)

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());
  const [isDesktop, setIsDesktop] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Фільтруємо клієнтів за пошуковим запитом
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter((client) =>
      client.name.toLowerCase().includes(query) ||
      client.contact.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.city.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  const handleSelect = async (client: Client) => {
    setSelected(client);
    setOpen(true);
    // Очищаємо попередні транзакції
    setTransactions([]);
    // Завантажуємо транзакції для вибраного клієнта
    setIsLoadingTransactions(true);
    try {
      console.log('Loading transactions for client:', client.id, client.name);
      const result = await getTransactions({ 
        customerId: client.id,
        type: 'sale',
        limit: 50 
      });
      console.log('Transactions result:', result);
      console.log('Transactions data:', result.data);
      console.log('Transactions length:', result.data?.length);
      if (result.success && result.data && Array.isArray(result.data)) {
        console.log('Setting transactions:', result.data);
        setTransactions(result.data);
        // Оновлюємо кількість замовлень на основі реальних транзакцій
        const actualOrderCount = result.data.length;
        const actualTotalSpent = result.data.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const lastTransactionDate = result.data.length > 0 && result.data[0].date
          ? new Date(result.data[0].date).toLocaleDateString('uk-UA')
          : client.lastOrder;

        // Рахуємо суму очікуваних оплат (expected або pending)
        const pendingPayment = result.data
          .filter(t => t.paymentStatus === 'expected' || t.paymentStatus === 'pending')
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        // Оновлюємо дані клієнта в локальному стані (для синхронізації з картками)
        const updatedData: Partial<Client> = {
          orders: actualOrderCount,
          spent: actualTotalSpent,
          lastOrder: lastTransactionDate,
          pendingPayment,
        };

        setUpdatedClients((prev) => ({
          ...prev,
          [client.id]: updatedData,
        }));

        // Оновлюємо selected клієнта з реальними даними
        setSelected((prev) => {
          if (!prev || prev.id !== client.id) {
            return { ...client, ...updatedData };
          }
          return {
            ...prev,
            ...updatedData,
          };
        });
      } else {
        console.warn('Failed to load transactions:', result.error);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Auto-select client when navigating from POS (e.g., clicking on balance)
  useEffect(() => {
    if (initialSelectedClientId && clients.length > 0) {
      const clientToSelect = clients.find(c => c.id === initialSelectedClientId);
      if (clientToSelect) {
        handleSelect(clientToSelect);
        onInitialClientHandled?.();
      }
    }
  }, [initialSelectedClientId, clients]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  // Очищаємо транзакції, коли вибір клієнта змінюється
  useEffect(() => {
    if (!selected) {
      setTransactions([]);
    }
  }, [selected]);

  // Завантажуємо транзакції для всіх клієнтів при завантаженні списку
  useEffect(() => {
    if (customers.length === 0) return;

    const loadTransactionsForAll = async () => {
      try {
        // Завантажуємо транзакції для всіх клієнтів паралельно
        const transactionPromises = customers.map(async (customer) => {
          try {
            const result = await getTransactions({
              customerId: customer.documentId,
              type: 'sale',
              limit: 100, // Завантажуємо до 100 транзакцій для підрахунку
            });
            if (result.success && result.data && Array.isArray(result.data)) {
              const actualOrderCount = result.data.length;
              // Використовуємо totalSpent з сервера, якщо він є, інакше обчислюємо з транзакцій
              // Але якщо транзакцій менше ніж orderCount, то використовуємо totalSpent з сервера
              const actualTotalSpent = result.data.length > 0
                ? result.data.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
                : customer.totalSpent;
              const lastTransactionDate = result.data.length > 0 && result.data[0].date
                ? new Date(result.data[0].date).toLocaleDateString('uk-UA')
                : null;

              // Рахуємо суму очікуваних оплат (expected або pending)
              const pendingPayment = result.data
                .filter(t => t.paymentStatus === 'expected' || t.paymentStatus === 'pending')
                .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

              return {
                customerId: customer.documentId,
                orders: actualOrderCount,
                spent: actualTotalSpent,
                lastOrder: lastTransactionDate,
                pendingPayment,
              };
            }
            // Якщо транзакцій немає або помилка, все одно повертаємо дані з 0 замовленнями
            // щоб оновити відображення правильно
            return {
              customerId: customer.documentId,
              orders: 0,
              spent: customer.totalSpent || 0,
              lastOrder: null,
              pendingPayment: 0,
            };
          } catch (error) {
            console.error(`Failed to load transactions for customer ${customer.documentId}:`, error);
            return null;
          }
        });

        const results = await Promise.all(transactionPromises);

        // Оновлюємо дані клієнтів - оновлюємо всі результати, навіть якщо замовлень 0
        const updates: Record<string, Partial<Client>> = {};
        results.forEach((result) => {
          if (result) {
            updates[result.customerId] = {
              orders: result.orders,
              spent: result.spent,
              lastOrder: result.lastOrder || undefined,
              pendingPayment: result.pendingPayment,
            };
          }
        });

        // Оновлюємо стан, щоб відразу показати правильні дані
        setUpdatedClients((prev) => ({
          ...prev,
          ...updates,
        }));
      } catch (error) {
        console.error('Failed to load transactions for all customers:', error);
      }
    };

    loadTransactionsForAll();
  }, [customers]);

  const resetNewClient = () =>
    setNewClient({ name: "", phone: "", email: "", city: "" });

  const handleDeleteClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation(); // Запобігаємо відкриттю модалки клієнта
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);
    try {
      await onDeleteCustomer(clientToDelete.id);
      setDeleteModalOpen(false);
      setClientToDelete(null);
      // Якщо видалений клієнт був вибраний, очищаємо вибір
      if (selected?.id === clientToDelete.id) {
        setSelected(null);
        setOpen(false);
      }
    } catch (error) {
      // Помилка обробляється батьківським компонентом
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmPayment = async (transaction: Transaction) => {
    if (confirmingPaymentId) return;

    setConfirmingPaymentId(transaction.documentId);
    try {
      const result = await confirmPayment(transaction.documentId);
      if (result.success) {
        // Інвалідуємо кеш очікуваних оплат
        invalidatePendingPaymentsCache();

        // Оновлюємо транзакцію в списку
        setTransactions((prev) =>
          prev.map((t) =>
            t.documentId === transaction.documentId
              ? { ...t, paymentStatus: 'paid' as const }
              : t
          )
        );

        // Перераховуємо pendingPayment для клієнта
        const newPendingPayment = transactions
          .filter(t => t.documentId !== transaction.documentId && (t.paymentStatus === 'expected' || t.paymentStatus === 'pending'))
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        // Оновлюємо дані клієнта
        if (selected) {
          setUpdatedClients((prev) => ({
            ...prev,
            [selected.id]: {
              ...prev[selected.id],
              pendingPayment: newPendingPayment,
            },
          }));
          setSelected((prev) => prev ? { ...prev, pendingPayment: newPendingPayment } : null);
        }

        // Логуємо активність з повними деталями замовлення
        if (onLogActivity) {
          await onLogActivity('paymentConfirm', {
            transactionId: transaction.documentId,
            customerName: selected?.name,
            amount: transaction.amount,
            orderDate: transaction.date,
            paymentItems: transaction.items?.map(item => ({
              name: item.name,
              qty: item.qty,
              price: item.price,
              length: item.length,
              subtotal: item.subtotal || item.price * item.qty,
            })),
            notes: transaction.notes,
          });
        }

        // Закриваємо діалог підтвердження
        setPaymentToConfirm(null);
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error);
    } finally {
      setConfirmingPaymentId(null);
    }
  };

  const handleReturnSale = async (transaction: Transaction) => {
    if (isReturning) return;

    setIsReturning(true);
    try {
      // Зберігаємо баланс клієнта ДО повернення
      const customerBefore = customers.find(c => c.documentId === transaction.customer?.documentId);
      const balanceBefore = customerBefore?.balance ?? 0;

      const result = await returnSale(transaction.documentId);
      if (result.success) {
        // Оновлюємо транзакцію в списку
        setTransactions((prev) =>
          prev.map((t) =>
            t.documentId === transaction.documentId
              ? { ...t, paymentStatus: 'cancelled' as const }
              : t
          )
        );

        // Оновлюємо кеш та баланси
        invalidatePendingPaymentsCache();
        if (onCustomersUpdate) {
          onCustomersUpdate();
        }

        // Логуємо повернення в історію зміни
        if (onLogActivity) {
          // Розраховуємо баланс після повернення
          // При поверненні: якщо було "в борг" - борг скасовується, якщо було "сплачено" - баланс збільшується
          const returnAmount = transaction.amount || 0;
          const paidAmount = transaction.paidAmount || 0;
          const wasPaid = transaction.paymentStatus === 'paid';
          const wasPartiallyPaid = !wasPaid && paidAmount > 0;

          // Баланс змінюється на суму що була сплачена (повертаємо гроші/компенсуємо)
          const balanceAfter = wasPaid
            ? balanceBefore + returnAmount  // Повністю сплачено - повертаємо всю суму
            : wasPartiallyPaid
              ? balanceBefore + paidAmount   // Частково сплачено - повертаємо сплачену частину
              : balanceBefore;               // Не сплачено (борг) - баланс не змінюється, просто скасовуємо борг

          await onLogActivity('saleReturn', {
            // Клієнт
            customerName: transaction.customer?.name || 'Невідомий',
            customerId: transaction.customer?.documentId,
            // Оригінальний продаж
            originalSaleId: transaction.documentId,
            originalSaleDate: transaction.date || transaction.createdAt,
            // Сума повернення
            returnAmount: returnAmount,
            totalAmount: returnAmount,
            paidAmount: paidAmount,
            paymentStatus: transaction.paymentStatus,
            // Баланс клієнта до/після
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
            // Товари що повертаються (з усіма деталями)
            items: (transaction.items || []).map(item => ({
              name: item.name || 'Товар',
              size: item.length ? String(item.length) : '-',
              qty: item.qty || 0,
              price: item.price || 0,
              originalPrice: item.originalPrice,
              isCustom: item.isCustom,
              customNote: item.customNote,
              // Залишок на складі: при поверненні товар повертається на склад
              // Якщо немає даних про склад - показуємо що повернуто
              stockBefore: undefined,  // Не знаємо точно скільки було
              stockAfter: undefined,   // Не знаємо точно скільки стало
            })),
            // Примітки
            notes: transaction.notes,
          });
        }

        // Закриваємо діалог
        setTransactionToReturn(null);
      }
    } catch (error) {
      console.error('Failed to return sale:', error);
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <>
    <Card className="admin-card border border-slate-100 dark:border-[var(--admin-border)] bg-white/90 dark:bg-admin-surface shadow-md">
      <CardHeader className="space-y-3 md:space-y-0">
        {/* Desktop: Single row | Mobile: Title + Export, then Search + Add */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Title row with Export on mobile */}
          <div className="flex items-start justify-between gap-2 md:justify-start">
            <div className="space-y-1 shrink-0">
              <CardTitle className="text-2xl flex items-center gap-2">
                Клієнти
                <Badge className="text-sm font-normal bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {searchQuery ? `${filteredClients.length} / ${clients.length}` : clients.length}
                </Badge>
              </CardTitle>
              <CardDescription>Управління базою клієнтів та історією замовлень</CardDescription>
            </div>
            {/* Export button - only on mobile */}
            <Button
              variant="outline"
              className="text-slate-500 dark:text-admin-text-tertiary shrink-0 md:hidden"
              onClick={onOpenExport}
              size="icon"
              title="Експортувати"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {/* Search + Add + Export (desktop) */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Пошук клієнтів..."
              className="flex-1 md:w-48 lg:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="shrink-0" onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Додати клієнта</span>
              <span className="sm:hidden">Додати</span>
            </Button>
            {/* Export button - only on desktop */}
            <Button
              variant="outline"
              className="text-slate-500 dark:text-admin-text-tertiary shrink-0 hidden md:flex"
              onClick={onOpenExport}
              size="icon"
              title="Експортувати"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
        <>
        <div className="grid gap-4">
          {/* Мобільні картки */}
          <div className="grid gap-2.5 sm:hidden">
            {filteredClients.length === 0 && searchQuery ? (
              <div className="text-center py-8 text-slate-500 dark:text-admin-text-tertiary">
                Клієнтів за запитом "{searchQuery}" не знайдено
              </div>
            ) : null}
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className={cn(
                  "border rounded-xl cursor-pointer transition-colors duration-200 group bg-white dark:bg-slate-800/60 overflow-hidden",
                  "hover:border-slate-300 dark:hover:border-slate-500 active:scale-[0.99]",
                  selected?.id === client.id
                    ? "border-emerald-400 dark:border-emerald-500 shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-500/30"
                    : "border-[var(--admin-border)]"
                )}
                onClick={() => handleSelect(client)}
              >
                {/* Header */}
                <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--admin-text-primary)] truncate">
                        {client.name}
                      </h3>
                      {client.isVip && (
                        <Badge tone="success" className="text-[10px] font-medium shrink-0">
                          VIP
                        </Badge>
                      )}
                    </div>
                    {client.contact && client.contact !== '-' && (
                      <p className="text-xs text-[var(--admin-text-tertiary)] truncate flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.contact}
                      </p>
                    )}
                  </div>
                  {client.lastOrder && client.lastOrder !== '-' && (
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-[var(--admin-text-muted)] uppercase">останнє</p>
                      <p className="text-xs font-medium text-[var(--admin-text-secondary)]">{client.lastOrder}</p>
                    </div>
                  )}
                </div>

                {/* Metrics row */}
                <div className="flex items-center divide-x divide-slate-100 dark:divide-slate-700/50">
                  <div className="flex-1 py-2.5 px-3 text-center">
                    <p className="text-lg font-bold text-[var(--admin-text-primary)]">{client.orders}</p>
                    <p className="text-[10px] text-[var(--admin-text-muted)] uppercase">замовлень</p>
                  </div>
                  <div className="flex-1 py-2.5 px-3 text-center">
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{client.spent.toLocaleString("uk-UA")}</p>
                    <p className="text-[10px] text-[var(--admin-text-muted)] uppercase">витрачено ₴</p>
                  </div>
                  <div className="flex-1 py-2.5 px-3 text-center">
                    <p className={cn(
                      "text-lg font-bold",
                      (client.balance || 0) > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : (client.balance || 0) < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-[var(--admin-text-muted)]"
                    )}>
                      {(client.balance || 0) > 0 ? '+' : ''}{(client.balance || 0).toLocaleString('uk-UA')}
                    </p>
                    <p className="text-[10px] text-[var(--admin-text-muted)] uppercase">баланс ₴</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Десктопна таблиця */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-admin-border">
            {filteredClients.length === 0 && searchQuery ? (
              <div className="text-center py-8 text-slate-500 dark:text-admin-text-tertiary bg-white dark:bg-admin-surface">
                Клієнтів за запитом "{searchQuery}" не знайдено
              </div>
            ) : (
              <table className="w-full text-sm table-fixed">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 w-[40%]">Клієнт</th>
                    <th className="py-2.5 pl-2 pr-1 text-right text-xs font-medium text-slate-500 dark:text-slate-400 w-[10%]">Замовлень</th>
                    <th className="py-2.5 px-1 text-right text-xs font-medium text-slate-500 dark:text-slate-400 w-[14%]">Витрачено</th>
                    <th className="py-2.5 px-1 text-right text-xs font-medium text-slate-500 dark:text-slate-400 w-[14%]">Баланс</th>
                    <th className="py-2.5 pl-1 pr-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 w-[22%]">Останнє</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-admin-surface">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selected?.id === client.id
                          ? "bg-emerald-50 dark:bg-emerald-900/20"
                          : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                      )}
                      onClick={() => handleSelect(client)}
                    >
                      {/* Client */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm shrink-0">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 dark:text-white truncate">
                                {client.name}
                              </span>
                              {client.isVip && (
                                <Badge tone="success" className="text-[10px] font-medium shrink-0">
                                  VIP
                                </Badge>
                              )}
                            </div>
                            {client.contact && client.contact !== '-' && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {client.contact}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Orders */}
                      <td className="py-2.5 pl-2 pr-1 text-right font-medium text-slate-600 dark:text-slate-300">
                        {client.orders}
                      </td>
                      {/* Spent */}
                      <td className="py-2.5 px-1 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        {client.spent.toLocaleString("uk-UA")} ₴
                      </td>
                      {/* Balance */}
                      <td className={cn(
                        "py-2.5 px-1 text-right font-medium",
                        (client.balance || 0) > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : (client.balance || 0) < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-400 dark:text-slate-500"
                      )}>
                        {(client.balance || 0) > 0 ? '+' : ''}{(client.balance || 0).toLocaleString('uk-UA')} ₴
                      </td>
                      {/* Last order */}
                      <td className="py-2.5 pl-1 pr-3 text-center text-slate-500 dark:text-slate-400">
                        {client.lastOrder && client.lastOrder !== '-' ? client.lastOrder : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Модалка з історією замовлень (для всіх екранів) */}
          {selected && (
            <Modal
              open={!!selected}
              onOpenChange={(v) => {
                if (!v) {
                  setSelected(null);
                  setClientModalTab('info');
                }
              }}
              title={selected?.name}
              description={selected?.isVip ? 'VIP клієнт' : 'Клієнт'}
              size="lg"
              fullscreenOnMobile
            >
              <div className="flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden -mt-2">
                {/* Tabs */}
                <Tabs value={clientModalTab} onValueChange={(v) => setClientModalTab(v as 'info' | 'history')} className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <TabsList className="flex-1 bg-slate-100 dark:bg-slate-800/80 p-1">
                      <TabsTrigger value="info" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Інформація
                      </TabsTrigger>
                      <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">
                        <Receipt className="h-4 w-4 mr-2" />
                        Історія
                        {transactions.length > 0 && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-medium">
                            {transactions.length}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>
                    {/* Actions dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="shrink-0 h-9 w-9 p-0 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                          <MoreHorizontal className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <DropdownMenuItem
                          onClick={() => {
                            const customer = customers.find(c => c.documentId === selected.id);
                            if (customer) {
                              exportClientTransactions(customer, transactions, customer.balance || 0);
                            }
                          }}
                          disabled={isLoadingTransactions}
                          className="text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-slate-700"
                        >
                          <FileDown className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                          Експорт історії
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                        <DropdownMenuItem
                          className="text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-900/30"
                          onClick={() => {
                            handleDeleteClick(new MouseEvent('click') as unknown as React.MouseEvent, selected);
                            setSelected(null);
                          }}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Видалити клієнта
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Info Tab */}
                  <TabsContent value="info" className="flex-1 mt-0 data-[state=inactive]:hidden overflow-y-auto">
                    <div className="space-y-6">
                      {/* Balance Card - Hero section */}
                      <div className={cn(
                        "rounded-2xl p-5 relative overflow-hidden",
                        (selected.balance || 0) > 0
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700"
                          : (selected.balance || 0) < 0
                          ? "bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700"
                          : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700"
                      )}>
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
                          <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
                        </div>

                        <div className="relative">
                          {(() => {
                            const balance = selected.balance || 0;
                            const isNeutral = balance === 0;
                            const textColor = isNeutral ? "text-slate-700 dark:text-white" : "text-white";
                            const textMuted = isNeutral ? "text-slate-500 dark:text-white/80" : "text-white/80";
                            const bgButton = isNeutral ? "bg-slate-300/60 hover:bg-slate-300 dark:bg-white/20 dark:hover:bg-white/30" : "bg-white/20 hover:bg-white/30";
                            const iconBg = isNeutral ? "bg-slate-300/60 dark:bg-white/20" : "bg-white/20";

                            return (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", iconBg)}>
                                      <Wallet className={cn("h-4 w-4", textColor)} />
                                    </div>
                                    <span className={cn("text-sm font-medium", textMuted)}>Баланс клієнта</span>
                                  </div>
                                  {balance !== 0 && (
                                    <span className="text-xs font-semibold text-white/90 bg-white/20 px-2.5 py-1 rounded-full">
                                      {balance > 0 ? 'Переплата' : 'Борг'}
                                    </span>
                                  )}
                                </div>

                                <p className={cn("text-4xl font-bold tabular-nums tracking-tight mb-5", textColor)}>
                                  {balance > 0 ? '+' : ''}{balance.toLocaleString('uk-UA')} ₴
                                </p>

                                {/* Balance action */}
                                <button
                                  className={cn("w-full h-10 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors", bgButton, textColor)}
                                  onClick={() => {
                                    const customer = customers.find(c => c.documentId === selected.id);
                                    if (customer) {
                                      setSelectedCustomerForBalance(customer);
                                      setBalanceOperation('add');
                                      setBalanceAmount("");
                                      setBalanceModalOpen(true);
                                    }
                                  }}
                                >
                                  <Edit3 className="h-4 w-4" />
                                  Редагувати баланс
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-center">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                            {selected.orders}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Замовлень</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-center">
                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {selected.spent.toLocaleString("uk-UA")}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Витрачено ₴</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-center">
                          <p className="text-lg font-bold text-slate-900 dark:text-white">
                            {selected.lastOrder !== '-' ? selected.lastOrder : '—'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Останнє</p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-3">
                          Контактна інформація
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl divide-y divide-slate-100 dark:divide-slate-700/50 overflow-hidden">
                          {/* Phone */}
                          <div className="flex items-center gap-4 px-4 py-3.5">
                            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                              <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 dark:text-slate-500">Телефон</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {selected.contact !== '-' ? selected.contact : 'Не вказано'}
                              </p>
                            </div>
                          </div>
                          {/* Email */}
                          <div className="flex items-center gap-4 px-4 py-3.5">
                            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 dark:text-slate-500">Email</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {selected.email !== '-' ? selected.email : 'Не вказано'}
                              </p>
                            </div>
                          </div>
                          {/* City */}
                          <div className="flex items-center gap-4 px-4 py-3.5">
                            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                              <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 dark:text-slate-500">Місто / Адреса</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {selected.city !== '-' ? selected.city : 'Не вказано'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* History Tab */}
                  <TabsContent value="history" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {transactions.length > 0 ? `${transactions.length} транзакцій` : 'Немає транзакцій'}
                        </p>
                        {transactions.length > 0 && (
                          <button
                            onClick={() => {
                              const customer = customers.find(c => c.documentId === selected.id);
                              if (customer) {
                                exportClientTransactions(customer, transactions, customer.balance || 0);
                              }
                            }}
                            disabled={isLoadingTransactions}
                            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                          >
                            <FileDown className="h-4 w-4" />
                            Експорт
                          </button>
                        )}
                      </div>
                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                  {isLoadingTransactions ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-400" />
                    </div>
                  ) : Array.isArray(transactions) && transactions.length > 0 ? (
                    <div className="space-y-2.5">
                      {transactions.map((transaction) => {
                        const itemsCount = Array.isArray(transaction.items) ? transaction.items.length : 0;
                        const isExpanded = expandedTransactions.has(transaction.documentId);

                        const isPaid = transaction.paymentStatus === 'paid';
                        const isCancelled = transaction.paymentStatus === 'cancelled';
                        const isPending = transaction.paymentStatus === 'expected' || transaction.paymentStatus === 'pending';
                        const debtAmount = (transaction.amount || 0) - (transaction.paidAmount || 0);

                        return (
                          <div
                            key={transaction.documentId}
                            className={cn(
                              "rounded-xl border overflow-hidden transition-all",
                              isCancelled
                                ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 opacity-60"
                                : isPending
                                ? "border-amber-300 dark:border-amber-700/60 bg-white dark:bg-slate-800/60"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60"
                            )}
                          >
                            {/* Кликабельний заголовок */}
                            <button
                              onClick={() => {
                                setExpandedTransactions(prev => {
                                  const next = new Set(prev);
                                  if (next.has(transaction.documentId)) {
                                    next.delete(transaction.documentId);
                                  } else {
                                    next.add(transaction.documentId);
                                  }
                                  return next;
                                });
                              }}
                              className="w-full p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                            >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Status indicator */}
                                <div className={cn(
                                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                  isCancelled
                                    ? "bg-slate-100 dark:bg-slate-700"
                                    : isPending
                                    ? "bg-amber-100 dark:bg-amber-900/40"
                                    : "bg-emerald-100 dark:bg-emerald-900/40"
                                )}>
                                  {isCancelled ? (
                                    <X className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                  ) : isPending ? (
                                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                  ) : (
                                    <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                    {new Date(transaction.date).toLocaleDateString('uk-UA', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {new Date(transaction.date).toLocaleTimeString('uk-UA', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })} · {itemsCount} {itemsCount === 1 ? 'позиція' : itemsCount < 5 ? 'позиції' : 'позицій'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  {isCancelled ? (
                                    <p className="font-medium text-slate-400 dark:text-slate-500 line-through text-sm tabular-nums">
                                      {transaction.amount?.toLocaleString('uk-UA') || '—'} ₴
                                    </p>
                                  ) : isPaid ? (
                                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-base tabular-nums">
                                      {transaction.amount?.toLocaleString('uk-UA') || '—'} ₴
                                    </p>
                                  ) : (
                                    <div className="text-right">
                                      <p className="font-bold text-slate-900 dark:text-white text-base tabular-nums">
                                        {transaction.amount?.toLocaleString('uk-UA') || '—'} ₴
                                      </p>
                                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
                                        борг: {debtAmount.toLocaleString('uk-UA')} ₴
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <ChevronDown className={cn(
                                  "h-5 w-5 text-slate-400 dark:text-slate-500 transition-transform shrink-0",
                                  isExpanded && "rotate-180"
                                )} />
                              </div>
                            </div>
                            </button>

                            {/* Розгорнутий контент */}
                            {isExpanded && (
                              <div className="border-t border-slate-100 dark:border-slate-700 px-3.5 pb-3.5 pt-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                                {/* Payment details for pending */}
                                {isPending && (transaction.paidAmount || 0) > 0 && (
                                  <div className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/60 rounded-lg px-3 py-2">
                                    <CreditCard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    <span className="text-amber-800 dark:text-amber-200">
                                      Внесено: <span className="font-bold tabular-nums">{(transaction.paidAmount || 0).toLocaleString('uk-UA')} ₴</span>
                                    </span>
                                  </div>
                                )}

                                {/* Позиції замовлення */}
                                {Array.isArray(transaction.items) && transaction.items.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Позиції</p>
                                    <div className="space-y-1.5">
                                      {transaction.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between gap-2 text-sm bg-white dark:bg-slate-800 rounded-lg px-3 py-2.5 border border-slate-100 dark:border-slate-700">
                                          <div className="flex-1 min-w-0">
                                            <span className="text-slate-900 dark:text-slate-100 font-medium text-sm">
                                              {item.name}
                                            </span>
                                            <span className="text-slate-400 dark:text-slate-500 text-xs ml-2">
                                              {item.length ? `${item.length}см` : ''} × {item.qty}
                                            </span>
                                          </div>
                                          <span className="text-slate-900 dark:text-white font-bold tabular-nums shrink-0">
                                            {((item.subtotal || item.price * item.qty) || 0)?.toLocaleString('uk-UA') || '—'} ₴
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Коментар */}
                                {transaction.notes && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Коментар:</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">{transaction.notes}</p>
                                  </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-2 pt-1">
                                  {(transaction.paymentStatus === 'expected' || transaction.paymentStatus === 'pending') && (
                                    <Button
                                      size="sm"
                                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPaymentToConfirm(transaction);
                                      }}
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Підтвердити оплату
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className={cn(
                                      "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700",
                                      transaction.paymentStatus === 'cancelled' ? 'w-full' : ''
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      exportSaleInvoice(transaction);
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Накладна
                                  </Button>
                                  {transaction.paymentStatus !== 'cancelled' && (
                                    <button
                                      className="text-sm font-medium text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors px-3"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTransactionToReturn(transaction);
                                      }}
                                    >
                                      Повернути
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                        <Receipt className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                        Немає транзакцій
                      </p>
                    </div>
                  )}
                  </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </Modal>
          )}
        </div>
        </>
        )}
      </CardContent>
    </Card>

    {/* Модалка додавання клієнта */}
    <Modal
      open={addModalOpen}
      onOpenChange={(v) => {
        setAddModalOpen(v);
        if (!v) resetNewClient();
      }}
      title="Додати клієнта"
      description="Заповніть контактні дані нового клієнта."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => setAddModalOpen(false)} disabled={isSaving}>
            Скасувати
          </Button>
          <Button
            onClick={async () => {
              setIsSaving(true);
              try {
                await onAddCustomer({
                  name: newClient.name,
                  phone: newClient.phone,
                  email: newClient.email,
                  address: newClient.city,
                });
                resetNewClient();
                setAddModalOpen(false);
              } catch (error) {
                // Error handled by parent
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving || !newClient.name}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Зберегти"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">
            Імʼя або назва компанії <span className="text-rose-500">*</span>
          </label>
          <Input
            placeholder="Введіть імʼя клієнта або назву компанії"
            value={newClient.name}
            onChange={(e) => setNewClient((d) => ({ ...d, name: e.target.value }))}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">
            Телефон
          </label>
          <Input
            type="tel"
            placeholder="+380 XX XXX XX XX"
            value={newClient.phone}
            onChange={(e) => setNewClient((d) => ({ ...d, phone: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">
            Email
          </label>
          <Input
            type="email"
            placeholder="example@email.com"
            value={newClient.email}
            onChange={(e) => setNewClient((d) => ({ ...d, email: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">
            Місто / адреса
          </label>
          <Input
            placeholder="Місто або повна адреса"
            value={newClient.city}
            onChange={(e) => setNewClient((d) => ({ ...d, city: e.target.value }))}
          />
        </div>
      </div>
    </Modal>

    {/* Модалка підтвердження видалення */}
    <Modal
      open={deleteModalOpen}
      onOpenChange={(v) => {
        setDeleteModalOpen(v);
        if (!v) setClientToDelete(null);
      }}
      title="Видалити клієнта?"
      description={clientToDelete ? `Ви впевнені, що хочете видалити клієнта "${clientToDelete.name}"? Цю дію неможливо скасувати.` : ""}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
            Скасувати
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-200"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Видалити"}
          </Button>
        </>
      }
    >
      <div className="text-sm text-slate-600 dark:text-admin-text-secondary">
        <p>Всі дані про клієнта та його замовлення будуть видалені назавжди.</p>
      </div>
    </Modal>

    {/* Модалка підтвердження оплати */}
    <Modal
      open={!!paymentToConfirm}
      onOpenChange={(v) => {
        if (!v) setPaymentToConfirm(null);
      }}
      title="Підтвердити оплату?"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => setPaymentToConfirm(null)} disabled={!!confirmingPaymentId}>
            Скасувати
          </Button>
          <Button
            onClick={() => paymentToConfirm && handleConfirmPayment(paymentToConfirm)}
            disabled={!!confirmingPaymentId}
            className="bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200"
          >
            {confirmingPaymentId ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Підтвердити
              </>
            )}
          </Button>
        </>
      }
    >
      {paymentToConfirm && (
        <div className="space-y-4">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-700 dark:text-emerald-400">Сума до оплати</span>
              <span className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                {Number(paymentToConfirm.amount).toLocaleString('uk-UA')} грн
              </span>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-admin-text-secondary space-y-2">
            <p>
              <span className="text-slate-500">Дата:</span>{' '}
              <span className="font-medium text-slate-800 dark:text-admin-text-primary">
                {new Date(paymentToConfirm.date).toLocaleDateString('uk-UA')}
              </span>
            </p>
            {paymentToConfirm.items && paymentToConfirm.items.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-admin-border">
                <p className="text-slate-500 mb-1">Товари:</p>
                <ul className="space-y-1">
                  {paymentToConfirm.items.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="text-slate-700 dark:text-admin-text-secondary">
                      {item.name} × {item.qty}
                    </li>
                  ))}
                  {paymentToConfirm.items.length > 3 && (
                    <li className="text-slate-500">... та ще {paymentToConfirm.items.length - 3} товар(ів)</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-admin-text-muted">
            Після підтвердження статус оплати буде змінено на "Оплачено".
          </p>
        </div>
      )}
    </Modal>

    {/* Модалка повернення замовлення */}
    <Modal
      open={!!transactionToReturn}
      onOpenChange={(v) => {
        if (!v) setTransactionToReturn(null);
      }}
      title="Повернути замовлення?"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => setTransactionToReturn(null)} disabled={isReturning}>
            Скасувати
          </Button>
          <Button
            onClick={() => transactionToReturn && handleReturnSale(transactionToReturn)}
            disabled={isReturning}
            className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-200"
          >
            {isReturning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Повернути'}
          </Button>
        </>
      }
    >
      {transactionToReturn && (
        <div className="space-y-4">
          <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-rose-700 dark:text-rose-400">Сума до повернення</span>
              <span className="text-2xl font-bold text-rose-800 dark:text-rose-300">
                {Number(transactionToReturn.amount).toLocaleString('uk-UA')} грн
              </span>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-admin-text-secondary space-y-2">
            <p>
              <span className="text-slate-500">Дата:</span>{' '}
              <span className="font-medium text-slate-800 dark:text-admin-text-primary">
                {new Date(transactionToReturn.date).toLocaleDateString('uk-UA')}
              </span>
            </p>
            {transactionToReturn.items && transactionToReturn.items.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-admin-border">
                <p className="text-slate-500 mb-1">Товари:</p>
                <ul className="space-y-1">
                  {transactionToReturn.items.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="text-slate-700 dark:text-admin-text-secondary">
                      {item.name} × {item.qty}
                    </li>
                  ))}
                  {transactionToReturn.items.length > 3 && (
                    <li className="text-slate-500">... та ще {transactionToReturn.items.length - 3} товар(ів)</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400">
            Товари повернуться на склад, а баланс клієнта буде оновлено.
          </p>
        </div>
      )}
    </Modal>

    {/* Модалка зміни балансу */}
    <Modal
      open={balanceModalOpen}
      onOpenChange={(v) => {
        setBalanceModalOpen(v);
        if (!v) {
          setSelectedCustomerForBalance(null);
          setBalanceAmount("");
        }
      }}
      title="Редагувати баланс"
      description={selectedCustomerForBalance?.name}
      size="sm"
    >
      {selectedCustomerForBalance && (() => {
        const currentBalance = selectedCustomerForBalance.balance || 0;
        const newBalance = parseFloat(balanceAmount) || 0;
        const hasChange = balanceAmount !== "" && newBalance !== currentBalance;
        const difference = newBalance - currentBalance;

        return (
          <div className="space-y-5">
            {/* Current balance display */}
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Поточний баланс</p>
              <p className={cn(
                "text-2xl font-bold tabular-nums",
                currentBalance > 0 ? "text-emerald-600 dark:text-emerald-400" :
                currentBalance < 0 ? "text-rose-600 dark:text-rose-400" :
                "text-slate-700 dark:text-slate-200"
              )}>
                {currentBalance > 0 ? '+' : ''}{currentBalance.toLocaleString('uk-UA')} ₴
              </p>
            </div>

            {/* New balance input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Новий баланс
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  placeholder={currentBalance.toString()}
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="text-xl font-bold tabular-nums pr-12 h-14 bg-white dark:bg-slate-800"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium text-lg">₴</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Введіть нове значення балансу. Від'ємне значення = борг клієнта.
              </p>
            </div>

            {/* Change preview */}
            {hasChange && (
              <div className={cn(
                "rounded-xl p-4 flex items-center justify-between",
                difference > 0
                  ? "bg-emerald-50 dark:bg-emerald-900/20"
                  : difference < 0
                  ? "bg-rose-50 dark:bg-rose-900/20"
                  : "bg-slate-50 dark:bg-slate-800/30"
              )}>
                <span className="text-sm text-slate-600 dark:text-slate-300">Зміна</span>
                <span className={cn(
                  "text-lg font-bold tabular-nums",
                  difference > 0 ? "text-emerald-600 dark:text-emerald-400" :
                  difference < 0 ? "text-rose-600 dark:text-rose-400" :
                  "text-slate-600 dark:text-slate-300"
                )}>
                  {difference > 0 ? '+' : ''}{difference.toLocaleString('uk-UA')} ₴
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-11 border-slate-200 dark:border-slate-700"
                onClick={() => setBalanceModalOpen(false)}
                disabled={isUpdatingBalance}
              >
                Скасувати
              </Button>
              <Button
                className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900"
                onClick={async () => {
                  if (!selectedCustomerForBalance) return;
                  setIsUpdatingBalance(true);
                  try {
                    const balanceBefore = currentBalance;
                    const result = await updateCustomerBalance(selectedCustomerForBalance.documentId, newBalance);
                    if (result.success) {
                      // Log activity for shift history
                      if (onLogActivity) {
                        onLogActivity('balanceEdit', {
                          customerName: selectedCustomerForBalance.name,
                          customerId: selectedCustomerForBalance.documentId,
                          balanceBefore,
                          balanceAfter: newBalance,
                        });
                      }
                      // Update local state
                      setUpdatedClients((prev) => ({
                        ...prev,
                        [selectedCustomerForBalance.documentId]: {
                          ...prev[selectedCustomerForBalance.documentId],
                          balance: newBalance,
                        },
                      }));
                      // Update selected client if it's the same
                      if (selected?.id === selectedCustomerForBalance.documentId) {
                        setSelected((prev) => prev ? { ...prev, balance: newBalance } : null);
                      }
                      // Refresh customers list if callback provided
                      if (onCustomersUpdate) {
                        onCustomersUpdate();
                      }
                      setBalanceModalOpen(false);
                      setSelectedCustomerForBalance(null);
                      setBalanceAmount("");
                    }
                  } catch (error) {
                    console.error('Failed to update balance:', error);
                  } finally {
                    setIsUpdatingBalance(false);
                  }
                }}
                disabled={isUpdatingBalance || !hasChange}
              >
                {isUpdatingBalance ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Зберегти"
                )}
              </Button>
            </div>
          </div>
        );
      })()}
    </Modal>

    </>
  );
}

function ClientMetric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className={`font-semibold ${highlight ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-admin-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

function MetricBox({ label, value, icon: Icon, tone = "default" }: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "emerald" | "amber" | "rose";
}) {
  const toneStyles = {
    default: "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50",
    emerald: "border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-900/20",
    amber: "border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-900/20",
    rose: "border-rose-200/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-900/20",
  };

  const iconStyles = {
    default: "text-slate-400 dark:text-slate-500",
    emerald: "text-emerald-500 dark:text-emerald-400",
    amber: "text-amber-500 dark:text-amber-400",
    rose: "text-rose-500 dark:text-rose-400",
  };

  return (
    <div className={cn(
      "rounded-xl border p-2.5 sm:p-3 transition-colors",
      toneStyles[tone]
    )}>
      <div className="flex items-center gap-1.5 mb-0.5">
        {Icon && <Icon className={cn("h-3 w-3", iconStyles[tone])} />}
        <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      </div>
      <p className={cn(
        "text-sm font-semibold tabular-nums",
        tone === "emerald" ? "text-emerald-700 dark:text-emerald-400" :
        tone === "amber" ? "text-amber-700 dark:text-amber-400" :
        tone === "rose" ? "text-rose-700 dark:text-rose-400" :
        "text-slate-800 dark:text-slate-200"
      )}>{value}</p>
    </div>
  );
}

