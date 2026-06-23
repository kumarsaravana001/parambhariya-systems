import * as React from "react";
import { ExternalLink } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const linkVariants = cva(
  "inline-flex items-center gap-1 underline-offset-2 transition-colors duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-sm",
  {
    variants: {
      variant: {
        // brand-as-text → brand-700
        default: "text-brand-700 hover:underline",
        subtle:  "text-text-secondary hover:text-text-primary hover:underline",
        danger:  "text-danger-fg hover:underline",
        disabled:"text-text-muted opacity-60 pointer-events-none",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  external?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, external, children, ...props }, ref) => (
    <a
      ref={ref}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className={cn(linkVariants({ variant }), className)}
      {...props}
    >
      <span>{children}</span>
      {external && <ExternalLink className="h-3.5 w-3.5" aria-hidden />}
    </a>
  )
);
Link.displayName = "Link";
