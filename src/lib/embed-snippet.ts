function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

/** Build the standard two-line embed snippet for a form. */
export function buildEmbedSnippet(
  origin: string,
  formId: string,
  options?: {
    minHeight?: number;
    mode?: "inline" | "modal";
    modalLabel?: string;
  }
): string {
  const base = origin.replace(/\/$/, "");
  const script = `<script src="${base}/embed.js" async></script>`;
  const attrs = [`data-form-id="${formId}"`];
  const min = options?.minHeight;
  if (min != null && min > 0) {
    attrs.push(`data-min-height="${min}"`);
  }
  if (options?.mode === "modal") {
    attrs.push(`data-mode="modal"`);
    if (options.modalLabel?.trim()) {
      attrs.push(`data-modal-label="${escapeAttr(options.modalLabel.trim())}"`);
    }
  }
  const div = `<div ${attrs.join(" ")}></div>`;
  return `${script}\n${div}`;
}
