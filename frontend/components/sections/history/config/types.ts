/**
 * History Section Types
 */

import type { Activity, ShiftSummary } from '@/hooks/use-activity-log';

export interface HistorySectionProps {
  activities: Activity[];
  shiftStartedAt: string | null;
  summary: ShiftSummary;
  onCloseShift: () => Promise<void>;
  onExportShift: () => void;
  onRefresh?: () => Promise<void>;
  isClosingShift?: boolean;
  isLoading?: boolean;
}

export type TabType = 'current' | 'archive';

// Re-export for convenience
export type { Activity, ShiftSummary } from '@/hooks/use-activity-log';
