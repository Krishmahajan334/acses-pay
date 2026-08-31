/* ============================================================
   ACSES DKTE — EVENTS PAGE LOGIC
   Existing event list/design preserved; portal events are additive.
============================================================ */

const displayEvents = ALL_EVENTS;

document.getElementById('headerStats').innerHTML = [
  { value: displayEvents.filter(e => e.status === 'upcoming').length, label: "Upcoming" },
  { value: displayEvents.filter(e => e.status === 'past').length, label: "Past" },
  { value: new Set(displayEvents.map(e => e.category)).size, label: "Categories" },
].map(s => `<div><div class="n">${s.value}</div><div class="l">${s.label}</div></div>`).join('');

let statusFilter = 'all';
let categoryFilter = 'All';

const categories = ['All', ...Array.from(new Set(displayEvents.map(e => e.category)))];

function renderStatusTabs() {
  const el = document.getElementById('statusTabs');
  const tabs = [['all', 'All'], ['upcoming', 'Upcoming'], ['past', 'Past']];
  el.innerHTML = tabs.map(([key, label]) => `<button class="chip ${statusFilter === key ? 'active' : ''}" data-status="${key}">${label}</button>`).join('');
  el.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => { statusFilter = btn.dataset.status; renderStatusTabs(); renderList(); }));
}

function renderCategoryChips() {
  const el = document.getElementById('categoryChips');
  el.innerHTML = categories.map(c => `<button class="chip ${categoryFilter === c ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');
  el.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => { categoryFilter = btn.dataset.cat; renderCategoryChips(); renderList(); }));
}

function portalDetails(e) {
  const match = PORTAL_PAST_EVENTS.find(p => p.title === e.desc.split(' — ')[0]);
  if (!match) return '';
  return `<br><span style="font-family:var(--body); font-size:12px; color:var(--ink-dim);">${match.fullDescription}</span><br><span style="font-family:var(--mono); font-size:10.5px; color:var(--ink-dim);">Highlights: ${match.highlights.join(' · ')}</span>`;
}

function renderList() {
  const list = displayEvents.filter(e =>
    (statusFilter === 'all' || e.status === statusFilter) &&
    (categoryFilter === 'All' || e.category === categoryFilter)
  );
  const el = document.getElementById('eventsList');
  const countEl = document.getElementById('resultCount');
  countEl.textContent = `${list.length} event${list.length === 1 ? '' : 's'}`;
  if (!list.length) {
    el.innerHTML = `<div class="empty-state">No events match those filters yet — try a different combination.</div>`;
    return;
  }
  el.innerHTML = list.map((e, i) => `
    <div class="measure-row reveal3d" style="--rd:${i * 50}ms;">
      <span class="tick">${e.tick}</span>
      <span class="desc">${e.desc}<br><span style="font-family:var(--mono); font-size:10.5px; color:var(--ink-dim);">${e.category} · ${e.date}</span>${portalDetails(e)}</span>
      <span class="status ${e.status === 'upcoming' ? 'status-up' : 'status-past'}">${e.status === 'upcoming' ? 'Upcoming' : 'Past'}</span>
    </div>
  `).join('');
  window.observeReveals();
}

renderStatusTabs();
renderCategoryChips();
renderList();
