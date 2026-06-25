import * as React from "react";
import { Upload, File as FileIcon, X, CheckCircle2, TriangleAlert } from "lucide-react";
import { cn } from "../utils/cn";

export interface FileChip {
  name: string;
  sizeLabel?: string;
  status?: "uploading" | "success" | "error";
}

export interface FileInputProps {
  /** "compact" = a single button; "dropzone" = a drag-drop area. */
  variant?: "compact" | "dropzone";
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
  files?: FileChip[];
  onFiles?: (files: FileList) => void;
  onRemove?: (index: number) => void;
  className?: string;
}

export function FileInput({
  variant = "dropzone",
  accept,
  multiple,
  disabled,
  label = "Upload files",
  hint = "Drag & drop or click to browse",
  files = [],
  onFiles,
  onRemove,
  className,
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragover, setDragover] = React.useState(false);

  const open = () => inputRef.current?.click();
  const handleFiles = (fl: FileList | null) => fl && fl.length && onFiles?.(fl);

  const hidden = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      className="sr-only"
      onChange={(e) => handleFiles(e.target.files)}
    />
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {variant === "compact" ? (
        <button
          type="button"
          onClick={open}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-2 h-10 px-4 rounded-md text-base font-medium",
            "bg-surface-card border border-border-strong text-text-primary",
            "hover:bg-surface-muted transition-colors duration-[120ms]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed self-start"
          )}
        >
          <Upload className="h-4 w-4" aria-hidden /> {label}
          {hidden}
        </button>
      ) : (
        <button
          type="button"
          onClick={open}
          disabled={disabled}
          onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
          onDragLeave={() => setDragover(false)}
          onDrop={(e) => { e.preventDefault(); setDragover(false); handleFiles(e.dataTransfer.files); }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 w-full rounded-lg px-6 py-8 text-center",
            "border-2 border-dashed transition-colors duration-[120ms]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            dragover
              ? "border-brand-500 bg-brand-50 dark:bg-surface-muted"
              : "border-border-default hover:border-border-strong hover:bg-surface-muted"
          )}
        >
          <Upload className={cn("h-7 w-7", dragover ? "text-brand-600" : "text-text-muted")} aria-hidden />
          <div className="text-sm font-medium text-text-primary">{label}</div>
          <div className="text-xs text-text-muted">{hint}</div>
          {hidden}
        </button>
      )}

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border border-border-default bg-surface-card px-3 py-2"
            >
              <FileIcon className="h-4 w-4 text-text-muted shrink-0" aria-hidden />
              <span className="flex-1 min-w-0 truncate text-sm text-text-primary">{f.name}</span>
              {f.sizeLabel && <span className="text-xs text-text-muted font-mono">{f.sizeLabel}</span>}
              {f.status === "success" && <CheckCircle2 className="h-4 w-4 text-success-fg" aria-label="Uploaded" />}
              {f.status === "error" && <TriangleAlert className="h-4 w-4 text-danger-fg" aria-label="Failed" />}
              {f.status === "uploading" && (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-border-strong border-t-brand-500 animate-spin" aria-label="Uploading" />
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  aria-label={`Remove ${f.name}`}
                  className="rounded-sm p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
