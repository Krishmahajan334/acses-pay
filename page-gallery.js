/* ============================================================
   ACSES DKTE — GALLERY PAGE LOGIC
   Existing gallery/coverflow/lightbox design preserved; portal photos added.
============================================================ */

const displayGallery = ALL_GALLERY;

function photoTileHTML(g) {
  const imageStyle = g.img
    ? ` style="background-image:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.78)),url('${g.img}');background-size:cover;background-position:center;"`
    : '';
  return `
    <div class="photo-tile tone-${g.tone}"${imageStyle}>
      <svg class="cam" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.6"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.2"/></svg>
      <div class="photo-title">${g.title}</div>
      <div class="photo-meta">${g.category} · ${g.year}</div>
    </div>
  `;
}

document.getElementById('headerStats').innerHTML = [
  { value: displayGallery.length, label: "Photos" },
  { value: new Set(displayGallery.map(g => g.event)).size, label: "Events covered" },
  { value: new Set(displayGallery.map(g => g.category)).size, label: "Categories" },
].map(s => `<div><div class="n">${s.value}</div><div class="l">${s.label}</div></div>`).join('');

(function () {
  const ring = document.getElementById('galleryRing');
  if (!ring) return;
  const items = displayGallery.slice(0, 8);
  const radius = 300;
  const step = 360 / items.length;
  ring.innerHTML = items.map((g, i) => `
    <div class="ring-item" data-index="${i}" style="transform:rotateY(${i * step}deg) translateZ(${radius}px);">
      ${photoTileHTML(g)}
    </div>
  `).join('');

  let angle = 0;
  let autoRotate = true;
  let dragging = false;
  let startX = 0, startAngle = 0;

  function apply() { ring.style.transform = `rotateY(${angle}deg)`; }

  ring.addEventListener('pointerdown', (e) => {
    dragging = true; autoRotate = false;
    startX = e.clientX; startAngle = angle;
    ring.setPointerCapture(e.pointerId);
  });
  ring.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    angle = startAngle + (e.clientX - startX) * 0.35;
    apply();
  });
  function endDrag() { dragging = false; setTimeout(() => { autoRotate = true; }, 2200); }
  ring.addEventListener('pointerup', endDrag);
  ring.addEventListener('pointerleave', () => { if (dragging) endDrag(); });

  ring.querySelectorAll('.ring-item').forEach(el => {
    el.addEventListener('click', () => { if (!dragging) openLightbox(parseInt(el.dataset.index, 10)); });
  });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    (function loop() {
      if (autoRotate) angle += 0.06;
      apply();
      requestAnimationFrame(loop);
    })();
  } else {
    apply();
  }
})();

let activeCategory = 'All';
const categories = ['All', ...Array.from(new Set(displayGallery.map(g => g.category)))];

function renderChips() {
  const el = document.getElementById('galleryChips');
  el.innerHTML = categories.map(c => `<button class="chip ${activeCategory === c ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');
  el.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => { activeCategory = btn.dataset.cat; renderChips(); renderGrid(); }));
}

function renderGrid() {
  const list = displayGallery
    .map((g, i) => ({ ...g, _i: i }))
    .filter(g => activeCategory === 'All' || g.category === activeCategory);
  const el = document.getElementById('photoGrid');
  const countEl = document.getElementById('resultCount');
  countEl.textContent = `${list.length} photo${list.length === 1 ? '' : 's'}`;
  if (!list.length) {
    el.innerHTML = `<div class="empty-state">No photos in this category yet.</div>`;
    return;
  }
  el.innerHTML = list.map((g, i) => `
    <div class="photo-card reveal3d" style="--rd:${i * 40}ms;" data-index="${g._i}">
      ${photoTileHTML(g)}
    </div>
  `).join('');
  el.querySelectorAll('.photo-card').forEach(card => {
    card.addEventListener('click', () => openLightbox(parseInt(card.dataset.index, 10)));
  });
  window.observeReveals();
  if (window.bindHoverTargets) window.bindHoverTargets();
}

let lbIndex = 0;
const lightbox = document.getElementById('lightbox');
const lbFrame = document.getElementById('lightboxFrame');

function renderLightbox() {
  const g = displayGallery[lbIndex];
  lbFrame.innerHTML = photoTileHTML(g);
}
function openLightbox(i) {
  lbIndex = i;
  renderLightbox();
  lightbox.classList.add('open');
  document.body.classList.add('menu-open');
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.classList.remove('menu-open');
}
function stepLightbox(delta) {
  lbIndex = (lbIndex + delta + displayGallery.length) % displayGallery.length;
  renderLightbox();
}
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => stepLightbox(-1));
document.getElementById('lightboxNext').addEventListener('click', () => stepLightbox(1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
window.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') stepLightbox(-1);
  if (e.key === 'ArrowRight') stepLightbox(1);
});

renderChips();
renderGrid();
