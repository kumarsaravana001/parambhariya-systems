import * as React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
  Button, Input, Textarea, Switch, FormField,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@parambhariya/ui";

export type FieldType = "text" | "number" | "textarea" | "select" | "switch" | "date";

export interface FieldSpec {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  /** grid span — 1 (default) or 2 (full row) */
  span?: 1 | 2;
  min?: number;
  max?: number;
  step?: number;
}

export interface EntityFormProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  fields: FieldSpec[];
  initial?: Record<string, any>;
  submitLabel?: string;
  busy?: boolean;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
}

export function EntityForm({ open, onOpenChange, title, description, fields, initial, submitLabel = "Save", busy, onSubmit }: EntityFormProps) {
  const [values, setValues] = React.useState<Record<string, any>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      const base: Record<string, any> = {};
      for (const f of fields) base[f.name] = initial?.[f.name] ?? (f.type === "switch" ? false : "");
      setValues(base);
      setError(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (name: string, v: any) => setValues((s) => ({ ...s, [name]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && (values[f.name] === "" || values[f.name] == null)) {
        setError(`${f.label} is required`);
        return;
      }
    }
    const out: Record<string, any> = {};
    for (const f of fields) {
      let v = values[f.name];
      if (f.type === "number") v = v === "" || v == null ? undefined : Number(v);
      out[f.name] = v;
    }
    setError(null);
    await onSubmit(out);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={submit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {fields.map((f) => {
              const id = `ef-${f.name}`;
              const control =
                f.type === "textarea" ? (
                  <Textarea id={id} placeholder={f.placeholder} value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />
                ) : f.type === "switch" ? (
                  <div className="h-10 flex items-center"><Switch checked={!!values[f.name]} onCheckedChange={(v) => set(f.name, v)} /></div>
                ) : f.type === "select" ? (
                  <Select value={values[f.name] ?? ""} onValueChange={(v) => set(f.name, v)}>
                    <SelectTrigger id={id}><SelectValue placeholder={f.placeholder ?? "Select…"} /></SelectTrigger>
                    <SelectContent>{(f.options ?? []).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input id={id} type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    placeholder={f.placeholder} value={values[f.name] ?? ""} min={f.min} max={f.max} step={f.step}
                    onChange={(e) => set(f.name, e.target.value)} />
                );
              return (
                <FormField key={f.name} label={f.label} htmlFor={id} required={f.required} hint={f.hint}
                  className={f.span === 2 || f.type === "textarea" ? "sm:col-span-2" : ""}>
                  {control}
                </FormField>
              );
            })}
          </div>
          {error && <p className="text-sm text-danger-fg mt-3" role="alert">{error}</p>}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary" size="sm" disabled={busy}>Cancel</Button></DialogClose>
            <Button type="submit" size="sm" loading={busy}>{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
