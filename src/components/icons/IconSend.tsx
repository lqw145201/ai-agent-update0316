import React from 'react';

// ICON — Send / submit button
// Uses a linear gradient from var(--ring) teal → var(--chart-5) green.
// The gradient is baked into the icon. Not colorable via currentColor.
// Size: 24px default (render in a 32px button container).

interface IconSendProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Unique ID suffix to avoid gradient ID collisions when multiple are rendered */
  id?: string;
}

export function IconSend({ size = 24, className, style, id = "default" }: IconSendProps) {
  const gradientId = `paint0_linear_send_${id}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M3.24857 2.25C2.42314 1.85571 1.51629 2.61 1.752 3.49371L3.48 9.95057C3.52331 10.1128 3.61333 10.2588 3.7389 10.3704C3.86447 10.4819 4.02004 10.5541 4.18629 10.578L12.6583 11.7883C12.9034 11.8226 12.9034 12.1774 12.6583 12.2126L4.18714 13.422C4.02089 13.4459 3.86532 13.5181 3.73976 13.6296C3.61419 13.7412 3.52416 13.8872 3.48086 14.0494L1.752 20.5097C1.51629 21.3926 2.42314 22.1469 3.24857 21.7534L21.6754 12.9686C22.4889 12.5811 22.4889 11.4223 21.6754 11.034L3.24857 2.25Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          x1="1.71406"
          x2="22.2855"
          y1="12.0015"
          y2="12.0015"
        >
          <stop stopColor="var(--ring)" />
          <stop offset="0.66" stopColor="var(--chart-5)" />
          <stop offset="1" stopColor="var(--chart-5)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
