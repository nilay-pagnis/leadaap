/** Messages from iframe → parent (`embed.js` and host listeners). */

export const EMBED_MESSAGE_SOURCE = "leadaap-embed" as const;

/** Iframe → `EmbedFormPage` bridge (maps to postMessage). */
export type EmbedBridgeEvent =
  | { kind: "ready" }
  | { kind: "error"; message: string }
  | { kind: "analytics"; name: string; detail?: Record<string, unknown> };

export type EmbedMessageKind = "resize" | "ready" | "error" | "analytics";

export type EmbedMessageToParent =
  | {
      source: typeof EMBED_MESSAGE_SOURCE;
      kind: "resize";
      height: number;
      formId: string;
    }
  | {
      source: typeof EMBED_MESSAGE_SOURCE;
      kind: "ready" | "error";
      formId: string;
      message?: string;
    }
  | {
      source: typeof EMBED_MESSAGE_SOURCE;
      kind: "analytics";
      formId: string;
      name: string;
      detail?: Record<string, unknown>;
    };

export function postToParent(data: EmbedMessageToParent) {
  if (typeof window === "undefined" || window.parent === window) return;
  try {
    window.parent.postMessage(data, "*");
  } catch {
    /* ignore */
  }
}

export const EMBED_WINDOW_EVENT = "leadaap-embed" as const;
