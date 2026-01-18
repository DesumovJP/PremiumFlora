/**
 * AlertToast Component
 *
 * Premium floating toast notifications with auto-dismiss, progress bar,
 * animated icons, and smooth animations
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Alert } from "@/hooks/use-alerts";
import { X, CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

interface AlertToastProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
  /** Auto dismiss timeout in ms (default: 5000, 0 to disable) */
  autoDismissTimeout?: number;
  /** Position of the toast container */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

const styleMap = {
  success: {
    container: "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800/60",
    icon: "text-emerald-600 dark:text-emerald-400",
    title: "text-emerald-900 dark:text-emerald-200",
    message: "text-emerald-700 dark:text-emerald-300",
    progress: "bg-emerald-500",
  },
  error: {
    container: "bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60",
    icon: "text-rose-600 dark:text-rose-400",
    title: "text-rose-900 dark:text-rose-200",
    message: "text-rose-700 dark:text-rose-300",
    progress: "bg-rose-500",
  },
  warning: {
    container: "bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800/60",
    icon: "text-amber-600 dark:text-amber-400",
    title: "text-amber-900 dark:text-amber-200",
    message: "text-amber-700 dark:text-amber-300",
    progress: "bg-amber-500",
  },
  info: {
    container: "bg-sky-50 dark:bg-sky-950/80 border-sky-200 dark:border-sky-800/60",
    icon: "text-sky-600 dark:text-sky-400",
    title: "text-sky-900 dark:text-sky-200",
    message: "text-sky-700 dark:text-sky-300",
    progress: "bg-sky-500",
  },
  loading: {
    container: "bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/60",
    icon: "text-slate-600 dark:text-slate-400",
    title: "text-slate-900 dark:text-slate-200",
    message: "text-slate-700 dark:text-slate-300",
    progress: "bg-slate-500",
  },
};

const positionClasses = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

interface ToastItemProps {
  alert: Alert;
  index: number;
  onDismiss: (id: string) => void;
  autoDismissTimeout: number;
}

function ToastItem({ alert, index, onDismiss, autoDismissTimeout }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(autoDismissTimeout);

  const alertType = (alert as { type?: keyof typeof styleMap }).type || "info";
  const Icon = iconMap[alertType] || iconMap.info;
  const styles = styleMap[alertType] || styleMap.info;
  const isLoading = alertType === "loading";

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(alert.id);
    }, 200); // Match exit animation duration
  }, [alert.id, onDismiss]);

  // Auto-dismiss logic with pause on hover
  useEffect(() => {
    if (autoDismissTimeout <= 0 || isLoading) return;

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.max(0, 100 - (elapsed / autoDismissTimeout) * 100);
      setProgress(newProgress);

      if (newProgress <= 0) {
        handleDismiss();
      }
    };

    if (!isPaused) {
      startTimeRef.current = Date.now() - (autoDismissTimeout - remainingTimeRef.current);
      timerRef.current = setInterval(updateProgress, 50);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoDismissTimeout, isPaused, isLoading, handleDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      remainingTimeRef.current = (progress / 100) * autoDismissTimeout;
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm",
        "w-full max-w-sm",
        // Animation
        isExiting
          ? "animate-toast-out"
          : "animate-toast-in",
        styles.container
      )}
      role="alert"
      aria-live="polite"
      style={{
        animationDelay: isExiting ? "0ms" : `${index * 50}ms`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Progress bar */}
      {autoDismissTimeout > 0 && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/5">
          <div
            className={cn(
              "h-full transition-all duration-100",
              styles.progress,
              isPaused && "opacity-50"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Animated Icon */}
          <div className={cn(
            "shrink-0 mt-0.5",
            isLoading ? "animate-spin" : "animate-icon-pop"
          )}>
            <Icon className={cn("h-5 w-5", styles.icon)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <h4 className={cn("font-semibold text-sm leading-tight", styles.title)}>
              {alert.title}
            </h4>
            {alert.message && (
              <p className={cn("text-sm leading-relaxed", styles.message)}>
                {alert.message}
              </p>
            )}
            {alert.details !== undefined && alert.details !== null && (
              <details className="mt-2 group">
                <summary className={cn(
                  "text-xs cursor-pointer select-none",
                  "flex items-center gap-1",
                  styles.message,
                  "opacity-70 hover:opacity-100 transition-opacity"
                )}>
                  <span className="group-open:hidden">▸</span>
                  <span className="hidden group-open:inline">▾</span>
                  Деталі
                </summary>
                <pre className="mt-2 text-xs bg-black/5 dark:bg-white/5 rounded-lg p-2 overflow-auto max-h-32 font-mono">
                  {typeof alert.details === "string"
                    ? alert.details
                    : JSON.stringify(alert.details, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              "shrink-0 p-1 -m-1 rounded-lg",
              "opacity-60 hover:opacity-100",
              "transition-all duration-200",
              "hover:bg-black/5 dark:hover:bg-white/5",
              "active:scale-95",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current",
              "group"
            )}
            aria-label="Закрити"
          >
            <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertToast({
  alerts,
  onDismiss,
  autoDismissTimeout = 5000,
  position = "bottom-right",
}: AlertToastProps) {
  if (alerts.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed z-[100] flex flex-col gap-2 pointer-events-none",
        positionClasses[position]
      )}
    >
      {alerts.map((alert, index) => (
        <div key={alert.id} className="pointer-events-auto">
          <ToastItem
            alert={alert}
            index={index}
            onDismiss={onDismiss}
            autoDismissTimeout={autoDismissTimeout}
          />
        </div>
      ))}
    </div>
  );
}

export function AlertToastContainer({
  alerts,
  onDismiss,
  autoDismissTimeout,
  position,
}: AlertToastProps) {
  return (
    <AlertToast
      alerts={alerts}
      onDismiss={onDismiss}
      autoDismissTimeout={autoDismissTimeout}
      position={position}
    />
  );
}
