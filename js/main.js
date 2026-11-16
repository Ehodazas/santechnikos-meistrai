/* ==========================================================================
   Santechnikos Meistrai — sąsaja ir animacijos (v3)
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
  var motion = !!(gsap && !reduce);

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
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false });
    if (gsap && ST) {
      ST.config({ ignoreMobileResize: true });
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
      else lenis.scrollTo(y, { duration: 1.2, onComplete: done });
    } else {
      window.scrollTo({ top: y, behavior: reduce || instant ? "auto" : "smooth" });
      if (done) setTimeout(done, reduce || instant ? 0 : 700);
    }
  }

  /* ---------- Antraštė: fonas, slėpimas, progreso juosta ---------- */
  var header = $(".site-header");
  var bar = $(".scroll-progress");
  var lastY = window.scrollY;
  var maxScroll = 1;
  function measure() { maxScroll = Math.max(1, root.scrollHeight - window.innerHeight); }
  measure();
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  if (ST) ST.addEventListener("refresh", measure);
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 10);
      var menuOpen = header.classList.contains("menu-open");
      if (!menuOpen && y > 400 && y > lastY + 4) header.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 400) header.classList.remove("is-hidden");
    }
    if (bar) bar.style.transform = "scaleX(" + Math.min(y / maxScroll, 1) + ")";
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
      if (nav.classList.contains("is-open")) setMenu(false);
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

  /* ---------- Išskleidžiami blokai (paslaugos ir DUK) ---------- */
  function setRegion(btn, open, animate) {
    var panel = doc.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    var isOpen = btn.getAttribute("aria-expanded") === "true";
    if (isOpen === open && panel.hidden === !open) return;
    btn.setAttribute("aria-expanded", String(open));
    var item = btn.closest(".acc-item, .svc-row");
    if (item) item.classList.toggle("is-open", open);
    if (!motion || animate === false) {
      panel.hidden = !open;
      if (gsap) gsap.set(panel, { clearProps: "height" });
      return;
    }
    if (open) {
      panel.hidden = false;
      gsap.fromTo(panel, { height: 0 }, { height: "auto", duration: 0.6, ease: "power3.out", overwrite: true,
        onComplete: function () { gsap.set(panel, { clearProps: "height" }); if (ST) ST.refresh(); } });
      gsap.fromTo(panel.firstElementChild, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, delay: 0.08, ease: "power3.out", overwrite: true });
    } else {
      gsap.to(panel, { height: 0, duration: 0.45, ease: "power3.inOut", overwrite: true,
        onComplete: function () { panel.hidden = true; gsap.set(panel, { clearProps: "height" }); if (ST) ST.refresh(); } });
    }
  }
  function arrowNav(list, i, e) {
    var n = null;
    if (e.key === "ArrowDown") n = list[(i + 1) % list.length];
    else if (e.key === "ArrowUp") n = list[(i - 1 + list.length) % list.length];
    else if (e.key === "Home") n = list[0];
    else if (e.key === "End") n = list[list.length - 1];
    if (n) { e.preventDefault(); n.focus(); }
  }

  // DUK: kiekvienas klausimas atsidaro atskirai
  $$("[data-accordion]").forEach(function (acc) {
    var triggers = $$(".acc-trigger", acc);
    triggers.forEach(function (btn, i) {
      btn.addEventListener("click", function () { setRegion(btn, btn.getAttribute("aria-expanded") !== "true"); });
      btn.addEventListener("keydown", function (e) { arrowNav(triggers, i, e); });
    });
  });

  // Paslaugos: vienu metu atidaryta viena; nuotrauka kairėje seka atidarytą paslaugą
  var svcList = $("[data-svc-list]");
  var svcTriggers = svcList ? $$(".svc-trigger", svcList) : [];
  var svcImgs = $$(".svc-img");
  var svcCount = $("[data-svc-count]");
  function showSvcImage(i) {
    svcImgs.forEach(function (img, j) { img.classList.toggle("is-active", j === i); });
    if (svcCount) svcCount.textContent = (i < 9 ? "0" : "") + (i + 1);
  }
  function openService(btn, opts) {
    opts = opts || {};
    var idx = svcTriggers.indexOf(btn);
    svcTriggers.forEach(function (b) { if (b !== btn) setRegion(b, false, opts.animate); });
    setRegion(btn, true, opts.animate);
    if (idx > -1) showSvcImage(idx);
  }
  svcTriggers.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      if (btn.getAttribute("aria-expanded") === "true") setRegion(btn, false);
      else openService(btn);
    });
    btn.addEventListener("keydown", function (e) { arrowNav(svcTriggers, i, e); });
  });

  /* ---------- Vidinės nuorodos ---------- */
  function goToHash(hash, push, instant) {
    var id = hash.replace(/^#/, "");
    if (!id) return false;
    var el = doc.getElementById(id);
    if (!el) return false;
    if (el.classList.contains("svc-row")) openService($(".svc-trigger", el), { animate: !instant });
    if (push && history.pushState) history.pushState(null, "", "#" + id);
    // Paslaugos eilutė atsidaro animuotai — palaukiame, kol aukštis nusistovės
    var delay = el.classList.contains("svc-row") && !instant && motion ? 480 : 0;
    setTimeout(function () { scrollToEl(el, null, instant); }, delay);
    return true;
  }
  doc.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var hash = a.getAttribute("href");
    if (hash.length < 2) return;
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
    "pradzia": "pradzia", "paslaugos": "paslaugos", "apie-mus": "apie-mus",
    "atlikti-darbai": "atlikti-darbai", "kaip-dirbame": "atlikti-darbai",
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
    if (motion) {
      gsap.fromTo(img, { x: (dir || 0) * 50, autoAlpha: 0, scale: dir ? 1 : 0.95 },
        { x: 0, autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out", overwrite: true });
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

  /* ==========================================================================
     Užklausos asistentas
     ========================================================================== */
  var form = $("#uzklausa");
  var status = $("#form-status");
  var endpoint = (cfg.formEndpoint || "").trim();
  var submitBtn = form ? $("[data-submit]", form) : null;
  var submitLabel = form ? $("[data-submit-label]", form) : null;

  function catInputs() { return form ? $$("input[name=kategorija]", form) : []; }
  function currentCat() { var c = catInputs().filter(function (i) { return i.checked; })[0]; return c || null; }

  // Rodomas tik pasirinktai sričiai skirtas patikslinimas; žingsnių numeriai persiskaičiuoja
  function updateFollowups(animate) {
    if (!form) return;
    var cat = currentCat();
    var value = cat ? cat.value : "";
    var shown = null;
    $$(".followup", form).forEach(function (fs) {
      var on = fs.getAttribute("data-for") === value;
      if (on) shown = fs;
      if (fs.hidden === !on) return;
      fs.hidden = !on;
      $$("input, select, textarea", fs).forEach(function (el) { el.disabled = !on; });
    });
    if (shown && animate && motion) {
      gsap.fromTo(shown, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" });
    }
    var n2 = $("[data-step-n]", form), n3 = $("[data-step-n2]", form);
    if (n2) n2.textContent = shown ? "3" : "2";
    if (n3) n3.textContent = shown ? "4" : "3";
    // „Kita“ — tada žinutė privaloma, kad suprastume, ko reikia
    var needMsg = value === "kita";
    var opt = $("[data-msg-optional]", form), req = $("[data-msg-required]", form);
    if (opt) opt.hidden = needMsg;
    if (req) req.hidden = !needMsg;
    var msg = form.zinute;
    if (msg) { msg.required = needMsg; if (!needMsg) clearError(msg); }
  }

  function setService(value) {
    if (!form || !value) return;
    var parts = String(value).split(":");
    var legacy = { prietaisai: "montavimas", diagnostika: "kita", vamzdynai: "vandentiekis" };
    var cat = legacy[parts[0]] || parts[0];
    var detail = parts[1] || (parts[0] === "vamzdynai" ? "vamzdynai" : "");
    var input = catInputs().filter(function (i) { return i.value === cat; })[0];
    if (!input) return;
    input.checked = true;
    updateFollowups(false);
    clearError(input);
    if (detail) {
      var fs = $('.followup[data-for="' + cat + '"]', form);
      var sel = fs && $("select", fs);
      if (sel) sel.value = detail;
    }
  }

  // Be JS galima perduoti ?paslauga=... (pvz., iš senų nuorodų)
  try {
    var qs = new URLSearchParams(window.location.search).get("paslauga");
    if (qs) setService(qs);
  } catch (err) { /* nieko */ }

  /* --- Validacija --- */
  var messages = {
    kategorija: "Pasirinkite, kokios pagalbos reikia. Jei nesate tikri, rinkitės „Kita / nežinau“.",
    vardas: { missing: "Įrašykite savo vardą.", short: "Vardas turi būti bent 2 raidžių." },
    telefonas: { missing: "Įrašykite telefono numerį, kad galėtume paskambinti.", invalid: "Numeris atrodo neišsamus. Pavyzdžiui: +370 612 34567 arba 8 612 34567." },
    elpastas: "El. pašto adresas atrodo neteisingas. Pavyzdžiui: vardas@pavyzdys.lt.",
    zinute: { missing: "Trumpai aprašykite, ko reikia, nes pasirinkote „Kita“.", short: "Parašykite šiek tiek daugiau, bent 10 simbolių." },
    sutikimas: "Pažymėkite sutikimą, kad galėtume naudoti jūsų duomenis atsakydami į užklausą."
  };
  function holderOf(input) { return input.closest(".field, .step"); }
  function errFor(input) {
    var id = input.name === "kategorija" ? "f-kategorija-err" : input.id + "-err";
    return doc.getElementById(id);
  }
  function setError(input, msg) {
    var h = holderOf(input), e = errFor(input);
    if (h) h.classList.add("has-error");
    if (input.name === "kategorija") catInputs().forEach(function (i) { i.setAttribute("aria-invalid", "true"); });
    else input.setAttribute("aria-invalid", "true");
    if (e) e.textContent = msg;
  }
  function clearError(input) {
    var h = holderOf(input), e = errFor(input);
    if (h) h.classList.remove("has-error");
    if (input.name === "kategorija") catInputs().forEach(function (i) { i.removeAttribute("aria-invalid"); });
    else input.removeAttribute("aria-invalid");
    if (e) e.textContent = "";
  }
  function normPhone(v) { return v.replace(/[\s\-().]/g, ""); }
  function validPhone(v) { return /^(\+370\d{8}|8\d{8}|\+\d{8,15})$/.test(normPhone(v)); }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function validate(input) {
    var v;
    switch (input.name) {
      case "kategorija":
        if (!currentCat()) { setError(input, messages.kategorija); return false; }
        break;
      case "vardas":
        v = input.value.trim();
        if (!v) { setError(input, messages.vardas.missing); return false; }
        if (v.length < 2) { setError(input, messages.vardas.short); return false; }
        break;
      case "telefonas":
        v = input.value.trim();
        if (!v) { setError(input, messages.telefonas.missing); return false; }
        if (!validPhone(v)) { setError(input, messages.telefonas.invalid); return false; }
        break;
      case "elpastas":
        v = input.value.trim();
        if (v && !validEmail(v)) { setError(input, messages.elpastas); return false; }
        break;
      case "zinute":
        v = input.value.trim();
        if (input.required && !v) { setError(input, messages.zinute.missing); return false; }
        if (input.required && v.length < 10) { setError(input, messages.zinute.short); return false; }
        break;
      case "sutikimas":
        if (!input.checked) { setError(input, messages.sutikimas); return false; }
        break;
    }
    clearError(input);
    return true;
  }

  /* --- Struktūrizuota užklausa --- */
  function collect() {
    var cat = currentCat();
    var lines = [];
    var data = { kategorija: cat ? cat.getAttribute("data-label") : "" };
    lines.push("Pagalbos sritis: " + data.kategorija);
    // Matomo patikslinimo, skubumo ir vietovės atsakymai
    $$("[data-q]", form).forEach(function (el) {
      if (el.closest("[hidden]")) return;
      var q = el.getAttribute("data-q"), a = "";
      if (el.tagName === "SELECT") a = el.value ? el.options[el.selectedIndex].text : "";
      else if (el.tagName === "INPUT") a = el.value.trim();
      else a = $$("input:checked", el).map(function (i) { return i.value; }).join(", ");
      if (a) { lines.push(q + ": " + a); data[q] = a; }
    });
    data.vardas = form.vardas.value.trim();
    data.telefonas = form.telefonas.value.trim();
    data.elpastas = form.elpastas.value.trim();
    data.zinute = form.zinute.value.trim();
    var body = "Sveiki,\n\n" + lines.join("\n") +
      (data.zinute ? "\n\nPapildoma informacija:\n" + data.zinute : "") +
      "\n\nVardas: " + data.vardas +
      "\nTelefonas: " + data.telefonas +
      (data.elpastas ? "\nEl. paštas: " + data.elpastas : "") +
      "\n\nSutinku, kad mano duomenys būtų naudojami atsakant į šią užklausą.";
    return { data: data, subject: "Užklausa: " + data.kategorija, body: body };
  }

  function mailtoFor(msg) {
    var to = cfg.email || "info@jusu-imone.lt";
    return { to: to, href: "mailto:" + to + "?subject=" + encodeURIComponent(msg.subject) + "&body=" + encodeURIComponent(msg.body) };
  }

  function showStatus(kind, html) {
    status.hidden = false;
    status.className = "form-status" + (kind === "error" ? " is-error" : "");
    status.innerHTML = html;
    if (motion) gsap.fromTo(status, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" });
    status.focus({ preventScroll: true });
  }

  function mailtoActions(msg, mt) {
    var actions = doc.createElement("div");
    actions.className = "status-actions";
    var open = doc.createElement("a");
    open.className = "btn btn-ink"; open.href = mt.href; open.textContent = "Atidaryti el. laišką";
    var copy = doc.createElement("button");
    copy.type = "button"; copy.className = "btn btn-outline"; copy.textContent = "Kopijuoti tekstą";
    copy.addEventListener("click", function () {
      var text = "Kam: " + mt.to + "\nTema: " + msg.subject + "\n\n" + msg.body;
      var done = function () { copy.textContent = "Nukopijuota"; };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      else { fallbackCopy(text); done(); }
    });
    actions.appendChild(open); actions.appendChild(copy);
    return actions;
  }

  function fallbackCopy(text) {
    var ta = doc.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.opacity = "0";
    doc.body.appendChild(ta); ta.select();
    try { doc.execCommand("copy"); } catch (err) { /* nieko */ }
    ta.remove();
  }

  if (form) {
    // Režimas: tiesioginis siuntimas (jei nurodytas formEndpoint) arba el. laiško paruošimas
    if (endpoint) {
      var ex = $("[data-form-explainer]");
      if (ex) ex.innerHTML = "<strong>Kaip veikia forma:</strong> užklausa siunčiama tiesiogiai mums. Jei siuntimas nepavyktų, pasiūlysime ją išsiųsti el. paštu.";
      if (submitLabel) submitLabel.textContent = "Siųsti užklausą";
    }

    updateFollowups(false);
    catInputs().forEach(function (i) {
      i.addEventListener("change", function () { updateFollowups(true); validate(i); });
    });
    var urgentHint = $("[data-urgent-hint]", form);
    $$("input[name=skubumas]", form).forEach(function (i) {
      i.addEventListener("change", function () { if (urgentHint) urgentHint.hidden = !(i.checked && i.value.indexOf("Skubu") === 0); });
    });

    var validated = ["vardas", "telefonas", "elpastas", "zinute", "sutikimas"].map(function (n) { return form[n]; });
    validated.forEach(function (input) {
      input.addEventListener("blur", function () {
        if (input.type === "checkbox") return;
        if (input.value.trim() || holderOf(input).classList.contains("has-error")) validate(input);
      });
      input.addEventListener(input.type === "checkbox" ? "change" : "input", function () {
        if (holderOf(input).classList.contains("has-error")) validate(input);
      });
    });
    // Telefono numeris: leidžiami tik skaičiai, tarpai ir +
    form.telefonas.addEventListener("input", function () {
      var clean = form.telefonas.value.replace(/[^\d+\s\-()]/g, "");
      if (clean !== form.telefonas.value) form.telefonas.value = clean;
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var checks = [catInputs()[0]].concat(validated);
      var firstInvalid = null;
      checks.forEach(function (input) { if (!validate(input) && !firstInvalid) firstInvalid = input; });

      if (firstInvalid) {
        var count = $$(".has-error", form).length;
        showStatus("error", "Užklausos dar negalime paruošti: " + (count === 1 ? "pataisykite pažymėtą lauką." : "pataisykite pažymėtus laukus (" + count + ")."));
        firstInvalid.focus();
        var holder = holderOf(firstInvalid);
        if (holder && holder.getBoundingClientRect().top < headerH()) scrollToEl(holder);
        return;
      }

      var msg = collect();
      var mt = mailtoFor(msg);

      if (!endpoint) {
        showStatus("ok",
          '<h4><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Laiškas paruoštas, bet dar neišsiųstas</h4>' +
          "<p>Jūsų el. pašto programoje turėtų atsidaryti užpildytas laiškas adresu <strong data-to></strong>. Kad užklausa pasiektų mus, laišką išsiųskite patys.</p>" +
          "<p>Jei programa neatsidarė, atidarykite laišką mygtuku arba nukopijuokite tekstą.</p>");
        $("[data-to]", status).textContent = mt.to;
        status.appendChild(mailtoActions(msg, mt));
        window.location.href = mt.href;
        return;
      }

      // Tiesioginis siuntimas: sėkmė rodoma tik gavus sėkmingą atsakymą
      submitBtn.setAttribute("aria-busy", "true");
      submitLabel.textContent = "Siunčiama…";
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(Object.assign({ _subject: msg.subject, tekstas: msg.body }, msg.data))
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        showStatus("ok", '<h4><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Užklausa gauta</h4><p>Ačiū. Susisieksime nurodytu telefonu.</p>');
        form.reset();
        updateFollowups(false);
      }).catch(function () {
        showStatus("error", "<p>Užklausos išsiųsti nepavyko. Galite ją išsiųsti el. paštu arba paskambinti.</p>");
        status.appendChild(mailtoActions(msg, mt));
      }).then(function () {
        submitBtn.removeAttribute("aria-busy");
        submitLabel.textContent = "Siųsti užklausą";
      });
    });
  }

  /* ---------- Bėganti juosta: sukasi visada, slenkant pagreitėja ---------- */
  var tickerTrack = $("[data-ticker]");
  if (tickerTrack && motion) {
    tickerTrack.classList.add("is-gsap");
    var loop = gsap.to(tickerTrack, { xPercent: -50, duration: 42, ease: "none", repeat: -1, force3D: true });
    if (ST) {
      var boost = 1;
      ST.create({
        start: 0, end: "max",
        onUpdate: function (self) { boost = Math.max(boost, 1 + Math.min(Math.abs(self.getVelocity()) / 350, 4)); }
      });
      gsap.ticker.add(function () { boost += (1 - boost) * 0.04; loop.timeScale(boost); });
    }
  }

  /* ---------- Magnetiniai mygtukai ir žymeklis ---------- */
  if (motion && finePointer) {
    $$(".btn-magnetic").forEach(function (btn) {
      var xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3.out" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3.out" });
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.2);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      btn.addEventListener("mouseleave", function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.45)", overwrite: true });
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
     GSAP scenarijai — tik transform / opacity
     ========================================================================== */
  function endIntro() { root.classList.remove("intro"); }

  function handleInitialHash() {
    if (!location.hash) return;
    var go = function () {
      setTimeout(function () { if (ST) ST.refresh(); goToHash(location.hash, false, true); }, 150);
    };
    if (doc.readyState === "complete") go(); else window.addEventListener("load", go);
  }

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

    /* --- Hero: klausimai, tada atsakymas, vamzdis nubrėžiamas po žodžiu --- */
    var heroLines = $$(".hero-title .hl > span");
    var heroItems = $$(".hero [data-hero-item]");
    var pipePath = $(".hero-pipe path");
    gsap.set(heroItems, { autoAlpha: 0, y: 24 });
    gsap.set(heroLines, { yPercent: 110 });
    if (pipePath) gsap.set(pipePath, { strokeDasharray: 1, strokeDashoffset: 1 });
    endIntro();
    var intro = gsap.timeline({ defaults: { ease: "expo.out" } });
    intro
      .from(".hero-photo", { clipPath: "inset(0% 0% 0% 100%)", duration: 1.4, ease: "expo.inOut" }, 0)
      .from(".hero-photo img", { scale: 1.25, duration: 2, ease: "expo.out" }, 0.1)
      .to(heroItems[0], { autoAlpha: 1, y: 0, duration: 0.9 }, 0.2)
      .to(heroLines.slice(0, 2), { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.3)
      .to(heroLines.slice(2), { yPercent: 0, duration: 1.3 }, 0.75)
      .to(pipePath, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 1.25)
      .to(heroItems.slice(1), { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 }, 1.0)
      .from("[data-hero-tip]", { y: 40, autoAlpha: 0, duration: 1 }, 1.2)
      .from(".site-header .logo, .site-header .header-cta, .site-header .menu-toggle, .nav-list li",
        { y: -24, opacity: 0, duration: 0.9, stagger: 0.04, clearProps: "transform,opacity" }, 0.3)
      .add(function () { gsap.set(".hero-photo", { clearProps: "clipPath" }); });

    // Nuotrauka slenkant juda lėčiau už puslapį
    gsap.to(".hero-photo img", {
      yPercent: 8, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    /* --- Sekcijų antraštės --- */
    $$("[data-split]").forEach(function (el) {
      splitLines(el, {
        yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
    $$(".eyebrow, .section-intro").forEach(function (el) {
      if (el.closest(".hero")) return;
      gsap.from(el, { y: 18, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });

    /* --- Paslaugos --- */
    ST.batch(".svc-row", {
      start: "top 90%", once: true,
      onEnter: function (els) { gsap.from(els, { y: 36, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 }); }
    });
    mm.add("(min-width: 1024px)", function () {
      gsap.from(".svc-frame", {
        clipPath: "inset(18% 12% 18% 12% round 28px)", duration: 1.4, ease: "expo.out", clearProps: "clipPath",
        scrollTrigger: { trigger: ".svc-layout", start: "top 80%", once: true }
      });
    });

    /* --- Apie mus --- */
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
    gsap.from(".about-block", {
      y: 70, autoAlpha: 0, duration: 1.1, ease: "expo.out",
      scrollTrigger: { trigger: ".about-block", start: "top 95%", once: true }
    });
    ST.batch(".principle", {
      start: "top 88%", once: true,
      onEnter: function (els) { gsap.from(els, { y: 40, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.1 }); }
    });

    /* --- Galerija --- */
    ST.batch(".gallery-item, .gallery-cta", {
      start: "top 90%", once: true,
      onEnter: function (els) {
        els.forEach(function (el, i) {
          var tl = gsap.timeline({ delay: i * 0.08 });
          tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0% round 18px)" },
            { clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.2, ease: "expo.inOut", clearProps: "clipPath" });
          var wrap = $(".gallery-img", el);
          if (wrap) tl.fromTo(wrap, { scale: 1.3 }, { scale: 1, duration: 1.5, ease: "expo.out", clearProps: "transform" }, 0.15);
        });
      }
    });

    /* --- Darbo eiga: vanduo vamzdyje --- */
    var pipeline = $("[data-pipeline]");
    if (pipeline) {
      var steps = $$("[data-step]", pipeline);
      var lastStep = steps[steps.length - 1];
      var pTrack = $(".pipe-track", pipeline);
      var pFill = $("[data-pipe-fill]", pipeline);
      var pDrop = $("[data-pipe-drop]", pipeline);
      var trackH = pTrack.offsetHeight;
      ST.addEventListener("refresh", function () { trackH = pTrack.offsetHeight; });
      pipeline.classList.add("is-ready");
      var setFill = gsap.quickSetter(pFill, "scaleY");
      var setDrop = gsap.quickSetter(pDrop, "y", "px");
      setFill(0);
      ST.create({
        trigger: pipeline, start: "top 62%", endTrigger: lastStep, end: "top 62%", scrub: 0.6,
        onUpdate: function (self) {
          setFill(self.progress);
          setDrop(self.progress * trackH);
          pDrop.style.opacity = self.progress > 0.001 && self.progress < 0.999 ? 1 : 0;
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

    /* --- DUK, kontaktai, poraštė --- */
    ST.batch(".acc-item", {
      start: "top 92%", once: true,
      onEnter: function (els) { gsap.from(els, { y: 30, autoAlpha: 0, duration: 0.8, ease: "expo.out", stagger: 0.06 }); }
    });
    gsap.from(".form-card", {
      y: 80, autoAlpha: 0, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: ".form-card", start: "top 90%", once: true }
    });
    var mark = $("[data-footer-mark]");
    if (mark && Split) {
      Split.create(mark, {
        type: "chars", mask: "chars", autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.chars, {
            yPercent: 100, duration: 1, ease: "expo.out", stagger: 0.025,
            scrollTrigger: { trigger: ".footer-mark", start: "top 98%", once: true }
          });
        }
      });
    }

    window.addEventListener("load", function () { ST.refresh(); });
  }

  var started = false;
  function start() { if (started) return; started = true; initMotion(); handleInitialHash(); }
  if (doc.fonts && doc.fonts.ready) {
    doc.fonts.ready.then(start);
    setTimeout(start, 1500);
  } else start();
})();
