"use client";

import Link from "next/link";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { BookOpen, ExternalLink } from "lucide-react";

type Props = {
  siteOrigin: string;
};

export function DocsPageClient({ siteOrigin }: Props) {
  const o = siteOrigin.replace(/\/$/, "");
  const placeholderId = "YOUR_FORM_ID";

  const htmlExample = `<script src="${o}/embed.js" async></script>
<div data-form-id="${placeholderId}"></div>`;

  const reactExample = `import { useEffect } from "react";

const EMBED_SCRIPT = "${o}/embed.js";

export function LeadAapForm({ formId }: { formId: string }) {
  useEffect(() => {
    const exists = document.querySelector(
      \`script[src="\${EMBED_SCRIPT}"]\`
    );
    if (exists) return;
    const s = document.createElement("script");
    s.src = EMBED_SCRIPT;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return <div data-form-id={formId} />;
}`;

  const angularExample = `// 1) Add the script once in index.html (before </body>):
// <script src="${o}/embed.js" async></script>

// 2) Component — only renders the placeholder:
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-leadaap-form",
  standalone: true,
  template:
    '<div [attr.data-form-id]="formId" class="leadaap-root"></div>',
})
export class LeadAapFormComponent {
  @Input({ required: true }) formId!: string;
}`;

  const wpExample = `<!-- Custom HTML block (or theme footer) -->
<script src="${o}/embed.js" async></script>
<div data-form-id="${placeholderId}"></div>`;

  const nav = [
    { href: "#quick-start", label: "Quick start" },
    { href: "#html", label: "HTML" },
    { href: "#react", label: "React" },
    { href: "#angular", label: "Angular" },
    { href: "#wordpress", label: "WordPress" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950">
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            <BookOpen className="size-4 text-blue-600" aria-hidden />
            Developer docs
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Dashboard
              <ExternalLink className="size-3.5 opacity-70" aria-hidden />
            </Link>
          </div>
        </div>
        <nav
          className="mx-auto max-w-3xl overflow-x-auto px-4 pb-3 sm:px-6"
          aria-label="On this page"
        >
          <ul className="flex min-w-0 gap-2 text-xs sm:flex-wrap sm:gap-3 sm:text-sm">
            {nav.map((item) => (
              <li key={item.href} className="shrink-0">
                <a
                  href={item.href}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-medium text-zinc-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-blue-600 dark:hover:text-blue-300"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl space-y-12 px-4 py-10 sm:space-y-16 sm:px-6 sm:py-14">
        <div className="space-y-3">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Embed
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Add forms to any website
          </h1>
          <p className="max-w-2xl text-pretty text-base text-zinc-600 dark:text-zinc-400">
            Load a tiny script, drop a <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-sm dark:bg-zinc-800">data-form-id</code>{" "}
            placeholder, and we render your form in an isolated iframe at{" "}
            <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-sm dark:bg-zinc-800">/embed/form/[formId]</code>{" "}
            with automatic height, theme detection, and optional modal mode. Full-page links still work at{" "}
            <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-sm dark:bg-zinc-800">/f/[formId]</code>.
          </p>
        </div>

        <section id="quick-start" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Quick start
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            <li>
              Open <strong>Forms</strong> in the dashboard and copy your form&apos;s public link or use{" "}
              <strong>Embed</strong> for a ready-made snippet.
            </li>
            <li>
              Replace <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">{placeholderId}</code>{" "}
              with your real form UUID.
            </li>
            <li>
              Paste the two lines (script + placeholder) into your page HTML — anywhere you want the form to appear.
            </li>
          </ol>
          <DocsCodeBlock
            title="Minimal embed"
            language="markup"
            code={htmlExample}
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Optional attributes on the placeholder:{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">data-min-height=&quot;520&quot;</code>{" "}
            (floor height while loading),{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">data-mode=&quot;modal&quot;</code>{" "}
            with{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">data-modal-label</code>{" "}
            for a trigger button + animated dialog,{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">data-width</code>{" "}
            for iframe width. On the script tag,{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">data-base-url</code>{" "}
            overrides the iframe origin when it differs from the script URL.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Analytics-style events from the iframe are mirrored to{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">window</code> as{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">leadaap-embed</code>{" "}
            custom events (payload in <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">event.detail</code>
            ; use <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">detail.kind === &quot;analytics&quot;</code>
            ). The iframe also uses{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">postMessage</code> with{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">source: &quot;leadaap-embed&quot;</code> for{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">resize</code>,{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">ready</code>,{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">error</code>, and{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">analytics</code>.
          </p>
        </section>

        <section id="html" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Plain HTML
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Works on static sites, landing pages, and any template that allows a{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">&lt;script&gt;</code> and{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">&lt;div&gt;</code>.
          </p>
          <DocsCodeBlock title="index.html" language="markup" code={htmlExample} />
        </section>

        <section id="react" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            React
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Inject the script once on mount; render the placeholder with your form id. Safe for SSR: the script only runs in the browser inside{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">useEffect</code>.
          </p>
          <DocsCodeBlock title="LeadAapForm.tsx" language="tsx" code={reactExample} />
        </section>

        <section id="angular" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Angular
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Add the script globally once (e.g. <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">index.html</code>), then bind{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">data-form-id</code> from your component input.
          </p>
          <DocsCodeBlock title="app component" language="typescript" code={angularExample} />
        </section>

        <section id="wordpress" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            WordPress
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            <li>Edit the page or post where the form should appear.</li>
            <li>
              Add a <strong>Custom HTML</strong> block (Block Editor) or paste into your theme template / widget area.
            </li>
            <li>Paste the snippet below. Use your form UUID from the LeadAap dashboard.</li>
            <li>
              If your host strips <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">&lt;script&gt;</code> tags, add the script via a plugin such as &quot;Insert Headers and Footers&quot; and keep only the{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">div</code> in the page body.
            </li>
          </ol>
          <DocsCodeBlock title="Custom HTML block" language="markup" code={wpExample} />
        </section>

        <footer className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-500">
            <Link href="/" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              Back to LeadAap
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
