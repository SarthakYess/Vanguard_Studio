/* Vanguard Studio — satisfying micro-interactions */
(function () {
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".btn"); if (!b) return;
    var r = b.getBoundingClientRect(), s = document.createElement("span"), d = Math.max(r.width, r.height) * 2;
    s.className = "ripple"; s.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
    b.appendChild(s); setTimeout(function () { s.remove(); }, 650);
  });
  if (reduce) return;
  document.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "touch" || e.target.closest("input,textarea,select")) return;
    var r = document.createElement("i"); r.className = "tap-ring"; r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px"; document.body.appendChild(r); setTimeout(function () { r.remove(); }, 600);
    for (var k = 0; k < 6; k++) { var d = document.createElement("i"), a = k / 6 * 6.283 + Math.random(), m = 22 + Math.random() * 22; d.className = "tap-dot"; d.style.cssText = "left:" + e.clientX + "px;top:" + e.clientY + "px;--dx:" + Math.cos(a) * m + "px;--dy:" + Math.sin(a) * m + "px"; document.body.appendChild(d); (function (n) { setTimeout(function () { n.remove(); }, 560); })(d); }
  }, { passive: true });
  var h = document.querySelector(".hero h1.display");
  if (h) { var i = 0; Array.prototype.slice.call(h.childNodes).forEach(function (c) {
    if (c.nodeType === 3) { var f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(function (w) { if (!w.trim()) { f.appendChild(document.createTextNode(w)); return; } var s = document.createElement("span"); s.className = "w"; s.style.animationDelay = (i++ * 70) + "ms"; s.textContent = w; f.appendChild(s); }); h.replaceChild(f, c); }
    else if (c.nodeType === 1) { c.classList.add("w"); c.style.animationDelay = (i++ * 70) + "ms"; } }); }
  if (!fine) return;
  var g = document.createElement("div"); g.className = "cursor-glow"; document.body.appendChild(g);
  var gx = 0, gy = 0, tx = 0, ty = 0;
  addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; g.style.opacity = 1; });
  (function loop() { gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12; g.style.transform = "translate(" + (gx - 200) + "px," + (gy - 200) + "px)"; requestAnimationFrame(loop); })();
  document.querySelectorAll(".card,.work-card,.price-card").forEach(function (el) {
    if (el.querySelector("form,input")) return;
    el.addEventListener("pointermove", function (e) { var b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5; el.style.transform = "perspective(800px) rotateX(" + (-y * 10) + "deg) rotateY(" + (x * 12) + "deg) scale(1.02)"; });
    el.addEventListener("pointerleave", function () { el.style.transform = ""; });
  });
  document.querySelectorAll(".btn-primary,.btn-lg").forEach(function (b) {
    b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.28) + "px)"; });
    b.addEventListener("pointerleave", function () { b.style.transform = ""; });
  });
})();
