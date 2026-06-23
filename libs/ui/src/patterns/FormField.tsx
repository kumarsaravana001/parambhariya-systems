import * as React from "react";
import { Label } from "../primitives/Label";
import { cn } from "../utils/cn";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, htmlFor, hint, error, required, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-danger-fg ml-0.5" aria-hidden>*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-danger-fg" role="alert">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  )
);
FormField.displayName = "FormField";
