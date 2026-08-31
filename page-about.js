/* ============================================================
   ACSES DKTE — ABOUT PAGE LOGIC
   Existing design/content preserved; portal facts are additive.
============================================================ */

document.getElementById('headerStats').innerHTML = HERO_STATS.map(s => `
  <div><div class="n">${s.value}</div><div class="l">${s.label}</div></div>
`).join('');

document.getElementById('aboutHeading').innerHTML = ABOUT.heading.replace(/\n/g, '<br>');
document.getElementById('aboutParagraphs').innerHTML = [
  ...ABOUT.paragraphs,
  PORTAL_HOME.aboutText
].map(p => `<p>${p}</p>`).join('');
document.getElementById('aboutMission').textContent = ABOUT.mission;
document.getElementById('aboutStats').innerHTML = [
  ...ABOUT.stats,
  { num: PORTAL_HOME.stats[2].value, label: PORTAL_HOME.stats[2].label }
].map((s, i) => `
  <div class="gcard stat-cell reveal3d" style="--rd:${i * 80}ms;"><div class="num">${s.num}</div><div class="lbl">${s.label}</div></div>
`).join('');
document.getElementById('aboutPillars').innerHTML = ABOUT.pillars.map((p, i) => `
  <div class="gcard reveal3d" style="--rd:${i * 80}ms;"><h3>${p.title}</h3><p>${p.desc}</p></div>
`).join('');

document.getElementById('historyTimeline').innerHTML = HISTORY.map((h, i) => `
  <div class="timeline-item reveal3d" style="--rd:${i * 60}ms;">
    <div class="yr">${h.year}</div><h3>${h.title}</h3><p>${h.desc}</p>
  </div>
`).join('');

document.getElementById('achieveGrid').innerHTML = ACHIEVEMENTS.map((a, i) => `
  <div class="gcard stat-cell reveal3d" style="--rd:${i * 70}ms;"><div class="num">${a.num}</div><div class="lbl">${a.label}</div></div>
`).join('');

document.getElementById('partnerRow').innerHTML = PARTNERS.map(p => `<div class="partner-chip">${p}</div>`).join('');

window.observeReveals();
window.attachTiltAll();
if (window.bindHoverTargets) window.bindHoverTargets();
