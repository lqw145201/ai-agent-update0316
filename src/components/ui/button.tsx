import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-[4px] text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Primary: accent bg (#008489) → darker accent on hover (#007074 = accent-hover)
        default: "bg-accent text-accent-foreground hover:bg-accent-hover",
        // Destructive: red bg → darker red on hover (#AD3021 = destructive-hover)
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-hover focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        // Secondary: white bg, grey text, thin border → light grey bg on hover (#F6F7F8 = background)
        secondary:
          "bg-card text-secondary-foreground border border-border hover:bg-background",
        // Ghost (Tertiary): transparent bg, accent text → tinted bg on hover, text stays accent
        ghost:
          "text-accent hover:bg-background-hover dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Figma spec: standard button height is 32px. Use h-[32px] to avoid rem ambiguity.
        default: "h-[32px] px-2 has-[>svg]:px-2",
        sm: "h-[32px] px-2 has-[>svg]:px-2",
        lg: "h-[40px] rounded-[4px] px-4 has-[>svg]:px-3",
        icon: "size-[32px] rounded-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
