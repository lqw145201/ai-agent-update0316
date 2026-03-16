// COMPONENT — Toast notification
// Dark pill anchored bottom-center of the viewport.
// Auto-dismisses after 2200ms. No icon, no close button.
// Sourced from CatalogPanel.tsx in the Dremio AI Agent prototype.
//
// Usage:
//   const { showToast, ToastOutlet } = useToast();
//   showToast("Copied: orders.sales_fact");
//   return <><YourUI /><ToastOutlet /></>;

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// ── Props ──────────────────────────────────────────────────────────────────

export interface ToastProps {
  /** Message text shown inside the toast */
  message: string;
  /** Called when the toast finishes auto-dismissing */
  onClose: () => void;
}

// ── Toast component ────────────────────────────────────────────────────────
// Rendered into document.body via createPortal so z-index is never clipped
// by an ancestor with overflow:hidden or a stacking context.

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [onClose]);

  return createPortal(
    <div className="fixed bottom-[16px] left-1/2 -translate-x-1/2 z-[10000] bg-foreground rounded-[var(--radius-card)] px-[16px] py-[8px] shadow-sm">
      <p
        className="font-['Inter',sans-serif] font-normal leading-[150%] text-card text-[12px] whitespace-nowrap"
      >
        {message}
      </p>
    </div>,
    document.body,
  );
}

// ── useToast hook ──────────────────────────────────────────────────────────

interface ToastState {
  id: number;
  message: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  const ToastOutlet = useCallback(() => {
    if (!toast) return null;
    return (
      <Toast
        key={toast.id}
        message={toast.message}
        onClose={() => setToast(null)}
      />
    );
  }, [toast]);

  return { showToast, ToastOutlet };
}
