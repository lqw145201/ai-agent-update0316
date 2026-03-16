// COMPONENT — Inline collapsible tool calls display for AI agent processing steps
// Portable version: no Figma svgPaths imports — uses inline paths for small non-standard viewBoxes
// Collapsed = single 12px muted line; Expanded = lightweight timeline with step details

import { useState, useCallback } from "react";
import type { ToolCallGroup, ToolCallStatus } from "../hooks/useChat";
import { IconCopy } from "./icons/IconCopy";

// COPY
import { TOOL_CALLS } from "../constants/strings";

// Inline path data for small non-standard viewBox icons used in tool call timeline

// Check circle for completed step (viewBox: 0 0 13.334 13.334)
const PATH_STEP_COMPLETED = "M6.66699 0C10.3489 9.66338e-08 13.334 2.98509 13.334 6.66699C13.334 10.3489 10.3489 13.334 6.66699 13.334C2.98509 13.334 9.6637e-08 10.3489 0 6.66699C0 2.98509 2.98509 0 6.66699 0ZM9.79688 3.94336C9.71296 3.94484 9.6294 3.96291 9.55273 3.99707C9.47635 4.03117 9.40765 4.08044 9.35059 4.1416L5.625 7.86719L3.9834 6.22559C3.865 6.11526 3.70868 6.05484 3.54688 6.05762C3.38496 6.06047 3.22975 6.12572 3.11523 6.24023C3.00075 6.35474 2.93547 6.50997 2.93262 6.67188C2.92986 6.83365 2.99028 6.99002 3.10059 7.1084L5.18359 9.19238C5.30069 9.30922 5.45959 9.37491 5.625 9.375C5.79061 9.375 5.9502 9.3094 6.06738 9.19238L10.2334 5.02539C10.2948 4.96817 10.3447 4.89893 10.3789 4.82227C10.413 4.74569 10.4311 4.6629 10.4326 4.5791C10.4341 4.49518 10.4182 4.41181 10.3867 4.33398C10.3553 4.25628 10.3092 4.18527 10.25 4.12598C10.1907 4.06668 10.1197 4.01971 10.042 3.98828C9.96427 3.95689 9.88069 3.94192 9.79688 3.94336Z";

// Hex/warning for failed step (viewBox: 0 0 11.666 13.4212)
const PATH_STEP_FAILED = "M5.3252 0.13833C5.63837 -0.04611 6.02765 -0.04611 6.34082 0.13833L11.1738 2.98501C11.4789 3.16471 11.6659 3.49228 11.666 3.84634V9.57388C11.666 9.92806 11.479 10.2564 11.1738 10.4362L6.34082 13.2829C6.02765 13.4673 5.63837 13.4673 5.3252 13.2829L0.492188 10.4362C0.187003 10.2564 0 9.92806 0 9.57388V3.84634C8.97204e-05 3.49228 0.187106 3.16471 0.492188 2.98501L5.3252 0.13833ZM5.83301 9.00161C5.48797 9.00161 5.20823 9.28162 5.20801 9.62661C5.20801 9.97179 5.48783 10.2516 5.83301 10.2516C6.17819 10.2516 6.45801 9.97179 6.45801 9.62661C6.45779 9.28162 6.17805 9.00161 5.83301 9.00161ZM5.83301 3.37661C5.48797 3.37661 5.20823 3.65662 5.20801 4.00161V7.3356C5.20812 7.68068 5.4879 7.9606 5.83301 7.9606C6.17812 7.9606 6.45789 7.68068 6.45801 7.3356V4.00161C6.45779 3.65662 6.17805 3.37661 5.83301 3.37661Z";

// Caret chevron for expand toggle (viewBox: 0 0 10.4397 5.96941)
const PATH_CHEVRON = "M9.6904 5.96907C9.88916 5.96907 10.0798 5.89018 10.2204 5.74973C10.3609 5.6091 10.4397 5.41848 10.4397 5.21973C10.4397 5.02098 10.3609 4.83036 10.2204 4.68973L5.75 0.219338C5.60937 0.0788879 5.41875 0 5.22 0C5.02124 0 4.83062 0.0788879 4.69 0.219338L0.238707 4.6707C0.16502 4.73936 0.105918 4.82216 0.0649265 4.91416C0.0239347 5.00616 0.00189341 5.10547 0.000116715 5.20617C-0.00165998 5.30688 0.0168637 5.40691 0.0545849 5.5003C0.092306 5.59368 0.148451 5.67852 0.21967 5.74974C0.290889 5.82095 0.375723 5.8771 0.469111 5.91482C0.562499 5.95254 0.662527 5.97107 0.76323 5.96929C0.863932 5.96751 0.963247 5.94547 1.05525 5.90448C1.14725 5.86349 1.23005 5.80438 1.29871 5.7307L5.22 1.80934L9.1604 5.74973C9.30103 5.89018 9.49165 5.96907 9.6904 5.96907Z";

/* ── Status indicators ──────────────────────────────────────── */

