/* Kraunamas <head> dalyje: pažymi, kad JS veikia, ir trumpam paslepia hero iki įžangos animacijos.
   Saugiklis — jei animacijos neužsikrautų, turinys parodomas po 1,8 s. */
(function (d) {
  var h = d.documentElement;
  h.classList.add("js");
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    h.classList.add("intro");
    setTimeout(function () { h.classList.remove("intro"); }, 1800);
  }
})(document);
