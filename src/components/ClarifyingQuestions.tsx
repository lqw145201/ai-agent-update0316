// COMPONENT — Clarifying questions panel
// Appears above the chat input when the AI needs more context before proceeding.
// Shows multiple-choice selections per question + a free-text field at the bottom.

import { useState } from "react";
import type { ClarifyingQuestionData } from "../hooks/useChat";

interface ClarifyingQuestionsProps {
  data: ClarifyingQuestionData;
  onSubmit: (answers: Record<string, string>, freeText: string) => void;
  onSkip: () => void;
}

export function ClarifyingQuestions({ data, onSubmit, onSkip }: ClarifyingQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [freeText, setFreeText] = useState("");

  const select = (questionId: string, option: string) =>
    setAnswers((prev) => ({ ...prev, [questionId]: option }));

  return (
    <div className="mx-[16px] mb-[8px] rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-[8px] px-[16px] py-[12px] border-b border-[var(--border)]">
        {/* Sparkle icon */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6.43 4.53C6.75 3.6 8.04 3.57 8.42 4.45L8.45 4.53L8.88 5.79C8.98 6.08 9.14 6.34 9.35 6.56C9.56 6.78 9.81 6.95 10.09 7.07L10.21 7.11L11.47 7.54C12.4 7.86 12.43 9.15 11.55 9.53L11.47 9.56L10.21 9.99C9.92 10.09 9.66 10.25 9.44 10.46C9.22 10.67 9.05 10.92 8.93 11.2L8.89 11.32L8.46 12.58C8.14 13.51 6.85 13.54 6.47 12.66L6.44 12.58L6.01 11.32C5.91 11.03 5.75 10.77 5.54 10.55C5.33 10.33 5.08 10.16 4.8 10.04L4.68 10L3.42 9.57C2.49 9.25 2.46 7.96 3.34 7.58L3.42 7.55L4.68 7.12C4.97 7.02 5.23 6.86 5.45 6.65C5.67 6.44 5.84 6.19 5.96 5.91L6 5.79L6.43 4.53ZM11.71 2.69C11.81 2.69 11.91 2.72 11.99 2.77C12.07 2.82 12.14 2.9 12.18 2.98L12.21 3.04L12.39 3.57L12.93 3.75C13.02 3.78 13.1 3.84 13.16 3.92C13.22 4 13.26 4.09 13.26 4.19C13.27 4.29 13.24 4.39 13.19 4.47C13.14 4.55 13.07 4.62 12.98 4.66L12.92 4.68L12.39 4.86L12.21 5.4C12.18 5.49 12.12 5.57 12.04 5.63C11.96 5.69 11.87 5.72 11.77 5.73C11.67 5.73 11.57 5.71 11.49 5.66C11.41 5.61 11.34 5.54 11.3 5.45L11.28 5.39L11.1 4.86L10.56 4.68C10.47 4.65 10.39 4.59 10.33 4.51C10.27 4.43 10.23 4.34 10.22 4.24C10.22 4.14 10.24 4.04 10.29 3.96C10.34 3.88 10.41 3.81 10.5 3.77L10.56 3.75L11.09 3.57L11.27 3.03C11.3 2.94 11.36 2.86 11.44 2.8C11.52 2.74 11.62 2.7 11.71 2.69Z"
            fill="url(#cq_grad)"
          />
          <defs>
            <linearGradient id="cq_grad" x1="2" y1="3" x2="14" y2="13" gradientUnits="userSpaceOnUse">
              <stop stopColor="#299FB1" />
              <stop offset="0.55" stopColor="#4FC08B" />
              <stop offset="1" stopColor="#B7D325" />
            </linearGradient>
          </defs>
        </svg>
        <p
          className="text-[13px] font-semibold text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {data.intro}
        </p>
      </div>

      {/* Questions */}
      <div className="px-[16px] py-[14px] flex flex-col gap-[14px]">
        {data.questions.map((q) => (
          <div key={q.id} className="flex flex-col gap-[8px]">
            <p
              className="text-[12px] text-[var(--secondary-foreground)]"
              style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--font-weight-semibold)" }}
            >
              {q.label}
            </p>
            <div className="flex flex-wrap gap-[6px]">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => select(q.id, opt)}
                    className={`px-[12px] h-[28px] rounded-full text-[12px] border transition-colors ${
                      selected
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                        : "border-[var(--border)] text-[var(--secondary-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    }`}
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Free-text last field */}
        <div className="flex flex-col gap-[8px]">
          <p
            className="text-[12px] text-[var(--secondary-foreground)]"
            style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--font-weight-semibold)" }}
          >
            Anything else I should know?
          </p>
          <input
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSubmit(answers, freeText); }}
            placeholder="Type here…"
            className="w-full h-[32px] px-[10px] text-[13px] bg-transparent border border-[var(--border)] rounded-[var(--radius-button)] outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            style={{ fontFamily: "var(--font-sans)", borderColor: "var(--border)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--ring)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-[16px] pb-[12px] flex items-center justify-end gap-[8px]">
        <button
          type="button"
          onClick={onSkip}
          className="h-[30px] px-[12px] text-[12px] text-[var(--secondary-foreground)] hover:text-[var(--foreground)] transition-colors rounded-[var(--radius-button)]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Skip
        </button>
        <button
          type="button"
          onClick={() => onSubmit(answers, freeText)}
          className="h-[30px] px-[16px] text-[12px] font-medium text-white rounded-[var(--radius-button)] hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)", backgroundColor: "var(--accent)" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
