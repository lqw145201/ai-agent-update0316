// COMPONENT — Chat input with gradient border (Figma Form2 design)
// Portable version: no Figma svgPaths imports — uses IconSend from ./icons/IconSend
// Features: context chips, auto-resizing textarea, gradient send button, add-data dropdown

import { useState, useRef, useEffect } from "react";
import type { ContextChip } from "../hooks/useChat";
import { IconSend } from "./icons/IconSend";
import { CHAT_PANEL } from "../constants/strings";

// LAYOUT — Props
interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onInput: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  contextChips: ContextChip[];
  onRemoveChip: (chipId: string) => void;
  variant?: "default" | "landing";
  onUploadFile?: (file: File) => void;
  onConnectSource?: () => void;
}

// LAYOUT — Component
// Border: gradient stroke from Figma Form2 — uses var(--ring) with rgba(147,195,75) glow shadows
export function ChatInput({
  inputValue,
  onInputChange,
  onSend,
  onKeyDown,
  onInput,
  textareaRef,
  contextChips,
  onRemoveChip,
  variant = "default",
  onUploadFile,
  onConnectSource,
}: ChatInputProps) {
  const isLanding = variant === "landing";
  const showAddBtn = onUploadFile || onConnectSource;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const placeholder = contextChips.length > 0 ? CHAT_PANEL.inputPlaceholderWithChips : CHAT_PANEL.inputPlaceholder;

  return (
    // LAYOUT — Outer wrapper with bottom padding
    <div className="shrink-0 w-full pb-[16px] px-[16px]">
      <div
        className="bg-card relative rounded-[var(--radius-card)] w-full"
        style={{ padding: isLanding ? "16px 20px" : "12px 16px" }}
      >
        {/* LAYOUT — Border overlay: gradient stroke from Figma Form2 */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-[var(--radius-card)] z-0"
          style={{
            border: "1px solid var(--ring)",
            borderRadius: "var(--radius-card)",
            boxShadow:
              "109px 82px 38px 0px rgba(147,195,75,0), 70px 52px 35px 0px rgba(147,195,75,0.01), 39px 29px 29px 0px rgba(147,195,75,0.03), 17px 13px 22px 0px rgba(147,195,75,0.06), 4px 3px 12px 0px rgba(147,195,75,0.07)",
          }}
        />

        <div className="flex flex-col gap-[4px] w-full relative z-10">
          {/* INTERACTION — Context chips (data source references) */}
          {contextChips.length > 0 && (
            <div className="flex flex-wrap gap-[4px] max-w-full overflow-hidden">
              {contextChips.map((chip) => (
                <div
                  key={chip.id}
                  className="bg-muted flex items-center px-[4px] rounded-[var(--radius-button)] h-[24px] gap-[4px] max-w-full min-w-0"
                >
                  <p
                    className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap min-w-0"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-base)",
                      fontWeight: "var(--font-weight-normal)",
                      lineHeight: "1.5",
                      fontFeatureSettings: "'cv08', 'lnum', 'tnum'",
                    }}
                  >
                    {chip.path}
                  </p>
                  <button
                    type="button"
                    className="shrink-0 size-[14px] flex items-center justify-center cursor-pointer hover:opacity-60 transition-opacity"
                    onClick={() => onRemoveChip(chip.id)}
                    aria-label={`Remove ${chip.path}`}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M1 1L7 7M7 1L1 7"
                        stroke="var(--secondary-foreground)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* LAYOUT — Textarea (full width) */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              onInputChange(e.target.value);
              onInput();
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={isLanding ? 3 : 2}
            className={`chat-input-textarea w-full bg-transparent outline-none resize-none max-h-[120px] ${isLanding ? "min-h-[64px]" : "min-h-[42px]"}`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-base)",
              fontWeight: "var(--font-weight-normal)",
              lineHeight: "1.5",
              color: "var(--foreground)",
            }}
          />

          {/* LAYOUT — Bottom action bar: + icon (left) | Send (right) */}
          <div className="flex items-center pt-[6px]">
            {showAddBtn && (
              <div className="relative" ref={dropdownRef}>
                {/* + Add data icon button — accent tint when dropdown open */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-label="Add data"
                  className={`shrink-0 size-[32px] flex items-center justify-center rounded-[var(--radius-button)] transition-colors ${
                    dropdownOpen
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>

                {/* Dropdown menu — opens above the button, no border */}
                {dropdownOpen && (
                  <div
                    className="absolute bottom-[calc(100%+6px)] left-0 z-50 rounded-[var(--radius-card)] bg-[var(--card)] overflow-hidden"
                    style={{
                      boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12), 0 1px 6px 0 rgba(0,0,0,0.08)",
                      minWidth: "190px",
                    }}
                  >
                    {/* Upload file */}
                    <button
                      type="button"
                      onClick={() => { setDropdownOpen(false); fileInputRef.current?.click(); }}
                      className="w-full flex items-center gap-[10px] px-[14px] py-[10px] text-left hover:bg-[var(--muted)] transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 text-[var(--foreground)]">
                        <path d="M7.5 10V2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M4.5 5L7.5 2L10.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 11.5V13H13V11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-[13px] text-[var(--foreground)]" style={{ fontFamily: "var(--font-sans)" }}>
                        Upload file
                      </span>
                    </button>

                    {/* Connect data source */}
                    <button
                      type="button"
                      onClick={() => { setDropdownOpen(false); onConnectSource?.(); }}
                      className="w-full flex items-center gap-[10px] px-[14px] py-[10px] text-left hover:bg-[var(--muted)] transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 text-[var(--foreground)]">
                        <circle cx="3" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                        <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.3" />
                        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M5 7.5H8M10 3.5L8 7M10 11.5L8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                      <span className="text-[13px] text-[var(--foreground)]" style={{ fontFamily: "var(--font-sans)" }}>
                        Connect data source
                      </span>
                    </button>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.parquet"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadFile?.(f);
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            {/* INTERACTION — Send button: gradient icon from IconSend */}
            <button
              type="button"
              className="ml-auto shrink-0 size-[32px] cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
              onClick={onSend}
              aria-label="Send message"
            >
              <IconSend size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Placeholder color override */}
      <style>{`
        .chat-input-textarea::placeholder {
          color: var(--muted-foreground);
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
