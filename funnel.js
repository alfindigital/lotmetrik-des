/* Telegram funnel popup v2 — bigger, bolder, circle countdown.
   Muncul setelah 5 detik. Auto-close setelah 10 detik dengan ring countdown.
   Dismiss: klik X, "Nanti saja", backdrop, atau Escape.
   Sekali per sesi browser (sessionStorage). */
(function () {
  "use strict";
  if (window.__lotmetrikTgFunnel) return;
  window.__lotmetrikTgFunnel = true;

  var KEY = "lotmetrik-tg-funnel-v2";
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
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
  }

  /* ---- CSS ---- */
  var css = document.createElement("style");
  css.textContent = [
    /* backdrop */
    "#lm-tg{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;" +
    "padding:20px;padding-bottom:max(20px,env(safe-area-inset-bottom));" +
    "background:rgba(6,18,31,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);" +
    "opacity:0;pointer-events:none;transition:opacity .25s ease}",
    "#lm-tg.on{opacity:1;pointer-events:auto}",

    /* card */
    "#lm-tg .lm-c{width:min(480px,100%);background:var(--navy-900,#0B1F3A);color:var(--off-white,#F5F7FA);" +
    "border:1px solid var(--navy-700,#1B3A60);border-radius:20px;" +
    "box-shadow:0 12px 40px rgba(0,0,0,.35);padding:32px 28px 24px;" +
    "transform:translateY(16px) scale(.96);transition:transform .3s cubic-bezier(.2,.6,.2,1);" +
    "font-family:var(--font-sans,'Plus Jakarta Sans',system-ui,sans-serif);position:relative;overflow:hidden}",
    "#lm-tg.on .lm-c{transform:translateY(0) scale(1)}",

    /* grid glow */
    "#lm-tg .lm-c::before{content:'';position:absolute;inset:0;pointer-events:none;" +
    "background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px)," +
    "linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:48px 48px}",
    "#lm-tg .lm-c::after{content:'';position:absolute;width:340px;height:340px;right:-120px;top:-140px;" +
    "border-radius:50%;background:radial-gradient(circle,rgba(45,212,191,.22),transparent 68%);pointer-events:none}",

    /* top row */
    "#lm-tg .lm-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;position:relative;z-index:2}",

    /* icon */
    "#lm-tg .lm-icon{width:52px;height:52px;border-radius:14px;background:rgba(45,212,191,.14);" +
    "display:grid;place-items:center;flex:none;margin-bottom:14px}",
    "#lm-tg .lm-icon svg{width:28px;height:28px;color:#2DD4BF}",

    /* close ring (countdown circle) */
    "#lm-tg .lm-ring{position:relative;width:40px;height:40px;flex:none;cursor:pointer}",
    "#lm-tg .lm-ring svg{width:40px;height:40px;transform:rotate(-90deg)}",
    "#lm-tg .lm-ring .lm-bg{fill:none;stroke:rgba(255,255,255,.1);stroke-width:3}",
    "#lm-tg .lm-ring .lm-fg{fill:none;stroke:#2DD4BF;stroke-width:3;" +
    "stroke-linecap:round;stroke-dasharray:113;stroke-dashoffset:0}",
    /* X icon in the center */
    "#lm-tg .lm-ring .lm-xi{position:absolute;inset:0;display:grid;place-items:center}",
    "#lm-tg .lm-ring .lm-xi svg{width:16px;height:16px;color:rgba(255,255,255,.5);transform:none}",
    "#lm-tg .lm-ring:hover .lm-xi svg{color:#fff}",

    /* title */
    "#lm-tg .lm-t{margin:0;font-size:22px;font-weight:800;letter-spacing:-.02em;line-height:1.2;position:relative;z-index:2}",
    "#lm-tg .lm-t .lm-hl{color:#2DD4BF}",
    "#lm-tg .lm-desc{margin:8px 0 0;font-size:15px;line-height:1.5;color:rgba(245,247,250,.6);position:relative;z-index:2;max-width:380px}",

    /* stat row */
    "#lm-tg .lm-stats{display:flex;gap:12px;margin-top:20px;position:relative;z-index:2}",
    "#lm-tg .lm-st{flex:1;background:rgba(6,18,31,.5);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 14px}",
    "#lm-tg .lm-sv{font-family:var(--font-mono,'JetBrains Mono',monospace);" +
    "font-size:24px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.01em}",
    "#lm-tg .lm-sv.t{color:#2DD4BF}",
    "#lm-tg .lm-sv.a{color:#FBBF24}",
    "#lm-tg .lm-sl{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(245,247,250,.4);margin-top:2px}",

    /* actions */
    "#lm-tg .lm-acts{display:flex;gap:10px;margin-top:22px;position:relative;z-index:2;flex-wrap:wrap}",
    "#lm-tg .lm-cta{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;" +
    "padding:0 24px;border-radius:12px;background:#2DD4BF;color:#0B1F3A;" +
    "font-weight:800;font-size:16px;text-decoration:none;border:none;cursor:pointer;" +
    "transition:background .15s,transform .1s}",
    "#lm-tg .lm-cta:hover{background:#5EEAD4}",
    "#lm-tg .lm-cta:active{transform:scale(.97)}",
    "#lm-tg .lm-cta:focus-visible{outline:2px solid #2DD4BF;outline-offset:3px}",
    "#lm-tg .lm-cta svg{width:20px;height:20px}",
    "#lm-tg .lm-skip{min-height:50px;padding:0 16px;border:1px solid rgba(255,255,255,.12);background:transparent;" +
    "color:rgba(245,247,250,.5);font-size:14px;font-weight:600;cursor:pointer;border-radius:12px;" +
    "transition:border-color .15s,color .15s}",
    "#lm-tg .lm-skip:hover{border-color:rgba(255,255,255,.25);color:rgba(245,247,250,.8)}",

    /* mobile */
    "@media(max-width:480px){" +
    "#lm-tg .lm-c{padding:24px 20px 18px;border-radius:16px}" +
    "#lm-tg .lm-t{font-size:19px}" +
    "#lm-tg .lm-sv{font-size:20px}" +
    "#lm-tg .lm-acts{flex-direction:column}" +
    "#lm-tg .lm-cta,#lm-tg .lm-skip{width:100%;justify-content:center}" +
    "}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---- HTML ---- */
  var el = document.createElement("div");
  el.id = "lm-tg";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-labelledby", "lm-tg-title");
  el.innerHTML =
    '<div class="lm-c">' +

    /* top row: icon left, countdown ring right */
    '<div class="lm-top">' +
    '<div class="lm-icon">' +
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 4.3L2.8 11.5c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.4.9 1 .9.6 0 .8-.3 1.1-.6l2.7-2.6 5.6 4.1c1 .6 1.8.3 2-.9l3.5-16.5c.4-1.5-.5-2.1-1.6-1.7zM9.3 14.7l-.2 3.3 1.1-2.2 8.7-7.8c.3-.3 0-.4-.4-.2L9.3 14.7z"/></svg>' +
    '</div>' +
    '<div class="lm-ring" id="lm-tg-x" role="button" aria-label="Tutup" tabindex="0">' +
    '<svg viewBox="0 0 40 40"><circle class="lm-bg" cx="20" cy="20" r="18"/><circle class="lm-fg" id="lm-tg-ring" cx="20" cy="20" r="18"/></svg>' +
    '<span class="lm-xi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></span>' +
    '</div>' +
    '</div>' +

    /* text */
    '<p class="lm-t" id="lm-tg-title">Gabung <span class="lm-hl">Telegram</span> Lotmetrik</p>' +
    '<p class="lm-desc">Update saham syariah, edukasi IHSG berbasis data. Gratis, tanpa spam jual.</p>' +

    /* mini stats */
    '<div class="lm-stats">' +
    '<div class="lm-st"><div class="lm-sv a">622</div><div class="lm-sl">Saham syariah</div></div>' +
    '<div class="lm-st"><div class="lm-sv t">21</div><div class="lm-sl">Rilis OJK</div></div>' +
    '<div class="lm-st"><div class="lm-sv t">850</div><div class="lm-sl">Pernah tercatat</div></div>' +
    '</div>' +

    /* actions */
    '<div class="lm-acts">' +
    '<a class="lm-cta" id="lm-tg-cta" href="' + TG + '" target="_blank" rel="noopener">' +
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 4.3L2.8 11.5c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.4.9 1 .9.6 0 .8-.3 1.1-.6l2.7-2.6 5.6 4.1c1 .6 1.8.3 2-.9l3.5-16.5c.4-1.5-.5-2.1-1.6-1.7zM9.3 14.7l-.2 3.3 1.1-2.2 8.7-7.8c.3-.3 0-.4-.4-.2L9.3 14.7z"/></svg>' +
    'Buka Telegram</a>' +
    '<button type="button" class="lm-skip" id="lm-tg-skip">Nanti saja</button>' +
    '</div>' +
    '</div>';
  document.body.appendChild(el);

  /* ---- Logic ---- */
  var ring = document.getElementById("lm-tg-ring");
  var autoTimer = null;
  var closed = false;

  function close(reason) {
    if (closed) return;
    closed = true;
    el.classList.remove("on");
    markDone();
    track("telegram_funnel_" + reason);
    if (autoTimer) clearTimeout(autoTimer);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  }

  function open() {
    if (closed) return;
    el.classList.add("on");
    track("telegram_funnel_show");

    /* animate ring: stroke-dashoffset from 0 → 113 over COUNTDOWN_S */
    ring.style.transition = "stroke-dashoffset " + COUNTDOWN_S + "s linear";
    /* force reflow so transition starts from 0 */
    void ring.getBoundingClientRect();
    ring.style.strokeDashoffset = "113";

    autoTimer = setTimeout(function () {
      close("auto");
    }, COUNTDOWN_S * 1000);
  }

  /* close handlers */
  document.getElementById("lm-tg-x").addEventListener("click", function () { close("dismiss"); });
  document.getElementById("lm-tg-x").addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); close("dismiss"); } });
  document.getElementById("lm-tg-skip").addEventListener("click", function () { close("skip"); });
  document.getElementById("lm-tg-cta").addEventListener("click", function () { track("telegram_funnel_click"); markDone(); });
  el.addEventListener("click", function (ev) { if (ev.target === el) close("backdrop"); });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && el.classList.contains("on")) close("escape"); });

  setTimeout(open, SHOW_AFTER_MS);
})();
