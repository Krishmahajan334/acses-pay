/* ============================================================
   ACSES DKTE — HOME PAGE LOGIC
   Existing home design preserved; portal event/gallery data are additive.
============================================================ */

/* Portal-inspired hero photo rotation — home hero only. */
const HERO_TEAM_PHOTOS = [
  { src: "assets/portal/images/team_img.jpg", alt: "ACSES team group photo" },
  { src: "https://i.postimg.cc/MpPmG4tr/Inoguration.jpg", alt: "ACSES community at inauguration" },
  { src: "https://i.postimg.cc/hGy6cXWN/Freshers.jpg", alt: "ACSES students at freshers event" },
  { src: "https://i.postimg.cc/ZYxxtQGG/Whats-App-Image-2025-09-18-at-11-52-30-AM.jpg", alt: "ACSES student community" }
];

(function initPortalHeroSlideshow(){
  const host = document.getElementById('heroSlideshowPortal');
  const indexEl = document.getElementById('heroPhotoIndex');
  const frame = document.getElementById('heroPhotoFrame');
  const visual = document.getElementById('heroVisualPortal');
  if (!host) return;

  host.innerHTML = HERO_TEAM_PHOTOS.map((photo, i) =>
    `<img src="${photo.src}" alt="${photo.alt}" class="hero-slide-portal${i === 0 ? ' active' : ''}" loading="${i === 0 ? 'eager' : 'lazy'}" />`
  ).join('');

  const slides = [...host.querySelectorAll('.hero-slide-portal')];
  let current = 0;
  let timer = null;

  const show = (next) => {
    current = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    if (indexEl) indexEl.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  };

  const start = () => {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), 4200);
  };
  start();

  if (frame && window.matchMedia('(hover:hover)').matches) {
    frame.addEventListener('pointermove', (e) => {
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      frame.style.transform = `rotateY(${x * 5}deg) rotateX(${y * -4}deg) translateZ(18px)`;
    });
    frame.addEventListener('pointerleave', () => {
      frame.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(18px)';
    });
  }

  if (visual && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let px = 0, py = 0, tx = 0, ty = 0;
    visual.addEventListener('pointermove', (e) => {
      const r = visual.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width - .5);
      py = ((e.clientY - r.top) / r.height - .5);
    }, { passive: true });
    const tick = () => {
      tx += (px - tx) * .04;
      ty += (py - ty) * .04;
      visual.style.transform = `translate3d(${tx * 8}px, ${ty * 6}px, 0)`;
      requestAnimationFrame(tick);
    };
    tick();
  }
})();

document.getElementById('newsTicker').innerHTML =
  [...NEWS, "The Pirate’s Gambit — 01-OCT-2k25", ...NEWS].map(n => `<span>${n}</span>`).join('');

document.getElementById('aboutTeaserHeading').innerHTML = ABOUT.heading.replace(/\n/g, '<br>');
document.getElementById('aboutTeaserPara').textContent = ABOUT.paragraphs[0];
document.getElementById('aboutTeaserMission').textContent = ABOUT.mission;
document.getElementById('aboutTeaserStats').innerHTML = [
  ...ABOUT.stats,
  { num: PORTAL_HOME.stats[2].value, label: PORTAL_HOME.stats[2].label }
].map((s, i) => `
  <div class="gcard stat-cell reveal3d" style="--rd:${i * 80}ms;"><div class="num">${s.num}</div><div class="lbl">${s.label}</div></div>
`).join('');

document.getElementById('benefitGrid').innerHTML = BENEFITS.map((b, i) => `
  <div class="gcard benefit reveal3d" style="--rd:${i * 70}ms;">
    <span class="tag">${b.tag}</span><h3>${b.title}</h3><p>${b.desc}</p>
  </div>
`).join('');

const upcoming = ALL_EVENTS.filter(e => e.status === 'upcoming').slice(0, 3);
document.getElementById('eventsPreview').innerHTML = upcoming.map((e, i) => `
  <div class="gcard reveal3d" style="--rd:${i * 80}ms;">
    <span class="tag" style="font-family:var(--mono); font-size:10.5px; color:var(--circuit); display:block; margin-bottom:10px;">${e.category} · ${e.date}</span>
    <h3 style="font-size:16px; margin-bottom:8px;">${e.desc}</h3>
    <p style="font-family:var(--body); font-size:13px; color:var(--ink-dim);">Upcoming — see full details and how to register.</p>
  </div>
`).join('');

document.getElementById('galleryPreview').innerHTML = ALL_GALLERY.slice(0, 4).map((g, i) => {
  const style = g.img ? ` style="background-image:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.78)),url('${g.img}');background-size:cover;background-position:center;"` : '';
  return `
    <div class="photo-card reveal3d tone-${g.tone}" style="--rd:${i * 60}ms;">
      <div class="photo-tile"${style}>
        <svg class="cam" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.2"/></svg>
        <div class="photo-title">${g.title}</div>
        <div class="photo-meta">${g.category} · ${g.year}</div>
      </div>
    </div>
  `;
}).join('');

document.getElementById('achieveGrid').innerHTML = ACHIEVEMENTS.map((a, i) => `
  <div class="gcard stat-cell reveal3d" style="--rd:${i * 70}ms;"><div class="num">${a.num}</div><div class="lbl">${a.label}</div></div>
`).join('');

document.getElementById('partnerRow').innerHTML = PARTNERS.map(p => `<div class="partner-chip">${p}</div>`).join('');

