"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectOptionsEditor } from "@/components/forms/select-options-editor";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BookOpen,
  Copy,
  Eye,
  GripVertical,
  Loader2,
  Plus,
  Rocket,
  Trash2,
} from "lucide-react";
import type { FieldRow, FieldType, FormRow } from "@/types";
import { FormPreviewPanel } from "@/components/forms/form-preview-panel";

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
];

function SortableField({
  field,
  onUpdate,
  onRemove,
  autoFocusLabel,
}: {
  field: FieldRow;
  onUpdate: (id: string, patch: Partial<FieldRow>) => void;
  onRemove: (id: string) => void;
  autoFocusLabel?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm transition-all duration-200",
        "hover:border-zinc-300 hover:shadow-md",
        isDragging && "z-50 scale-[1.02] border-indigo-300 shadow-lg ring-2 ring-indigo-500/20"
      )}
    >
      <div className="flex gap-3">
        <button
          type="button"
          className="mt-1.5 shrink-0 cursor-grab touch-none rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-5" />
        </button>
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-500">Label</Label>
            <Input
              value={field.label}
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
              className="h-10 rounded-lg border-zinc-200"
              autoFocus={autoFocusLabel}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-500">Type</Label>
            <Select
              value={field.type}
              onValueChange={(v) =>
                onUpdate(field.id, {
                  type: v as FieldType,
                  options: v === "select" ? field.options ?? ["Option A"] : [],
                })
              }
            >
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {field.type === "select" && (
            <SelectOptionsEditor
              fieldId={field.id}
              options={field.options}
              onChange={(next) => onUpdate(field.id, { options: next })}
            />
          )}
          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              id={`req-${field.id}`}
              checked={field.required}
              onCheckedChange={(c) =>
                onUpdate(field.id, { required: Boolean(c) })
              }
            />
            <Label htmlFor={`req-${field.id}`} className="text-sm font-normal text-zinc-700">
              Required
            </Label>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-zinc-400 hover:text-red-600"
          onClick={() => onRemove(field.id)}
          aria-label="Remove field"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function DragPreview({ field }: { field: FieldRow }) {
  return (
    <div className="rounded-xl border border-indigo-300 bg-white p-4 shadow-xl ring-2 ring-indigo-500/30">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
        <GripVertical className="size-4 text-zinc-400" />
        {field.label}
      </div>
    </div>
  );
}

type SaveState = "idle" | "saving" | "saved";

