/**
 * Clients Section Types
 */

import type { Client } from "@/lib/types";
import type { Customer, Transaction } from "@/lib/api-types";
import type { ActivityType, ActivityDetails } from "@/hooks/use-activity-log";

export type ClientsSectionProps = {
  customers: Customer[];
  isLoading?: boolean;
  onOpenExport: () => void;
  onAddCustomer: (data: { name: string; phone: string; email: string; address: string }) => Promise<void>;
  onDeleteCustomer: (documentId: string) => Promise<void>;
  onLogActivity?: (type: ActivityType, details: ActivityDetails) => Promise<void>;
  onPendingPaymentsChange?: (total: number) => void;
};

export type NewClientData = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

// Re-export for convenience
export type { Client, Customer, Transaction };
