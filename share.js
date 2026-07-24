/* Share + theme boot for /saham/* pages (external so CSP script-src 'self' allows it). */
(function () {
  try {
    if (localStorage.getItem("lotmetrik-des-theme") === "terminal") {
      document.documentElement.setAttribute("data-theme", "terminal");
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = "#0B1F3A";
    }
  } catch (e) {}

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
      navigator.clipboard.writeText(text + " " + url).then(function () {
        done("Tersalin");
      }).catch(function () {
        done("Gagal salin");
      });
      return;
    }
    try {
      var ta = document.createElement("textarea");
      ta.value = text + " " + url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      done("Tersalin");
    } catch (err) {
      window.prompt("Salin link:", url);
    }
  });
})();
