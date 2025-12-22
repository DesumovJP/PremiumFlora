/**
 * AlertToast Component
 *
 * Floating toast notifications для відображення алертів
 */

"use client";

import { cn } from "@/lib/utils";
import { Alert } from "@/hooks/use-alerts";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "./button";

interface AlertToastProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styleMap = {
  success: {
    container: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50",
    icon: "text-emerald-600 dark:text-emerald-400",
    title: "text-emerald-900 dark:text-emerald-300",
    message: "text-emerald-700 dark:text-emerald-400",
  },
  error: {
    container: "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50",
    icon: "text-rose-600 dark:text-rose-400",
    title: "text-rose-900 dark:text-rose-300",
    message: "text-rose-700 dark:text-rose-400",
  },
  warning: {
    container: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50",
    icon: "text-amber-600 dark:text-amber-400",
    title: "text-amber-900 dark:text-amber-300",
    message: "text-amber-700 dark:text-amber-400",
  },
  info: {
    container: "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/50",
    icon: "text-sky-600 dark:text-sky-400",
    title: "text-sky-900 dark:text-sky-300",
    message: "text-sky-700 dark:text-sky-400",
  },
};

export function AlertToast({ alerts, onDismiss }: AlertToastProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {alerts.map((alert) => {
        const Icon = iconMap[alert.type];
        const styles = styleMap[alert.type];

        return (
          <div
            key={alert.id}
            className={cn(
              "rounded-xl border p-4 shadow-lg",
              "animate-slide-in-right",
              styles.container
            )}
            role="alert"
            style={{
              animationDelay: `${alerts.indexOf(alert) * 0.1}s`
            } as React.CSSProperties}
          >
            <div className="flex items-start gap-3">
              <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", styles.icon)} />
              <div className="flex-1 min-w-0">
                <h4 className={cn("font-semibold text-sm", styles.title)}>
                  {alert.title}
                </h4>
                <p className={cn("text-sm mt-0.5", styles.message)}>
                  {alert.message}
                </p>
                {alert.details !== undefined && alert.details !== null && (
                  <details className="mt-2">
                    <summary className={cn("text-xs cursor-pointer", styles.message)}>
                      Деталі
                    </summary>
                    <pre className="mt-1 text-xs bg-white/50 dark:bg-admin-surface/50 rounded p-2 overflow-auto max-h-32 text-slate-900 dark:text-admin-text-primary">
                      {typeof alert.details === "string"
                        ? alert.details
                        : JSON.stringify(alert.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-70 hover:opacity-100"
                onClick={() => onDismiss(alert.id)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Закрити</span>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AlertToastContainer({
  alerts,
  onDismiss,
}: AlertToastProps) {
  return <AlertToast alerts={alerts} onDismiss={onDismiss} />;
}
