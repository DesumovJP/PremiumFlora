import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Modal } from "@/components/ui/modal";
import { CartLine, Client, Product, Variant } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Minus,
  Plus,
  Search,
  Trash,
  LayoutGrid,
  Package,
  CheckCircle2,
  User,
  UserPlus,
  Check,
  ChevronDown,
  Clock,
  MessageSquare,
  Percent,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";

type PosSectionProps = {
  products: Product[];
  clients: Client[];
  search: string;
  onSearch: (value: string) => void;
  selectedClient?: string;
  onClientChange: (value: string) => void;
  cart: CartLine[];
  onAdd: (product: Product, variant: Variant) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  cartTotal: number;
  onCheckout?: () => Promise<void>;
  isCheckingOut?: boolean;
  renderOnlyCart?: boolean;
  hideDesktopCart?: boolean;
  paymentStatus?: 'paid' | 'expected';
  onPaymentStatusChange?: (status: 'paid' | 'expected') => void;
  comment?: string;
  onCommentChange?: (value: string) => void;
  onAddCustomer?: (data: { name: string; phone: string; email: string; address: string }) => Promise<void>;
};

export function PosSection({
  products,
  clients,
  search,
  onSearch,
  selectedClient,
  onClientChange,
  cart,
  onAdd,
  onUpdateQty,
  onRemove,
  cartTotal,
  onCheckout,
  isCheckingOut = false,
  renderOnlyCart = false,
  hideDesktopCart = false,
  paymentStatus = 'expected',
  onPaymentStatusChange,
  comment = '',
  onCommentChange,
  onAddCustomer,
}: PosSectionProps) {
  if (renderOnlyCart) {
    return (
      <CartPanel
        clients={clients}
        selectedClient={selectedClient}
        onClientChange={onClientChange}
        cart={cart}
        onUpdateQty={onUpdateQty}
        onRemove={onRemove}
        cartTotal={cartTotal}
        onCheckout={onCheckout}
        isCheckingOut={isCheckingOut}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={onPaymentStatusChange}
        comment={comment}
        onCommentChange={onCommentChange}
        onAddCustomer={onAddCustomer}
      />
    );
  }

  const [gridMode, setGridMode] = useState<"full" | "half">("full");

  return (
    <div className="space-y-2 sm:space-y-3">
      <Card className="admin-card border border-slate-100 dark:border-[var(--admin-border)] bg-white/90 dark:bg-admin-surface shadow-md shadow-emerald-500/5">
        <CardHeader className="flex flex-col gap-2 p-3 sm:p-6 sm:gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center justify-between gap-2 sm:gap-3">
            <div>
              <CardTitle className="text-xl sm:text-2xl">POS Термінал</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Швидке оформлення замовлення та контроль складу</CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-2 sm:gap-0">
              <div className="relative flex-1 min-w-0 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Пошук квітів..."
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <div className="sm:hidden">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setGridMode((prev) => (prev === "full" ? "half" : "full"))}
                  aria-label="Перемкнути вигляд товарів"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-3 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
          <div
            className={cn(
              "grid gap-2 sm:gap-3 animate-stagger",
              gridMode === "full"
                ? "grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] xl:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]"
                : "grid-cols-1"
            )}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAdd}
                compact={gridMode === "half"}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Групуємо позиції кошика за назвою товару
type GroupedCartItem = {
  name: string;
  image?: string;
  lines: CartLine[];
  total: number;
};

function groupCartItems(cart: CartLine[]): GroupedCartItem[] {
  const groups: Record<string, GroupedCartItem> = {};

  cart.forEach((line) => {
    if (!groups[line.name]) {
      groups[line.name] = {
        name: line.name,
        image: line.image,
        lines: [],
        total: 0,
      };
    }
    groups[line.name].lines.push(line);
    groups[line.name].total += line.price * line.qty;
  });

  return Object.values(groups);
}

