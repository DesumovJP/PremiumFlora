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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Modal } from "@/components/ui/modal";
import { CartLine, Client, Product, Variant } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Minus,
  NotebookText,
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
      <Card className="admin-card border border-slate-100 dark:border-[#30363d] bg-white/90 dark:bg-admin-surface shadow-md shadow-emerald-500/5">
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
  const useModal = clients.length >= 5;

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
    <Card className="admin-card flex h-full flex-col border border-slate-100 dark:border-[#30363d] bg-white/95 dark:bg-admin-surface-elevated shadow-lg shadow-emerald-500/10 rounded-none overflow-hidden">
      <CardHeader className="space-y-2 pb-2 p-3 sm:p-5 sm:pb-3 sm:space-y-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <CardTitle className="text-base sm:text-lg">Кошик</CardTitle>
          <Badge tone="outline" className="text-xs shrink-0">
            {cart.length} поз.
          </Badge>
        </div>
        {useModal ? (
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal"
            onClick={() => setClientModalOpen(true)}
          >
            <span className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 shrink-0 text-slate-400" />
              <span className={selectedClientObj ? "text-slate-900 dark:text-admin-text-primary" : "text-slate-500 dark:text-admin-text-muted"}>
                {selectedClientObj?.name || "Оберіть клієнта"}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        ) : (
          <Select value={selectedClient} onValueChange={onClientChange}>
            <SelectTrigger>
              <SelectValue placeholder="Оберіть клієнта" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="flex-1 min-h-0 space-y-2 pt-0 p-3 sm:p-5 sm:pt-0 sm:space-y-4">
        <ScrollArea className="h-full max-h-none pr-2">
          {cart.length === 0 ? (
            <div className="flex min-h-[27.5rem] items-center justify-center sm:min-h-[31.25rem]">
              <EmptyCart />
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
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
      <CardFooter className="flex flex-col gap-2 p-3 sm:p-5 sm:pt-0 sm:gap-2.5">
        <div className="flex w-full items-center justify-between text-xs text-slate-600 dark:text-admin-text-secondary sm:text-sm">
          <span>Сума</span>
          <span className="font-semibold text-slate-900 dark:text-admin-text-primary">{Math.round(cartTotal)} грн</span>
        </div>
        <div className="flex w-full items-center justify-between gap-2 text-xs text-slate-600 dark:text-admin-text-secondary sm:text-sm">
          <span>Знижка</span>
          {!showDiscount ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-emerald-700"
              onClick={() => setShowDiscount(true)}
            >
              {discount > 0 ? `-${discount} грн` : "Додати"}
            </Button>
          ) : (
            <Input
              type="number"
              className="h-9 w-28 text-right text-sm sm:h-9"
              value={Number.isNaN(discount) ? "" : discount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setDiscount(0);
                  return;
                }
                const num = Number(val);
                setDiscount(Math.max(0, Number.isNaN(num) ? 0 : num));
              }}
              onBlur={() => setShowDiscount(false)}
              autoFocus
            />
          )}
        </div>
        <Separator />
        {onPaymentStatusChange && (
          <div className="w-full">
            <label className="mb-1.5 block text-xs text-slate-600 dark:text-admin-text-secondary">Статус оплати</label>
            <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Статус оплати" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Сплачено</SelectItem>
                <SelectItem value="expected">Очікується</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {/* Comment section */}
        {onCommentChange && (
          <div className="w-full space-y-2">
            <button
              type="button"
              className="flex items-center gap-2 text-xs text-slate-600 dark:text-admin-text-secondary hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              onClick={() => {
                setShowComment(!showComment);
                if (showComment && comment) {
                  onCommentChange('');
                }
              }}
            >
              <div className={cn(
                "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                showComment
                  ? "bg-emerald-600 border-emerald-600"
                  : "border-slate-300 dark:border-admin-border"
              )}>
                {showComment && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span>Додати коментар</span>
            </button>
            {showComment && (
              <textarea
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                placeholder="Введіть коментар до замовлення..."
                className="w-full rounded-lg border border-slate-200 dark:border-admin-border bg-white dark:bg-admin-surface px-3 py-2 text-sm text-slate-900 dark:text-admin-text-primary placeholder:text-slate-400 dark:placeholder:text-admin-text-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                rows={2}
              />
            )}
          </div>
        )}
        <div className="flex w-full items-center justify-between text-sm font-semibold sm:text-base">
          <span>До сплати</span>
          <span className="text-emerald-700">{Math.round(payable)} грн</span>
        </div>
        <Button
          className="w-full rounded-xl py-2.5 text-sm sm:py-3 sm:text-sm"
          disabled={!canCheckout}
          onClick={onCheckout}
        >
          {isCheckingOut ? "Оформлення..." : "Оформити замовлення"}
        </Button>
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
                        : "hover:bg-slate-50 dark:hover:bg-admin-surface-elevated border border-transparent"
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
          "overflow-hidden border-slate-100 shadow-sm shadow-emerald-500/5",
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
        className="overflow-hidden border-slate-100 dark:border-admin-border shadow-sm shadow-emerald-500/5 w-full"
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
              <h3 className="font-semibold text-slate-900 dark:text-admin-text-primary text-sm leading-tight line-clamp-1">
                {product.name}
              </h3>
              {firstVariant && (
                <Badge
                  tone="success"
                  className="shrink-0 px-1.5 py-0.5 text-[10px] leading-none"
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
                        ? "border-emerald-500 dark:border-emerald-600 bg-emerald-100/80 dark:bg-emerald-900/40 animate-bounce-in"
                        : "border-slate-100 bg-slate-50/60 hover:border-emerald-200 hover:bg-emerald-50/60 pos-variant-item",
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
        "overflow-hidden border-slate-100 dark:border-admin-border shadow-sm shadow-emerald-500/5",
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
        {/* Gradient overlay with name */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent px-2 pb-1.5 pt-6 sm:px-3 sm:pb-2 sm:pt-8">
          <div className="flex items-end justify-between gap-2">
            <h3
              className="font-bold leading-tight line-clamp-2 text-slate-800 dark:text-white"
              style={{ fontSize: '105%' }}
            >
              {product.name}
            </h3>
            {firstVariant && (
              <Badge
                tone="success"
                className="shrink-0 px-1.5 py-0.5 text-[10px] sm:text-xs leading-none"
              >
                {totalStock}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <CardContent
        className="space-y-1.5 p-2 pt-2 sm:p-3 sm:pt-2 overflow-hidden"
      >
        <div
          className={cn(
            isCompactGrid ? "grid grid-cols-2 gap-1.5" : "space-y-1.5",
            "min-h-[4.5rem] sm:min-h-[5rem]"
          )}
        >
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
                  "relative flex items-center justify-between rounded-lg border min-w-0",
                  isCompactGrid ? "px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-md gap-1" : "px-2 py-1 sm:px-2.5 sm:py-1.5",
                  isAdded
                    ? "border-emerald-500 dark:border-emerald-600 bg-emerald-100/80 dark:bg-emerald-900/40 animate-bounce-in"
                    : "border-slate-100 bg-slate-50/60 hover:border-emerald-200 hover:bg-emerald-50/60 pos-variant-item",
                  "cursor-pointer transition-all duration-200 overflow-hidden hover-scale"
                )}
                onClick={() => variant && handleAdd(variant)}
              >
                {isAdded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-emerald-500/90 backdrop-blur-sm animate-fade-in">
                    <div className="flex items-center justify-center rounded-full bg-white dark:bg-admin-surface p-1 shadow-lg animate-scale-in">
                      <CheckCircle2 className={cn("text-emerald-600 dark:text-emerald-400", isCompactGrid ? "h-4 w-4" : "h-5 w-5")} />
                    </div>
                  </div>
                )}
                {isCompactGrid ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-admin-text-primary truncate text-xs sm:text-base">
                        {size}
                      </p>
                      <div
                        className={cn(
                          "flex items-center gap-0.5 sm:gap-1 shrink-0",
                          stock >= 300
                            ? "text-emerald-600 dark:text-emerald-400"
                            : stock >= 150
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                        )}
                        title={`${stock} шт на складі`}
                      >
                        <Package className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 shrink-0" />
                        <span className="font-medium whitespace-nowrap text-[10px] sm:text-xs">
                          {stock}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap text-xs sm:text-base">
                        {Math.round(price)}₴
                      </p>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
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
  return (
    <div className="rounded-lg sm:rounded-xl border border-slate-100 dark:border-admin-border bg-white/90 dark:bg-admin-surface-elevated shadow-sm overflow-hidden">
      {/* Заголовок групи */}
      <div className="flex items-center gap-2 p-2 sm:p-2.5 border-b border-slate-100 dark:border-[#30363d] bg-slate-50/50 dark:bg-slate-800/50">
        <div className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-admin-surface">
          {group.image ? (
            <img
              src={group.image}
              alt={group.name}
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
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-admin-text-primary truncate leading-tight">
            {group.name}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-admin-text-tertiary">
            {group.lines.length} {group.lines.length === 1 ? 'варіант' : group.lines.length < 5 ? 'варіанти' : 'варіантів'}
          </p>
        </div>
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
          {Math.round(group.total)}₴
        </p>
      </div>

      {/* Варіанти */}
      <div className="divide-y divide-slate-100 dark:divide-[#30363d]">
        {group.lines.map((line) => (
          <div
            key={line.id}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 dark:bg-slate-800/30"
          >
            <Badge tone="outline" className="shrink-0 text-[10px] sm:text-[11px] px-1 sm:px-1.5 py-0">
              {line.size}
            </Badge>
            <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-admin-text-muted flex-1 truncate">
              {Math.round(line.price)}₴
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={() => onUpdateQty(line.id, -1)}
                className="h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded border border-slate-200 dark:border-admin-border text-slate-500 hover:bg-slate-100 dark:hover:bg-admin-surface-elevated"
              >
                <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </button>
              <span className="text-[10px] sm:text-xs font-semibold w-5 sm:w-6 text-center">{line.qty}</span>
              <button
                onClick={() => onUpdateQty(line.id, 1)}
                className="h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded border border-slate-200 dark:border-admin-border text-slate-500 hover:bg-slate-100 dark:hover:bg-admin-surface-elevated"
              >
                <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </button>
              <button
                onClick={() => onRemove(line.id)}
                aria-label="Видалити"
                className="h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-slate-300 hover:text-rose-500"
              >
                <Trash className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
    <div className="flex flex-col items-center justify-center rounded-2xl px-6 py-10 text-center">
      <NotebookText className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-3 font-medium text-slate-300">Додайте позиції до кошика</p>
    </div>
  );
}

