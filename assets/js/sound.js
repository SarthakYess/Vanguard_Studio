/* Vanguard Studio — synthesized UI sounds (Web Audio, no files) */
(function () {
  var ctx = null, master = null, on = true;
  try { on = localStorage.getItem("vanguard-sound") !== "off"; } catch (e) {}

  function init() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return ctx; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.32;
    var comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);
    return ctx;
  }
  function tone(f, t, d, type, vol, to) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.03);
  }
  function bell(f, t, d, vol) {            /* warm, classic bell: fundamental + soft partials */
    tone(f, t, d, "sine", vol);
    tone(f * 2, t, d * 0.7, "sine", vol * 0.28);
    tone(f * 2.76, t, d * 0.4, "sine", vol * 0.12);
  }
  function arp(notes, t, gap, d, vol) { notes.forEach(function (f, i) { bell(f, t + i * gap, d, vol); }); }

  var S = {
    click:   function (t) { tone(760, t, 0.07, "triangle", 0.45, 430); },
    hover:   function (t) { tone(1250, t, 0.035, "sine", 0.1); },
    open:    function (t) { tone(330, t, 0.2, "sine", 0.35, 660); tone(495, t + 0.04, 0.22, "sine", 0.22, 880); },
    close:   function (t) { tone(660, t, 0.18, "sine", 0.32, 330); },
    light:   function (t) { bell(523.25, t, 0.4, 0.3); bell(783.99, t + 0.09, 0.5, 0.26); },
    dark:    function (t) { bell(783.99, t, 0.4, 0.3); bell(523.25, t + 0.09, 0.5, 0.26); },
    success: function (t) { arp([523.25, 659.25, 783.99, 1046.5], t, 0.08, 0.7, 0.28); },
    error:   function (t) { tone(190, t, 0.24, "triangle", 0.28, 140); },
    welcome: function (t) { arp([261.63, 329.63, 392, 523.25], t, 0.13, 1.1, 0.3); },
    back:    function (t) { arp([392, 493.88, 587.33, 783.99], t, 0.1, 0.9, 0.3); },
    festive: function (t) { arp([392, 493.88, 587.33, 783.99, 987.77], t, 0.09, 1.2, 0.3); arp([1567.98, 1975.53, 2349.32], t + 0.5, 0.07, 0.5, 0.1); },
    pop:     function (t) { tone(240, t, 0.16, "sine", 0.4, 70); tone(1900, t, 0.06, "triangle", 0.14, 900); },
    tick:    function (t) { tone(1500, t, 0.03, "triangle", 0.12, 800); },
    perfect: function (t) { arp([880, 1174.66, 1567.98], t, 0.05, 0.4, 0.26); },
    good:    function (t) { tone(660, t, 0.12, "triangle", 0.3, 900); },
    fanfare: function (t) { arp([392, 523.25, 659.25, 783.99, 1046.5], t, 0.09, 1.0, 0.28); }
  };

  var HAP = { tick: 5, good: 12, perfect: [10, 30, 10], error: 35, success: [15, 40, 15, 40, 30], pop: 8 };
  function play(name) {
    if (!on) return;
    if ((name === "hover") && (!ctx || ctx.state !== "running")) return; /* no hover before first tap */
    if (HAP[name] && navigator.vibrate) { try { navigator.vibrate(HAP[name]); } catch (e) {} }
    if (!init()) return;
    if (S[name]) S[name](ctx.currentTime + 0.01);
  }

  var btn = null;
  function sync() { if (btn) { btn.setAttribute("aria-pressed", on ? "true" : "false"); btn.title = on ? "Sound on" : "Sound off"; } }
  function setOn(v) { on = v; try { localStorage.setItem("vanguard-sound", v ? "on" : "off"); } catch (e) {} sync(); }
  window.VSound = { play: play, isOn: function () { return on; }, setOn: setOn };

  document.addEventListener("DOMContentLoaded", function () {
    btn = document.getElementById("soundToggle"); sync();

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest("#soundToggle")) { setOn(!on); play("click"); return; }
      if (t.closest("[data-nosound]")) return;
      if (t.closest("#themeToggle")) { play(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"); return; }
      if (t.closest("#burger")) { play(document.getElementById("burger").getAttribute("aria-expanded") === "true" ? "open" : "close"); return; }
      if (t.closest(".modal-close")) { play("close"); return; }
      if (t.closest(".work-card")) { play("open"); return; }
      if (t.closest("a,button,.opt")) play("click");
    });

    if (window.matchMedia && matchMedia("(hover: hover)").matches) {
      var lastEl = null, lastT = 0;
      document.addEventListener("mouseover", function (e) {
        var el = e.target.closest("a,button,.card,.work-card,.opt");
        if (!el || el === lastEl) return;
        lastEl = el;
        var now = Date.now(); if (now - lastT < 90) return;
        lastT = now; play("hover");
      });
      document.addEventListener("mouseout", function (e) { if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest("a,button,.card,.work-card,.opt")) lastEl = null; });
    }

    /* form feedback: react to the classes the page scripts already toggle */
    if (window.MutationObserver) {
      var mo = new MutationObserver(function (list) {
        list.forEach(function (m) {
          var el = m.target, was = (m.oldValue || "");
          if (el.classList.contains("form-ok") && el.classList.contains("show") && was.indexOf("show") < 0) play("success");
          if (el.classList.contains("field") && el.classList.contains("invalid") && was.indexOf("invalid") < 0) play("error");
        });
      });
      document.querySelectorAll(".form-ok,.field").forEach(function (el) { mo.observe(el, { attributes: true, attributeFilter: ["class"], attributeOldValue: true }); });
    }
  });
})();
