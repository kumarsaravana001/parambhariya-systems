import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../utils/cn";

const SIZE = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
} as const;

const STATUS = {
  online:  "bg-success-fg",
  busy:    "bg-danger-fg",
  away:    "bg-warn-fg",
  offline: "bg-neutral-fg",
} as const;

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  /** Used as fallback if `src` fails. e.g. "SK". */
  initials?: string;
  icon?: React.ReactNode;
  size?: keyof typeof SIZE;
  status?: keyof typeof STATUS;
}

export function Avatar({ src, alt, initials, icon, size = "md", status, className, ...props }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)} {...props}>
      <AvatarPrimitive.Root
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-full bg-surface-muted text-text-secondary font-medium select-none",
          SIZE[size]
        )}
      >
        {src && <AvatarPrimitive.Image src={src} alt={alt ?? ""} className="h-full w-full object-cover" />}
        <AvatarPrimitive.Fallback delayMs={src ? 200 : 0} className="grid place-items-center h-full w-full">
          {initials ?? icon ?? "?"}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {status && (
        <span
          aria-label={status}
          className={cn(
            "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-surface-card",
            STATUS[status]
          )}
        />
      )}
    </span>
  );
}
