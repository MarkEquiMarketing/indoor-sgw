# Indoor SGW website

Nieuwe website voor de Indoor SGW (indoorsgw.nl): drie dagen trainen en wedstrijdrijden met dressuur, springen en cross, eind december bij Manege Het Zwarte Water in De Mortel.

**Lees dit bestand en `docs/feedback-log.md` voordat je iets ontwerpt of bouwt.** Elke nieuwe les uit feedback komt in het feedbacklog, en een vaste regel ook hieronder.

## Structuur

| Pad | Wat |
| --- | --- |
| `assets/css/indoorsgw.css` | De stylesheet. Eén bestand voor de hele site. Tokens bovenaan. |
| `assets/js/indoorsgw.js` | Het script voor elke pagina: fase, menu, slider, banden, tabs, kaart, video. |
| `assets/img`, `assets/logo`, `assets/sponsors` | Foto's, logo's en sponsorlogo's. |
| `ontwerp/homepage.html` | Goedgekeurde homepage v3. De bron van de stijl. |
| `ontwerp/stijlgids.html` | Visuele stijlgids met alle onderdelen en regels. |
| `ontwerp/varianten-*.html`, `concept-*.html` | Eerdere keuzes. Alleen ter naslag. |
| `content/teksten.md` | De teksten van de huidige site. Bron voor feiten. |
| `docs/feedback-log.md` | Alle feedback met datum, wat we ervan leerden. |
| `ontwerp/over-ons.html`, `hindernissen.html`, `virtual-tour.html`, `contact.html`, `stalling.html`, `sponsoren.html` | De subpagina's die al ontworpen zijn. |
| `tools/nav.py` | Zet menu, mobiel menu en footer op elke pagina. Eén bron voor de menustructuur. |
| `tools/preview.py` | Maakt een losse preview met alles erin (zie Werkwijze). |
| `index.html` | Overzicht voor de preview op Vercel. |

## Nieuwe pagina bouwen

1. Begin vanaf een bestaande subpagina, zoals `ontwerp/over-ons.html`: zelfde `<head>` (met favicon), footer en `<script src="../assets/js/indoorsgw.js" defer>`. Menu en footer zet je met `python3 tools/nav.py`.
2. Vervang de hero door een `.page-hero` met `h1`, korte intro en hooguit twee knoppen. Geen kruimelpad.
3. Bouw alleen met onderdelen uit de stylesheet. Zie `ontwerp/stijlgids.html`. Mist er iets, voeg het toe aan `indoorsgw.css` in het juiste hoofdstuk en zet het in de stijlgids. Geen losse `<style>` per pagina.
4. Zet `aria-current="page"` op het actieve menu-item.
5. Maak een preview, controleer desktop (1440) en mobiel (375), en kijk of er niets buiten beeld loopt.

## Ontwerpregels

