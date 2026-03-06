const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

// Element Cache
const elements = {
  card: qs('#tilt-card'),
  container: qs('#tilt-container'),
  menu: qs('#context-menu'),
  glow: qs('#glow'),
  videoModal: qs('#video-modal'),
  playerContainer: qs('#intro-player'),
  typewriter: qs('#typewriter'),
  time: qs('#time'),
  temp: qs('#temp'),
  cond: qs('#cond'),
  // Target the specific flex row for social icons
  socialRow: qs('.social-row') 
};

/* --- 1. MODERN CONTEXT MENU --- */
const toggleContext = (show, x = 0, y = 0) => {
  if (!elements.menu) return;
  if (show) {
    const { offsetWidth: w, offsetHeight: h } = elements.menu;
    const left = Math.min(Math.max(8, x), window.innerWidth - (w || 180) - 8);
    const top = Math.min(Math.max(8, y), window.innerHeight - (h || 120) - 8);
    Object.assign(elements.menu.style, { left: `${left}px`, top: `${top}px`, display: 'block' });
    elements.menu.setAttribute('aria-hidden', 'false');
  } else {
    elements.menu.style.display = 'none';
    elements.menu.setAttribute('aria-hidden', 'true');
  }
};

window.addEventListener('contextmenu', e => {
  e.preventDefault();
  toggleContext(true, e.clientX, e.clientY);
});

/* --- 2. RIPPLE & GLOBAL CLICK --- */
window.addEventListener('click', e => {
  toggleContext(false);
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  Object.assign(ripple.style, { left: `${e.clientX}px`, top: `${e.clientY}px` });
  document.body.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

/* --- 3. HIGH-PERFORMANCE TILT --- */
let state = { rotateX: 0, rotateY: 0, raf: null };
const updateTilt = () => {
  if (elements.card) elements.card.style.transform = `rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`;
  state.raf = null;
};

const handlePointer = (e) => {
  if (!elements.card || window.innerWidth <= 768) return;
  const rect = elements.card.getBoundingClientRect();
  const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
  const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
  elements.glow?.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
  elements.glow?.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
  state.rotateX = (y - rect.height / 2) / 20;
  state.rotateY = (rect.width / 2 - x) / 20;
  if (!state.raf) state.raf = requestAnimationFrame(updateTilt);
};

if (elements.container) {
  elements.container.addEventListener('pointermove', handlePointer, { passive: true });
  elements.container.addEventListener('pointerleave', () => {
    state.rotateX = 0; state.rotateY = 0;
    requestAnimationFrame(updateTilt);
  });
}

/* --- 4. TYPEWRITER & WEATHER --- */
const phrases = ["Modern UI", "Web Apps", "Cybersecurity", "JavaScript"];
let pIdx = 0, charIdx = 0, isDeleting = false;

const type = () => {
  const target = elements.typewriter;
  if (!target) return;
  const currentPhrase = phrases[pIdx];
  target.textContent = currentPhrase.substring(0, charIdx);
  let speed = isDeleting ? 50 : 100;
  if (!isDeleting && charIdx === currentPhrase.length) { isDeleting = true; speed = 2000; }
  else if (isDeleting && charIdx === 0) { isDeleting = false; pIdx = (pIdx + 1) % phrases.length; speed = 500; }
  charIdx += isDeleting ? -1 : 1;
  setTimeout(type, speed);
};

/* --- 5. CONTACT ICON INJECTION --- */
const injectContactIcon = () => {
  if (!elements.socialRow) return;
  
  const contactBtn = document.createElement('a');
  contactBtn.href = 'https://sirsnoopy.pages.dev/contact';
  contactBtn.className = 'social-btn contact';
  contactBtn.target = '_blank';
  contactBtn.title = 'Contact Me'; // Tooltip
  contactBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>`;
  
  elements.socialRow.appendChild(contactBtn);
};

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
  type();
  injectContactIcon();
  setInterval(() => {
    if(elements.time) elements.time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, 1000);
});
