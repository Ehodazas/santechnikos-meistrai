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

1. **Hero** — žinutė „Vamzdžiai, šildymas, vandentiekis. Sutvarkysime.“, veiksmo mygtukai.
2. **Problemos** — pasirinkimas pagal realią situaciją (prateka vamzdis, užsikimšo kanalizacija ir kt.): ką padaryti dabar, ką paprastai atliekame, susijusios paslaugos ir mygtukas, kuris perkelia į užklausą su jau pažymėta problema.
3. **Paslaugos** — vienas numeruotas katalogas (01–06), eilutės išsiskleidžia.
4. **Darbų pavyzdžiai** — redakcinis nuotraukų išdėstymas su peržiūra; nuotraukos pažymėtos kaip iliustracinės.
5. **Kaip dirbame** — principai ir 4 žingsnių eiga (sujungta buvusi „Apie mus“ ir „Kaip dirbame“).
6. **DUK** ir **Užklausa** — 3 žingsnių forma.

## Užklausos forma (3 žingsniai)

1. **Problema** — pasirinkimas iš šešių situacijų.
2. **Detalės** — objektas (butas / namas / komercinės patalpos), aprašymas (užuomina keičiasi pagal problemą), pageidaujamas laikas.
3. **Kontaktai** — vardas, telefonas, el. paštas (nebūtina), vietovė, sutikimas; rodoma pasirinkimų suvestinė.

Viršuje — eigos juosta; galima grįžti atgal, įvesti duomenys išlieka. Laukai tikrinami kiekviename žingsnyje.

**Numatytasis režimas (be serverio):** forma **nesiunčia** duomenų pati. Ji paruošia laišką lankytojo el. pašto programoje adresu iš `js/config.js` ir aiškiai parašo, kad laiškas dar neišsiųstas; galima jį atidaryti dar kartą arba nukopijuoti tekstą.

**Tiesioginis siuntimas (neprivaloma):** `js/config.js` lauke `formEndpoint` įrašykite formų paslaugos adresą (pvz., Formspree). Tada forma siųs užklausą `POST` (JSON) ir sėkmės pranešimą rodys **tik** gavusi sėkmingą serverio atsakymą. Prieš įjungdami atnaujinkite privatumo politiką ir CSP `connect-src`.

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
