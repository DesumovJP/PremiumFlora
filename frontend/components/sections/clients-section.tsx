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
import { StatPill } from "@/components/ui/stat-pill";
import { Client } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Mail, MapPin, Phone, Plus, X, Loader2, Trash, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import type { Customer, Transaction } from "@/lib/api-types";
import { getTransactions } from "@/lib/strapi";

type ClientsSectionProps = {
  customers: Customer[];
  isLoading?: boolean;
  onOpenExport: () => void;
  onAddCustomer: (data: { name: string; phone: string; email: string; address: string }) => Promise<void>;
  onDeleteCustomer: (documentId: string) => Promise<void>;
};

export function ClientsSection({ customers, isLoading = false, onOpenExport, onAddCustomer, onDeleteCustomer }: ClientsSectionProps) {
  // Convert Customer to Client for display
  const baseClients: Client[] = useMemo(() => {
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
    }));
  }, [customers]);

  // Локальний стан для оновлених даних клієнтів (після завантаження транзакцій)
  const [updatedClients, setUpdatedClients] = useState<Record<string, Partial<Client>>>({});

  // Об'єднуємо базові дані з оновленими
  const clients: Client[] = useMemo(() => {
    return baseClients.map((client) => {
      const updates = updatedClients[client.id];
      return updates ? { ...client, ...updates } : client;
    });
  }, [baseClients, updatedClients]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
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

        // Рахуємо суму очікуваних оплат
        const pendingPayment = result.data
          .filter(t => t.paymentStatus === 'expected')
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

              // Рахуємо суму очікуваних оплат
              const pendingPayment = result.data
                .filter(t => t.paymentStatus === 'expected')
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

  const totalSpent = clients.reduce((acc, c) => acc + c.spent, 0);
  const totalOrders = clients.reduce((acc, c) => acc + c.orders, 0);
  const avgOrder = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
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

  return (
    <>
    <Card className="admin-card border border-slate-100 dark:border-[#30363d] bg-white/90 dark:bg-admin-surface shadow-md">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-2xl">Клієнти</CardTitle>
          <CardDescription>Управління базою клієнтів та історією замовлень</CardDescription>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <Input
            placeholder="Пошук клієнтів..."
            className="w-full sm:w-56"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-row">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
              onClick={onOpenExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Експортувати
            </Button>
            <Button className="w-full sm:w-auto" onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Додати клієнта
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatPill label="Всього клієнтів" value={searchQuery ? `${filteredClients.length} / ${clients.length}` : clients.length.toString()} />
          <StatPill label="Загальна виручка" value={`${totalSpent.toLocaleString("uk-UA")} грн`} />
          <StatPill label="Середній чек" value={`${avgOrder.toLocaleString("uk-UA")} грн`} />
        </div>
        {/* Мобільна історія — прибрано, тепер використовується модалка */}
        {false && selected && (
          <div className="sm:hidden">
            <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-900/20 shadow-md shadow-emerald-200/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-emerald-900">Історія замовлень</CardTitle>
                    <CardDescription className="text-emerald-800">{selected?.name}</CardDescription>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-full p-2 text-slate-500 dark:text-admin-text-tertiary transition hover:bg-slate-100 dark:hover:bg-admin-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                    aria-label="Закрити історію"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 rounded-2xl bg-white dark:bg-admin-surface p-3 text-sm text-slate-700 dark:text-admin-text-secondary">
                  <p className="font-semibold text-slate-900 dark:text-admin-text-primary">{selected?.name}</p>
                  <p className="text-slate-500 dark:text-admin-text-tertiary">{selected?.city}</p>
                  <div className="space-y-1 pt-2">
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      {selected?.contact}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      {selected?.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <MetricBox label="Замовлень" value={selected?.orders?.toString() ?? '0'} />
                  <MetricBox label="Витрачено" value={`${selected?.spent?.toLocaleString("uk-UA") ?? 0} грн`} />
                  <MetricBox label="Останнє" value={selected?.lastOrder ?? ''} />
                </div>
                <ScrollArea className="max-h-[20rem] pr-2">
                  {isLoadingTransactions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                    </div>
                  ) : Array.isArray(transactions) && transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.map((transaction) => {
                        const itemsCount = Array.isArray(transaction.items) ? transaction.items.length : 0;
                        return (
                          <div
                            key={transaction.documentId}
                            className="rounded-xl border border-slate-200 dark:border-admin-border bg-white dark:bg-admin-surface p-3 text-sm"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 dark:text-admin-text-primary">
                                  {new Date(transaction.date).toLocaleDateString('uk-UA', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-admin-text-tertiary">
                                  {new Date(transaction.date).toLocaleTimeString('uk-UA', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })} · {itemsCount} позицій
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-emerald-700">
                                  {transaction.amount?.toLocaleString('uk-UA') || 0} грн
                                </p>
                                <Badge
                                  tone={
                                    transaction.paymentStatus === 'paid'
                                      ? 'success'
                                      : transaction.paymentStatus === 'expected'
                                      ? 'warning'
                                      : 'neutral'
                                  }
                                  className="text-xs"
                                >
                                  {transaction.paymentStatus === 'paid'
                                    ? 'Оплачено'
                                    : transaction.paymentStatus === 'expected'
                                    ? 'Очікується'
                                    : 'В очікуванні'}
                                </Badge>
                              </div>
                            </div>
                            {Array.isArray(transaction.items) && transaction.items.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                                {transaction.items.map((item, idx) => (
                                  <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                                    <span className="text-slate-700 dark:text-admin-text-secondary flex-1">
                                      {item.name} {item.length ? `(${item.length}см)` : ''} × {item.qty}
                                    </span>
                                    <span className="text-slate-600 dark:text-admin-text-secondary font-medium">
                                      {((item.subtotal || item.price * item.qty) || 0).toLocaleString('uk-UA')} грн
                                    </span>
                                  </div>
                                ))}
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
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
        <div className={selected ? "grid gap-4 lg:grid-cols-[1.8fr_1fr]" : "grid gap-4"}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-stagger">
            {filteredClients.length === 0 && searchQuery ? (
              <div className="col-span-full text-center py-8 text-slate-500 dark:text-admin-text-tertiary">
                Клієнтів за запитом "{searchQuery}" не знайдено
              </div>
            ) : null}
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className={cn(
                  "admin-card border-slate-100 dark:border-[#30363d] cursor-pointer hover-lift animate-fade-in",
                  selected?.id === client.id ? "border-emerald-300 dark:border-emerald-500 shadow-md ring-2 ring-emerald-200 dark:ring-emerald-500/30" : ""
                )}
                onClick={() => handleSelect(client)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle>{client.name}</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-admin-text-secondary">{client.city}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {client.isVip && <Badge tone="success">VIP</Badge>}
                      <button
                        onClick={(e) => handleDeleteClick(e, client)}
                        className="rounded-full p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                        aria-label="Видалити клієнта"
                        title="Видалити клієнта"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {client.pendingPayment && client.pendingPayment > 0 && (
                    <Badge tone="warning" className="mt-2 w-fit">
                      Очікується оплата: {client.pendingPayment.toLocaleString('uk-UA')} грн
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-admin-text-secondary sm:text-sm">
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-600 sm:h-4 sm:w-4" />
                      <span className="truncate">{client.contact}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-emerald-600 sm:h-4 sm:w-4" />
                      <span className="truncate">{client.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate col-span-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 sm:h-4 sm:w-4" />
                      <span className="truncate">{client.city}</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <MetricBox label="Замовлень" value={client.orders.toString()} />
                    <MetricBox label="Витрачено" value={`${client.spent.toLocaleString("uk-UA")} грн`} />
                    <MetricBox label="Останнє" value={client.lastOrder} />
                  </div>
                </CardContent>
              </Card>
            ))}
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
              size="md"
            >
              <ScrollArea className="max-h-[calc(100vh-12rem)] pr-2">
                <div className="space-y-3">
                  <div className="space-y-2 rounded-2xl bg-white dark:bg-admin-surface p-3 text-sm text-slate-700 dark:text-admin-text-secondary">
                    <p className="font-semibold text-slate-900">{selected.name}</p>
                    <p className="text-slate-500">{selected.city}</p>
                    <div className="space-y-1 pt-2">
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        {selected.contact}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-emerald-600" />
                        {selected.email}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <MetricBox label="Замовлень" value={selected.orders.toString()} />
                    <MetricBox label="Витрачено" value={`${selected.spent.toLocaleString("uk-UA")} грн`} />
                    <MetricBox label="Останнє" value={selected.lastOrder} />
                  </div>
                  {selected.pendingPayment && selected.pendingPayment > 0 && (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-900/20 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Очікується оплата</span>
                        <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
                          {selected.pendingPayment.toLocaleString('uk-UA')} грн
                        </span>
                      </div>
                    </div>
                  )}
                  <div>
                  {isLoadingTransactions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                    </div>
                  ) : Array.isArray(transactions) && transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.map((transaction) => {
                        const itemsCount = Array.isArray(transaction.items) ? transaction.items.length : 0;
                        return (
                          <div
                            key={transaction.documentId}
                            className="rounded-xl border border-slate-200 dark:border-admin-border bg-white dark:bg-admin-surface p-3 text-sm"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 dark:text-admin-text-primary">
                                  {new Date(transaction.date).toLocaleDateString('uk-UA', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-admin-text-tertiary">
                                  {new Date(transaction.date).toLocaleTimeString('uk-UA', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })} · {itemsCount} позицій
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-emerald-700">
                                  {transaction.amount?.toLocaleString('uk-UA') || 0} грн
                                </p>
                                <Badge
                                  tone={
                                    transaction.paymentStatus === 'paid'
                                      ? 'success'
                                      : transaction.paymentStatus === 'expected'
                                      ? 'warning'
                                      : 'neutral'
                                  }
                                  className="text-xs"
                                >
                                  {transaction.paymentStatus === 'paid'
                                    ? 'Оплачено'
                                    : transaction.paymentStatus === 'expected'
                                    ? 'Очікується'
                                    : 'В очікуванні'}
                                </Badge>
                              </div>
                            </div>
                            {Array.isArray(transaction.items) && transaction.items.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                                {transaction.items.map((item, idx) => (
                                  <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                                    <span className="text-slate-700 dark:text-admin-text-secondary flex-1">
                                      {item.name} {item.length ? `(${item.length}см)` : ''} × {item.qty}
                                    </span>
                                    <span className="text-slate-600 dark:text-admin-text-secondary font-medium">
                                      {((item.subtotal || item.price * item.qty) || 0).toLocaleString('uk-UA')} грн
                                    </span>
                                  </div>
                                ))}
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
                </div>
              </ScrollArea>
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
      <div className="grid gap-3">
        <Input
          placeholder="Ім'я або назва компанії"
          value={newClient.name}
          onChange={(e) => setNewClient((d) => ({ ...d, name: e.target.value }))}
        />
        <Input
          placeholder="Телефон"
          value={newClient.phone}
          onChange={(e) => setNewClient((d) => ({ ...d, phone: e.target.value }))}
        />
        <Input
          placeholder="Email"
          value={newClient.email}
          onChange={(e) => setNewClient((d) => ({ ...d, email: e.target.value }))}
        />
        <Input
          placeholder="Місто / адреса"
          value={newClient.city}
          onChange={(e) => setNewClient((d) => ({ ...d, city: e.target.value }))}
        />
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
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200"
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

