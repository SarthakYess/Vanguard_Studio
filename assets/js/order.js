/* Vanguard Studio — order finale: builds the WhatsApp order message, name is required */
(function () {
  var O = document.getElementById("order"); if (!O || !window.VWA) return;
  var btn = O.querySelector("#oBtn"), nm = O.querySelector("#oName"), prev = O.querySelector("#oPrev"), hint = O.querySelector("#oHint"), pill = document.getElementById("orderPill");
  nm.value = VWA.name();
  function pick(k) { return [].slice.call(O.querySelectorAll('.chips[data-key="' + k + '"] .chip.on')).map(function (c) { return c.textContent.trim(); }); }
  function opts() { var sv = pick("service"); return { name: nm.value.trim() || undefined, lines: ["Service: " + (sv.length ? sv.join(", ") : "Not sure yet"), "Video length: " + (pick("len")[0] || "Not sure yet"), "Needed by: " + (pick("when")[0] || "Flexible")] }; }
  function refresh() { var ok = !!nm.value.trim(); btn.disabled = !ok; hint.hidden = ok; prev.textContent = VWA.message("order", opts()); }
  O.querySelectorAll(".chips").forEach(function (g) {
    g.addEventListener("click", function (e) {
      var c = e.target.closest(".chip"); if (!c) return;
      if (g.dataset.multi || c.classList.contains("on")) c.classList.toggle("on");
      else { g.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); }); c.classList.add("on"); }
      refresh();
    });
  });
  nm.addEventListener("input", refresh); refresh();
  btn.addEventListener("click", function () { if (!nm.value.trim()) return; VWA.setName(nm.value); VWA.send("order", opts()); });

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, seen = false, done = false;
  function confetti() {
    var col = ["#ff8a8f", "#f5a524", "#ffffff", "#2dd4bf", "#a78bfa"];
    for (var i = 0; i < 40; i++) { var c = document.createElement("i"); c.className = "conf"; c.style.cssText = "left:" + (Math.random() * 100) + "vw;background:" + col[i % 5] + ";--x:" + ((Math.random() - 0.5) * 220) + "px;animation-delay:" + (Math.random() * 0.4) + "s"; document.body.appendChild(c); (function (x) { setTimeout(function () { x.remove(); }, 2500); })(c); }
  }
  new IntersectionObserver(function (en) {
    seen = en[0].isIntersecting; sync();
    if (seen && !done) { done = true; O.classList.add("arrived"); if (!reduce) confetti(); if (window.VSound) VSound.play("success"); }
  }, { threshold: 0.45 }).observe(O);
  function sync() { var max = document.documentElement.scrollHeight - innerHeight; pill.classList.toggle("show", !seen && max > 0 && scrollY > max * 0.55); }
  addEventListener("scroll", sync, { passive: true }); sync();
  pill.addEventListener("click", function () { O.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); });
})();
