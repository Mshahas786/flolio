"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export type ToastType = "default" | "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: React.ReactNode;
  onClose: (id: string) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  default: <CheckCircle className="w-5 h-5 text-brand-500" />,
  success: <CheckCircle className="w-5 h-5 text-success-500" />,
  error: <AlertCircle className="w-5 h-5 text-destructive-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning-500" />,
  info: <Info className="w-5 h-5 text-brand-500" />,
};

const bgColors: Record<ToastType, string> = {
  default: "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
  success: "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800",
  error: "bg-destructive-50 dark:bg-destructive-900/20 border-destructive-200 dark:border-destructive-800",
  warning: "bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800",
  info: "bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800",
};

function Toast({ id, title, description, type = "default", duration = 5000, action, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose(id);
      }, 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-lg",
        "animate-in slide-in-from-right-full duration-300 ease-out",
        isExiting && "animate-out slide-out-to-right-full duration-200 ease-in",
        bgColors[type]
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
        )}
        {action && (
          <div className="mt-3">{action}</div>
        )}
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(id), 200);
        }}
        className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToasterProps {
  toasts: Array<ToastProps & { id: string }>;
  onClose: (id: string) => void;
}

export function Toaster({ toasts, onClose }: ToasterProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[700] flex flex-col gap-3 max-w-sm w-full sm:max-w-md"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

type ToastState = Array<ToastProps & { id: string }>;

interface ToastAction {
  type: "ADD" | "REMOVE";
  toast?: ToastProps & { id: string };
  id?: string;
}

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast!];
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

const ToastContext = React.createContext<{
  toasts: ToastState;
  addToast: (toast: Omit<ToastProps, "id" | "onClose">) => void;
  removeToast: (id: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = React.useReducer(toastReducer, []);

  const addToast = React.useCallback((toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).slice(2, 9);
    const dismiss = () => removeToast(id);

    const timeout = setTimeout(dismiss, toast.duration ?? 5000);

    dispatch({ type: "ADD", toast: { ...toast, id, onClose: dismiss } });
    return { id, dismiss };
  }, []);

  const removeToast = React.useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

// Standalone toast function for non-React contexts
let toastStore: { toasts: ToastState; addToast: (toast: Omit<ToastProps, "id" | "onClose">) => void } | null = null;

export function setToastStore(store: { toasts: ToastState; addToast: (toast: Omit<ToastProps, "id" | "onClose">) => void }) {
  toastStore = store;
}

export const toast = (props: Omit<ToastProps, "id" | "onClose">) => {
  if (toastStore) {
    toastStore.addToast(props);
  }
  return { id: "", dismiss: () => {} };
};

toast.success = (title: string, description?: string) => toast({ title, description, type: "success" });
toast.error = (title: string, description?: string) => toast({ title, description, type: "error" });
toast.warning = (title: string, description?: string) => toast({ title, description, type: "warning" });
toast.info = (title: string, description?: string) => toast({ title, description, type: "info" });
toast.dismiss = (id: string) => {
  if (toastStore) {
    // Would need to implement dismiss in store
  }
};