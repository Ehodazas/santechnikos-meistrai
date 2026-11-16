/**
 * Įmonės duomenys. Pakeiskite šias reikšmes tikrais duomenimis.
 * Jos automatiškai įrašomos visur, kur HTML yra atributas data-config="...".
 *
 * Svarbu: tą pačią informaciją verta atnaujinti ir index.html faile
 * (numatytosios reikšmės ten rodomos, jei JavaScript išjungtas).
 */
window.SITE_CONFIG = {
  // true — rodomi įspėjimai, kad kontaktai yra pavyzdiniai. Įrašę tikrus duomenis, nustatykite false.
  demo: true,

  // Telefonas: rodomas tekstas ir numeris tel: nuorodai (be tarpų, su +370).
  phone: "+370 600 00000",
  phoneHref: "+37060000000",

  // El. paštas — juo bus adresuojami formos laiškai.
  email: "info@jusu-imone.lt",

  serviceArea: "[Nurodykite aptarnaujamą teritoriją]",
  workingHours: "[Nurodykite darbo laiką]",

  // Rekvizitai poraštėje.
  legalLine: "[Įmonės pavadinimas], įm. k. [000000000]"
};
