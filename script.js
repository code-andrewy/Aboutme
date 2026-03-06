/**
 * GEMINI-OPTIMIZED FULL JS
 * Features: Intro Modal, Weather, Typewriter, Tilt, Tooltips.
 */

const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

/* --- 1. GLOBAL STATE & CONFIG --- */
const CONFIG = {
  videoID: 'Rz5RM_D_XeI',
  weatherURL: 'https://api.weather.gov/gridpoints/GYX/47,32/forecast/hourly',
  phrases: ["Modern UI", "Web Apps", "Cybersecurity", "JavaScript"]
};

let player; // YouTube Player instance

/* --- 2. THE CORE ENGINE --- */
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
    glow: qs('#glow')
  };

  /* --- A. WEATHER LOGIC --- */
  const fetchWeather = async () => {
    try {
      const res = await fetch(CONFIG.weatherURL);
      const data = await res.json();
      const current = data.properties.periods[0];
      if (elements.temp) elements.temp.textContent = `${current.temperature}°F`;
      if (elements.cond) elements.cond.textContent = current.shortForecast;
    } catch (e) {
      if (elements.temp) elements.temp.textContent = '72°F'; // Fallback
      if (elements.cond) elements.cond.textContent = 'Clear Skies';
    }
  };

  /* --- B. TYPEWRITER LOGIC --- */
  let pIdx = 0, charIdx = 0, isDeleting = false;
  const type = () => {
    const target = elements.typewriter;
    if (!target) return;

    const currentPhrase = CONFIG.phrases[pIdx];
    target.textContent = currentPhrase.substring(0, charIdx);

    let speed = isDeleting ? 50 : 100;

    if (!isDeleting && charIdx === currentPhrase.length) {
      isDeleting = true;
      speed = 2000; // Pause at end
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      pIdx = (pIdx + 1) % CONFIG.phrases.length;
      speed = 500;
    }

    charIdx += isDeleting ? -1 : 1;
    setTimeout(type, speed);
  };

  /* --- C. INTRO VIDEO LOGIC --- */
  const closeVideo = () => {
    player?.destroy();
    if (elements.videoModal) elements.videoModal.style.display = 'none';
    localStorage.setItem('intro_seen_v6', 'true');
  };

  // Global YouTube API callback
  window.onYouTubeIframeAPIReady = () => {
    if (localStorage.getItem('intro_seen_v6')) return;
    
    if (elements.videoModal) {
      elements.videoModal.style.display = 'flex';
      player = new YT.Player('intro-player', {
        videoId: CONFIG.videoID,
        playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
        events: { onStateChange: (e) => { if (e.data === 0) closeVideo(); } }
      });
    }
  };

  qs('#video-close')?.addEventListener('click', closeVideo);

  /* --- D. CONTACT ICON INJECTION --- */
  const injectContact = () => {
    if (!elements.socialRow || qs('.contact-injected')) return;
    
    const contactBtn = document.createElement('a');
    contactBtn.href = 'https://sirsnoopy.pages.dev/contact';
    contactBtn.className = 'social-btn contact-injected';
    contactBtn.target = '_blank';
    contactBtn.setAttribute('data-tooltip', 'Contact Me'); // For tooltips
    contactBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>`;
    elements.socialRow.appendChild(contactBtn);
  };

  /* --- E. TILT & GLOW LOGIC --- */
  const handlePointer = (e) => {
    if (!elements.card || window.innerWidth <= 768) return;
    
    const rect = elements.card.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
    
    // Mouse Glow
    elements.glow?.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    elements.glow?.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    
    // Tilt Calculation
    const rotateX = (y - rect.height / 2) / 20;
    const rotateY = (rect.width / 2 - x) / 20;
    elements.card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const resetTilt = () => {
    if (elements.card) {
      elements.card.style.transform = `rotateX(0deg) rotateY(0deg)`;
    }
  };

  /* --- 3. EVENT LISTENERS --- */
  if (elements.container) {
    elements.container.addEventListener('pointermove', handlePointer);
    elements.container.addEventListener('pointerleave', resetTilt);
  }

  // Live Clock
  setInterval(() => {
    if(elements.time) {
      elements.time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }, 1000);

  // Run initial tasks
  type();
  fetchWeather();
  injectContact();
};

/* --- 4. BOOTSTRAP --- */
// Load YouTube API Script
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSnoopyOS);
} else {
  initSnoopyOS();
}
