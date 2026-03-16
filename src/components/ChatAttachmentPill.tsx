// COMPONENT — Chat attachment pill
// Shown inside ChatInput when a user attaches a data entity (table, dataset, folder, etc.)
// to the chat message. Displays the full entity path with a remove button.
// No leading icon — just the path text and a close button.
//
// Usage:
//   <ChatAttachmentPill path="prod.finance.orders" onRemove={() => {}} />
//   <ChatAttachmentPill path="Data Lake / Finance / Q4 Sales" onRemove={() => {}} />

// ── Types ──────────────────────────────────────────────────────────────────

export interface ChatAttachmentPillProps {
  /** Full path or name of the attached entity, e.g. "prod.finance.orders" */
  path: string;
  /** Called when the user clicks the × button */
  onRemove: () => void;
  /** Optional accessible label for the remove button. Defaults to "Remove <path>" */
  removeLabel?: string;
}

// ── Component ─────────────────────────────────────────────────────────────

export function ChatAttachmentPill({ path, onRemove, removeLabel }: ChatAttachmentPillProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        height: "24px",
        padding: "0 4px",
        borderRadius: "4px",          // --radius-button
        backgroundColor: "var(--muted, #EEEFF1)",
        maxWidth: "100%",
        minWidth: 0,
        flexShrink: 1,
      }}
    >
      {/* Path label — truncates with ellipsis if too long */}
      <span
        style={{
          fontFamily: "var(--font-sans, 'Inter', sans-serif)",
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: "1.5",
          color: "var(--foreground, #202124)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          minWidth: 0,
          fontFeatureSettings: "'cv08', 'lnum', 'tnum'",
        }}
      >
        {path}
      </span>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel ?? `Remove ${path}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: "14px",
          height: "14px",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        {/* × close — 8×8 inline SVG, consistent with ChatInput */}
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1 1L7 7M7 1L1 7"
            stroke="var(--secondary-foreground, #505862)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
