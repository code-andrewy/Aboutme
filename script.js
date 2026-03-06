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
  socialRow: qs('.social-row') 
};

/* --- 1. YOUTUBE INTRO ENGINE --- */
let player;
const VIDEO_ID = 'Rz5RM_D_XeI';

window.onYouTubeIframeAPIReady = () => {
  const shown = localStorage.getItem('video_shown_v5');
  if (!shown) openVideo();
};

function openVideo() {
  if (!elements.videoModal) return;
  elements.videoModal.style.display = 'flex';
  player = new YT.Player('intro-player', {
    videoId: VIDEO_ID,
    playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
    events: { 
      onStateChange: (e) => { if (e.data === 0) closeVideo(); } 
    }
  });
}

function closeVideo() {
  player?.destroy();
  if (elements.videoModal) elements.videoModal.style.display = 'none';
  localStorage.setItem('video_shown_v5', '1');
}

qs('#video-close')?.addEventListener('click', closeVideo);

/* --- 2. WEATHER ENGINE --- */
const fetchWeather = async () => {
  try {
    const res = await fetch('https://api.weather.gov/gridpoints/GYX/47,32/forecast/hourly');
    const data = await res.json();
    const current = data.properties.periods[0];
    if (elements.temp) elements.temp.textContent = `${current.temperature}°${current.temperatureUnit}`;
    if (elements.cond) elements.cond.textContent = current.shortForecast;
  } catch (e) {
    if (elements.temp) elements.temp.textContent = '72°F';
    if (elements.cond) elements.cond.textContent = 'Sunny';
  }
};

/* --- 3. TYPEWRITER --- */
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

/* --- 4. CONTACT ICON & TOOLTIPS --- */
const injectContactIcon = () => {
  if (!elements.socialRow) return;
  const contactBtn = document.createElement('a');
  contactBtn.href = 'https://sirsnoopy.pages.dev/contact';
  contactBtn.className = 'social-btn contact';
  contactBtn.target = '_blank';
  contactBtn.setAttribute('data-tooltip', 'Contact Me');
  contactBtn.title = 'Contact Me'; 
  contactBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>`;
  elements.socialRow.appendChild(contactBtn);
};

/* --- 5. TILT ENGINE --- */
let state = { rotateX: 0, rotateY: 0, raf: null };
const handlePointer = (e) => {
  if (!elements.card || window.innerWidth <= 768) return;
  const rect = elements.card.getBoundingClientRect();
  const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
  const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
  elements.glow?.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
  elements.glow?.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
  state.rotateX = (y - rect.height / 2) / 20;
  state.rotateY = (rect.width / 2 - x) / 20;
  if (!state.raf) state.raf = requestAnimationFrame(() => {
    elements.card.style.transform = `rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`;
    state.raf = null;
  });
};

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
  type();
  fetchWeather();
  injectContactIcon();
  
  if (elements.container) {
    elements.container.addEventListener('pointermove', handlePointer);
    elements.container.addEventListener('pointerleave', () => {
      elements.card.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });
  }

  setInterval(() => {
    if(elements.time) elements.time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, 1000);
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeVideo();
    if (elements.menu) elements.menu.style.display = 'none';
  }
});