function CartPanel({
  clients,
  selectedClient,
  onClientChange,
  cart,
  onUpdateQty,
  onRemove,
  cartTotal,
  onCheckout,
  isCheckingOut = false,
  paymentStatus = 'expected',
  onPaymentStatusChange,
  comment = '',
  onCommentChange,
  onAddCustomer,
}: {
  clients: Client[];
  selectedClient?: string;
  onClientChange: (v: string) => void;
  cart: CartLine[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  cartTotal: number;
  onCheckout?: () => Promise<void>;
  isCheckingOut?: boolean;
  paymentStatus?: 'paid' | 'expected';
  onPaymentStatusChange?: (status: 'paid' | 'expected') => void;
  comment?: string;
  onCommentChange?: (value: string) => void;
  onAddCustomer?: (data: { name: string; phone: string; email: string; address: string }) => Promise<void>;
}) {
  const [discount, setDiscount] = useState<number>(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showComment, setShowComment] = useState(!!comment);

  // Client selection modal state
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', address: '' });
  const [isSavingClient, setIsSavingClient] = useState(false);

  const payable = Math.max(0, cartTotal - discount);
  const canCheckout = selectedClient && cart.length > 0 && !isCheckingOut;
  const groupedCart = groupCartItems(cart);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  // Filter clients by search
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const search = clientSearch.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.contact?.toLowerCase().includes(search) ||
      c.city?.toLowerCase().includes(search)
    );
  }, [clients, clientSearch]);

  const selectedClientObj = clients.find(c => c.id === selectedClient);

  const handleSelectClient = (clientId: string) => {
    onClientChange(clientId);
    setClientModalOpen(false);
    setClientSearch('');
  };

  const handleAddClient = async () => {
    if (!onAddCustomer || !newClient.name.trim()) return;
    setIsSavingClient(true);
    try {
      await onAddCustomer(newClient);
      setNewClient({ name: '', phone: '', email: '', address: '' });
      setShowAddClientForm(false);
    } finally {
      setIsSavingClient(false);
    }
  };

  return (
    <>
    <Card className="admin-card flex h-full max-h-full flex-col border border-slate-100 dark:border-[var(--admin-border)] bg-white dark:bg-admin-surface-elevated shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-none overflow-hidden">
      {/* Header - Compact and clean */}
      <CardHeader className="pb-3 p-4 sm:p-5 sm:pb-4 border-b border-slate-100 dark:border-[var(--admin-border)]">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg sm:text-xl font-semibold tracking-tight">Кошик</CardTitle>
            {cart.length > 0 && (
              <Badge tone="success" className="text-xs font-medium px-2 py-0.5">
                {totalItems} шт
              </Badge>
            )}
          </div>
        </div>
        {/* Client selector - opens modal */}
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal h-11 px-4",
            !selectedClientObj && "border-dashed border-slate-300 dark:border-admin-border"
          )}
          onClick={() => setClientModalOpen(true)}
        >
          <span className="flex items-center gap-3 truncate">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
              selectedClientObj
                ? "bg-emerald-100 dark:bg-emerald-900/30"
                : "bg-slate-100 dark:bg-admin-surface"
            )}>
              <User className={cn(
                "h-4 w-4",
                selectedClientObj
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400"
              )} />
            </div>
            <span className={cn(
              "text-sm",
              selectedClientObj
                ? "text-slate-900 dark:text-admin-text-primary font-medium"
                : "text-slate-500 dark:text-admin-text-muted"
            )}>
              {selectedClientObj?.name || "Оберіть клієнта"}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </CardHeader>

      {/* Cart Items */}
      <CardContent className="flex-1 min-h-0 pt-0 p-0">
        <ScrollArea className="h-full max-h-none">
          {cart.length === 0 ? (
            <div className="flex h-full items-center justify-center py-12">
              <EmptyCart />
            </div>
          ) : (
            <div className="p-4 sm:p-5 space-y-3">
              {groupedCart.map((group) => (
                <CartGroupItem
                  key={group.name}
                  group={group}
                  onRemove={onRemove}
                  onUpdateQty={onUpdateQty}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Footer - Order Summary */}
      <CardFooter className="flex flex-col gap-0 p-0 shrink-0 border-t border-[var(--admin-border)] bg-[var(--admin-bg)]">
        {/* All content in one wrapper */}
        <div className="w-full p-4 sm:p-5 space-y-4">
          {/* Payment Status Toggle */}
          {onPaymentStatusChange && (
            <div className="flex rounded-xl bg-[var(--admin-surface)] p-1 gap-1 border border-[var(--admin-border)]">
              <button
                type="button"
                onClick={() => onPaymentStatusChange('paid')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
                  paymentStatus === 'paid'
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                    : "text-[var(--admin-text-tertiary)] hover:bg-[var(--admin-bg)]"
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
                Сплачено
              </button>
              <button
                type="button"
                onClick={() => onPaymentStatusChange('expected')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
                  paymentStatus === 'expected'
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                    : "text-[var(--admin-text-tertiary)] hover:bg-[var(--admin-bg)]"
                )}
              >
                <Clock className="h-4 w-4" />
                В борг
              </button>
            </div>
          )}

          {/* Order Summary */}
          <div className="space-y-2">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--admin-text-tertiary)]">Сума товарів</span>
              <span className="text-sm font-medium text-[var(--admin-text-secondary)]">{Math.round(cartTotal)} ₴</span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--admin-text-tertiary)]">Знижка</span>
              {!showDiscount ? (
                <button
                  type="button"
                  onClick={() => setShowDiscount(true)}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-all rounded-md px-2 py-1 -mr-2",
                    discount > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-[var(--admin-text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400"
                  )}
                >
                  {discount > 0 ? (
                    <>−{discount} ₴</>
                  ) : (
                    <>
                      <Percent className="h-3.5 w-3.5" />
                      <span>Додати</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-[var(--admin-text-muted)]">−</span>
                  <Input
                    type="number"
                    className="h-7 w-16 text-right text-sm px-2 font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={discount || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDiscount(Math.max(0, Number(val) || 0));
                    }}
                    onBlur={() => setShowDiscount(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setShowDiscount(false)}
                    autoFocus
                    placeholder="0"
                  />
                  <span className="text-sm text-[var(--admin-text-muted)]">₴</span>
                </div>
              )}
            </div>
          </div>

          {/* Comment */}
          {onCommentChange && (
            <>
              {!showComment ? (
                <button
                  type="button"
                  onClick={() => setShowComment(true)}
                  className={cn(
                    "flex items-center gap-2 text-sm transition-all rounded-lg px-3 py-2 w-full border border-dashed",
                    comment
                      ? "text-[var(--admin-text-secondary)] border-[var(--admin-border)] bg-[var(--admin-surface)]"
                      : "text-[var(--admin-text-muted)] border-[var(--admin-border-subtle)] hover:border-[var(--admin-border)] hover:text-[var(--admin-text-tertiary)]"
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  {comment ? (
                    <span className="truncate text-left">{comment}</span>
                  ) : (
                    <span>Додати коментар</span>
                  )}
                </button>
              ) : (
                <div className="relative">
                  <textarea
                    value={comment}
                    onChange={(e) => onCommentChange(e.target.value)}
                    placeholder="Коментар до замовлення..."
                    className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] pl-3 pr-8 py-2.5 text-sm text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none resize-none transition-all"
                    rows={2}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowComment(false);
                      if (!comment) onCommentChange('');
                    }}
                    className="absolute top-2 right-2 p-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Total & Checkout */}
          <div className="pt-3 border-t border-[var(--admin-border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--admin-text-tertiary)]">До сплати</span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--admin-text-primary)] tracking-tight">
                {Math.round(payable)} <span className="text-lg font-semibold text-[var(--admin-text-muted)]">₴</span>
              </span>
            </div>

            <Button
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:shadow-none"
              disabled={!canCheckout}
              onClick={onCheckout}
            >
              {isCheckingOut ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Оформлення...
                </span>
              ) : (
                "Оформити замовлення"
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>

    {/* Client Selection Modal */}
    <Modal
      open={clientModalOpen}
      onOpenChange={(open) => {
        setClientModalOpen(open);
        if (!open) {
          setClientSearch('');
          setShowAddClientForm(false);
          setNewClient({ name: '', phone: '', email: '', address: '' });
        }
      }}
      title="Оберіть клієнта"
      description={showAddClientForm ? "Заповніть дані нового клієнта" : `${clients.length} клієнтів доступно`}
    >
      {showAddClientForm ? (
        <div className="space-y-3">
          <Input
            placeholder="Ім'я клієнта *"
            value={newClient.name}
            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
          />
          <Input
            placeholder="Телефон"
            value={newClient.phone}
            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
          />
          <Input
            placeholder="Місто / Адреса"
            value={newClient.address}
            onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
          />
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowAddClientForm(false);
                setNewClient({ name: '', phone: '', email: '', address: '' });
              }}
              disabled={isSavingClient}
            >
              Назад
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddClient}
              disabled={!newClient.name.trim() || isSavingClient}
            >
              {isSavingClient ? "Збереження..." : "Додати"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Пошук клієнта..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Add Client Button */}
          {onAddCustomer && (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              onClick={() => setShowAddClientForm(true)}
            >
              <UserPlus className="h-4 w-4" />
              Додати нового клієнта
            </Button>
          )}

          {/* Client List */}
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-1">
              {filteredClients.length === 0 ? (
                <p className="text-center text-sm text-slate-500 dark:text-admin-text-muted py-4">
                  {clientSearch ? "Клієнтів не знайдено" : "Немає клієнтів"}
                </p>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      selectedClient === client.id
                        ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700"
                        : "hover:bg-[var(--admin-bg)] dark:hover:bg-slate-700 border border-transparent"
                    )}
                    onClick={() => handleSelectClient(client.id)}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-admin-surface">
                      <User className="h-4 w-4 text-slate-500 dark:text-admin-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-admin-text-primary truncate">
                        {client.name}
                      </p>
                      {client.city && (
                        <p className="text-xs text-slate-500 dark:text-admin-text-tertiary truncate">
                          {client.city}
                        </p>
                      )}
                    </div>
                    {selectedClient === client.id && (
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </Modal>
    </>
  );
}

function ProductCard({
  product,
  onAdd,
  compact = false,
}: {
  product: Product;
  onAdd: (product: Product, variant: Variant) => void;
  compact?: boolean;
}) {
  const [addedVariants, setAddedVariants] = useState<Set<string>>(new Set());

  const handleAdd = (variant: Variant) => {
    onAdd(product, variant);
    const variantKey = `${product.id}-${variant.size}`;
    setAddedVariants((prev) => new Set([...prev, variantKey]));
    // Прибираємо галочку через 2 секунди
    setTimeout(() => {
      setAddedVariants((prev) => {
        const next = new Set(prev);
        next.delete(variantKey);
        return next;
      });
    }, 2000);
  };

  // Перевірка наявності варіантів
  if (!product.variants || product.variants.length === 0) {
    return (
      <Card
        className={cn(
          "overflow-hidden border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/60 shadow-sm shadow-emerald-500/5",
          compact && "text-sm"
        )}
      >
        <CardContent className="p-3">
          <div className="text-center text-xs text-slate-500 dark:text-admin-text-tertiary">
            <p className="font-semibold">{product.name}</p>
            <p className="mt-1 text-xs">Немає варіантів</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const firstVariant = product.variants[0];
  const totalStock = product.variants.reduce((sum, v) => sum + (v?.stock || 0), 0);
  const variants = product.variants.filter((variant) => variant != null);
  const isCompactGrid = variants.length >= 3;

  // Horizontal layout for compact mode (mobile "half" grid)
  if (compact) {
    return (
      <Card
        className="overflow-hidden border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/60 shadow-sm shadow-emerald-500/5 w-full"
      >
        <div className="flex items-center">
          {/* Left: Image thumbnail */}
          <div className="w-16 h-16 shrink-0 overflow-hidden bg-slate-100 dark:bg-admin-surface rounded-md m-1.5">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-admin-text-muted">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {/* Right: Name and variants */}
          <div className="flex-1 min-w-0 p-2 space-y-1.5">
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-bold text-[var(--admin-text-primary)] text-sm leading-snug line-clamp-1">
                {product.name}
              </h3>
              {firstVariant && (
                <Badge
                  tone="success"
                  className="shrink-0 px-2 py-1 text-[10px] leading-none font-bold shadow-sm"
                >
                  {totalStock} шт
                </Badge>
              )}
            </div>
            {/* Variants grid - always 2 columns */}
            <div className="grid grid-cols-2 gap-1">
              {variants.map((variant) => {
                const stock = variant?.stock ?? 0;
                const price = variant?.price ?? 0;
                const size = variant?.size ?? "N/A";
                const variantKey = `${product.id}-${variant.size}`;
                const isAdded = addedVariants.has(variantKey);

                return (
                  <div
                    key={variant.size || Math.random()}
                    className={cn(
                      "relative flex items-center justify-between px-1.5 py-1 rounded-md border min-w-0 gap-1",
                      isAdded
                        ? "border-emerald-500 dark:border-emerald-500 bg-emerald-100/80 dark:bg-emerald-900/40 animate-bounce-in"
                        : "border-slate-200 dark:border-slate-600 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/30 pos-variant-item",
                      "cursor-pointer transition-all duration-200 overflow-hidden hover-scale"
                    )}
                    onClick={() => variant && handleAdd(variant)}
                  >
                    {isAdded && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-emerald-500/90 backdrop-blur-sm animate-fade-in">
                        <div className="flex items-center justify-center rounded-full bg-white dark:bg-admin-surface p-0.5 shadow-lg animate-scale-in">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-start gap-0.5 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-admin-text-primary text-[10px] leading-tight truncate">
                        {size}
                      </p>
                      <div
                        className={cn(
                          "flex items-center gap-0.5",
                          stock >= 300
                            ? "text-emerald-600 dark:text-emerald-400"
                            : stock >= 150
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                        )}
                        title={`${stock} шт на складі`}
                      >
                        <Package className="h-2 w-2 shrink-0" />
                        <span className="font-medium text-[9px]">{stock}</span>
                      </div>
                    </div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-[10px] shrink-0">
                      {Math.round(price)}₴
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Standard vertical layout
  return (
    <Card
      className={cn(
        "overflow-hidden border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/60 shadow-sm shadow-emerald-500/5",
        "w-full"
      )}
    >
      {/* Image with name overlay */}
      <div className={cn("relative w-full overflow-hidden bg-slate-100 dark:bg-admin-surface", "h-20 sm:h-28")}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-admin-text-muted">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Gradient overlay with name - improved readability */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-black dark:via-black/70 dark:to-transparent px-2.5 pb-2 pt-8 sm:px-3 sm:pb-2.5 sm:pt-10">
          <div className="flex items-end justify-between gap-2">
            <h3
              className="font-bold leading-snug line-clamp-2 text-slate-900 dark:text-white text-sm sm:text-base drop-shadow-sm"
            >
              {product.name}
            </h3>
            {firstVariant && (
              <Badge
                tone="success"
                className="shrink-0 px-2 py-1 text-[10px] sm:text-xs leading-none font-bold shadow-sm"
              >
                {totalStock} шт
              </Badge>
            )}
          </div>
        </div>
      </div>
      <CardContent
        className="p-2 pt-2 sm:p-3 sm:pt-2 overflow-hidden"
      >
        {/* Завжди сітка 2x2 для консистентної висоти */}
        <div className="grid grid-cols-2 gap-1.5 min-h-[4.5rem] sm:min-h-[5rem]">
          {variants.slice(0, 4).map((variant) => {
            const stock = variant?.stock ?? 0;
            const price = variant?.price ?? 0;
            const size = variant?.size ?? "N/A";
            const variantKey = `${product.id}-${variant.size}`;
            const isAdded = addedVariants.has(variantKey);

            return (
              <div
                key={variant.size || Math.random()}
                className={cn(
                  "relative flex items-center justify-between rounded-md border min-w-0 px-1.5 py-1.5 sm:px-2 sm:py-2 gap-1",
                  isAdded
                    ? "border-emerald-500 dark:border-emerald-500 bg-emerald-100/80 dark:bg-emerald-900/40 animate-bounce-in"
                    : "border-slate-200 dark:border-slate-600 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/30 pos-variant-item",
                  "cursor-pointer transition-all duration-200 overflow-hidden hover-scale"
                )}
                onClick={() => variant && handleAdd(variant)}
              >
                {isAdded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-emerald-500/90 backdrop-blur-sm animate-fade-in">
                    <div className="flex items-center justify-center rounded-full bg-white dark:bg-admin-surface p-1 shadow-lg animate-scale-in">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-start gap-0.5 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-admin-text-primary text-[10px] sm:text-xs leading-tight truncate">
                    {size}
                  </p>
                  <div
                    className={cn(
                      "flex items-center gap-0.5",
                      stock >= 300
                        ? "text-emerald-600 dark:text-emerald-400"
                        : stock >= 150
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400"
                    )}
                    title={`${stock} шт на складі`}
                  >
                    <Package className="h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0" />
                    <span className="font-medium text-[9px] sm:text-[10px]">{stock}</span>
                  </div>
                </div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs shrink-0">
                  {Math.round(price)}₴
                </p>
              </div>
            );
          })}
          {/* Порожні слоти для консистентної висоти */}
          {variants.length < 4 && Array.from({ length: 4 - Math.min(variants.length, 4) }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[2rem]" />
          ))}
        </div>
        {/* Показуємо індикатор якщо є більше 4 варіантів */}
        {variants.length > 4 && (
          <p className="text-[10px] text-center text-slate-400 mt-1">+{variants.length - 4} ще</p>
        )}
      </CardContent>
    </Card>
  );
}

function CartGroupItem({
  group,
  onRemove,
  onUpdateQty,
}: {
  group: GroupedCartItem;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
}) {
  const [editingQty, setEditingQty] = useState<string | null>(null);
  const [qtyValue, setQtyValue] = useState<string>('');

  const handleQtyClick = (lineId: string, currentQty: number) => {
    setEditingQty(lineId);
    setQtyValue(currentQty.toString());
  };

  const handleQtyChange = (lineId: string, value: string) => {
    setQtyValue(value);
  };

  const handleQtyBlur = (lineId: string, currentQty: number) => {
    const newQty = parseInt(qtyValue) || 0;
    if (newQty !== currentQty && newQty > 0) {
      const delta = newQty - currentQty;
      onUpdateQty(lineId, delta);
    }
    setEditingQty(null);
    setQtyValue('');
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent, lineId: string, currentQty: number) => {
    if (e.key === 'Enter') {
      handleQtyBlur(lineId, currentQty);
    } else if (e.key === 'Escape') {
      setEditingQty(null);
      setQtyValue('');
    }
  };

  const totalQty = group.lines.reduce((sum, line) => sum + line.qty, 0);

  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-[var(--admin-border)] bg-white dark:bg-admin-surface overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Product Header */}
      <div className="flex items-center gap-3 p-3 sm:p-3.5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/30">
        {/* Product Image */}
        <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-admin-surface ring-1 ring-slate-200/50 dark:ring-slate-700/50">
          {group.image ? (
            <img
              src={group.image}
              alt={group.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-admin-text-muted">
              <Package className="h-6 w-6" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-admin-text-primary truncate leading-tight">
            {group.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500 dark:text-admin-text-tertiary">
              {totalQty} шт
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs text-slate-500 dark:text-admin-text-tertiary">
              {group.lines.length} {group.lines.length === 1 ? 'варіант' : 'варіанти'}
            </span>
          </div>
        </div>

        {/* Total Price */}
        <div className="text-right shrink-0">
          <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {Math.round(group.total)} ₴
          </p>
        </div>
      </div>

      {/* Variants List */}
      <div className="divide-y divide-slate-100 dark:divide-[var(--admin-border)]">
        {group.lines.map((line) => (
          <div
            key={line.id}
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-3.5 py-2.5 sm:py-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
          >
            {/* Size Badge */}
            <Badge tone="outline" className="shrink-0 text-xs font-medium px-2 py-0.5 min-w-[50px] justify-center">
              {line.size}
            </Badge>

            {/* Unit Price */}
            <span className="text-xs sm:text-sm text-slate-500 dark:text-admin-text-muted flex-1">
              {Math.round(line.price)} ₴/шт
            </span>

            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateQty(line.id, -1)}
                className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-admin-border text-slate-500 hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-admin-surface-elevated active:scale-95 transition-all"
              >
                <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>

              {editingQty === line.id ? (
                <Input
                  type="number"
                  min="1"
                  value={qtyValue}
                  onChange={(e) => handleQtyChange(line.id, e.target.value)}
                  onBlur={() => handleQtyBlur(line.id, line.qty)}
                  onKeyDown={(e) => handleQtyKeyDown(e, line.id, line.qty)}
                  className="h-7 w-10 sm:h-8 sm:w-12 text-xs sm:text-sm text-center p-0 font-semibold"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => handleQtyClick(line.id, line.qty)}
                  className="h-7 w-8 sm:h-8 sm:w-10 flex items-center justify-center text-xs sm:text-sm font-semibold text-slate-900 dark:text-admin-text-primary hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {line.qty}
                </button>
              )}

              <button
                onClick={() => onUpdateQty(line.id, 1)}
                className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-admin-border text-slate-500 hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-admin-surface-elevated active:scale-95 transition-all"
              >
                <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>

              {/* Delete Button */}
              <button
                onClick={() => onRemove(line.id)}
                aria-label="Видалити"
                className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 active:scale-95 transition-all ml-1"
              >
                <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Package className="h-8 w-8 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-base font-medium text-slate-400 dark:text-slate-500 mb-1">
        Кошик порожній
      </p>
      <p className="text-sm text-slate-400 dark:text-slate-600">
        Оберіть товари зі списку
      </p>
    </div>
  );
}

