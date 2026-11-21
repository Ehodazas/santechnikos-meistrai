/**
 * Įmonės duomenys. Pakeiskite šias reikšmes tikrais duomenimis.
 * Jos automatiškai įrašomos visur, kur HTML yra atributas data-config="...".
 *
 * Svarbu: tą pačią informaciją verta atnaujinti ir index.html faile
 * (numatytosios reikšmės ten rodomos, jei JavaScript išjungtas).
 */
window.SITE_CONFIG = {
  // true — prie pavyzdinių duomenų rodoma žymė „Demo“. Įrašę tikrus duomenis, nustatykite false.
  demo: true,

  // Telefonas: rodomas tekstas ir numeris tel: nuorodai (be tarpų, su +370).
  phone: "+370 600 00000",
  phoneHref: "+37060000000",

  // El. paštas — juo bus adresuojami formos laiškai.
  email: "info@jusu-imone.lt",

  serviceArea: "Vilnius ir Vilniaus r.",
  workingHours: "I–V 8–18 val.",

  // Rekvizitai poraštėje.
  legalLine: "UAB „Pavyzdys“, įm. k. 000000000",

  // Užklausų siuntimas.
  // Tuščia reikšmė — forma paruošia laišką lankytojo el. pašto programoje (mailto), nieko nesiunčia pati.
  // Įrašius formų paslaugos adresą (pvz., „https://formspree.io/f/xxxxxxx“), forma siųs užklausą
  // tiesiogiai (POST, JSON) ir sėkmės pranešimą rodys TIK gavusi sėkmingą serverio atsakymą.
  // Prieš įjungdami atnaujinkite privatumo politiką (duomenis tvarkys ir ta paslauga).
  // Saugumo politika (CSP) HTML <head> dalyje leidžia jungtis tik prie https://formspree.io —
  // naudodami kitą paslaugą, jos adresą įrašykite į „connect-src“ visuose trijuose HTML failuose.
  formEndpoint: ""
};
