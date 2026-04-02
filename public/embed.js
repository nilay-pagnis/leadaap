/**
 * LeadAap embed — loads public forms in an isolated iframe at /embed/form/[id].
 *
 * Usage:
 *   <script src="https://YOUR_DOMAIN/embed.js" async></script>
 *   <div data-form-id="YOUR_FORM_UUID"></div>
 *
 * Placeholder:
 *   data-form-id      (required) Form UUID
 *   data-mode         "inline" (default) | "modal"
 *   data-min-height   Min iframe height in px (default 480)
 *   data-width        CSS width for iframe (default 100%)
 *   data-modal-label  Button label when data-mode="modal" (default "Open form")
 *
 * Script tag:
 *   data-base-url     Override origin for iframe (e.g. CDN or different subdomain)
 *
 * Parent page can listen for analytics / lifecycle:
 *   window.addEventListener("leadaap-embed", function (e) { console.log(e.detail); });
 *
 * Iframe postMessage protocol (event.data):
 *   { source: "leadaap-embed", kind: "resize", height, formId }
 *   { source: "leadaap-embed", kind: "ready" | "error", formId, message? }
 *   { source: "leadaap-embed", kind: "analytics", formId, name, detail? }
 */
(function () {
  var MSG_SOURCE = "leadaap-embed";
  var WIN_EVENT = "leadaap-embed";
  var SELECTOR = "[data-form-id]";

  var messageBound = false;

  function findEmbedScript() {
    var scripts = document.getElementsByTagName("script");
    var i;
    for (i = scripts.length - 1; i >= 0; i--) {
      var s = scripts[i];
      if (!s.src) continue;
      if (/\/embed\.js(\?|#|$)/.test(s.src)) {
        return s;
      }
    }
    return null;
  }

  function resolveBaseUrl() {
    var s = findEmbedScript();
    if (s) {
      var override = s.getAttribute("data-base-url");
      if (override) {
        return override.replace(/\/$/, "");
      }
      try {
        return new URL(s.src).origin;
      } catch (e) {}
    }
    if (typeof window !== "undefined" && window.location && window.location.origin) {
      return window.location.origin;
    }
    return "";
  }

  function resolveThemeQuery() {
    try {
      if (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      }
    } catch (e) {}
    return "light";
  }

  function buildIframeSrc(baseUrl, formId) {
    var theme = resolveThemeQuery();
    return (
      baseUrl +
      "/embed/form/" +
      encodeURIComponent(formId) +
      "?theme=" +
      encodeURIComponent(theme)
    );
  }

  function relayToHost(data) {
    try {
      if (typeof window !== "undefined" && window.CustomEvent) {
        window.dispatchEvent(new CustomEvent(WIN_EVENT, { detail: data }));
      }
    } catch (e) {}
  }

  function bindGlobalMessages() {
    if (messageBound) return;
    messageBound = true;
    window.addEventListener("message", function (ev) {
      var d = ev.data;
      if (!d || d.source !== MSG_SOURCE) return;
      if (d.kind === "analytics") {
        relayToHost(d);
      }
    });
  }

  function applyIframeSize(iframe, minH, height) {
    var h = Math.max(minH, Math.ceil(height || minH));
    iframe.style.height = h + "px";
    iframe.style.overflow = "hidden";
  }

  function createIframe(baseUrl, formId, minH, width) {
    var iframe = document.createElement("iframe");
    iframe.src = buildIframeSrc(baseUrl, formId);
    iframe.title = "LeadAap form";
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.setAttribute("sandbox", "allow-scripts allow-forms allow-same-origin");
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.style.width = width.indexOf("%") !== -1 ? width : "100%";
    iframe.style.maxWidth = "100%";
    applyIframeSize(iframe, minH, minH);
    return iframe;
  }

  function wireIframeMessages(wrap, iframe, formId, minH) {
    bindGlobalMessages();
    function onMsg(ev) {
      if (ev.source !== iframe.contentWindow) return;
      var d = ev.data;
      if (!d || d.source !== MSG_SOURCE || d.formId !== formId) return;
      if (d.kind === "resize" && typeof d.height === "number") {
        applyIframeSize(iframe, minH, d.height);
        return;
      }
      if (d.kind === "ready") {
        wrap.classList.remove("leadaap-embed--loading");
        return;
      }
      if (d.kind === "error") {
        wrap.classList.remove("leadaap-embed--loading");
        applyIframeSize(iframe, minH, minH);
        return;
      }
    }
    window.addEventListener("message", onMsg);
    return function () {
      window.removeEventListener("message", onMsg);
    };
  }

  function injectModalStyles() {
    if (document.getElementById("leadaap-embed-modal-styles")) return;
    var css =
      ".leadaap-embed-modal-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,0.45);opacity:0;transition:opacity 0.25s ease;backdrop-filter:blur(4px);}" +
      ".leadaap-embed-modal-overlay.leadaap-embed-modal-open{opacity:1;}" +
      ".leadaap-embed-modal-panel{position:fixed;left:50%;top:50%;z-index:2147483001;transform:translate(-50%,-48%) scale(0.96);opacity:0;transition:opacity 0.25s ease,transform 0.28s cubic-bezier(0.22,1,0.36,1);width:min(100vw - 24px,520px);max-height:min(90vh,720px);border-radius:16px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);background:#fff;}" +
      ".leadaap-embed-modal-panel.leadaap-embed-modal-open{opacity:1;transform:translate(-50%,-50%) scale(1);}" +
      "@media (prefers-color-scheme: dark){.leadaap-embed-modal-panel{background:#18181b;}}" +
      ".leadaap-embed-modal-close{position:absolute;right:10px;top:10px;z-index:2;width:36px;height:36px;border:0;border-radius:10px;background:rgba(0,0,0,0.06);cursor:pointer;font-size:20px;line-height:1;color:#334155;}" +
      "@media (prefers-color-scheme: dark){.leadaap-embed-modal-close{background:rgba(255,255,255,0.08);color:#e2e8f0;}}" +
      ".leadaap-embed-modal-iframe{width:100%;border:0;display:block;min-height:400px;}";
    var style = document.createElement("style");
    style.id = "leadaap-embed-modal-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function openModal(baseUrl, formId, minH, width, buttonLabel) {
    injectModalStyles();
    relayToHost({
      source: MSG_SOURCE,
      kind: "analytics",
      formId: formId,
      name: "modal_open",
    });

    var overlay = document.createElement("div");
    overlay.className = "leadaap-embed-modal-overlay";
    overlay.setAttribute("role", "presentation");

    var panel = document.createElement("div");
    panel.className = "leadaap-embed-modal-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", buttonLabel || "Form");

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "leadaap-embed-modal-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = "&times;";

    var iframe = createIframe(baseUrl, formId, minH, "100%");
    iframe.className = "leadaap-embed-modal-iframe";

    panel.appendChild(closeBtn);
    panel.appendChild(iframe);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    var unwire = wireIframeMessages(panel, iframe, formId, minH);
    panel.classList.add("leadaap-embed--loading");

    function close() {
      relayToHost({
        source: MSG_SOURCE,
        kind: "analytics",
        formId: formId,
        name: "modal_close",
      });
      overlay.classList.remove("leadaap-embed-modal-open");
      panel.classList.remove("leadaap-embed-modal-open");
      window.removeEventListener("keydown", onKey);
      setTimeout(function () {
        unwire();
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 280);
    }

    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    }

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    window.addEventListener("keydown", onKey);

    requestAnimationFrame(function () {
      overlay.classList.add("leadaap-embed-modal-open");
      panel.classList.add("leadaap-embed-modal-open");
    });
  }

  function mountInline(el, baseUrl, formId, minH, width) {
    var wrap = document.createElement("div");
    wrap.className = "leadaap-embed leadaap-embed--loading";
    wrap.style.width = "100%";
    wrap.style.maxWidth = "100%";
    wrap.style.margin = "0 auto";
    wrap.style.overflow = "hidden";

    var iframe = createIframe(baseUrl, formId, minH, width);
    wrap.appendChild(iframe);

    el.innerHTML = "";
    el.appendChild(wrap);

    wireIframeMessages(wrap, iframe, formId, minH);
  }

  function mountModal(el, baseUrl, formId, minH, width, buttonLabel) {
    var label =
      buttonLabel && buttonLabel.length
        ? buttonLabel
        : "Open form";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.style.cssText =
      "cursor:pointer;border-radius:12px;border:1px solid #c7d2fe;background:#4f46e5;color:#fff;font-size:15px;font-weight:600;padding:12px 20px;font-family:inherit;";
    btn.addEventListener("click", function () {
      openModal(baseUrl, formId, minH, width, label);
    });
    el.innerHTML = "";
    el.appendChild(btn);
  }

  function mount(el, baseUrl) {
    var formId = el.getAttribute("data-form-id");
    if (!formId) return;

    var minH = parseInt(el.getAttribute("data-min-height") || "480", 10);
    if (!minH || minH < 200) minH = 480;

    var widthAttr = el.getAttribute("data-width");
    var width = widthAttr && widthAttr.length ? widthAttr : "100%";

    var mode = (el.getAttribute("data-mode") || "inline").toLowerCase();
    var modalLabel = el.getAttribute("data-modal-label") || "";

    bindGlobalMessages();

    if (mode === "modal") {
      mountModal(el, baseUrl, formId, minH, width, modalLabel);
    } else {
      mountInline(el, baseUrl, formId, minH, width);
    }
  }

  function init() {
    var baseUrl = resolveBaseUrl();
    var nodes = document.querySelectorAll(SELECT);
    var i;
    for (i = 0; i < nodes.length; i++) {
      mount(nodes[i], baseUrl);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
