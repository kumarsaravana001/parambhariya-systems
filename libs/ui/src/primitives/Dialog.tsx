import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[var(--z-overlay)] bg-[var(--surface-overlay)]",
      "data-[state=open]:[animation:var(--animate-overlay-in)]",
      "data-[state=closed]:[animation:var(--animate-overlay-out)]",
      // A closed overlay must never capture clicks. Radix keeps it mounted
      // through the exit animation (and on React 19 the Presence unmount can
      // lag), leaving a full-screen invisible overlay that freezes the page.
      // Radix's DismissableLayer sets `pointer-events: auto` INLINE, so we need
      // `!important` (Tailwind's trailing `!`) to win over it.
      "data-[state=closed]:pointer-events-none!",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-[var(--z-modal)] -translate-x-1/2 -translate-y-1/2",
        "w-[calc(100vw-2rem)] max-w-lg",
        // Never exceed the viewport (landscape phones / short screens): cap to
        // the dynamic viewport height and lay out as a column so a consumer can
        // pin its header/footer and scroll the middle. dvh accounts for mobile
        // browser chrome; the 1rem inset keeps a margin top and bottom.
        "max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden",
        "bg-surface-card rounded-xl shadow-lg border border-border-default",
        "p-6",
        "focus:outline-none",
        "data-[state=open]:[animation:var(--animate-dialog-in)]",
        "data-[state=closed]:[animation:var(--animate-dialog-out)]",
        "data-[state=closed]:pointer-events-none!",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Close"
        className="absolute right-3 top-3 grid place-items-center rounded-md p-2 text-text-muted hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      >
        <X className="h-4 w-4" aria-hidden />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 mb-4", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex justify-end gap-2 mt-6 pt-4 border-t border-border-default", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-text-primary leading-snug", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-text-muted", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
