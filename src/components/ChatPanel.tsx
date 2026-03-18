// COMPONENT — Chat panel with message list, output blocks, and input
// Portable version: no Figma svgPaths imports — uses icon components from ./icons/
// Delegates all state to useChat hook; renders block views inline

import { useCallback } from "react";
import { createPortal } from "react-dom";
import { useState, useRef, useEffect } from "react";
import { IconMore } from "./icons/IconMore";
import { IconWarning } from "./icons/IconWarning";

// Inline path data for non-standard viewBox icons used in this panel
// Source: svg-javaskxvh1.ts, svg-comj3w05wm.ts

// Chevron caret (viewBox: 0 0 10.4397 5.96941) — approval expand toggle
const PATH_CHEVRON = "M9.6904 5.96907C9.88916 5.96907 10.0798 5.89018 10.2204 5.74973C10.3609 5.6091 10.4397 5.41848 10.4397 5.21973C10.4397 5.02098 10.3609 4.83036 10.2204 4.68973L5.75 0.219338C5.60937 0.0788879 5.41875 0 5.22 0C5.02124 0 4.83062 0.0788879 4.69 0.219338L0.238707 4.6707C0.16502 4.73936 0.105918 4.82216 0.0649265 4.91416C0.0239347 5.00616 0.00189341 5.10547 0.000116715 5.20617C-0.00165998 5.30688 0.0168637 5.40691 0.0545849 5.5003C0.092306 5.59368 0.148451 5.67852 0.21967 5.74974C0.290889 5.82095 0.375723 5.8771 0.469111 5.91482C0.562499 5.95254 0.662527 5.97107 0.76323 5.96929C0.863932 5.96751 0.963247 5.94547 1.05525 5.90448C1.14725 5.86349 1.23005 5.80438 1.29871 5.7307L5.22 1.80934L9.1604 5.74973C9.30103 5.89018 9.49165 5.96907 9.6904 5.96907Z";

// Calendar/datetime composite icon (3 paths, viewBox: 0 0 13.3333 12.6667)
const PATH_DATE_A = "M4.05556 0.5C4.05556 0.223858 3.8317 0 3.55556 0C3.27941 0 3.05556 0.223858 3.05556 0.5V1.33333H2.16667C0.97005 1.33333 0 2.30338 0 3.5V9.83333C0 11.03 0.970049 12 2.16667 12H6.53971C6.25549 11.7038 6.01293 11.3673 5.82147 11H2.16667C1.52233 11 1 10.4777 1 9.83333V6.5H6.12677C6.39863 6.11576 6.73148 5.77773 7.11121 5.5L1 5.5V3.5C1 2.85567 1.52233 2.33333 2.16667 2.33333H3.05556V3.16667C3.05556 3.44281 3.27941 3.66667 3.55556 3.66667C3.8317 3.66667 4.05556 3.44281 4.05556 3.16667V2.33333H9.27778V3.16667C9.27778 3.44281 9.50163 3.66667 9.77778 3.66667C10.0539 3.66667 10.2778 3.44281 10.2778 3.16667V2.33333H11.1667C11.811 2.33333 12.3333 2.85567 12.3333 3.5V5.5H12.2221C12.6631 5.82254 13.0409 6.22641 13.3333 6.68954V3.5C13.3333 2.30338 12.3633 1.33333 11.1667 1.33333H10.2778V0.5C10.2778 0.223858 10.0539 0 9.77778 0C9.50163 0 9.27778 0.223858 9.27778 0.5V1.33333H4.05556V0.5Z";
const PATH_DATE_B = "M9.33333 7.16667C9.60947 7.16667 9.83333 7.39052 9.83333 7.66667V8.83333H10.6667C10.9428 8.83333 11.1667 9.05719 11.1667 9.33333C11.1667 9.60948 10.9428 9.83333 10.6667 9.83333H9.33333C9.05719 9.83333 8.83333 9.60948 8.83333 9.33333V7.66667C8.83333 7.39052 9.05719 7.16667 9.33333 7.16667Z";
const PATH_DATE_C = "M9.66667 12.6667C11.6917 12.6667 13.3333 11.025 13.3333 9C13.3333 6.97496 11.6917 5.33333 9.66667 5.33333C7.64162 5.33333 6 6.97496 6 9C6 11.025 7.64162 12.6667 9.66667 12.6667ZM9.66667 11.6667C11.1394 11.6667 12.3333 10.4728 12.3333 9C12.3333 7.52724 11.1394 6.33333 9.66667 6.33333C8.19391 6.33333 7 7.52724 7 9C7 10.4728 8.19391 11.6667 9.66667 11.6667Z";

// Text/string composite icon (3 paths, viewBox: 0 0 13.3335 6.57256)
const PATH_TEXT_A = "M5.61111 0.5C5.61111 0.223858 5.38725 0 5.11111 0C4.83497 0 4.61111 0.223858 4.61111 0.5V6.05555C4.61111 6.3317 4.83497 6.55555 5.11111 6.55555C5.35314 6.55555 5.55501 6.38358 5.60119 6.15517C5.94 6.40847 6.344 6.55555 6.77778 6.55555C7.97439 6.55555 8.94444 5.43626 8.94444 4.05555C8.94444 2.67484 7.97439 1.55555 6.77778 1.55555C6.34823 1.55555 5.94788 1.69978 5.61111 1.94856V0.5ZM5.61111 4.05555C5.61111 5.02312 6.263 5.55555 6.77778 5.55555C7.29255 5.55555 7.94444 5.02312 7.94444 4.05555C7.94444 3.08799 7.29255 2.55555 6.77778 2.55555C6.263 2.55555 5.61111 3.08799 5.61111 4.05555Z";
const PATH_TEXT_B = "M0.944444 3L0.944507 2.99984C0.971448 2.93249 1.01591 2.82133 1.18844 2.72843C1.3668 2.63239 1.64048 2.56944 1.94444 2.56944C2.2484 2.56944 2.52209 2.63239 2.70045 2.72843C2.99567 2.88739 2.93344 3.14122 2.6725 3.3043C2.50681 3.40785 2.25649 3.45676 1.87307 3.51207C1.85028 3.51535 1.82681 3.51868 1.80272 3.52209L1.80247 3.52212C1.48187 3.56752 1.05353 3.62818 0.711078 3.81587C0.510208 3.92597 0.322767 4.08594 0.189927 4.31859C0.0584365 4.54888 0 4.81609 0 5.1111C0 5.65268 0.302855 6.05717 0.692328 6.2931C1.07062 6.52226 1.54468 6.60757 1.99704 6.55972C2.31224 6.52638 2.63617 6.42633 2.92656 6.24631C3.00154 6.42783 3.1803 6.55556 3.38889 6.55556C3.66503 6.55556 3.88889 6.3317 3.88889 6.05556V2.94444C3.88889 2.40624 3.54355 2.04665 3.17455 1.84796C2.81124 1.65233 2.36271 1.56944 1.94444 1.56944C1.52618 1.56944 1.07765 1.65233 0.714339 1.84796C0.345334 2.04665 0 2.40624 0 2.94444C0 3.11111 0.111111 3.33333 0.388889 3.38889C0.666666 3.44444 0.833333 3.27778 0.944444 3ZM2.88889 4.38979V4.30581C2.5919 4.41879 2.27636 4.46427 2.02891 4.49994L2.01582 4.50182C1.61973 4.55895 1.36506 4.59779 1.1917 4.6928C1.12174 4.73115 1.08348 4.77039 1.05834 4.81443C1.03184 4.86084 1 4.94779 1 5.1111C1 5.2362 1.05826 5.3456 1.21045 5.43779C1.37382 5.53676 1.62198 5.59381 1.89185 5.56527C2.1577 5.53715 2.40526 5.43014 2.58226 5.25144C2.75176 5.0803 2.88869 4.81171 2.88889 4.38979Z";
const PATH_TEXT_C = "M11.4445 1.55555C10.7266 1.55555 10.1757 1.89584 9.82036 2.38781C9.47569 2.86504 9.31944 3.4736 9.31944 4.05555C9.31944 4.63751 9.47569 5.24607 9.82035 5.7233C10.1757 6.21527 10.7266 6.55555 11.4444 6.55555C11.902 6.55555 12.3171 6.45749 12.654 6.2227C12.9967 5.98383 13.2077 5.6389 13.3157 5.24267C13.3884 4.97626 13.2313 4.70139 12.9649 4.62873C12.6985 4.55607 12.4236 4.71314 12.351 4.97955C12.2924 5.19443 12.1978 5.32172 12.0822 5.4023C11.9607 5.48694 11.7646 5.55555 11.4444 5.55555C11.0789 5.55555 10.8174 5.39584 10.631 5.13781C10.434 4.86504 10.3194 4.4736 10.3194 4.05555C10.3194 3.63751 10.434 3.24607 10.631 2.9733C10.8174 2.71527 11.0789 2.55555 11.4445 2.55555C11.7646 2.55555 11.9607 2.62416 12.0822 2.70881C12.1978 2.78939 12.2924 2.91668 12.351 3.13156C12.4236 3.39797 12.6985 3.55504 12.9649 3.48238C13.2313 3.40972 13.3884 3.13485 13.3157 2.86844C13.2077 2.4722 12.9967 2.12728 12.654 1.88841C12.3171 1.65361 11.9021 1.55555 11.4445 1.55555Z";

