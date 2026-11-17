# Feedbacklog

Alle feedback op het ontwerp, met wat we ervan leren. Nieuwste bovenaan. Een les die altijd geldt, staat ook als regel in `CLAUDE.md`.

## Open vragen

- Welke sponsoren zijn echt stersponsor? (De indeling op de keuzepagina was een voorbeeld.)
- Wat is de Instagram-naam? Alle Instagram-knoppen wijzen nu naar instagram.com.
- Komt er een eigen hero-video (`assets/video/hero.mp4`, 10 tot 20 seconden, max 4 MB)?
- Geldt BB tot en met Z voor alle onderdelen?
- Is er op 29 december 's middags training naast de wedstrijd?
- Meer dan twintig of minimaal 25 hindernissen?
- Wat is "Bixietraining"? Bezoekers kennen het woord misschien niet. Korte uitleg toevoegen?

## 17 november 2026

**Bewegende banden**
- Feedback: de sponsorbanden en de Instagram-fotoband worden links en rechts vaak wit.
  - Oorzaak: twee keer de inhoud was op brede schermen niet genoeg, en de verschuiving klopte niet precies met de gap.
  - Les: `indoorsgw.js` herhaalt de inhoud tot één set breder is dan de band, zet er één kopie achter en schuift precies één set op. `padding-right` is gelijk aan de gap. Snelheid in pixels per seconde, dus elke band loopt even snel. Controleren op 375, 1440 en 2560 breed.

**Stylesheet en stijlgids**
- Vraag: maak een stylesheet op basis van de homepage, als basis voor alle pagina's. Verwerk alle feedback, zodat we geen fout twee keer maken.
- Gedaan: `assets/css/indoorsgw.css`, `assets/js/indoorsgw.js`, `ontwerp/stijlgids.html`, dit log en `CLAUDE.md`.

**Titels, hero en sponsoren**
- Feedback: alle titels moeten consistent zijn, op de juiste plek en even groot.
  - Les: één token `--h2` voor elke sectietitel. "Onze sponsoren" was kleiner en "Zien we je in december" groter, dat mag niet meer.
- Feedback: de hero-titel is te groot en loopt bijna tegen het menu aan.
  - Les: maximaal 92 px.
- Feedback: hero-tekst en knoppen in het midden uitlijnen.
  - Les: de hero is gecentreerd, met de infobalk onderaan.
- Feedback: sponsoren moeten in een bewegende band blijven, in twee rijen.
  - Les: nooit vervangen door een raster of uitklapper.
- Feedback: teksten moeten duidelijk zijn.
  - Les: alles nagelopen. "Elk jaar op 28, 29 en 30 december" werd "Dit jaar op ...", want de data verschillen per jaar.

**Watermerk**
- Feedback: het logo wordt vaak afgesneden.
  - Les: een watermerk staat altijd helemaal binnen het vlak, met `max-width` en zonder negatieve posities.

**Keuze uit varianten**
- Zo ziet dat eruit: sleepslider (B), zonder teksten onder de foto's.
- Sponsoren: uitklappen plus "Ook sponsor worden?" (F). Later aangepast: de logo's lopen weer als band.
- Instagram: fotoband (F), twee rijen tegen elkaar in met een kaart in het midden.

**Wens**
- Veel dingen op de site moeten interactief zijn: klikken, slepen, uitklappen, tabs.
  - Les: standaard zoeken naar een interactieve vorm. Voor vragen een accordeon, voor keuzes tabs, voor foto's een slider.

**Logo als branding**
- Wens: het Indoor SGW-logo hier en daar subtiel op de achtergrond, grotendeels transparant.

**Homepage v3 bijgestuurd**
- Feedback: de hero-titel was slecht leesbaar.
  - Les: een donkere verloop achter de tekst en een lichte tekstschaduw.
- Feedback: de teksten bij het programma waren slecht.
  - Les: gebruik de taal van de sport. Dus combinatie, proef, parcours, opsprong, klasse BB tot en met Z.
- Wens: een achtergrondfoto bij "Drie dagen in de hal".
- Wens: "Zien we je in december?" helemaal onderaan, en een Instagram-blok boven de footer.

**Concepten afgewezen**
- Feedback: drie creatieve concepten waren "allemaal niks". Concept C (poster) was veel te druk.
  - Les: geen experimenten met een ander gevoel. Wel de bestaande richting strakker en cleaner maken, "next level" maar straight.
- Feedback: het eerdere concept "Het parcours" (parcourslijn, genummerde hindernissen) is afgewezen.
- Feedback: het voelde als AI.
  - Les: geen standaardtrucjes zoals labels in hoofdletters, nummertjes, streepjes en middenpuntjes.

**Fouten in teksten die we eerder maakten**
- "Inschrijven tot 15 december" klopte niet. Het is: een training kosteloos annuleren tot 15 december.
- Een volle tribune, niveaus per hindernis en niveaulabels B, L, M en Z waren verzonnen. Die zijn weggehaald.
