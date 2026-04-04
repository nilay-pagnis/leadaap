"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  MANUAL_SOURCE_OPTIONS,
  type ManualEnquirySource,
} from "@/lib/leads/build-manual-lead-data";
import {
  MANUAL_VIRTUAL_FORM_ID,
  VIRTUAL_MANUAL_FORM,
} from "@/lib/leads/manual-enquiry-filter";
import type { LeadRow, LeadStatus } from "@/types";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

function statusLabel(s: LeadStatus): string {
  switch (s) {
    case "new":
      return "New";
    case "contacted":
      return "Contacted";
    case "qualified":
      return "Qualified";
    case "closed":
      return "Closed";
    default:
      return s;
  }
}

export type AddEnquiryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forms: { id: string; name: string }[];
  onSuccess: (lead: LeadRow) => void;
};

export function AddEnquiryModal({
  open,
  onOpenChange,
  forms,
  onSuccess,
}: AddEnquiryModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [source, setSource] = useState<ManualEnquirySource>("manual");
  const [formId, setFormId] = useState<string>(MANUAL_VIRTUAL_FORM_ID);
  const [status, setStatus] = useState<LeadStatus>("new");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    message?: string;
    email?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      document.getElementById("manual-name")?.focus();
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setErrors({});
  }, [open]);

  const reset = useCallback(() => {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setSource("manual");
    setFormId(MANUAL_VIRTUAL_FORM_ID);
    setStatus("new");
    setErrors({});
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) reset();
      onOpenChange(next);
    },
    [onOpenChange, reset]
  );

  const validate = useCallback(() => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!message.trim()) next.message = "Message is required";
    const em = email.trim();
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      next.email = "Enter a valid email";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [name, message, email]);

  const submit = useCallback(async () => {
    if (!validate()) return;
    const useManualEntry = formId === MANUAL_VIRTUAL_FORM_ID;
    if (!useManualEntry && forms.length === 0) {
      toast.error("Create an enquiry form first or choose Manual Entry");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/leads/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          message: message.trim(),
          source,
          form_id: useManualEntry ? MANUAL_VIRTUAL_FORM_ID : formId || undefined,
          status,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        lead?: LeadRow;
      };

      if (!res.ok) {
        toast.error(json.error ?? "Could not add enquiry");
        return;
      }

      if (!json.lead) {
        toast.error("Invalid response from server");
        return;
      }

      toast.success("Enquiry added");
      onSuccess(json.lead);
      handleOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [
    validate,
    forms.length,
    name,
    email,
    phone,
    message,
    source,
    formId,
    status,
    onSuccess,
    handleOpenChange,
  ]);

  const noForms = forms.length === 0;
  const canSubmit =
    !submitting && (formId === MANUAL_VIRTUAL_FORM_ID || forms.length > 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "max-h-[min(92vh,640px)] gap-0 overflow-y-auto rounded-2xl border-slate-200/90 p-0 sm:max-w-lg"
        )}
      >
        <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-5 text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight text-slate-900">
            Add enquiry manually
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Same data shape as form submissions. Scoring runs automatically in the inbox.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {noForms ? (
            <p className="rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
              <strong>Manual Entry</strong> works without a form. Optionally{" "}
              <a
                href="/forms"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                create a form
              </a>{" "}
              to map fields from a template.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="manual-name" className="text-slate-700">
              Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="manual-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact name"
              className="rounded-xl"
              disabled={submitting}
              aria-invalid={!!errors.name}
            />
            {errors.name ? (
              <p className="text-xs font-medium text-red-600">{errors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-email" className="text-slate-700">
              Email
            </Label>
            <Input
              id="manual-email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="rounded-xl"
              disabled={submitting}
              aria-invalid={!!errors.email}
            />
            {errors.email ? (
              <p className="text-xs font-medium text-red-600">{errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-phone" className="text-slate-700">
              Phone
            </Label>
            <Input
              id="manual-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 …"
              className="rounded-xl"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-message" className="text-slate-700">
              Message <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="manual-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What they said or what to remember…"
              rows={4}
              className="min-h-[100px] resize-none rounded-xl"
              disabled={submitting}
              aria-invalid={!!errors.message}
            />
            {errors.message ? (
              <p className="text-xs font-medium text-red-600">{errors.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-700">Source</Label>
              <Select
                value={source}
                onValueChange={(v) => setSource(v as ManualEnquirySource)}
                disabled={submitting}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MANUAL_SOURCE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as LeadStatus)}
                disabled={submitting}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">Form</Label>
            <Select
              value={formId}
              onValueChange={(v) => setFormId(v ?? MANUAL_VIRTUAL_FORM_ID)}
              disabled={submitting}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MANUAL_VIRTUAL_FORM_ID}>
                  {VIRTUAL_MANUAL_FORM.name}
                </SelectItem>
                {forms.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {formId === MANUAL_VIRTUAL_FORM_ID
                ? "Stored without a linked form — same inbox experience as templated forms."
                : "Fields map to this form’s name, email, phone, and message inputs."}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={submitting}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl font-semibold"
            disabled={!canSubmit}
            onClick={() => void submit()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                Add enquiry
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddEnquiryTriggerButton({
  onClick,
  disabled,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      className="shrink-0 gap-1.5 rounded-xl font-semibold shadow-sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Plus className="size-4" />
      Add Enquiry
    </Button>
  );
}
