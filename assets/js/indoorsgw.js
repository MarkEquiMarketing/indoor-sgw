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
  const top = $('.hero, .page-hero, .tour, .theater'), finalCta = $('.cta');
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

  /* Submenu: klik opent en sluit, klik ernaast of Escape sluit. Hover regelt de CSS. */
  const closeSubs = except => $$('.has-sub.open').forEach(li => {
    if (li === except) return;
    li.classList.remove('open'); $('.menu__toggle', li).setAttribute('aria-expanded', 'false');
  });
  $$('.has-sub').forEach(li => {
    const btn = $('.menu__toggle', li);
    btn.addEventListener('click', () => {
      const open = !li.classList.contains('open');
      closeSubs(li); li.classList.toggle('open', open); btn.setAttribute('aria-expanded', open);
    });
    li.addEventListener('mouseleave', () => { if (matchMedia('(hover:hover)').matches) closeSubs(); });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.has-sub')) closeSubs(); });

  /* Achtergrondvideo in de hero: alleen op grotere schermen en zonder 'minder beweging'.
     data-yt="id" laadt YouTube gedempt en zonder knoppen, data-src laadt een eigen mp4. */
  const vid = $('.hero__video');
  if (vid && innerWidth > 760 && !calm) {
    if (vid.dataset.yt) {
      const id = vid.dataset.yt, f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disablekb=1&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3`;
      f.allow = 'autoplay; encrypted-media'; f.tabIndex = -1; f.title = 'Achtergrondvideo';
      f.addEventListener('load', () => setTimeout(() => vid.classList.add('on'), 1800), {once:true});
      vid.appendChild(f);
    } else if (vid.tagName === 'VIDEO' && vid.dataset.src) {
      vid.addEventListener('playing', () => vid.classList.add('on'), {once:true});
      vid.src = vid.dataset.src; vid.play().catch(() => {});
    }
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
    else closeSubs();
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

  /* Verhaal (over ons): het jaartal telt mee met het scrollen, de zinnen lichten op. */
  const story = $('.story');
  if (story) {
    const year = $('.story__year strong', story), bar = $('.story__year i', story), lines = $$('.story__lines p', story);
    const from = +story.dataset.from, to = +story.dataset.to;
    const tick = () => {
      // 1999 bij de eerste zin, 2026 bij de laatste: het jaartal loopt mee met het verhaal
      const vh = innerHeight, a = lines[0].getBoundingClientRect().top, z = lines[lines.length - 1].getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (vh * .66 - a) / Math.max(1, z - a)));
      year.textContent = Math.round(from + (to - from) * p);
      bar.style.width = (p * 100) + '%';
      lines.forEach(l => l.classList.toggle('on', calm || l.getBoundingClientRect().top < vh * .66));
    };
    let ticking = false;
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { tick(); ticking = false; }); } }, {passive:true});
    tick();
  }

  /* Parcours-tour (hindernissen): van hindernis naar hindernis springen.
     De laatste foto is de finish. Pijltjestoetsen, swipen en de lijn werken ook. */
  const tour = $('.tour');
  if (tour) {
    const shots = $$('.tour__shot', tour), dots = $$('.course button', tour), fences = $$('[data-fence]');
    const N = dots.length;                        // aantal hindernissen; shots[N] is de finish
    const num = $('[data-tour-num]', tour), name = $('[data-tour-name]', tour);
    const rider = $('.course__rider', tour), done = $('.course__done', tour), playBtn = $('[data-tour-play]', tour);
    const prev = $('[data-tour="-1"]', tour), next = $('[data-tour="1"]', tour);
    let i = 0, busy = false, timer = null;
    const place = () => {
      const d = dots[Math.min(i, N - 1)], x = d.offsetLeft + d.offsetWidth / 2;
      rider.style.left = x + 'px'; done.style.width = Math.max(0, x - done.offsetLeft) + 'px';
      dots.forEach((b, k) => b.classList.toggle('done', k <= i));
    };
    const render = () => {
      tour.classList.toggle('is-finish', i === N);
      if (i < N) { num.textContent = `Hindernis ${i + 1} van ${N}`; name.textContent = shots[i].dataset.name; }
      dots.forEach((b, k) => b.setAttribute('aria-current', k === i));
      fences.forEach((b, k) => b.setAttribute('aria-current', k === i));
      prev.disabled = i === 0; next.disabled = i === N;
      place();
    };
    const stop = () => { clearInterval(timer); timer = null; if (playBtn) { playBtn.textContent = 'Rij het hele rondje'; playBtn.setAttribute('aria-pressed', 'false'); } };
    const go = (to, byUser = true) => {
      if (busy || to === i || to < 0 || to > N) return;
      if (byUser) stop();
      const a = shots[i], b = shots[to], fwd = to > i;
      i = to; render();
      if (calm) { a.classList.remove('is-on'); b.classList.add('is-on'); return; }
      busy = true;
      a.classList.add(fwd ? 'is-leaving' : 'is-back-out');
      b.classList.add('is-on', fwd ? 'is-entering' : 'is-back-in');
      if (fwd) { rider.classList.remove('hop'); void rider.offsetWidth; rider.classList.add('hop'); }
      setTimeout(() => { a.classList.remove('is-on', 'is-leaving', 'is-back-out'); b.classList.remove('is-entering', 'is-back-in'); busy = false; }, fwd ? 1100 : 700);
    };
    prev.addEventListener('click', () => go(i - 1));
    next.addEventListener('click', () => go(i + 1));
    dots.forEach((b, k) => b.addEventListener('click', () => go(k)));
    $('[data-tour-restart]', tour)?.addEventListener('click', () => go(0));
    fences.forEach((b, k) => b.addEventListener('click', () => {
      tour.scrollIntoView({behavior: calm ? 'auto' : 'smooth'}); setTimeout(() => go(k), calm ? 0 : 450);
    }));
    playBtn?.addEventListener('click', () => {
      if (timer) return stop();
      if (i === N) go(0, false);
      playBtn.textContent = 'Stop het rondje'; playBtn.setAttribute('aria-pressed', 'true');
      timer = setInterval(() => { if (i >= N) stop(); else go(i + 1, false); }, 2600);
      setTimeout(() => { if (timer) go(i + 1, false); }, 800);
    });
    addEventListener('keydown', e => {
      if (!['ArrowRight', 'ArrowLeft'].includes(e.key) || e.target.closest('input, textarea, [role=tablist]')) return;
      const r = tour.getBoundingClientRect();
      if (r.top < innerHeight / 2 && r.bottom > innerHeight / 2) { e.preventDefault(); go(i + (e.key === 'ArrowRight' ? 1 : -1)); }
    });
    let sx = null;
    tour.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && !e.target.closest('button, a')) sx = e.clientX; });
    tour.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 50) go(i + (e.clientX < sx ? 1 : -1)); sx = null; });
    tour.addEventListener('pointercancel', () => { sx = null; });
    addEventListener('resize', place);
    render();
  }

  /* Bioscoop (virtual tour): beeldvullend scherm, wisselen via de balk of met de pijltjes.
     YouTube laadt pas na klikken. Speelt er al een video, dan start de nieuwe meteen. */
  const theater = $('.theater');
  if (theater) {
    const clips = $$('.clip', theater), stage = $('.theater__stage', theater), poster = $('.screen__poster', theater);
    const img = $('img', poster), title = $('[data-screen-title]', theater), dur = $('[data-screen-dur]', theater), yt = $('[data-screen-yt]', theater);
    let cur = Math.max(0, clips.findIndex(c => c.getAttribute('aria-pressed') === 'true'));
    const play = () => {
      const c = clips[cur], f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${c.dataset.id}?autoplay=1&rel=0`;
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true; f.title = c.dataset.title;
      poster.hidden = true; stage.appendChild(f);
    };
    const select = k => {
      const c = clips[k], playing = !!$('iframe', stage);
      cur = k; clips.forEach(x => x.setAttribute('aria-pressed', x === c));
      $('iframe', stage)?.remove();
      if (!playing) poster.hidden = false;
      theater.classList.add('is-switch');
      setTimeout(() => {
        img.src = c.dataset.poster; title.textContent = c.dataset.title; dur.textContent = c.dataset.duration;
        yt.href = 'https://www.youtube.com/watch?v=' + c.dataset.id;
        theater.classList.remove('is-switch');
        if (playing) play();
      }, playing || calm ? 0 : 250);
      c.scrollIntoView({block: 'nearest', inline: 'nearest'});
    };
    poster.addEventListener('click', e => { if (!e.target.closest('a')) play(); });
    clips.forEach((c, k) => c.addEventListener('click', () => { if (k !== cur) select(k); else if (!$('iframe', stage)) play(); }));
    addEventListener('keydown', e => {
      if (!['ArrowRight', 'ArrowLeft'].includes(e.key) || e.target.closest('input, textarea')) return;
      const r = theater.getBoundingClientRect();
      if (r.top < innerHeight / 2 && r.bottom > innerHeight / 2) { e.preventDefault(); select((cur + (e.key === 'ArrowRight' ? 1 : -1) + clips.length) % clips.length); }
    });
  }

  /* Kopieerknop: data-copy="tekst" */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const label = b.textContent;
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Gekopieerd'; }
    catch { b.textContent = b.dataset.copy; }
    setTimeout(() => { b.textContent = label; }, 2000);
  }));

  /* Verblijfplanner (stalling): dagen, paarden en wensen worden een mail aan Het Zwarte Water */
  const planner = $('[data-planner]');
  if (planner) {
    const DAYS = {27: 'zondag 27', 28: 'maandag 28', 29: 'dinsdag 29', 30: 'woensdag 30', 31: 'donderdag 31'};
    const arrive = $$('[data-arrive]', planner), leave = $$('[data-leave]', planner), needs = $$('[data-need]', planner);
    let a = 28, l = 30, horses = 1;
    const update = () => {
      arrive.forEach(b => b.setAttribute('aria-pressed', +b.dataset.arrive === a));
      leave.forEach(b => { b.setAttribute('aria-pressed', +b.dataset.leave === l); b.disabled = +b.dataset.leave <= a; });
      const nights = l - a, has = k => needs.find(n => n.dataset.need === k).checked;
      const p = horses === 1 ? 'paard' : 'paarden';
      $('[data-nights]', planner).textContent = nights;
      $('[data-nights]', planner).nextElementSibling.textContent = nights === 1 ? 'nacht' : 'nachten';
      $('[data-count]', planner).textContent = horses;
      $('[data-count]', planner).nextElementSibling.textContent = p;
      $('[data-horses]', planner).textContent = horses;
      const lines = [`Ik kom naar de Indoor SGW van ${DAYS[a]} tot ${DAYS[l]} december (${nights} ${nights === 1 ? 'nacht' : 'nachten'}).`];
      if (has('stal')) lines.push(`Ik zoek stalling voor ${horses} ${p}.`);
      if (has('slapen')) lines.push('Ik wil zelf ook overnachten.');
      if (has('truck')) lines.push('Ik slaap in mijn vrachtwagen, met eigen stroom.');
      const text = `Hallo,\n\n${lines.join('\n')}\n\nKunnen jullie dit voor me regelen?\n\nGroet,`;
      $('[data-mailtext]', planner).textContent = text;
      $('[data-mailto]', planner).href = 'mailto:info@hetzwartewater.nl?subject=' + encodeURIComponent('Stalling Indoor SGW') + '&body=' + encodeURIComponent(text);
    };
    arrive.forEach(b => b.addEventListener('click', () => { a = +b.dataset.arrive; if (l <= a) l = a + 1; update(); }));
    leave.forEach(b => b.addEventListener('click', () => { l = +b.dataset.leave; update(); }));
    $$('[data-step]', planner).forEach(b => b.addEventListener('click', () => { horses = Math.min(12, Math.max(1, horses + +b.dataset.step)); update(); }));
    needs.forEach(n => n.addEventListener('change', update));
    update();
  }

  /* Contact: tabs per onderwerp. Elke tab toont het juiste paneel en de juiste velden.
     contact.html#sponsoring opent meteen de goede tab.
     Verzenden is nog niet gekoppeld (open vraag in het feedbacklog); nu tonen we de bevestiging. */
  const desk = $('[data-desk]');
  if (desk) {
    const radios = $$('input[name=onderwerp]', desk), form = $('[data-contact]', desk), done = $('[data-contact-done]', desk);
    const set = (v, animate) => {
      radios.forEach(r => { r.checked = r.value === v; });
      $$('[data-topic]', desk).forEach(el => { el.hidden = el.dataset.topic !== v; });
      $$('[data-show]', desk).forEach(el => {
        const on = el.dataset.show.split(' ').includes(v);
        el.hidden = !on;
        if (el !== form) $$('input,select,textarea', el).forEach(i => { i.disabled = !on; });
      });
      done.hidden = true;
      if (animate) { desk.classList.remove('is-swapping'); void desk.offsetWidth; desk.classList.add('is-swapping'); }
    };
    radios.forEach(r => r.addEventListener('change', () => { set(r.value, true); history.replaceState(null, '', '#' + r.value); }));
    form.addEventListener('submit', e => {
      e.preventDefault();
      $('[data-done-who]', done).textContent = radios.find(r => r.checked).dataset.who;
      $('[data-done-mail]', done).textContent = form.elements.email.value;
      form.hidden = true; done.hidden = false; done.focus();
    });
    $('[data-contact-again]', done).addEventListener('click', () => {
      const v = radios.find(r => r.checked).value; form.reset(); set(v, true);
    });
    const start = location.hash.slice(1);
    if (radios.some(r => r.value === start)) { set(start); $('#vraag').scrollIntoView(); } else set(radios[0].value);
  }

  /* Trainingen: reken uit wat het kost. € 30 per uur per combinatie. */
  const calc = $('[data-calc]');
  if (calc) {
    const PRICE = 30, days = $$('[data-day]', calc);
    let combi = 1, hours = 1;
    const update = () => {
      const on = days.filter(d => d.getAttribute('aria-pressed') === 'true');
      const total = on.length * combi * hours * PRICE;
      $('[data-total]', calc).textContent = '€ ' + total;
      $('[data-combi]', calc).textContent = combi;
      $('[data-hours]', calc).textContent = hours;
      const names = on.map(d => d.dataset.name);
      const p = combi === 1 ? 'paard of pony' : `${combi} paarden of pony's`;
      $('[data-calc-text]', calc).textContent =
        `${names.join(' en ')}\n${p}, ${hours} uur per dag\n€ ${PRICE} per uur per combinatie`;
    };
    days.forEach(d => d.addEventListener('click', () => {
      const pressed = d.getAttribute('aria-pressed') === 'true';
      if (pressed && days.filter(x => x.getAttribute('aria-pressed') === 'true').length === 1) return; // minstens één dag
      d.setAttribute('aria-pressed', !pressed); update();
    }));
    $$('[data-combi-step]', calc).forEach(b => b.addEventListener('click', () => { combi = Math.min(12, Math.max(1, combi + +b.dataset.combiStep)); update(); }));
    $$('[data-hours-step]', calc).forEach(b => b.addEventListener('click', () => { hours = Math.min(6, Math.max(1, hours + +b.dataset.hoursStep)); update(); }));
    update();
  }

  /* Keuze met grote cijfers (klasse kiezen): radio's in [data-pick], panelen met data-pick-panel */
  $$('[data-pick]').forEach(p => {
    const radios = $$('input[type=radio]', p);
    const set = animate => {
      const v = radios.find(r => r.checked)?.value;
      $$('[data-pick-panel]', p).forEach(el => { el.hidden = el.dataset.pickPanel !== v; });
      if (animate) { p.classList.remove('is-swapping'); void p.offsetWidth; p.classList.add('is-swapping'); }
    };
    radios.forEach(r => r.addEventListener('change', () => set(true)));
    set();
  });

  /* Pdf-lezer: startlijsten, uitslagen en tekeningen bekijken op de site, met zoeken op naam.
     De pdf's staan in de mediabibliotheek van indoorsgw.nl. PDF_BASE is het pad waarop de site ze
     laadt (op Vercel via een doorverwijzing in vercel.json, op WordPress zelf /wp-content/uploads/).
     pdf.js laadt pas als er een lezer in beeld komt. */
  const PDF_BASE = location.hostname.endsWith('indoorsgw.nl') ? '/wp-content/uploads/' : '/pdf/';
  const PDF_LIVE = 'https://www.indoorsgw.nl/wp-content/uploads/';
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  let pdfjs;
  const loadPdfjs = () => pdfjs || (pdfjs = new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = PDFJS + 'pdf.min.js';
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; ok(window.pdfjsLib); };
    s.onerror = fail; document.head.appendChild(s);
  }));
  $$('[data-viewer]').forEach(v => {
    const docs = $$('.doc', v), pages = $('[data-v-pages]', v), title = $('[data-v-title]', v), meta = $('[data-v-meta]', v);
    const open = $('[data-v-open]', v), search = $('[data-v-search]', v), count = $('[data-v-count]', v), years = $$('[data-v-year]', v);
    const files = new Map(), texts = new Map();
    let current = null, zoom = 1, query = '', timer;
    const msg = (text, busy) => { const p = document.createElement('p'); p.className = 'viewer__msg'; p.innerHTML = (busy ? '<i></i>' : '') + text; pages.replaceChildren(p); };
    const getPdf = file => files.get(file) || files.set(file, loadPdfjs().then(lib => lib.getDocument(PDF_BASE + file).promise)).get(file);
    const getText = file => texts.get(file) || texts.set(file, getPdf(file).then(async pdf => {
      const out = [];
      for (let n = 1; n <= pdf.numPages; n++) out.push((await (await pdf.getPage(n)).getTextContent()).items.map(i => i.str).join(' ').toLowerCase());
      return out;
    })).get(file);
    const visible = () => docs.filter(d => !d.closest('[hidden]'));

    const show = async btn => {
      current = btn;
      docs.forEach(d => d.setAttribute('aria-pressed', d === btn));
      title.textContent = btn.dataset.title;
      meta.textContent = btn.dataset.meta || '';
      const img = btn.dataset.img;
      open.href = img || PDF_LIVE + btn.dataset.pdf;
      open.textContent = img ? 'Open afbeelding' : 'Download pdf';
      if (img) { const im = new Image(); im.src = img; im.alt = btn.dataset.title; pages.replaceChildren(im); return; }
      msg('Lijst laden', true);
      try {
        const pdf = await getPdf(btn.dataset.pdf);
        if (current !== btn) return;
        meta.textContent = [btn.dataset.meta, pdf.numPages === 1 ? '1 pagina' : `${pdf.numPages} pagina's`].filter(Boolean).join(', ');
        const width = Math.max(240, pages.clientWidth - (innerWidth < 640 ? 24 : 48)), dpr = Math.min(2, devicePixelRatio || 1);
        let firstHit = null;
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n);
          if (current !== btn) return;
          const base = page.getViewport({ scale: 1 }), css = width * zoom / base.width, vp = page.getViewport({ scale: css * dpr });
          const c = document.createElement('canvas');
          c.width = vp.width; c.height = vp.height; c.style.width = vp.width / dpr + 'px';
          const ctx = c.getContext('2d');
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
          if (query) {
            ctx.fillStyle = 'rgba(234,178,0,.38)';
            (await page.getTextContent()).items.forEach(it => {
              if (!it.str.toLowerCase().includes(query)) return;
              const [x1, y1, x2, y2] = vp.convertToViewportRectangle([it.transform[4], it.transform[5] - 2, it.transform[4] + it.width, it.transform[5] + it.height + 1]);
              ctx.fillRect(Math.min(x1, x2) - 2, Math.min(y1, y2), Math.abs(x2 - x1) + 4, Math.abs(y2 - y1));
              firstHit = firstHit || c;
            });
          }
          if (n === 1) pages.replaceChildren();
          pages.append(c);
        }
        pages.scrollTo({ top: firstHit ? firstHit.offsetTop - 16 : 0 });
      } catch (e) {
        if (current === btn) msg('Deze lijst kon niet laden. Probeer de knop rechtsboven.');
      }
    };

    const find = async () => {
      query = search.value.trim().toLowerCase();
      v.classList.toggle('is-searching', !!query);
      const list = visible().filter(d => d.dataset.pdf);
      docs.forEach(d => { d.classList.remove('is-miss'); const b = $('.doc__hits', d); if (b) b.hidden = true; });
      if (!query) { count.textContent = ''; if (current) show(current); return; }
      count.textContent = 'Zoeken';
      const q = query;
      const hits = await Promise.all(list.map(d => getText(d.dataset.pdf).then(t => t.reduce((s, p) => s + p.split(q).length - 1, 0)).catch(() => 0)));
      if (q !== query) return;
      list.forEach((d, i) => {
        d.classList.toggle('is-miss', !hits[i]);
        const b = $('.doc__hits', d); b.textContent = hits[i]; b.hidden = !hits[i];
      });
      const found = list.filter((d, i) => hits[i]);
      count.textContent = found.length ? `Gevonden in ${found.length} ${found.length === 1 ? 'lijst' : 'lijsten'}` : `Niet gevonden. Let op de spelling, of zoek op een deel van de naam.`;
      show(found.includes(current) ? current : found[0] || current);
    };
    if (search) {
      $('.doc__hits', docs[0]) || docs.forEach(d => d.insertAdjacentHTML('beforeend', '<b class="doc__hits" hidden></b>'));
      search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(find, 300); });
    }
    docs.forEach(d => d.addEventListener('click', () => show(d)));
    years.forEach(r => r.addEventListener('change', () => {
      $$('[data-year]', v).forEach(g => { g.hidden = g.dataset.year !== r.value; });
      const first = visible()[0];
      if (search && query) { current = first; find(); } else show(first);
    }));
    $$('[data-v-zoom]', v).forEach(b => b.addEventListener('click', () => {
      zoom = b.dataset.vZoom === '0' ? 1 : Math.min(2.5, Math.max(.6, zoom + +b.dataset.vZoom * .25));
      if (current && !current.dataset.img) show(current);
    }));
    if (years.length) $$('[data-year]', v).forEach(g => { g.hidden = g.dataset.year !== years.find(r => r.checked).value; });
    // Eerste lijst laden zodra de lezer in beeld komt
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); show(visible()[0]); } }, { rootMargin: '200px' });
    io.observe(v);
  });

  /* Sponsorwand: zoeken op naam */
  const wallSearch = $('[data-wall-search]');
  if (wallSearch) {
    const items = $$('[data-wall] li'), count = $('[data-wall-count]'), empty = $('[data-wall-empty]');
    wallSearch.addEventListener('input', () => {
      const q = wallSearch.value.trim().toLowerCase();
      let n = 0;
      items.forEach(li => { const show = !q || li.dataset.name.includes(q); li.hidden = !show; n += show; });
      count.textContent = n === 1 ? '1 sponsor' : `${n} sponsoren`;
      empty.hidden = n > 0;
    });
  }

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
