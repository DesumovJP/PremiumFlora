/**
 * POS Section Types
 */

import type { CartLine, Client, Product, Variant } from "@/lib/types";

export type PosSectionProps = {
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

export type CartPanelProps = {
  clients: Client[];
  selectedClient?: string;
  onClientChange: (value: string) => void;
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
};

export type ProductCardProps = {
  product: Product;
  onAdd: (product: Product, variant: Variant) => void;
  compact?: boolean;
};

export type GroupedCartItem = {
  flowerSlug: string;
  name: string;
  image?: string | null;
  items: CartLine[];
  subtotal: number;
};

// Re-export for convenience
export type { CartLine, Client, Product, Variant } from "@/lib/types";
