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

export function EnquireoForm({ formId }: { formId: string }) {
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
  selector: "app-enquireo-form",
  standalone: true,
  template:
    '<div [attr.data-form-id]="formId" class="enquireo-root"></div>',
})
export class EnquireoFormComponent {
  @Input({ required: true }) formId!: string;
}`;

  const wpExample = `<!-- Custom HTML block (or theme footer) -->
<script src="${o}/embed.js" async></script>
<div data-form-id="${placeholderId}"></div>`;

  const formIdUrlsExample = `# Full-page form (shareable link)
${o}/f/${placeholderId}

# Embedded iframe URL (used by embed.js)
${o}/embed/form/${placeholderId}`;

  const apiGetCurl = `curl -sS "${o}/api/public/forms/${placeholderId}"`;

  const apiPostCurl = `curl -sS -X POST "${o}/api/public/submit-lead" \\
  -H "Content-Type: application/json" \\
  -d '{
  "form_id": "${placeholderId}",
  "data": {
    "field_uuid_from_get_response": "Jane Doe",
    "another_field_uuid": "jane@example.com"
  }
}'`;

  const apiPostFetch = `const res = await fetch("${o}/api/public/submit-lead", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    form_id: "${placeholderId}",
    data: {
      // Keys must be field \`id\` values from GET /api/public/forms/{formId}
    },
  }),
});

if (!res.ok) {
  const err = await res.json().catch(() => ({}));
  throw new Error(err.error ?? res.statusText);
}

const body = await res.json(); // { ok: true } on success`;

  const nav = [
    { href: "#introduction", label: "Introduction" },
    { href: "#embed-script", label: "Embed script" },
    { href: "#form-id", label: "Form ID" },
    { href: "#api", label: "API" },
  ];

  const embedSubNav = [
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
            Developer documentation
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
            Enquireo for developers
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Integrate enquiry forms anywhere
          </h1>
          <p className="max-w-2xl text-pretty text-base text-zinc-600 dark:text-zinc-400">
            Embed a hosted form with one script tag, or call our public HTTP API to build custom
            UIs. Every form has a stable <strong>Form ID</strong> (UUID) — copy it from the form
            editor in the dashboard.
          </p>
        </div>

        <section id="introduction" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Introduction
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Enquireo captures leads into your workspace inbox. Developers typically integrate in one
            of three ways: <strong>JavaScript embed</strong> (iframe + auto-resize), a{" "}
            <strong>public link</strong> to the full-page form, or a <strong>custom front-end</strong>{" "}
            that loads field definitions via GET and submits JSON via POST.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            <li>
              <strong>Form ID</strong> — permanent identifier for a form; required for all
              integration paths.
            </li>
            <li>
              <strong>No API keys for public submit</strong> — endpoints are unauthenticated; use
              only from trusted front-ends and respect rate limits.
            </li>
            <li>
              <strong>Field keys</strong> — submission JSON uses each field&apos;s{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">id</code>{" "}
              from the metadata API, not the label text.
            </li>
          </ul>
        </section>

        <section id="embed-script" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Embed script
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Load a tiny script, drop a{" "}
              <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
                data-form-id
              </code>{" "}
              placeholder, and we render your form in an isolated iframe at{" "}
              <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
                /embed/form/[formId]
              </code>{" "}
              with automatic height, theme detection, and optional modal mode. Full-page links still
              work at{" "}
              <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
                /f/[formId]
              </code>
              .
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs sm:text-sm">
              {embedSubNav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div id="quick-start" className="scroll-mt-24 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Quick start</h3>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              <li>
                Open <strong>Forms</strong> in the dashboard, open your form, and copy the{" "}
                <strong>Form ID</strong> (or use <strong>Copy link</strong> / embed from the UI).
              </li>
              <li>
                Replace{" "}
                <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                  {placeholderId}
                </code>{" "}
                with your real form UUID.
              </li>
              <li>
                Paste the two lines (script + placeholder) into your page HTML — anywhere you want
                the form to appear.
              </li>
            </ol>
            <DocsCodeBlock title="Minimal embed" language="markup" code={htmlExample} />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Optional attributes on the placeholder:{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                data-min-height=&quot;520&quot;
              </code>{" "}
              (floor height while loading),{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                data-mode=&quot;modal&quot;
              </code>{" "}
              with{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                data-modal-label
              </code>{" "}
              for a trigger button + animated dialog,{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                data-width
              </code>{" "}
              for iframe width. On the script tag,{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                data-base-url
              </code>{" "}
              overrides the iframe origin when it differs from the script URL.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Analytics-style events from the iframe are mirrored to{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                window
              </code>{" "}
              as{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                enquireo-embed
              </code>{" "}
              custom events (payload in{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                event.detail
              </code>
              ; use{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                detail.kind === &quot;analytics&quot;
              </code>
              ). The iframe also uses{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                postMessage
              </code>{" "}
              with{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                source: &quot;enquireo-embed&quot;
              </code>{" "}
              for{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                resize
              </code>
              ,{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                ready
              </code>
              ,{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                error
              </code>
              , and{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                analytics
              </code>
              .
            </p>
          </div>

          <section id="html" className="scroll-mt-24 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Plain HTML</h3>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Works on static sites, landing pages, and any template that allows a{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                &lt;script&gt;
              </code>{" "}
              and{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                &lt;div&gt;
              </code>
              .
            </p>
            <DocsCodeBlock title="index.html" language="markup" code={htmlExample} />
          </section>

          <section id="react" className="scroll-mt-24 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">React</h3>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Inject the script once on mount; render the placeholder with your form id. Safe for
              SSR: the script only runs in the browser inside{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                useEffect
              </code>
              .
            </p>
            <DocsCodeBlock title="EnquireoForm.tsx" language="tsx" code={reactExample} />
          </section>

          <section id="angular" className="scroll-mt-24 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Angular</h3>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Add the script globally once (e.g.{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                index.html
              </code>
              ), then bind{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                data-form-id
              </code>{" "}
              from your component input.
            </p>
            <DocsCodeBlock title="app component" language="typescript" code={angularExample} />
          </section>

          <section id="wordpress" className="scroll-mt-24 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">WordPress</h3>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              <li>Edit the page or post where the form should appear.</li>
              <li>
                Add a <strong>Custom HTML</strong> block (Block Editor) or paste into your theme
                template / widget area.
              </li>
              <li>Paste the snippet below. Use your form UUID from the Enquireo dashboard.</li>
              <li>
                If your host strips{" "}
                <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                  &lt;script&gt;
                </code>{" "}
                tags, add the script via a plugin such as &quot;Insert Headers and Footers&quot; and
                keep only the{" "}
                <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                  div
                </code>{" "}
                in the page body.
              </li>
            </ol>
            <DocsCodeBlock title="Custom HTML block" language="markup" code={wpExample} />
          </section>
        </section>

        <section id="form-id" className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Form ID usage</h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            The Form ID is a UUID that identifies your form across Enquireo. Find it on the form
            detail page in the dashboard (with a copy button), then use it in URLs, embed
            placeholders, and API paths.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            <li>
              <strong>Public page</strong> —{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                /f/[formId]
              </code>
            </li>
            <li>
              <strong>Embed iframe</strong> —{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                /embed/form/[formId]
              </code>{" "}
              (normally loaded by <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">embed.js</code>)
            </li>
            <li>
              <strong>Embed placeholder</strong> —{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                &lt;div data-form-id=&quot;…&quot;&gt;
              </code>
            </li>
            <li>
              <strong>REST API</strong> — substitute into{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                /api/public/forms/[formId]
              </code>{" "}
              and the <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">form_id</code>{" "}
              field in POST bodies (see below).
            </li>
          </ul>
          <DocsCodeBlock title="Example URLs" language="bash" code={formIdUrlsExample} />
        </section>

        <section id="api" className="scroll-mt-24 space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">API reference</h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Public endpoints accept JSON and return JSON. Errors use{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
              {`{ "error": "…" }`}
            </code>{" "}
            (and sometimes a <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">code</code> field).
            Heavy traffic may receive HTTP 429 (rate limited).
          </p>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              GET — form metadata
            </h3>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Returns the form name, optional company name, and field definitions (including each
              field&apos;s <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">id</code> for building{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">data</code> for POST).
            </p>
            <DocsCodeBlock title="cURL" language="bash" code={apiGetCurl} />
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              POST — submit lead
            </h3>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Body must include <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">form_id</code> and{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">data</code>. Keys in{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">data</code> are field UUIDs from
              the GET response. Optional top-level <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">source</code> and{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">plan</code> strings are stored as
              attribution on the lead. Success response:{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">{`{ "ok": true }`}</code>.
            </p>
            <DocsCodeBlock title="cURL" language="bash" code={apiPostCurl} />
            <DocsCodeBlock title="fetch (browser or Node 18+)" language="typescript" code={apiPostFetch} />
          </div>
        </section>

        <footer className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-500">
            <Link
              href="/"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Back to Enquireo
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
