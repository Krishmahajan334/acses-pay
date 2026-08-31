/* ============================================================
   ACSES DKTE — MEMBERS PAGE LOGIC
   Existing roster/design preserved; portal roster is additive.
============================================================ */

function initials(name) { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }
function photoSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function getMemberPhoto(member) {
  return member.photo || `assets/members/${photoSlug(member.name)}.jpg`;
}

const displayMembers = ALL_MEMBERS;
const displayDepartments = ALL_DEPARTMENTS;

// Wait for DOM to load fully before counting static HTML cards
document.addEventListener('DOMContentLoaded', () => {
    const deptCount = displayDepartments.length - 1; 

    document.getElementById('headerStats').innerHTML = [
      { value: PORTAL_HOME.stats[2].value, label: "Core team" },
      { value: deptCount, label: "Departments" },
      { value: PORTAL_HOME.stats[1].value, label: "Total members" },
    ].map(s => `<div><div class="n">${s.value}</div><div class="l">${s.label}</div></div>`).join('');
});

let deptFilter = 'All';
let query = '';

function filterCards() {
    const q = query.trim().toLowerCase();
    const holoCards = document.querySelectorAll('.holo-card');
    let visibleCount = 0;

    holoCards.forEach(card => {
        const nameEl = card.querySelector('.member-name');
        const titleEl = card.querySelector('.member-title');
        const name = nameEl ? nameEl.textContent.trim() : '';
        const title = titleEl ? titleEl.textContent.trim() : '';
        
        const memberData = displayMembers.find(m => m.name === name);
        const dept = memberData ? memberData.dept : 'Unknown';

        const matchesDept = (deptFilter === 'All' || dept === deptFilter);
        const matchesQuery = !q || name.toLowerCase().includes(q) || title.toLowerCase().includes(q) || dept.toLowerCase().includes(q);

        if (matchesDept && matchesQuery) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    const countEl = document.getElementById('resultCount');
    if (countEl) {
        countEl.textContent = `Showing ${visibleCount} member${visibleCount === 1 ? '' : 's'}`;
    }
}

document.getElementById('memberSearch').addEventListener('input', (e) => { query = e.target.value; filterCards(); });

function renderChips() {
  const el = document.getElementById('deptChips');
  el.innerHTML = displayDepartments.map(d => `<button class="chip ${deptFilter === d ? 'active' : ''}" data-dept="${d}">${d}</button>`).join('');
  el.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => { 
      deptFilter = btn.dataset.dept; 
      renderChips(); 
      filterCards(); 
  }));
}

renderChips();
filterCards();

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
