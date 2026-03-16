// COMPONENT — User message bubble (right-aligned, muted bg)
// IMPORTANT: AI/assistant messages have NO bubble — plain text only, no background.
// This component is exclusively for user-sent messages.
//
// Radius pattern: rounded on 3 corners (card radius 8px), small radius on bottom-right (button radius 4px)
// This creates the "speech bubble pointing bottom-right" visual.

interface UserMessageBubbleProps {
  children: React.ReactNode;
}

// LAYOUT — User message bubble (bg-muted, speech bubble shape)
export function UserMessageBubble({ children }: UserMessageBubbleProps) {
  return (
    <div className="flex items-start justify-end w-full">
      <div className="bg-muted rounded-tl-[var(--radius-card)] rounded-tr-[var(--radius-card)] rounded-br-[var(--radius-button)] rounded-bl-[var(--radius-card)] max-w-[80%]">
        <div className="px-[16px] py-[8px]">
          {children}
        </div>
      </div>
    </div>
  );
}

// LAYOUT — Convenience wrapper for plain text user messages
export function UserMessageText({ text }: { text: string }) {
  return (
    <UserMessageBubble>
      <p
        className="text-foreground"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-base)",
          fontWeight: "var(--font-weight-normal)",
          lineHeight: "1.5",
        }}
      >
        {text}
      </p>
    </UserMessageBubble>
  );
}

// LAYOUT — AI typing indicator (3 bouncing dots, no bubble background for AI)
// Kept here for pairing reference — shows the isTyping state during AI response
export function AITypingIndicator() {
  return (
    <div className="flex items-start w-full">
      <div className="px-0 py-[4px] flex gap-[4px] items-center">
        <div
          className="size-[6px] rounded-full bg-accent/60 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="size-[6px] rounded-full bg-accent/60 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="size-[6px] rounded-full bg-accent/60 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
