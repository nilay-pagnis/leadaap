"use client";

import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  code: string;
  /** Prism language id (e.g. markup, jsx, tsx, typescript, bash) */
  language: string;
  title?: string;
  className?: string;
};

export function DocsCodeBlock({ code, language, title, className }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-900/50 px-3 py-2 sm:px-4">
        {title ? (
          <span className="text-xs font-medium text-zinc-400">{title}</span>
        ) : (
          <span className="text-xs text-zinc-600">Snippet</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-zinc-400 hover:text-zinc-100"
          onClick={() => void copy()}
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="size-4 text-emerald-400" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Highlight
          prism={Prism}
          theme={themes.nightOwl}
          code={code.trim()}
          language={language}
        >
          {({ className: preClass, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={cn(
                preClass,
                "!m-0 !bg-transparent p-3 text-[13px] leading-relaxed sm:p-4 sm:text-sm"
              )}
              style={style}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
