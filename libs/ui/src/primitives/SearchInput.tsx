import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../utils/cn";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, ...props }, ref) => {
    const hasValue = value !== undefined && value !== "";
    return (
      <div className={cn("relative", className)}>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
        />
        <input
          ref={ref}
          type="search"
          value={value}
          className={cn(
            "h-10 w-full rounded-md border bg-surface-card pl-9 pr-9 text-base text-text-primary",
            "placeholder:text-text-muted border-border-default hover:border-border-strong",
            "transition-colors duration-[120ms]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "[&::-webkit-search-cancel-button]:appearance-none"
          )}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
