/* ==========================================================================
   Vanguard Studio — interactions
   ========================================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Theme ---------------- */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("vanguard-theme", theme); } catch (e) {}
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(theme === "light"));
      themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
    });
    setTheme(root.getAttribute("data-theme") || "dark");
  }

  /* ---------------- Header + progress + to-top ---------------- */
  const header = $("#siteHeader");
  const progress = $("#progress");
  const toTop = $("#toTop");

  function onScroll() {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle("scrolled", y > 12);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
    if (toTop) toTop.classList.toggle("show", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  }

  /* ---------------- Mobile menu ---------------- */
  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");

  function setMenu(open) {
    if (!burger || !mobileMenu) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.classList.toggle("open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    burger.innerHTML = open
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>';
  }
  if (burger) burger.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
  if (mobileMenu) {
    $$("a", mobileMenu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setMenu(false);
      closeModal();
    }
    if (e.key === "Tab" && modal && modal.classList.contains("open")) {
      const focusable = $$('a[href], button:not([disabled]), input, textarea, select', modal)
        .filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------------- Reveal on scroll ---------------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------------- Counters ---------------- */
  const counters = $$("[data-count]");
  if (counters.length) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const decimals = (el.dataset.decimals && parseInt(el.dataset.decimals, 10)) || 0;
      const dur = 1500;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => { c.textContent = "0" + (c.dataset.suffix || ""); cio.observe(c); });
  }

  /* ---------------- Card spotlight ---------------- */
  $$(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  /* ---------------- Accordion ---------------- */
  $$(".acc-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".acc-item");
      const panel = $(".acc-panel", item);
      const isOpen = item.classList.contains("open");

      $$(".acc-item.open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("open");
          $(".acc-btn", openItem).setAttribute("aria-expanded", "false");
          $(".acc-panel", openItem).style.maxHeight = "0px";
        }
      });

      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : "0px";
    });
  });

  /* ---------------- Project filters ---------------- */
  const filters = $$(".chip[data-filter]");
  if (filters.length) {
    filters.forEach((chip) => {
      chip.addEventListener("click", () => {
        filters.forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        const f = chip.dataset.filter;
        $$(".work-card").forEach((card) => {
          const show = f === "all" || card.dataset.cat === f;
          card.style.display = show ? "" : "none";
          if (show && !reduceMotion) {
            card.animate(
              [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
              { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" }
            );
          }
        });
        const empty = $("#workEmpty");
        if (empty) empty.style.display = $$(".work-card").some((c) => c.style.display !== "none") ? "none" : "block";
      });
    });
  }

  /* ---------------- Project modal ---------------- */
  const modal = $("#projectModal");
  let lastFocused = null;

  function closeModal() {
    if (!modal || !modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function openModal(card) {
    if (!modal) { window.location.href = "work.html"; return; }
    lastFocused = document.activeElement;
    const d = card.dataset;
    $("#pmTitle", modal).textContent = d.title || "Case study";
    $("#pmMeta", modal).textContent = (d.client || "") + " · " + (d.year || "");
    $("#pmBody", modal).textContent = d.body || "";
    $("#pmMedia", modal).innerHTML = $(".work-media > svg", card) ? $(".work-media > svg", card).outerHTML : "";
    $("#pmTags", modal).innerHTML = (d.tags || "").split(",").filter(Boolean)
      .map((t) => "<span>" + t.trim() + "</span>").join("");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    $(".modal-close", modal).focus();
  }

  $$(".work-card").forEach((card) => {
    card.addEventListener("click", () => openModal(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(card); }
    });
  });

  if (modal) {
    $(".modal-close", modal).addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  }

  /* ---------------- Quote carousel ---------------- */
  const quotes = $$(".quote");
  if (quotes.length > 1) {
    let idx = 0;
    const dots = $$("[data-quote-dot]");
    let timer;

    const go = (n) => {
      idx = (n + quotes.length) % quotes.length;
      quotes.forEach((q, i) => q.classList.toggle("active", i === idx));
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    };
    const auto = () => {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(() => go(idx + 1), 6500);
    };
    const prev = $("#quotePrev");
    const next = $("#quoteNext");
    if (prev) prev.addEventListener("click", () => { go(idx - 1); auto(); });
    if (next) next.addEventListener("click", () => { go(idx + 1); auto(); });
    dots.forEach((d, i) => d.addEventListener("click", () => { go(i); auto(); }));
    go(0);
    auto();
  }

  /* ---------------- Forms ---------------- */
  $$("[data-form]").forEach((form) => {
    const ok = $(".form-ok", form);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      $$("input[required], textarea[required], select[required]", form).forEach((input) => {
        const field = input.closest(".field");
        if (!field) return;
        let bad = !input.value.trim();
        if (!bad && input.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        field.classList.toggle("invalid", bad);
        input.setAttribute("aria-invalid", String(bad));
        if (bad) valid = false;
      });

      if (!valid) {
        const firstBad = $(".field.invalid input, .field.invalid textarea", form);
        if (firstBad) firstBad.focus();
        return;
      }

      const btn = $("button[type=submit]", form);
      const label = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

      setTimeout(() => {
        if (btn) { btn.disabled = false; btn.innerHTML = label; }
        form.reset();
        if (ok) {
          ok.classList.add("show");
          ok.setAttribute("role", "status");
          setTimeout(() => ok.classList.remove("show"), 6000);
        }
      }, 900);
    });

    $$("input, textarea", form).forEach((input) => {
      input.addEventListener("input", () => {
        const field = input.closest(".field");
        if (field) field.classList.remove("invalid");
      });
    });
  });

  /* ---------------- Newsletter ---------------- */
  $$("[data-newsletter]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("input", form);
      if (!input || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value)) {
        if (input) { input.focus(); input.style.borderColor = "#f43f5e"; }
        return;
      }
      const btn = $("button", form);
      if (btn) btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
      input.value = "";
      input.placeholder = "You're on the list ✓";
      setTimeout(() => { input.placeholder = "you@company.com"; }, 4000);
    });
  });

  /* ---------------- Year ---------------- */
  $$("[data-current-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
