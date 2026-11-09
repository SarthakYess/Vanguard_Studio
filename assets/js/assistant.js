/* Vanguard Studio — on-page assistant (no API key, no server).
   It is rule-based: it knows what is on this site, notices which page/section you are on, and hands real questions to WhatsApp.
   Also holds the "before you go" exit prompt. */
(function () {
  if (!window.VWA) return;
  var S = window.SITE || { nickname: "Prex", realName: "Prerit", brand: "Vanguard Studio", whatsappDisplay: "+91 96852 68975", email: "sprerit371@gmail.com" };
  var esc = VWA.esc, page = location.pathname.split("/").pop();
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function snd(n) { if (window.VSound) VSound.play(n); }

  var launch = el("button", "as-launch", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/><path d="M9 11h6M9 14h4"/></svg>');
  launch.type = "button"; launch.setAttribute("aria-label", "Open assistant"); launch.setAttribute("aria-expanded", "false");
  var tip = el("button", "as-tip"); tip.type = "button"; tip.hidden = true;
  var panel = el("section", "as-panel", '<header class="as-head"><div><strong>Glumb v1</strong><small>Automated helper · replies instantly</small></div><button type="button" class="as-close" aria-label="Close assistant">&times;</button></header><div class="as-log" aria-live="polite"></div><div class="as-chips"></div><form class="as-form"><input type="text" placeholder="Type your question..." autocomplete="off" maxlength="200" aria-label="Your question"><button class="btn btn-primary btn-sm" type="submit">Send</button></form>');
  panel.hidden = true; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Website assistant");
  document.body.appendChild(panel); document.body.appendChild(tip); document.body.appendChild(launch);
  var log = panel.querySelector(".as-log"), chips = panel.querySelector(".as-chips"), form = panel.querySelector(".as-form"), inp = form.querySelector("input");
  var asked = [], started = false, langDone = false, chosenLang = "", channelDone = false;

  function say(html, who, actions) {
    var m = el("div", "as-msg " + who, html); log.appendChild(m);
    if (actions) { var r = el("div", "as-actions"); actions.forEach(function (a) { var x = el(a.href ? "a" : "button", "as-act"); x.textContent = a.label; if (a.href) x.href = a.href; else { x.type = "button"; x.onclick = a.fn; } r.appendChild(x); }); log.appendChild(r); }
    log.scrollTop = log.scrollHeight;
  }
  function wa(label, intent, lines, note) { return { label: label, fn: function () { VWA.send(intent || "assistant", { lines: lines || (asked.length ? ["My questions: " + asked.slice(-3).join(" | ")] : []), note: note || undefined }); } }; }
  var SERV = [{ label: "See services", href: "services.html" }], WORK = [{ label: "See the work page", href: "work.html" }, wa("See all videos on WhatsApp", "videos", [])];
  var KB = [
    [/\b(my name is|i am|i'm|mera naam)\s+([a-z]{2,20})/i, function (m) { var n = VWA.setName(m[2].charAt(0).toUpperCase() + m[2].slice(1)); return ["Nice to meet you, " + esc(n) + "! What would you like to know?"]; }],
    [/(tum|aap|you).{0,12}(kon|kaun|who|kya)\b|\bwho are you\b|\bwhat are you\b|apne bare|introduce/i, function () { return ["I'm the assistant of " + esc(S.brand) + ". I can answer questions about services, timing and orders, and hand you to " + esc(S.nickname) + " on WhatsApp."]; }],
    [/\b(hi|hello|hey|hii|namaste|yo)\b/i, function () { var n = VWA.name(); return ["Hi" + (n ? " " + esc(n) : "") + "! Ask me about services, how it works, timing or how to order."]; }],
    [/(thank|thanks|shukriya|dhanyavaad)/i, function () { return ["You're welcome! If you want a quote or to see more videos, I can open WhatsApp for you."]; }],
    [/(price|cost|rate|charge|kitna|kitne|paise|budget|quote|fee|pricing)/i, function () { return ["Pricing depends on video length, style and turnaround, so " + esc(S.nickname) + " quotes each project personally. Share a few details and he will reply on WhatsApp with a quote."]; }, function () { return [wa("Get a quote on WhatsApp", "assistant", ["I would like a quote for a video edit."])]; }],
    [/(how long|time|days|deadline|delivery|din|turnaround|fast|jaldi|urgent|asap)/i, function () { return ["A first rough cut usually comes in 1 to 3 days. Tell " + esc(S.nickname) + " your deadline in the brief and he will plan around it."]; }],
    [/(revision|changes|modify|feedback|dobara|again)/i, function () { return ["Two rounds of changes are included with every project."]; }],
    [/(format|platform|export|resolution|size|1080|4k|whatsapp status)/i, function () { return ["Files are exported in the right size and format for Instagram, YouTube, WhatsApp status or TV. Just tell " + esc(S.nickname) + " where it will be posted."]; }],
    [/(reel|short|insta|tiktok)/i, function () { return ["Reels and Shorts: vertical edits with fast hooks, captions that land, and sound that sits right."]; }, function () { return SERV; }],
    [/(youtube|vlog|podcast|long.?form)/i, function () { return ["YouTube and long-form: talking-head, vlog and podcast edits with tight pacing, b-roll, titles and chapters."]; }, function () { return SERV; }],
    [/(\bads?\b|promo|brand film|product video|advert)/i, function () { return ["Ads and brand films: short promos that explain the offer in the first three seconds and end with a clear action."]; }, function () { return SERV; }],
    [/(colou?r|grade|sound|audio|music|mix)/i, function () { return ["Color and sound: color correction and grading, audio cleanup, music selection and a final mix that works on phone speakers too."]; }, function () { return SERV; }],
    [/(service|offer|kya karte|what do you (do|edit)|which service|kaun)/i, function () { return ["Four things: Reels and Shorts, YouTube and long-form, Ads and brand films, and Color and sound. You can also mix them."]; }, function () { return SERV; }],
    [/(process|how.*work|steps|kaise)/i, function () { return ["1) You send the raw footage and a reference. 2) A rough cut in 1 to 3 days. 3) Color, sound and export, plus two rounds of changes."]; }],
    [/(style|reference|similar|like this)/i, function () { return ["Share a reference video you like in your brief and " + esc(S.nickname) + " will match the feel."]; }],
    [/(order|book|hire|start|buy|place)/i, function () { return ["Easiest way: use the order form at the bottom of the home page. Or I can open WhatsApp with your message ready."]; }, function () { return [{ label: "Go to the order form", href: "home.html#order" }, wa("Order on WhatsApp", "assistant", ["I would like to place an order."])]; }],
    [/(work|video|portfolio|sample|example|dikhao|show me)/i, function () { return ["A few sample projects are on the Work page. For the full portfolio, " + esc(S.nickname) + " shares videos on WhatsApp."]; }, function () { return WORK; }],
    [/(contact|whatsapp|call|number|email|mail|phone|reach)/i, function () { return ["WhatsApp: " + esc(S.whatsappDisplay) + "<br>Email: " + esc(S.email) + "<br>Replies usually come within a day."]; }, function () { return [wa("Message on WhatsApp", "general", [])]; }],
    [/(game|play|beat|score)/i, function () { return ["Try Beat Cutter on the Play page: tap when the line hits the glowing marker. Build a combo for a high score."]; }, function () { return [{ label: "Play Beat Cutter", href: "play.html" }]; }],
    [/(who|prex|prerit|editor|about|studio)/i, function () { return [esc(S.brand) + " is the video editing studio of " + esc(S.realName) + " (" + esc(S.nickname) + "). He edits reels, YouTube videos, ads and films."]; }, function () { return [{ label: "About page", href: "about.html" }]; }]
  ];
  function reply(q) {
    asked.push(q); var hit = null, i;
    for (i = 0; i < KB.length; i++) { var m = q.match(KB[i][0]); if (m) { hit = [KB[i][1](m), KB[i][2] ? KB[i][2]() : null]; break; } }
    setTimeout(function () {
      if (hit) { var acts = (hit[1] || []).slice(); if (asked.length >= 2 && !acts.some(function (a) { return /order|whatsapp/i.test(a.label); })) acts.push({ label: "Start my order", href: "home.html#order" }); say(hit[0][0], "bot", acts.length ? acts : null); }
      else say("I don't have an exact answer for that, but " + esc(S.nickname) + " does. Want me to send your question to him on WhatsApp?", "bot", [wa("Send my question on WhatsApp", "assistant", ["My question: " + q])]);
      snd("tick"); showChips();
    }, 450);
  }
  var CH = {
    "home.html": ["What services do you offer?", "How does it work?", "How do I order?", "See all videos on WhatsApp"],
    "services.html": ["Which service is right for me?", "How long does an edit take?", "Do you include revisions?", "Get a quote"],
    "work.html": ["See all videos on WhatsApp", "Can you match my style?", "How do I order?"],
    "play.html": ["Tell me about the studio", "How do I order?", "What services do you offer?"],
    "contact.html": ["What should I put in the brief?", "How fast do you reply?", "How long does an edit take?"],
    "about.html": ["Who is Prex?", "What services do you offer?", "How do I order?"]
  };
  /* ── channel chips (optional, shown only when user wants video help) ── */
  var CHANNEL_CHIPS = [
    "Fitness / Gym", "Food / Cooking", "Travel / Vlogs",
    "Education / Info", "Gaming", "Business / Finance",
    "Lifestyle / Aesthetic", "Comedy / Entertainment", "Brand / Product"
  ];

  function showLangPicker() {
    chips.innerHTML = "";
    var presets = ["English", "Hinglish", "हिंदी"];
    presets.forEach(function (t) {
      var b = el("button", "as-chip"); b.type = "button"; b.textContent = t;
      b.onclick = function () { ask(t); };
      chips.appendChild(b);
    });
    var row = el("div", "as-lang-custom");
    var lbl = el("span", "as-lang-label", "Other:");
    var inp2 = el("input", "as-lang-inp"); inp2.type = "text"; inp2.placeholder = "Type your language…"; inp2.maxLength = 40; inp2.setAttribute("aria-label", "Custom language");
    var go = el("button", "as-chip as-lang-go"); go.type = "button"; go.textContent = "→"; go.disabled = true;
    inp2.addEventListener("input", function () { go.disabled = !inp2.value.trim(); });
    go.onclick = function () { var v = inp2.value.trim(); if (v) ask(v); };
    inp2.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); var v = inp2.value.trim(); if (v) ask(v); } });
    row.appendChild(lbl); row.appendChild(inp2); row.appendChild(go);
    chips.appendChild(row);
  }

  /* Main chips — always shown after language. Covers BOTH help and video paths. */
  function showMainChips() {
    chips.innerHTML = "";
    [
      "What services do you offer?",
      "How much does it cost?",
      "I want to make a video",
      "How does it work?",
      "See sample work"
    ].forEach(function (t) {
      var b = el("button", "as-chip"); b.type = "button"; b.textContent = t;
      b.onclick = function () {
        /* Only show channel picker if user is asking about making a video */
        if (/want to make|need a video|start a video|order|book|hire/i.test(t)) {
          showChannelPicker(); return;
        }
        ask(t);
      };
      chips.appendChild(b);
    });
  }

  /* Channel picker — only surfaced when user opts in to video creation flow */
  function showChannelPicker() {
    chips.innerHTML = "";
    var hd = el("div", "as-chip-label", "What's your channel about?");
    chips.appendChild(hd);
    CHANNEL_CHIPS.forEach(function (t) {
      var b = el("button", "as-chip"); b.type = "button"; b.textContent = t;
      b.onclick = function () { channelDone = true; ask("My channel is about: " + t); };
      chips.appendChild(b);
    });
    var other = el("button", "as-chip"); other.type = "button"; other.textContent = "Something else…";
    other.onclick = function () { inp.placeholder = "Describe your channel…"; inp.focus(); };
    chips.appendChild(other);
  }

  function showChips() {
    chips.innerHTML = "";
    if (llmOn()) {
      if (!langDone) { showLangPicker(); return; }
      showMainChips(); /* Always go to main help chips — no forced channel step */
    } else {
      (CH[page] || CH["home.html"]).forEach(function (t) {
        var b = el("button", "as-chip"); b.type = "button"; b.textContent = t; b.onclick = function () { ask(t); }; chips.appendChild(b);
      });
    }
  }
  function ask(t) {
    if (/^see all videos on whatsapp$/i.test(t)) { say(esc(t), "me"); say("Opening WhatsApp so " + esc(S.nickname) + " can share his videos with you.", "bot"); VWA.send("videos", {}); return; }
    if (/what should i put in the brief/i.test(t)) { say(esc(t), "me"); say("Tell him what the video is about, where it will be posted, how long it should be and when you need it.", "bot"); return; }
    if (/how fast do you reply/i.test(t)) { say(esc(t), "me"); say("Replies usually come within a day.", "bot"); return; }
    say(esc(t), "me");
    if (llmOn()) {
      var sendText = (!langDone && /^(English|हिंदी|हिन्दी|Hinglish)$/.test(t)) ? "Please talk to me in " + t + "." : (!langDone ? "Please talk to me in " + t + "." : t);
      if (!langDone) { langDone = true; chosenLang = t; showChips(); }
      /* mark channelDone if user typed their own channel description */
      else if (!channelDone && /my channel is about/i.test(t)) { channelDone = true; }
      llm(sendText);
    } else reply(t);
  }
  function open_() {
    panel.hidden = false; tip.hidden = true; launch.setAttribute("aria-expanded", "true"); launch.classList.add("open");
    if (!started) {
      started = true; var w = VWA.where(), n = VWA.name();
      say("Hi" + (n ? " " + esc(n) : "") + "! I'm <b>Glumb</b>, the AI assistant for " + esc(S.brand) + ". " + (llmOn() ? "Ask me anything — pricing, services, how it works — or tell me about your channel and I'll suggest the perfect edit. 👇 Pick a language first!" : "What would you like to know?"), "bot"); showChips();
    }
    snd("open"); setTimeout(function () { inp.focus(); }, 60);
  }
  function close_() { panel.hidden = true; launch.setAttribute("aria-expanded", "false"); launch.classList.remove("open"); }
  launch.onclick = function () { panel.hidden ? open_() : close_(); };
  panel.querySelector(".as-close").onclick = close_; tip.onclick = open_;
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close_(); });
  form.addEventListener("submit", function (e) { e.preventDefault(); var t = inp.value.trim(); if (!t) return; inp.value = ""; ask(t); });

  /* ---- optional: real AI replies through your own proxy (see /proxy) ---- */
  var API = (window.SITE && SITE.assistantApi) || "", fails = 0, hist = [], pend = [];
  function direct() { return !!(window.VAI && VAI.enabled); }
  function llmOn() { if (direct()) return fails < 2 && !VAI.cooling(); return !!API && fails < 2; }
  var told = "";
  if (API || (window.VAI && VAI.enabled)) panel.querySelector(".as-head small").textContent = "Glumb v1 · AI assistant";
  var FACTS = {
    services: ["Reels and Shorts: vertical edits with fast hooks, captions and sound", "YouTube and long-form: talking-head, vlog, podcast edits with b-roll, titles, chapters", "Ads and brand films: short promos that explain the offer in 3 seconds and end with a clear action", "Color and sound: grading, audio cleanup, music, final mix"],
    process: ["Send raw footage and a reference, plus the platform", "Rough cut in 1 to 3 days", "Color, sound, export, plus two rounds of changes"],
    timing: "First rough cut usually in 1 to 3 days. The visitor should mention their deadline in the brief.", revisions: "Two rounds of changes are included.",
    formats: "Exports sized for Instagram, YouTube, WhatsApp status or TV. Captions and titles available.",
    pricing: "Prices are not listed on the site. Each project is quoted personally on WhatsApp.",
    contact: { whatsapp: S.whatsappDisplay, email: S.email, reply: "Replies usually come within a day" },
    studio: S.brand + " is the video editing studio of " + S.realName + " (" + S.nickname + ").", game: "Beat Cutter on the Play page: tap when the line hits the glowing marker."
  };
  function cards() { return [].slice.call(document.querySelectorAll(".work-card[data-title]")); }
  function chipVals(k) { return [].slice.call(document.querySelectorAll('#order .chips[data-key="' + k + '"] .chip.on')).map(function (c) { return c.textContent.trim(); }); }
  function ctxObj() { var w = VWA.where(), pm = document.getElementById("projectModal"); return { site: { brand: S.brand, nickname: S.nickname, realName: S.realName }, page: w.page, section: w.section, name: VWA.name(), modalOpen: !!(pm && pm.classList.contains("open")) }; }
  function run(name, a) {
    var O = document.getElementById("order");
    if (name === "get_site_info") return a.topic && FACTS[a.topic] !== undefined ? FACTS[a.topic] : FACTS;
    if (name === "get_page_context") { var c = ctxObj(); if (O) c.orderForm = { services: chipVals("service"), length: chipVals("len")[0] || "", deadline: chipVals("when")[0] || "" }; return c; }
    if (name === "get_projects") return cards().map(function (c) { return { title: c.dataset.title, category: c.dataset.meta, about: c.dataset.body }; });
    if (name === "open_project") { var m = cards().filter(function (c) { return c.dataset.title.toLowerCase().indexOf(String(a.title || "").toLowerCase()) > -1; })[0]; if (!m) return { error: "No project with that title on this page" }; m.click(); return { opened: m.dataset.title }; }
    if (name === "go_to") {
      var t = String(a.target || ""), pages = { home: "home.html", services: "services.html", work: "work.html", about: "about.html", contact: "contact.html", play: "play.html", order: "home.html#order" };
      var here = document.getElementById(t); if (here && here.tagName === "SECTION") { here.scrollIntoView({ behavior: "smooth" }); return { scrolled: t }; }
      if (!pages[t]) return { error: "Unknown target" }; pend.push({ label: "Open " + t, href: pages[t] }); return { button_shown: true };
    }
    if (name === "prefill_order") {
      if (!O) return { error: "The order form is on the home page. Use go_to with target order." };
      var set = function (key, vals, multi) { var g = O.querySelector('.chips[data-key="' + key + '"]'), done = false; if (!g) return; g.querySelectorAll(".chip").forEach(function (c) { var hit = vals.some(function (v) { return c.textContent.toLowerCase().indexOf(String(v).toLowerCase()) > -1; }); if (multi) c.classList.toggle("on", hit); else { var on = hit && !done; if (on) done = true; c.classList.toggle("on", on); } }); };
      set("service", a.services || [], true); if (a.length) set("len", [a.length]); if (a.deadline) set("when", [a.deadline]);
      var nm = O.querySelector("#oName"); if (a.name) { VWA.setName(a.name); nm.value = VWA.name(); } nm.dispatchEvent(new Event("input"));
      O.scrollIntoView({ behavior: "smooth" }); return { filled: true, services: chipVals("service"), length: chipVals("len")[0] || "", deadline: chipVals("when")[0] || "", name_filled: !!nm.value.trim() };
    }
    if (name === "offer_whatsapp") { var it = ["general", "videos", "order", "assistant"].indexOf(a.intent) > -1 ? a.intent : "assistant"; pend.push(wa(it === "videos" ? "See all videos on WhatsApp" : it === "order" ? "Order on WhatsApp" : "Message on WhatsApp", it, [], a.note ? String(a.note).slice(0, 900) : "")); return { button_shown: true, visitor_must_tap: true }; }
    if (name === "save_name") { var n = VWA.setName(a.name); return { saved: !!n }; }
    return { error: "Unknown tool" };
  }
  function fmt(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>"); }
  var typ = null;
  function typing(on) { if (on && !typ) { typ = el("div", "as-msg bot", "<span class=\"as-dots\"><i></i><i></i><i></i></span>"); log.appendChild(typ); log.scrollTop = log.scrollHeight; } else if (!on && typ) { typ.remove(); typ = null; } }
  function post() {
    var cap = direct() ? 8 : 16; while (hist.length > cap) hist.shift(); while (hist.length && hist[0].role !== "user") hist.shift();
    if (direct()) return VAI.chat(hist, ctxObj());
    return fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: hist, context: ctxObj() }) }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function llm(q) {
    var base = hist.length; hist.push({ role: "user", content: q }); typing(true); pend = []; var rounds = 0;
    function step() {
      return post().then(function (j) {
        var m = j && j.choices && j.choices[0] && j.choices[0].message; if (!m) throw new Error("empty");
        if (m.tool_calls && m.tool_calls.length && rounds++ < 4) {
          hist.push({ role: "assistant", content: m.content || null, tool_calls: m.tool_calls });
          m.tool_calls.forEach(function (tc) { var out; try { out = run(tc.function.name, JSON.parse(tc.function.arguments || "{}")); } catch (e) { out = { error: String(e) }; } hist.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(out).slice(0, 2400) }); });
          return step();
        }
        typing(false); var t = (m.content || "").trim() || "Could you rephrase that?"; hist.push({ role: "assistant", content: t });
        say(fmt(t), "bot", pend.length ? pend : null); pend = []; fails = 0; snd("tick");
      });
    }
    step().catch(function (e) {
      typing(false); hist.length = base; if (!(direct() && VAI.cooling())) fails++; if (window.console) console.warn("AI call failed:", e && e.message);
      var em = (e && e.message) || "", why = /429/.test(em) ? "Groq's free limit was reached. Try again in a minute." : /HTTP 40[13]/.test(em) ? "Groq rejected the key. Check ai-key.js. (" + em + ")" : /HTTP 4\d\d/.test(em) ? "Groq rejected the request. Check the model name in ai-key.js. (" + em + ")" : "The browser could not reach Groq" + (em ? " (" + em + ")" : "") + ". This is usually CORS or no internet. Try opening the site through VS Code Live Server instead of the file path.";
      if (told !== why) { told = why; say("<b>AI unavailable:</b> " + esc(why) + "<br>Meanwhile I will answer from my built-in knowledge.", "bot"); }
      reply(q);
    });
  }

  /* proactive, context-aware nudges (a few per visit) */
  var NUDGE = {
    hero:     "What kind of channel do you run? I'll tell you exactly which edit style would work.",
    services: "Not sure which service fits your content? Tell me your niche and I'll narrow it down.",
    work:     "See something you like? Ask me what techniques Prex used — I know them all.",
    process:  "Curious what your video could look like after Prex edits it? Ask me.",
    order:    "Need help writing your brief? I'll craft the perfect WhatsApp message for you."
  };
  var PAGE_NUDGE = {
    "play.html":     "Aim for the glow, tap on the beat. Ask me if you're stuck.",
    "contact.html":  "Struggling with your brief? I'll write it for you — just tell me your channel.",
    "services.html": "Tell me your niche and I'll recommend the exact techniques that work for it.",
    "work.html":     "Want to know the editing techniques behind these projects? Just ask me."
  };
  var shown = {}, count = 0, key = "", since = Date.now();
  function curKey() { var y = innerHeight / 2, k = ""; document.querySelectorAll("section").forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= y && r.bottom >= y) k = s.classList.contains("hero") ? "hero" : (s.id || ""); }); return k || page; }
  function nudge(t, id) { if (shown[id] || count >= 3 || !panel.hidden) return; shown[id] = 1; count++; tip.textContent = t; tip.hidden = false; setTimeout(function () { tip.hidden = true; }, 7000); }
  setInterval(function () { var k = curKey(); if (k !== key) { key = k; since = Date.now(); return; } if (Date.now() - since > 7000) { var t = NUDGE[k] || PAGE_NUDGE[k]; if (t) nudge(t, k); } }, 1500);
  var pm = document.getElementById("projectModal");
  if (pm && window.MutationObserver) new MutationObserver(function () { if (pm.classList.contains("open")) nudge("Like this one? I can send you more videos on WhatsApp.", "pm:" + (document.getElementById("pmTitle") || {}).textContent); }).observe(pm, { attributes: true, attributeFilter: ["class"] });

  /* "before you go" — desktop: mouse leaves through the top; phone: coming back to the tab */
  var t0 = Date.now(), hiddenAt = 0, X = null;
  function maybeExit() {
    try { if (sessionStorage.getItem("vanguard-exit") || sessionStorage.getItem("vanguard-wa")) return; sessionStorage.setItem("vanguard-exit", "1"); } catch (e) {}
    if (Date.now() - t0 < 10000 || !panel.hidden || (VWA.gateOpen)) return;
    X = el("div", "wa-gate", '<div class="wa-box"><h2>Before you go</h2><p>Got a video in mind? Message ' + esc(S.nickname) + ' on WhatsApp and he will usually reply within a day. No pressure.</p><button type="button" class="btn btn-primary btn-lg" id="xGo">Message on WhatsApp</button><button type="button" class="wa-x" id="xNo">No thanks</button></div>');
    X.setAttribute("role", "dialog"); X.setAttribute("aria-modal", "true"); document.body.appendChild(X);
    function shut() { X.remove(); }
    X.addEventListener("click", function (e) { if (e.target === X || e.target.id === "xNo") shut(); });
    X.querySelector("#xGo").onclick = function () { shut(); VWA.send("exit", {}); };
    document.addEventListener("keydown", function k(e) { if (e.key === "Escape") { shut(); document.removeEventListener("keydown", k); } });
  }
  document.addEventListener("mouseout", function (e) { if (!e.relatedTarget && e.clientY <= 0) maybeExit(); });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt && Date.now() - hiddenAt > 3000 && matchMedia("(pointer: coarse)").matches) setTimeout(maybeExit, 600);
  });
})();
