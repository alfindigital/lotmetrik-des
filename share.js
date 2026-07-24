/* Share + theme for /saham/* pages (external so CSP script-src 'self' allows it). */
(function () {
  var TKEY = "lotmetrik-des-theme";
  var meta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(m) {
    var t = document.getElementById("themeBtn");
    if (m === "terminal") {
      document.documentElement.setAttribute("data-theme", "terminal");
      if (meta) meta.content = "#0B1F3A";
      if (t) t.setAttribute("aria-pressed", "true");
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (meta) meta.content = "#F5F7FA";
      if (t) t.setAttribute("aria-pressed", "false");
    }
  }

  try {
    var saved = localStorage.getItem(TKEY);
    if (saved) applyTheme(saved);
  } catch (e) {}

  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var term = document.documentElement.getAttribute("data-theme") === "terminal";
      var next = term ? "light" : "terminal";
      applyTheme(next);
      try {
        localStorage.setItem(TKEY, next);
      } catch (err) {}
    });
  }

  var btn = document.getElementById("shareBtn");
  if (!btn) return;
  var url = btn.getAttribute("data-url") || location.href;
  var text = btn.getAttribute("data-text") || document.title;
  var label = btn.textContent;
  btn.addEventListener("click", function () {
    function done(msg) {
      btn.textContent = msg || "Tersalin";
      setTimeout(function () {
        btn.textContent = label;
      }, 1800);
    }
    if (navigator.share) {
      navigator.share({ title: document.title, text: text, url: url }).catch(function () {});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        done("Tersalin");
      }).catch(function () {
        done("Gagal salin");
      });
      return;
    }
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      done("Tersalin");
    } catch (err) {
      window.prompt("Salin teks:", text);
    }
  });
})();
