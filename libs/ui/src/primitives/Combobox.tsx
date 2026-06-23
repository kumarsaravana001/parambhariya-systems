import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Tag } from "./Tag";
import { cn } from "../utils/cn";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface BaseProps {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value: string | null;
  onChange: (value: string | null) => void;
}
interface MultiProps extends BaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

export type ComboboxProps = SingleProps | MultiProps;

/** Searchable select. Single mode shows the chosen label; multi shows removable chips. */
export function Combobox(props: ComboboxProps) {
  const {
    options, placeholder = "Select…", searchPlaceholder = "Search…",
    emptyText = "No results", disabled, className, id,
  } = props;
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const isSelected = (v: string) =>
    props.multiple ? props.value.includes(v) : props.value === v;

  const toggle = (v: string) => {
    if (props.multiple) {
      const next = props.value.includes(v)
        ? props.value.filter((x) => x !== v)
        : [...props.value, v];
      props.onChange(next);
    } else {
      props.onChange(props.value === v ? null : v);
      setOpen(false);
    }
  };

  const selectedLabels = props.multiple
    ? options.filter((o) => props.value.includes(o.value))
    : [];
  const singleLabel = !props.multiple
    ? options.find((o) => o.value === props.value)?.label
    : undefined;

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
      <PopoverTrigger asChild>
        {/* div (not button) so removable chips can nest their own buttons without invalid DOM */}
        <div
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className={cn(
            "flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-md border bg-surface-card px-3 py-1.5 text-left text-base",
            "border-border-default hover:border-border-strong",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
            className
          )}
        >
          <span className="flex-1 min-w-0 flex flex-wrap gap-1 items-center">
            {props.multiple ? (
              selectedLabels.length > 0 ? (
                selectedLabels.map((o) => (
                  <Tag
                    key={o.value}
                    tone="brand"
                    size="sm"
                    onRemove={() => toggle(o.value)}
                  >
                    {o.label}
                  </Tag>
                ))
              ) : (
                <span className="text-text-muted">{placeholder}</span>
              )
            ) : singleLabel ? (
              <span className="text-text-primary truncate">{singleLabel}</span>
            ) : (
              <span className="text-text-muted">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-text-muted shrink-0" aria-hidden />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
        <div className="flex items-center gap-2 border-b border-border-default px-3">
          <Search className="h-4 w-4 text-text-muted shrink-0" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full bg-transparent text-base text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <ul role="listbox" className="max-h-64 overflow-auto p-1">
          {filtered.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-text-muted">{emptyText}</li>
          ) : (
            filtered.map((o) => {
              const sel = isSelected(o.value);
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sel}
                    onClick={() => toggle(o.value)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-2 text-base text-left",
                      "hover:bg-surface-muted focus:outline-none focus-visible:bg-surface-muted"
                    )}
                  >
                    <span className="w-4 shrink-0">
                      {sel && <Check className="h-4 w-4 text-brand-600" aria-hidden />}
                    </span>
                    <span className="flex-1 truncate">{o.label}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
