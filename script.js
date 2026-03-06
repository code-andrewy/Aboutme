/**
 * GEMINI-OPTIMIZED FULL JS (v8)
 * Features: Font Awesome icons, robust YouTube init, tooltip injection, safer event handling
 */

const qs = (s) => document.querySelector(s);

const CONFIG = {
  videoID: 'Rz5RM_D_XeI',
  weatherURL: 'https://api.weather.gov/gridpoints/GYX/47,32/forecast/hourly',
  phrases: ["Modern UI", "Web Apps", "Cybersecurity", "JavaScript"]
};

let player = null;
const state = { elements: null, ytApiLoaded: false };

/* --- Global YouTube API callback (robust) --- */
window.onYouTubeIframeAPIReady = () => {
  state.ytApiLoaded = true;
  tryInitIntroPlayer();
};

function tryInitIntroPlayer() {
  const el = state.elements;
  if (!el) return;
  if (localStorage.getItem('intro_seen')) return;
  if (!state.ytApiLoaded) return;
  if (!el.videoModal) return;

  el.videoModal.style.display = 'flex';
  if (player) {
    try { player.destroy(); } catch (e) { /* ignore */ }
  }
  player = new YT.Player('intro-player', {
    videoId: CONFIG.videoID,
    playerVars: { autoplay: 1, modestbranding: 1 },
    events: { onStateChange: (e) => { if (e.data === 0) closeVideo(); } }
  });
}

/* --- Utility: safe fetch json with fallback --- */
async function safeFetchJson(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error('Fetch failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}

/* --- Main init --- */
const initSnoopyOS = () => {
  const elements = {
    card: qs('#tilt-card'),
    container: qs('#tilt-container'),
    videoModal: qs('#video-modal'),
    typewriter: qs('#typewriter'),
    socialRow: qs('.social-row'),
    time: qs('#time'),
    temp: qs('#temp'),
    cond: qs('#cond'),
    glow: qs('#glow'),
    videoClose: qs('#video-close')
  };

  state.elements = elements;

  /* --- A. SOCIAL BUTTON INJECTION (Font Awesome) --- */
  const injectSocials = () => {
    if (!elements.socialRow) return;
    elements.socialRow.innerHTML = ''; // Clear existing to prevent duplicates

    const links = [
      { id: 'youtube', icon: 'fab fa-youtube', url: 'https://youtube.com/@sirsnoopy', tip: 'Watch on YouTube', active: true },
      { id: 'github', icon: 'fab fa-github', url: 'https://github.com/code-andrewy', tip: 'View GitHub', active: true },
      { id: 'discord', icon: 'fab fa-discord', url: '#', tip: 'Discord Disabled', active: false },
      { id: 'contact', icon: 'fas fa-envelope', url: 'https://sirsnoopy.pages.dev/contact', tip: 'Email Me', active: true }
    ];

    links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.className = `social-btn ${link.id} ${!link.active ? 'disabled' : ''}`;
      if (link.active) a.target = '_blank';
      a.setAttribute('data-tooltip', link.tip);
      a.setAttribute('aria-label', link.tip);

      // Insert Font Awesome <i> icon and visually-match previous SVG size
      a.innerHTML = `<i class="${link.icon}" style="font-size:22px; line-height:1;" aria-hidden="true"></i>`;

      if (!link.active) {
        a.addEventListener('click', (e) => e.preventDefault());
        a.setAttribute('aria-disabled', 'true');
      }

      elements.socialRow.appendChild(a);
    });
  };

  /* --- B. WEATHER & TYPEWRITER --- */
  const fetchWeather = async () => {
    const data = await safeFetchJson(CONFIG.weatherURL);
    try {
      // NWS hourly gridpoints sometimes uses properties.periods
      const current = data?.properties?.periods?.[0] ?? null;
      if (current) {
        if (elements.temp) elements.temp.textContent = `${current.temperature}°F`;
        if (elements.cond) elements.cond.textContent = current.shortForecast;
      } else {
        // fallback
        if (elements.temp) elements.temp.textContent = '72°F';
        if (elements.cond) elements.cond.textContent = 'Clear';
      }
    } catch (e) {
      if (elements.temp) elements.temp.textContent = '72°F';
      if (elements.cond) elements.cond.textContent = 'Clear';
    }
  };

  // Typewriter state local to init
  let pIdx = 0, charIdx = 0, isDeleting = false;
  const type = () => {
    const target = elements.typewriter;
    if (!target) return;
    const currentPhrase = CONFIG.phrases[pIdx] || '';
    if (!isDeleting) {
      charIdx = Math.min(charIdx + 1, currentPhrase.length);
      target.textContent = currentPhrase.substring(0, charIdx);
      if (charIdx === currentPhrase.length) {
        isDeleting = true;
        setTimeout(type, 2000);
        return;
      }
      setTimeout(type, 100);
    } else {
      charIdx = Math.max(charIdx - 1, 0);
      target.textContent = currentPhrase.substring(0, charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        pIdx = (pIdx + 1) % CONFIG.phrases.length;
        setTimeout(type, 500);
        return;
      }
      setTimeout(type, 50);
    }
  };

  /* --- C. INTRO MODAL --- */
  const closeVideo = () => {
    try { player?.destroy(); } catch (e) { /* ignore */ }
    player = null;
    if (elements.videoModal) elements.videoModal.style.display = 'none';
    localStorage.setItem('intro_seen', 'true');
  };

  // safe attach click
  elements.videoClose?.addEventListener('click', closeVideo);

  /* --- D. TILT & CLOCK --- */
  const handlePointer = (e) => {
    if (!elements.card || window.innerWidth <= 768) return;
    const rect = elements.card.getBoundingClientRect();
    const clientX = (e.clientX ?? e.touches?.[0]?.clientX);
    const clientY = (e.clientY ?? e.touches?.[0]?.clientY);
    if (clientX == null || clientY == null) return;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const mouseX = (x / rect.width) * 100;
    const mouseY = (y / rect.height) * 100;
    elements.glow?.style.setProperty('--mouse-x', `${mouseX}%`);
    elements.glow?.style.setProperty('--mouse-y', `${mouseY}%`);
    elements.card.style.transform = `rotateX(${(y - rect.height / 2) / 20}deg) rotateY(${(rect.width / 2 - x) / 20}deg)`;
  };

  if (elements.container) {
    elements.container.addEventListener('pointermove', handlePointer);
    elements.container.addEventListener('pointerleave', () => {
      if (elements.card) elements.card.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });
  }

  // Clock: set immediately and then every second
  const updateClock = () => {
    if (elements.time) elements.time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  updateClock();
  setInterval(updateClock, 1000);

  // Start behaviors
  type();
  fetchWeather();
  injectSocials();

  // If YouTube API already loaded before DOMContentLoaded, try init now
  tryInitIntroPlayer();
};

/* --- Bootstrap: insert YouTube API tag then init on DOMContentLoaded --- */
(function bootstrap() {
  // Insert YouTube API script (if not already present)
  if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  } else {
    // If script was already loaded, set flag (it may still call onYouTubeIframeAPIReady)
    // We cannot reliably detect if API is ready without callback, so keep default behavior.
  }

  document.addEventListener('DOMContentLoaded', initSnoopyOS);
})();