- **Gevoel:** strak, rustig, premium, modern. Niet druk, niet speels, geen poster. Liever één sterk element dan veel effecten.
- **Kleur:** alleen de tokens. Blauw en navy als basis, goud (`--accent`) voor de hoofdactie en één uitgelicht element per blok.
- **Letter:** Montserrat vet voor titels en knoppen, Verdana voor tekst. Geen hoofdletterlabels, geen cursief.
- **Titels:** elke sectietitel gebruikt `var(--h2)` en gewicht 800, met `var(--head-gap)` eronder. Hero h1 alleen op de homepage (`--h1`), subpagina's gebruiken `--h1-page`. Titels mogen nooit tegen het menu aan lopen.
- **Hero:** inhoud in het midden uitgelijnd, knoppen in het midden, infobalk onderaan. De kop van een subpagina (`.page-hero`, `.tour`, `.theater`) heeft ronde hoeken onder. Geen kruimelpad.
- **Ruimte:** alles uit het 8px-raster, met de tokens bovenaan de stylesheet. Tussen secties `--space` (64 mobiel, 120 desktop), onder een sectiekop `--head-gap`, tussen blokken `--gap`. Nooit een eigen waarde. Twee secties met dezelfde achtergrond krijgen samen één keer ruimte, de stylesheet regelt dat. Een blok zit nooit tegen een gekleurd vlak aan. Blokken naast elkaar zijn even hoog.
- **Vorm:** ronde hoeken (12, 20, 32 px, knoppen als pil). Geen zigzag, geen lijnen dwars door inhoud.
- **Interactief:** gebruik slepen, tabs, uitklappen en klikken waar het helpt. Accordeon voor vragen, tabs voor keuzes, sleepslider voor foto's.
- **Foto's in sliders:** zonder bijschrift.
- **Sponsoren:** altijd met logo, altijd in twee bewegende rijen (`.marquee` met `.track`, de tweede met `.marquee--rev`). Sponsor zonder logo: `.logo--name`.
- **Bewegende banden** (`.track`, `.irow`): altijd eindeloos, nooit wit aan de randen. Zet alleen de originele items in de HTML; het script herhaalt ze tot het scherm vol is. Geen handmatige kopieën.
- **Instagram:** fotoband met twee rijen en een kaart in het midden.
- **Watermerk:** logo licht op de achtergrond (`.mark`), altijd helemaal binnen het vlak. Nooit afgesneden.
- **Privacy:** Google Maps en YouTube laden pas na een klik. Enige uitzondering: de achtergrondvideo in de homepage-hero (`data-yt`, youtube-nocookie, gedempt, alleen desktop), op verzoek van Mark.
- **Menu:** één bron in `tools/nav.py` (Over ons en Wedstrijd met submenu, zoals op indoorsgw.nl). Nooit het menu per pagina met de hand aanpassen. Nieuwe pagina: zet hem in `PAGES` en draai `python3 tools/nav.py`.
- **Elke pagina één sterk interactief element:** verhaal met jaartal (over ons), parcours-tour (hindernissen), beeldvullende bioscoop (virtual tour), contactformulier met onderwerp (contact), verblijfplanner (stalling), sponsorwand met zoeken (sponsoren). Rustig eromheen.
- **Fase:** `body[data-phase]` is `voor`, `live` of `na`. Gebruik `.only-voor`, `.only-live`, `.only-na`. Data van het evenement staan bovenaan `indoorsgw.js`.

## Tekstregels

- Nederlands, je-vorm, menselijk en kort. Schrijf zoals een ruiter praat.
- Gebruik de taal van de sport: combinatie, proef, parcours, hindernis, klasse BB tot en met Z, vraagprogramma, startlijst, opsprong, afsprong.
- **Nooit streepjes (– of —) of middenpuntjes (·) als scheidingsteken.** Gebruik een punt, komma of dubbele punt.
- Knoppen zeggen precies wat er gebeurt: "Inschrijven voor de wedstrijd", "Aanmelden voor een training". Geen pijltje in de tekst.
- **Verzin geen feiten.** Haal ze uit `content/teksten.md`. Twijfel je, zet het als open vraag in `docs/feedback-log.md` en vraag het na.

## Bekende feiten

- Data 2026: maandag 28 (trainingsdag), dinsdag 29 (dressuur en springen, plus trainingen), woensdag 30 december (crossdag).
- Locatie: Manege Het Zwarte Water, De Mortel. Stalling en overnachten via info@hetzwartewater.nl.
- Training: €30 per uur per combinatie. Kosteloos annuleren tot 15 december.
- Inschrijven wedstrijd via Mijn KNHS (W183853). Sinds 1999, door vrijwilligers.
- Mail: secretariaat@indoorsgw.nl voor startlijsten, info@indoorsgw.nl voor de rest.

## Werkwijze

- **Preview:** `python3 tools/preview.py ontwerp/<pagina>.html` maakt `ontwerp/<pagina>-preview.html` met CSS, JS en verkleinde foto's erin. De ingebouwde browser opent alleen bestanden tot ongeveer 500 KB. Is de preview groter, verklein dan de foto's in het script.
- De ingebouwde browser weigert soms nieuwe bestandsnamen. Werkt een preview niet, kopieer hem dan tijdelijk naar `ontwerp/homepage-preview.html` om te testen, en bouw daarna de homepage-preview opnieuw.
- Previews staan in `.gitignore` en gaan niet naar GitHub.
- **Controle:** desktop 1440 breed en mobiel 375 breed, `document.documentElement.scrollWidth` gelijk aan de breedte, interacties echt uitproberen.
- **Deploy:** push naar `main` op GitHub, Vercel bouwt automatisch. Geen build-stap, het is een statische site.
- Bewaar een kopie voordat je iets groots aan de homepage verandert.

## Wat niet in deze repo hoort

De repo is openbaar. Dus geen wachtwoorden, tokens, deelnemersgegevens, mailteksten aan deelnemers of interne plannen. De map `bron/` met originele foto's blijft lokaal.
