/* ==========================================================================
   Santechnikos Meistrai — sąsaja (v4)
   Problemų pasirinkimas, paslaugų katalogas, 3 žingsnių užklausa, DUK, galerija.
   Viskas veikia ir be GSAP (js/vendor): biblioteka tik prideda saikingą judesį.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var motion = !!(gsap && !reduce);

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function headerH() { var h = $(".site-header"); return h ? h.offsetHeight : 0; }
  if (gsap && ST) { gsap.registerPlugin(ST); ST.config({ ignoreMobileResize: true }); }

  /* ---------- Metai ir įmonės duomenys ---------- */
  var yearEl = $("#metai");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  var cfg = window.SITE_CONFIG || {};
  $$("[data-config]").forEach(function (el) { var k = el.getAttribute("data-config"); if (cfg[k]) el.textContent = cfg[k]; });
  $$("[data-config-link]").forEach(function (el) {
    var k = el.getAttribute("data-config-link");
    if (k === "phone" && cfg.phoneHref) el.setAttribute("href", "tel:" + cfg.phoneHref);
    if (k === "email" && cfg.email) el.setAttribute("href", "mailto:" + cfg.email);
  });
  if (cfg.demo === false) $$("[data-demo-only]").forEach(function (el) { el.remove(); });

  /* ---------- Slinkimas ---------- */
  function lockScroll(on) { doc.body.classList.toggle("is-locked", on); }
  function scrollToEl(el, instant) {
    if (!el) return;
    var y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - (headerH() + 8));
    window.scrollTo({ top: y, behavior: reduce || instant ? "auto" : "smooth" });
  }

  /* ---------- Mobilus meniu ---------- */
  var header = $(".site-header");
  var toggle = $(".menu-toggle");
  var nav = $("#pagrindinis-meniu");
  var desktopMq = window.matchMedia("(min-width: 1100px)");

  function setMenu(open, returnFocus) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    $(".visually-hidden", toggle).textContent = open ? "Uždaryti meniu" : "Atidaryti meniu";
    $(".menu-toggle-label", toggle).textContent = open ? "Uždaryti" : "Meniu";
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    if (!desktopMq.matches) {
      if (open) nav.removeAttribute("inert"); else nav.setAttribute("inert", "");
      lockScroll(open);
    }
    if (open) setTimeout(function () { var a = $("a", nav); if (a) a.focus({ preventScroll: true }); }, 250);
    else if (returnFocus) toggle.focus();
  }
  function syncNav() {
    if (!nav) return;
    if (desktopMq.matches) { nav.removeAttribute("inert"); if (nav.classList.contains("is-open")) setMenu(false); }
    else if (!nav.classList.contains("is-open")) nav.setAttribute("inert", "");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    doc.addEventListener("keydown", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (e.key === "Escape") { setMenu(false, true); return; }
      if (e.key !== "Tab") return;
      var items = [toggle].concat($$("a", nav));
      var i = items.indexOf(doc.activeElement);
      if (e.shiftKey && i === 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    });
    if (desktopMq.addEventListener) desktopMq.addEventListener("change", syncNav); else desktopMq.addListener(syncNav);
    syncNav();
  }

  /* ---------- Aktyvi navigacijos nuoroda ---------- */
  var navLinks = $$(".nav-list a");
  if ("IntersectionObserver" in window && navLinks.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + entry.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["problema", "paslaugos", "darbai", "kaip-dirbame", "duk", "kontaktai"].forEach(function (id) {
      var s = doc.getElementById(id); if (s) io.observe(s);
    });
  }

  /* ---------- Išskleidžiami blokai (paslaugos ir DUK) ---------- */
  function setRegion(btn, open, animate) {
    var panel = doc.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    if ((btn.getAttribute("aria-expanded") === "true") === open && panel.hidden === !open) return;
    btn.setAttribute("aria-expanded", String(open));
    if (!motion || animate === false) { panel.hidden = !open; if (gsap) gsap.set(panel, { clearProps: "height" }); return; }
    if (open) {
      panel.hidden = false;
      gsap.fromTo(panel, { height: 0 }, { height: "auto", duration: 0.45, ease: "power2.out", overwrite: true,
        onComplete: function () { gsap.set(panel, { clearProps: "height" }); if (ST) ST.refresh(); } });
    } else {
      gsap.to(panel, { height: 0, duration: 0.35, ease: "power2.inOut", overwrite: true,
        onComplete: function () { panel.hidden = true; gsap.set(panel, { clearProps: "height" }); if (ST) ST.refresh(); } });
    }
  }
  function arrowNav(list, i, e, horizontal) {
    var next = null, prevKey = horizontal ? "ArrowLeft" : "ArrowUp", nextKey = horizontal ? "ArrowRight" : "ArrowDown";
    if (e.key === nextKey || (!horizontal && e.key === "ArrowRight")) next = list[(i + 1) % list.length];
    else if (e.key === prevKey || (!horizontal && e.key === "ArrowLeft")) next = list[(i - 1 + list.length) % list.length];
    else if (e.key === "Home") next = list[0];
    else if (e.key === "End") next = list[list.length - 1];
    if (next) e.preventDefault();
    return next;
  }

  // DUK: klausimai atsidaro nepriklausomai
  $$("[data-accordion]").forEach(function (acc) {
    var triggers = $$(".acc-trigger", acc);
    triggers.forEach(function (btn, i) {
      btn.addEventListener("click", function () { setRegion(btn, btn.getAttribute("aria-expanded") !== "true"); });
      btn.addEventListener("keydown", function (e) { var n = arrowNav(triggers, i, e); if (n) n.focus(); });
    });
  });

  // Paslaugos: vienu metu atidaryta viena eilutė
  var svcTriggers = $$(".svc-trigger");
  function openService(btn, animate) {
    svcTriggers.forEach(function (b) { if (b !== btn) setRegion(b, false, animate); });
    setRegion(btn, true, animate);
  }
  svcTriggers.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      if (btn.getAttribute("aria-expanded") === "true") setRegion(btn, false); else openService(btn);
    });
    btn.addEventListener("keydown", function (e) { var n = arrowNav(svcTriggers, i, e); if (n) n.focus(); });
  });

  /* ---------- Problemų pasirinkimas ---------- */
  var probTabs = $$(".prob-tab");
  function selectProblem(tab, opts) {
    opts = opts || {};
    probTabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var p = doc.getElementById(t.getAttribute("aria-controls"));
      if (p) p.hidden = !on;
    });
    var panel = doc.getElementById(tab.getAttribute("aria-controls"));
    if (motion && panel && opts.animate !== false) {
      gsap.fromTo(panel.children, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.05, ease: "power2.out", overwrite: true });
    }
    if (opts.focus) tab.focus();
    // Mažame ekrane pasirinkimas turi būti matomas — slenkame prie aprašymo
    if (opts.reveal && panel && window.innerWidth < 1024) {
      var r = panel.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6) scrollToEl(panel);
    }
  }
  probTabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectProblem(tab, { reveal: true }); });
    tab.addEventListener("keydown", function (e) {
      var n = arrowNav(probTabs, i, e);
      if (n) selectProblem(n, { focus: true });
    });
  });

  // „Ką paprastai atliekame“: telefone suskleista (mažiau teksto), didesniame ekrane atidaryta
  var smallMq = window.matchMedia("(max-width: 639px)");
  function syncDetails() { $$(".prob-more").forEach(function (d) { d.open = !smallMq.matches; }); }
  syncDetails();
  if (smallMq.addEventListener) smallMq.addEventListener("change", syncDetails); else smallMq.addListener(syncDetails);

  /* ==========================================================================
     3 žingsnių užklausa
     ========================================================================== */
  var form = $("#uzklausa");
  var step = 1;
  var maxReached = 1;
  var chosenService = "";
  var endpoint = (cfg.formEndpoint || "").trim();
  var serviceNames = {
    vandentiekis: "01 / Vandentiekis", kanalizacija: "02 / Kanalizacija", sildymas: "03 / Šildymo sistemos",
    prietaisai: "04 / Santechnikos montavimas", vamzdynai: "05 / Vamzdynų renovacija", diagnostika: "06 / Gedimų šalinimas"
  };
  // Kai užklausa pradedama nuo paslaugos — pažymime artimiausią situaciją
  var serviceToProblem = { prietaisai: "nauja", vamzdynai: "renovacija" };
  var descHints = {
    pratekejimas: { ph: "Pvz.: varva jungtis po virtuvės kriaukle, vandenį užsukau.", hint: "Nurodykite, kur prateka ir ar pavyko užsukti vandenį." },
    uzsikimsimas: { ph: "Pvz.: lėtai nuteka vonioje ir praustuve, jaučiasi kvapas.", hint: "Nurodykite, kurie prietaisai užsikimšo ir nuo kada." },
    radiatoriai: { ph: "Pvz.: šalti du radiatoriai antrame aukšte, manometras rodo 0,8 bar.", hint: "Nurodykite, kurie radiatoriai šalti ir kokį slėgį rodo manometras." },
    nauja: { ph: "Pvz.: sumontuoti potinkinį rėmą ir klozetą, praustuvą su maišytuvu.", hint: "Išvardinkite prietaisus ir pažymėkite, ar jie jau nupirkti." },
    renovacija: { ph: "Pvz.: keičiame vamzdynus vonioje ir virtuvėje, sienos dar atviros.", hint: "Nurodykite, kokios patalpos renovuojamos ir kokiame darbų etape esate." },
    kita: { ph: "Kas vyksta, kur ir nuo kada?", hint: "Kuo tiksliau aprašysite, tuo tiksliau įvertinsime darbus." }
  };

  var steps = form ? $$(".wiz-step", form) : [];
  var btnPrev = form ? $("[data-prev]", form) : null;
  var btnNext = form ? $("[data-next]", form) : null;
  var btnSubmit = form ? $("[data-submit]", form) : null;
  var submitLabel = form ? $("[data-submit-label]", form) : null;
  var announce = form ? $("[data-wiz-announce]", form) : null;
  var status = $("#form-status");
  var stepNames = ["", "Problema", "Detalės", "Kontaktai"];

  function radios(name) { return form ? $$('input[name="' + name + '"]', form) : []; }
  function checked(name) { return radios(name).filter(function (r) { return r.checked; })[0] || null; }

  function updateHints() {
    var p = checked("problema");
    var h = descHints[p ? p.value : "kita"];
    var ta = form && form.aprasymas;
    if (ta) ta.placeholder = h.ph;
    var hint = form && $("[data-desc-hint]", form);
    if (hint) hint.textContent = h.hint;
  }

  function renderSummary() {
    var dl = form && $("[data-wiz-summary]", form);
    if (!dl) return;
    var rows = [];
    var p = checked("problema");
    if (p) rows.push(["Problema", p.getAttribute("data-label")]);
    if (chosenService) rows.push(["Paslauga", serviceNames[chosenService]]);
    var o = checked("objektas");
    if (o) rows.push(["Objektas", o.value]);
    if (form.laikas.value) rows.push(["Laikas", form.laikas.value]);
    dl.textContent = "";
    rows.forEach(function (r) {
      var d = doc.createElement("div"), dt = doc.createElement("dt"), dd = doc.createElement("dd");
      dt.textContent = r[0]; dd.textContent = r[1];
      d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
    });
  }

  function showStep(n, opts) {
    opts = opts || {};
    var from = step;
    step = n;
    maxReached = Math.max(maxReached, n);
    steps.forEach(function (s) { s.hidden = Number(s.getAttribute("data-step")) !== n; });
    $$(".wiz-progress li", form).forEach(function (li) {
      var k = Number(li.getAttribute("data-progress"));
      if (k === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      li.classList.toggle("is-done", k < n || (k < maxReached && k !== n));
      var b = $("button", li);
      b.disabled = k === n || k > maxReached;
    });
    btnPrev.hidden = n === 1;
    btnNext.hidden = n === 3;
    btnSubmit.hidden = n !== 3;
    if (n === 2) updateHints();
    if (n === 3) renderSummary();
    if (announce) announce.textContent = n + " žingsnis iš 3: " + stepNames[n];
    var cur = steps[n - 1];
    if (motion && opts.animate !== false && from !== n) {
      gsap.fromTo(cur, { x: (n > from ? 1 : -1) * 28, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out", clearProps: "transform" });
    }
    if (opts.focus !== false) {
      var t = $(".wiz-title", cur);
      if (t) t.focus({ preventScroll: true });
      var card = $(".wizard-card");
      if (card && card.getBoundingClientRect().top < headerH()) scrollToEl(card);
    }
  }

  /* --- Validacija --- */
  var msgs = {
    problema: "Pasirinkite, kas atsitiko. Jei nė vienas variantas netinka, rinkitės „Kita problema ar paslauga“.",
    objektas: "Pasirinkite objekto tipą.",
    aprasymasMissing: "Trumpai aprašykite problemą.",
    aprasymasShort: "Parašykite šiek tiek daugiau, bent 10 simbolių.",
    vardas: "Įrašykite vardą.",
    telefonasMissing: "Įrašykite telefono numerį, kad galėtume paskambinti.",
    telefonasInvalid: "Numeris atrodo neišsamus. Pavyzdžiui: +370 612 34567 arba 8 612 34567.",
    elpastas: "El. pašto adresas atrodo neteisingas. Pavyzdžiui: vardas@pavyzdys.lt.",
    vietove: "Nurodykite miestą ar vietovę.",
    sutikimas: "Pažymėkite sutikimą, kad galėtume atsakyti į užklausą."
  };
  function holderFor(name) {
    if (name === "problema") return $("#f-problema").closest(".wiz-step");
    if (name === "objektas") return $("#f-objektas").closest(".field");
    return form[name].closest(".field");
  }
  function setErr(name, msg) {
    var h = holderFor(name), e = doc.getElementById("f-" + name + "-err");
    if (h) h.classList.toggle("has-error", !!msg);
    if (e) e.textContent = msg || "";
    var targets = name === "problema" || name === "objektas" ? radios(name) : [form[name]];
    targets.forEach(function (t) { if (msg) t.setAttribute("aria-invalid", "true"); else t.removeAttribute("aria-invalid"); });
    return !msg;
  }
  function validPhone(v) { return /^(\+370\d{8}|8\d{8}|\+\d{8,15})$/.test(v.replace(/[\s\-().]/g, "")); }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function check(name) {
    var v;
    switch (name) {
      case "problema": return setErr(name, checked("problema") ? "" : msgs.problema);
      case "objektas": return setErr(name, checked("objektas") ? "" : msgs.objektas);
      case "aprasymas":
        v = form.aprasymas.value.trim();
        return setErr(name, !v ? msgs.aprasymasMissing : v.length < 10 ? msgs.aprasymasShort : "");
      case "vardas": return setErr(name, form.vardas.value.trim().length >= 2 ? "" : msgs.vardas);
      case "telefonas":
        v = form.telefonas.value.trim();
        return setErr(name, !v ? msgs.telefonasMissing : !validPhone(v) ? msgs.telefonasInvalid : "");
      case "elpastas":
        v = form.elpastas.value.trim();
        return setErr(name, v && !validEmail(v) ? msgs.elpastas : "");
      case "vietove": return setErr(name, form.vietove.value.trim().length >= 2 ? "" : msgs.vietove);
      case "sutikimas": return setErr(name, form.sutikimas.checked ? "" : msgs.sutikimas);
    }
    return true;
  }
  var stepFields = { 1: ["problema"], 2: ["objektas", "aprasymas"], 3: ["vardas", "telefonas", "elpastas", "vietove", "sutikimas"] };
  function validateStep(n) {
    var first = null;
    stepFields[n].forEach(function (name) { if (!check(name) && !first) first = name; });
    if (first) {
      var el = first === "problema" || first === "objektas" ? radios(first)[0] : form[first];
      el.focus();
      if (motion) gsap.fromTo(holderFor(first), { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.35)", clearProps: "transform" });
    }
    return !first;
  }

  /* --- Užklausos tekstas --- */
  function collect() {
    var p = checked("problema"), o = checked("objektas");
    var data = {
      problema: p ? p.getAttribute("data-label") : "",
      paslauga: chosenService ? serviceNames[chosenService] : "",
      objektas: o ? o.value : "",
      laikas: form.laikas.value,
      aprasymas: form.aprasymas.value.trim(),
      vardas: form.vardas.value.trim(),
      telefonas: form.telefonas.value.trim(),
      elpastas: form.elpastas.value.trim(),
      vietove: form.vietove.value.trim()
    };
    var lines = ["Problema: " + data.problema];
    if (data.paslauga) lines.push("Paslauga: " + data.paslauga);
    lines.push("Objektas: " + data.objektas);
    if (data.laikas) lines.push("Pageidaujamas laikas: " + data.laikas);
    lines.push("Vietovė: " + data.vietove);
    var body = "Sveiki,\n\n" + lines.join("\n") + "\n\nAprašymas:\n" + data.aprasymas +
      "\n\nVardas: " + data.vardas + "\nTelefonas: " + data.telefonas +
      (data.elpastas ? "\nEl. paštas: " + data.elpastas : "") +
      "\n\nSutinku, kad mano duomenys būtų naudojami atsakant į šią užklausą.";
    return { data: data, subject: "Užklausa: " + data.problema + (data.vietove ? " (" + data.vietove + ")" : ""), body: body };
  }
  function mailtoFor(msg) {
    var to = cfg.email || "info@jusu-imone.lt";
    return { to: to, href: "mailto:" + to + "?subject=" + encodeURIComponent(msg.subject) + "&body=" + encodeURIComponent(msg.body) };
  }
  function fallbackCopy(text) {
    var ta = doc.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    doc.body.appendChild(ta); ta.select();
    try { doc.execCommand("copy"); } catch (err) { /* nieko */ }
    ta.remove();
  }
  function mailActions(msg, mt) {
    var wrap = doc.createElement("div"); wrap.className = "status-actions";
    var a = doc.createElement("a"); a.className = "btn btn-dark"; a.href = mt.href; a.textContent = "Atidaryti el. laišką";
    var c = doc.createElement("button"); c.type = "button"; c.className = "btn btn-line"; c.textContent = "Kopijuoti tekstą";
    c.addEventListener("click", function () {
      var text = "Kam: " + mt.to + "\nTema: " + msg.subject + "\n\n" + msg.body;
      var done = function () { c.textContent = "Nukopijuota"; };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      else { fallbackCopy(text); done(); }
    });
    wrap.appendChild(a); wrap.appendChild(c);
    return wrap;
  }
  function showStatus(kind, title, text) {
    status.hidden = false;
    status.className = "form-status" + (kind === "error" ? " is-error" : "");
    status.textContent = "";
    if (title) {
      var h = doc.createElement("h4");
      h.innerHTML = kind === "error" ? "" : '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>';
      h.appendChild(doc.createTextNode(title));
      status.appendChild(h);
    }
    if (text) { var p = doc.createElement("p"); p.textContent = text; status.appendChild(p); }
    status.focus({ preventScroll: true });
  }

  function setProblem(value, goNext) {
    var r = radios("problema").filter(function (x) { return x.value === value; })[0];
    if (!r) return;
    r.checked = true;
    check("problema");
    updateHints();
    if (goNext) showStep(2, { focus: false });
  }
  function setService(key) {
    chosenService = key;
    var note = form && $("[data-wiz-service]", form);
    if (note) {
      note.hidden = false;
      note.innerHTML = "Pasirinkta paslauga: <strong></strong>. Pažymėkite, kas tiksliausiai apibūdina situaciją.";
      $("strong", note).textContent = serviceNames[key];
    }
    if (serviceToProblem[key]) setProblem(serviceToProblem[key]);
    showStep(1, { focus: false });
  }

  if (form) {
    // Režimas: tiesioginis siuntimas (jei nurodytas formEndpoint) arba el. laiškas
    if (endpoint) {
      var ex = $("[data-form-explainer]", form);
      if (ex) ex.innerHTML = "<strong>Kaip tai veikia:</strong> užklausa siunčiama tiesiogiai mums. Jei nepavyktų, pasiūlysime ją išsiųsti el. paštu.";
      submitLabel.textContent = "Siųsti užklausą";
    }

    radios("problema").forEach(function (r) { r.addEventListener("change", function () { check("problema"); updateHints(); }); });
    radios("objektas").forEach(function (r) { r.addEventListener("change", function () { check("objektas"); }); });
    ["aprasymas", "vardas", "telefonas", "elpastas", "vietove"].forEach(function (name) {
      var el = form[name];
      el.addEventListener("blur", function () { if (el.value.trim()) check(name); });
      el.addEventListener("input", function () { if (holderFor(name).classList.contains("has-error")) check(name); });
    });
    form.sutikimas.addEventListener("change", function () { check("sutikimas"); });
    form.telefonas.addEventListener("input", function () {
      var clean = form.telefonas.value.replace(/[^\d+\s\-()]/g, "");
      if (clean !== form.telefonas.value) form.telefonas.value = clean;
    });

    btnNext.addEventListener("click", function () { if (validateStep(step)) showStep(step + 1); });
    btnPrev.addEventListener("click", function () { showStep(step - 1); });
    $$("[data-goto]", form).forEach(function (b) {
      b.addEventListener("click", function () {
        var n = Number(b.getAttribute("data-goto"));
        if (n < step || validateStep(step)) showStep(n);
      });
    });
    // Enter laukelyje (ne tekstinėje srityje) — kitas žingsnis, o ne siuntimas
    form.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || e.target.tagName === "TEXTAREA" || e.target.tagName === "BUTTON" || e.target.tagName === "A") return;
      if (step < 3) { e.preventDefault(); if (validateStep(step)) showStep(step + 1); }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (step !== 3) { if (validateStep(step)) showStep(step + 1); return; }
      // Patikriname visus žingsnius — jei kur nors trūksta, grąžiname ten
      for (var n = 1; n <= 3; n++) {
        if (!stepFields[n].every(function (name) { return check(name); })) {
          if (n !== 3) showStep(n);
          validateStep(n);
          showStatus("error", "", "Užklausos dar negalime paruošti: pataisykite pažymėtus laukus.");
          return;
        }
      }
      var msg = collect();
      var mt = mailtoFor(msg);

      if (!endpoint) {
        showStatus("ok", "Laiškas paruoštas, bet dar neišsiųstas",
          "Jūsų el. pašto programoje turėtų atsidaryti užpildytas laiškas adresu " + mt.to + ". Kad užklausa pasiektų mus, išsiųskite jį patys. Jei programa neatsidarė, naudokite mygtukus žemiau.");
        status.appendChild(mailActions(msg, mt));
        window.location.href = mt.href;
        return;
      }

      btnSubmit.setAttribute("aria-busy", "true");
      submitLabel.textContent = "Siunčiama…";
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(Object.assign({ _subject: msg.subject, tekstas: msg.body }, msg.data))
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        showStatus("ok", "Užklausa gauta", "Ačiū. Susisieksime nurodytu telefonu.");
        form.reset(); chosenService = ""; maxReached = 1; showStep(1, { focus: false });
      }).catch(function () {
        showStatus("error", "", "Užklausos išsiųsti nepavyko. Išsiųskite ją el. paštu arba paskambinkite.");
        status.appendChild(mailActions(msg, mt));
      }).then(function () {
        btnSubmit.removeAttribute("aria-busy");
        submitLabel.textContent = "Siųsti užklausą";
      });
    });

    showStep(1, { focus: false, animate: false });
  }

  /* ---------- Nuorodos: inkarai, problemos ir paslaugos ---------- */
  function goToHash(hash, push, instant) {
    var id = hash.replace(/^#/, "");
    var el = id && doc.getElementById(id);
    if (!el) return false;
    if (el.classList.contains("svc-row")) openService($(".svc-trigger", el), !instant);
    if (push && history.pushState) history.pushState(null, "", "#" + id);
    var delay = el.classList.contains("svc-row") && motion && !instant ? 380 : 0;
    setTimeout(function () { scrollToEl(el, instant); }, delay);
    return true;
  }
  doc.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var hash = a.getAttribute("href");
    if (hash.length < 2) return;
    var prob = a.getAttribute("data-problem");
    var svc = a.getAttribute("data-service");
    if (form && prob) { chosenService = ""; var n = $("[data-wiz-service]", form); if (n) n.hidden = true; setProblem(prob, true); }
    if (form && svc) setService(svc);
    var menuWasOpen = nav && nav.classList.contains("is-open");
    if (menuWasOpen) setMenu(false);
    if (doc.getElementById(hash.slice(1))) {
      e.preventDefault();
      setTimeout(function () {
        goToHash(hash, true);
        // Iš problemos ar paslaugos — perkeliame fokusą į formos žingsnį
        if (form && (prob || svc)) setTimeout(function () { var t = $(".wiz-step:not([hidden]) .wiz-title", form); if (t) t.focus({ preventScroll: true }); }, reduce ? 0 : 650);
      }, menuWasOpen ? 380 : 0);
    }
  });

  /* ---------- Galerija + lightbox ---------- */
  var dialog = $("#lightbox");
  var shots = $$(".shot-img");
  var current = 0, lastFocus = null;
  function showSlide(i, dir) {
    current = (i + shots.length) % shots.length;
    var btn = shots[current], thumb = $("img", btn), img = $(".lightbox-img", dialog);
    img.src = btn.getAttribute("data-full");
    img.alt = thumb ? thumb.alt : "";
    $(".lightbox-title", dialog).textContent = btn.getAttribute("data-title") || "";
    $(".lightbox-count", dialog).textContent = (current + 1) + " / " + shots.length;
    if (motion) gsap.fromTo(img, { x: (dir || 0) * 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out", overwrite: true });
  }
  function closeLightbox() { if (dialog && dialog.open) dialog.close(); }
  if (dialog && shots.length) {
    shots.forEach(function (b, i) {
      b.addEventListener("click", function () {
        if (typeof dialog.showModal !== "function") { window.open(b.getAttribute("data-full"), "_blank", "noopener"); return; }
        lastFocus = doc.activeElement;
        dialog.showModal(); showSlide(i, 0); lockScroll(true);
        $(".lb-close", dialog).focus();
      });
    });
    $(".lb-close", dialog).addEventListener("click", closeLightbox);
    $(".lb-prev", dialog).addEventListener("click", function () { showSlide(current - 1, -1); });
    $(".lb-next", dialog).addEventListener("click", function () { showSlide(current + 1, 1); });
    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); showSlide(current - 1, -1); }
      if (e.key === "ArrowRight") { e.preventDefault(); showSlide(current + 1, 1); }
    });
    dialog.addEventListener("click", function (e) { if (e.target === dialog || e.target.classList.contains("lightbox-figure")) closeLightbox(); });
    dialog.addEventListener("close", function () { lockScroll(false); if (lastFocus) lastFocus.focus({ preventScroll: true }); });
    var sx = null;
    dialog.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) showSlide(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      sx = null;
    });
  }

  /* ==========================================================================
     Saikingas judesys (tik transform / opacity, vienkartinis)
     ========================================================================== */
  function endIntro() { root.classList.remove("intro"); }
  function handleInitialHash() {
    if (!location.hash) return;
    var go = function () { setTimeout(function () { if (ST) ST.refresh(); goToHash(location.hash, false, true); }, 120); };
    if (doc.readyState === "complete") go(); else window.addEventListener("load", go);
  }

  if (!motion || !ST) { endIntro(); handleInitialHash(); return; }

  function initMotion() {
    // Hero: eilutės iškyla, nuotrauka atsiveria, vamzdžio linija nubrėžiama
    var lines = $$(".hero-title .hl > span");
    var items = $$(".hero [data-hero-item]");
    var pipe = $(".hero-pipe path");
    gsap.set(lines, { yPercent: 105 });
    gsap.set(items, { autoAlpha: 0, y: 16 });
    if (pipe) gsap.set(pipe, { strokeDasharray: 1, strokeDashoffset: 1 });
    endIntro();
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(lines, { yPercent: 0, duration: 0.75, stagger: 0.07 }, 0)
      .from("[data-hero-photo]", { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "power3.inOut", clearProps: "clipPath" }, 0.05)
      .to(items, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06 }, 0.3)
      .to(pipe, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, 0.55);

    // Nuotraukos atsiveria vieną kartą
    ST.batch(".shot", {
      start: "top 88%", once: true,
      onEnter: function (els) {
        gsap.from(els, { clipPath: "inset(12% 0 0 0)", autoAlpha: 0, y: 30, duration: 0.8, ease: "power3.out", stagger: 0.1, clearProps: "clipPath,transform" });
      }
    });

    // Darbo eigos linija nubrėžiama vieną kartą
    var line = $("[data-step-line]");
    if (line) {
      var vertical = window.innerWidth < 1024;
      gsap.fromTo(line, vertical ? { scaleY: 0 } : { scaleX: 0 }, {
        scaleY: 1, scaleX: 1, duration: 1.2, ease: "power2.inOut",
        scrollTrigger: { trigger: "[data-steps]", start: "top 75%", once: true }
      });
    }

    window.addEventListener("load", function () { ST.refresh(); });
  }

  var started = false;
  function start() { if (started) return; started = true; initMotion(); handleInitialHash(); }
  if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(start); setTimeout(start, 1200); } else start();
})();