// AI sparkle icon path (viewBox: 0 0 30 30) — used in chat header with gradient fill
const PATH_AI_SPARKLE = "M12.059 8.49519C12.657 6.74519 15.075 6.69219 15.784 8.33619L15.844 8.49619L16.651 10.8562C16.8359 11.3974 17.1348 11.8927 17.5274 12.3086C17.92 12.7245 18.3973 13.0514 18.927 13.2672L19.144 13.3482L21.504 14.1542C23.254 14.7522 23.307 17.1702 21.664 17.8792L21.504 17.9392L19.144 18.7462C18.6026 18.931 18.1071 19.2298 17.691 19.6225C17.2749 20.0151 16.9479 20.4924 16.732 21.0222L16.651 21.2382L15.845 23.5992C15.247 25.3492 12.829 25.4022 12.121 23.7592L12.059 23.5992L11.253 21.2392C11.0682 20.6978 10.7694 20.2023 10.3768 19.7862C9.98413 19.3701 9.50681 19.0431 8.97702 18.8272L8.76102 18.7462L6.40102 17.9402C4.65001 17.3422 4.59701 14.9242 6.24102 14.2162L6.40102 14.1542L8.76102 13.3482C9.30225 13.1632 9.79753 12.8644 10.2134 12.4718C10.6293 12.0791 10.9562 11.6019 11.172 11.0722L11.253 10.8562L12.059 8.49519ZM21.952 5.04719C22.1391 5.04719 22.3224 5.09966 22.4811 5.19866C22.6399 5.29765 22.7677 5.43919 22.85 5.60719L22.898 5.72419L23.248 6.75019L24.275 7.10019C24.4625 7.16389 24.6268 7.28181 24.7472 7.43901C24.8676 7.59621 24.9386 7.78561 24.9513 7.98321C24.9639 8.18081 24.9176 8.37772 24.8182 8.54898C24.7188 8.72023 24.5708 8.85813 24.393 8.94519L24.275 8.99319L23.249 9.34319L22.899 10.3702C22.8352 10.5576 22.7172 10.7219 22.5599 10.8422C22.4026 10.9625 22.2132 11.0334 22.0156 11.0459C21.818 11.0584 21.6212 11.012 21.45 10.9126C21.2788 10.8131 21.141 10.6651 21.054 10.4872L21.006 10.3702L20.656 9.34419L19.629 8.99419C19.4415 8.93049 19.2771 8.81257 19.1567 8.65538C19.0364 8.49818 18.9653 8.30877 18.9527 8.11117C18.9401 7.91357 18.9864 7.71666 19.0858 7.5454C19.1851 7.37415 19.3331 7.23625 19.511 7.14919L19.629 7.10119L20.655 6.75119L21.005 5.72419C21.0724 5.52661 21.2 5.35509 21.3698 5.23368C21.5396 5.11227 21.7432 5.04706 21.952 5.04719Z";

// STATE — Hook + types
import { useChat } from "../hooks/useChat";
import type { OutputBlock, BlockType, ApprovalData, WikiReviewData, CatalogActions } from "../hooks/useChat";

// Add Data modal
import { AddDataModal } from "./AddDataModal";
import type { AddedSource } from "./AddDataModal";

// LAYOUT — Shared input component
import { ChatInput } from "./ChatInput";
import { SuggestedQuestions } from "./SuggestedQuestions";

// LAYOUT — Tool calls block
import { ToolCallsBlock } from "./ToolCallsBlock";

// COPY
import { CHAT_PANEL, BLOCK_TYPE_LABELS, ACTIONS, SQL_OVERFLOW_ITEMS } from "../constants/strings";

// Re-export types for backward compatibility
export type { OutputBlock, BlockType, CatalogActions };

// LAYOUT — Props

// Monitor icon path (viewBox: 0 0 16.6657 15.8337) — workspace toggle
const PATH_MONITOR_CHAT = "M3.95833 15.8337C3.61316 15.8337 3.33333 15.5539 3.33333 15.2087C3.33333 14.8923 3.56846 14.6308 3.87352 14.5894L3.95833 14.5837L5.41583 14.5833V12.5017L1.875 12.5019C0.882613 12.5019 0.0702959 11.7309 0.00432571 10.7553L0 10.6269V1.875C0 0.882614 0.770968 0.0702959 1.74663 0.00432571L1.875 0H14.7907C15.7831 0 16.5954 0.770968 16.6614 1.74663L16.6657 1.875V10.6269C16.6657 11.6193 15.8947 12.4316 14.9191 12.4976L14.7907 12.5019L11.2492 12.5017V14.5833L12.7083 14.5837C13.0535 14.5837 13.3333 14.8635 13.3333 15.2087C13.3333 15.5251 13.0982 15.7866 12.7931 15.828L12.7083 15.8337H3.95833ZM9.99833 12.5017H6.665L6.66583 14.5837H9.99917L9.99833 12.5017ZM14.7907 1.25H1.875C1.55859 1.25 1.29709 1.48513 1.25571 1.79019L1.25 1.875V10.6269C1.25 10.9433 1.48513 11.2048 1.79019 11.2462L1.875 11.2519H14.7907C15.1071 11.2519 15.3686 11.0168 15.41 10.7117L15.4157 10.6269V1.875C15.4157 1.55859 15.1806 1.29709 14.8755 1.25571L14.7907 1.25Z";

