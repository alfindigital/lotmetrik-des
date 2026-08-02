/* Telegram funnel popup v3 — light, simple, subtle motifs.
   Delay 5s, ring countdown 10s. Sekali per SESI browser (bukan per halaman):
   sessionStorage di-set saat popup MUNCUL, jadi pindah halaman tidak muncul lagi. */
(function () {
  "use strict";
  if (window.__lotmetrikTgFunnel) return;
  window.__lotmetrikTgFunnel = true;

  var KEY = "lotmetrik-tg-funnel-v3";
  var TG = "https://t.me/lotmetrik";
  var SHOW_AFTER_MS = 5000;
  var COUNTDOWN_S = 10;

  try {
    if (sessionStorage.getItem(KEY) === "1") return;
  } catch (e) {}

  function track(name) {
    try {
      if (typeof window.gtag === "function")
        window.gtag("event", name, { event_category: "funnel", event_label: "telegram" });
      if (typeof window.clarity === "function")
        window.clarity("event", name);
    } catch (err) {}
  }

  function markDone() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch (e) {}
  }

  var css = document.createElement("style");
  css.textContent = [
    "#lm-tg{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;",
    "padding:20px;padding-bottom:max(20px,env(safe-area-inset-bottom));",
    "background:rgba(11,31,58,.28);opacity:0;pointer-events:none;transition:opacity .25s ease}",
    "#lm-tg.on{opacity:1;pointer-events:auto}",

    "#lm-tg .lm-c{width:min(420px,100%);background:#fff;color:#0B1F3A;",
    "border:1px solid #D7DEE7;border-radius:16px;",
    "box-shadow:0 12px 40px rgba(11,31,58,.14);padding:28px 24px 22px;",
    "transform:translateY(12px) scale(.97);transition:transform .28s cubic-bezier(.2,.6,.2,1);",
    "font-family:var(--font-sans,'Plus Jakarta Sans',system-ui,sans-serif);position:relative;overflow:hidden}",
    "#lm-tg.on .lm-c{transform:translateY(0) scale(1)}",

    /* soft motifs — dots + soft teal blob */
    "#lm-tg .lm-c::before{content:'';position:absolute;inset:0;pointer-events:none;",
    "background-image:radial-gradient(circle,#0F9488 1.2px,transparent 1.3px);",
    "background-size:22px 22px;background-position:8px 8px;opacity:.07}",
    "#lm-tg .lm-c::after{content:'';position:absolute;width:220px;height:220px;right:-80px;top:-90px;",
    "border-radius:50%;background:radial-gradient(circle,rgba(15,148,136,.12),transparent 70%);pointer-events:none}",

    "#lm-tg .lm-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;position:relative;z-index:2}",
    "#lm-tg .lm-icon{width:44px;height:44px;border-radius:12px;background:#CCFBF1;",
    "display:grid;place-items:center;flex:none;margin-bottom:14px}",
    "#lm-tg .lm-icon svg{width:22px;height:22px;color:#0F9488}",

    "#lm-tg .lm-ring{position:relative;width:36px;height:36px;flex:none;cursor:pointer}",
    "#lm-tg .lm-ring svg{width:36px;height:36px;transform:rotate(-90deg)}",
    "#lm-tg .lm-ring .lm-bg{fill:none;stroke:#D7DEE7;stroke-width:2.5}",
    "#lm-tg .lm-ring .lm-fg{fill:none;stroke:#0F9488;stroke-width:2.5;",
    "stroke-linecap:round;stroke-dasharray:100.5;stroke-dashoffset:0}",
    "#lm-tg .lm-ring .lm-xi{position:absolute;inset:0;display:grid;place-items:center}",
    "#lm-tg .lm-ring .lm-xi svg{width:14px;height:14px;color:#5F7186;transform:none}",
    "#lm-tg .lm-ring:hover .lm-xi svg{color:#0B1F3A}",

    "#lm-tg .lm-t{margin:0;font-size:20px;font-weight:800;letter-spacing:-.02em;line-height:1.25;position:relative;z-index:2}",
    "#lm-tg .lm-t .lm-hl{color:#0F9488}",
    "#lm-tg .lm-desc{margin:8px 0 0;font-size:14px;line-height:1.45;color:#44566B;position:relative;z-index:2}",

    "#lm-tg .lm-acts{display:flex;gap:10px;margin-top:20px;position:relative;z-index:2;flex-wrap:wrap}",
    "#lm-tg .lm-cta{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;",
    "padding:0 18px;border-radius:10px;background:#0F9488;color:#fff;",
    "font-weight:700;font-size:15px;text-decoration:none;border:none;cursor:pointer;",
    "transition:background .15s,transform .1s}",
    "#lm-tg .lm-cta:hover{background:#0D7A70}",
    "#lm-tg .lm-cta:active{transform:scale(.97)}",
    "#lm-tg .lm-cta:focus-visible{outline:2px solid #0F9488;outline-offset:3px}",
    "#lm-tg .lm-cta svg{width:18px;height:18px}",
    "#lm-tg .lm-skip{min-height:46px;padding:0 14px;border:1px solid #D7DEE7;background:transparent;",
    "color:#5F7186;font-size:14px;font-weight:600;cursor:pointer;border-radius:10px;",
    "transition:border-color .15s,color .15s}",
    "#lm-tg .lm-skip:hover{border-color:#B9C4D2;color:#0B1F3A}",

    "@media(max-width:480px){",
    "#lm-tg .lm-c{padding:22px 18px 16px;border-radius:14px}",
    "#lm-tg .lm-t{font-size:18px}",
    "#lm-tg .lm-acts{flex-direction:column}",
    "#lm-tg .lm-cta,#lm-tg .lm-skip{width:100%;justify-content:center}",
    "}"
  ].join("\n");
  document.head.appendChild(css);

  var el = document.createElement("div");
  el.id = "lm-tg";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-labelledby", "lm-tg-title");
  el.innerHTML =
    '<div class="lm-c">' +
    '<div class="lm-top">' +
    '<div class="lm-icon">' +
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 4.3L2.8 11.5c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.4.9 1 .9.6 0 .8-.3 1.1-.6l2.7-2.6 5.6 4.1c1 .6 1.8.3 2-.9l3.5-16.5c.4-1.5-.5-2.1-1.6-1.7zM9.3 14.7l-.2 3.3 1.1-2.2 8.7-7.8c.3-.3 0-.4-.4-.2L9.3 14.7z"/></svg>' +
    "</div>" +
    '<div class="lm-ring" id="lm-tg-x" role="button" aria-label="Tutup" tabindex="0">' +
    '<svg viewBox="0 0 36 36"><circle class="lm-bg" cx="18" cy="18" r="16"/><circle class="lm-fg" id="lm-tg-ring" cx="18" cy="18" r="16"/></svg>' +
    '<span class="lm-xi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></span>' +
    "</div>" +
    "</div>" +
    '<p class="lm-t" id="lm-tg-title">Gabung <span class="lm-hl">Telegram</span> Lotmetrik</p>' +
    '<p class="lm-desc">Update saham syariah &amp; edukasi IHSG. Gratis.</p>' +
    '<div class="lm-acts">' +
    '<a class="lm-cta" id="lm-tg-cta" href="' +
    TG +
    '" target="_blank" rel="noopener">' +
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 4.3L2.8 11.5c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.4.9 1 .9.6 0 .8-.3 1.1-.6l2.7-2.6 5.6 4.1c1 .6 1.8.3 2-.9l3.5-16.5c.4-1.5-.5-2.1-1.6-1.7zM9.3 14.7l-.2 3.3 1.1-2.2 8.7-7.8c.3-.3 0-.4-.4-.2L9.3 14.7z"/></svg>' +
    "Buka Telegram</a>" +
    '<button type="button" class="lm-skip" id="lm-tg-skip">Nanti saja</button>' +
    "</div>" +
    "</div>";
  document.body.appendChild(el);

  var ring = document.getElementById("lm-tg-ring");
  var autoTimer = null;
  var closed = false;
  var CIRC = 100.5; /* 2 * Math.PI * 16 */

  function close(reason) {
    if (closed) return;
    closed = true;
    el.classList.remove("on");
    markDone();
    track("telegram_funnel_" + reason);
    if (autoTimer) clearTimeout(autoTimer);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 280);
  }

  function open() {
    if (closed) return;
    /* Set SEBELUM tampil — pindah halaman = tidak muncul lagi di sesi yang sama */
    markDone();
    el.classList.add("on");
    track("telegram_funnel_show");

    ring.style.transition = "stroke-dashoffset " + COUNTDOWN_S + "s linear";
    void ring.getBoundingClientRect();
    ring.style.strokeDashoffset = String(CIRC);

    autoTimer = setTimeout(function () {
      close("auto");
    }, COUNTDOWN_S * 1000);
  }

  document.getElementById("lm-tg-x").addEventListener("click", function () {
    close("dismiss");
  });
  document.getElementById("lm-tg-x").addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      close("dismiss");
    }
  });
  document.getElementById("lm-tg-skip").addEventListener("click", function () {
    close("skip");
  });
  document.getElementById("lm-tg-cta").addEventListener("click", function () {
    track("telegram_funnel_click");
    markDone();
  });
  el.addEventListener("click", function (ev) {
    if (ev.target === el) close("backdrop");
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && el.classList.contains("on")) close("escape");
  });

  setTimeout(open, SHOW_AFTER_MS);
})();
