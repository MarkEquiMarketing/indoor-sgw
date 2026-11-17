#!/usr/bin/env python3
"""Zet het menu (met submenu's), het mobiele menu en de footer op elke ontwerppagina.

Eén plek voor de menustructuur, zodat alle pagina's gelijk blijven.
Het actieve item krijgt vanzelf aria-current="page".

Gebruik:  python3 tools/nav.py   (alle pagina's uit PAGES hieronder)
Nieuwe pagina? Zet hem in PAGES, dan linkt het menu er vanzelf naartoe.
"""
import glob, os, re

LIVE = 'https://www.indoorsgw.nl/'
KNHS = 'https://www.mijnknhs.nl/Game/W183853?expandHeader=True'

# Pagina's die al als ontwerp bestaan. De rest linkt naar de huidige site.
PAGES = {
    'home': 'homepage.html',
    'over': 'over-ons.html',
    'hindernissen': 'hindernissen.html',
    'tour': 'virtual-tour.html',
    'contact': 'contact.html',
    'stalling': 'stalling.html',
    'sponsoren': 'sponsoren.html',
    'wedstrijd': 'wedstrijd.html',
    'vraagprogramma': 'vraagprogramma.html',
    'startlijsten': 'startlijsten.html',
    'cross': 'crossparcours.html',
    'uitslagen': 'uitslagen.html',
    'trainingen': 'trainingen.html',
    '404': '404.html',
}
def url(key, live):
    return PAGES.get(key) or LIVE + live

# Menu zoals op indoorsgw.nl: twee groepen met submenu, daarna losse items.
MENU = [
    ('Over ons', 'sub-over', [
        ('over', 'Over ons', 'Sinds 1999, door vrijwilligers', 'over-ons/'),
        ('hindernissen', 'Hindernissen', 'Rij alvast een rondje over het parcours', 'hindernissen/'),
        ('tour', 'Virtual tour', "Video's van eerdere edities", 'virtual-tour/'),
    ]),
    ('Wedstrijd', 'sub-wedstrijd', [
        ('wedstrijd', 'De wedstrijd', 'Dressuur, springen en cross', 'wedstrijd/'),
        ('vraagprogramma', 'Vraagprogramma', 'Rubrieken en startgelden bij de KNHS', 'wedstrijd/vraagprogramma/'),
        ('startlijsten', 'Startlijsten', 'Zodra ze definitief zijn', 'wedstrijd/startlijsten/'),
        ('cross', 'Crossparcours', 'Lengtes, snelheden en de tekening', 'crossparcour/'),
        ('uitslagen', 'Uitslagen', 'Zodra ze definitief zijn', 'wedstrijd/uitslagen/'),
    ]),
    ('trainingen', 'Trainingen', 'trainingen/'),
    ('sponsoren', 'Sponsoren', 'sponsoren/'),
    ('stalling', 'Stalling', 'stalling/'),
    ('contact', 'Contact', 'contact/'),
]

CHEV = '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def cur(key, current):
    return ' aria-current="page"' if key == current else ''

def nav(current):
    top, sheet = [], []
    for item in MENU:
        if isinstance(item[2], list):
            label, sid, subs = item
            here = any(k == current for k, *_ in subs)
            lis = ''.join(f'<li><a href="{url(k, l)}"{cur(k, current)}>{t}<small>{d}</small></a></li>' for k, t, d, l in subs)
            top.append(f'        <li class="has-sub"><button class="menu__toggle{" is-current" if here else ""}" type="button" aria-expanded="false" aria-controls="{sid}">{label}{CHEV}</button>\n'
                       f'          <ul class="sub" id="{sid}">{lis}</ul></li>')
            slis = ''.join(f'<li><a href="{url(k, l)}"{cur(k, current)}>{t}</a></li>' for k, t, d, l in subs)
            sheet.append(f'    <li><details{" open" if here else ""}><summary>{label}</summary><ul>{slis}</ul></details></li>')
        else:
            k, t, l = item
            top.append(f'        <li><a href="{url(k, l)}"{cur(k, current)}>{t}</a></li>')
            sheet.append(f'    <li><a href="{url(k, l)}"{cur(k, current)}>{t}</a></li>')
    top, sheet = '\n'.join(top), '\n'.join(sheet)
    return f'''<header class="nav">
  <div class="nav__bar">
    <a class="brand" href="{PAGES['home']}" aria-label="Indoor SGW, naar de homepage">
      <img class="logo-light" src="../assets/logo/logo-wit.png" alt="" width="500" height="573">
      <img class="logo-dark" src="../assets/logo/logo-blauw.png" alt="" width="500" height="573">
      <span>Indoor SGW</span>
    </a>
    <nav aria-label="Hoofdmenu">
      <ul class="menu">
{top}
      </ul>
    </nav>
    <a class="btn btn--gold btn--sm" href="{KNHS}" target="_blank" rel="noopener">Inschrijven</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="sheet" aria-label="Menu openen">
      <svg width="20" height="20" viewBox="0 0 20 20"><path d="M3 6h14M3 14h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
  </div>
</header>

<div class="sheet" id="sheet" aria-hidden="true">
  <div class="sheet__top">
    <img src="../assets/logo/logo-wit.png" alt="Indoor SGW" width="500" height="573" class="sheet__logo">
    <button class="menu-btn" type="button" aria-label="Menu sluiten" data-close>
      <svg width="20" height="20" viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
  </div>
  <ul>
    <li><a href="{PAGES['home']}"{cur('home', current)}>Home</a></li>
{sheet}
  </ul>
  <a class="btn btn--gold" href="{KNHS}" target="_blank" rel="noopener">Inschrijven voor de wedstrijd</a>
</div>

'''

