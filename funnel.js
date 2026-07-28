/* Telegram funnel popup — delay 5s, auto-close 5s, dismiss with X.
   Dipakai di home (index) dan halaman /saham|/rilis via share.js. */
(function () {
  "use strict";
  if (window.__lotmetrikTgFunnel) return;
  window.__lotmetrikTgFunnel = true;

  var KEY = "lotmetrik-tg-funnel-v1";
  var TG = "https://t.me/lotmetrik";
  var SHOW_AFTER_MS = 5000;
  var AUTO_CLOSE_MS = 5000;

  try {
    if (sessionStorage.getItem(KEY) === "1") return;
  } catch (e) {}

  function track(name) {
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", name, { event_category: "funnel", event_label: "telegram" });
      }
      if (typeof window.clarity === "function") {
        window.clarity("event", name);
      }
    } catch (err) {}
  }

  function markDone() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch (e) {}
  }

  var style = document.createElement("style");
  style.textContent =
    "#lm-tg-funnel{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-end;justify-content:center;" +
    "padding:16px;padding-bottom:max(16px,env(safe-area-inset-bottom));background:rgba(6,18,31,.45);" +
    "opacity:0;pointer-events:none;transition:opacity .2s ease}" +
    "#lm-tg-funnel.on{opacity:1;pointer-events:auto}" +
    "#lm-tg-funnel .lm-card{width:min(420px,100%);background:var(--surface,#fff);color:var(--text,#0B1F3A);" +
    "border:1px solid var(--border,#D7DEE7);border-radius:12px;box-shadow:0 8px 24px rgba(11,31,58,.16);" +
    "padding:16px 16px 14px;transform:translateY(10px);transition:transform .2s ease;font-family:var(--font-sans,Plus Jakarta Sans,system-ui,sans-serif)}" +
    "#lm-tg-funnel.on .lm-card{transform:translateY(0)}" +
    "#lm-tg-funnel .lm-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}" +
    "#lm-tg-funnel .lm-title{margin:0;font-size:16px;font-weight:800;letter-spacing:-.01em;line-height:1.3}" +
    "#lm-tg-funnel .lm-sub{margin:6px 0 0;font-size:13px;line-height:1.45;color:var(--text-secondary,#44566B)}" +
    "#lm-tg-funnel .lm-x{flex:none;width:36px;height:36px;border:none;border-radius:8px;background:transparent;" +
    "color:var(--text-muted,#5F7186);cursor:pointer;display:grid;place-items:center}" +
    "#lm-tg-funnel .lm-x:hover{background:var(--surface-2,#F5F7FA);color:var(--text,#0B1F3A)}" +
    "#lm-tg-funnel .lm-x:focus-visible{outline:2px solid var(--accent,#0F9488);outline-offset:2px}" +
    "#lm-tg-funnel .lm-acts{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}" +
    "#lm-tg-funnel .lm-cta{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;" +
    "padding:0 16px;border-radius:8px;background:var(--accent,#0F9488);color:var(--on-accent,#fff);" +
    "font-weight:700;font-size:14px;text-decoration:none;border:none;cursor:pointer}" +
    "#lm-tg-funnel .lm-cta:hover{background:var(--accent-hover,#0D7A70)}" +
    "#lm-tg-funnel .lm-cta:focus-visible{outline:2px solid var(--accent,#0F9488);outline-offset:2px}" +
    "#lm-tg-funnel .lm-skip{min-height:44px;padding:0 12px;border:none;background:transparent;" +
    "color:var(--text-muted,#5F7186);font-size:13px;font-weight:600;cursor:pointer;border-radius:8px}" +
    "#lm-tg-funnel .lm-skip:hover{color:var(--text,#0B1F3A)}" +
    "@media(min-width:640px){#lm-tg-funnel{align-items:center}}";
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.id = "lm-tg-funnel";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-labelledby", "lm-tg-title");
  root.setAttribute("aria-describedby", "lm-tg-sub");
  root.innerHTML =
    '<div class="lm-card">' +
    '<div class="lm-top">' +
    "<div>" +
    '<p class="lm-title" id="lm-tg-title">Gabung Telegram Lotmetrik</p>' +
    '<p class="lm-sub" id="lm-tg-sub">Update saham syariah dan edukasi IHSG. Gratis, tanpa spam jual.</p>' +
    "</div>" +
    '<button type="button" class="lm-x" id="lm-tg-x" aria-label="Tutup">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
    "</button>" +
    "</div>" +
    '<div class="lm-acts">' +
    '<a class="lm-cta" id="lm-tg-cta" href="' +
    TG +
    '" target="_blank" rel="noopener">Buka Telegram</a>' +
    '<button type="button" class="lm-skip" id="lm-tg-skip">Nanti saja</button>' +
    "</div>" +
    "</div>";
  document.body.appendChild(root);

  var autoTimer = null;
  var closed = false;

  function close(reason) {
    if (closed) return;
    closed = true;
    root.classList.remove("on");
    markDone();
    track("telegram_funnel_" + reason);
    if (autoTimer) clearTimeout(autoTimer);
    setTimeout(function () {
      if (root.parentNode) root.parentNode.removeChild(root);
    }, 220);
  }

  function open() {
    if (closed) return;
    root.classList.add("on");
    track("telegram_funnel_show");
    autoTimer = setTimeout(function () {
      close("auto");
    }, AUTO_CLOSE_MS);
  }

  root.querySelector("#lm-tg-x").addEventListener("click", function () {
    close("dismiss");
  });
  root.querySelector("#lm-tg-skip").addEventListener("click", function () {
    close("skip");
  });
  root.querySelector("#lm-tg-cta").addEventListener("click", function () {
    track("telegram_funnel_click");
    markDone();
  });
  root.addEventListener("click", function (ev) {
    if (ev.target === root) close("backdrop");
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && root.classList.contains("on")) close("escape");
  });

  setTimeout(open, SHOW_AFTER_MS);
})();
