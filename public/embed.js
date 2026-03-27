/**
 * LeadAap embed — loads public forms in a responsive iframe.
 * Usage:
 *   <script src="https://YOUR_DOMAIN/embed.js" async></script>
 *   <div data-form-id="YOUR_FORM_UUID"></div>
 *
 * Optional on the script tag:
 *   data-base-url="https://YOUR_DOMAIN"  (override iframe origin)
 *
 * Optional on the placeholder:
 *   data-min-height="520"   (default 480)
 *   data-width="100%"       (default 100%)
 */
(function () {
  var SELECTOR = "[data-form-id]";

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

  var baseUrl = resolveBaseUrl();

  function mount(el) {
    var formId = el.getAttribute("data-form-id");
    if (!formId) return;

    var minH = parseInt(el.getAttribute("data-min-height") || "480", 10);
    if (!minH || minH < 200) minH = 480;

    var widthAttr = el.getAttribute("data-width");
    var width = widthAttr && widthAttr.length ? widthAttr : "100%";

    var wrap = document.createElement("div");
    wrap.className = "leadaap-embed";
    wrap.style.width = "100%";
    wrap.style.maxWidth = "100%";
    wrap.style.margin = "0 auto";

    var iframe = document.createElement("iframe");
    iframe.src = baseUrl + "/f/" + encodeURIComponent(formId);
    iframe.title = "LeadAap form";
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.style.width = width.indexOf("%") !== -1 ? width : "100%";
    iframe.style.maxWidth = "100%";
    iframe.style.minHeight = minH + "px";

    wrap.appendChild(iframe);

    el.innerHTML = "";
    el.appendChild(wrap);
  }

  function init() {
    var nodes = document.querySelectorAll(SELECT);
    var i;
    for (i = 0; i < nodes.length; i++) {
      mount(nodes[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
