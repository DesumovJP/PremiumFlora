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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartLine, Client, Product, Variant } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Minus,
  NotebookText,
  Plus,
  Search,
  Trash,
  ShoppingBag,
  LayoutGrid,
  Package,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
  paymentStatus?: 'paid' | 'expected';
  onPaymentStatusChange?: (status: 'paid' | 'expected') => void;
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
  paymentStatus = 'expected',
  onPaymentStatusChange,
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
      />
    );
  }

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [gridMode, setGridMode] = useState<"full" | "half">("full");

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex-1 space-y-3">
        <Card className="admin-card border border-slate-100 dark:border-admin-border bg-white/90 dark:bg-admin-surface shadow-md shadow-emerald-500/5">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">POS Термінал</CardTitle>
                <CardDescription>Швидке оформлення замовлення та контроль складу</CardDescription>
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
          <CardContent className="space-y-4">
            <div
              className={cn(
                "grid gap-3 animate-stagger",
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

      <div className="w-full lg:w-80 xl:w-[22.5rem]">
        <div className="admin-surface fixed right-0 top-0 hidden h-screen w-80 border-l border-slate-100 dark:border-admin-border bg-white/95 dark:bg-admin-surface-elevated shadow-lg shadow-emerald-500/10 lg:block xl:w-[22.5rem] admin-optimized">
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
          />
        </div>
      </div>
    </div>
  );
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
}) {
  const [discount, setDiscount] = useState<number>(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const payable = Math.max(0, cartTotal - discount);
  const canCheckout = selectedClient && cart.length > 0 && !isCheckingOut;

  return (
    <Card className="admin-card flex h-full flex-col border border-slate-100 dark:border-admin-border bg-white/95 dark:bg-admin-surface-elevated shadow-lg shadow-emerald-500/10">
      <CardHeader className="space-y-2 pb-2 sm:space-y-3 sm:pb-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <CardTitle className="text-base sm:text-lg">Кошик</CardTitle>
          <Badge tone="outline" className="text-xs">
            Всього: {cart.length} позицій
          </Badge>
        </div>
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
      </CardHeader>
      <CardContent className="flex-1 min-h-0 space-y-3 pt-0 sm:space-y-4">
        <ScrollArea className="h-full max-h-none pr-2">
          {cart.length === 0 ? (
            <div className="flex min-h-[27.5rem] items-center justify-center sm:min-h-[31.25rem]">
              <EmptyCart />
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {cart.map((line) => (
                <CartLineItem
                  key={line.id}
                  line={line}
                  onRemove={() => onRemove(line.id)}
                  onUpdateQty={onUpdateQty}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:gap-2.5">
        <div className="flex w-full items-center justify-between text-xs text-slate-600 dark:text-admin-text-secondary sm:text-sm">
          <span>Сума</span>
          <span className="font-semibold text-slate-900 dark:text-admin-text-primary">{cartTotal} грн</span>
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
        <div className="flex w-full items-center justify-between text-sm font-semibold sm:text-base">
          <span>До сплати</span>
          <span className="text-emerald-700">{payable} грн</span>
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

  return (
    <Card
      className={cn(
        "overflow-hidden border-slate-100 dark:border-admin-border shadow-sm shadow-emerald-500/5",
        compact && "text-sm",
        "w-full"
      )}
    >
      <div className={cn("w-full overflow-hidden bg-slate-100 dark:bg-admin-surface", compact ? "h-16" : "h-24")}>
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
      <CardContent
        className={cn(
          "space-y-1.5 pt-3 overflow-hidden",
          compact && "space-y-1 px-2.5 py-2.5 pt-2.5"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 
              className={cn(
                "font-semibold text-slate-900 dark:text-admin-text-primary line-clamp-2 leading-tight",
                "text-lg"
              )}
            >
              {product.name}
            </h3>
          </div>
          {firstVariant && (
            <Badge
              tone="success"
              className={cn(
                "shrink-0",
                compact ? "px-2 py-0.5 text-xs leading-none" : "px-2.5 py-1 text-xs leading-none"
              )}
            >
              {firstVariant.stock || 0} шт
            </Badge>
          )}
        </div>
        <div className={cn("space-y-1.5", compact && "space-y-1")}>
          {product.variants
            .filter((variant) => variant != null)
            .map((variant) => {
              const stock = variant?.stock ?? 0;
              const price = variant?.price ?? 0;
              const size = variant?.size ?? "N/A";
              const variantKey = `${product.id}-${variant.size}`;
              const isAdded = addedVariants.has(variantKey);

              return (
                <div
                  key={variant.size || Math.random()}
                  className={cn(
                    "relative flex items-center justify-between rounded-lg border px-2.5 py-1.5 min-w-0",
                    compact && "px-2 py-1 rounded-md",
                    isAdded
                      ? "border-emerald-500 dark:border-emerald-600 bg-emerald-100/80 dark:bg-emerald-900/40 animate-bounce-in"
                      : "border-slate-100 bg-slate-50/60 hover:border-emerald-200 hover:bg-emerald-50/60 pos-variant-item",
                    "cursor-pointer transition-all duration-200 overflow-hidden hover-scale"
                  )}
                  onClick={() => variant && handleAdd(variant)}
                >
                  {isAdded && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-emerald-500/90 backdrop-blur-sm animate-fade-in">
                      <div className="flex items-center justify-center rounded-full bg-white dark:bg-admin-surface p-1.5 shadow-lg animate-scale-in">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <p 
                      className={cn("font-semibold text-slate-900 dark:text-admin-text-primary truncate", "text-sm sm:text-base")}
                    >
                      {size}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-1 shrink-0",
                        stock >= 300
                          ? "text-emerald-600 dark:text-emerald-400"
                          : stock >= 150
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-rose-600 dark:text-rose-400"
                      )}
                      title={`${stock} шт на складі`}
                    >
                      <Package className={cn("h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5", compact && "h-2.5 w-2.5 sm:h-3 sm:w-3")} />
                      <span className={cn("font-medium whitespace-nowrap", compact ? "text-xs" : "text-xs")}>
                        {stock}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <p
                      className={cn(
                        "font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap",
                        "text-sm sm:text-base"
                      )}
                    >
                      {price} грн
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}

function CartLineItem({
  line,
  onRemove,
  onUpdateQty,
}: {
  line: CartLine;
  onRemove: () => void;
  onUpdateQty: (id: string, delta: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-admin-border bg-white/90 dark:bg-admin-surface p-3 shadow-sm sm:p-3.5">
      <div className="flex items-start justify-between gap-2.5 sm:gap-3">
        <div className="flex items-start gap-2 sm:gap-3">
          {line.image && (
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-admin-surface sm:h-14 sm:w-14">
              <img
                src={line.image}
                alt={line.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-admin-text-primary sm:text-base">{line.name}</h4>
            <p className="text-xs text-emerald-700">{line.size}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Видалити"
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 flex items-center justify-between sm:mt-2.5">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onUpdateQty(line.id, -1)}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold sm:text-base">{line.qty}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onUpdateQty(line.id, 1)}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm font-semibold text-emerald-700 sm:text-base">
          {line.price * line.qty} грн
        </p>
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

