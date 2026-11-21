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
js/main.js               Meniu, problemų pasirinkimas, paslaugų katalogas, 3 žingsnių užklausa, DUK, galerija
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

## Svetainės struktūra

Svetainė sukurta aplink du lankytojo kelius:

1. **Hero** — antraštė (didžiausia puslapyje), du keliai „Turiu gedimą“ ir „Planuoju įrengimą“, telefonas, aptarnaujama teritorija ir darbo laikas.
2. **A. Turiu gedimą** — pagrindinis turinys: gedimo pasirinkimas (prateka, užsikimšo, nešyla, kita) su patarimais, ką daryti dabar, ir **greitas kontaktas** — skambinimo mygtukas bei trumpa forma (gedimas, vardas, telefonas, adresas).
3. **B. Planuoju įrengimą** — išsami 3 žingsnių forma: darbų tipas → detalės (objektas, darbų etapas, aprašymas, pradžia) → kontaktai, su eigos juosta, grįžimu atgal ir suvestine.
4. **Paslaugos** (01–06), **Darbų pavyzdžiai** (pažymėti „Demo“), **Kaip vyksta darbas**, **DUK**, poraštė su kontaktais.
5. Telefone ekrano apačioje — juosta „Skambinti / Gedimas / Įrengimas“.

## Pavyzdiniai duomenys

`js/config.js` reikšmės (telefonas, el. paštas, teritorija, darbo laikas, rekvizitai) yra pavyzdinės. Kol `demo: true`, šalia jų rodoma žymė **Demo**. Įrašę tikrus duomenis, nustatykite `demo: false` — žymės dings. Darbų nuotraukos pažymėtos „Demo“ HTML faile; pakeitę jas savo nuotraukomis, žymes pašalinkite.

## Užklausų siuntimas

Abi formos (greitas kontaktas ir išsami forma) be serverio **nesiunčia** duomenų pačios: jos paruošia laišką lankytojo el. pašto programoje ir aiškiai parašo, kad laiškas dar neišsiųstas. Įrašius `formEndpoint` (`js/config.js`), formos siųs `POST` (JSON) ir sėkmę rodys tik gavusios sėkmingą serverio atsakymą. Prieš įjungdami atnaujinkite privatumo politiką ir CSP `connect-src`.

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
- Dizainas: grafitas, šilta balta ir varinis-oranžinis akcentas; siaura Archivo antraštė, techninės linijos ir kampų žymės.
- Animacijos — [GSAP](https://gsap.com/) 3.13 su ScrollTrigger, laikomas `js/vendor/`: trumpa hero įžanga, išskleidžiami blokai, perėjimai tarp formos žingsnių, vienkartinis nuotraukų atsivėrimas. Jokių nuolat judančių elementų. Kai įjungtas `prefers-reduced-motion` arba GSAP neužsikrauna, viskas veikia be animacijų.
- Atsakingi paveikslėliai (`srcset`, `sizes`, `loading="lazy"`), hero vaizdas su `fetchpriority="high"`.
- SEO: `title`, `description`, `canonical`, Open Graph, JSON-LD (`Plumber`).
- Šriftai: Archivo ir Figtree, laikomi `assets/fonts/` (lotynų ir lietuviškos raidės), todėl nesikreipiama į „Google Fonts“.
- Saugumas: turinio saugumo politika (CSP) `<meta>` žyme — skriptai, stiliai ir šriftai tik iš savo svetainės, nuotraukos tik iš `images.unsplash.com`; jokių įterptų skriptų.

## Nuotraukų licencija

Nuotraukos naudojamos pagal [Unsplash licenciją](https://unsplash.com/license) (nemokamos komerciniam naudojimui, priskyrimas nebūtinas, bet nurodytas poraštėje). Autoriai: Timur Shakerzianov, Rose Galloway Green, e24, Franco Debartolo, Olek Buzunov, Gabriel Vasiliu, Lotus Design N Print, Julian Hochgesang, Immo Wegmann, Maverick Frame.
