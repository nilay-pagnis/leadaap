/** Build the standard two-line embed snippet for a form. */
export function buildEmbedSnippet(
  origin: string,
  formId: string,
  options?: { minHeight?: number }
): string {
  const base = origin.replace(/\/$/, "");
  const script = `<script src="${base}/embed.js" async></script>`;
  const min = options?.minHeight;
  const div =
    min != null && min > 0
      ? `<div data-form-id="${formId}" data-min-height="${min}"></div>`
      : `<div data-form-id="${formId}"></div>`;
  return `${script}\n${div}`;
}
