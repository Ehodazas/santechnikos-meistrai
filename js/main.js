/* ==========================================================================
   Santechnikos Meistrai — sąsaja ir animacijos (v2)
   Viskas veikia ir be GSAP / Lenis: bibliotekos tik prideda judesį.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var Split = window.SplitText;
  var lenis = null;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function headerH() { var h = $(".site-header"); return h ? h.offsetHeight : 0; }

  if (gsap && ST) gsap.registerPlugin(ST);
  if (gsap && Split) gsap.registerPlugin(Split);

  /* ---------- Metai, konfigūracija ---------- */
  var yearEl = $("#metai");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var cfg = window.SITE_CONFIG || {};
  $$("[data-config]").forEach(function (el) {
    var key = el.getAttribute("data-config");
    if (cfg[key]) el.textContent = cfg[key];
  });
  $$("[data-config-link]").forEach(function (el) {
    var key = el.getAttribute("data-config-link");
    if (key === "phone" && cfg.phoneHref) el.setAttribute("href", "tel:" + cfg.phoneHref);
    if (key === "email" && cfg.email) el.setAttribute("href", "mailto:" + cfg.email);
  });
  if (cfg.demo === false) $$("[data-demo-only]").forEach(function (el) { el.remove(); });

  /* ---------- Sklandus slinkimas (Lenis) ---------- */
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    if (gsap && ST) {
      lenis.on("scroll", ST.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  function lockScroll(on) {
    doc.body.classList.toggle("is-locked", on);
    if (lenis) { if (on) lenis.stop(); else lenis.start(); }
  }

  function scrollToEl(el, done, instant) {
    if (!el) return;
    // Absoliuti pozicija pagal tikrą window.scrollY (Lenis būsena gali atsilikti po naršyklės šuolio)
    var y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - (headerH() + 8));
    if (lenis) {
      if (instant) { lenis.scrollTo(y, { immediate: true, force: true }); if (done) done(); }
      else lenis.scrollTo(y, { duration: 1.3, onComplete: done });
    } else {
      window.scrollTo({ top: y, behavior: reduce || instant ? "auto" : "smooth" });
      if (done) setTimeout(done, reduce ? 0 : 700);
    }
  }

  /* ---------- Antraštė: fonas, slėpimas, progreso juosta ---------- */
  var header = $(".site-header");
  var bar = $(".scroll-progress");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 10);
      var menuOpen = header.classList.contains("menu-open");
      if (!menuOpen && y > 400 && y > lastY + 4) header.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 400) header.classList.remove("is-hidden");
    }
    if (bar) {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobilus meniu ---------- */
  var toggle = $(".menu-toggle");
  var nav = $("#pagrindinis-meniu");
  var desktopMq = window.matchMedia("(min-width: 1080px)");

  function setMenu(open, opts) {
    if (!toggle || !nav) return;
    opts = opts || {};
    toggle.setAttribute("aria-expanded", String(open));
    $(".visually-hidden", toggle).textContent = open ? "Uždaryti meniu" : "Atidaryti meniu";
    $(".menu-toggle-label", toggle).textContent = open ? "Uždaryti" : "Meniu";
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    header.classList.remove("is-hidden");
    if (!desktopMq.matches) {
      if (open) nav.removeAttribute("inert"); else nav.setAttribute("inert", "");
      lockScroll(open);
    }
    if (open) setTimeout(function () { var a = $("a", nav); if (a) a.focus({ preventScroll: true }); }, 300);
    else if (opts.returnFocus) toggle.focus();
  }
  function syncNav() {
    if (!nav) return;
    if (desktopMq.matches) {
      nav.removeAttribute("inert");
      if (nav.classList.contains("is-open")) { setMenu(false); lockScroll(false); }
    } else if (!nav.classList.contains("is-open")) nav.setAttribute("inert", "");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    doc.addEventListener("keydown", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (e.key === "Escape") { setMenu(false, { returnFocus: true }); return; }
      if (e.key !== "Tab") return;
      var items = [toggle].concat($$("a", nav));
      var idx = items.indexOf(doc.activeElement);
      if (e.shiftKey && idx === 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && idx === items.length - 1) { e.preventDefault(); items[0].focus(); }
    });
    if (desktopMq.addEventListener) desktopMq.addEventListener("change", syncNav); else desktopMq.addListener(syncNav);
    syncNav();
  }

  /* ---------- Darbų katalogo skirtukai ---------- */
  var tabsRoot = $("[data-tabs]");
  var tabs = tabsRoot ? $$("[role=tab]", tabsRoot) : [];
  var indicator = tabsRoot ? $(".cat-tab-indicator", tabsRoot) : null;

  function moveIndicator(tab) {
    if (!indicator || !tab) return;
    indicator.style.transform = "translateY(" + tab.offsetTop + "px)";
    indicator.style.height = tab.offsetHeight + "px";
  }
  function activateTab(tab, opts) {
    opts = opts || {};
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = doc.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    moveIndicator(tab);
    if (tab.scrollIntoView && tab.parentElement.scrollWidth > tab.parentElement.clientWidth) {
      tab.parentElement.scrollTo({ left: tab.offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
    }
    var panelEl = doc.getElementById(tab.getAttribute("aria-controls"));
    if (gsap && !reduce && opts.animate !== false && panelEl) {
      gsap.fromTo([$(".cat-panel-head", panelEl)].concat($$(".job-list li", panelEl), [$(".btn", panelEl)]),
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.045, overwrite: true });
      gsap.fromTo($(".cat-icon", panelEl), { scale: 0.6, rotate: -25 }, { scale: 1, rotate: 0, duration: 0.7, ease: "back.out(2)" });
    }
    if (opts.focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activateTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") n = tabs[0];
      else if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); activateTab(n, { focus: true }); }
    });
  });
  if (tabs.length) {
    moveIndicator(tabs[0]);
    window.addEventListener("resize", function () {
      moveIndicator(tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0]);
    });
  }
  function tabForPanelId(id) {
    return tabs.filter(function (t) { return t.getAttribute("aria-controls") === id; })[0] || null;
  }

  /* ---------- Vidinės nuorodos ---------- */
  function goToHash(hash, push, instant) {
    var id = hash.replace(/^#/, "");
    if (!id) return false;
    var el = doc.getElementById(id);
    if (!el) return false;
    var tab = tabForPanelId(id);
    if (tab) { activateTab(tab, { animate: true }); el = doc.getElementById("paslaugu-aprasymai"); }
    if (push && history.pushState) history.pushState(null, "", "#" + id);
    scrollToEl(el, null, instant);
    return true;
  }
  doc.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var hash = a.getAttribute("href");
    if (hash.length < 2) return;
    // Paslaugos nuoroda užpildo formą
    var svc = a.getAttribute("data-service");
    if (svc) setService(svc);
    var menuWasOpen = nav && nav.classList.contains("is-open");
    if (menuWasOpen) setMenu(false);
    if (doc.getElementById(hash.slice(1))) {
      e.preventDefault();
      setTimeout(function () { goToHash(hash, true); }, menuWasOpen ? 420 : 0);
    }
  });

  /* ---------- Aktyvi navigacijos nuoroda ---------- */
  var navLinks = $$(".nav-list a");
  var sectionMap = {
    "pradzia": "pradzia", "paslaugos": "paslaugos", "paslaugu-aprasymai": "paslaugos",
    "apie-mus": "apie-mus", "atlikti-darbai": "atlikti-darbai", "kaip-dirbame": "atlikti-darbai",
    "duk": "duk", "kontaktai": "kontaktai"
  };
  if ("IntersectionObserver" in window && navLinks.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var target = sectionMap[entry.target.id];
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + target) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(sectionMap).forEach(function (id) { var s = doc.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- DUK akordeonas ---------- */
  $$("[data-accordion]").forEach(function (acc) {
    var triggers = $$(".acc-trigger", acc);
    triggers.forEach(function (btn, i) {
      var panel = doc.getElementById(btn.getAttribute("aria-controls"));
      var item = btn.closest(".acc-item");
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        item.classList.toggle("is-open", !open);
        if (!gsap || reduce) { panel.hidden = open; return; }
        if (open) {
          gsap.to(panel, { height: 0, duration: 0.5, ease: "power3.inOut", overwrite: true,
            onComplete: function () { panel.hidden = true; gsap.set(panel, { clearProps: "height" }); } });
        } else {
          panel.hidden = false;
          gsap.fromTo(panel, { height: 0 }, { height: "auto", duration: 0.6, ease: "power3.out", overwrite: true,
            onComplete: function () { gsap.set(panel, { clearProps: "height" }); } });
          gsap.fromTo($(".acc-inner", panel), { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, delay: 0.1 });
        }
      });
      btn.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowDown") n = triggers[(i + 1) % triggers.length];
        else if (e.key === "ArrowUp") n = triggers[(i - 1 + triggers.length) % triggers.length];
        else if (e.key === "Home") n = triggers[0];
        else if (e.key === "End") n = triggers[triggers.length - 1];
        if (n) { e.preventDefault(); n.focus(); }
      });
    });
  });

  /* ---------- Galerija + lightbox ---------- */
  var dialog = $("#lightbox");
  var galleryBtns = $$(".gallery-btn");
  var current = 0, lastFocus = null;

  function showSlide(i, dir) {
    current = (i + galleryBtns.length) % galleryBtns.length;
    var btn = galleryBtns[current];
    var thumb = $("img", btn);
    var img = $(".lightbox-img", dialog);
    img.src = btn.getAttribute("data-full");
    img.alt = thumb ? thumb.alt : "";
    $(".lightbox-title", dialog).textContent = btn.getAttribute("data-title") || "";
    $(".lightbox-count", dialog).textContent = (current + 1) + " / " + galleryBtns.length;
    if (gsap && !reduce) {
      gsap.fromTo(img, { x: (dir || 0) * 60, autoAlpha: 0, scale: dir ? 1 : 0.94 },
        { x: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: "power3.out", overwrite: true });
    }
  }
  function openLightbox(i) {
    if (!dialog || typeof dialog.showModal !== "function") {
      window.open(galleryBtns[i].getAttribute("data-full"), "_blank", "noopener");
      return;
    }
    lastFocus = doc.activeElement;
    dialog.showModal();
    showSlide(i, 0);
    lockScroll(true);
    if (gsap && !reduce) gsap.fromTo(dialog, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
    $(".lb-close", dialog).focus();
  }
  function closeLightbox() { if (dialog && dialog.open) dialog.close(); }

  if (dialog && galleryBtns.length) {
    galleryBtns.forEach(function (btn, i) { btn.addEventListener("click", function () { openLightbox(i); }); });
    $(".lb-close", dialog).addEventListener("click", closeLightbox);
    $(".lb-prev", dialog).addEventListener("click", function () { showSlide(current - 1, -1); });
    $(".lb-next", dialog).addEventListener("click", function () { showSlide(current + 1, 1); });
    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); showSlide(current - 1, -1); }
      if (e.key === "ArrowRight") { e.preventDefault(); showSlide(current + 1, 1); }
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.classList.contains("lightbox-figure")) closeLightbox();
    });
    dialog.addEventListener("close", function () {
      lockScroll(false);
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    });
    var startX = null;
    dialog.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) showSlide(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      startX = null;
    });
  }

  /* ---------- Formos ---------- */
  var form = $("#uzklausa");
  var serviceSelect = $("#f-paslauga");

  function setService(value) {
    if (!serviceSelect || !value) return;
    serviceSelect.value = value;
    if (serviceSelect.value !== value) serviceSelect.value = "";
    clearError(serviceSelect);
  }

  // Greitos užklausos kortelė hero dalyje
  var quick = $("[data-quick-form]");
  if (quick) {
    quick.addEventListener("submit", function (e) {
      e.preventDefault();
      var checked = $("input[name=paslauga]:checked", quick);
      if (checked) setService(checked.value);
      scrollToEl($("#kontaktai"), function () { var f = $("#f-vardas"); if (f) f.focus({ preventScroll: true }); });
    });
  }
  // Be JS greitoji forma nuveda su ?paslauga=... — užpildome pasirinkimą
  try {
    var qs = new URLSearchParams(window.location.search).get("paslauga");
    if (qs) setService(qs);
  } catch (err) { /* nieko */ }

  var messages = {
    vardas: { valueMissing: "Įrašykite savo vardą.", tooShort: "Vardas turi būti bent 2 simbolių." },
    telefonas: { valueMissing: "Įrašykite telefono numerį, kad galėtume su jumis susisiekti.", invalid: "Patikrinkite numerį. Pavyzdžiui: +370 612 34567 arba 8 612 34567." },
    elpastas: { invalid: "Patikrinkite el. pašto adresą. Pavyzdžiui: vardas@pavyzdys.lt." },
    paslauga: { valueMissing: "Pasirinkite paslaugą arba „Kita / nesu tikras“." },
    zinute: { valueMissing: "Trumpai aprašykite, ką reikia atlikti.", tooShort: "Parašykite šiek tiek daugiau: bent 10 simbolių." },
    sutikimas: { valueMissing: "Norėdami tęsti, pažymėkite sutikimą dėl duomenų naudojimo." }
  };
  function fieldOf(input) { return input.closest(".field"); }
  function errEl(input) { return doc.getElementById(input.id + "-err"); }
  function setError(input, msg) {
    fieldOf(input).classList.add("has-error");
    input.setAttribute("aria-invalid", "true");
    errEl(input).textContent = msg;
  }
  function clearError(input) {
    fieldOf(input).classList.remove("has-error");
    input.removeAttribute("aria-invalid");
    errEl(input).textContent = "";
  }
  function validPhone(v) { return /^(\+370\d{8}|8\d{8}|\+\d{8,15})$/.test(v.replace(/[\s\-()]/g, "")); }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function validate(input) {
    var name = input.name, m = messages[name] || {};
    var v = input.type === "checkbox" ? input.checked : input.value.trim();
    if (input.required && !v) { setError(input, m.valueMissing); return false; }
    if (name === "vardas" && v.length < 2) { setError(input, m.tooShort); return false; }
    if (name === "zinute" && v.length < 10) { setError(input, m.tooShort); return false; }
    if (name === "telefonas" && !validPhone(v)) { setError(input, m.invalid); return false; }
    if (name === "elpastas" && v && !validEmail(v)) { setError(input, m.invalid); return false; }
    clearError(input);
    return true;
  }

  if (form) {
    var inputs = $$("input, select, textarea", form);
    var status = $("#form-status");

    inputs.forEach(function (input) {
      input.addEventListener("blur", function () {
        if (input.type === "checkbox") return;
        if (input.value.trim() || fieldOf(input).classList.contains("has-error")) validate(input);
      });
      input.addEventListener(input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "input", function () {
        if (fieldOf(input).classList.contains("has-error")) validate(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      inputs.forEach(function (input) { if (!validate(input) && !firstInvalid) firstInvalid = input; });

      if (firstInvalid) {
        status.hidden = false;
        status.className = "form-status is-error";
        status.textContent = "Formoje yra klaidų. Pataisykite pažymėtus laukus ir bandykite dar kartą.";
        if (gsap && !reduce) gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
        firstInvalid.focus();
        return;
      }

      var data = {
        vardas: form.vardas.value.trim(),
        telefonas: form.telefonas.value.trim(),
        elpastas: form.elpastas.value.trim(),
        paslauga: serviceSelect.options[serviceSelect.selectedIndex].text,
        zinute: form.zinute.value.trim()
      };
      var subject = "Užklausa: " + data.paslauga;
      var body =
        "Sveiki,\n\n" + data.zinute + "\n\n" +
        "Paslauga: " + data.paslauga + "\n" +
        "Vardas: " + data.vardas + "\n" +
        "Telefonas: " + data.telefonas + "\n" +
        (data.elpastas ? "El. paštas: " + data.elpastas + "\n" : "") +
        "\nSutinku, kad mano duomenys būtų naudojami atsakant į šią užklausą.";
      var to = cfg.email || "info@jusu-imone.lt";
      var mailto = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      status.hidden = false;
      status.className = "form-status";
      status.innerHTML =
        '<h4><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Laiškas paruoštas</h4>' +
        "<p>Jūsų el. pašto programoje turėtų atsidaryti užpildytas laiškas adresu <strong></strong>. Kad užklausa pasiektų mus, laišką išsiųskite patys.</p>" +
        "<p>Jei programa neatsidarė, nukopijuokite tekstą ir išsiųskite jį bet kuriuo el. paštu.</p>" +
        '<div class="status-actions">' +
        '<a class="btn btn-ink" data-mailto>Atidaryti dar kartą</a>' +
        '<button class="btn btn-outline" type="button" data-copy>Kopijuoti laiško tekstą</button>' +
        "</div>";
      $("strong", status).textContent = to;
      $("[data-mailto]", status).setAttribute("href", mailto);
      var copyBtn = $("[data-copy]", status);
      copyBtn.addEventListener("click", function () {
        var text = "Kam: " + to + "\nTema: " + subject + "\n\n" + body;
        var done = function () { copyBtn.textContent = "Nukopijuota"; };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
        else { fallbackCopy(text); done(); }
      });
      if (gsap && !reduce) gsap.fromTo(status, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" });
      status.focus({ preventScroll: true });
      window.location.href = mailto;
    });
  }
  function fallbackCopy(text) {
    var ta = doc.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.opacity = "0";
    doc.body.appendChild(ta); ta.select();
    try { doc.execCommand("copy"); } catch (err) { /* nieko */ }
    ta.remove();
  }

  /* ---------- Bėganti juosta: greitis pagal slinkimą ---------- */
  var tickerTrack = $("[data-ticker]");
  if (tickerTrack && !reduce && tickerTrack.getAnimations) {
    var tickerAnim = tickerTrack.getAnimations()[0];
    var rate = 1, prevY = window.scrollY;
    var tick = function () {
      var y = window.scrollY, v = y - prevY; prevY = y;
      var target = 1 + Math.max(-3, Math.min(6, v * 0.25));
      rate += (target - rate) * 0.08;
      if (tickerAnim) tickerAnim.playbackRate = Math.abs(rate) < 0.15 ? 0.15 * Math.sign(rate || 1) : rate;
      requestAnimationFrame(tick);
    };
    if (tickerAnim) requestAnimationFrame(tick);
  }

  /* ---------- Magnetiniai mygtukai ir žymeklis ---------- */
  if (gsap && finePointer && !reduce) {
    $$(".btn-magnetic").forEach(function (btn) {
      var xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3.out" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3.out" });
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      btn.addEventListener("mouseleave", function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)", overwrite: true });
      });
    });

    var cursor = $(".cursor");
    if (cursor) {
      root.classList.add("has-cursor");
      var cx = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3.out" });
      var cy = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3.out" });
      window.addEventListener("mousemove", function (e) { cx(e.clientX); cy(e.clientY); }, { passive: true });
      galleryBtns.forEach(function (b) {
        b.addEventListener("mouseenter", function () { cursor.classList.add("is-active"); });
        b.addEventListener("mouseleave", function () { cursor.classList.remove("is-active"); });
      });
    }
  }

  /* ==========================================================================
     GSAP scenarijai
     ========================================================================== */
  function endIntro() { root.classList.remove("intro"); }

  if (!gsap || !ST || reduce) { endIntro(); handleInitialHash(); return; }

  function splitLines(el, vars) {
    if (!Split) return null;
    return Split.create(el, {
      type: "lines", mask: "lines", linesClass: "split-line", autoSplit: true,
      onSplit: function (self) { return gsap.from(self.lines, vars); }
    });
  }

  function initMotion() {
    var mm = gsap.matchMedia();

    /* --- Hero įžanga --- */
    var heroTitle = $("[data-split-hero]");
    var heroItems = $$(".hero [data-hero-item]");
    gsap.set(heroItems, { autoAlpha: 0, y: 30 });
    endIntro();
    var rootCss = getComputedStyle(root);
    var fx = parseFloat(rootCss.getPropertyValue("--frame-x")) || 16;
    var fr = parseFloat(rootCss.getPropertyValue("--frame-r")) || 28;
    var intro = gsap.timeline({ defaults: { ease: "expo.out" } });
    intro
      .fromTo(".hero-frame",
        { "--frame-x": Math.round(window.innerWidth * 0.12) + "px", "--frame-r": "60px" },
        { "--frame-x": fx + "px", "--frame-r": fr + "px", duration: 1.6, ease: "expo.inOut" }, 0)
      .from(".hero-media img", { scale: 1.35, duration: 2.2, ease: "expo.out" }, 0)
      .from(".site-header .logo, .site-header .header-cta, .site-header .menu-toggle, .nav-list li", { y: -30, opacity: 0, duration: 1, stagger: 0.05, clearProps: "transform,opacity" }, 0.5)
      .to(heroItems, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.1 }, 1.0);
    if (heroTitle && Split) {
      Split.create(heroTitle, {
        type: "lines", mask: "lines", linesClass: "split-line", autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.09, delay: 0.75 });
        }
      });
    }

    /* --- Hero rėmas išsiplečia slenkant, nuotrauka juda lėčiau --- */
    gsap.fromTo(".hero-frame", { "--frame-x": fx + "px", "--frame-r": fr + "px" }, {
      "--frame-x": "0px", "--frame-r": "0px", ease: "none", immediateRender: false,
      scrollTrigger: { trigger: ".hero", start: "top top", end: "+=55%", scrub: true }
    });
    gsap.to(".hero-media img", {
      yPercent: 14, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero-inner", {
      y: -60, autoAlpha: 0.2, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true }
    });

    /* --- Sekcijų antraštės: eilutės kyla iš kaukės --- */
    $$("[data-split]").forEach(function (el) {
      splitLines(el, {
        yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
    $$(".eyebrow, .section-intro").forEach(function (el) {
      if (el.closest(".hero")) return;
      gsap.from(el, { y: 20, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });

    /* --- Paslaugos: horizontali juosta kompiuteryje, kortelės telefone --- */
    var services = $(".services");
    var track = $("[data-services-track]");
    var pin = $("[data-services-pin]");
    var sBar = $("[data-services-bar]");
    mm.add("(min-width: 1100px)", function () {
      services.classList.add("is-horizontal");
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: {
          trigger: pin, pin: true, start: "top top",
          end: function () { return "+=" + dist(); },
          scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { if (sBar) sBar.style.transform = "scaleX(" + self.progress + ")"; }
        }
      });
      // Kortelių nuotraukos „atsidaro“ joms įvažiuojant
      $$(".svc", track).forEach(function (card) {
        gsap.from($(".svc-media img", card), {
          scale: 1.35, ease: "none",
          scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "left 40%", scrub: true }
        });
      });
      return function () { services.classList.remove("is-horizontal"); gsap.set(track, { clearProps: "transform" }); };
    });
    mm.add("(max-width: 1099px)", function () {
      ST.batch(".svc", {
        start: "top 88%", once: true,
        onEnter: function (els) {
          gsap.fromTo(els, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: "expo.out", stagger: 0.1 });
        }
      });
    });

    /* --- Katalogas --- */
    gsap.from(".catalog-grid", {
      y: 80, autoAlpha: 0, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: ".catalog-grid", start: "top 85%", once: true }
    });

    /* --- Apie mus: žodžiai ryškėja slenkant, nuotrauka su paralakse --- */
    var statement = $("[data-reveal-words]");
    if (statement && Split) {
      Split.create(statement, {
        type: "words", wordsClass: "word", autoSplit: true,
        onSplit: function (self) {
          return gsap.fromTo(self.words, { opacity: 0.16 }, {
            opacity: 1, ease: "none", stagger: 0.1,
            scrollTrigger: { trigger: statement, start: "top 80%", end: "bottom 45%", scrub: true }
          });
        }
      });
    }
    $$("[data-parallax]").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -8 }, {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: img.closest("[data-parallax-wrap]") || img, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
    gsap.from(".about-photo", {
      clipPath: "inset(30% 10% 30% 10% round 28px)", duration: 1.6, ease: "expo.out",
      scrollTrigger: { trigger: ".about-photo", start: "top 85%", once: true }
    });
    gsap.from(".about-block", {
      y: 80, rotate: -4, autoAlpha: 0, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: ".about-block", start: "top 95%", once: true }
    });
    ST.batch(".principle", {
      start: "top 88%", once: true,
      onEnter: function (els) { gsap.from(els, { y: 50, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.12 }); }
    });

    /* --- Galerija: kortelės atsiveria iš apačios --- */
    ST.batch(".gallery-item, .gallery-cta", {
      start: "top 90%", once: true,
      onEnter: function (els) {
        els.forEach(function (el, i) {
          var tl = gsap.timeline({ delay: i * 0.1 });
          tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0% round 18px)" },
            { clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.3, ease: "expo.inOut", clearProps: "clipPath" });
          var img = $(".gallery-img img", el);
          if (img) tl.fromTo(img, { scale: 1.4 }, { scale: 1, duration: 1.6, ease: "expo.out", clearProps: "transform" }, 0.15);
        });
      }
    });

    /* --- Darbo eiga: vanduo teka vamzdžiu --- */
    var pipeline = $("[data-pipeline]");
    if (pipeline) {
      var steps = $$("[data-step]", pipeline);
      var lastStep = steps[steps.length - 1];
      pipeline.classList.add("is-ready");
      pipeline.style.setProperty("--p", 0);
      ST.create({
        trigger: pipeline, start: "top 62%",
        endTrigger: lastStep, end: "top 62%",
        scrub: 0.6,
        onUpdate: function (self) {
          pipeline.style.setProperty("--p", self.progress.toFixed(4));
          pipeline.style.setProperty("--drop-o", self.progress > 0.001 && self.progress < 0.999 ? 1 : 0);
        }
      });
      steps.forEach(function (step) {
        ST.create({
          trigger: step, start: "top 64%",
          onEnter: function () { step.classList.add("is-active"); },
          onLeaveBack: function () { step.classList.remove("is-active"); }
        });
      });
    }

    /* --- DUK ir kontaktai --- */
    ST.batch(".acc-item", {
      start: "top 92%", once: true,
      onEnter: function (els) { gsap.from(els, { y: 40, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 }); }
    });
    gsap.from(".form-card", {
      y: 100, autoAlpha: 0, duration: 1.3, ease: "expo.out",
      scrollTrigger: { trigger: ".form-card", start: "top 90%", once: true }
    });
    ST.batch(".contact-list li", {
      start: "top 92%", once: true,
      onEnter: function (els) { gsap.from(els, { x: -30, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 }); }
    });

    /* --- Poraštė: didelis užrašas kyla raidėmis --- */
    var mark = $("[data-footer-mark]");
    if (mark && Split) {
      Split.create(mark, {
        type: "chars", mask: "chars", autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.chars, {
            yPercent: 100, duration: 1.1, ease: "expo.out", stagger: 0.025,
            scrollTrigger: { trigger: ".footer-mark", start: "top 98%", once: true }
          });
        }
      });
    }

    // Kai pasikrauna paveikslėliai — perskaičiuojame pozicijas
    window.addEventListener("load", function () { ST.refresh(); });
  }

  var started = false;
  function start() { if (started) return; started = true; initMotion(); handleInitialHash(); }
  function handleInitialHash() {
    if (!location.hash) return;
    var tab = tabForPanelId(location.hash.slice(1));
    if (tab) activateTab(tab, { animate: false });
    var go = function () {
      setTimeout(function () { if (ST) ST.refresh(); goToHash(location.hash, false, true); }, 150);
    };
    if (doc.readyState === "complete") go(); else window.addEventListener("load", go);
  }
  if (doc.fonts && doc.fonts.ready) {
    doc.fonts.ready.then(start);
    setTimeout(start, 1500);
  } else start();
})();
