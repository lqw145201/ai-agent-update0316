// COMPONENT — Clarifying questions panel (floating above chat input via portal)
// One question per step with < N of Total > navigation.
// Numbered option rows with separators; pencil "Something else" as last option.

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ClarifyingQuestionData } from "../hooks/useChat";

interface ClarifyingQuestionsProps {
  data: ClarifyingQuestionData;
  onSubmit: (answers: Record<string, string>) => void;
  onSkip: () => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLDivElement | null>;
}

export function ClarifyingQuestions({ data, onSubmit, onSkip, onClose, anchorRef }: ClarifyingQuestionsProps) {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});
  const [pos, setPos] = useState<{ bottom: number; left: number; right: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = data.questions.length;
  const current = data.questions[step];
  const isLast = step === total - 1;

  const selectedValue = selections[current.id];
  const customText = customTexts[current.id] ?? "";
  const isCustomSelected = selectedValue === "__custom__";
  const canAdvance = !!selectedValue || !!customText.trim();

  // Compute portal position from anchor ref
  useEffect(() => {
    const update = () => {
      if (!anchorRef?.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left + 16,
        right: window.innerWidth - rect.right + 16,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [anchorRef]);

  // Focus free-text input when custom is selected
  useEffect(() => {
    if (isCustomSelected) inputRef.current?.focus();
  }, [isCustomSelected, step]);

  const selectOption = (qId: string, opt: string) => {
    setSelections((prev) => ({ ...prev, [qId]: opt }));
    setCustomTexts((prev) => ({ ...prev, [qId]: "" }));
  };

  const handleCustomFocus = (qId: string) => {
    setSelections((prev) => ({ ...prev, [qId]: "__custom__" }));
  };

  const handleCustomChange = (qId: string, text: string) => {
    setCustomTexts((prev) => ({ ...prev, [qId]: text }));
    setSelections((prev) => ({ ...prev, [qId]: text ? "__custom__" : "" }));
  };

  const handleNext = () => {
    if (isLast) {
      const answers: Record<string, string> = {};
      for (const q of data.questions) {
        const sel = selections[q.id];
        answers[q.id] = sel === "__custom__" ? (customTexts[q.id] ?? "") : (sel ?? "");
      }
      onSubmit(answers);
    } else {
      setStep((s) => s + 1);
    }
  };

  const panel = (
    <div
      className="rounded-[var(--radius-card)] bg-[var(--card)] overflow-hidden"
      style={{
        boxShadow: "0 8px 24px 0 rgba(0,0,0,0.12), 0 2px 8px 0 rgba(0,0,0,0.08)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-[20px] pt-[18px] pb-[14px]">
        <p
          className="text-[15px] font-semibold text-[var(--foreground)] leading-[1.3] flex-1 pr-[16px]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {current.label}
        </p>

        <div className="flex items-center gap-[8px] shrink-0">
          {/* < N of Total > navigation */}
          <div className="flex items-center gap-[4px]">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="size-[22px] flex items-center justify-center rounded-[4px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                <path d="M5 1L1 5L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span
              className="text-[12px] text-[var(--muted-foreground)] min-w-[40px] text-center"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {step + 1} of {total}
            </span>
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
              disabled={step === total - 1}
              className="size-[22px] flex items-center justify-center rounded-[4px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Close × */}
          <button
            type="button"
            onClick={onClose}
            className="size-[22px] flex items-center justify-center rounded-[4px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Options list with dividers */}
      <div className="border-t border-[var(--border)]">
        {current.options.map((opt, idx) => {
          const selected = selectedValue === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => selectOption(current.id, opt)}
              className={`w-full flex items-center gap-[12px] px-[20px] py-[12px] text-left transition-colors ${
                selected ? "bg-[var(--accent)]/8" : "hover:bg-[var(--muted)]"
              } ${idx > 0 ? "border-t border-[var(--border)]" : ""}`}
            >
              <div
                className={`shrink-0 size-[26px] rounded-[6px] flex items-center justify-center text-[11px] font-semibold transition-colors ${
                  selected ? "bg-[var(--accent)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {idx + 1}
              </div>
              <span
                className={`flex-1 text-[13px] transition-colors ${
                  selected ? "text-[var(--accent)] font-medium" : "text-[var(--foreground)]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {opt}
              </span>
              {selected && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[var(--accent)]">
                  <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}

        {/* "Something else" free-text row */}
        <div
          className={`flex items-center gap-[12px] px-[20px] py-[12px] border-t border-[var(--border)] transition-colors cursor-text ${
            isCustomSelected && customText ? "bg-[var(--accent)]/8" : "hover:bg-[var(--muted)]"
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          <div
            className={`shrink-0 size-[26px] rounded-[6px] flex items-center justify-center transition-colors ${
              isCustomSelected && customText ? "bg-[var(--accent)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={customText}
            onFocus={() => handleCustomFocus(current.id)}
            onChange={(e) => handleCustomChange(current.id, e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && canAdvance) handleNext(); }}
            placeholder="Something else…"
            className="flex-1 bg-transparent outline-none text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-[20px] py-[14px] flex items-center justify-end gap-[8px] border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onSkip}
          className="h-[30px] px-[12px] text-[12px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded-[var(--radius-button)]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance}
          className="h-[30px] px-[14px] text-[12px] font-medium text-white rounded-[var(--radius-button)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--accent)", fontFamily: "var(--font-sans)" }}
        >
          {isLast ? "Continue" : "Next →"}
        </button>
      </div>
    </div>
  );

  // Render via portal, anchored above the chat input
  if (pos) {
    return createPortal(
      <div
        style={{
          position: "fixed",
          bottom: pos.bottom,
          left: pos.left,
          right: pos.right,
          zIndex: 40,
        }}
      >
        {panel}
      </div>,
      document.body
    );
  }

  // Fallback: inline if no anchor yet
  return <div className="mx-[16px] mb-[8px]">{panel}</div>;
}
