/* ============================================================
   NAV — scroll effect & mobile menu
============================================================ */
const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
    burger.setAttribute('aria-expanded', false);
  });
});

/* ============================================================
   TOGGLE — Industrial / Startup
============================================================ */
const toggle   = document.getElementById('mainToggle');
const pill     = document.getElementById('togglePill');
const tabInd   = document.getElementById('tab-ind');
const tabSta   = document.getElementById('tab-sta');
const panelInd = document.getElementById('panel-ind');
const panelSta = document.getElementById('panel-sta');

let currentMode = 'industrial';

function setTogglePill(mode) {
  const activeBtn = mode === 'industrial' ? tabInd : tabSta;
  const btnRect   = activeBtn.getBoundingClientRect();
  const wrapRect  = toggle.getBoundingClientRect();

  pill.style.width  = btnRect.width + 'px';
  pill.style.transform = `translateX(${btnRect.left - wrapRect.left - 5}px)`;
  pill.className = 'toggle-pill ' + (mode === 'industrial' ? 'mode-ind' : 'mode-sta');
}

function switchMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  const fromPanel = mode === 'industrial' ? panelSta : panelInd;
  const toPanel   = mode === 'industrial' ? panelInd : panelSta;

  // Update tab buttons
  tabInd.classList.toggle('active', mode === 'industrial');
  tabSta.classList.toggle('active', mode === 'startup');
  tabInd.setAttribute('aria-selected', mode === 'industrial');
  tabSta.setAttribute('aria-selected', mode === 'startup');

  // Slide the pill
  setTogglePill(mode);

  // Swap panels with animation
  fromPanel.classList.add('hidden');
  fromPanel.classList.remove('entering');

  toPanel.classList.remove('hidden');
  // Trigger reflow so animation restarts
  void toPanel.offsetWidth;
  toPanel.classList.add('entering');

  // Re-observe reveal elements in the new panel
  toPanel.querySelectorAll('.svc-card, .pain-card, .rm').forEach(el => {
    el.classList.remove('reveal', 'visible');
    revealObserver.observe(el);
  });

  // Re-observe service cards luminosity in the new panel
  toPanel.querySelectorAll('.svc-service-card').forEach(card => {
    card.classList.remove('svc-lit');
    svcLitObserver.observe(card);
  });
}

// Init pill position after layout
window.addEventListener('load', () => {
  setTogglePill('industrial');
});
window.addEventListener('resize', () => {
  setTogglePill(currentMode);
});

// Toggle button clicks
toggle.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => switchMode(btn.dataset.target));
});

// Bridge "See Solutions" links
document.querySelectorAll('.bridge__link[data-goto]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchMode(link.dataset.goto);
    document.getElementById('solutions').scrollIntoView({ behavior: 'smooth' });
  });
});

/* ============================================================
   SCROLL REVEAL
============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('reveal', 'visible');
      }, i * 70);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll(
  '.svc-card, .pain-card, .result-card, .testi-card, .process__step, .bridge__card, .journey__step'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ============================================================
   SERVICE CARDS — scroll luminosity + click
============================================================ */
const svcLitObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('svc-lit');
    } else {
      entry.target.classList.remove('svc-lit');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px 0px 0px' });

document.querySelectorAll('.svc-service-card').forEach(card => {
  svcLitObserver.observe(card);
  card.addEventListener('click', () => {
    const service  = card.dataset.service  || card.querySelector('h3')?.textContent.trim();
    const mode     = card.dataset.mode     || '';
    const delivery = card.dataset.delivery || '';
    // Dispatch custom event — backend modal will listen to this
    document.dispatchEvent(new CustomEvent('serviceSelected', {
      detail: { service, mode, delivery }
    }));
  });
});

/* ============================================================
   CONTACT FORM
============================================================ */
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = '✓ Sent — we\'ll be in touch within 2 hours!';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    e.target.reset();
    setTimeout(() => {
      btn.textContent = 'Send My Request →';
      btn.style.background = '';
      btn.disabled = false;
    }, 5000);
  }, 1200);
});

/* ============================================================
   SMOOTH SCROLL (anchors)
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});
