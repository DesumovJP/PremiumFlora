import { LucideIcon } from "lucide-react";

export type Variant = {
  size: string;
  price: number;
  stock: number;
  length: number;  // Числова довжина стебла в см
};

export type Product = {
  id: string;
  documentId?: string; // Strapi v5 documentId
  slug?: string; // URL-friendly identifier
  name: string;
  description?: Array<{ type: string; children: Array<{ type: string; text: string }> }>; // Strapi blocks
  image: string;
  variants: Variant[];
  updatedAt?: string; // ISO date string
};

export type Client = {
  id: string;
  name: string;
  contact: string;
  email: string;
  city: string;
  orders: number;
  spent: number;
  lastOrder: string;
  isVip?: boolean;
  pendingPayment?: number; // Сума очікуваних оплат
};

export type CartLine = {
  id: string;
  name: string;
  size: string;
  price: number;
  qty: number;
  image?: string;
  flowerSlug: string;  // Slug квітки для API
  length: number;      // Числова довжина для API
};

export type Order = {
  id: string;
  status: string;
  date: string;
  list: string;
  amount: number;
};

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string; // Optional badge text (e.g., "Пропозиція")
};

export type Kpi = {
  label: string;
  value: string;
  delta: string;
};

export type CategorySplit = {
  name: string;
  value: number;
  color: string;
};

export type TopProduct = {
  name: string;
  sold: number;
  revenue: number;
  share: number;
};

export type WeeklyRevenue = number[];

export type OrdersPerWeek = number[];

export type SupplyPlan = {
  nextDate: string;
  recommended: string;
  currentStock: string;
  forecast: string;
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
};

