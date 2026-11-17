#!/usr/bin/env python3
"""Maak een losse preview van een ontwerppagina.

De ingebouwde browser van Claude opent lokale bestanden als losse snapshot,
dus relatieve paden naar CSS, JS en foto's werken daar niet. Dit script zet
alles in één bestand: stylesheet, script en verkleinde foto's.

Gebruik:  python3 tools/preview.py ontwerp/homepage.html
Uitvoer:  ontwerp/homepage-preview.html  (staat in .gitignore)
"""
import base64, io, os, re, sys
from PIL import Image

MAX_PHOTO, MAX_LOGO, QUALITY = 260, 110, 35

def photo(path):
    im = Image.open(path)
    logo = '/sponsors/' in path or '/logo/' in path
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        if logo and '/sponsors/' in path:          # sponsorlogo's op wit
            bg = Image.new('RGB', im.size, 'white'); bg.paste(im, mask=im.split()[3]); im = bg
    im.thumbnail((MAX_LOGO * 2, MAX_LOGO) if logo else (MAX_PHOTO * 2, MAX_PHOTO * 2) if 'hal-overzicht' in path else (MAX_PHOTO, MAX_PHOTO))
    buf = io.BytesIO()
    if im.mode == 'RGBA':
        im.save(buf, 'PNG', optimize=True); mime = 'png'
    else:
        im.convert('RGB').save(buf, 'JPEG', quality=QUALITY, optimize=True); mime = 'jpeg'
    return f'data:image/{mime};base64,' + base64.b64encode(buf.getvalue()).decode()

def main(src):
    base = os.path.dirname(os.path.abspath(src))
    h = open(src, encoding='utf8').read()
    resolve = lambda p: os.path.normpath(os.path.join(base, p))
    h = re.sub(r'<link rel="stylesheet" href="([^"]+\.css)">',
               lambda m: '<style>\n' + open(resolve(m.group(1)), encoding='utf8').read() + '\n</style>', h)
    h = re.sub(r'<script src="([^"]+\.js)"( defer)?></script>',
               lambda m: '<script>\n' + open(resolve(m.group(1)), encoding='utf8').read() + '\n</script>', h)
    h = re.sub(r'(?<![-\w])src="([^"]+\.(?:jpe?g|png))"', lambda m: f'src="{photo(resolve(m.group(1)))}"', h)
    h = re.sub(r'\sposter="[^"]*"', '', h)            # video-poster niet nodig in de preview
    out = src[:-5] + '-preview.html'
    open(out, 'w', encoding='utf8').write(h)
    print(f'{out}  {len(h) // 1024} KB')

if __name__ == '__main__':
    for f in sys.argv[1:]:
        main(f)
