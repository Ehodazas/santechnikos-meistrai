/* ==========================================================================
   Santechnikos Meistrai — sąsajos logika (be priklausomybių; GSAP — neprivalomas)
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  /* ---------- Metai poraštėje ---------- */
  var yearEl = $("#metai");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Konfigūracija ---------- */
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

  /* ---------- Antraštė: šešėlis slenkant ---------- */
  var header = $(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobilus meniu ---------- */
  var toggle = $(".menu-toggle");
  var nav = $("#pagrindinis-meniu");
  var desktopMq = window.matchMedia("(min-width: 1080px)");

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    $(".visually-hidden", toggle).textContent = open ? "Uždaryti meniu" : "Atidaryti meniu";
    nav.classList.toggle("is-open", open);
    doc.body.classList.toggle("menu-open", open);
    // Paslėpto meniu nuorodos neturi būti pasiekiamos klaviatūra
    if (!desktopMq.matches) {
      if (open) nav.removeAttribute("inert"); else nav.setAttribute("inert", "");
    }
    if (open) { var first = $("a", nav); if (first) first.focus(); }
  }
  function syncNavForViewport() {
    if (!nav) return;
    if (desktopMq.matches) { nav.removeAttribute("inert"); setMenuClosedSilently(); }
    else if (!nav.classList.contains("is-open")) nav.setAttribute("inert", "");
  }
  function setMenuClosedSilently() {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    doc.body.classList.remove("menu-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && !desktopMq.matches) setMenu(false);
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
    });
    // Fokuso ciklas atidarytame meniu: Tab iš paskutinės nuorodos grįžta į mygtuką
    doc.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !nav.classList.contains("is-open")) return;
      var items = [toggle].concat($$("a", nav));
      var idx = items.indexOf(doc.activeElement);
      if (e.shiftKey && idx === 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && idx === items.length - 1) { e.preventDefault(); items[0].focus(); }
    });
    (desktopMq.addEventListener ? desktopMq.addEventListener("change", syncNavForViewport) : desktopMq.addListener(syncNavForViewport));
    syncNavForViewport();
  }

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
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        var panel = doc.getElementById(btn.getAttribute("aria-controls"));
        if (panel) panel.hidden = open;
      });
      // Rodyklių klavišai tarp klausimų
      btn.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowDown") next = triggers[(i + 1) % triggers.length];
        else if (e.key === "ArrowUp") next = triggers[(i - 1 + triggers.length) % triggers.length];
        else if (e.key === "Home") next = triggers[0];
        else if (e.key === "End") next = triggers[triggers.length - 1];
        if (next) { e.preventDefault(); next.focus(); }
      });
    });
  });

  /* ---------- Galerija ir lightbox ---------- */
  var dialog = $("#lightbox");
  var galleryBtns = $$(".gallery-btn");
  var current = 0;
  var lastFocus = null;

  function showSlide(i) {
    current = (i + galleryBtns.length) % galleryBtns.length;
    var btn = galleryBtns[current];
    var thumb = $("img", btn);
    var img = $(".lightbox-img", dialog);
    img.src = btn.getAttribute("data-full");
    img.alt = thumb ? thumb.alt : "";
    $(".lightbox-title", dialog).textContent = btn.getAttribute("data-title") || "";
    $(".lightbox-count", dialog).textContent = (current + 1) + " / " + galleryBtns.length;
  }
  function openLightbox(i) {
    if (!dialog || typeof dialog.showModal !== "function") {
      // Seni naršyklės variantai: atidarome nuotrauką naujame skirtuke
      window.open(galleryBtns[i].getAttribute("data-full"), "_blank", "noopener");
      return;
    }
    lastFocus = doc.activeElement;
    showSlide(i);
    dialog.showModal();
    doc.body.classList.add("menu-open");
    $(".lb-close", dialog).focus();
  }
  function closeLightbox() { if (dialog && dialog.open) dialog.close(); }

  if (dialog && galleryBtns.length) {
    galleryBtns.forEach(function (btn, i) { btn.addEventListener("click", function () { openLightbox(i); }); });
    $(".lb-close", dialog).addEventListener("click", closeLightbox);
    $(".lb-prev", dialog).addEventListener("click", function () { showSlide(current - 1); });
    $(".lb-next", dialog).addEventListener("click", function () { showSlide(current + 1); });
    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); showSlide(current - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); showSlide(current + 1); }
    });
    // Paspaudus už nuotraukos ribų — uždaryti
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.classList.contains("lightbox-figure")) closeLightbox();
    });
    dialog.addEventListener("close", function () {
      doc.body.classList.remove("menu-open");
      if (lastFocus) lastFocus.focus();
    });
    // Braukimas telefonuose
    var startX = null;
    dialog.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) showSlide(current + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  /* ---------- Paslaugos parinkimas iš nuorodų ---------- */
  var form = $("#uzklausa");
  var serviceSelect = $("#f-paslauga");
  $$("[data-service]").forEach(function (link) {
    link.addEventListener("click", function () {
      if (serviceSelect) {
        serviceSelect.value = link.getAttribute("data-service");
        clearError(serviceSelect);
      }
    });
  });

  /* ---------- Formos validacija ---------- */
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

  function normalizePhone(v) { return v.replace(/[\s\-()]/g, ""); }
  function validPhone(v) {
    var p = normalizePhone(v);
    // Lietuvos formatai (+370XXXXXXXX, 8XXXXXXXX) arba tarptautinis numeris
    return /^(\+370\d{8}|8\d{8}|\+\d{8,15})$/.test(p);
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function validate(input) {
    var name = input.name;
    var m = messages[name] || {};
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
      // Klaidą rodome palikus lauką, o taisant — iškart ją nuimame
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
      inputs.forEach(function (input) {
        if (!validate(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        status.hidden = false;
        status.className = "form-status is-error";
        status.innerHTML = "Formoje yra klaidų. Pataisykite pažymėtus laukus ir bandykite dar kartą.";
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
        '<a class="btn btn-primary" data-mailto>Atidaryti dar kartą</a>' +
        '<button class="btn btn-outline" type="button" data-copy>Kopijuoti laiško tekstą</button>' +
        "</div>";
      $("strong", status).textContent = to;
      $("[data-mailto]", status).setAttribute("href", mailto);

      var copyBtn = $("[data-copy]", status);
      copyBtn.addEventListener("click", function () {
        var text = "Kam: " + to + "\nTema: " + subject + "\n\n" + body;
        var done = function () { copyBtn.textContent = "Nukopijuota"; };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
        } else { fallbackCopy(text); done(); }
      });

      status.focus();
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

  /* ---------- GSAP animacijos (tik jei biblioteka užsikrovė ir judesys leidžiamas) ---------- */
  function initMotion() {
    var gsap = window.gsap;
    if (!gsap) return;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    var mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 960px)" }, function (ctx) {
      if (!ctx.conditions.motion) return;

      // Hero — vienkartinis įėjimas
      var tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.9 } });
      tl.from(".hero [data-enter]:not(.hero-media)", { y: 28, autoAlpha: 0, stagger: 0.08 })
        .from(".hero-media", { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "power3.inOut" }, 0.1)
        .from(".hero-media img", { scale: 1.08, duration: 1.6, ease: "power2.out" }, 0.1);

      // Laiko juosta — progresas slenkant
      var timeline = doc.querySelector(".timeline");
      if (timeline && window.ScrollTrigger) {
        timeline.style.setProperty("--progress", 0);
        gsap.to(timeline, {
          "--progress": 1,
          ease: "none",
          scrollTrigger: { trigger: timeline, start: "top 75%", end: "bottom 60%", scrub: 0.6 }
        });
        gsap.from(".step-dot", {
          scale: 0.6, autoAlpha: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.12,
          scrollTrigger: { trigger: timeline, start: "top 80%", once: true }
        });
      }

      return function () { if (timeline) timeline.style.removeProperty("--progress"); };
    });

    // Paveikslėliai keičia išdėstymą — atnaujiname trigerius
    window.addEventListener("load", function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); });
  }
  initMotion();
})();
