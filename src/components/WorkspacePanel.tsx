// COMPONENT — Workspace panel (Plan, Outputs, Context tabs)
// Portable version: no Figma svgPaths imports — uses icon components and inline paths
// Shows plan steps, output blocks (SQL, table, chart, explanation), context items

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
// Inline path data for non-standard viewBox icons used in this panel
// Source: svg-javaskxvh1.ts

// Monitor/display icon (viewBox: 0 0 16.6657 15.8337)
const PATH_MONITOR = "M3.95833 15.8337C3.61316 15.8337 3.33333 15.5539 3.33333 15.2087C3.33333 14.8923 3.56846 14.6308 3.87352 14.5894L3.95833 14.5837L5.41583 14.5833V12.5017L1.875 12.5019C0.882613 12.5019 0.0702959 11.7309 0.00432571 10.7553L0 10.6269V1.875C0 0.882614 0.770968 0.0702959 1.74663 0.00432571L1.875 0H14.7907C15.7831 0 16.5954 0.770968 16.6614 1.74663L16.6657 1.875V10.6269C16.6657 11.6193 15.8947 12.4316 14.9191 12.4976L14.7907 12.5019L11.2492 12.5017V14.5833L12.7083 14.5837C13.0535 14.5837 13.3333 14.8635 13.3333 15.2087C13.3333 15.5251 13.0982 15.7866 12.7931 15.828L12.7083 15.8337H3.95833ZM9.99833 12.5017H6.665L6.66583 14.5837H9.99917L9.99833 12.5017ZM14.7907 1.25H1.875C1.55859 1.25 1.29709 1.48513 1.25571 1.79019L1.25 1.875V10.6269C1.25 10.9433 1.48513 11.2048 1.79019 11.2462L1.875 11.2519H14.7907C15.1071 11.2519 15.3686 11.0168 15.41 10.7117L15.4157 10.6269V1.875C15.4157 1.55859 15.1806 1.29709 14.8755 1.25571L14.7907 1.25Z";

// Notebook/document icon (viewBox: 0 0 13.75 16.6666)
const PATH_NOTEBOOK = "M2.5 3.33333C2.5 3.11232 2.5878 2.90035 2.74408 2.74407C2.90036 2.58779 3.11232 2.5 3.33334 2.5H9.99997C10.221 2.5 10.433 2.58779 10.5893 2.74407C10.7456 2.90035 10.8334 3.11232 10.8334 3.33333V5C10.8334 5.22101 10.7456 5.43297 10.5893 5.58925C10.433 5.74553 10.221 5.83333 9.99997 5.83333H3.33334C3.11232 5.83333 2.90036 5.74553 2.74408 5.58925C2.5878 5.43297 2.5 5.22101 2.5 5V3.33333ZM3.75 4.58333H9.58337V3.75H3.75V4.58333ZM0 2.08333C0 1.5308 0.2195 1.00089 0.6102 0.61019C1.0009 0.21949 1.5308 0 2.08334 0H11.6667C11.9403 0 12.2112 0.0538801 12.464 0.15858C12.7167 0.26328 12.9464 0.41674 13.1398 0.61019C13.3333 0.80365 13.4868 1.03331 13.5914 1.28607C13.6961 1.53883 13.75 1.80974 13.75 2.08333V13.9583C13.75 14.1241 13.6842 14.283 13.567 14.4002C13.4498 14.5175 13.2908 14.5833 13.125 14.5833H1.25C1.25 14.8043 1.3378 15.0163 1.49408 15.1726C1.65036 15.3288 1.86232 15.4166 2.08334 15.4166H13.125C13.2908 15.4166 13.4498 15.4825 13.567 15.5997C13.6842 15.7169 13.75 15.8759 13.75 16.0416C13.75 16.2074 13.6842 16.3664 13.567 16.4836C13.4498 16.6008 13.2908 16.6666 13.125 16.6666H2.08334C1.5308 16.6666 1.0009 16.4471 0.6102 16.0564C0.2195 15.6657 0 15.1358 0 14.5833V2.08333ZM1.25 13.3333H12.5V2.08333C12.5 1.86232 12.4122 1.65035 12.256 1.49407C12.0997 1.33779 11.8877 1.25 11.6667 1.25H2.08334C1.86232 1.25 1.65036 1.33779 1.49408 1.49407C1.3378 1.65035 1.25 1.86232 1.25 2.08333V13.3333Z";
import { IconMore } from "./icons/IconMore";
import { IconClose } from "./icons/IconClose";
import type { OutputBlock, BlockType, CatalogActions } from "../hooks/useChat";
import { IconEntityTable } from "./icons/IconEntityTable";
import { IconEntityView } from "./icons/IconEntityView";

interface WorkspacePanelProps {
  activeBlock: OutputBlock | null;
  blockHistory: OutputBlock[];
  onClose: () => void;
  onSelectBlock: (block: OutputBlock) => void;
  onSaveAsView?: (block: OutputBlock) => void;
  chatActions?: { runQuery: () => void; explainQuery: () => void; catalogActions: CatalogActions; wikiSave: (id: string) => void; wikiDismiss: (id: string) => void } | null;
  bronzeComplete?: boolean;
}

/* ── Shared small components ─────────────────────────────────── */

function BlockTypeBadge({ type }: { type: BlockType }) {
  const labels: Record<BlockType, string> = {
    sql: "SQL",
    table: "TABLE",
    chart: "VIS",
    explanation: "TEXT",
    dataset: "DATASET",
    view: "VIEW",
    wiki: "WIKI",
    lineage: "LINEAGE",
  };
  const colors: Record<BlockType, string> = {
    sql: "text-secondary-foreground",
    table: "text-secondary-foreground",
    chart: "text-secondary-foreground",
    explanation: "text-secondary-foreground",
    dataset: "text-accent",
    view: "text-accent",
    wiki: "text-secondary-foreground",
    lineage: "text-secondary-foreground",
  };
  return (
    <div className="bg-card flex h-[20px] items-center justify-center px-[6px] py-px relative rounded-[var(--radius-button)] shrink-0">
      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
      <p
        className={`tracking-[0.3px] uppercase whitespace-nowrap ${colors[type]}`}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "9px",
          fontWeight: "var(--font-weight-semibold)",
          lineHeight: "1.5",
        }}
      >
        {labels[type]}
      </p>
    </div>
  );
}

