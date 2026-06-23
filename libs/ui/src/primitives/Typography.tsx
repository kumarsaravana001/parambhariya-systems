import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

/* ── Heading ──────────────────────────────────────────────── */
const headingVariants = cva("text-text-primary", {
  variants: {
    level: {
      1: "text-xl font-bold tracking-[-0.015em] leading-tight",   // page H1
      2: "text-lg font-semibold tracking-[-0.01em] leading-snug",  // card H2 / dialog title
      3: "text-md font-semibold leading-snug",                     // list-row heading
    },
    eyebrow: { true: "uppercase tracking-[0.06em] text-xs font-semibold text-text-muted", false: "" },
  },
  defaultVariants: { level: 2, eyebrow: false },
});

export interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4";
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, eyebrow, as, ...props }, ref) => {
    const Tag = (as ?? (`h${level}` as const)) as "h1";
    return <Tag ref={ref} className={cn(headingVariants({ level, eyebrow }), className)} {...props} />;
  }
);
Heading.displayName = "Heading";

/* ── Text ─────────────────────────────────────────────────── */
const textVariants = cva("", {
  variants: {
    tone: {
      primary: "text-text-primary",
      secondary: "text-text-secondary",
      muted: "text-text-muted",
    },
    size: {
      base: "text-base leading-base",
      sm: "text-sm leading-base",
    },
    weight: { regular: "font-normal", medium: "font-medium", semibold: "font-semibold" },
  },
  defaultVariants: { tone: "primary", size: "base", weight: "regular" },
});

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div";
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, tone, size, weight, as = "p", ...props }, ref) => {
    const Tag = as as "p";
    return <Tag ref={ref} className={cn(textVariants({ tone, size, weight }), className)} {...props} />;
  }
);
Text.displayName = "Text";

/* ── Caption ──────────────────────────────────────────────── */
export const Caption = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("text-xs text-text-muted leading-snug", className)} {...props} />
  )
);
Caption.displayName = "Caption";

/* ── Code ─────────────────────────────────────────────────── */
export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  /** Render as a block instead of an inline chip. */
  block?: boolean;
}

export const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ className, block, ...props }, ref) => (
    <code
      ref={ref}
      className={cn(
        "font-mono text-sm text-text-primary bg-surface-sunken rounded-sm",
        block ? "block p-3 overflow-x-auto whitespace-pre" : "px-1.5 py-0.5",
        className
      )}
      {...props}
    />
  )
);
Code.displayName = "Code";
