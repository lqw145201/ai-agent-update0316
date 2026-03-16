// COMPONENT — User avatar initials circle
// Renders a colored circle with 1–2 letter initials. Used in LeftNav bottom section.
// Background: var(--primary) teal. Text: var(--primary-foreground) white.
// Size: 24px in LeftNav (default). Can be resized via the `size` prop.

interface UserAvatarProps {
  /** Initials to display (1–2 characters) */
  initials?: string;
  /** Diameter in px (default: 24) */
  size?: number;
  className?: string;
}

export function UserAvatar({ initials = "TS", size = 24, className }: UserAvatarProps) {
  const fontSize = Math.round(size * 0.458); // ~11px at size=24

  return (
    <div
      className={`relative shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <svg
        className="absolute block"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx={size / 2} cy={size / 2} r={size / 2} fill="var(--primary)" />
      </svg>

      {/* Initials text */}
      <div
        className="absolute inset-0 flex items-center justify-center font-['Inter',sans-serif] leading-none"
        style={{
          fontFeatureSettings: "'cv08', 'lnum', 'tnum'",
          fontWeight: "var(--font-weight-semibold)",
          fontSize: `${fontSize}px`,
          color: "var(--primary-foreground)",
        }}
      >
        {initials}
      </div>
    </div>
  );
}
