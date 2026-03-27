"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";

type Props = {
  fieldId: string;
  options: string[] | null | undefined;
  onChange: (options: string[]) => void;
};

/** Editable list of select options with add/remove — persists cleaned values on blur / add/remove */
export function SelectOptionsEditor({ fieldId, options, onChange }: Props) {
  const [rows, setRows] = useState<string[]>(() =>
    options && options.length > 0 ? [...options] : [""]
  );

  useEffect(() => {
    setRows(options && options.length > 0 ? [...options] : [""]);
  }, [fieldId, options]);

  function commit(next: string[]) {
    const cleaned = next.map((s) => s.trim()).filter(Boolean);
    onChange(cleaned.length > 0 ? cleaned : ["Option A"]);
  }

  function updateRow(index: number, value: string) {
    const next = [...rows];
    next[index] = value;
    setRows(next);
  }

  function blurRow(index: number) {
    const next = [...rows];
    next[index] = next[index].trim();
    setRows(next);
    commit(next);
  }

  function addRow() {
    const next = [...rows, ""];
    setRows(next);
  }

  function removeRow(index: number) {
    if (rows.length <= 1) {
      setRows([""]);
      commit([""]);
      return;
    }
    const next = rows.filter((_, i) => i !== index);
    setRows(next);
    commit(next);
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <Label className="text-xs font-medium text-zinc-500">Options</Label>
      <p className="text-xs text-zinc-500">
        Add choices for this dropdown. Respondents pick one option.
      </p>
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div key={`${fieldId}-opt-${index}`} className="flex min-w-0 gap-2">
            <Input
              value={row}
              onChange={(e) => updateRow(index, e.target.value)}
              onBlur={() => blurRow(index)}
              placeholder={`Option ${index + 1}`}
              className="h-10 min-w-0 flex-1 rounded-lg border-zinc-200"
              aria-label={`Option ${index + 1}`}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 rounded-lg border-zinc-200"
              onClick={() => removeRow(index)}
              disabled={rows.length <= 1}
              aria-label="Remove option"
            >
              <Minus className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-fit rounded-lg"
          onClick={addRow}
        >
          <Plus className="mr-1.5 size-4" />
          Add option
        </Button>
      </div>
    </div>
  );
}
