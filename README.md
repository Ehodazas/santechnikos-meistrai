# Santechnikos Meistrai — svetainė

Statinė, prisitaikanti (mobile-first) santechnikos paslaugų įmonės svetainė lietuvių kalba.
HTML5, CSS3 ir paprastas JavaScript — be kūrimo įrankių, be serverio.

## Struktūra

```
index.html               Pagrindinis puslapis (visos sekcijos)
privatumo-politika.html  Privatumo politikos šablonas
404.html                 Klaidos puslapis (GitHub Pages jį naudoja automatiškai)
css/styles.css           Visi stiliai; spalvos ir tarpai — :root kintamieji
js/config.js             ĮMONĖS DUOMENYS: telefonas, el. paštas, teritorija, darbo laikas, rekvizitai
js/main.js               Meniu, DUK akordeonas, galerijos lightbox, formos validacija, animacijos
assets/favicon.svg       Svetainės ikona
.nojekyll, robots.txt    GitHub Pages ir paieškos sistemų failai
```

## Paleidimas kompiuteryje

Užtenka atidaryti `index.html` naršyklėje. Kad viskas veiktų kaip serveryje, paleiskite paprastą vietinį serverį projekto aplanke:

```bash
python -m http.server 8000
```

arba (jei įdiegtas Node.js):

```bash
npx serve .
```

Tada atidarykite <http://localhost:8000>.

## Ką pakeisti prieš skelbiant

1. **Kontaktai** — `js/config.js`: `phone`, `phoneHref`, `email`, `serviceArea`, `workingHours`, `legalLine`. Įrašę tikrus duomenis, nustatykite `demo: false` (dings įspėjimas „pavyzdiniai duomenys“). Tas pačias reikšmes verta įrašyti ir `index.html` (jos rodomos, jei JavaScript išjungtas).
2. **Domenas** — prijungę savo domeną, `index.html` faile pakeiskite `https://ehodazas.github.io/santechnikos-meistrai/` (`canonical`, `og:url`, JSON-LD `url`), taip pat `sitemap.xml` ir `robots.txt`.
3. **Nuotraukos** — skiltyje „Atlikti darbai“ dabar yra iliustracinės „Unsplash“ nuotraukos su žyma „Pavyzdys“. Pakeiskite jas savo objektų nuotraukomis (pvz., `assets/img/...`), tada pašalinkite pastabą `.demo-note` ir žymes `.gallery-tag`. Lightbox didelį vaizdą ima iš mygtuko atributo `data-full`.
4. **Privatumo politika** — užpildykite laukelius `[...]` faile `privatumo-politika.html`.
5. **Tekstai** — paslaugų aprašymai ir DUK atsakymai yra realistiški, bet bendro pobūdžio. Pritaikykite juos savo veiklai ir neskelbkite to, ko negalite patvirtinti.

## Užklausos forma

Svetainė neturi serverio, todėl forma **nesiunčia** duomenų pati. Patikrinusi laukus, ji atidaro lankytojo el. pašto programą su užpildytu laišku (`mailto:`) adresu iš `config.js` ir pasiūlo nukopijuoti tekstą, jei programa neatsidaro. Tai aiškiai paaiškinta formos viršuje.

Norėdami tikro siuntimo, prijunkite formų paslaugą (pvz., Formspree, Netlify Forms, Basin) arba savo serverį: `js/main.js` dalyje `form.addEventListener("submit", ...)` vietoje `window.location.href = mailto` atlikite `fetch()` užklausą ir atnaujinkite paaiškinimo tekstą formoje.

## Paskelbimas GitHub Pages

1. Sukurkite naują GitHub repozitoriją (pvz., `santechnikos-meistrai`).
2. Įkelkite failus:

   ```bash
   git init
   ```

   ```bash
   git add .
   ```

   ```bash
   git commit -m "Santechnikos Meistrai svetainė"
   ```

   ```bash
   git branch -M main
   ```

   ```bash
   git remote add origin https://github.com/<jusu-vartotojas>/santechnikos-meistrai.git
   ```

   ```bash
   git push -u origin main
   ```

3. Repozitorijoje: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, šaka `main`, aplankas `/ (root)`. Išsaugokite.
4. Po minutės ar dviejų svetainė bus pasiekiama adresu `https://<jusu-vartotojas>.github.io/santechnikos-meistrai/`.
5. Savo domenui: **Settings → Pages → Custom domain** ir DNS įrašai pagal GitHub instrukcijas.

Visi keliai santykiniai, todėl svetainė veikia ir pakatalogyje, ir savame domene.

## Techninės savybės

- Semantinis HTML, viena `h1`, logiška antraščių hierarchija, „Pereiti prie turinio“ nuoroda.
- Pasiekiamumas: matomas fokusas, `aria-expanded` meniu ir DUK, klaviatūra valdomas lightbox (`Esc`, `←`/`→`), DUK rodyklių klavišai, klaidos susietos su laukais (`aria-describedby`, `aria-invalid`).
- `prefers-reduced-motion`: išjungiamos animacijos ir sklandus slinkimas.
- Animacijos — [GSAP](https://gsap.com/) 3.12.5 per cdnjs (vienkartinis hero įėjimas, darbo eigos linija slenkant). Jei biblioteka neužsikrauna, svetainė veikia be animacijų.
- Atsakingi paveikslėliai (`srcset`, `sizes`, `loading="lazy"`), hero vaizdas su `fetchpriority="high"`.
- SEO: `title`, `description`, `canonical`, Open Graph, JSON-LD (`Plumber`).
- Šriftai: Schibsted Grotesk ir Manrope (Google Fonts, palaiko lietuviškas raides).

## Nuotraukų licencija

Nuotraukos naudojamos pagal [Unsplash licenciją](https://unsplash.com/license) (nemokamos komerciniam naudojimui, priskyrimas nebūtinas, bet nurodytas poraštėje). Autoriai: Timur Shakerzianov, Rose Galloway Green, e24, Franco Debartolo, Olek Buzunov, Gabriel Vasiliu, Lotus Design N Print, Julian Hochgesang, Immo Wegmann, Maverick Frame.
