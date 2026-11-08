(() => {
  'use strict';

  const nav = document.querySelector('.nav');
  const menuButton = document.querySelector('.menu-toggle');
  const header = document.querySelector('.site-header');
  const navLinks = [...document.querySelectorAll('.nav a')];

  function closeMenu() {
    if (!nav || !menuButton) return;
    nav.classList.remove('is-open');
    menuButton.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Buka menu');
    document.body.classList.remove('menu-open');
  }

  if (nav && menuButton) {
    menuButton.addEventListener('click', () => {
      const opened = nav.classList.toggle('is-open');
      menuButton.classList.toggle('is-open', opened);
      menuButton.setAttribute('aria-expanded', String(opened));
      menuButton.setAttribute('aria-label', opened ? 'Tutup menu' : 'Buka menu');
      document.body.classList.toggle('menu-open', opened);
    });
    navLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 790) closeMenu();
    });
  }

  function updateHeader() {
    header?.classList.toggle('is-scrolled', window.scrollY > 14);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.project-card')];
  filters.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      filters.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      cards.forEach(card => {
        const categories = (card.dataset.categories || '').split(' ');
        const visible = category === 'all' || categories.includes(category);
        card.hidden = !visible;
      });
    });
  });

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  const toast = document.querySelector('#toast');
  let toastTimeout;
  function announce(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-shown');
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove('is-shown'), 2800);
  }
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const text = button.dataset.copy;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
        await navigator.clipboard.writeText(text);
        announce(`${text} berhasil disalin`);
      } catch {
        const selection = window.prompt('Salin username Telegram:', text);
        if (selection !== null) announce('Username siap digunakan');
      }
    });
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));


  } else {
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
  }


  // Section/page numbers stay sequential after inserting or removing a section.
  document.querySelectorAll('.section-kicker').forEach((kicker, index) => {
    const number = kicker.firstElementChild;
    if (number) number.textContent = String(index + 1).padStart(2, '0');
  });

  // Use one deterministic scroll position to highlight the current page/section.
  // The old observer skipped Playground and could leave multiple links highlighted.
  const indexedSections = navLinks.map(link => {
    const hash = link.getAttribute('href');
    return hash?.startsWith('#') ? document.querySelector(hash) : null;
  }).filter(Boolean);
  const contactSection = document.querySelector('#kontak');
  let navFrame = 0;
  function refreshCurrentSection() {
    navFrame = 0;
    const threshold = Math.min(320, window.innerHeight * .38);
    let current = '';
    for (const section of indexedSections) {
      if (section.getBoundingClientRect().top <= threshold) current = section.id;
    }
    // The short contact section cannot always reach the top of the viewport at page end.
    // Clear the previous section highlight as soon as contact is the active view.
    if (contactSection && contactSection.getBoundingClientRect().top <= Math.max(threshold, window.innerHeight * .72)) current = '';
    navLinks.forEach(link => {
      const active = current && link.getAttribute('href') === `#${current}`;
      link.classList.toggle('is-current', !!active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleCurrentSection() {
    if (navFrame) return;
    navFrame = window.requestAnimationFrame(refreshCurrentSection);
  }
  refreshCurrentSection();
  window.addEventListener('scroll', scheduleCurrentSection, { passive: true });
  window.addEventListener('resize', scheduleCurrentSection, { passive: true });

  // Interactive Motion System: cursor tracking is enabled only on fine pointer devices.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  // CONTINUOUS MOTION: on by default, with a visitor-controlled pause.
  // The system's Reduced Motion preference always takes precedence.
  const motionSwitch = document.querySelector('#motion-switch');
  const root = document.documentElement;
  let continuousMotionEnabled = true;
  try { continuousMotionEnabled = window.localStorage.getItem('jee-dev-continuous-motion') !== 'off'; }
  catch { /* Local storage may be disabled in private browsing. */ }

  function syncContinuousMotion() {
    const enabled = continuousMotionEnabled && !reduceMotion.matches;
    root.classList.toggle('motion-paused', !enabled);
    if (!motionSwitch) return;
    motionSwitch.setAttribute('aria-pressed', String(enabled));
    const disabledBySystem = reduceMotion.matches;
    motionSwitch.disabled = disabledBySystem;
    motionSwitch.querySelector('.motion-switch__label strong').textContent = enabled ? 'ON' : 'OFF';
    motionSwitch.setAttribute('aria-label', disabledBySystem
      ? 'Animasi dinonaktifkan mengikuti pengaturan Kurangi Gerakan pada perangkat'
      : (enabled ? 'Matikan animasi bergerak terus-menerus' : 'Nyalakan animasi bergerak terus-menerus'));
    motionSwitch.title = disabledBySystem
      ? 'Kurangi Gerakan aktif pada pengaturan perangkat'
      : (enabled ? 'Jeda animasi dekoratif; kilau dan permainan tetap interaktif' : 'Nyalakan kembali animasi dekoratif');
  }
  syncContinuousMotion();
  motionSwitch?.addEventListener('click', () => {
    if (reduceMotion.matches) return;
    continuousMotionEnabled = !continuousMotionEnabled;
    try { window.localStorage.setItem('jee-dev-continuous-motion', continuousMotionEnabled ? 'on' : 'off'); }
    catch { /* Retain current choice for this session. */ }
    syncContinuousMotion();
  });
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', syncContinuousMotion);
  else if (reduceMotion.addListener) reduceMotion.addListener(syncContinuousMotion);
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('motion-hidden', document.hidden);
  });
  // Decorative loops outside the viewport can be paused. Motion resumes when seen.
  if ('IntersectionObserver' in window) {
    const motionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('motion-offscreen', !entry.isIntersecting));
    }, { rootMargin: '220px 0px 220px 0px', threshold: 0 });
    document.querySelectorAll('.hero, .ticker, .section, .contact-section, .footer').forEach(node => motionObserver.observe(node));
  }

  const motionTargets = [
    '.brand', '.nav a', '.nav-contact', '.menu-toggle', '.button', '.filter',
    '.service-card', '.project-card', '.terminal', '.float-label',
    '.skill-row', '.skill-tags span', '.project-chips span',
    '.other-work > div span', '.process-step', '.about-badge',
    '.about-signature', '.section-kicker', '.hero__footnote',
    '.footer__links a', '.footer__links button', '.footer__bottom a'
  ].join(', ');

  // Subtle 3D tilt and a radial light that follows the pointer over cards.
  document.querySelectorAll('.service-card, .project-card').forEach(card => {
    let raf = 0;
    let latestEvent;
    card.addEventListener('pointermove', event => {
      if (reduceMotion.matches || root.classList.contains('motion-paused') || !finePointer.matches) return;
      latestEvent = event;
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const bounds = card.getBoundingClientRect();
        const x = (latestEvent.clientX - bounds.left) / bounds.width;
        const y = (latestEvent.clientY - bounds.top) / bounds.height;
        card.style.setProperty('--spot-x', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--spot-y', `${(y * 100).toFixed(1)}%`);
        card.style.setProperty('--tilt-x', `${((.5 - y) * 3.4).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${((x - .5) * 4).toFixed(2)}deg`);
      });
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      window.cancelAnimationFrame(raf);
      raf = 0;
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--spot-x', '50%');
      card.style.setProperty('--spot-y', '50%');
    });
  });

  // Tap effect on mobile and click effect on desktop; dragging to scroll won't trigger it.
  let downPoint = null;
  document.addEventListener('pointerdown', event => {
    if (reduceMotion.matches || root.classList.contains('motion-paused') || !event.isPrimary) return;
    const target = event.target instanceof Element ? event.target.closest(motionTargets) : null;
    downPoint = target ? { id: event.pointerId, x: event.clientX, y: event.clientY, target } : null;
  }, { passive: true });

  document.addEventListener('pointercancel', () => { downPoint = null; }, { passive: true });
  document.addEventListener('pointerup', event => {
    if (!downPoint || event.pointerId !== downPoint.id || reduceMotion.matches || root.classList.contains('motion-paused')) return;
    const { x, y, target } = downPoint;
    downPoint = null;
    if (Math.hypot(event.clientX - x, event.clientY - y) > 14 || !target.isConnected) return;

    target.classList.remove('fx-touch-active');
    // Restart animation even for consecutive touches on the same target.
    void target.offsetWidth;
    target.classList.add('fx-touch-active');
    window.setTimeout(() => target.classList.remove('fx-touch-active'), 540);

    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const wave = document.createElement('span');
    wave.className = 'fx-ripple';
    wave.setAttribute('aria-hidden', 'true');
    wave.style.setProperty('--ripple-x', `${event.clientX - rect.left}px`);
    wave.style.setProperty('--ripple-y', `${event.clientY - rect.top}px`);
    // The ripple uses absolute positioning; avoid changing the visual semantics of a control.
    if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
    target.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove(), { once: true });
    window.setTimeout(() => wave.remove(), 800);
  }, { passive: true });


  // ====================== JEE DEV PLAYGROUND ======================
  // All gameplay is local to the browser. No analytics or server calls.
  const arena = document.querySelector('#play-arena');
  const star = document.querySelector('#play-star');
  const start = document.querySelector('#play-start');
  const surprise = document.querySelector('#play-surprise');
  const idle = document.querySelector('#play-idle');
  const scoreText = document.querySelector('#play-score');
  const timeText = document.querySelector('#play-time');
  const bestText = document.querySelector('#play-best');
  const status = document.querySelector('#play-status');
  const progress = document.querySelector('#play-progress');
  const comboText = document.querySelector('#play-combo');
  const sparkleToggle = document.querySelector('#play-toggle');
  if (arena && star && start && idle && scoreText && timeText && bestText && status && progress && comboText && sparkleToggle && surprise) {
    const DURATION = 20_000;
    const mobileView = window.matchMedia('(max-width: 540px)');
    let running = false;
    let remaining = DURATION;
    let deadline = 0;
    let tickerId = 0;
    let moveId = 0;
    let pointerHeld = false;
    let score = 0;
    let combo = 0;
    let lastCatch = 0;
    let best = 0;
    let sparkEnabled = !reduceMotion.matches;
    let lastTrail = 0;
    try { best = Math.max(0, Math.min(999999, Number(localStorage.getItem('jee-dev-star-best')) || 0)); } catch { /* private browsing */ }

    const pad = value => String(value).padStart(3, '0');
    bestText.textContent = pad(best);
    function clearSparkles() {
      arena.querySelectorAll('.pg-spark').forEach(node => node.remove());
    }
    function setSparkEnabled(enabled) {
      sparkEnabled = Boolean(enabled) && !reduceMotion.matches;
      arena.classList.toggle('sparkles-off', !sparkEnabled);
      if (!sparkEnabled) clearSparkles();
      sparkleToggle.setAttribute('aria-pressed', String(sparkEnabled));
      sparkleToggle.textContent = sparkEnabled ? '✦ Kilau ON' : '✦ Kilau OFF';
      sparkleToggle.setAttribute('aria-label', sparkEnabled ? 'Matikan efek kilau' : 'Aktifkan efek kilau');
    }
    setSparkEnabled(sparkEnabled);
    sparkleToggle.addEventListener('click', () => setSparkEnabled(!sparkEnabled));
    reduceMotion.addEventListener?.('change', () => setSparkEnabled(false));

    const MAX_PARTICLES = 80;
    function spark(x, y, n = 6, colorful = false) {
      if (!sparkEnabled || reduceMotion.matches || document.hidden || !arena.isConnected) return;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const count = Math.max(0, Math.min(n, 25));
      // Bound the total particle count, including overlapping surprise bursts.
      const previous = [...arena.querySelectorAll('.pg-spark')];
      const overflow = Math.max(0, previous.length + count - MAX_PARTICLES);
      for (let i = 0; i < overflow; i++) previous[i].remove();
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('i');
        particle.className = 'pg-spark' + (n <= 2 ? ' pg-spark--soft' : '');
        particle.setAttribute('aria-hidden', 'true');
        const direction = (i / count) * Math.PI * 2 + Math.random() * .6;
        const radius = (colorful ? 85 : 38) * (.45 + Math.random() * .75);
        // Near corners, reflect rays toward the interior instead of losing them.
        const edge = 7;
        const sx = Math.max(edge, Math.min(arena.clientWidth - edge, x));
        const sy = Math.max(edge, Math.min(arena.clientHeight - edge, y));
        let dx = Math.cos(direction) * radius;
        let dy = Math.sin(direction) * radius;
        if (sx + dx < edge || sx + dx > arena.clientWidth - edge) dx *= -1;
        if (sy + dy < edge || sy + dy > arena.clientHeight - edge) dy *= -1;
        particle.style.left = `${sx}px`;
        particle.style.top = `${sy}px`;
        particle.style.setProperty('--pg-x', `${dx}px`);
        particle.style.setProperty('--pg-y', `${dy}px`);
        particle.style.setProperty('--pg-size', `${3 + Math.random() * 6}px`);
        particle.style.setProperty('--pg-duration', `${500 + Math.random() * 400}ms`);
        if (colorful) particle.style.background = ['#ffe4a0','#e9badc','#a5d7e6','#bfe6bc'][i % 4];
        particle.addEventListener('animationend', () => particle.remove(), { once: true });
        // Fallback for suspended animation frames or browser implementations.
        window.setTimeout(() => particle.remove(), 1000);
        fragment.appendChild(particle);
      }
      arena.appendChild(fragment);
    }
    function sparkleAt(clientX, clientY, number = 6) {
      const rect = arena.getBoundingClientRect();
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return;
      spark(clientX - rect.left, clientY - rect.top, number);
    }
    arena.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || !finePointer.matches || !sparkEnabled || reduceMotion.matches) return;
      if (event.timeStamp - lastTrail < 75) return;
      lastTrail = event.timeStamp;
      sparkleAt(event.clientX, event.clientY, 2);
    }, { passive: true });
    // Touches create sparkles only on a completed tap, not on scroll gestures.
    let tapStart = null;
    arena.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.pointerType === 'mouse' || star.contains(event.target)) {
        tapStart = null;
        return;
      }
      tapStart = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
    }, { passive: true });
    arena.addEventListener('pointerup', event => {
      if (!tapStart || event.pointerId !== tapStart.id) return;
      const tap = tapStart;
      tapStart = null;
      if (performance.now() - tap.time > 550) return;
      if (Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 13) return;
      sparkleAt(event.clientX, event.clientY, 7);
    }, { passive: true });
    arena.addEventListener('pointercancel', () => { tapStart = null; }, { passive: true });

    function positionStar() {
      // Fixed-size hit target; only the inner star glyph animates.
      const areaW = arena.clientWidth;
      const areaH = arena.clientHeight;
      const size = star.offsetWidth || (mobileView.matches ? 70 : 76);
      const margin = 8;
      const left = margin + Math.random() * Math.max(0, areaW - size - margin * 2);
      const top = margin + Math.random() * Math.max(0, areaH - size - margin * 2);
      star.style.left = `${Math.round(left)}px`;
      star.style.top = `${Math.round(top)}px`;
    }
    function moveLoop() {
      // A timeout is rearmed after each catch, so the star never teleports mid-tap.
      window.clearTimeout(moveId);
      if (!running || pointerHeld || document.hidden) return;
      moveId = window.setTimeout(() => {
        if (!running || pointerHeld || document.hidden) return;
        positionStar();
        moveLoop();
      }, 1800);
    }
    star.addEventListener('pointerdown', () => {
      pointerHeld = true;
      window.clearTimeout(moveId);
    });
    function releaseStar() {
      if (!pointerHeld) return;
      pointerHeld = false;
      if (running) moveLoop();
    }
    window.addEventListener('pointerup', releaseStar, { passive: true });
    window.addEventListener('pointercancel', releaseStar, { passive: true });
    function refreshStats() {
      scoreText.textContent = pad(score);
      timeText.innerHTML = `${Math.ceil(remaining / 1000)}<span class="playground-stats__unit">s</span>`;
      progress.style.width = `${Math.max(0, remaining / DURATION) * 100}%`;
    }
    function finish() {
      if (!running) return;
      running = false;
      window.clearInterval(tickerId);
      window.clearTimeout(moveId);
      pointerHeld = false;
      remaining = 0;
      star.hidden = true;
      if (document.activeElement === star) start.focus({ preventScroll: true });
      idle.hidden = false;
      idle.querySelector('strong').textContent = score >= 100 ? 'Luar biasa! ✨' : 'Waktu habis!';
      idle.querySelector('span:last-child').textContent = `Skor akhir ${score} · Main lagi?`;
      start.innerHTML = 'Main Lagi <span aria-hidden="true">↗</span>';
      status.textContent = `Selesai! Skor kamu ${score}.`;
      if (score > best) {
        best = score;
        bestText.textContent = pad(best);
        status.textContent = `Rekor baru! ${score} poin. Keren!`;
        try { localStorage.setItem('jee-dev-star-best', String(best)); } catch { /* storage blocked */ }
        spark(arena.clientWidth / 2, arena.clientHeight / 2, 25, true);
      }
      refreshStats();
    }
    function tick() {
      if (!running || document.hidden) return;
      remaining = Math.max(0, deadline - performance.now());
      refreshStats();
      if (remaining <= 0) finish();
    }
    function begin() {
      window.clearInterval(tickerId);
      window.clearTimeout(moveId);
      pointerHeld = false;
      running = true;
      remaining = DURATION;
      score = 0;
      combo = 0;
      lastCatch = 0;
      deadline = performance.now() + DURATION;
      idle.hidden = true;
      star.hidden = false;
      comboText.classList.remove('is-active');
      start.innerHTML = 'Ulangi Permainan <span aria-hidden="true">↻</span>';
      status.textContent = 'Tangkap bintangnya!';
      positionStar();
      refreshStats();
      star.focus({ preventScroll: true });
      tickerId = window.setInterval(tick, 90);
      moveLoop();
    }
    start.addEventListener('click', begin);
    star.addEventListener('click', () => {
      if (!running || document.hidden) return;
      tick();
      if (!running) return;
      const now = performance.now();
      combo = now - lastCatch <= 1400 ? Math.min(combo + 1, 5) : 1;
      lastCatch = now;
      const points = 10 + (combo - 1) * 5;
      score += points;
      scoreText.textContent = pad(score);
      const x = star.offsetLeft + star.offsetWidth / 2;
      const y = star.offsetTop + star.offsetHeight / 2;
      spark(x, y, 13);
      comboText.style.left = `${Math.min(arena.clientWidth - 105, Math.max(15, x - 35))}px`;
      comboText.style.top = `${Math.max(10, y - 45)}px`;
      comboText.textContent = combo > 1 ? `×${combo} COMBO!` : `+${points}`;
      comboText.classList.remove('is-active');
      void comboText.offsetWidth;
      comboText.classList.add('is-active');
      status.textContent = combo > 1 ? `Kombo ×${combo}! +${points} poin` : `Dapat! +${points} poin`;
      document.dispatchEvent(new CustomEvent('jee:star-catch', { detail: { score, combo, points } }));
      positionStar();
      moveLoop();
    });
    surprise.addEventListener('click', () => {
      const rect = arena.getBoundingClientRect();
      // Burst across the complete rectangle, including all four corners.
      const centers = [[.045,.075],[.50,.08],[.955,.075],[.94,.50],[.955,.92],[.50,.92],[.045,.92],[.06,.50],[.50,.50]];
      centers.forEach(([x,y], i) => window.setTimeout(() => spark(rect.width * x, rect.height * y, 12, true), i * 95));
      status.textContent = sparkEnabled ? 'Surprise! Hujan bintang untukmu ✨' : 'Aktifkan Kilau untuk melihat kejutan ✨';
    });
    // Freeze the clock when switching tabs, so visitors don't lose time while away.
    let hiddenAt = 0;
    document.addEventListener('visibilitychange', () => {
      if (!running) return;
      if (document.hidden) {
        hiddenAt = performance.now();
        window.clearTimeout(moveId);
      }
      else if (hiddenAt) {
        deadline += performance.now() - hiddenAt;
        hiddenAt = 0;
        tick();
        if (running) moveLoop();
      }
    });
    // Use a safe center after resizing; the target always stays inside the arena.
    window.addEventListener('resize', () => {
      if (running) {
        const maxX = Math.max(8, arena.clientWidth - star.offsetWidth - 8);
        const maxY = Math.max(8, arena.clientHeight - star.offsetHeight - 8);
        star.style.left = `${Math.min(maxX, parseFloat(star.style.left) || 0)}px`;
        star.style.top = `${Math.min(maxY, parseFloat(star.style.top) || 0)}px`;
      }
    }, { passive: true });
  }

})();

