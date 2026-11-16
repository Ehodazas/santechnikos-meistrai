/* Privatumo politikos puslapis: įrašo kontaktus iš config.js ir metus */
document.addEventListener("DOMContentLoaded", function () {
  var cfg = window.SITE_CONFIG || {};
  document.querySelectorAll("[data-config]").forEach(function (el) {
    var k = el.getAttribute("data-config"); if (cfg[k]) el.textContent = cfg[k];
  });
  document.querySelectorAll("[data-config-link='email']").forEach(function (el) {
    if (cfg.email) el.href = "mailto:" + cfg.email;
  });
  var y = document.getElementById("metai");
  if (y) y.textContent = new Date().getFullYear();
});
