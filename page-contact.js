/* ============================================================
   ACSES DKTE — CONTACT PAGE LOGIC
============================================================ */

document.getElementById('headerStats').innerHTML = [
  { value: FAQS.length, label: "FAQs answered" },
  { value: CONTACT.socials.length, label: "Social channels" },
  { value: "< 48h", label: "Typical reply time" },
].map(s => `<div><div class="n">${s.value}</div><div class="l">${s.label}</div></div>`).join('');

document.getElementById('contactAddress').textContent = CONTACT.address;
document.getElementById('contactEmail').textContent = CONTACT.email;
document.getElementById('contactPhone').textContent = CONTACT.phone;
document.getElementById('contactSocials').innerHTML = CONTACT.socials.map(s =>
  `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`
).join('');

// ---- FAQ accordion ----
document.getElementById('faqList').innerHTML = FAQS.map((f, i) => `
  <div class="acc-item reveal3d" style="--rd:${i * 40}ms;">
    <button class="acc-q" aria-expanded="false">${f.q}<span class="plus">+</span></button>
    <div class="acc-a"><p>${f.a}</p></div>
  </div>
`).join('');
document.querySelectorAll('.acc-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.acc-item');
    const answer = item.querySelector('.acc-a');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.acc-item.open').forEach(o => {
      o.classList.remove('open');
      o.querySelector('.acc-a').style.maxHeight = null;
      o.querySelector('.acc-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ---- contact form (no backend — shows an inline confirmation) ----
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  form.reset();
  formNote.textContent = 'Message sent — thanks for reaching out! We usually reply within two days.';
  formNote.style.color = 'var(--circuit)';
});

window.observeReveals();