// Notebook/document icon path (viewBox: 0 0 13.75 16.6666) — catalog toggle
const PATH_NOTEBOOK_CHAT = "M2.5 3.33333C2.5 3.11232 2.5878 2.90035 2.74408 2.74407C2.90036 2.58779 3.11232 2.5 3.33334 2.5H9.99997C10.221 2.5 10.433 2.58779 10.5893 2.74407C10.7456 2.90035 10.8334 3.11232 10.8334 3.33333V5C10.8334 5.22101 10.7456 5.43297 10.5893 5.58925C10.433 5.74553 10.221 5.83333 9.99997 5.83333H3.33334C3.11232 5.83333 2.90036 5.74553 2.74408 5.58925C2.5878 5.43297 2.5 5.22101 2.5 5V3.33333ZM3.75 4.58333H9.58337V3.75H3.75V4.58333ZM0 2.08333C0 1.5308 0.2195 1.00089 0.6102 0.61019C1.0009 0.21949 1.5308 0 2.08334 0H11.6667C11.9403 0 12.2112 0.0538801 12.464 0.15858C12.7167 0.26328 12.9464 0.41674 13.1398 0.61019C13.3333 0.80365 13.4868 1.03331 13.5914 1.28607C13.6961 1.53883 13.75 1.80974 13.75 2.08333V13.9583C13.75 14.1241 13.6842 14.283 13.567 14.4002C13.4498 14.5175 13.2908 14.5833 13.125 14.5833H1.25C1.25 14.8043 1.3378 15.0163 1.49408 15.1726C1.65036 15.3288 1.86232 15.4166 2.08334 15.4166H13.125C13.2908 15.4166 13.4498 15.4825 13.567 15.5997C13.6842 15.7169 13.75 15.8759 13.75 16.0416C13.75 16.2074 13.6842 16.3664 13.567 16.4836C13.4498 16.6008 13.2908 16.6666 13.125 16.6666H2.08334C1.5308 16.6666 1.0009 16.4471 0.6102 16.0564C0.2195 15.6657 0 15.1358 0 14.5833V2.08333ZM1.25 13.3333H12.5V2.08333C12.5 1.86232 12.4122 1.65035 12.256 1.49407C12.0997 1.33779 11.8877 1.25 11.6667 1.25H2.08334C1.86232 1.25 1.65036 1.33779 1.49408 1.49407C1.3378 1.65035 1.25 1.86232 1.25 2.08333V13.3333Z";

interface ChatPanelProps {
  onBlockClick: (block: OutputBlock) => void;
  onBlockHover: (blockId: string | null) => void;
  hoveredBlock: string | null;
  onSaveAsView?: (block: OutputBlock) => void;
  onRegisterActions?: (actions: {
    runQuery: () => void;
    explainQuery: () => void;
    catalogActions: CatalogActions;
    wikiSave: (id: string) => void;
    wikiDismiss: (id: string) => void;
    startSaveAsViewFlow: (block: OutputBlock) => void;
  }) => void;
  chatTitle?: string | null;
  onBlocksCreated?: (blocks: OutputBlock[]) => void;
  isLanding?: boolean;
  onFirstMessage?: () => void;
  onToggleCatalog?: () => void;
  catalogOpen?: boolean;
  onToggleWorkspace?: () => void;
  workspaceOpen?: boolean;
  onDataAdded?: (source: AddedSource) => void;
}

/* ── Shared components ───────────────────────────────────────── */

// LAYOUT — Block type badge
function BlockTypeBadge({ type }: { type: BlockType }) {
  const colors: Record<BlockType, string> = {
    sql: "text-secondary-foreground",
    table: "text-secondary-foreground",
    chart: "text-secondary-foreground",
    explanation: "text-secondary-foreground",
    dataset: "text-secondary-foreground",
    view: "text-secondary-foreground",
    wiki: "text-secondary-foreground",
    lineage: "text-secondary-foreground",
  };
  return (
    <div className="bg-card flex h-[20px] items-center justify-center px-[6px] py-px relative rounded-[var(--radius-button)] shrink-0">
      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
      <p
        className={`tracking-[0.3px] uppercase whitespace-nowrap ${colors[type]}`}
        style={{
          fontFamily: "var(--font-sans, 'Inter', sans-serif)",
          fontSize: "9px",
          fontWeight: "var(--font-weight-semibold)",
          lineHeight: "1.5",
        }}
      >
        {BLOCK_TYPE_LABELS[type]}
      </p>
    </div>
  );
}

// LAYOUT — Time badge
function TimeBadge({ time }: { time: string }) {
  return (
    <div className="bg-chart-5/10 flex items-center justify-center px-[6px] py-px rounded-[var(--radius-button)] shrink-0">
      <p
        className="text-chart-5 whitespace-nowrap"
        style={{
          fontFamily: "var(--font-sans, 'Inter', sans-serif)",
          fontSize: "9px",
          fontWeight: "var(--font-weight-semibold)",
          lineHeight: "1.5",
        }}
      >
        {time}
      </p>
    </div>
  );
}

// INTERACTION — Play icon (Fluent-style filled triangle)
function PlayIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="shrink-0">
      <path d="M1.5 1.288a.5.5 0 0 1 .736-.44l7.5 4.212a.5.5 0 0 1 0 .88l-7.5 4.212A.5.5 0 0 1 1.5 9.712V1.288Z" fill="var(--secondary-foreground)" />
    </svg>
  );
}

// INTERACTION — Action button
function ActionButton({ label, onClick, icon }: { label: string; onClick?: () => void; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      className="bg-card h-[28px] relative rounded-[var(--radius-button)] shrink-0 cursor-pointer hover:bg-muted transition-colors"
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
      <div className="flex h-full items-center justify-center px-[8px] gap-[4px]">
        {icon}
        <p
          className="text-secondary-foreground whitespace-nowrap"
          style={{
            fontFamily: "var(--font-sans, 'Inter', sans-serif)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-normal)",
            lineHeight: "1.5",
          }}
        >
          {label}
        </p>
      </div>
    </button>
  );
}

