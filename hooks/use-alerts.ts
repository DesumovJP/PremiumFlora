/**
 * useAlerts Hook
 *
 * Hook для управління алертами (toast notifications)
 */

import { useState, useCallback } from "react";

export interface Alert {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  details?: unknown;
  timestamp: number;
}

interface UseAlertsReturn {
  alerts: Alert[];
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string, details?: unknown) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showAlert: (alert: Omit<Alert, "id" | "timestamp">) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const AUTO_DISMISS_DELAY = 5000; // 5 секунд

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const generateId = () => `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const addAlert = useCallback((alertData: Omit<Alert, "id" | "timestamp">) => {
    const id = generateId();
    const alert: Alert = {
      ...alertData,
      id,
      timestamp: Date.now(),
    };

    setAlerts((prev) => [...prev, alert]);

    // Автоматичне закриття для success/info
    if (alertData.type === "success" || alertData.type === "info") {
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, AUTO_DISMISS_DELAY);
    }

    return id;
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string) => {
      addAlert({ type: "success", title, message });
    },
    [addAlert]
  );

  const showError = useCallback(
    (title: string, message: string, details?: unknown) => {
      addAlert({ type: "error", title, message, details });
    },
    [addAlert]
  );

  const showWarning = useCallback(
    (title: string, message: string) => {
      addAlert({ type: "warning", title, message });
    },
    [addAlert]
  );

  const showInfo = useCallback(
    (title: string, message: string) => {
      addAlert({ type: "info", title, message });
    },
    [addAlert]
  );

  const showAlert = useCallback(
    (alert: Omit<Alert, "id" | "timestamp">) => {
      addAlert(alert);
    },
    [addAlert]
  );

  const dismiss = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAlert,
    dismiss,
    dismissAll,
  };
}