def footer():
    li = lambda k, t, l: f'<li><a href="{url(k, l)}">{t}</a></li>'
    return f'''<footer class="footer">
  <div class="wrap">
    <div class="footer__top">
      <div class="footer__intro">
        <img src="../assets/logo/logo-wit.png" alt="Indoor SGW" width="500" height="573" class="footer__logo">
        <p>Dé Indoor SGW van Nederland. Dit jaar op 28, 29 en 30 december bij manege Het Zwarte Water in De Mortel.</p>
        <div class="socials">
          <a href="https://www.facebook.com/indoorsgw/" target="_blank" rel="noopener" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z"/></svg></a>
          <a href="https://www.instagram.com/indoorsgw/" target="_blank" rel="noopener" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
          <a href="mailto:info@indoorsgw.nl" aria-label="Mail ons"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></a>
        </div>
      </div>
      <div><h4>Wedstrijd</h4><ul>{li('wedstrijd', 'De wedstrijd', 'wedstrijd/')}{li('vraagprogramma', 'Vraagprogramma', 'wedstrijd/vraagprogramma/')}{li('startlijsten', 'Startlijsten', 'wedstrijd/startlijsten/')}{li('uitslagen', 'Uitslagen', 'wedstrijd/uitslagen/')}{li('cross', 'Crossparcours', 'crossparcour/')}</ul></div>
      <div><h4>Meedoen</h4><ul>{li('trainingen', 'Trainingen', 'trainingen/')}{li('hindernissen', 'Hindernissen', 'hindernissen/')}{li('tour', 'Virtual tour', 'virtual-tour/')}{li('stalling', 'Stalling', 'stalling/')}</ul></div>
      <div><h4>Organisatie</h4><ul>{li('over', 'Over ons', 'over-ons/')}{li('sponsoren', 'Sponsoren', 'sponsoren/')}{li('contact', 'Contact', 'contact/')}<li><a href="mailto:info@indoorsgw.nl">info@indoorsgw.nl</a></li></ul></div>
    </div>
    <div class="footer__bottom"><span>© 2026 Stichting Indoor SGW</span><span>Website door EquiMarketing</span></div>
  </div>
  <div class="wordmark" aria-hidden="true">Indoor SGW</div>
</footer>'''

def mbar():
    return f'''<div class="mbar" aria-label="Snel inschrijven">
  <div class="mbar__txt"><small>28, 29 en 30 december</small><strong>Indoor SGW 2026</strong></div>
  <a class="btn btn--gold only-voor" href="{url('trainingen', 'trainingen/')}#aanmelden" aria-label="Aanmelden voor een training">Training</a>
  <a class="btn btn--glass only-voor" href="{KNHS}" target="_blank" rel="noopener" aria-label="Inschrijven voor de wedstrijd bij de KNHS">Wedstrijd</a>
  <a class="btn btn--gold only-live" href="{url('startlijsten', 'wedstrijd/startlijsten/')}">Startlijsten</a>
  <a class="btn btn--gold only-na" href="{url('uitslagen', 'wedstrijd/uitslagen/')}">Uitslagen</a>
</div>'''

def main():
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ontwerp')
    keys = {v: k for k, v in PAGES.items()}
    for f in sorted(glob.glob(os.path.join(root, '*.html'))):
        name = os.path.basename(f)
        if name not in keys:          # varianten en concepten blijven zoals ze waren
            continue
        h = open(f, encoding='utf8').read()
        if '<header class="nav">' not in h:
            continue
        h = re.sub(r'<header class="nav">.*?(?=<main id="inhoud">)', lambda m: nav(keys.get(name, '')), h, flags=re.S)
        h = re.sub(r'<footer class="footer">.*?</footer>', lambda m: footer(), h, flags=re.S)
        h = re.sub(r'<div class="mbar".*?</div>\n</div>|<div class="mbar".*?\n</div>', lambda m: mbar(), h, count=1, flags=re.S)
        open(f, 'w', encoding='utf8').write(h)
        print('menu bijgewerkt:', name)

if __name__ == '__main__':
    main()
