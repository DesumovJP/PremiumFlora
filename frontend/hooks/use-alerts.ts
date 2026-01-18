/**
 * useAlerts Hook
 *
 * Premium hook for toast notifications with:
 * - Auto-dismiss with pause on hover (handled by AlertToast component)
 * - Loading state support
 * - Promise-based API for async operations
 * - Stacked notifications
 */

import { useState, useCallback, useRef } from "react";

export type AlertType = "success" | "error" | "warning" | "info" | "loading";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  details?: unknown;
  timestamp: number;
}

interface UseAlertsReturn {
  alerts: Alert[];
  showSuccess: (title: string, message: string) => string;
  showError: (title: string, message: string, details?: unknown) => string;
  showWarning: (title: string, message: string) => string;
  showInfo: (title: string, message: string) => string;
  showLoading: (title: string, message?: string) => string;
  showAlert: (alert: Omit<Alert, "id" | "timestamp">) => string;
  /** Update an existing alert (useful for loading -> success/error) */
  updateAlert: (id: string, updates: Partial<Omit<Alert, "id" | "timestamp">>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  /** Promise-based API: shows loading, then success/error based on promise result */
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: { title: string; message?: string };
      success: { title: string; message?: string } | ((data: T) => { title: string; message?: string });
      error: { title: string; message?: string } | ((err: Error) => { title: string; message?: string; details?: unknown });
    }
  ) => Promise<T>;
}

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const idCounterRef = useRef(0);

  const generateId = () => {
    idCounterRef.current += 1;
    return `alert-${Date.now()}-${idCounterRef.current}`;
  };

  const addAlert = useCallback((alertData: Omit<Alert, "id" | "timestamp">): string => {
    const id = generateId();
    const alert: Alert = {
      ...alertData,
      id,
      timestamp: Date.now(),
    };

    setAlerts((prev) => [...prev, alert]);
    return id;
  }, []);

  const updateAlert = useCallback((id: string, updates: Partial<Omit<Alert, "id" | "timestamp">>) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, ...updates, timestamp: Date.now() }
          : alert
      )
    );
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string): string => {
      return addAlert({ type: "success", title, message });
    },
    [addAlert]
  );

  const showError = useCallback(
    (title: string, message: string, details?: unknown): string => {
      return addAlert({ type: "error", title, message, details });
    },
    [addAlert]
  );

  const showWarning = useCallback(
    (title: string, message: string): string => {
      return addAlert({ type: "warning", title, message });
    },
    [addAlert]
  );

  const showInfo = useCallback(
    (title: string, message: string): string => {
      return addAlert({ type: "info", title, message });
    },
    [addAlert]
  );

  const showLoading = useCallback(
    (title: string, message: string = ""): string => {
      return addAlert({ type: "loading", title, message });
    },
    [addAlert]
  );

  const showAlert = useCallback(
    (alert: Omit<Alert, "id" | "timestamp">): string => {
      return addAlert(alert);
    },
    [addAlert]
  );

  const dismiss = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setAlerts([]);
  }, []);

  // Promise-based API for async operations
  const promiseHandler = useCallback(
    async <T>(
      promise: Promise<T>,
      options: {
        loading: { title: string; message?: string };
        success: { title: string; message?: string } | ((data: T) => { title: string; message?: string });
        error: { title: string; message?: string } | ((err: Error) => { title: string; message?: string; details?: unknown });
      }
    ): Promise<T> => {
      const id = addAlert({
        type: "loading",
        title: options.loading.title,
        message: options.loading.message || "",
      });

      try {
        const result = await promise;

        const successConfig = typeof options.success === "function"
          ? options.success(result)
          : options.success;

        updateAlert(id, {
          type: "success",
          title: successConfig.title,
          message: successConfig.message || "",
        });

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        const errorConfig = typeof options.error === "function"
          ? options.error(error)
          : options.error;

        updateAlert(id, {
          type: "error",
          title: errorConfig.title,
          message: errorConfig.message || error.message,
          details: "details" in errorConfig ? errorConfig.details : undefined,
        });

        throw err;
      }
    },
    [addAlert, updateAlert]
  );

  return {
    alerts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showAlert,
    updateAlert,
    dismiss,
    dismissAll,
    promise: promiseHandler,
  };
}
