// COMPONENT — Suggested follow-up questions
// Renders a row of clickable pill chips after an AI message
// Clicking a chip fills the chat input with that question

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-[8px] pt-[4px]">
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          className="flex items-center gap-[6px] px-[12px] h-[30px] rounded-full border border-[var(--border)] text-[13px] text-[var(--secondary-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors shrink-0"
        >
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
            <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {q}
        </button>
      ))}
    </div>
  );
}
