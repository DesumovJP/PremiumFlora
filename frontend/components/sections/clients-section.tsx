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
import { Mail, MapPin, Phone, Plus, X, Loader2, Trash, Download, Check, ChevronDown, Wallet, FileSpreadsheet } from "lucide-react";
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
};

export function ClientsSection({ customers, isLoading = false, onOpenExport, onAddCustomer, onDeleteCustomer, onLogActivity, onPendingPaymentsChange, onCustomersUpdate }: ClientsSectionProps) {
  // State for payment confirmation
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);
  // State for confirmation dialog
  const [paymentToConfirm, setPaymentToConfirm] = useState<Transaction | null>(null);
  // State for balance modal
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState<string>("");
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [selectedCustomerForBalance, setSelectedCustomerForBalance] = useState<Customer | null>(null);
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
                  "border rounded-xl cursor-pointer transition-all duration-200 group bg-white dark:bg-slate-800/60 overflow-hidden",
                  "hover:shadow-md active:scale-[0.99]",
                  selected?.id === client.id
                    ? "border-emerald-400 dark:border-emerald-500 shadow-md ring-1 ring-emerald-200 dark:ring-emerald-500/30"
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
                if (!v) setSelected(null);
              }}
              title="Історія замовлень"
              description={selected?.name}
              size="lg"
              fullscreenOnMobile
            >
              <div className="flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden">
                <div className="space-y-3">
                  <div className="rounded-2xl bg-white dark:bg-admin-surface p-3 text-sm text-slate-700 dark:text-admin-text-secondary">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{selected.contact}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{selected.email}</span>
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <MetricBox label="Замовлень" value={selected.orders.toString()} />
                    <MetricBox label="Витрачено" value={`${selected.spent.toLocaleString("uk-UA")} грн`} />
                    <MetricBox label="Останнє" value={selected.lastOrder} />
                  </div>

                  {/* Balance section */}
                  <div className={cn(
                    "rounded-xl border p-3",
                    (selected.balance || 0) > 0
                      ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-900/20"
                      : (selected.balance || 0) < 0
                      ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-900/20"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Баланс
                      </span>
                      <span className={cn(
                        "text-lg font-bold",
                        (selected.balance || 0) > 0
                          ? "text-emerald-700 dark:text-emerald-400"
                          : (selected.balance || 0) < 0
                          ? "text-rose-700 dark:text-rose-400"
                          : "text-slate-600 dark:text-slate-400"
                      )}>
                        {(selected.balance || 0) > 0 ? '+' : ''}{(selected.balance || 0).toLocaleString('uk-UA')} грн
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {(selected.balance || 0) > 0 ? 'Клієнт має переплату' : (selected.balance || 0) < 0 ? 'Клієнт має заборгованість' : 'Баланс по нулях'}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const customer = customers.find(c => c.documentId === selected.id);
                        if (customer) {
                          setSelectedCustomerForBalance(customer);
                          setBalanceAmount((customer.balance || 0).toString());
                          setBalanceModalOpen(true);
                        }
                      }}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Змінити баланс
                    </Button>
                  </div>

                  {/* Export client transactions button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const customer = customers.find(c => c.documentId === selected.id);
                      if (customer) {
                        exportClientTransactions(customer, transactions, customer.balance || 0);
                      }
                    }}
                    disabled={isLoadingTransactions}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Експортувати історію
                  </Button>
                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                  {isLoadingTransactions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                    </div>
                  ) : Array.isArray(transactions) && transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.map((transaction) => {
                        const itemsCount = Array.isArray(transaction.items) ? transaction.items.length : 0;
                        const isExpanded = expandedTransactions.has(transaction.documentId);

                        return (
                          <div
                            key={transaction.documentId}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden transition-all"
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
                              className="w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white text-sm">
                                  {new Date(transaction.date).toLocaleDateString('uk-UA', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {new Date(transaction.date).toLocaleTimeString('uk-UA', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })} · {itemsCount} позицій
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  {transaction.paymentStatus === 'cancelled' ? (
                                    <p className="font-medium text-slate-400 line-through text-sm">
                                      {transaction.amount?.toLocaleString('uk-UA') || '—'} грн
                                    </p>
                                  ) : transaction.paymentStatus === 'paid' ? (
                                    <p className="font-medium text-emerald-600 dark:text-emerald-400 text-sm">
                                      {transaction.amount?.toLocaleString('uk-UA') || '—'} грн
                                    </p>
                                  ) : (
                                    // Очікується оплата - показуємо деталізацію
                                    <div className="space-y-0.5">
                                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                                        {transaction.amount?.toLocaleString('uk-UA') || '—'} грн
                                      </p>
                                      {(transaction.paidAmount || 0) > 0 && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                          Сплачено: {transaction.paidAmount?.toLocaleString('uk-UA')} грн
                                        </p>
                                      )}
                                      <p className="text-xs text-rose-600 dark:text-rose-400">
                                        В борг: {((transaction.amount || 0) - (transaction.paidAmount || 0)).toLocaleString('uk-UA')} грн
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <ChevronDown className={cn(
                                  "h-5 w-5 text-slate-400 transition-transform shrink-0",
                                  isExpanded && "rotate-180"
                                )} />
                              </div>
                            </div>
                            </button>

                            {/* Розгорнутий контент */}
                            {isExpanded && (
                              <div className="border-t border-slate-100 dark:border-slate-700 p-3 space-y-3 bg-slate-50/50 dark:bg-slate-800/50">
                                {/* Позиції замовлення */}
                                {Array.isArray(transaction.items) && transaction.items.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Позиції:</p>
                                    <div className="space-y-1">
                                      {transaction.items.map((item, idx) => (
                                        <div key={idx} className="flex items-start justify-between gap-2 text-sm bg-white dark:bg-slate-800 rounded-lg p-2">
                                          <span className="text-slate-700 dark:text-slate-300 flex-1">
                                            {item.name} {item.length ? `(${item.length}см)` : ''} × {item.qty}
                                          </span>
                                          <span className="text-slate-900 dark:text-white font-medium">
                                            {((item.subtotal || item.price * item.qty) || 0)?.toLocaleString('uk-UA') || '—'} грн
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Коментар */}
                                {transaction.notes && (
                                  <div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Коментар:</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg p-2">{transaction.notes}</p>
                                  </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-2">
                                  {(transaction.paymentStatus === 'expected' || transaction.paymentStatus === 'pending') && (
                                    <Button
                                      size="sm"
                                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
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
                                    className={transaction.paymentStatus === 'cancelled' ? 'w-full' : ''}
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
                                      className="text-xs text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors px-2"
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
                    <div className="flex items-center justify-center py-8 text-center">
                      <p className="text-sm text-slate-400">
                        Немає замовлень
                      </p>
                    </div>
                  )}
                  </div>

                  {/* Delete client button */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                    <button
                      className="text-xs text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
                      onClick={() => {
                        handleDeleteClick(new MouseEvent('click') as unknown as React.MouseEvent, selected);
                        setSelected(null);
                      }}
                    >
                      <Trash className="h-3 w-3" />
                      Видалити
                    </button>
                  </div>
                </div>
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
      title="Змінити баланс клієнта"
      description={selectedCustomerForBalance?.name}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => setBalanceModalOpen(false)} disabled={isUpdatingBalance}>
            Скасувати
          </Button>
          <Button
            onClick={async () => {
              if (!selectedCustomerForBalance) return;
              const newBalance = parseFloat(balanceAmount) || 0;
              setIsUpdatingBalance(true);
              try {
                const balanceBefore = selectedCustomerForBalance.balance || 0;
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
            disabled={isUpdatingBalance}
            className="bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200"
          >
            {isUpdatingBalance ? <Loader2 className="h-4 w-4 animate-spin" /> : "Зберегти"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-admin-text-secondary">
            Баланс (грн)
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Додатнє значення = переплата клієнта, від'ємне = борг клієнта
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const current = parseFloat(balanceAmount) || 0;
              setBalanceAmount((current + 100).toString());
            }}
          >
            +100
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const current = parseFloat(balanceAmount) || 0;
              setBalanceAmount((current + 500).toString());
            }}
          >
            +500
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const current = parseFloat(balanceAmount) || 0;
              setBalanceAmount((current + 1000).toString());
            }}
          >
            +1000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const current = parseFloat(balanceAmount) || 0;
              setBalanceAmount((current - 100).toString());
            }}
          >
            -100
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const current = parseFloat(balanceAmount) || 0;
              setBalanceAmount((current - 500).toString());
            }}
          >
            -500
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const current = parseFloat(balanceAmount) || 0;
              setBalanceAmount((current - 1000).toString());
            }}
          >
            -1000
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-slate-500"
          onClick={() => setBalanceAmount("0")}
        >
          Скинути на 0
        </Button>
      </div>
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

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-admin-border bg-white/80 dark:bg-admin-surface p-2 sm:p-3">
      <p className="text-xs uppercase text-slate-400 dark:text-admin-text-muted">{label}</p>
      <p className="text-xs font-semibold text-slate-900 dark:text-admin-text-primary sm:text-sm">{value}</p>
    </div>
  );
}