// INTERACTION — Three-dot overflow menu
function MoreMenuButton({ items, onItemClick }: { items: string[]; onItemClick?: (item: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.top - 4, left: rect.left });
    }
  }, [open]);

  return (
    <div className="relative shrink-0" ref={triggerRef}>
      <div
        className="bg-card size-[28px] relative rounded-[var(--radius-button)] shrink-0 cursor-pointer hover:bg-muted transition-colors flex items-center justify-center"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
        <IconMore size={16} style={{ color: "var(--secondary-foreground)" }} />
      </div>
      {open && menuPos && createPortal(
        <div ref={ref} className="fixed z-50 bg-popover overflow-clip py-[4px] rounded-[var(--radius-button)] shadow-dropdown min-w-[8rem]" style={{ top: menuPos.top, left: menuPos.left, transform: "translateY(-100%)" }}>
          {items.map((item) => (
            <div
              key={item}
              className="h-[32px] w-full flex items-center cursor-pointer select-none hover:bg-background-hover transition-colors"
              onClick={(e) => { e.stopPropagation(); setOpen(false); onItemClick?.(item); }}
            >
              <div className="flex items-center gap-[4px] pl-[16px] pr-[8px] size-full">
                <span
                  className="flex-1 whitespace-nowrap text-popover-foreground"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--text-base)",
                    fontWeight: "var(--font-weight-normal)",
                    lineHeight: "20px",
                  }}
                >
                  {item}
                </span>
              </div>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

/* ── Approval Block (DDL/DML) ────────────────────────────────── */

// LAYOUT — Approval badge
function ApprovalBadge() {
  return (
    <div className="bg-destructive/10 flex h-[20px] items-center justify-center px-[6px] py-px rounded-[var(--radius-button)] shrink-0 gap-[4px]">
      <div className="shrink-0 size-[12px] flex items-center justify-center">
        <IconWarning size={12} style={{ color: "var(--destructive)" }} />
      </div>
      <p
        className="text-destructive tracking-[0.3px] uppercase whitespace-nowrap"
        style={{
          fontFamily: "var(--font-sans, 'Inter', sans-serif)",
          fontSize: "9px",
          fontWeight: "var(--font-weight-semibold)",
          lineHeight: "1.5",
        }}
      >
        ACTION REQUIRED
      </p>
    </div>
  );
}

// LAYOUT — Approval block view with execute/reject
function ApprovalBlockView({ approval, onExecute, onRequestChanges }: {
  approval: ApprovalData;
  onExecute: (id: string) => void;
  onRequestChanges: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [radioValue, setRadioValue] = useState<"once" | "always">("once");

  if (approval.status === "executed") {
    return (
      <div className="bg-card relative rounded-[var(--radius-card)] shrink-0 w-full">
        <div className="overflow-hidden rounded-[inherit] w-full">
          <div className="flex flex-col items-start p-px w-full">
            <div className="bg-background h-[40px] shrink-0 w-full relative">
              <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none" />
              <div className="flex items-center px-[16px] py-[8px] size-full gap-[8px]">
                <div className="bg-chart-5/10 flex h-[20px] items-center justify-center px-[6px] py-px rounded-[var(--radius-button)] shrink-0 gap-[4px]">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="var(--chart-5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <p className="text-chart-5 tracking-[0.3px] uppercase whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>EXECUTED</p>
                </div>
                <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>DDL/DML Operation</p>
              </div>
            </div>
            <div className="shrink-0 w-full px-[16px] py-[12px]">
              <p className="text-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>Operation completed successfully. 42 rows were affected.</p>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-chart-5/30 border-solid inset-0 pointer-events-none rounded-[var(--radius-card)]" />
      </div>
    );
  }

  if (approval.status === "rejected") {
    return (
      <div className="bg-card relative rounded-[var(--radius-card)] shrink-0 w-full">
        <div className="overflow-hidden rounded-[inherit] w-full">
          <div className="flex flex-col items-start p-px w-full">
            <div className="bg-background h-[40px] shrink-0 w-full relative">
              <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none" />
              <div className="flex items-center px-[16px] py-[8px] size-full gap-[8px]">
                <div className="bg-muted flex h-[20px] items-center justify-center px-[6px] py-px rounded-[var(--radius-button)] shrink-0">
                  <p className="text-secondary-foreground tracking-[0.3px] uppercase whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>CHANGES REQUESTED</p>
                </div>
                <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>DDL/DML Operation</p>
              </div>
            </div>
            <div className="shrink-0 w-full px-[16px] py-[12px]">
              <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>You requested changes. Describe what you'd like modified.</p>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-card)]" />
      </div>
    );
  }

  return (
    <div className="bg-card relative rounded-[var(--radius-card)] shrink-0 w-full">
      <div className="overflow-hidden rounded-[inherit] w-full">
        <div className="flex flex-col items-start p-px w-full">
          {/* Header */}
          <div className="bg-background h-[40px] shrink-0 w-full relative">
            <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none" />
            <div className="flex items-center px-[16px] py-[8px] size-full gap-[8px]">
              <ApprovalBadge />
              <p className="text-secondary-foreground flex-1" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>DDL/DML Operation</p>
            </div>
          </div>
          {/* Body */}
          <div className="shrink-0 w-full">
            <div className="flex flex-col gap-[12px] px-[16px] py-[12px]">
              <p className="text-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>I need to execute the following SQL statements:</p>
              <div className="relative rounded-[var(--radius-button)] w-full">
                <div className="flex flex-col overflow-hidden rounded-[inherit] w-full">
                  <div className="bg-background shrink-0 w-full">
                    <div className="flex items-center gap-[8px] pl-[12px] pr-[8px] py-[6px] w-full">
                      <p className="text-foreground flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontFamily: "var(--font-mono, 'Fira Code', monospace)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{approval.sql.split("\n")[0]}</p>
                      <button type="button" className="shrink-0 size-[20px] cursor-pointer flex items-center justify-center hover:opacity-70 transition-opacity" onClick={() => setExpanded(!expanded)}>
                        <svg width="10" height="6" viewBox="0 0 10.4397 5.96941" fill="none" style={{ transform: expanded ? "none" : "rotate(180deg)", transition: "transform 150ms ease" }}>
                          <path d={PATH_CHEVRON} fill="var(--secondary-foreground)" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {expanded && (
                    <div className="bg-card w-full px-[12px] py-[8px] border-t border-muted">
                      <pre className="text-foreground whitespace-pre-wrap" style={{ fontFamily: "var(--font-mono, 'Fira Code', monospace)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{approval.sql}</pre>
                    </div>
                  )}
                </div>
                <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
              </div>
              {/* Radio options */}
              <div className="flex flex-wrap gap-[12px] items-center">
                <label className="flex gap-[6px] items-center cursor-pointer" onClick={() => setRadioValue("always")}>
                  <div className="relative shrink-0 size-[14px]">
                    <svg className="absolute block size-full" fill="none" viewBox="0 0 16 16">
                      <circle cx="8" cy="8" fill="var(--card)" r="7.25" stroke={radioValue === "always" ? "var(--accent)" : "var(--border)"} strokeWidth="1.5" />
                      {radioValue === "always" && <circle cx="8" cy="8" fill="var(--accent)" r="4" />}
                    </svg>
                  </div>
                  <p className="text-foreground whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>Always allow in {approval.schema}</p>
                </label>
                <label className="flex gap-[6px] items-center cursor-pointer" onClick={() => setRadioValue("once")}>
                  <div className="relative shrink-0 size-[14px]">
                    <svg className="absolute block size-full" fill="none" viewBox="0 0 16 16">
                      <circle cx="8" cy="8" fill="var(--card)" r="7.25" stroke={radioValue === "once" ? "var(--accent)" : "var(--border)"} strokeWidth="1.5" />
                      {radioValue === "once" && <circle cx="8" cy="8" fill="var(--accent)" r="4" />}
                    </svg>
                  </div>
                  <p className="text-foreground whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>Allow once</p>
                </label>
              </div>
            </div>
          </div>
          {/* Action bar */}
          <div className="h-[40px] shrink-0 w-full relative" onClick={(e) => e.stopPropagation()}>
            <div aria-hidden="true" className="absolute border-muted border-solid border-t inset-0 pointer-events-none" />
            <div className="flex items-center gap-[8px] px-[16px] size-full">
              <button type="button" className="bg-accent h-[28px] flex items-center justify-center px-[8px] rounded-[var(--radius-button)] shrink-0 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => onExecute(approval.id)}>
                <p className="text-accent-foreground whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>{ACTIONS.execute}</p>
              </button>
              <button type="button" className="bg-card h-[28px] relative rounded-[var(--radius-button)] shrink-0 cursor-pointer hover:bg-muted transition-colors" onClick={() => onRequestChanges(approval.id)}>
                <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
                <div className="flex h-full items-center justify-center px-[8px]">
                  <p className="text-secondary-foreground whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{ACTIONS.requestChanges}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-destructive/40 border-solid inset-0 pointer-events-none rounded-[var(--radius-card)]" />
    </div>
  );
}

/* ── Wiki Review Block ───────────────────────────────────────── */

function WikiReviewBlockView({ wikiReview, onSave, onDismiss, onBlockClick, onBlockHover, hoveredBlock }: {
  wikiReview: WikiReviewData;
  onSave: (id: string) => void;
  onDismiss: (id: string) => void;
  onBlockClick?: (block: OutputBlock) => void;
  onBlockHover?: (blockId: string | null) => void;
  hoveredBlock?: string | null;
}) {
  const typeLabels: Record<string, string> = { source: "Source", folder: "Folder", table: "Dataset" };
  const isHovered = hoveredBlock === wikiReview.id;
  const wikiAsBlock: OutputBlock = { id: wikiReview.id, type: "explanation", title: `Wiki · ${wikiReview.nodeLabel}`, version: 1, preview: wikiReview.wikiText, data: { wikiReview } };

  if (wikiReview.status === "saved") {
    return (
      <div className={`bg-card relative rounded-[var(--radius-card)] shrink-0 w-full cursor-pointer transition-all ${isHovered ? "shadow-sm" : ""}`} onClick={() => onBlockClick?.(wikiAsBlock)} onMouseEnter={() => onBlockHover?.(wikiReview.id)} onMouseLeave={() => onBlockHover?.(null)}>
        <div className="overflow-hidden rounded-[inherit] w-full">
          <div className="flex flex-col items-start p-px w-full">
            <div className="bg-background h-[40px] shrink-0 w-full relative">
              <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none" />
              <div className="flex items-center px-[16px] py-[8px] size-full gap-[8px]">
                <div className="bg-chart-5/10 flex h-[20px] items-center justify-center px-[6px] py-px rounded-[var(--radius-button)] shrink-0 gap-[4px]">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="var(--chart-5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <p className="text-chart-5 tracking-[0.3px] uppercase whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>SAVED</p>
                </div>
                <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>Wiki · {wikiReview.nodeLabel}</p>
              </div>
            </div>
            <div className="shrink-0 w-full px-[16px] py-[12px]">
              <p className="text-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>Wiki saved for {wikiReview.nodeLabel}.</p>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[var(--radius-card)] transition-colors ${isHovered ? "border-primary" : "border-chart-5/30"}`} />
      </div>
    );
  }

  if (wikiReview.status === "dismissed") {
    return (
      <div className={`bg-card relative rounded-[var(--radius-card)] shrink-0 w-full cursor-pointer transition-all ${isHovered ? "shadow-sm" : ""}`} onClick={() => onBlockClick?.(wikiAsBlock)} onMouseEnter={() => onBlockHover?.(wikiReview.id)} onMouseLeave={() => onBlockHover?.(null)}>
        <div className="overflow-hidden rounded-[inherit] w-full">
          <div className="flex flex-col items-start p-px w-full">
            <div className="bg-background h-[40px] shrink-0 w-full relative">
              <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none" />
              <div className="flex items-center px-[16px] py-[8px] size-full gap-[8px]">
                <div className="bg-muted flex h-[20px] items-center justify-center px-[6px] py-px rounded-[var(--radius-button)] shrink-0">
                  <p className="text-secondary-foreground tracking-[0.3px] uppercase whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>DISMISSED</p>
                </div>
                <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>Wiki · {wikiReview.nodeLabel}</p>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[var(--radius-card)] transition-colors ${isHovered ? "border-primary" : "border-border"}`} />
      </div>
    );
  }

  return (
    <div className={`bg-card relative rounded-[var(--radius-card)] shrink-0 w-full cursor-pointer transition-all ${isHovered ? "shadow-sm" : ""}`} onClick={() => onBlockClick?.(wikiAsBlock)} onMouseEnter={() => onBlockHover?.(wikiReview.id)} onMouseLeave={() => onBlockHover?.(null)}>
      <div className="overflow-hidden rounded-[inherit] w-full">
        <div className="flex flex-col items-start p-px w-full">
          <div className="bg-background h-[40px] shrink-0 w-full relative">
            <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none" />
            <div className="flex items-center px-[16px] py-[8px] size-full gap-[8px]">
              <BlockTypeBadge type="wiki" />
              <p className="text-secondary-foreground flex-1" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>{typeLabels[wikiReview.nodeType]} · {wikiReview.nodeLabel}</p>
            </div>
          </div>
          <div className="shrink-0 w-full px-[16px] py-[12px]">
            <p className="text-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{wikiReview.wikiText}</p>
          </div>
          <div className="h-[40px] shrink-0 w-full relative" onClick={(e) => e.stopPropagation()}>
            <div aria-hidden="true" className="absolute border-muted border-solid border-t inset-0 pointer-events-none" />
            <div className="flex items-center gap-[8px] px-[16px] size-full">
              <button type="button" className="bg-accent h-[28px] flex items-center justify-center px-[8px] rounded-[var(--radius-button)] shrink-0 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => onSave(wikiReview.id)}>
                <p className="text-accent-foreground whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>{ACTIONS.saveWiki}</p>
              </button>
              <button type="button" className="bg-card h-[28px] relative rounded-[var(--radius-button)] shrink-0 cursor-pointer hover:bg-muted transition-colors" onClick={() => onDismiss(wikiReview.id)}>
                <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
                <div className="flex h-full items-center justify-center px-[8px]">
                  <p className="text-secondary-foreground whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{ACTIONS.dismiss}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[var(--radius-card)] transition-colors ${isHovered ? "border-primary" : "border-fyi/30"}`} />
    </div>
  );
}

/* ── Block views ─────────────────────────────────────────────── */

function SqlBlockView({ block, onBlockClick, onBlockHover, hoveredBlock }: {
  block: OutputBlock; onBlockClick: (block: OutputBlock) => void; onBlockHover: (blockId: string | null) => void; hoveredBlock: string | null;
}) {
  const isHovered = hoveredBlock === block.id;
  return (
    <div className={`bg-card relative rounded-[var(--radius-card)] shrink-0 w-full cursor-pointer transition-all ${isHovered ? "border-primary shadow-sm" : ""}`} onMouseEnter={() => onBlockHover(block.id)} onMouseLeave={() => onBlockHover(null)} onClick={() => onBlockClick(block)}>
      <div className="overflow-hidden rounded-[inherit] w-full">
        <div className="flex flex-col items-start p-px w-full">
          <div className="bg-background h-[40px] shrink-0 w-full relative">
            <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none" />
            <div className="flex items-center px-[16px] py-[8px] size-full justify-between overflow-hidden">
              <div className="flex gap-[8px] items-center flex-1 min-w-0">
                <BlockTypeBadge type="sql" />
                <p className="text-secondary-foreground whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>{block.title}</p>
              </div>
              <TimeBadge time="0.8s" />
            </div>
          </div>
          <div className="shrink-0 w-full">
            <div className="flex items-center px-[16px] py-[12px] w-full">
              <p style={{ fontFamily: "var(--font-mono, 'Fira Code', monospace)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }} className="w-full text-secondary-foreground">{block.preview?.slice(0, 120) ?? "..."}</p>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[var(--radius-card)] transition-colors ${isHovered ? "border-primary" : "border-border"}`} />
    </div>
  );
}

function TableBlockView({ block, onBlockClick, onBlockHover, hoveredBlock }: { block: OutputBlock; onBlockClick: (block: OutputBlock) => void; onBlockHover: (blockId: string | null) => void; hoveredBlock: string | null }) {
  const isHovered = hoveredBlock === block.id;
  return (
    <div className={`bg-card relative rounded-[var(--radius-card)] shrink-0 w-full cursor-pointer transition-all ${isHovered ? "shadow-sm" : ""}`} onMouseEnter={() => onBlockHover(block.id)} onMouseLeave={() => onBlockHover(null)} onClick={() => onBlockClick(block)}>
      <div className="overflow-hidden rounded-[inherit] w-full">
        <div className="flex flex-col items-start p-px w-full">
          <div className="bg-background h-[40px] shrink-0 w-full relative">
            <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none" />
            <div className="flex items-center px-[16px] py-[8px] size-full gap-[8px] overflow-hidden">
              <BlockTypeBadge type="table" />
              <p className="text-secondary-foreground whitespace-nowrap overflow-hidden text-ellipsis min-w-0 shrink-1" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>{block.title}</p>
              <p className="text-secondary-foreground whitespace-nowrap shrink-0" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{block.data?.meta || ""}</p>
              <TimeBadge time="0.8s" />
            </div>
          </div>
          <div className="bg-background shrink-0 w-full relative">
            <div aria-hidden="true" className="absolute border-muted border-b border-l border-solid border-t inset-0 pointer-events-none" />
            <div className="flex items-center h-[32px]">
              <div className="flex-1 flex items-center gap-[8px] px-[8px]">
                <div className="relative shrink-0 size-[16px]"><div className="absolute inset-[12.5%_8.33%_8.33%_8.33%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 12.6667"><g><path d={PATH_DATE_A} fill="var(--secondary-foreground)" /><path d={PATH_DATE_B} fill="var(--secondary-foreground)" /><path clipRule="evenodd" d={PATH_DATE_C} fill="var(--secondary-foreground)" fillRule="evenodd" /></g></svg></div></div>
                <p className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>Pickup_datetime</p>
              </div>
              <div className="flex-1 flex items-center gap-[8px] px-[8px] border-l border-muted">
                <div className="relative shrink-0 size-[16px]"><div className="absolute inset-[29.17%_8.33%_29.75%_8.33%]"><svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3335 6.57256"><g><path clipRule="evenodd" d={PATH_TEXT_A} fill="var(--secondary-foreground)" fillRule="evenodd" /><path clipRule="evenodd" d={PATH_TEXT_B} fill="var(--secondary-foreground)" fillRule="evenodd" /><path d={PATH_TEXT_C} fill="var(--secondary-foreground)" /></g></svg></div></div>
                <p className="text-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>ID</p>
              </div>
              <div className="w-[80px] flex items-center gap-[8px] px-[8px] border-l border-muted overflow-hidden">
                <p className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}># passenger_count</p>
              </div>
            </div>
          </div>
          {block.data?.rows.map((row: any, i: number) => (
            <div key={i} className="shrink-0 w-full flex h-[28px]">
              <div className="flex-1 flex items-center px-[8px] border-b border-l border-muted overflow-hidden"><p className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{row.pickup_datetime}</p></div>
              <div className="flex-1 flex items-center px-[8px] border-b border-l border-muted overflow-hidden"><p className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{row.id}</p></div>
              <div className="w-[80px] flex items-center px-[8px] border-b border-l border-muted overflow-hidden"><p className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{row.passenger_count}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[var(--radius-card)] transition-colors ${isHovered ? "border-primary" : "border-border"}`} />
    </div>
  );
}

function ExplanationBlockView({ block, onBlockClick, onBlockHover, hoveredBlock }: { block: OutputBlock; onBlockClick: (block: OutputBlock) => void; onBlockHover: (blockId: string | null) => void; hoveredBlock: string | null }) {
  const isHovered = hoveredBlock === block.id;
  return (
    <div className={`bg-card relative rounded-[var(--radius-card)] shrink-0 w-full cursor-pointer transition-all ${isHovered ? "shadow-sm" : ""}`} onMouseEnter={() => onBlockHover(block.id)} onMouseLeave={() => onBlockHover(null)} onClick={() => onBlockClick(block)}>
      <div className="overflow-hidden rounded-[inherit] w-full">
        <div className="flex flex-col items-start p-px w-full">
          <div className="bg-background h-[40px] shrink-0 w-full relative">
            <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none" />
            <div className="flex items-center px-[16px] py-[8px] size-full justify-between overflow-hidden">
              <div className="flex gap-[8px] items-center flex-1 min-w-0"><BlockTypeBadge type="explanation" /><p className="text-secondary-foreground whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>{block.title}</p></div>
            </div>
          </div>
          <div className="shrink-0 w-full"><div className="px-[16px] py-[12px]"><p className="text-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{block.preview?.slice(0, 120)}...</p></div></div>
        </div>
      </div>
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[var(--radius-card)] transition-colors ${isHovered ? "border-primary" : "border-border"}`} />
    </div>
  );
}

/* ── Lineage mini-preview ─────────────────────────────────── */

function LineagePreview({ nodes }: { nodes: { id: string; label: string; type: string }[] }) {
  return (
    <div className="flex items-center gap-[8px] h-[40px]">
      {nodes.map((node, i) => (
        <div key={node.id} className="flex items-center gap-[8px]">
          <div className="flex items-center gap-[4px] px-[6px] py-[4px] rounded-[4px] border border-border bg-background">
            <p className="text-foreground whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{node.label}</p>
          </div>
          {i < nodes.length - 1 && (
            <svg width="16" height="8" viewBox="0 0 16 8" fill="none"><path d="M0 4H12M12 4L9 1M12 4L9 7" stroke="var(--secondary-foreground)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg>
          )}
        </div>
      ))}
    </div>
  );
}

function ChartBlockView({ block, onBlockClick, onBlockHover, hoveredBlock, onSaveAsView }: { block: OutputBlock; onBlockClick: (block: OutputBlock) => void; onBlockHover: (blockId: string | null) => void; hoveredBlock: string | null; onSaveAsView?: (block: OutputBlock) => void }) {
  const isHovered = hoveredBlock === block.id;
  const isLineage = block.data?.lineage;
  return (
    <div className={`bg-card relative rounded-[var(--radius-card)] shrink-0 w-full cursor-pointer transition-all ${isHovered ? "shadow-sm" : ""}`} onMouseEnter={() => onBlockHover(block.id)} onMouseLeave={() => onBlockHover(null)} onClick={() => onBlockClick(block)}>
      <div className="overflow-hidden rounded-[inherit] w-full">
        <div className="flex flex-col items-start p-px w-full">
          <div className="bg-background h-[40px] shrink-0 w-full relative">
            <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none" />
            <div className="flex items-center px-[16px] py-[8px] size-full justify-between overflow-hidden">
              <div className="flex gap-[8px] items-center min-w-0 flex-1"><BlockTypeBadge type={isLineage ? "lineage" : "chart"} /><p className="text-secondary-foreground whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>{block.title}</p></div>
              <TimeBadge time={isLineage ? "0.3s" : "1.2s"} />
            </div>
          </div>
          <div className="shrink-0 w-full px-[16px] py-[12px]">
            {isLineage ? (
              <LineagePreview nodes={block.data.nodes} />
            ) : (
              <div className="flex items-end gap-[4px] h-[40px]">{[65, 45, 80, 35, 55].map((h, i) => (<div key={i} className="flex-1 bg-accent/60 rounded-t-[2px]" style={{ height: `${h}%` }} />))}</div>
            )}
          </div>
        </div>
      </div>
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[var(--radius-card)] transition-colors ${isHovered ? "border-primary" : "border-border"}`} />
    </div>
  );
}

/* ── Dataset Profile Block (chat) ─────────────────────────────── */

function DatasetBlockView({ block, onBlockClick, onBlockHover, hoveredBlock }: {
  block: OutputBlock; onBlockClick: (block: OutputBlock) => void; onBlockHover: (blockId: string | null) => void; hoveredBlock: string | null;
}) {
  const isHovered = hoveredBlock === block.id;
  const d = block.data?.profile;
  return (
    <div className={`bg-card relative rounded-[var(--radius-card)] shrink-0 w-full cursor-pointer transition-all ${isHovered ? "shadow-sm" : ""}`} onMouseEnter={() => onBlockHover(block.id)} onMouseLeave={() => onBlockHover(null)} onClick={() => onBlockClick(block)}>
      <div className="overflow-hidden rounded-[inherit] w-full">
        <div className="flex flex-col items-start p-px w-full">
          <div className="bg-background h-[40px] shrink-0 w-full relative">
            <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none" />
            <div className="flex items-center px-[16px] py-[8px] size-full gap-[8px] overflow-hidden">
              <BlockTypeBadge type="dataset" />
              <div className="shrink-0 size-[20px] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="12" height="12" rx="2" stroke="var(--secondary-foreground)" strokeWidth="1.2" />
                  <line x1="1" y1="5" x2="13" y2="5" stroke="var(--secondary-foreground)" strokeWidth="1.2" />
                  <line x1="5" y1="5" x2="5" y2="13" stroke="var(--secondary-foreground)" strokeWidth="1.2" />
                  <line x1="9" y1="5" x2="9" y2="13" stroke="var(--secondary-foreground)" strokeWidth="1.2" />
                </svg>
              </div>
              <p className="text-secondary-foreground whitespace-nowrap overflow-hidden text-ellipsis flex-1" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>{block.title}</p>
              {d && <p className="text-secondary-foreground whitespace-nowrap shrink-0" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{d.columnCount} cols</p>}
            </div>
          </div>
          {d && (
            <div className="shrink-0 w-full px-[16px] py-[12px]">
              <p className="text-secondary-foreground mb-[8px]" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{d.path}</p>
              <div className="flex gap-[8px] items-center flex-wrap">
                {d.labels?.map((label: string) => (
                  <div key={label} className="bg-primary/10 flex h-[24px] items-center justify-center px-[8px] rounded-[var(--radius-button)] shrink-0 relative">
                    <div aria-hidden="true" className="absolute border border-primary/20 border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
                    <p className="text-foreground whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{label}</p>
                  </div>
                ))}
                <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", lineHeight: "1.5" }}>·</p>
                <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", lineHeight: "1.5" }}>{d.columnCount} columns</p>
                <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", lineHeight: "1.5" }}>·</p>
                <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", lineHeight: "1.5" }}>{d.volume}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[var(--radius-card)] transition-colors ${isHovered ? "border-primary" : "border-border"}`} />
    </div>
  );
}

/* ── View Block (chat) ───────────────────────────────────────── */

function ViewBlockView({ block, onBlockClick, onBlockHover, hoveredBlock }: {
  block: OutputBlock; onBlockClick: (block: OutputBlock) => void; onBlockHover: (blockId: string | null) => void; hoveredBlock: string | null;
}) {
  const isHovered = hoveredBlock === block.id;
  const d = block.data?.profile;
  return (
    <div className={`bg-card relative rounded-[var(--radius-card)] shrink-0 w-full cursor-pointer transition-all ${isHovered ? "shadow-sm" : ""}`} onMouseEnter={() => onBlockHover(block.id)} onMouseLeave={() => onBlockHover(null)} onClick={() => onBlockClick(block)}>
      <div className="overflow-hidden rounded-[inherit] w-full">
        <div className="flex flex-col items-start p-px w-full">
          <div className="bg-background h-[40px] shrink-0 w-full relative">
            <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none" />
            <div className="flex items-center px-[16px] py-[8px] size-full gap-[8px] overflow-hidden">
              <BlockTypeBadge type="view" />
              <div className="shrink-0 size-[20px] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="12" height="12" rx="2" stroke="var(--accent)" strokeWidth="1.2" />
                  <line x1="1" y1="5" x2="13" y2="5" stroke="var(--accent)" strokeWidth="1.2" />
                  <line x1="5" y1="5" x2="5" y2="13" stroke="var(--accent)" strokeWidth="1.2" />
                  <line x1="9" y1="5" x2="9" y2="13" stroke="var(--accent)" strokeWidth="1.2" />
                </svg>
              </div>
              <p className="text-secondary-foreground whitespace-nowrap overflow-hidden text-ellipsis flex-1" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>{block.title}</p>
              {d && <p className="text-secondary-foreground whitespace-nowrap shrink-0" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{d.columnCount} cols</p>}
            </div>
          </div>
          {d && (
            <div className="shrink-0 w-full px-[16px] py-[12px]">
              <p className="text-secondary-foreground mb-[8px]" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{d.path}</p>
              <div className="flex gap-[8px] items-center flex-wrap">
                {d.labels?.map((label: string) => (
                  <div key={label} className="bg-accent/10 flex h-[24px] items-center justify-center px-[8px] rounded-[var(--radius-button)] shrink-0 relative">
                    <div aria-hidden="true" className="absolute border border-accent/20 border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
                    <p className="text-accent whitespace-nowrap" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{label}</p>
                  </div>
                ))}
                <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", lineHeight: "1.5" }}>·</p>
                <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", lineHeight: "1.5" }}>{d.columnCount} columns</p>
                <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", lineHeight: "1.5" }}>·</p>
                <p className="text-secondary-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", lineHeight: "1.5" }}>{d.volume}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[var(--radius-card)] transition-colors ${isHovered ? "border-primary" : "border-accent/30"}`} />
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */

/** Chat panel — renders messages, output blocks, and gradient-bordered input */
export function ChatPanel({ onBlockClick, onBlockHover, hoveredBlock, onSaveAsView, onRegisterActions, chatTitle, onBlocksCreated, isLanding, onFirstMessage, onToggleCatalog, catalogOpen, onToggleWorkspace, workspaceOpen, onDataAdded }: ChatPanelProps) {
  // STATE — All chat state from custom hook
  const chat = useChat({ onRegisterActions, onBlocksCreated });

  // STATE — Add Data modal
  const [addDataModalOpen, setAddDataModalOpen] = useState(false);

  const handleOpenAddData = useCallback(() => setAddDataModalOpen(true), []);
  const handleCloseAddData = useCallback(() => setAddDataModalOpen(false), []);
  const handleDataAdded = useCallback((source: AddedSource) => {
    onDataAdded?.(source);
    setAddDataModalOpen(false);
  }, [onDataAdded]);

  // INTERACTION — Landing send: notify parent then handle normally
  const handleLandingSend = useCallback(() => {
    if (chat.inputValue.trim()) {
      onFirstMessage?.();
      chat.handleSend();
    }
  }, [chat.inputValue, chat.handleSend, onFirstMessage]);

  const handleLandingKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && chat.inputValue.trim()) {
      onFirstMessage?.();
    }
    chat.handleInputKeyDown(e);
  }, [chat.handleInputKeyDown, chat.inputValue, onFirstMessage]);

  // INTERACTION — Block rendering
  const renderBlock = useCallback(
    (block: OutputBlock) => {
      switch (block.type) {
        case "sql":
          return <SqlBlockView key={block.id} block={block} onBlockClick={onBlockClick} onBlockHover={onBlockHover} hoveredBlock={hoveredBlock} />;
        case "table":
          return <TableBlockView key={block.id} block={block} onBlockClick={onBlockClick} onBlockHover={onBlockHover} hoveredBlock={hoveredBlock} />;
        case "chart":
          return <ChartBlockView key={block.id} block={block} onBlockClick={onBlockClick} onBlockHover={onBlockHover} hoveredBlock={hoveredBlock} onSaveAsView={onSaveAsView} />;
        case "explanation":
          return <ExplanationBlockView key={block.id} block={block} onBlockClick={onBlockClick} onBlockHover={onBlockHover} hoveredBlock={hoveredBlock} />;
        case "dataset":
          return <DatasetBlockView key={block.id} block={block} onBlockClick={onBlockClick} onBlockHover={onBlockHover} hoveredBlock={hoveredBlock} />;
        case "view":
          return <ViewBlockView key={block.id} block={block} onBlockClick={onBlockClick} onBlockHover={onBlockHover} hoveredBlock={hoveredBlock} />;
        default:
          return null;
      }
    },
    [onBlockClick, onBlockHover, hoveredBlock, onSaveAsView],
  );

  // LAYOUT — Landing view
  if (isLanding) {
    return (
      <div className="flex flex-col h-full overflow-hidden items-center justify-center pb-[12%]">
        <div className="flex flex-col items-center gap-[28px] w-full max-w-[860px] px-[32px]">
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "34px",
              fontWeight: "500",
              lineHeight: "1.2",
              background: "linear-gradient(90deg, #299FB1 0%, #4FC08B 55%, #B7D325 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Welcome to Dremio!
          </h1>
          <div className="w-full">
            <ChatInput
              inputValue={chat.inputValue}
              onInputChange={chat.setInputValue}
              onSend={handleLandingSend}
              onKeyDown={handleLandingKeyDown}
              onInput={chat.handleTextareaInput}
              textareaRef={chat.textareaRef}
              contextChips={chat.contextChips}
              onRemoveChip={chat.removeContextChip}
              variant="landing"
              onAddData={handleOpenAddData}
            />
          </div>
          {addDataModalOpen && (
            <AddDataModal onClose={handleCloseAddData} onDataAdded={handleDataAdded} />
          )}
        </div>
      </div>
    );
  }

  return (
    // LAYOUT
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat header — 52px */}
      <div className="shrink-0 w-full relative h-[52px]">
        <div aria-hidden="true" className="absolute border-muted border-b border-solid left-0 right-0 bottom-0 pointer-events-none" style={{ height: "1px" }} />
        <div className="content-stretch flex items-center justify-between px-[20px] py-[8px] relative size-full">
          <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
            <div className="relative shrink-0 size-[30px]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                <path d={PATH_AI_SPARKLE} fill="url(#paint0_linear_chat_hdr)" />
                <defs>
                  <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_chat_hdr" x1="4.14179" x2="27.1147" y1="9.21348" y2="25.3789">
                    <stop stopColor="#299FB1" /><stop offset="0.55" stopColor="#4FC08B" /><stop offset="1" stopColor="#B7D325" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="content-stretch flex flex-col items-start justify-center relative shrink-0">
              <p className="text-foreground whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}>
                {chatTitle ?? CHAT_PANEL.headerTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-[8px]">
            {/* Catalog toggle */}
            <button
              type="button"
              title={catalogOpen ? "Close catalog" : "Open catalog"}
              className={`relative rounded-[var(--radius-button)] shrink-0 size-[28px] cursor-pointer hover:bg-muted transition-colors flex items-center justify-center ${catalogOpen ? "bg-muted" : ""}`}
              onClick={onToggleCatalog}
            >
              <div aria-hidden="true" className="absolute border border-border/50 border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
              <div className="relative shrink-0 size-[16px]">
                <div className="absolute inset-[8.33%_14.58%_8.33%_16.67%]">
                  <svg className="absolute block size-full" fill="none" viewBox="0 0 13.75 16.6666">
                    <path d={PATH_NOTEBOOK_CHAT} fill="var(--secondary-foreground)" />
                  </svg>
                </div>
              </div>
            </button>
            {/* Workspace toggle */}
            <button
              type="button"
              title={workspaceOpen ? "Close workspace" : "Open workspace"}
              className={`relative rounded-[var(--radius-button)] shrink-0 size-[28px] cursor-pointer hover:bg-muted transition-colors flex items-center justify-center ${workspaceOpen ? "bg-muted" : ""}`}
              onClick={onToggleWorkspace}
            >
              <div aria-hidden="true" className="absolute border border-border/50 border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
              <div className="relative shrink-0 size-[16px]">
                <div className="absolute inset-[8.33%_8.34%_8.33%_8.33%]">
                  <svg className="absolute block size-full" fill="none" viewBox="0 0 16.6657 15.8337">
                    <path d={PATH_MONITOR_CHAT} fill="var(--secondary-foreground)" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-[16px] py-[16px]">
        <div className="flex flex-col gap-[16px] items-center">
          {chat.messages.map((msg, idx) => {
            const isLastMsg = idx === chat.messages.length - 1;
            return msg.role === "user" ? (
              <div key={msg.id} className="flex items-start justify-end w-full">
                <div className="bg-muted rounded-tl-[var(--radius-card)] rounded-tr-[var(--radius-card)] rounded-br-[var(--radius-button)] rounded-bl-[var(--radius-card)] max-w-[80%]">
                  <div className="px-[16px] py-[8px]">
                    <p className="text-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{msg.text}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex flex-col gap-[8px] items-start w-full">
                {msg.text && (
                  <div className="w-full">
                    <div className="py-[4px]">
                      <p className="text-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>{msg.text}</p>
                    </div>
                  </div>
                )}
                {msg.toolCalls && (
                  <ToolCallsBlock toolCalls={msg.toolCalls} />
                )}
                {msg.approval && (
                  <ApprovalBlockView approval={msg.approval} onExecute={chat.handleApprovalExecute} onRequestChanges={chat.handleApprovalReject} />
                )}
                {msg.wikiReview && (
                  <WikiReviewBlockView wikiReview={msg.wikiReview} onSave={chat.handleWikiSave} onDismiss={chat.handleWikiDismiss} onBlockClick={onBlockClick} onBlockHover={onBlockHover} hoveredBlock={hoveredBlock} />
                )}
                {msg.blocks?.map((block) => renderBlock(block))}
                {isLastMsg && !chat.isTyping && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <SuggestedQuestions
                    questions={msg.suggestedQuestions}
                    onSelect={(q) => { chat.setInputValue(q); chat.textareaRef.current?.focus(); }}
                  />
                )}
              </div>
            );
          })}
          {chat.isTyping && (
            <div className="flex items-start w-full">
              <div className="bg-card relative rounded-bl-[var(--radius-button)] rounded-br-[var(--radius-card)] rounded-tl-[var(--radius-card)] rounded-tr-[var(--radius-card)]">
                <div aria-hidden="true" className="absolute border border-border/50 border-solid inset-0 pointer-events-none rounded-bl-[var(--radius-button)] rounded-br-[var(--radius-card)] rounded-tl-[var(--radius-card)] rounded-tr-[var(--radius-card)]" />
                <div className="px-[16px] py-[8px] flex gap-[4px] items-center">
                  <div className="size-[6px] rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="size-[6px] rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="size-[6px] rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chat.messagesEndRef} />
        </div>
      </div>

      {/* Chat input — Figma gradient border */}
      <ChatInput
        inputValue={chat.inputValue}
        onInputChange={chat.setInputValue}
        onSend={chat.handleSend}
        onKeyDown={chat.handleInputKeyDown}
        onInput={chat.handleTextareaInput}
        textareaRef={chat.textareaRef}
        contextChips={chat.contextChips}
        onRemoveChip={chat.removeContextChip}
        onAddData={handleOpenAddData}
      />

      {/* Add Data modal — portal renders above everything */}
      {addDataModalOpen && (
        <AddDataModal onClose={handleCloseAddData} onDataAdded={handleDataAdded} />
      )}
    </div>
  );
}