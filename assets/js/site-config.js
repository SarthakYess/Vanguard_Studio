/* Applies assets/js/config.js to every page. You do not need to edit this file. */
(function () {
  var D = { nickname: "Prex", realName: "Prerit", brand: "Vanguard Studio", brandShort: "Vanguard", whatsapp: "919685268975", whatsappDisplay: "+91 96852 68975", email: "sprerit371@gmail.com", assistantApi: "" };
  var C = window.SITE = window.SITE || {};
  Object.keys(D).forEach(function (k) { var v = C[k] == null ? "" : String(C[k]).trim(); C[k] = v || D[k]; });
  C.whatsapp = C.whatsapp.replace(/\D/g, "") || D.whatsapp;

  /* most specific first, so "Vanguard Studio" is handled before anything shorter */
  var KEYS = ["whatsappDisplay", "email", "whatsapp", "brand", "realName", "nickname"];
  var changed = KEYS.filter(function (k) { return C[k] !== D[k]; });

  window.siteSub = function (s) {
    if (!s || !changed.length) return s;
    KEYS.forEach(function (k, n) { if (C[k] !== D[k] && s.indexOf(D[k]) > -1) s = s.split(D[k]).join("\u0001" + n + "\u0001"); });
    KEYS.forEach(function (k, n) { s = s.split("\u0001" + n + "\u0001").join(C[k]); });
    return s;
  };
  if (!changed.length && C.brandShort === D.brandShort) return;

  var skip = { SCRIPT: 1, STYLE: 1, LINK: 1, NOSCRIPT: 1 }, attrs = ["href", "content", "aria-label", "title", "placeholder", "data-title", "data-body", "data-client"];
  var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n, nodes = [];
  while ((n = w.nextNode())) if (!skip[n.parentNode.nodeName]) nodes.push(n);
  nodes.forEach(function (t) { var v = window.siteSub(t.nodeValue); if (v !== t.nodeValue) t.nodeValue = v; });
  document.querySelectorAll("[href],[content],[aria-label],[title],[placeholder],[data-title],[data-body],[data-client]").forEach(function (el) {
    if (skip[el.nodeName]) return;
    attrs.forEach(function (a) { var v = el.getAttribute(a); if (v) { var x = window.siteSub(v); if (x !== v) el.setAttribute(a, x); } });
  });
  document.title = window.siteSub(document.title);
  if (C.brandShort !== D.brandShort) document.querySelectorAll("[data-brand-short]").forEach(function (s) { s.textContent = C.brandShort; });
  if (C.brandShort !== D.brandShort) document.querySelectorAll(".brand > span").forEach(function (s) {
    var t = s.firstChild; if (t && t.nodeType === 3 && t.nodeValue.trim() === D.brandShort) t.nodeValue = C.brandShort;
  });
})();
