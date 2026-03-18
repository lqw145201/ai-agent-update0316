// COMPONENT — Clarifying questions panel (step-by-step)
// One question per step with N/Total indicator.
// Each question has vertically-stacked choice rows + a free-text input as the last option.

import { useState } from "react";
import type { ClarifyingQuestionData } from "../hooks/useChat";

interface ClarifyingQuestionsProps {
  data: ClarifyingQuestionData;
  onSubmit: (answers: Record<string, string>) => void;
  onSkip: () => void;
}

export function ClarifyingQuestions({ data, onSubmit, onSkip }: ClarifyingQuestionsProps) {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});

  const total = data.questions.length;
  const current = data.questions[step];
  const isLast = step === total - 1;

  const selectedValue = selections[current.id];
  const customText = customTexts[current.id] ?? "";

  const selectOption = (qId: string, opt: string) => {
    setSelections((prev) => ({ ...prev, [qId]: opt }));
    setCustomTexts((prev) => ({ ...prev, [qId]: "" }));
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

  return (
    <div className="mx-[16px] mb-[8px] rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-[16px] py-[12px] border-b border-[var(--border)]">
        <div className="flex items-center gap-[8px]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M6.43 4.53C6.75 3.6 8.04 3.57 8.42 4.45L8.45 4.53L8.88 5.79C8.98 6.08 9.14 6.34 9.35 6.56C9.56 6.78 9.81 6.95 10.09 7.07L10.21 7.11L11.47 7.54C12.4 7.86 12.43 9.15 11.55 9.53L11.47 9.56L10.21 9.99C9.92 10.09 9.66 10.25 9.44 10.46C9.22 10.67 9.05 10.92 8.93 11.2L8.89 11.32L8.46 12.58C8.14 13.51 6.85 13.54 6.47 12.66L6.44 12.58L6.01 11.32C5.91 11.03 5.75 10.77 5.54 10.55C5.33 10.33 5.08 10.16 4.8 10.04L4.68 10L3.42 9.57C2.49 9.25 2.46 7.96 3.34 7.58L3.42 7.55L4.68 7.12C4.97 7.02 5.23 6.86 5.45 6.65C5.67 6.44 5.84 6.19 5.96 5.91L6 5.79L6.43 4.53Z"
              fill="url(#cq_spark)"
            />
            <defs>
              <linearGradient id="cq_spark" x1="2" y1="3" x2="14" y2="13" gradientUnits="userSpaceOnUse">
                <stop stopColor="#299FB1" />
                <stop offset="0.55" stopColor="#4FC08B" />
                <stop offset="1" stopColor="#B7D325" />
              </linearGradient>
            </defs>
          </svg>
          <p className="text-[13px] font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-sans)" }}>
            {data.intro}
          </p>
        </div>
        <span className="text-[12px] text-[var(--muted-foreground)] shrink-0 ml-[12px]" style={{ fontFamily: "var(--font-sans)" }}>
          {step + 1} / {total}
        </span>
      </div>

      {/* Question + choices */}
      <div className="px-[16px] py-[14px] flex flex-col gap-[10px]">
        <p
          className="text-[12px] font-semibold text-[var(--secondary-foreground)]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {current.label}
        </p>

        <div className="flex flex-col gap-[6px]">
          {/* Predefined options — vertically stacked rows */}
          {current.options.map((opt) => {
            const selected = selectedValue === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => selectOption(current.id, opt)}
                className={`w-full text-left px-[12px] py-[8px] rounded-[var(--radius-button)] border text-[13px] transition-colors ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/60 hover:bg-[var(--muted)]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {opt}
              </button>
            );
          })}

          {/* Free-text as last choice */}
          <div
            className={`flex items-center rounded-[var(--radius-button)] border transition-colors ${
              selectedValue === "__custom__" && customText
                ? "border-[var(--accent)] bg-[var(--accent)]/10"
                : "border-[var(--border)] hover:border-[var(--accent)]/60"
            }`}
          >
            <input
              type="text"
              value={customText}
              onChange={(e) => handleCustomChange(current.id, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
              placeholder="Other (describe…)"
              className="w-full px-[12px] py-[8px] bg-transparent outline-none text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
              style={{ fontFamily: "var(--font-sans)" }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-[16px] pb-[12px] flex items-center justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="h-[28px] px-[10px] text-[12px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded-[var(--radius-button)]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Skip all
        </button>

        <div className="flex items-center gap-[8px]">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="h-[28px] px-[12px] text-[12px] border border-[var(--border)] rounded-[var(--radius-button)] text-[var(--secondary-foreground)] hover:bg-[var(--muted)] transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="h-[28px] px-[14px] text-[12px] font-medium text-white rounded-[var(--radius-button)] hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--accent)", fontFamily: "var(--font-sans)" }}
          >
            {isLast ? "Continue" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
