"use client";

import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { StepForm } from "@/components/form/StepForm";
import {
  EMBED_MESSAGE_SOURCE,
  postToParent,
  type EmbedBridgeEvent,
  type EmbedMessageToParent,
} from "@/lib/embed/post-message";

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): T {
  let t: ReturnType<typeof setTimeout> | undefined;
  return ((...args: unknown[]) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function EmbedFormPage({ formId }: { formId: string }) {
  const searchParams = useSearchParams();
  const { setTheme } = useTheme();

  useEffect(() => {
    const raw = searchParams.get("theme");
    if (raw === "light" || raw === "dark" || raw === "system") {
      setTheme(raw);
    }
  }, [searchParams, setTheme]);

  const emitResize = useCallback(() => {
    const h = Math.ceil(
      document.documentElement?.scrollHeight ??
        document.body?.scrollHeight ??
        0
    );
    if (h < 120) return;
    postToParent({
      source: EMBED_MESSAGE_SOURCE,
      kind: "resize",
      height: h,
      formId,
    } satisfies EmbedMessageToParent);
  }, [formId]);

  const emitResizeDebounced = useMemo(
    () => debounce(() => emitResize(), 80),
    [emitResize]
  );

  useEffect(() => {
    const ro = new ResizeObserver(() => emitResizeDebounced());
    ro.observe(document.documentElement);
    const onWin = () => emitResizeDebounced();
    window.addEventListener("resize", onWin);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWin);
    };
  }, [emitResizeDebounced]);

  useEffect(() => {
    const t = setTimeout(() => emitResize(), 0);
    return () => clearTimeout(t);
  }, [emitResize]);

  const onEmbedEvent = useCallback(
    (event: EmbedBridgeEvent) => {
      if (event.kind === "ready") {
        postToParent({
          source: EMBED_MESSAGE_SOURCE,
          kind: "ready",
          formId,
        });
        queueMicrotask(() => emitResize());
        return;
      }
      if (event.kind === "error") {
        postToParent({
          source: EMBED_MESSAGE_SOURCE,
          kind: "error",
          formId,
          message: event.message,
        });
        queueMicrotask(() => emitResize());
        return;
      }
      postToParent({
        source: EMBED_MESSAGE_SOURCE,
        kind: "analytics",
        formId,
        name: event.name,
        detail: event.detail,
      });
    },
    [formId, emitResize]
  );

  return (
    <div className="min-h-0 w-full min-w-0 bg-background">
      <StepForm formId={formId} variant="embed" onEmbedEvent={onEmbedEvent} />
    </div>
  );
}
