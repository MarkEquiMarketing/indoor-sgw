/* ==========================================================================
   Indoor SGW  site-script v1.0
   Elk onderdeel kijkt eerst of het element op de pagina staat. Zo kan dit
   ene bestand op elke pagina geladen worden.
   ========================================================================== */
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Data van het evenement. Elk jaar hier aanpassen. */
  const EVENT = {
    start: new Date('2026-12-28T08:00:00+01:00'),
    end: new Date('2026-12-31T00:00:00+01:00'),
    days: ['Trainingsdag', 'Dressuur en springen', 'Crossdag'],
    next: 'December 2027'
  };

  /* Fase van de site: voor, live of na. ?fase=live forceert een fase. */
  const autoPhase = () => Date.now() < EVENT.start ? 'voor' : Date.now() < EVENT.end ? 'live' : 'na';
  const setPhase = phase => {
    document.body.dataset.phase = phase;
    const label = $('#count-label'), count = $('#count');
    if (label && count) {
      if (phase === 'voor') {
        const d = Math.max(1, Math.ceil((EVENT.start - Date.now()) / 864e5));
        label.textContent = 'Eerste training'; count.textContent = d > 1 ? `Over ${d} dagen` : 'Morgen';
      } else if (phase === 'live') {
        const i = Math.min(2, Math.max(0, Math.floor((Date.now() - EVENT.start) / 864e5)));
        label.textContent = 'Vandaag'; count.textContent = EVENT.days[i];
      } else {
        label.textContent = 'Volgende editie'; count.textContent = EVENT.next;
      }
    }
    $$('.demo button').forEach(b => b.setAttribute('aria-pressed', b.dataset.phase === phase));
  };
  setPhase(new URLSearchParams(location.search).get('fase') || autoPhase());
  $$('.demo button').forEach(b => b.addEventListener('click', () => setPhase(b.dataset.phase)));

  /* Navigatie wordt wit zodra je scrolt. Mobiele balk verschijnt na de hero. */
  const top = $('.hero, .page-hero'), finalCta = $('.cta');
  const onScroll = () => {
    document.body.classList.toggle('scrolled', scrollY > 40);
    if (!top) return;
    const pastTop = scrollY > top.offsetHeight - 200;
    const r = finalCta?.getBoundingClientRect();
    const atCta = r ? r.top < innerHeight && r.bottom > 0 : false;
    document.body.classList.toggle('show-mbar', pastTop && !atCta);
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* Mobiel menu */
  const sheet = $('#sheet'), openBtn = $('.nav .menu-btn');
  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    sheet?.setAttribute('aria-hidden', !open); openBtn?.setAttribute('aria-expanded', open);
  };
  if (sheet && openBtn) {
    openBtn.addEventListener('click', () => setMenu(true));
    $('[data-close]', sheet)?.addEventListener('click', () => { setMenu(false); openBtn.focus(); });
    $$('a', sheet).forEach(a => a.addEventListener('click', () => setMenu(false)));
  }

  /* Achtergrondvideo in de hero: alleen op grotere schermen en zonder 'minder beweging' */
  const vid = $('.hero__video');
  if (vid && innerWidth > 760 && !calm) {
    vid.addEventListener('playing', () => vid.classList.add('on'), {once:true});
    vid.src = vid.dataset.src; vid.play().catch(() => {});
  }

  /* Video in een modal, laadt pas na klikken (geen YouTube-cookies vooraf) */
  const modal = $('.modal');
  const closeModal = () => { modal.classList.remove('open'); $('iframe', modal)?.remove(); $('[data-video]')?.focus(); };
  if (modal) {
    $$('[data-video]').forEach(opener => opener.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${opener.dataset.video || 'KNsBjiQE_gk'}?autoplay=1&rel=0`;
      f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.title = 'Video Indoor SGW';
      $('.modal__box', modal).appendChild(f); modal.classList.add('open'); $('.modal__close', modal).focus();
    }));
    $('.modal__close', modal).addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (modal?.classList.contains('open')) closeModal();
    else if (document.body.classList.contains('menu-open')) setMenu(false);
  });

  /* Kaart laadt pas na klikken, zo gaat er niets naar Google zonder dat je dat wilt */
  $$('[data-map]').forEach(btn => btn.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=Manege+Het+Zwarte+Water+De+Mortel&output=embed';
    f.title = 'Kaart van Manege Het Zwarte Water'; f.loading = 'lazy';
    btn.closest('.map').replaceChildren(f);
  }));

  /* Sleepslider: pijlen, slepen met de muis, swipen en voortgangsbalk */
  $$('.slider').forEach(sl => {
    const box = sl.closest('section') || document;
    const bar = $('.slider__bar i', box), btns = $$('[data-slide]', box);
    const update = () => {
      const max = sl.scrollWidth - sl.clientWidth, p = max ? sl.scrollLeft / max : 0;
      if (bar) bar.style.width = (25 + 75 * p) + '%';
      if (btns.length === 2) { btns[0].disabled = p < .01; btns[1].disabled = p > .99; }
    };
    sl.addEventListener('scroll', update, {passive:true}); addEventListener('resize', update); update();
    btns.forEach(b => b.addEventListener('click', () => sl.scrollBy({left: b.dataset.slide * (sl.firstElementChild.offsetWidth + 20), behavior:'smooth'})));
    let down = false, x0 = 0, s0 = 0;
    sl.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; s0 = sl.scrollLeft; sl.classList.add('is-drag'); });
    addEventListener('pointermove', e => { if (down) sl.scrollLeft = s0 - (e.clientX - x0); });
    addEventListener('pointerup', () => { if (down) { down = false; sl.classList.remove('is-drag'); } });
  });

  /* Logobanden en fotobanden: eindeloos, zonder witte randen.
     De originele items worden herhaald tot één set breder is dan de band,
     daarna komt er één kopie achter. De animatie schuift precies één set op. */
  const SPEED = { track: 40, irow: 45 };   // pixels per seconde
  const copy = c => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.tabIndex = -1; return k; };
  const bands = $$('.track, .irow').map(row => ({ row, items: [...row.children] }));
  const fillBand = ({ row, items }) => {
    const box = row.parentElement.getBoundingClientRect().width || innerWidth;
    row.replaceChildren(...items);
    let guard = 0;
    while (row.scrollWidth < box && guard++ < 20) items.forEach(c => row.appendChild(copy(c)));
    const set = row.scrollWidth;                     // één set, inclusief padding-right = gap
    [...row.children].forEach(c => row.appendChild(copy(c)));
    row.style.animationDuration = (set / (row.classList.contains('irow') ? SPEED.irow : SPEED.track)) + 's';
  };
  const fillAll = () => bands.forEach(fillBand);
  fillAll();
  let lastW = innerWidth;
  addEventListener('resize', () => { if (Math.abs(innerWidth - lastW) > 40) { lastW = innerWidth; fillAll(); } });
  addEventListener('load', fillAll, { once: true });   // logo's en foto's hebben dan hun echte breedte

  /* Tabs: <div class="tabs" role="tablist"><button role="tab" aria-controls="id">,
     panelen met role="tabpanel" en id. Pijltjestoetsen werken ook. */
  $$('[role=tablist]').forEach(list => {
    const tabs = $$('[role=tab]', list);
    const select = tab => tabs.forEach(t => {
      const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls')); if (panel) panel.hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
        const n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus();
      });
    });
    select(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  });
})();