export function FormBuilder({ form, initialFields }: { form: FormRow; initialFields: FieldRow[] }) {
  const router = useRouter();
  const [fields, setFields] = useState<FieldRow[]>(initialFields);
  const [formName, setFormName] = useState(form.form_name);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveOps = useRef(0);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("New field");
  const [newType, setNewType] = useState<FieldType>("text");
  const [newRequired, setNewRequired] = useState(false);
  const [focusFieldId, setFocusFieldId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const lastSavedNameRef = useRef(form.form_name);

  const beginSave = useCallback(() => {
    saveOps.current += 1;
    setSaveState("saving");
    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current);
      savedTimerRef.current = null;
    }
  }, []);

  const endSave = useCallback(() => {
    saveOps.current -= 1;
    if (saveOps.current <= 0) {
      saveOps.current = 0;
      setSaveState("saved");
      savedTimerRef.current = setTimeout(() => setSaveState("idle"), 2200);
    }
  }, []);

  const sortedFields = useMemo(
    () => [...fields].sort((a, b) => a.sort_order - b.sort_order),
    [fields]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const persistField = useCallback(
    async (row: FieldRow) => {
      beginSave();
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("fields")
          .update({
            label: row.label,
            type: row.type,
            required: row.required,
            sort_order: row.sort_order,
            options: row.type === "select" ? row.options ?? [] : [],
          })
          .eq("id", row.id);
        if (error) toast.error(error.message);
        else router.refresh();
      } finally {
        endSave();
      }
    },
    [beginSave, endSave, router]
  );

  const onUpdate = useCallback(
    (id: string, patch: Partial<FieldRow>) => {
      setFields((prev) => {
        const next = prev.map((f) => (f.id === id ? { ...f, ...patch } : f));
        const merged = next.find((f) => f.id === id);
        if (merged) void persistField(merged);
        return next;
      });
    },
    [persistField]
  );

  const persistOrder = useCallback(
    async (next: FieldRow[]) => {
      beginSave();
      try {
        const supabase = createClient();
        for (let i = 0; i < next.length; i++) {
          const row = next[i];
          const { error } = await supabase
            .from("fields")
            .update({ sort_order: i })
            .eq("id", row.id);
          if (error) {
            toast.error(error.message);
            return;
          }
        }
        router.refresh();
      } finally {
        endSave();
      }
    },
    [beginSave, endSave, router]
  );

  function onDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ordered = [...sortedFields];
    const oldIndex = ordered.findIndex((f) => f.id === active.id);
    const newIndex = ordered.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(ordered, oldIndex, newIndex).map((f, i) => ({
      ...f,
      sort_order: i,
    }));
    setFields(next);
    void persistOrder(next);
  }

  async function onRemove(id: string) {
    beginSave();
    try {
      const supabase = createClient();
      const { error } = await supabase.from("fields").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setFields((prev) => prev.filter((f) => f.id !== id));
      toast.success("Field removed");
      router.refresh();
    } finally {
      endSave();
    }
  }

  async function addField(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const nextOrder = fields.length
      ? Math.max(...fields.map((f) => f.sort_order)) + 1
      : 0;
    beginSave();
    try {
      const { data, error } = await supabase
        .from("fields")
        .insert({
          form_id: form.id,
          label: newLabel.trim() || "New field",
          type: newType,
          required: newRequired,
          sort_order: nextOrder,
          options: newType === "select" ? ["Option A", "Option B"] : [],
        })
        .select("*")
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      const row = data as FieldRow;
      setFields((prev) => [...prev, row]);
      setFocusFieldId(row.id);
      setAddOpen(false);
      setNewLabel("New field");
      setNewType("text");
      setNewRequired(false);
      toast.success("Field added");
      router.refresh();
    } finally {
      endSave();
    }
  }

  useEffect(() => {
    if (!focusFieldId) return;
    const t = setTimeout(() => setFocusFieldId(null), 500);
    return () => clearTimeout(t);
  }, [focusFieldId]);

  useEffect(() => {
    setFormName(form.form_name);
    lastSavedNameRef.current = form.form_name;
  }, [form.id, form.form_name]);

  async function commitFormName() {
    const trimmed = formName.trim();
    if (!trimmed) {
      setFormName(lastSavedNameRef.current);
      return;
    }
    if (trimmed === lastSavedNameRef.current) return;
    beginSave();
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("forms")
        .update({ form_name: trimmed })
        .eq("id", form.id);
      if (error) {
        toast.error(error.message);
        setFormName(lastSavedNameRef.current);
        return;
      }
      lastSavedNameRef.current = trimmed;
      router.refresh();
    } finally {
      endSave();
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/f/${form.id}`;
    void navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  }

  function copyFormId() {
    void navigator.clipboard.writeText(form.id);
    toast.success("Form ID copied to clipboard");
  }

  function publish() {
    const url = `${window.location.origin}/f/${form.id}`;
    void navigator.clipboard.writeText(url);
    toast.success("Published — link copied. Share it anywhere.");
  }

  function openPreview() {
    window.open(`/f/${form.id}`, "_blank", "noopener,noreferrer");
  }

  const activeField = activeDragId
    ? sortedFields.find((f) => f.id === activeDragId)
    : null;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-6">
      {/* Top bar */}
      <header className="sticky top-0 z-30 -mx-4 border-b border-zinc-200/80 bg-zinc-50/95 px-4 py-3 backdrop-blur-md lg:-mx-10 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/forms"
              className="shrink-0 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800"
            >
              ← Forms
            </Link>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onBlur={() => void commitFormName()}
              className="h-11 border-transparent bg-white text-xl font-semibold tracking-tight text-zinc-900 shadow-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 sm:max-w-md"
              aria-label="Enquiry form name"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="mr-2 flex min-h-[1.25rem] min-w-[5rem] items-center text-xs font-medium">
              {saveState === "saving" && (
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving…
                </span>
              )}
              {saveState === "saved" && (
                <span className="text-emerald-600">Saved</span>
              )}
              {saveState === "idle" && (
                <span className="text-zinc-400" aria-hidden />
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg border-zinc-200"
              onClick={openPreview}
            >
              <Eye className="mr-1.5 size-4" />
              Preview
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg border-zinc-200"
              onClick={publish}
            >
              <Rocket className="mr-1.5 size-4" />
              Publish
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="rounded-lg shadow-sm"
              onClick={copyLink}
            >
              <Copy className="mr-1.5 size-4" />
              Copy link
            </Button>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="form-id-heading"
        className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <h2
              id="form-id-heading"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Form ID
            </h2>
            <p className="font-mono text-sm leading-relaxed text-zinc-900 break-all dark:text-zinc-100">
              {form.id}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Use this UUID in embeds, public URLs, and API calls.{" "}
              <Link
                href="/docs"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Developer docs
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg border-zinc-200"
              onClick={copyFormId}
            >
              <Copy className="mr-1.5 size-4" aria-hidden />
              Copy ID
            </Button>
            <Link
              href="/docs#form-id"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-lg border-zinc-200"
              )}
            >
              <BookOpen className="mr-1.5 size-4" aria-hidden />
              Docs
            </Link>
          </div>
        </div>
      </section>

      <div className="grid flex-1 gap-8 xl:grid-cols-2 xl:gap-10">
        {/* Left: field list */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Fields
              </h2>
              <p className="mt-0.5 text-sm text-zinc-600">
                Drag to reorder. Edits save automatically.
              </p>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger
                className={cn(
                  buttonVariants(),
                  "rounded-xl shadow-md shadow-indigo-500/15 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <Plus className="mr-2 size-4" />
                Add field
              </DialogTrigger>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <form onSubmit={addField}>
                  <DialogHeader>
                    <DialogTitle>Add field</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="label">Label</Label>
                      <Input
                        id="label"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field type</Label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {FIELD_TYPES.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setNewType(t.value)}
                            className={cn(
                              "rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                              newType === t.value
                                ? "border-indigo-500 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500/30"
                                : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="new-req"
                        checked={newRequired}
                        onCheckedChange={(c) => setNewRequired(Boolean(c))}
                      />
                      <Label htmlFor="new-req" className="font-normal">
                        Required
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="rounded-xl">
                      Add field
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {sortedFields.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-20 text-center"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
                <Plus className="size-7 text-zinc-400" />
              </div>
              <p className="mt-6 text-lg font-semibold text-zinc-900">
                Start building your form
              </p>
              <p className="mt-2 max-w-sm text-sm text-zinc-600">
                Add fields on the left — your live preview updates on the right.
              </p>
              <Button
                type="button"
                className="mt-8 rounded-xl"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="mr-2 size-4" />
                Add your first field
              </Button>
            </motion.div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragCancel={() => setActiveDragId(null)}
            >
              <SortableContext
                items={sortedFields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  {sortedFields.map((field) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SortableField
                        field={field}
                        onUpdate={onUpdate}
                        onRemove={onRemove}
                        autoFocusLabel={focusFieldId === field.id}
                      />
                    </motion.div>
                  ))}
                </div>
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                {activeField ? <DragPreview field={activeField} /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {/* Right: live preview */}
        <div className="xl:sticky xl:top-28 xl:h-fit">
          <FormPreviewPanel formName={formName} fields={sortedFields} />
        </div>
      </div>
    </div>
  );
}
