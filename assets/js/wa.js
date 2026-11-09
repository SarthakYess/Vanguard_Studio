/* Vanguard Studio — WhatsApp helper.
   Every WhatsApp link: asks for the visitor's name once, then writes a professional message that says
   where on the site they came from and what they want to do. */
(function () {
  var S = window.SITE || { nickname: "Prex", brand: "Vanguard Studio", whatsapp: "919685268975" };
  var PAGES = { "home.html": "Home page", "services.html": "Services page", "work.html": "Work page", "play.html": "Play page (Beat Cutter game)", "about.html": "About page", "contact.html": "Contact page", "index.html": "Welcome page", "": "Welcome page" };
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function getName() { try { return localStorage.getItem("vanguard-name") || ""; } catch (e) { return ""; } }
  function setName(n) { n = clean(n).slice(0, 40); try { if (n) localStorage.setItem("vanguard-name", n); } catch (e) {} return n; }

  function where() {
    var page = PAGES[location.pathname.split("/").pop()] || "Website", section = "";
    var m = document.getElementById("projectModal");
    if (m && m.classList.contains("open")) section = "Project pop-up: " + clean((document.getElementById("pmTitle") || {}).textContent);
    else {
      var y = innerHeight / 2, best = null;
      document.querySelectorAll("section,footer").forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= y && r.bottom >= y) best = s; });
      if (best) {
        if (best.classList.contains("hero") || best.classList.contains("page-hero")) section = "Top of the page";
        else if (best.tagName === "FOOTER") section = "Footer";
        else if (best.id === "order") section = "Order section";
        else { var h = best.querySelector("h1,h2"); section = h ? clean(h.textContent) : ""; }
      }
    }
    return { page: page, section: section };
  }

  var DO = { general: "Discuss a video editing project", videos: "See more of your work (full video portfolio)", order: "Place an order for a video edit", contact: "Send a project brief", assistant: "Continue a conversation from the website assistant", exit: "Ask a question before leaving the website" };
  var CLOSE = { general: "Could you please let me know a good time to talk?", videos: "Could you please share your latest videos here on WhatsApp?", order: "Please let me know the next steps and a quote.", contact: "Please let me know the next steps.", assistant: "Could you please help me with the above?", exit: "Could you please get back to me when you are free?" };
  function message(intent, o) {
    o = o || {};
    var nm = o.name || getName() || "[your name]", w = where(), at = w.page + (w.section ? " > " + w.section : "");
    var L = ["Hello " + S.nickname + ",", "", "My name is " + nm + ". I am contacting you through the " + S.brand + " website.", "", "Where I am coming from: " + at, "What I would like to do: " + (DO[intent] || DO.general)];
    (o.lines || []).forEach(function (x) { L.push(x); });
    if (o.note) L.push("", "Details: " + o.note);
    if (/^https?:/.test(location.protocol)) L.push("", "Page: " + location.href.split("#")[0]);
    L.push("", CLOSE[intent] || CLOSE.general, "", "Thank you,", nm);
    return L.join("\n");
  }
  function url(intent, o) { return "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(message(intent, o)); }
  function go(intent, o) { try { sessionStorage.setItem("vanguard-wa", "1"); } catch (e) {} window.open(url(intent, o), "_blank", "noopener"); }
  function send(intent, o) { if (getName()) return go(intent, o); gate(function () { go(intent, o); }); }

  var G = null;
  function gate(cb) {
    if (!G) {
      G = document.createElement("div"); G.className = "wa-gate"; G.hidden = true; G.setAttribute("role", "dialog"); G.setAttribute("aria-modal", "true"); G.setAttribute("aria-labelledby", "waGateT");
      G.innerHTML = '<div class="wa-box"><h2 id="waGateT">Before we open WhatsApp</h2><p>May I have your name? It goes into your message so ' + esc(S.nickname) + ' knows who is writing.</p><input id="waGateName" type="text" autocomplete="given-name" placeholder="Your name" maxlength="40"><p class="wa-err" id="waGateErr" hidden>Please enter your name to continue.</p><button type="button" class="btn btn-primary btn-lg" id="waGateGo">Continue to WhatsApp</button><button type="button" class="wa-x" id="waGateX">Not now</button></div>';
      document.body.appendChild(G);
      G.addEventListener("click", function (e) { if (e.target === G || e.target.id === "waGateX") G.hidden = true; });
      document.addEventListener("keydown", function (e) { if (!G.hidden && e.key === "Escape") G.hidden = true; });
    }
    var inp = G.querySelector("#waGateName"), err = G.querySelector("#waGateErr");
    function ok() { var n = setName(inp.value); if (!n) { err.hidden = false; inp.focus(); return; } G.hidden = true; cb(n); }
    G.querySelector("#waGateGo").onclick = ok; inp.onkeydown = function (e) { if (e.key === "Enter") ok(); };
    inp.value = ""; err.hidden = true; G.hidden = false; setTimeout(function () { inp.focus(); }, 30);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href*="wa.me/"]'); if (!a || a.hasAttribute("data-wa-skip")) return;
    e.preventDefault(); send(a.getAttribute("data-intent") || "general");
  });
  window.VWA = { name: getName, setName: setName, where: where, message: message, url: url, send: send, gate: gate, esc: esc };
})();