function formatTime(createdAt?: number): string {
  if (!createdAt) return "";
  const now = Date.now();
  const diff = now - createdAt;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(createdAt).toLocaleDateString();
}

/** Bordered toolbar button (visible actions). */
function ToolbarBtn({ label, primary, onClick, icon }: { label: string; primary?: boolean; onClick?: () => void; icon?: React.ReactNode }) {
  if (primary) {
    return (
      <button
        type="button"
        className="bg-accent flex h-[28px] items-center justify-center px-[8px] gap-[4px] rounded-[var(--radius-button)] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={onClick}
      >
        {icon}
        <p
          className="whitespace-nowrap"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-semibold)",
            lineHeight: "1.5",
            color: "var(--primary-foreground)",
          }}
        >
          {label}
        </p>
      </button>
    );
  }
  return (
    <button
      type="button"
      className="flex h-[28px] items-center justify-center px-[8px] gap-[4px] relative rounded-[var(--radius-button)] shrink-0 cursor-pointer hover:bg-muted transition-colors"
      onClick={onClick}
    >
      <div aria-hidden="true" className="absolute border border-border/50 border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
      {icon}
      <p
        className="whitespace-nowrap"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          fontWeight: "var(--font-weight-normal)",
          lineHeight: "1.5",
          color: "var(--secondary-foreground)",
        }}
      >
        {label}
      </p>
    </button>
  );
}