// LAYOUT — Tiny inline status dot/icon (14×14 for completed/failed, 14×14 spinner for running)
function StepDot({ status }: { status: ToolCallStatus }) {
  if (status === "completed") {
    return (
      <svg className="shrink-0 size-[14px]" viewBox="0 0 13.334 13.334" fill="none">
        <path d={PATH_STEP_COMPLETED} fill="var(--chart-5)" />
      </svg>
    );
  }
  if (status === "failed") {
    return (
      <svg className="shrink-0 size-[14px]" viewBox="0 0 11.666 13.4212" fill="none">
        <path d={PATH_STEP_FAILED} fill="var(--destructive)" />
      </svg>
    );
  }
  if (status === "running") {
    return (
      <div className="shrink-0 size-[14px] flex items-center justify-center">
        <div className="size-[10px] rounded-full border-[1.5px] border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  // pending
  return (
    <div className="shrink-0 size-[14px] flex items-center justify-center">
      <div className="size-[6px] rounded-full bg-muted-foreground/40" />
    </div>
  );
}

// LAYOUT — Small inline chevron (8×5), animated rotation on expand
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className="shrink-0"
      width="8"
      height="5"
      viewBox="0 0 10.4397 5.96941"
      fill="none"
      style={{
        transform: open ? "rotate(180deg)" : "none",
        transition: "transform 150ms ease",
      }}
    >
      <path d={PATH_CHEVRON} fill="var(--muted-foreground)" />
    </svg>
  );
}

// INTERACTION — Copy button (small, for arguments block)
function CopyBtn({ text }: { text: string }) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
  }, [text]);

  return (
    <button
      type="button"
      className="shrink-0 size-[16px] cursor-pointer flex items-center justify-center opacity-40 hover:opacity-80 transition-opacity"
      onClick={(e) => { e.stopPropagation(); handleCopy(); }}
      aria-label="Copy"
    >
      <IconCopy size={12} style={{ color: "var(--secondary-foreground)" }} />
    </button>
  );
}

// LAYOUT — Format duration
function fmtDur(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/* ── Step row (expandable) ──────────────────────────────────── */

// LAYOUT — Single step in the timeline
function StepRow({ step }: { step: import("../hooks/useChat").ToolCallStep }) {
  // STATE
  const [open, setOpen] = useState(false);
  const hasDetails = !!(step.description || step.arguments || step.result);

  return (
    <div className="flex flex-col">
      {/* INTERACTION — Step title row */}
      <button
        type="button"
        className={`flex items-center gap-[8px] w-full py-[4px] ${hasDetails ? "cursor-pointer" : "cursor-default"}`}
        onClick={() => hasDetails && setOpen(!open)}
      >
        <StepDot status={step.status} />
        <span
          className="flex-1 text-left text-secondary-foreground truncate"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-normal)",
            lineHeight: "1.5",
          }}
        >
          {step.title}
        </span>
        {step.durationMs != null && (
          <span
            className="text-muted-foreground shrink-0"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-normal)",
              lineHeight: "1.5",
            }}
          >
            {fmtDur(step.durationMs)}
          </span>
        )}
        {hasDetails && <Chevron open={open} />}
      </button>

      {/* LAYOUT — Expanded details (description, arguments, result) */}
      {open && (
        <div className="flex flex-col gap-[4px] pl-[22px] pb-[4px]">
          {/* Description */}
          {step.description && (
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-normal)",
                lineHeight: "1.5",
              }}
            >
              {step.description}
            </p>
          )}

          {/* Arguments code block */}
          {step.arguments && (
            <div className="bg-background rounded-[var(--radius-button)] overflow-hidden mt-[2px]">
              <div className="flex flex-col gap-[4px] px-[8px] py-[6px]">
                <div className="flex items-center justify-between">
                  <span
                    className="text-muted-foreground"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-sm)",
                      fontWeight: "var(--font-weight-normal)",
                      lineHeight: "1.5",
                    }}
                  >
                    {TOOL_CALLS.arguments}
                  </span>
                  <CopyBtn text={step.arguments} />
                </div>
                <pre
                  className="text-fyi whitespace-pre-wrap break-all"
                  style={{
                    fontFamily: "var(--font-code)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-normal)",
                    lineHeight: "1.5",
                  }}
                >
                  {step.arguments}
                </pre>
              </div>
            </div>
          )}

          {/* Result */}
          {step.result && (
            <p
              className="text-secondary-foreground"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-normal)",
                lineHeight: "1.5",
              }}
            >
              {step.result}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */

// LAYOUT — Props
interface ToolCallsBlockProps {
  toolCalls: ToolCallGroup;
}

/** Inline tool calls annotation — collapsed by default, expand to see step timeline */
export function ToolCallsBlock({ toolCalls }: ToolCallsBlockProps) {
  // STATE
  const steps = toolCalls.steps;
  const isRunning = steps.some((s) => s.status === "running");
  const [expanded, setExpanded] = useState(isRunning);

  // COPY — Summary text
  const runningStep = steps.find((s) => s.status === "running");
  const summaryText = isRunning
    ? runningStep?.title ?? TOOL_CALLS.running
    : TOOL_CALLS.usedTools(steps.length);

  return (
    <div className="w-full">
      {/* INTERACTION — Toggle row: inline muted annotation */}
      <button
        type="button"
        className="flex items-center gap-[6px] py-[2px] cursor-pointer group w-full"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status indicator */}
        {isRunning ? (
          <div className="shrink-0 size-[12px] flex items-center justify-center">
            <div className="size-[10px] rounded-full border-[1.5px] border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <svg className="shrink-0 size-[12px]" viewBox="0 0 13.334 13.334" fill="none">
            <path d={PATH_STEP_COMPLETED} fill="var(--chart-5)" />
          </svg>
        )}

        {/* Summary text */}
        <span
          className="text-muted-foreground group-hover:text-secondary-foreground transition-colors"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-normal)",
            lineHeight: "1.5",
          }}
        >
          {summaryText}
        </span>

        <Chevron open={expanded} />
      </button>

      {/* LAYOUT — Expanded timeline */}
      {expanded && (
        <div className="flex flex-col pl-[4px] pt-[2px] border-l border-muted ml-[5px]">
          {steps.map((step) => (
            <StepRow key={step.id} step={step} />
          ))}
        </div>
      )}
    </div>
  );
}
