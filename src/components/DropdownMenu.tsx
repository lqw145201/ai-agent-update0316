// COMPONENT — Shared dropdown menu
// Used by ChatListPanel ("..." context menu) and ChatInput (add data menu).
// Renders via portal, positioned relative to an anchor DOMRect.

import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface DropdownMenuProps {
  anchorRect: DOMRect;
  items: DropdownMenuItem[];
  onClose: () => void;
  /** Horizontal alignment. "left" = left-align to anchor left, "right" = right-align to anchor right (default) */
  align?: "left" | "right";
  /** Vertical placement. "below" (default) or "above" */
  placement?: "below" | "above";
}

export function DropdownMenu({ anchorRect, items, onClose, align = "right", placement = "below" }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const left = align === "left" ? anchorRect.left : anchorRect.right;
  const transform = align === "right" ? "translateX(-100%)" : "none";
  const posStyle = placement === "above"
    ? { bottom: window.innerHeight - anchorRect.top + 4, left, transform }
    : { top: anchorRect.bottom + 4, left, transform };

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 bg-popover overflow-clip py-[4px] rounded-[var(--radius-button)] shadow-dropdown min-w-[120px]"
      style={posStyle}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className="h-[32px] w-full text-left flex items-center cursor-pointer select-none hover:bg-background-hover transition-colors"
          onClick={() => { item.onClick(); onClose(); }}
        >
          <div className="flex items-center px-[16px] size-full">
            <span
              className={`flex-1 whitespace-nowrap ${item.variant === "destructive" ? "text-destructive" : "text-popover-foreground"}`}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-base)",
                fontWeight: "var(--font-weight-normal)",
                lineHeight: "1.5",
              }}
            >
              {item.label}
            </span>
          </div>
        </button>
      ))}
    </div>,
    document.body,
  );
}
