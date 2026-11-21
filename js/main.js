/* ==========================================================================
   Santechnikos Meistrai — sąsaja (v5)
   Du keliai: A „Turiu gedimą“ (gedimo pasirinkimas + greitas kontaktas)
              B „Planuoju įrengimą“ (3 žingsnių forma).
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
    ["gedimas", "irengimas", "paslaugos", "darbai", "duk", "kontaktai"].forEach(function (id) {
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
  function arrowNav(list, i, e) {
    var n = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") n = list[(i + 1) % list.length];
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = list[(i - 1 + list.length) % list.length];
    else if (e.key === "Home") n = list[0];
    else if (e.key === "End") n = list[list.length - 1];
    if (n) e.preventDefault();
    return n;
  }
  $$("[data-accordion]").forEach(function (acc) {
    var triggers = $$(".acc-trigger", acc);
    triggers.forEach(function (btn, i) {
      btn.addEventListener("click", function () { setRegion(btn, btn.getAttribute("aria-expanded") !== "true"); });
      btn.addEventListener("keydown", function (e) { var n = arrowNav(triggers, i, e); if (n) n.focus(); });
    });
  });
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

  /* ==========================================================================
     Bendra formų logika (tikrinimas, laiškas, siuntimas)
     ========================================================================== */
  var endpoint = (cfg.formEndpoint || "").trim();
  var MSG = {
    vardas: "Įrašykite vardą.",
    telefonasMissing: "Įrašykite telefono numerį.",
    telefonasInvalid: "Patikrinkite numerį, pvz.: +370 612 34567 arba 8 612 34567.",
    elpastas: "Patikrinkite el. pašto adresą, pvz.: vardas@pavyzdys.lt.",
    vietove: "Nurodykite adresą ar vietovę.",
    sutikimas: "Pažymėkite sutikimą.",
    darbai: "Pasirinkite darbų tipą.",
    objektas: "Pasirinkite objekto tipą.",
    aprasymasMissing: "Trumpai aprašykite darbus.",
    aprasymasShort: "Parašykite šiek tiek daugiau (bent 10 simbolių)."
  };
  function validPhone(v) { return /^(\+370\d{8}|8\d{8}|\+\d{8,15})$/.test(v.replace(/[\s\-().]/g, "")); }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  // Kiekviena forma turi priešdėlį (q- arba f-), kad klaidų laukai būtų randami pagal id
  function Form(form, prefix) {
    this.form = form; this.prefix = prefix;
    this.status = $(".form-status", form);
    this.submitBtn = $("[data-submit]", form);
    this.submitLabel = $("[data-submit-label]", form);
  }
  Form.prototype.radios = function (name) { return $$('input[name="' + name + '"]', this.form); };
  Form.prototype.checked = function (name) { return this.radios(name).filter(function (r) { return r.checked; })[0] || null; };
  Form.prototype.holder = function (name) {
    var group = doc.getElementById(this.prefix + name);
    if (group && !group.matches("input, select, textarea")) return group.closest(".wiz-step, .field") || group;
    var el = this.form.elements[name];
    return el && el.closest ? el.closest(".field") : null;
  };
  Form.prototype.setErr = function (name, msg) {
    var h = this.holder(name), e = doc.getElementById(this.prefix + name + "-err");
    if (h) h.classList.toggle("has-error", !!msg);
    if (e) e.textContent = msg || "";
    var targets = this.radios(name).length ? this.radios(name) : [this.form.elements[name]];
    targets.forEach(function (t) { if (!t) return; if (msg) t.setAttribute("aria-invalid", "true"); else t.removeAttribute("aria-invalid"); });
    return !msg;
  };
  Form.prototype.check = function (name) {
    var f = this.form.elements, v;
    switch (name) {
      case "vardas": return this.setErr(name, f.vardas.value.trim().length >= 2 ? "" : MSG.vardas);
      case "telefonas":
        v = f.telefonas.value.trim();
        return this.setErr(name, !v ? MSG.telefonasMissing : !validPhone(v) ? MSG.telefonasInvalid : "");
      case "elpastas":
        v = f.elpastas.value.trim();
        return this.setErr(name, v && !validEmail(v) ? MSG.elpastas : "");
      case "vietove": return this.setErr(name, f.vietove.value.trim().length >= 2 ? "" : MSG.vietove);
      case "sutikimas": return this.setErr(name, f.sutikimas.checked ? "" : MSG.sutikimas);
      case "darbai": return this.setErr(name, this.checked("darbai") ? "" : MSG.darbai);
      case "objektas": return this.setErr(name, this.checked("objektas") ? "" : MSG.objektas);
      case "aprasymas":
        v = f.aprasymas.value.trim();
        return this.setErr(name, !v ? MSG.aprasymasMissing : v.length < 10 ? MSG.aprasymasShort : "");
    }
    return true;
  };
  Form.prototype.validate = function (names) {
    var self = this, first = null;
    names.forEach(function (n) { if (!self.check(n) && !first) first = n; });
    if (first) {
      var el = this.radios(first).length ? this.radios(first)[0] : this.form.elements[first];
      el.focus();
      var h = this.holder(first);
      if (motion && h) gsap.fromTo(h, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.35)", clearProps: "transform" });
    }
    return !first;
  };
  Form.prototype.live = function (names) {
    var self = this;
    names.forEach(function (name) {
      var radios = self.radios(name);
      if (radios.length) { radios.forEach(function (r) { r.addEventListener("change", function () { self.check(name); }); }); return; }
      var el = self.form.elements[name];
      if (!el) return;
      if (el.type === "checkbox") { el.addEventListener("change", function () { self.check(name); }); return; }
      el.addEventListener("blur", function () { if (el.value.trim()) self.check(name); });
      el.addEventListener("input", function () { var h = self.holder(name); if (h && h.classList.contains("has-error")) self.check(name); });
    });
    var tel = this.form.elements.telefonas;
    if (tel) tel.addEventListener("input", function () {
      var clean = tel.value.replace(/[^\d+\s\-()]/g, "");
      if (clean !== tel.value) tel.value = clean;
    });
  };
  Form.prototype.showStatus = function (kind, title, text) {
    var st = this.status;
    st.hidden = false;
    st.className = "form-status" + (kind === "error" ? " is-error" : "");
    st.textContent = "";
    if (title) {
      var h = doc.createElement("h4");
      if (kind !== "error") h.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>';
      h.appendChild(doc.createTextNode(title));
      st.appendChild(h);
    }
    if (text) { var p = doc.createElement("p"); p.textContent = text; st.appendChild(p); }
    st.focus({ preventScroll: true });
  };
  function mailtoFor(subject, body) {
    var to = cfg.email || "info@jusu-imone.lt";
    return { to: to, subject: subject, body: body, href: "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body) };
  }
  function fallbackCopy(text) {
    var ta = doc.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    doc.body.appendChild(ta); ta.select();
    try { doc.execCommand("copy"); } catch (err) { /* nieko */ }
    ta.remove();
  }
  function mailActions(mt) {
    var wrap = doc.createElement("div"); wrap.className = "status-actions";
    var a = doc.createElement("a"); a.className = "btn btn-dark"; a.href = mt.href; a.textContent = "Atidaryti laišką";
    var c = doc.createElement("button"); c.type = "button"; c.className = "btn btn-line"; c.textContent = "Kopijuoti tekstą";
    c.addEventListener("click", function () {
      var text = "Kam: " + mt.to + "\nTema: " + mt.subject + "\n\n" + mt.body;
      var done = function () { c.textContent = "Nukopijuota"; };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      else { fallbackCopy(text); done(); }
    });
    wrap.appendChild(a); wrap.appendChild(c);
    return wrap;
  }
  // Siuntimas: be formEndpoint — tik el. laiško juodraštis; su juo — sėkmė rodoma tik gavus 2xx atsakymą
  Form.prototype.send = function (subject, body, data, onSent) {
    var self = this, mt = mailtoFor(subject, body);
    if (!endpoint) {
      this.showStatus("ok", "Laiškas paruoštas, bet dar neišsiųstas",
        "El. pašto programoje turėtų atsidaryti laiškas adresu " + mt.to + ". Užklausą gausime tik jums jį išsiuntus.");
      this.status.appendChild(mailActions(mt));
      window.location.href = mt.href;
      return;
    }
    var label = this.submitLabel.textContent;
    this.submitBtn.setAttribute("aria-busy", "true");
    this.submitLabel.textContent = "Siunčiama…";
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(Object.assign({ _subject: subject, tekstas: body }, data))
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      self.showStatus("ok", "Užklausa gauta", "Susisieksime nurodytu telefonu.");
      if (onSent) onSent();
    }).catch(function () {
      self.showStatus("error", "", "Išsiųsti nepavyko. Paskambinkite arba išsiųskite užklausą el. paštu.");
      self.status.appendChild(mailActions(mt));
    }).then(function () {
      self.submitBtn.removeAttribute("aria-busy");
      self.submitLabel.textContent = label;
    });
  };
  function useEndpointCopy(form) {
    if (!endpoint) return;
    $$("[data-form-explainer]", form).forEach(function (ex) { ex.textContent = "Užklausa siunčiama tiesiogiai. Jei nepavyks, pasiūlysime ją išsiųsti el. paštu."; });
    var l = $("[data-submit-label]", form); if (l) l.textContent = "Siųsti užklausą";
  }

  /* ==========================================================================
     A. Gedimas: pasirinkimas + greitas kontaktas
     ========================================================================== */
  var probTabs = $$(".prob-tab");
  var quickEl = $("#greitas");
  var quick = quickEl ? new Form(quickEl, "q-") : null;
  var faultNames = { pratekejimas: "Prateka vamzdis", uzsikimsimas: "Užsikimšo kanalizacija", radiatoriai: "Nešyla radiatoriai", kita: "Kitas gedimas" };

  function selectProblem(tab, opts) {
    opts = opts || {};
    probTabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var p = doc.getElementById(t.getAttribute("aria-controls"));
      if (p) p.hidden = !on;
    });
    // Greito kontakto forma visada rodo tą patį gedimą
    if (quickEl) quickEl.elements.gedimas.value = tab.getAttribute("data-problem-key");
    var panel = doc.getElementById(tab.getAttribute("aria-controls"));
    if (motion && panel && opts.animate !== false) {
      gsap.fromTo(panel.children, { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, stagger: 0.07, ease: "expo.out", overwrite: true, clearProps: "transform" });
      gsap.fromTo($$(".prob-steps li", panel), { x: 24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, stagger: 0.07, delay: 0.15, ease: "power3.out", clearProps: "transform" });
    }
    if (opts.focus) tab.focus();
  }
  function tabFor(key) { return probTabs.filter(function (t) { return t.getAttribute("data-problem-key") === key; })[0]; }
  probTabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectProblem(tab); });
    tab.addEventListener("keydown", function (e) { var n = arrowNav(probTabs, i, e); if (n) selectProblem(n, { focus: true }); });
  });
  // Telefone „Ką paprastai darome“ suskleista
  var smallMq = window.matchMedia("(max-width: 639px)");
  function syncDetails() { $$(".prob-more").forEach(function (d) { d.open = !smallMq.matches; }); }
  syncDetails();
  if (smallMq.addEventListener) smallMq.addEventListener("change", syncDetails); else smallMq.addListener(syncDetails);

  if (quick) {
    useEndpointCopy(quickEl);
    var qFields = ["vardas", "telefonas", "vietove", "sutikimas"];
    quick.live(qFields);
    quickEl.elements.gedimas.addEventListener("change", function () {
      var t = tabFor(quickEl.elements.gedimas.value); if (t) selectProblem(t, { animate: false });
    });
    quickEl.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!qFields.every(function (n) { return quick.check(n); })) {
        quick.showStatus("error", "", "Pataisykite pažymėtus laukus.");
        quick.validate(qFields); // fokusas į pirmą klaidingą lauką
        return;
      }
      var f = quickEl.elements;
      var data = {
        gedimas: faultNames[f.gedimas.value], vardas: f.vardas.value.trim(), telefonas: f.telefonas.value.trim(),
        vietove: f.vietove.value.trim(), pastaba: f.pastaba.value.trim()
      };
      var body = "Sveiki,\n\nGedimas: " + data.gedimas + "\nAdresas / vietovė: " + data.vietove +
        (data.pastaba ? "\nPastaba: " + data.pastaba : "") +
        "\n\nVardas: " + data.vardas + "\nTelefonas: " + data.telefonas +
        "\n\nPrašau paskambinti.\nSutinku, kad duomenys būtų naudojami atsakant į šią užklausą.";
      quick.send("Gedimas: " + data.gedimas + " (" + data.vietove + ")", body, data, function () { quickEl.reset(); syncFaultSelect(); });
    });
  }
  function syncFaultSelect() {
    var t = probTabs.filter(function (x) { return x.getAttribute("aria-selected") === "true"; })[0];
    if (t && quickEl) quickEl.elements.gedimas.value = t.getAttribute("data-problem-key");
  }

  /* ==========================================================================
     B. Įrengimas: 3 žingsnių forma
     ========================================================================== */
  var wizEl = $("#uzklausa");
  var wiz = wizEl ? new Form(wizEl, "f-") : null;
  var step = 1, maxReached = 1, chosenService = "";
  var serviceNames = {
    vandentiekis: "1 / Vandentiekis", kanalizacija: "2 / Kanalizacija", sildymas: "3 / Šildymo sistemos",
    prietaisai: "4 / Santechnikos montavimas", vamzdynai: "5 / Vamzdynų renovacija"
  };
  var serviceToWork = { vandentiekis: "vandentiekis", kanalizacija: "vandentiekis", sildymas: "sildymas", prietaisai: "santechnika", vamzdynai: "renovacija" };
  var hints = {
    santechnika: { ph: "Pvz.: vonios kambarys 5 m², potinkinis klozeto rėmas, dušas, praustuvas.", hint: "Išvardinkite prietaisus ir pažymėkite, ar jie nupirkti." },
    renovacija: { ph: "Pvz.: keičiame vamzdynus vonioje ir virtuvėje, butas 1975 m. name.", hint: "Kokios patalpos, koks namo tipas ir metai." },
    sildymas: { ph: "Pvz.: grindinis šildymas 80 m² name, prijungti prie esamo katilo.", hint: "Plotas, šildymo būdas ir esama įranga." },
    vandentiekis: { ph: "Pvz.: nauja virtuvės plautuvės vieta, reikia perkelti vandenį ir nuotekas.", hint: "Kas keičiama ar įrengiama ir kur." },
    kita: { ph: "Kokius darbus planuojate?", hint: "Patalpos, prietaisai ir jų vietos." }
  };
  var stepFields = { 1: ["darbai"], 2: ["objektas", "aprasymas"], 3: ["vardas", "telefonas", "elpastas", "vietove", "sutikimas"] };
  var stepNames = ["", "Darbai", "Detalės", "Kontaktai"];

  function updateHints() {
    var d = wiz.checked("darbai"), h = hints[d ? d.value : "kita"];
    wizEl.elements.aprasymas.placeholder = h.ph;
    var el = $("[data-desc-hint]", wizEl); if (el) el.textContent = h.hint;
  }
  function renderSummary() {
    var dl = $("[data-wiz-summary]", wizEl), rows = [];
    var d = wiz.checked("darbai"), o = wiz.checked("objektas"), et = wiz.checked("etapas");
    if (d) rows.push(["Darbai", d.getAttribute("data-label")]);
    if (chosenService) rows.push(["Paslauga", serviceNames[chosenService]]);
    if (o) rows.push(["Objektas", o.value]);
    if (et) rows.push(["Etapas", et.value]);
    if (wizEl.elements.laikas.value) rows.push(["Pradžia", wizEl.elements.laikas.value]);
    dl.textContent = "";
    rows.forEach(function (r) {
      var div = doc.createElement("div"), dt = doc.createElement("dt"), dd = doc.createElement("dd");
      dt.textContent = r[0]; dd.textContent = r[1]; div.appendChild(dt); div.appendChild(dd); dl.appendChild(div);
    });
  }
  function showStep(n, opts) {
    opts = opts || {};
    var from = step; step = n; maxReached = Math.max(maxReached, n);
    var steps = $$(".wiz-step", wizEl);
    steps.forEach(function (s) { s.hidden = Number(s.getAttribute("data-step")) !== n; });
    $$(".wiz-progress li", wizEl).forEach(function (li) {
      var k = Number(li.getAttribute("data-progress"));
      if (k === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      li.classList.toggle("is-done", k < n || (k < maxReached && k !== n));
      $("button", li).disabled = k === n || k > maxReached;
    });
    $("[data-prev]", wizEl).hidden = n === 1;
    $("[data-next]", wizEl).hidden = n === 3;
    $("[data-submit]", wizEl).hidden = n !== 3;
    if (n === 2) updateHints();
    if (n === 3) renderSummary();
    var ann = $("[data-wiz-announce]", wizEl); if (ann) ann.textContent = n + " žingsnis iš 3: " + stepNames[n];
    var cur = steps[n - 1];
    if (motion && opts.animate !== false && from !== n) {
      gsap.fromTo(cur, { x: (n > from ? 1 : -1) * 24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out", clearProps: "transform" });
    }
    if (opts.focus !== false) {
      var t = $(".wiz-title", cur); if (t) t.focus({ preventScroll: true });
      var card = $(".wizard-card"); if (card && card.getBoundingClientRect().top < headerH()) scrollToEl(card);
    }
  }
  function setService(key) {
    chosenService = key;
    var note = $("[data-wiz-service]", wizEl);
    note.hidden = false;
    note.textContent = "Paslauga: " + serviceNames[key] + ". Patikslinkite darbų tipą.";
    var w = wiz.radios("darbai").filter(function (r) { return r.value === serviceToWork[key]; })[0];
    if (w) { w.checked = true; wiz.check("darbai"); }
    showStep(1, { focus: false });
  }

  if (wiz) {
    useEndpointCopy(wizEl);
    wiz.live(["darbai", "objektas", "aprasymas", "vardas", "telefonas", "elpastas", "vietove", "sutikimas"]);
    wiz.radios("darbai").forEach(function (r) { r.addEventListener("change", updateHints); });
    $("[data-next]", wizEl).addEventListener("click", function () { if (wiz.validate(stepFields[step])) showStep(step + 1); });
    $("[data-prev]", wizEl).addEventListener("click", function () { showStep(step - 1); });
    $$("[data-goto]", wizEl).forEach(function (b) {
      b.addEventListener("click", function () {
        var n = Number(b.getAttribute("data-goto"));
        if (n < step || wiz.validate(stepFields[step])) showStep(n);
      });
    });
    wizEl.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || /TEXTAREA|BUTTON|A/.test(e.target.tagName)) return;
      if (step < 3) { e.preventDefault(); if (wiz.validate(stepFields[step])) showStep(step + 1); }
    });
    wizEl.addEventListener("submit", function (e) {
      e.preventDefault();
      if (step !== 3) { if (wiz.validate(stepFields[step])) showStep(step + 1); return; }
      for (var n = 1; n <= 3; n++) {
        if (!stepFields[n].every(function (name) { return wiz.check(name); })) {
          if (n !== 3) showStep(n);
          wiz.validate(stepFields[n]);
          wiz.showStatus("error", "", "Pataisykite pažymėtus laukus.");
          return;
        }
      }
      var f = wizEl.elements, d = wiz.checked("darbai"), o = wiz.checked("objektas"), et = wiz.checked("etapas");
      var data = {
        darbai: d.getAttribute("data-label"), paslauga: chosenService ? serviceNames[chosenService] : "",
        objektas: o.value, etapas: et ? et.value : "", pradzia: f.laikas.value, aprasymas: f.aprasymas.value.trim(),
        vardas: f.vardas.value.trim(), telefonas: f.telefonas.value.trim(), elpastas: f.elpastas.value.trim(), vietove: f.vietove.value.trim()
      };
      var lines = ["Darbai: " + data.darbai];
      if (data.paslauga) lines.push("Paslauga: " + data.paslauga);
      lines.push("Objektas: " + data.objektas);
      if (data.etapas) lines.push("Darbų etapas: " + data.etapas);
      if (data.pradzia) lines.push("Pradžia: " + data.pradzia);
      lines.push("Vietovė: " + data.vietove);
      var body = "Sveiki,\n\n" + lines.join("\n") + "\n\nAprašymas:\n" + data.aprasymas +
        "\n\nVardas: " + data.vardas + "\nTelefonas: " + data.telefonas + (data.elpastas ? "\nEl. paštas: " + data.elpastas : "") +
        "\n\nSutinku, kad duomenys būtų naudojami atsakant į šią užklausą.";
      wiz.send("Įrengimas: " + data.darbai + " (" + data.vietove + ")", body, data, function () {
        wizEl.reset(); chosenService = ""; maxReached = 1; $("[data-wiz-service]", wizEl).hidden = true; showStep(1, { focus: false });
      });
    });
    showStep(1, { focus: false, animate: false });
  }

  /* ---------- Nuorodos: inkarai, gedimai ir paslaugos ---------- */
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
    var fault = a.getAttribute("data-fault"), svc = a.getAttribute("data-service");
    if (fault) { var t = tabFor(fault); if (t) selectProblem(t, { animate: false }); }
    if (svc && wiz) setService(svc);
    var menuWasOpen = nav && nav.classList.contains("is-open");
    if (menuWasOpen) setMenu(false);
    if (doc.getElementById(hash.slice(1))) {
      e.preventDefault();
      setTimeout(function () {
        goToHash(hash, true);
        // Iš gedimo ar paslaugos — fokusas į pirmą formos lauką
        if (fault || svc) setTimeout(function () {
          var target = fault ? $("#q-vardas") : $(".wiz-step:not([hidden]) .wiz-title", wizEl);
          if (target) target.focus({ preventScroll: true });
        }, reduce ? 0 : 650);
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
    var lines = $$(".hero-title .hl > span");
    gsap.set(lines, { yPercent: 105 });
    endIntro();
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .to(lines, { yPercent: 0, duration: 1, stagger: 0.09 }, 0)
      .from("[data-hero-photo]", { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut", clearProps: "clipPath" }, 0.05)
      .from("[data-hero-photo] img", { scale: 1.25, duration: 1.6 }, 0.1)
      .from(".paths .path", { autoAlpha: 0, x: -40, duration: 0.8, stagger: 0.1, clearProps: "transform,opacity,visibility" }, 0.45)
      .from(".hero-lead", { autoAlpha: 0, y: 24, duration: 0.8, clearProps: "transform,opacity,visibility" }, 0.35)
      .from(".contact-strip li", { autoAlpha: 0, y: 28, duration: 0.7, stagger: 0.08, clearProps: "transform,opacity,visibility" }, 0.6);

    // Hero nuotrauka slenkant juda lėčiau — gylio pojūtis
    gsap.to("[data-hero-photo] img", {
      yPercent: 10, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    // Vienkartiniai įėjimai slenkant (tik transform/opacity/clip-path)
    function reveal(selector, vars) {
      if (!$(selector)) return;
      ST.batch(selector, {
        start: "top 90%", once: true,
        onEnter: function (els) {
          gsap.from(els, Object.assign({ autoAlpha: 0, y: 56, duration: 1, ease: "expo.out", stagger: 0.1, clearProps: "transform,opacity,visibility,clipPath" }, vars || {}));
        }
      });
    }
    // Antraštės iškyla iš „kaukės“
    reveal(".sec-title", { y: 60, clipPath: "inset(0 0 100% 0)", duration: 1.1 });
    reveal(".sec-index, .sec-intro", { y: 24, duration: 0.8 });
    reveal(".prob-list .prob-tab", { y: 30, stagger: 0.07, duration: 0.8 });
    reveal(".prob-panels", { y: 50, duration: 1 });
    reveal(".quick-card, .wizard-card", { y: 90, duration: 1.1 });
    reveal(".plan-list li", { x: -50, y: 0, stagger: 0.08, duration: 0.8 });
    reveal(".svc-row", { x: -60, y: 0, stagger: 0.08, duration: 0.9 });
    reveal(".shot", { y: 90, clipPath: "inset(20% 0 0 0)", duration: 1.2, stagger: 0.12 });
    reveal(".rules li", { x: 40, y: 0, stagger: 0.1 });
    reveal(".step", { y: 40, stagger: 0.15, delay: 0.25 });
    reveal(".step-n", { scale: 0.3, y: 0, rotate: -90, stagger: 0.15, delay: 0.3, ease: "back.out(2)", duration: 0.8 });
    reveal(".acc-item", { x: 40, y: 0, stagger: 0.07, duration: 0.8 });
    reveal(".footer-grid > *", { y: 40, stagger: 0.1, duration: 0.9 });
    var line = $("[data-step-line]");
    if (line) {
      var vertical = window.innerWidth < 1024;
      gsap.fromTo(line, vertical ? { scaleY: 0 } : { scaleX: 0 }, {
        scaleY: 1, scaleX: 1, duration: 1.1, ease: "power2.inOut",
        scrollTrigger: { trigger: "[data-steps]", start: "top 75%", once: true }
      });
    }
    window.addEventListener("load", function () { ST.refresh(); });
  }
  var started = false;
  function start() { if (started) return; started = true; initMotion(); handleInitialHash(); }
  if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(start); setTimeout(start, 1200); } else start();
})();