// ================================================================
// JEE DEV / CYBERLAB 2.0
// Pure client-side enhancements; no external API calls or eval.
// ================================================================
(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(pointer:fine) and (hover:hover)');
  const root = document.documentElement;
  const availableMotion = () => !document.hidden && !reduced.matches && !root.classList.contains('motion-paused');
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* unavailable */ } }
  };

  // 1 — A lightweight adaptive full-viewport constellation.
  const sky = $('#particle-sky');
  const ctx = sky?.getContext('2d', { alpha: true });
  if (ctx) {
    let width = 0, height = 0, scale = 1, nodes = [], raf = 0, last = 0, resizeTimer = 0;
    const pointer = { x: -1000, y: -1000, last: 0 };
    function layout() {
      width = window.innerWidth;
      height = window.innerHeight;
      scale = Math.min(2, window.devicePixelRatio || 1);
      sky.width = Math.max(1, Math.floor(width * scale));
      sky.height = Math.max(1, Math.floor(height * scale));
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      const count = width < 500 ? 17 : width < 850 ? 26 : 43;
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - .5) * .34, vy: (Math.random() - .5) * .34,
        r: .7 + Math.random() * 1.35
      }));
    }
    function draw(now) {
      raf = requestAnimationFrame(draw);
      if (now - last < (width < 600 ? 41 : 33)) return; // 24–30fps max
      const dt = Math.min(2, (now - last) / 33 || 1);
      last = now;
      ctx.clearRect(0, 0, width, height);
      const activePointer = fine.matches && now - pointer.last < 1300;
      const maxLink = width < 600 ? 88 : 124;
      const color = document.body.classList.contains('cyber-mode') ? '115,244,248' : '244,203,127';
      for (const dot of nodes) {
        dot.x += dot.vx * dt; dot.y += dot.vy * dt;
        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;
        dot.x = Math.max(0, Math.min(width, dot.x));
        dot.y = Math.max(0, Math.min(height, dot.y));
        if (activePointer) {
          const dx = pointer.x - dot.x, dy = pointer.y - dot.y;
          const distance = Math.hypot(dx,dy);
          if (distance > 10 && distance < 150) {
            dot.x += dx / distance * .60 * dt;
            dot.y += dy / distance * .60 * dt;
            ctx.strokeStyle = `rgba(${color},${.23 * (1 - distance / 150)})`;
            ctx.beginPath();ctx.moveTo(dot.x,dot.y);ctx.lineTo(pointer.x,pointer.y);ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${color},.56)`;
        ctx.beginPath(); ctx.arc(dot.x,dot.y,dot.r,0,Math.PI*2);ctx.fill();
      }
      // Cap quadratic work via a small, fixed node count.
      for (let i=0; i<nodes.length; i++) for(let j=i+1; j<nodes.length;j++) {
        const a=nodes[i], b=nodes[j], dx=a.x-b.x, dy=a.y-b.y;
        const distSq=dx*dx+dy*dy;
        if (distSq < maxLink*maxLink) {
          ctx.strokeStyle=`rgba(${color},${.18*(1-Math.sqrt(distSq)/maxLink)})`;
          ctx.lineWidth=.7;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
    }
    function syncSky() {
      if (availableMotion()) {
        if (!raf) { layout(); last = 0; raf=requestAnimationFrame(draw); }
      } else {
        cancelAnimationFrame(raf); raf=0; ctx.clearRect(0,0,width,height);
      }
    }
    document.addEventListener('pointermove', event => {
      if (!fine.matches) return;
      pointer.x=event.clientX;pointer.y=event.clientY;pointer.last=performance.now();
    }, { passive:true });
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(layout,160);
    }, { passive:true });
    document.addEventListener('visibilitychange',syncSky);
    if (reduced.addEventListener) reduced.addEventListener('change',syncSky);
    new MutationObserver(syncSky).observe(root,{attributes:true,attributeFilter:['class']});
    syncSky();
  }

  // 2 — WebAudio sound cues; strictly off until a visitor clicks ON.
  const soundSwitch = $('#sound-switch');
  let soundOn = false, audio = null;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  function note(kind='tap') {
    if (!soundOn || !audio || audio.state !== 'running') return;
    try {
      const t=audio.currentTime;
      const styles={tap:[460,600,.065],star:[680,1030,.105],unlock:[580,1100,.24],secret:[240,880,.38],error:[215,180,.11]};
      const [from,to,duration]=styles[kind] || styles.tap;
      const oscillator=audio.createOscillator(), gain=audio.createGain();
      oscillator.type=kind==='secret'?'triangle':'sine';
      oscillator.frequency.setValueAtTime(from,t);
      oscillator.frequency.exponentialRampToValueAtTime(to,t+duration);
      gain.gain.setValueAtTime(.0001,t);
      gain.gain.exponentialRampToValueAtTime(.035,t+.012);
      gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(t); oscillator.stop(t+duration+.01);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    } catch { /* Audio API can be unavailable while suspended. */ }
  }
  soundSwitch?.addEventListener('click', async () => {
    if (soundOn) soundOn=false;
    else if (AudioCtor) {
      try {
        if (!audio) audio=new AudioCtor();
        await audio.resume();
        soundOn=audio.state==='running';
      } catch { soundOn=false; }
    }
    soundSwitch.setAttribute('aria-pressed',String(soundOn));
    soundSwitch.setAttribute('aria-label',soundOn?'Matikan suara interaktif':'Aktifkan suara interaktif');
    $('strong',soundSwitch).textContent=soundOn?'SUARA ON':'SUARA OFF';
    if (soundOn) note('tap');
  });

  // 3 — Achievements persist locally, never require sign-in.
  const achievementData = {
    'first-star':'Pemburu Bintang', 'star-hunter':'Star Hunter',
    'terminal':'Command Line', 'explorer':'Project Explorer',
    'mascot':'Robot Whisperer', 'secret':'Cyber Awakening'
  };
  let unlocked=[];
  try { const saved=JSON.parse(storage.get('jee-dev-achievements')||'[]'); if(Array.isArray(saved)) unlocked=saved.filter(k=>Object.hasOwn(achievementData,k)); } catch { /* reset invalid data */ }
  unlocked=[...new Set(unlocked)];
  const unlockedSet=new Set(unlocked);
  const achPopup=$('#achievement-popup');
  let achTimer=0;
  function refreshAchievements() {
    $$('.achievement').forEach(row=>{
      const done=unlockedSet.has(row.dataset.achievement);
      row.classList.toggle('is-unlocked',done);
      const mark=$('.achievement__lock',row);
      mark.textContent=done?'✓':'◇'; mark.setAttribute('aria-label',done?'Terbuka':'Terkunci');
    });
    const count=$('#achievement-count');
    if(count) count.textContent=`${unlockedSet.size}/6`;
  }
  function unlock(id) {
    if (!Object.hasOwn(achievementData,id) || unlockedSet.has(id)) return;
    unlockedSet.add(id);
    storage.set('jee-dev-achievements',JSON.stringify([...unlockedSet]));
    refreshAchievements();
    $('#achievement-popup-name').textContent=achievementData[id];
    achPopup.classList.remove('is-shown');
    void achPopup.offsetWidth;
    achPopup.classList.add('is-shown');
    clearTimeout(achTimer);achTimer=setTimeout(()=>achPopup.classList.remove('is-shown'),3500);
    note('unlock');
  }
  refreshAchievements();
  document.addEventListener('jee:star-catch',event=>{
    unlock('first-star');
    if(event.detail?.score>=100) unlock('star-hunter');
    else note('star');
  });

  // 4 — Click / touch project cards for accessible concrete detail.
  const projectData = {
    store:{title:'JEE STORE',desc:'Sistem penjualan produk digital dan layanan berbasis Telegram dengan pengelolaan katalog, stok, dan transaksi.',features:['Katalog produk dan pengelolaan stok','Invoice dan verifikasi pembayaran','Panel owner serta ringkasan pembelian'],tech:['Python','Telegram','QRIS']},
    nokos:{title:'JEE NOKOS BOT',desc:'Bot untuk mengatur katalog akun digital dan alur pembelian otomatis melalui Telegram.',features:['Manajemen akun dan status katalog','Proses pemesanan dan pembayaran QRIS','Pengelolaan akun melalui panel owner'],tech:['Python','Pyrogram','SQLite']},
    ubot:{title:'UJEE / JEE UBOT',desc:'Pengembangan userbot Telegram modular yang memudahkan pengelolaan beberapa akun dalam satu sistem.',features:['Konfigurasi modul userbot','Alat pengelolaan akun','Pengoperasian di Linux VPS'],tech:['Python','Pyrogram','Linux']},
    fsub:{title:'FSub Modular',desc:'Bot Telegram dengan alur distribusi file dan tautan berdasarkan verifikasi channel.',features:['Verifikasi keanggotaan channel','Distribusi tautan dan file','Konfigurasi fitur secara modular'],tech:['Python','Telegram API','Modules']},
    pos:{title:'Kafe Kata POS',desc:'Aplikasi kasir web untuk membantu operasional penjualan, pencatatan transaksi, dan laporan.',features:['Pencatatan pesanan dan pembayaran','Rekap laporan transaksi','Dukungan pencetakan struk'],tech:['FastAPI','Python','Web']},
    support:{title:'JEE Customer Support Bot',desc:'Bot layanan pelanggan dengan respons yang dapat diatur serta alur eskalasi ke admin.',features:['Pertanyaan dan jawaban terstruktur','Dukungan kirim media','Routing percakapan ke admin'],tech:['Telegram Bot','Routing','Python']}
  };
  const dialog=$('#project-dialog');
  const visited=new Set();
  let detailTrigger=null;
  $$('.project-open').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.openProject, item=projectData[id]; if(!item || !dialog) return;
    detailTrigger=button;
    $('#dialog-title').textContent=item.title;
    $('#dialog-description').textContent=item.desc;
    const ul=$('#dialog-features');ul.replaceChildren();
    item.features.forEach(value=>{const li=document.createElement('li');li.textContent=value;ul.appendChild(li);});
    const tech=$('#dialog-tech');tech.replaceChildren();
    item.tech.forEach(value=>{const tag=document.createElement('span');tag.textContent=value;tech.appendChild(tag);});
    if(typeof dialog.showModal==='function') dialog.showModal(); else dialog.setAttribute('open','');
    $('#dialog-close').focus();
    visited.add(id);if(visited.size>=3) unlock('explorer');
    note('tap');
  }));
  function closeDialog() { if(!dialog)return; if(typeof dialog.close==='function' && dialog.open)dialog.close();else dialog.removeAttribute('open'); }
  $('#dialog-close')?.addEventListener('click',closeDialog);
  dialog?.addEventListener('click',e=>{if(e.target===dialog)closeDialog();});
  dialog?.addEventListener('close',()=>detailTrigger?.focus({preventScroll:true}));

  // 5 — Simple, predictable portal between in-page sections.
  const portal=$('#portal-overlay');
  let portalTimer=0, portalJumpTimer=0;
  document.addEventListener('click',event=>{
    if(event.defaultPrevented || event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link=event.target.closest('a[href^="#"]');
    if(!link || link.matches('.skip-link') || link.hasAttribute('download') || !portal)return;
    const id=decodeURIComponent(link.getAttribute('href').slice(1));
    if(!id)return;
    const destination=document.getElementById(id);
    if(!destination)return;
    event.preventDefault();
    clearTimeout(portalTimer);clearTimeout(portalJumpTimer);portal.classList.remove('is-active');
    const instant=reduced.matches || root.classList.contains('motion-paused');
    if(!instant){void portal.offsetWidth;portal.classList.add('is-active');note('tap');}
    // A short transition does not delay navigation or block interactions.
    try {history.pushState(null,'','#'+encodeURIComponent(id));}
    catch {location.hash=id;}
    // The portal briefly covers the jump; avoids multi-second long-page smooth scrolling.
    const jump=()=>destination.scrollIntoView({behavior:'instant',block:'start'});
    if(instant) jump(); else portalJumpTimer=setTimeout(jump,140);
    portalTimer=setTimeout(()=>portal.classList.remove('is-active'),instant?0:650);
  });

  // 6 — Secret theme: discover via terminal 'secret' or mascot.
  let secretMode=storage.get('jee-dev-cyber-mode')==='on';
  function theme(enabled) {
    secretMode=!!enabled;
    document.body.classList.toggle('cyber-mode',secretMode);
    storage.set('jee-dev-cyber-mode',secretMode?'on':'off');
    if(secretMode){unlock('secret');note('secret');}
  }
  theme(secretMode);

  // 7 — Safe simulated developer terminal (never evaluates arbitrary commands).
  const output=$('#terminal-output');
  const terminalForm=$('#terminal-form');
  const input=$('#terminal-command');
  const known=['help','about','skills','projects','contact','playground','achievements','status','whoami','clear','secret','exit','neon'];
  const entered=new Set();
  const historyCommands=[];
  let historyPos=0;
  function print(message, style='') {
    const p=document.createElement('p');
    p.className='terminal-line'+(style?' terminal-line--'+style:'');
    p.textContent=message;
    output.appendChild(p);
    // Keep output bounded on long sessions.
    while(output.children.length>65)output.firstElementChild.remove();
    output.scrollTop=output.scrollHeight;
  }
  function run(command) {
    const raw=command.trim();if(!raw)return;
    print('jee@visitor ~ $ '+raw,'prompt');
    const name=raw.toLowerCase().split(/\s+/)[0];
    if(name==='clear'){output.replaceChildren();print('Terminal dibersihkan.','success');}
    else if(name==='help')print('PERINTAH: help · about · skills · projects · contact · playground · achievements · status · whoami · clear · secret · exit');
    else if(name==='about')print('JEE DEV — independent developer. Fokus: bot Telegram, automasi Python, dan aplikasi web.');
    else if(name==='skills')print('PYTHON  •  PYROGRAM  •  FASTAPI  •  SQLITE  •  TELEGRAM API  •  LINUX VPS  •  HTML/CSS/JS');
    else if(name==='projects')print('JEE STORE | JEE NOKOS BOT | UJEE | FSub Modular | Kafe Kata POS | Customer Support Bot\nBuka kartu proyek di atas untuk detail interaktif.');
    else if(name==='contact')print('Telegram: @jeenotdev · https://t.me/jeenotdev');
    else if(name==='playground')print('Mini-game Tangkap Bintang: 20 detik. Kumpulkan kombo untuk skor tambahan. Scroll ke bagian Playground!');
    else if(name==='achievements')print(`Progress: ${unlockedSet.size}/6 pencapaian. Coba game, jelajahi proyek, dan temukan petunjuk bot.`);
    else if(name==='whoami')print('visitor@jee-dev · role: explorer · permission: curious');
    else if(name==='status')print(`SYSTEM ONLINE  •  SOUND ${soundOn?'ON':'OFF'}  •  MOTION ${availableMotion()?'ON':'PAUSED'}  •  SECRET ${secretMode?'ACTIVE':'INACTIVE'}`,'success');
    else if(name==='secret'||name==='neon'){theme(!secretMode);print(secretMode?'⚡ CYBER MODE ENABLED. Welcome to the hidden side.':'Cyber mode disabled. Back to golden era.','success');}
    else if(name==='exit'){theme(false);print('Kembali ke tampilan standar.','success');}
    else {print(`Perintah tidak dikenal: ${name}. Ketik 'help' untuk melihat perintah.`, 'error');note('error');}
    if(known.includes(name) && name!=='clear'){
      entered.add(name);
      if(entered.size>=3) unlock('terminal');
      if(name!=='secret'&&name!=='neon') note('tap');
    }
    historyCommands.push(raw);if(historyCommands.length>25)historyCommands.shift();historyPos=historyCommands.length;
  }
  // Browser-agnostic input execution: Enter, mobile keyboard action and RUN
  // all call the same function. Do not rely solely on implicit form submission.
  function executeManualCommand() {
    if (!input || !output) return;
    const command=input.value.trim();
    if (!command) {
      print('Ketik perintah terlebih dahulu. Contoh: help', 'error');
      input.focus({preventScroll:true});
      return;
    }
    run(command);
    input.value='';
    input.focus({preventScroll:true});
  }
  terminalForm?.addEventListener('submit',e=>{
    e.preventDefault();
    executeManualCommand();
  });
  $('#terminal-run')?.addEventListener('click',executeManualCommand);
  $$('#devlab [data-command]').forEach(button=>button.addEventListener('click',()=>{run(button.dataset.command);input.focus({preventScroll:true});}));
  input?.addEventListener('keydown',e=>{
    if (e.key==='Enter' && !e.isComposing && e.keyCode!==229) {
      e.preventDefault();
      executeManualCommand();
      return;
    }
    if(e.key==='ArrowUp' && historyCommands.length){e.preventDefault();historyPos=Math.max(0,historyPos-1);input.value=historyCommands[historyPos];}
    else if(e.key==='ArrowDown' && historyCommands.length){e.preventDefault();historyPos=Math.min(historyCommands.length,historyPos+1);input.value=historyCommands[historyPos]||'';}
    else if(e.key==='Tab' && input.value.trim()){
      const matches=known.filter(k=>k.startsWith(input.value.toLowerCase().trim()));
      if(matches.length===1){e.preventDefault();input.value=matches[0];}
    }
  });
  const hints=[
    'Tiga perintah terminal berbeda membuka sebuah achievement.',
    'Coba ketik secret di terminal... tapi jangan beri tahu siapa-siapa.',
    'Buka detail dari tiga proyek yang berbeda.',
    'Tangkap bintang hingga skor 100 untuk meraih Star Hunter.',
    'Robot kecil di kiri bawah menyimpan kejutan.'
  ];
  let hintIndex=0;
  $('#achievement-hint')?.addEventListener('click',()=>{print('TIP: '+hints[hintIndex++%hints.length],'success');input.focus();note('tap');});

  // Mobile: fixed controls would overlap the terminal's RUN button.
  // Hide them only while Developer Lab is visible; they return on other sections.
  if ('IntersectionObserver' in window) {
    const devlab = $('#devlab');
    if (devlab) {
      const widgetsObserver = new IntersectionObserver(entries => {
        document.body.classList.toggle('devlab-inview',entries[0].isIntersecting);
      }, {rootMargin:'-70px 0px -70px 0px',threshold:0});
      widgetsObserver.observe(devlab);
    }
  }

  // 8 — Bot mascot: contextual, helpful and a five-tap Easter egg.
  const mascot=$('#jee-mascot'), mascotButton=$('#mascot-button'), bubble=$('#mascot-bubble');
  const speeches=[
    'Hai! Saya JEE·BOT. Coba terminal interaktif di Dev Lab ⌘',
    'Tips: buka detail 3 proyek agar mendapatkan achievement!',
    'Butuh ide? Ketik help di terminal.',
    'Ada mode tersembunyi... sepertinya terminal tahu caranya.',
    'Psst... sudah mencoba bermain Tangkap Bintang?'
  ];
  let mascotTouches=0, speechIndex=0, bubbleTimeout=0;
  mascotButton?.addEventListener('click',()=>{
    mascotTouches++;
    if(mascotTouches===5){theme(true);unlock('mascot');bubble.textContent='⚡ SECRET UNLOCKED! Kamu menemukan sisi tersembunyi JEE DEV. Ketik exit di terminal untuk kembali.';}
    else if(mascotTouches>5 && mascotTouches%5===0){theme(!secretMode);bubble.textContent=secretMode?'Mode cyber aktif! ⚡':'Mode biasa kembali. ✦';}
    else bubble.textContent=speeches[speechIndex++%speeches.length];
    mascot.classList.add('is-talking');
    clearTimeout(bubbleTimeout);
    bubbleTimeout=setTimeout(()=>mascot.classList.remove('is-talking'),6500);
    note('tap');
  });
  // Initial hint is hidden to avoid covering content until requested.
})();