/** Three-dot "More" overflow menu for toolbars. */
function ToolbarMoreMenu({ items, onItemClick }: { items: string[]; onItemClick?: (item: string) => void }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right });
    }
  }, [open]);

  return (
    <div ref={triggerRef} className="relative shrink-0">
      <button
        type="button"
        className="flex h-[28px] w-[28px] items-center justify-center relative rounded-[var(--radius-button)] shrink-0 cursor-pointer hover:bg-muted transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div aria-hidden="true" className="absolute border border-border/50 border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
        <IconMore size={16} style={{ color: "var(--secondary-foreground)" }} />
      </button>
      {open && menuPos && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-50 bg-popover overflow-clip py-[4px] rounded-[var(--radius-button)] shadow-dropdown min-w-[8rem]"
          style={{ top: menuPos.top, left: menuPos.left, transform: "translateX(-100%)" }}
        >
          {items.map((item) => (
            <button
              key={item}
              type="button"
              className="h-[32px] w-full text-left flex items-center cursor-pointer select-none hover:bg-background-hover transition-colors"
              onClick={() => { setOpen(false); onItemClick?.(item); }}
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
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── History dropdown ─────────────────────────────────────────── */

function HistoryDropdown({
  blocks,
  activeBlockId,
  onSelect,
}: {
  blocks: OutputBlock[];
  activeBlockId: string | null;
  onSelect: (block: OutputBlock) => void;
}) {
  // Newest first
  const sorted = [...blocks].reverse();

  return (
    <div className="absolute top-[52px] right-[8px] z-50 bg-popover text-popover-foreground rounded-md border border-border shadow-md w-[280px] max-h-[320px] overflow-hidden flex flex-col">
      <div className="px-[12px] py-[8px] border-b border-border">
        <p
          className="text-foreground"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-semibold)",
            lineHeight: "1.5",
          }}
        >
          Generated Outputs
        </p>
        <p
          className="text-muted-foreground"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "9px",
            fontWeight: "var(--font-weight-normal)",
            lineHeight: "1.5",
          }}
        >
          {blocks.length} items · newest first
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {sorted.map((block) => (
          <button
            key={block.id}
            type="button"
            className={`w-full flex items-center gap-[8px] px-2 py-1.5 cursor-pointer rounded-sm select-none hover:bg-accent hover:text-accent-foreground transition-colors ${
              block.id === activeBlockId ? "bg-muted/60" : ""
            }`}
            onClick={() => onSelect(block)}
          >
            <BlockTypeBadge type={block.type} />
            <div className="flex-1 min-w-0 text-left">
              <p
                className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                  lineHeight: "1.5",
                }}
              >
                {block.title}
              </p>
            </div>
            <div className="flex items-center gap-[6px] shrink-0">
              <p
                className="text-muted-foreground whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "9px",
                  fontWeight: "var(--font-weight-normal)",
                  lineHeight: "1.5",
                }}
              >
                v{block.version}
              </p>
              {block.createdAt && (
                <p
                  className="text-muted-foreground whitespace-nowrap"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "9px",
                    fontWeight: "var(--font-weight-normal)",
                    lineHeight: "1.5",
                  }}
                >
                  {formatTime(block.createdAt)}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Workspace content views ─────────────────────────────────── */

function SqlWorkspaceView({ block, onSaveAsView, onRunQuery, onExplainQuery }: { block: OutputBlock; onSaveAsView?: (block: OutputBlock) => void; onRunQuery?: () => void; onExplainQuery?: () => void }) {
  return (
    <div className="flex-1 flex flex-col overflow-auto px-[16px] py-[8px]">
      <div className="relative rounded-[var(--radius-card)] w-full flex-1 min-h-0">
        <div className="overflow-hidden rounded-[inherit] size-full">
          <div className="flex flex-col items-start p-px size-full">
            {/* Toolbar: title left, actions right — matches Table/Chart/Explanation layout */}
            <div className="bg-[rgba(249,250,251,0.5)] relative shrink-0 w-full">
              <div aria-hidden="true" className="absolute border-border/30 border-b border-solid inset-0 pointer-events-none" />
              <div className="flex items-center px-[12px] py-[8px] w-full gap-[8px]">
                <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[12px] flex-1">
                  {block.title}
                </p>
                <ToolbarBtn
                  label="Run in SQL runner"
                  primary
                  onClick={onRunQuery}
                  icon={
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="shrink-0">
                      <path d="M1.5 1.288a.5.5 0 0 1 .736-.44l7.5 4.212a.5.5 0 0 1 0 .88l-7.5 4.212A.5.5 0 0 1 1.5 9.712V1.288Z" fill="var(--primary-foreground)" />
                    </svg>
                  }
                />
                <ToolbarBtn label="Copy" />
                <ToolbarMoreMenu
                  items={["Save as View", "Format", "Explain", "Download .sql", "Edit"]}
                  onItemClick={(item) => { if (item === "Save as View") onSaveAsView?.(block); if (item === "Explain") onExplainQuery?.(); }}
                />
              </div>
            </div>
            {/* SQL Code */}
            <div className="bg-card flex-1 w-full overflow-auto">
              <div className="p-[16px]">
                <pre className="font-['Fira Code',monospace] text-[12px] leading-[150%] whitespace-pre-wrap">
                  <span className="text-muted-foreground italic">-- Bronze layer DDL · Auto-generated by AI Agent</span>{"\n"}
                  <span className="text-accent font-medium">CREATE OR REPLACE VIEW</span><span className="text-foreground"> bronze.customer_360.raw_customers </span><span className="text-accent font-medium">AS</span>{"\n"}
                  <span className="text-accent font-medium">SELECT</span>{"\n"}
                  <span className="text-foreground">  customer_id,</span>{"\n"}
                  <span className="text-foreground">  first_name,</span>{"\n"}
                  <span className="text-foreground">  last_name,</span>{"\n"}
                  <span className="text-foreground">  email,</span>{"\n"}
                  <span className="text-foreground">  phone,</span>{"\n"}
                  <span className="text-foreground">  city,</span>{"\n"}
                  <span className="text-foreground">  state,</span>{"\n"}
                  <span className="text-foreground">  created_at,</span>{"\n"}
                  <span className="text-foreground">  updated_at,</span>{"\n"}
                  <span className="text-foreground">  source_system,</span>{"\n"}
                  <span className="text-foreground">  _ingested_at</span>{"\n"}
                  <span className="text-accent font-medium">FROM</span><span className="text-foreground"> crm.raw_customers;</span>{"\n"}
                  {"\n"}
                  <span className="text-muted-foreground italic">-- (+ 3 more views: raw_orders, raw_interactions, raw_campaigns)</span>
                </pre>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-border/50 border-solid inset-0 pointer-events-none rounded-[var(--radius-card)]" />
      </div>
    </div>
  );
}

function TableWorkspaceView({ block, onSaveAsView }: { block: OutputBlock; onSaveAsView?: (block: OutputBlock) => void }) {
  const rows = [
    { station: "Grand Central Terminal", total: 45892, member: 38204, casual: 7688, avg: 8.2 },
    { station: "Union Square", total: 38451, member: 29841, casual: 8610, avg: 12.4 },
    { station: "Times Square", total: 35120, member: 18560, casual: 16560, avg: 18.7 },
    { station: "Penn Station", total: 32890, member: 27521, casual: 5369, avg: 9.1 },
    { station: "Central Park South", total: 28744, member: 14372, casual: 14372, avg: 22.3 },
    { station: "Columbus Circle", total: 26510, member: 21208, casual: 5302, avg: 10.6 },
    { station: "Brooklyn Bridge", total: 24893, member: 12447, casual: 12446, avg: 25.1 },
    { station: "Wall Street", total: 22140, member: 19926, casual: 2214, avg: 7.8 },
    { station: "Hudson Yards", total: 19876, member: 15901, casual: 3975, avg: 14.2 },
    { station: "Williamsburg Bridge", total: 18320, member: 14656, casual: 3664, avg: 16.9 },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-[16px] py-[8px]">
      <div className="relative rounded-[var(--radius-card)] w-full flex-1 min-h-0 border border-border/50 overflow-hidden flex flex-col">
        {/* Toolbar: Export CSV + Copy visible, rest in More */}
        <div className="bg-[rgba(249,250,251,0.5)] relative shrink-0 w-full border-b border-border/30">
          <div className="flex items-center px-[12px] py-[8px] w-full gap-[8px]">
            <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[12px]">
              {block.title}
            </p>
            <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-muted-foreground text-[12px] flex-1">
              {rows.length} rows · 5 cols
            </p>
            <ToolbarBtn label="Export CSV" />
            <ToolbarBtn label="Copy" />
            <ToolbarMoreMenu
              items={["Save as View", "Download JSON"]}
              onItemClick={(item) => { if (item === "Save as View") onSaveAsView?.(block); }}
            />
          </div>
        </div>
        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background border-b border-muted sticky top-0">
                <th className="text-left px-[8px] py-[6px] font-['Inter',sans-serif] font-semibold text-foreground text-[12px] leading-[150%] border-l border-muted first:border-l-0">Station</th>
                <th className="text-right px-[8px] py-[6px] font-['Inter',sans-serif] font-semibold text-foreground text-[12px] leading-[150%] border-l border-muted">Total</th>
                <th className="text-right px-[8px] py-[6px] font-['Inter',sans-serif] font-semibold text-foreground text-[12px] leading-[150%] border-l border-muted">Members</th>
                <th className="text-right px-[8px] py-[6px] font-['Inter',sans-serif] font-semibold text-foreground text-[12px] leading-[150%] border-l border-muted">Casual</th>
                <th className="text-right px-[8px] py-[6px] font-['Inter',sans-serif] font-semibold text-foreground text-[12px] leading-[150%] border-l border-muted">Avg Min</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-muted hover:bg-muted/30">
                  <td className="px-[8px] py-[6px] font-['Inter',sans-serif] font-normal text-foreground text-[12px] leading-[150%]">{row.station}</td>
                  <td className="text-right px-[8px] py-[6px] font-['Inter',sans-serif] font-normal text-foreground text-[12px] leading-[150%] border-l border-muted">{row.total.toLocaleString()}</td>
                  <td className="text-right px-[8px] py-[6px] font-['Inter',sans-serif] font-normal text-foreground text-[12px] leading-[150%] border-l border-muted">{row.member.toLocaleString()}</td>
                  <td className="text-right px-[8px] py-[6px] font-['Inter',sans-serif] font-normal text-foreground text-[12px] leading-[150%] border-l border-muted">{row.casual.toLocaleString()}</td>
                  <td className="text-right px-[8px] py-[6px] font-['Inter',sans-serif] font-normal text-foreground text-[12px] leading-[150%] border-l border-muted">{row.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Lineage node card (workspace full view) ─────────────────── */

function LineageNodeCard({ node, isTarget }: { node: { id: string; label: string; namespace: string; type: string; columns: string[] }; isTarget?: boolean }) {
  const [showColumns, setShowColumns] = useState(true);

  return (
    <div className={`bg-card rounded-[var(--radius-card)] shrink-0 w-[220px] overflow-hidden ${isTarget ? "ring-2 ring-accent/40" : ""}`} style={{ border: "1px solid var(--border)" }}>
      {/* Header */}
      <div className="bg-background h-[40px] w-full relative rounded-t-[var(--radius-card)]">
        <div aria-hidden="true" className="absolute border-border border-b border-solid inset-0 pointer-events-none rounded-t-[var(--radius-card)]" />
        <div className="flex items-center px-[8px] py-[4px] size-full gap-[8px]">
          <div className="shrink-0 size-[20px] flex items-center justify-center">
            {node.type === "view" ? <IconEntityView size={20} /> : <IconEntityTable size={20} />}
          </div>
          <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[14px] overflow-hidden text-ellipsis whitespace-nowrap flex-1">{node.label}</p>
        </div>
      </div>
      {/* Metadata */}
      <div className="px-[8px] py-[4px] border-b border-border">
        <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px]">{node.namespace}</p>
        <div className="flex items-center justify-between mt-[2px]">
          <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px]">Jobs (last 30 hours)</p>
          <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-accent text-[12px]">23</p>
        </div>
        <div className="flex items-center justify-between mt-[2px]">
          <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px]">Owner</p>
          <div className="flex items-center gap-[4px]">
            <div className="size-[16px] rounded-full bg-accent/30 flex items-center justify-center">
              <p className="font-['Inter',sans-serif] font-normal text-accent text-[8px]">A</p>
            </div>
            <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px]">Antonio</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-[2px]">
          <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px]">Last updated</p>
          <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px]">Sep 11, 2024, 6:23AM</p>
        </div>
      </div>
      {/* Columns toggle */}
      <div className="px-[8px] py-[4px] border-b border-border">
        <button type="button" className="flex items-center gap-[4px] cursor-pointer" onClick={() => setShowColumns(!showColumns)}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: showColumns ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <path d="M1 1L5 5L9 1" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-accent text-[12px]">{showColumns ? "Hide" : "Show"} {node.columns.length} columns</p>
        </button>
      </div>
      {/* Columns list */}
      {showColumns && (
        <div className="max-h-[180px] overflow-y-auto">
          {node.columns.map((col, i) => (
            <div key={`${col}-${i}`} className="flex items-center gap-[4px] px-[16px] py-[4px]">
              <span className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[9px] shrink-0">abc</span>
              <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">{col}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChartWorkspaceView({ block, onSaveAsView }: { block: OutputBlock; onSaveAsView?: (block: OutputBlock) => void }) {
  const isLineage = block.data?.lineage;

  if (isLineage) {
    const { nodes, edges } = block.data;
    return (
      <div className="flex-1 flex flex-col overflow-hidden px-[16px] py-[8px]">
        <div className="relative rounded-[var(--radius-card)] w-full flex-1 min-h-0 border border-border/50 overflow-hidden flex flex-col bg-card">
          {/* Toolbar */}
          <div className="bg-[rgba(249,250,251,0.5)] border-b border-border/30 shrink-0">
            <div className="flex items-center px-[12px] py-[8px] w-full gap-[8px]">
              <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[12px] flex-1">
                {block.title}
              </p>
              <ToolbarBtn label="Zoom to fit" />
              <ToolbarBtn label="Copy" />
              <ToolbarMoreMenu items={["Download PNG", "Download SVG", "Share"]} />
            </div>
          </div>
          {/* Lineage graph area */}
          <div className="flex-1 overflow-auto p-[24px]">
            <div className="flex items-start gap-[48px] min-w-min">
              {nodes.map((node: any, i: number) => (
                <div key={node.id} className="flex items-center gap-[24px]">
                  <LineageNodeCard node={node} isTarget={node.id === "target"} />
                  {i < nodes.length - 1 && (
                    <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className="shrink-0">
                      <path d="M0 12H40M40 12L34 6M40 12L34 18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const data = [
    { station: "Grand Central", member: 83, casual: 17 },
    { station: "Union Sq", member: 78, casual: 22 },
    { station: "Times Sq", member: 53, casual: 47 },
    { station: "Penn Stn", member: 84, casual: 16 },
    { station: "Central Pk", member: 50, casual: 50 },
  ];

  return (
    <div className="flex-1 overflow-auto px-[16px] py-[8px]">
      <div className="relative rounded-[var(--radius-card)] w-full border border-border/50 overflow-hidden bg-card">
        <div className="bg-[rgba(249,250,251,0.5)] border-b border-border/30">
          <div className="flex items-center px-[12px] py-[8px] w-full gap-[8px]">
            <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[12px] flex-1">
              {block.title}
            </p>
            <ToolbarBtn label="Copy" />
            <ToolbarBtn label="Save as View" onClick={() => onSaveAsView?.(block)} />
            <ToolbarMoreMenu items={["Download PNG", "Download CSV", "Edit"]} />
          </div>
        </div>
        <div className="p-[16px]">
          <div className="flex items-end gap-[10px] h-[120px] pb-[24px]">
            {data.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col gap-px items-start h-full justify-end">
                <div className="bg-accent/80 rounded-t-[3px] w-full" style={{ height: `${d.member}%` }} />
                <div className="bg-chart-4 rounded-b-[3px] w-full" style={{ height: `${d.casual}%` }} />
                <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-muted-foreground text-[9px] mt-[4px] text-center w-full">{d.station}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-[16px] items-center mt-[8px]">
            <div className="flex items-center gap-[4px]">
              <div className="size-[8px] rounded-sm bg-accent/80" />
              <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-muted-foreground text-[9px]">Member</p>
            </div>
            <div className="flex items-center gap-[4px]">
              <div className="size-[8px] rounded-sm bg-chart-4" />
              <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-muted-foreground text-[9px]">Casual</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExplanationWorkspaceView({ block, onWikiSave, onWikiDismiss }: { block: OutputBlock; onWikiSave?: (id: string) => void; onWikiDismiss?: (id: string) => void }) {
  const wikiReview = block.data?.wikiReview;
  const isWiki = !!wikiReview;
  const isPending = isWiki && wikiReview.status === "pending";

  return (
    <div className="flex-1 overflow-auto px-[16px] py-[8px]">
      <div className={`relative rounded-[var(--radius-card)] w-full overflow-hidden bg-card ${isWiki ? "border border-fyi/20" : "border border-border/50"}`}>
        {/* Toolbar */}
        <div className="bg-[rgba(249,250,251,0.5)] border-b border-border/30">
          <div className="flex items-center px-[12px] py-[8px] w-full gap-[8px]">
            <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[12px] flex-1">
              {block.title}
            </p>
            {isPending && onWikiSave && (
              <ToolbarBtn label="Save Wiki" primary onClick={() => onWikiSave(wikiReview.id)} />
            )}
            {isPending && onWikiDismiss && (
              <ToolbarBtn label="Dismiss" onClick={() => onWikiDismiss(wikiReview.id)} />
            )}
            {isWiki && wikiReview.status === "saved" && (
              <div className="bg-chart-5/10 flex h-[20px] items-center justify-center px-[6px] py-px rounded-[var(--radius-button)] shrink-0 gap-[4px]">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="var(--chart-5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <p className="font-['Inter',sans-serif] font-bold leading-[150%] text-chart-5 text-[9px] tracking-[0.3px] uppercase whitespace-nowrap">SAVED</p>
              </div>
            )}
            {isWiki && wikiReview.status === "dismissed" && (
              <div className="bg-muted flex h-[20px] items-center justify-center px-[6px] py-px rounded-[var(--radius-button)] shrink-0">
                <p className="font-['Inter',sans-serif] font-bold leading-[150%] text-secondary-foreground text-[9px] tracking-[0.3px] uppercase whitespace-nowrap">DISMISSED</p>
              </div>
            )}
            {!isWiki && <ToolbarBtn label="Copy" />}
            {!isWiki && <ToolbarBtn label="Regenerate" />}
            <ToolbarMoreMenu items={isWiki ? ["Copy", "Download TXT"] : ["Download TXT", "Share"]} />
          </div>
        </div>
        <div className="p-[16px]">
          <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[14px]">
            {block.preview || "The query joins trip records with station metadata to compute aggregated metrics. The GROUP BY clause partitions results by station, while CASE WHEN expressions split counts between member and casual rider types. The final ORDER BY sorts stations by total trip volume."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Dataset Profile workspace view ──────────────────────────── */

function DatasetWorkspaceView({ block }: { block: OutputBlock }) {
  const d = block.data?.profile;
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [semanticOpen, setSemanticOpen] = useState(true);
  const [columnsOpen, setColumnsOpen] = useState(true);
  const [wikiOpen, setWikiOpen] = useState(true);

  if (!d) return <div className="flex-1 flex items-center justify-center"><p className="font-['Inter',sans-serif] font-normal leading-[150%] text-muted-foreground text-[14px]">No profile data</p></div>;

  const SectionHeader = ({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) => (
    <button type="button" className="flex gap-[4px] items-center py-[8px] w-full cursor-pointer" onClick={onToggle}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: open ? "none" : "rotate(-90deg)", transition: "transform 150ms ease" }}>
        <path d="M7 10L12 15L17 10" stroke="var(--secondary-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[16px] flex-1 text-left">{label}</p>
    </button>
  );

  const MetaRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
    <div className="flex items-center justify-between py-[4px]">
      <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[14px]">{label}</p>
      <p className={`font-['Inter',sans-serif] font-normal leading-[150%] text-[14px] ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-[16px] py-[8px]">
      <div className="relative rounded-[var(--radius-card)] w-full flex-1 min-h-0 border border-border/50 overflow-hidden flex flex-col bg-card">
        {/* Toolbar */}
        <div className="bg-[rgba(249,250,251,0.5)] border-b border-border/30 shrink-0">
          <div className="flex items-center px-[12px] py-[8px] w-full gap-[8px]">
            {/* Dataset icon */}
            <div className="shrink-0 size-[24px] rounded-[4px] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="12" height="12" rx="2" stroke="var(--secondary-foreground)" strokeWidth="1.2" />
                <line x1="1" y1="5" x2="13" y2="5" stroke="var(--secondary-foreground)" strokeWidth="1.2" />
                <line x1="5" y1="5" x2="5" y2="13" stroke="var(--secondary-foreground)" strokeWidth="1.2" />
                <line x1="9" y1="5" x2="9" y2="13" stroke="var(--secondary-foreground)" strokeWidth="1.2" />
              </svg>
            </div>
            <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[16px] flex-1">{block.title}</p>
            <ToolbarBtn label="Query" primary />
            <ToolbarBtn label="Edit" />
            <ToolbarMoreMenu items={["Add to Chat", "View Lineage", "Show Sample Data", "Copy Path"]} />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-[8px] px-[16px] py-[8px]">

            {/* ── Overview ──────────────────────────── */}
            <SectionHeader label="Overview" open={overviewOpen} onToggle={() => setOverviewOpen(!overviewOpen)} />
            {overviewOpen && (
              <div className="flex flex-col gap-[8px] pb-[8px]">
                <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[14px]">{d.path}</p>
                {/* Labels */}
                <div className="flex gap-[8px] items-center flex-wrap">
                  {d.labels?.map((label: string) => (
                    <div key={label} className="bg-primary/10 flex h-[24px] items-center justify-center px-[8px] rounded-[var(--radius-button)] shrink-0 relative">
                      <div aria-hidden="true" className="absolute border border-primary/20 border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
                      <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[12px] whitespace-nowrap">{label}</p>
                    </div>
                  ))}
                </div>
                {/* Meta rows */}
                <div className="flex flex-col border-t border-muted pt-[8px]">
                  <MetaRow label="Jobs (last 30 days)" value={String(d.jobs30d)} accent />
                  <MetaRow label="Descendants" value={String(d.descendants)} />
                  <MetaRow label="Created" value={d.created} />
                  <MetaRow label="Owner" value={d.owner} />
                  <MetaRow label="Last updated" value={d.updated} />
                </div>

              </div>
            )}

            <div className="border-t border-muted" />

            {/* ── Semantic ──────────────────────────── */}
            <SectionHeader label="Semantic" open={semanticOpen} onToggle={() => setSemanticOpen(!semanticOpen)} />
            {semanticOpen && (
              <div className="flex flex-col gap-[12px] pb-[8px]">
                <div>
                  <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px] mb-[4px]">Entity</p>
                  <div className="inline-flex h-[28px] items-center px-[8px] rounded-[var(--radius-button)] border border-accent/40 bg-accent/5">
                    <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-accent text-[14px]">{d.entity}</p>
                  </div>
                </div>
                <div>
                  <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px] mb-[4px]">Metrics</p>
                  <div className="flex gap-[8px] items-center flex-wrap">
                    {d.metrics?.map((m: string) => (
                      <div key={m} className="inline-flex h-[28px] items-center px-[8px] rounded-[var(--radius-button)] border border-accent/40 bg-accent/5">
                        <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-accent text-[14px]">{m}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-muted" />

            {/* ── Columns ───────────────────────────── */}
            <SectionHeader label={`Columns (${d.columns?.length || 0})`} open={columnsOpen} onToggle={() => setColumnsOpen(!columnsOpen)} />
            {columnsOpen && (
              <div className="pb-[8px]">
                {/* Column header */}
                <div className="flex items-center py-[6px] border-b border-muted">
                  <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[12px] flex-1">Column name</p>
                  <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[12px] w-[140px] text-right">Attribute</p>
                </div>
                {/* Column rows */}
                {d.columns?.map((col: { name: string; type: string; attr: string }) => (
                  <div key={col.name} className="flex items-center py-[6px] border-b border-muted/50 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-[8px] flex-1 min-w-0">
                      <span className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px] shrink-0 w-[24px] text-center">{col.type}</span>
                      <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">{col.name}</p>
                    </div>
                    <div className="flex items-center gap-[4px] w-[140px] justify-end">
                      <span className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px] shrink-0">{col.type}</span>
                      <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">{col.attr}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-muted" />

            {/* ── Wiki ──────────────────────────────── */}
            <SectionHeader label="Wiki" open={wikiOpen} onToggle={() => setWikiOpen(!wikiOpen)} />
            {wikiOpen && (
              <div className="flex flex-col gap-[16px] pb-[16px]">
                <div>
                  <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[14px] mb-[4px]">Volume</p>
                  <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[14px]">{d.wikiVolume}</p>
                </div>
                <div>
                  <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[14px] mb-[4px]">Data Quality</p>
                  <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[14px]">{d.wikiQuality}</p>
                </div>
                <div>
                  <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[14px] mb-[4px]">Description</p>
                  <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[14px]">{d.wikiDescription}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

/* ── View Profile workspace view ─────────────────────────────── */

function ViewWorkspaceView({ block }: { block: OutputBlock }) {
  const d = block.data?.profile;
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [columnsOpen, setColumnsOpen] = useState(true);
  const [wikiOpen, setWikiOpen] = useState(true);

  if (!d) return <div className="flex-1 flex items-center justify-center"><p className="font-['Inter',sans-serif] font-normal leading-[150%] text-muted-foreground text-[14px]">No profile data</p></div>;

  const SectionHeader = ({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) => (
    <button type="button" className="flex gap-[4px] items-center py-[8px] w-full cursor-pointer" onClick={onToggle}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: open ? "none" : "rotate(-90deg)", transition: "transform 150ms ease" }}>
        <path d="M7 10L12 15L17 10" stroke="var(--secondary-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[16px] flex-1 text-left">{label}</p>
    </button>
  );

  const MetaRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
    <div className="flex items-center justify-between py-[4px]">
      <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[14px]">{label}</p>
      <p className={`font-['Inter',sans-serif] font-normal leading-[150%] text-[14px] ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-[16px] py-[8px]">
      <div className="relative rounded-[var(--radius-card)] w-full flex-1 min-h-0 border border-accent/20 overflow-hidden flex flex-col bg-card">
        {/* Toolbar */}
        <div className="bg-[rgba(249,250,251,0.5)] border-b border-border/30 shrink-0">
          <div className="flex items-center px-[12px] py-[8px] w-full gap-[8px]">
            <div className="shrink-0 size-[24px] rounded-[4px] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="12" height="12" rx="2" stroke="var(--accent)" strokeWidth="1.2" />
                <line x1="1" y1="5" x2="13" y2="5" stroke="var(--accent)" strokeWidth="1.2" />
                <line x1="5" y1="5" x2="5" y2="13" stroke="var(--accent)" strokeWidth="1.2" />
                <line x1="9" y1="5" x2="9" y2="13" stroke="var(--accent)" strokeWidth="1.2" />
              </svg>
            </div>
            <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[16px] flex-1">{block.title}</p>
            <ToolbarBtn label="Query" primary />
            <ToolbarBtn label="Edit" />
            <ToolbarMoreMenu items={["Go to dataset", "View Lineage", "Show Sample Data", "Copy Path"]} />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-[8px] px-[16px] py-[8px]">

            {/* ── Overview ──────────────────────────── */}
            <SectionHeader label="Overview" open={overviewOpen} onToggle={() => setOverviewOpen(!overviewOpen)} />
            {overviewOpen && (
              <div className="flex flex-col gap-[8px] pb-[8px]">
                <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[14px]">{d.path}</p>
                <div className="flex gap-[8px] items-center flex-wrap">
                  {d.labels?.map((label: string) => (
                    <div key={label} className="bg-accent/10 flex h-[24px] items-center justify-center px-[8px] rounded-[var(--radius-button)] shrink-0 relative">
                      <div aria-hidden="true" className="absolute border border-accent/20 border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
                      <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-accent text-[12px] whitespace-nowrap">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col border-t border-muted pt-[8px]">
                  <MetaRow label="Created" value={d.created} />
                  <MetaRow label="Owner" value={d.owner} />
                  <MetaRow label="Last updated" value={d.updated} />
                  <MetaRow label="Volume" value={d.volume} />
                </div>
              </div>
            )}

            <div className="border-t border-muted" />

            {/* ── Columns ───────────────────────────── */}
            <SectionHeader label={`Columns (${d.columns?.length || 0})`} open={columnsOpen} onToggle={() => setColumnsOpen(!columnsOpen)} />
            {columnsOpen && (
              <div className="pb-[8px]">
                <div className="flex items-center py-[6px] border-b border-muted">
                  <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[12px] flex-1">Column name</p>
                  <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[12px] w-[140px] text-right">Attribute</p>
                </div>
                {d.columns?.map((col: { name: string; type: string; attr: string }) => (
                  <div key={col.name} className="flex items-center py-[6px] border-b border-muted/50 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-[8px] flex-1 min-w-0">
                      <span className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px] shrink-0 w-[24px] text-center">{col.type}</span>
                      <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">{col.name}</p>
                    </div>
                    <div className="flex items-center gap-[4px] w-[140px] justify-end">
                      <span className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px] shrink-0">{col.type}</span>
                      <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">{col.attr}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-muted" />

            {/* ── Wiki ──────────────────────────────── */}
            <SectionHeader label="Wiki" open={wikiOpen} onToggle={() => setWikiOpen(!wikiOpen)} />
            {wikiOpen && (
              <div className="flex flex-col gap-[16px] pb-[16px]">
                <div>
                  <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[14px] mb-[4px]">Volume</p>
                  <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[14px]">{d.wikiVolume}</p>
                </div>
                <div>
                  <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[14px] mb-[4px]">Data Quality</p>
                  <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[14px]">{d.wikiQuality}</p>
                </div>
                <div>
                  <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[14px] mb-[4px]">Description</p>
                  <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[14px]">{d.wikiDescription}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Right sidebar ───────────────────────────────────────────── */

interface AgentStep {
  id: string;
  label: string;
  status: "done" | "running" | "pending";
  detail?: string;
}

function getPlanSteps(bronzeComplete: boolean): AgentStep[] {
  return [
    { id: "s1", label: "Analyze source tables", status: "done", detail: "4 source tables scanned" },
    { id: "s2", label: "Design Bronze schema", status: "done", detail: "4 raw views mapped" },
    { id: "s3", label: "Create Bronze views (DDL)", status: bronzeComplete ? "done" : "running", detail: bronzeComplete ? "4 views created" : "Awaiting approval..." },
    { id: "s4", label: "Design Silver transforms", status: bronzeComplete ? "running" : "pending" },
    { id: "s5", label: "Create Gold: customer_360", status: "pending" },
    { id: "s6", label: "Validate & profile results", status: "pending" },
  ];
}

const MOCK_CONTEXT_ITEMS = [
  { id: "c1", path: "crm.raw_customers", detail: "2.4M rows", type: "table" as const },
  { id: "c2", path: "crm.raw_orders", detail: "18.7M rows", type: "table" as const },
  { id: "c3", path: "crm.raw_interactions", detail: "45.2M rows", type: "table" as const },
  { id: "c4", path: "marketing.campaigns", detail: "124K rows", type: "table" as const },
];

function RightSectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="h-[32px] shrink-0 flex items-center gap-[6px] px-[12px]">
      <p
        className="flex-1 text-secondary-foreground tracking-[0.5px] uppercase"
        style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}
      >
        {label}
      </p>
      {count !== undefined && (
        <div className="bg-muted h-[16px] flex items-center justify-center px-[5px] rounded-[3px]">
          <p className="text-muted-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: "var(--font-weight-normal)", lineHeight: "1" }}>
            {count}
          </p>
        </div>
      )}
    </div>
  );
}

function PlanSection({ bronzeComplete }: { bronzeComplete: boolean }) {
  const steps = getPlanSteps(bronzeComplete);
  return (
    <div className="shrink-0 border-b border-border/40">
      <RightSectionHeader label="Plan" count={steps.length} />
      <div className="flex flex-col pb-[6px]">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-[8px] px-[12px] py-[4px]">
            {/* Status icon */}
            <div className="shrink-0 mt-[3px]">
              {step.status === "done" && (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="6" fill="rgba(90,189,74,0.12)" stroke="rgba(90,189,74,0.6)" strokeWidth="0.75" />
                  <path d="M4 6.5L5.8 8.3L9 5" stroke="var(--chart-5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {step.status === "running" && (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="16 18" strokeLinecap="round" />
                </svg>
              )}
              {step.status === "pending" && (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="6" stroke="var(--border)" strokeWidth="0.75" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={step.status === "pending" ? "text-muted-foreground" : "text-foreground"}
                style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}
              >
                {step.label}
              </p>
              {step.detail && (
                <p
                  className="text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}
                >
                  {step.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutputsSection({
  blocks,
  activeBlockId,
  onSelect,
}: {
  blocks: OutputBlock[];
  activeBlockId: string | null;
  onSelect: (block: OutputBlock) => void;
}) {
  const sorted = [...blocks].reverse();
  return (
    <div className="flex-1 min-h-0 flex flex-col border-b border-border/40">
      <RightSectionHeader label="Outputs" count={blocks.length} />
      <div className="flex-1 overflow-y-auto pb-[4px]">
        {sorted.length === 0 ? (
          <p className="px-[12px] py-[6px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}>
            No outputs yet
          </p>
        ) : sorted.map((block) => {
          const isActive = block.id === activeBlockId;
          return (
            <button
              key={block.id}
              type="button"
              className={`w-full flex items-center gap-[8px] px-[12px] py-[6px] cursor-pointer select-none transition-colors text-left ${isActive ? "bg-primary/10" : "hover:bg-background-hover"}`}
              onClick={() => onSelect(block)}
            >
              <BlockTypeBadge type={block.type} />
              <p
                className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--text-sm)",
                  fontWeight: isActive ? "var(--font-weight-semibold)" : "var(--font-weight-normal)",
                  lineHeight: "1.5",
                  color: isActive ? "var(--foreground)" : "var(--secondary-foreground)",
                }}
              >
                {block.title}
              </p>
              {isActive && (
                <div className="shrink-0 size-[6px] rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ContextSection() {
  return (
    <div className="shrink-0">
      <RightSectionHeader label="Context" count={MOCK_CONTEXT_ITEMS.length} />
      <div className="flex flex-col pb-[8px]">
        {MOCK_CONTEXT_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center gap-[8px] px-[12px] py-[5px] hover:bg-background-hover transition-colors cursor-default">
            {(item.type as string) === "view" ? <IconEntityView size={16} /> : <IconEntityTable size={16} />}
            <div className="flex-1 min-w-0">
              <p
                className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}
              >
                {item.path}
              </p>
              <p
                className="text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}
              >
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main WorkspacePanel ─────────────────────────────────────── */

export function WorkspacePanel({ activeBlock, blockHistory, onClose, onSelectBlock, onSaveAsView, chatActions, bronzeComplete = false }: WorkspacePanelProps) {
  return (
    <div className="flex flex-col h-full relative bg-card">
      {/* Left border divider */}
      <div aria-hidden="true" className="absolute border-border/50 border-l border-solid inset-0 pointer-events-none" />

      {/* Header */}
      <div className="shrink-0 w-full relative h-[52px] z-[1]">
        <div aria-hidden="true" className="absolute border-muted border-b border-solid left-0 right-0 bottom-0 pointer-events-none" style={{ height: "1px" }} />
        <div className="flex items-center gap-[8px] px-[16px] h-full w-full">
          <div className="overflow-hidden relative shrink-0 size-[20px]">
            <div className="absolute inset-[12.5%_8.34%_8.33%_8.33%]">
              <svg className="absolute block size-full" fill="none" viewBox="0 0 16.6657 15.8337">
                <path d={PATH_MONITOR} fill="var(--secondary-foreground)" />
              </svg>
            </div>
          </div>
          <p
            className="flex-1 text-foreground whitespace-nowrap"
            style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", fontWeight: "var(--font-weight-semibold)", lineHeight: "1.5" }}
          >
            Workspace
          </p>
          <div className="flex gap-[8px] items-center">
            {/* Close */}
            <button type="button" className="relative shrink-0 size-[24px] cursor-pointer hover:opacity-70 transition-opacity" onClick={onClose}>
              <div className="absolute inset-1/4">
                <IconClose size={12} style={{ color: "var(--secondary-foreground)" }} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content — left/right split */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left: active block view ── */}
        <div className="flex-1 min-w-[160px] overflow-hidden flex flex-col">
          {activeBlock ? (
            activeBlock.type === "sql" ? (
              <SqlWorkspaceView block={activeBlock} onSaveAsView={onSaveAsView} onRunQuery={chatActions?.runQuery} onExplainQuery={chatActions?.explainQuery} />
            ) : activeBlock.type === "table" ? (
              <TableWorkspaceView block={activeBlock} onSaveAsView={onSaveAsView} />
            ) : activeBlock.type === "chart" ? (
              <ChartWorkspaceView block={activeBlock} onSaveAsView={onSaveAsView} />
            ) : activeBlock.type === "explanation" ? (
              <ExplanationWorkspaceView block={activeBlock} onWikiSave={chatActions?.wikiSave} onWikiDismiss={chatActions?.wikiDismiss} />
            ) : activeBlock.type === "dataset" ? (
              <DatasetWorkspaceView block={activeBlock} />
            ) : activeBlock.type === "view" ? (
              <ViewWorkspaceView block={activeBlock} />
            ) : (
              <div className="flex-1 overflow-auto p-[16px]">
                <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[14px]">{activeBlock.preview}</p>
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-muted-foreground text-[14px]">Click a block to view it here</p>
            </div>
          )}
        </div>

        {/* ── Right: plan / outputs / context ── */}
        <div className="w-[180px] shrink-0 flex flex-col overflow-hidden border-l border-border/40 bg-background/60">
          <PlanSection bronzeComplete={bronzeComplete} />
          <OutputsSection
            blocks={blockHistory}
            activeBlockId={activeBlock?.id || null}
            onSelect={onSelectBlock}
          />
          <ContextSection />
        </div>

      </div>
    </div>
  );
}