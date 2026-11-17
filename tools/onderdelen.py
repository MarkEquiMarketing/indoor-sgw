"""Zet het overzicht 'Alle onderdelen' in ontwerp/stijlgids.html.

Leest assets/css/indoorsgw.css per hoofdstuk, zoekt elk onderdeel (blok, met zijn
__delen en --varianten) en kijkt op welke pagina's het gebruikt wordt.
Draai na elke wijziging aan de stylesheet:  python3 tools/onderdelen.py
"""
import glob, os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CSS = os.path.join(ROOT, 'assets', 'css', 'indoorsgw.css')
SG = os.path.join(ROOT, 'ontwerp', 'stijlgids.html')
SKIP = ('varianten', 'concept', 'stijlgids', 'homepage-')
STATES = {'menu-open', 'open', 'scrolled', 'on', 'done', 'hop'}  # toestanden, gezet door het script
HELPERS = {'is', 'has', 'only', 'sr', 'span', 'skip', 'reveal', 'sprite', 'wrap'}

def main():
    css = re.sub(r'/\*(?![^*]*\d+  [A-Z]).*?\*/', '', open(CSS, encoding='utf8').read(), flags=re.S)
    css = re.sub(r'url\([^)]*\)', '', css)
    chapters = re.split(r'/\*\s*(\d+)\s+([A-Z ,]+?)\s*-+\s*\*/', css)
    blocks = {}                      # blok -> [hoofdstuk, set(varianten), set(delen)]
    for i in range(1, len(chapters) - 2, 3):
        name = chapters[i + 1].strip().capitalize()
        body = chapters[i + 2]
        if name.startswith('Responsive') or name.startswith('Tokens'):
            continue
        for sel in re.findall(r'([^{}]+)\{', body):
            for c in re.findall(r'\.([a-z][\w-]*)', sel):
                block = re.split(r'__|--', c)[0]
                if block in STATES or block.split('-')[0] in HELPERS or block.startswith('mark-'):
                    continue
                b = blocks.setdefault(block, [name, set(), set()])
                if '--' in c: b[1].add(c.split('--', 1)[1])
                if '__' in c: b[2].add(c.split('__', 1)[1].split('--')[0])
    pages = {}
    for f in sorted(glob.glob(os.path.join(ROOT, 'ontwerp', '*.html'))):
        n = os.path.basename(f)
        if n.startswith(SKIP) or n.endswith('-preview.html'):
            continue
        classes = set(' '.join(re.findall(r'class="([^"]+)"', open(f, encoding='utf8').read())).split())
        pages[n] = {re.split(r'__|--', c)[0] for c in classes}
    order = []
    for b, (ch, var, parts) in blocks.items():
        if (ch, b) not in order:
            order.append((ch, b))
    rows, last = [], None
    for ch, b in sorted(order, key=lambda x: (list(dict.fromkeys(v[0] for v in blocks.values())).index(x[0]), x[1])):
        _, var, parts = blocks[b]
        where = [p for p, s in pages.items() if b in s]
        if len(where) >= len(pages) - 1:
            used = 'elke pagina'
        elif where:
            used = ', '.join(f'<a href="{p}">{p[:-5]}</a>' for p in where)
        else:
            used = '<span class="sg-muted">alleen in script of stijlgids</span>'
        extra = ' '.join([f'<code>__{x}</code>' for x in sorted(parts)] + [f'<code>--{x}</code>' for x in sorted(var)])
        if ch != last:
            rows.append(f'<tr class="sg-chrow"><th colspan="3">{ch}</th></tr>')
            last = ch
        rows.append(f'<tr><td><code>.{b}</code></td><td>{extra}</td><td>{used}</td></tr>')
    table = ('<div class="sg-tablewrap"><table class="sg-table"><thead><tr><th>Onderdeel</th><th>Delen en varianten</th><th>Gebruikt op</th></tr></thead><tbody>\n'
             + '\n'.join(rows) + '\n</tbody></table></div>')
    sg = open(SG, encoding='utf8').read()
    sg = re.sub(r'(<!-- onderdelen:start -->).*?(<!-- onderdelen:eind -->)', lambda m: m.group(1) + '\n' + table + '\n' + m.group(2), sg, flags=re.S)
    open(SG, 'w', encoding='utf8').write(sg)
    print(f'{len(blocks)} onderdelen in de stijlgids gezet')

if __name__ == '__main__':
    main()
