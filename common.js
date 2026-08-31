/* ============================================================
   ACSES DKTE — SHARED SITE LOGIC
   Included on every page. Handles navigation, the custom cursor,
   tilt/spotlight cards, scroll reveals, the loader, and other
   interactions that are identical across pages. Page-specific
   rendering (About content, Events list, Gallery, etc.) lives in
   each page's own page-*.js file.
============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Join links (present on most pages) ----
document.querySelectorAll('[data-join-link]').forEach(el => { el.href = JOIN_URL; });

// ---- Mobile nav menu (hamburger drawer) ----
(function () {
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('navDrawer');
  const scrim = document.querySelector('.drawer-scrim');
  
  if (!toggle || !drawer) return;
  
  const closeMenu = () => {
    drawer.classList.remove('open');
    toggle.classList.remove('open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.classList.toggle('menu-open', isOpen);
  });
  
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  
  if (scrim) {
    scrim.addEventListener('click', closeMenu);
  }

  // Graceful resize handling (if user rotates to desktop view, close menu)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && drawer.classList.contains('open')) {
      closeMenu();
    }
  });

  // Escape key handling
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMenu();
    }
  });
})();

// ---- Nav active state (based on current page + in-page sections) ----
(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page], .nav-drawer a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === path);
  });
  const navPill = document.getElementById('navPill');
  function updateNavPill() {
    const active = document.querySelector('.nav-link.active');
    if (!active || !navPill) return;
    navPill.style.width = active.offsetWidth + 'px';
    navPill.style.transform = `translateX(${active.offsetLeft}px)`;
    navPill.classList.add('show');
  }
  window.addEventListener('resize', updateNavPill);
  window.addEventListener('load', () => setTimeout(updateNavPill, 300));
  setTimeout(updateNavPill, 60);

  // in-page section highlighting only matters on pages with id'd sections
  const sections = document.querySelectorAll('section[id]');
  if (sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          document.querySelectorAll('.nav-link[data-target]').forEach(l =>
            l.classList.toggle('active', l.dataset.target === e.target.id));
          updateNavPill();
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => navObserver.observe(s));
  }
})();

// ---- Number counters (any .num inside a .stat-cell, revealed on scroll) ----
function animateCount(numEl) {
  const raw = numEl.textContent.trim();
  const match = raw.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!match) return;
  const [, prefix, digits, suffix] = match;
  const target = parseInt(digits.replace(/,/g, ''), 10);
  if (isNaN(target)) return;
  const duration = 1300;
  const t0 = performance.now();
  function step(now) {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    numEl.textContent = prefix + Math.floor(eased * target).toLocaleString('en-US') + suffix;
    if (p < 1) requestAnimationFrame(step); else numEl.textContent = raw;
  }
  requestAnimationFrame(step);
}

// ---- Scramble / decode text-in (eyebrows) ----
const SCRAMBLE_CHARS = '01<>/#*ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function scrambleIn(el) {
  const final = el.textContent;
  const frames = 16;
  let frame = 0;
  (function render() {
    frame++;
    const revealCount = Math.floor((frame / frames) * final.length);
    let out = '';
    for (let i = 0; i < final.length; i++) {
      out += (i < revealCount || final[i] === ' ') ? final[i] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    el.textContent = out;
    if (frame < frames) requestAnimationFrame(render); else el.textContent = final;
  })();
}
const scrambleObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      if (!reduceMotion) scrambleIn(e.target);
      scrambleObserver.unobserve(e.target);
    }
  });
}, { threshold: .6 });
document.querySelectorAll('.eyebrow').forEach(el => scrambleObserver.observe(el));

// ---- Scan-wipe reveal wrapper for headings ----
document.querySelectorAll('h1.reveal3d, h2.reveal3d, .scan-target').forEach(h => {
  if (h.querySelector('.scan-wrap')) return;
  const inner = h.innerHTML;
  h.innerHTML = `<span class="scan-wrap">${inner}<span class="scan-bar"></span></span>`;
});

// ---- 3D scroll reveal (re-observes whenever new content is injected —
// call window.observeReveals() after a page script renders dynamic HTML) ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      const numEl = e.target.classList.contains('stat-cell') ? e.target.querySelector('.num') : null;
      if (numEl && !reduceMotion) animateCount(numEl);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
window.observeReveals = function () {
  document.querySelectorAll('.reveal3d:not(.in-view)').forEach(el => revealObserver.observe(el));
};
window.observeReveals();

// ---- Parallax depth on scroll (hero layers) ----
function updateParallax() {
  const y = window.scrollY;
  document.querySelectorAll('[data-depth]').forEach(el => {
    const depth = parseFloat(el.dataset.depth);
    el.style.transform = (el.classList.contains('floor'))
      ? `translateX(-50%) rotateX(72deg) translateY(${y * depth}px)`
      : `translateY(${y * depth}px)`;
  });
}
let parallaxTicking = false;
window.addEventListener('scroll', () => {
  if (!parallaxTicking) { requestAnimationFrame(() => { updateParallax(); parallaxTicking = false; }); parallaxTicking = true; }
}, { passive: true });

// ---- Ambient cursor glow ----
const glow = document.getElementById('cursorGlow');
if (glow) {
  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = (e.clientY + window.scrollY) + 'px';
  }, { passive: true });
}

// ---- Mouse-tilt + spotlight on glass cards (call again after dynamic render) ----
function attachTilt(card) {
  if (card.dataset.tiltBound) return;
  card.dataset.tiltBound = '1';
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateX(${py * -8}deg) rotateY(${px * 8}deg) translateZ(6px)`;
    card.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
    card.style.setProperty('--my', `${(py + 0.5) * 100}%`);
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
}
window.attachTilt = attachTilt;
window.attachTiltAll = function () { document.querySelectorAll('.gcard').forEach(attachTilt); };
window.attachTiltAll();

// ---- Custom cursor (dot + lagging ring) ----
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
if (cursorDot && cursorRing && !reduceMotion && window.matchMedia('(hover:hover)').matches) {
  // the OS cursor is now hidden site-wide (see style.css) — this dot + ring
  // pair is the only cursor the person sees, so it needs to track the
  // pointer the instant the page loads, not just after the first move.
  document.documentElement.classList.add('custom-cursor');

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let placed = false;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    if (!placed) { rx = mx; ry = my; placed = true; } // snap on first move, no fly-in from center
  }, { passive: true });
  (function ringLoop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(ringLoop);
  })();

  // click pulse — brief squeeze-and-release so clicks feel confirmed
  // without the OS cursor's usual visual feedback
  window.addEventListener('mousedown', () => cursorRing.classList.add('pressed'), { passive: true });
  window.addEventListener('mouseup', () => cursorRing.classList.remove('pressed'), { passive: true });

  function bindHoverTargets() {
    document.querySelectorAll('a, button, .gcard, input, textarea, .flip-card, .photo-card, .chip, .tdot').forEach(el => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = '1';
      el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
    });
    // text fields get a slim "beam" cursor state instead of the round ring
    document.querySelectorAll('input, textarea').forEach(el => {
      if (el.dataset.cursorTextBound) return;
      el.dataset.cursorTextBound = '1';
      el.addEventListener('mouseenter', () => cursorRing.classList.add('text'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('text'));
    });
  }
  window.bindHoverTargets = bindHoverTargets;
  bindHoverTargets();
} else {
  // touch devices and reduced-motion users keep the normal OS cursor —
  // make sure we never accidentally hide it for them.
  document.documentElement.classList.remove('custom-cursor');
}

// ---- Magnetic buttons ----
function attachMagnetic(el) {
  if (reduceMotion || el.dataset.magBound) return;
  el.dataset.magBound = '1';
  el.classList.add('magnetic');
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const mx2 = (e.clientX - r.left - r.width / 2) * 0.28;
    const my2 = (e.clientY - r.top - r.height / 2) * 0.35;
    el.style.transform = `translate(${mx2}px, ${my2}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
}
window.attachMagnetic = attachMagnetic;
document.querySelectorAll('.btn, .plink').forEach(attachMagnetic);

// ---- Scroll progress bar ----
const scrollFill = document.getElementById('scrollFill');
function updateScrollProgress() {
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
  if (scrollFill) scrollFill.style.width = (isFinite(scrolled) ? scrolled : 0) + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

// ---- Page loader ----
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
if (loader) {
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(p + Math.random() * 18, 92);
    if (loaderFill) loaderFill.style.width = p + '%';
  }, 120);
  window.addEventListener('load', () => {
    clearInterval(tick);
    if (loaderFill) loaderFill.style.width = '100%';
    setTimeout(() => loader.classList.add('done'), 280);
  });
  setTimeout(() => { clearInterval(tick); loader.classList.add('done'); }, 3200);
}

// ---- Respect reduced motion ----
if (reduceMotion) {
  document.querySelectorAll('[data-depth]').forEach(el => el.style.transform = '');
  document.querySelectorAll('.gcard').forEach(c => { c.onmousemove = null; c.onmouseleave = null; });
}

// ---- Footer socials (rendered from CONTACT.socials on every page) ----
(function () {
  const el = document.getElementById('footerSocials');
  if (el && typeof CONTACT !== 'undefined') {
    el.innerHTML = CONTACT.socials.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join('');
  }
})();

// ---- Back-to-top button ----
(function () {
  const btn = document.getElementById('toTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 700);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
})();