(function () {
  const track = document.getElementById('tTrack');
  const nav = document.getElementById('tNav');
  if (!track) return;
  track.innerHTML = TESTIMONIALS.map(t => `
    <div class="tcard"><blockquote>"${t.quote}"</blockquote><div class="who">${t.name} — ${t.role}</div></div>
  `).join('');
  nav.innerHTML = TESTIMONIALS.map((_, i) => `<button class="tdot ${i === 0 ? 'active' : ''}" data-i="${i}" aria-label="Testimonial ${i + 1}"></button>`).join('');
  let idx = 0;
  function show(i) {
    idx = (i + TESTIMONIALS.length) % TESTIMONIALS.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    nav.querySelectorAll('.tdot').forEach((d, di) => d.classList.toggle('active', di === idx));
  }
  nav.querySelectorAll('.tdot').forEach(d => d.addEventListener('click', () => show(parseInt(d.dataset.i, 10))));
  let auto = setInterval(() => show(idx + 1), 6000);
  track.parentElement.addEventListener('mouseenter', () => clearInterval(auto));
  track.parentElement.addEventListener('mouseleave', () => { auto = setInterval(() => show(idx + 1), 6000); });
})();

window.observeReveals();
window.attachTiltAll();
if (window.bindHoverTargets) window.bindHoverTargets();


function initPopOutAnimations() {
    const holoCards = document.querySelectorAll('.holo-card');
    if (!holoCards.length) return;
    
    const checkCenterCard = () => {
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            holoCards.forEach(card => card.classList.remove('pop-active'));
            return;
        }

        const viewportCenter = window.innerHeight / 2;
        let minDistance = Infinity;

        holoCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
                const cardCenter = rect.top + (rect.height / 2);
                const distance = Math.abs(viewportCenter - cardCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                }
            }
        });

        holoCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
                const cardCenter = rect.top + (rect.height / 2);
                const distance = Math.abs(viewportCenter - cardCenter);
                if (Math.abs(distance - minDistance) < 10) {
                    card.classList.add('pop-active');
                } else {
                    card.classList.remove('pop-active');
                }
            } else {
                card.classList.remove('pop-active');
            }
        });
    };

    window.addEventListener('scroll', checkCenterCard, { passive: true });
    window.addEventListener('touchmove', checkCenterCard, { passive: true });
    window.addEventListener('resize', checkCenterCard, { passive: true });
    setTimeout(checkCenterCard, 100); 
}
initPopOutAnimations();


async function loadTeamPreview() {
    const container = document.getElementById('dynamicTeamPreview');
    if (!container) return;

    let html = '';
    let success = false;

    try {
        const response = await fetch('members.html');
        if (response.ok) {
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const cards = doc.querySelectorAll('.holo-card');
            
            if (cards.length >= 2) {
                for (let i = 0; i < 2; i++) {
                    const clone = cards[i].cloneNode(true);
                    clone.classList.add('reveal3d');
                    clone.style.setProperty('--rd', `${i * 100}ms`);
                    html += clone.outerHTML;
                }
                success = true;
            }
        }
    } catch (e) {
        console.warn("CORS fetch failed (likely running via file://). Using fallback cards.");
    }

    // Fallback if fetch fails (e.g., opened via file:// protocol without a server)
    if (!success) {
        html = `
        <div class="holo-card card-amber-president reveal3d" style="--rd:0ms;">
            <div class="holo-avatar-box ring-amber">
                <img loading="lazy" src="assets/members/krish-mahajan.png" alt="Krish Mahajan" style="object-position: top;">
                <div class="radar-ring amber"></div>
            </div>
            <h3 class="member-name">Krish Mahajan</h3>
            <span class="member-title">President</span>
            <div class="social-bar">
                <a href="https://in.linkedin.com/in/krish-mahajan-617b50206" target="_blank" rel="noopener" class="s-icon"><i class="fa-brands fa-linkedin"></i></a>
                <a href="https://github.com/Krishmahajan334" target="_blank" rel="noopener" class="s-icon"><i class="fa-brands fa-github"></i></a>
                <a href="https://www.krishmahajan.dev/" target="_blank" rel="noopener" class="s-icon"><i class="fa-solid fa-globe"></i></a>
            </div>
        </div>
        <div class="holo-card card-blue-vp reveal3d" style="--rd:100ms;">
            <div class="holo-avatar-box ring-blue">
                <img loading="lazy" src="assets/members/gomtesh-patil.png" alt="Gomtesh Patil" style="object-position: top;">
                <div class="radar-ring blue"></div>
            </div>
            <h3 class="member-name">Gomtesh Patil</h3>
            <span class="member-title">Vice President</span>
            <div class="social-bar">
                <a href="#" class="s-icon"><i class="fa-brands fa-linkedin"></i></a>
                <a href="#" class="s-icon"><i class="fa-brands fa-github"></i></a>
                <a href="#" class="s-icon"><i class="fa-solid fa-envelope"></i></a>
            </div>
        </div>
        `;
    }

    // Add explore card
    html += `
    <a href="members.html" class="holo-card reveal3d" style="--rd:200ms; display: flex; flex-direction: column; justify-content: center; align-items: center; text-decoration: none; min-height: 320px; border-style: dashed; border-color: var(--line);">
        <div class="holo-avatar-box" style="margin-bottom: 24px; background: transparent;">
            <div class="radar-ring" style="border-color: var(--ink-dim); inset: 0;"></div>
            <i class="fa-solid fa-arrow-right" style="font-size: 32px; color: var(--ink-dim); position: relative; z-index: 2;"></i>
        </div>
        <h3 class="member-name" style="color: var(--ink); text-align: center;">Explore Team</h3>
        <span class="member-title" style="text-align: center;">View all core members →</span>
    </a>
    `;

    container.innerHTML = html;
    
    // Re-bind animations for newly injected DOM elements
    if (window.observeReveals) window.observeReveals();
    if (window.initPopOutAnimations) window.initPopOutAnimations();
}
loadTeamPreview();
