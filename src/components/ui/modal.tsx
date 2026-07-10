"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  showClose = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      contentRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      previousActiveElement.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current && closeOnOverlayClick) {
      onClose();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Tab") {
      const focusableElements = contentRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full bg-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 ease-out",
          "dark:bg-neutral-950 dark:border dark:border-neutral-800",
          sizeClasses[size],
          "max-h-[85vh] flex flex-col",
          "sm:max-h-[80vh]",
          className
        )}
        onKeyDown={handleKeyDown}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-start justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {description}
              </p>
            )}
          </div>
          {showClose && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="flex-shrink-0 ml-4"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "primary" | "warning";
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : variant === "warning" ? "warning" : "default"}
          onClick={onConfirm}
          loading={loading}
          loadingText={confirmText}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export function AlertModal({ open, onClose, title, message, buttonText = "OK" }: AlertModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">{message}</p>
      <div className="flex justify-end">
        <Button onClick={onClose}>
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
}