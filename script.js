
const qs = (s) => document.querySelector(s);

const CONFIG = {
  videoID: 'Rz5RM_D_XeI',
  weatherURL: 'https://api.weather.gov/gridpoints/GYX/47,32/forecast/hourly',
  phrases: ["Modern UI", "Web Apps", "Cybersecurity", "JavaScript"]
};

let player = null;
const state = { elements: null, ytApiLoaded: false };

/* --- YouTube API --- */
window.onYouTubeIframeAPIReady = () => {
  state.ytApiLoaded = true;
  tryInitIntroPlayer();
};

function openVideoModal() {
  const el = state.elements;
  if (!el?.videoModal) return;

  el.videoModal.style.display = 'flex';
  document.body.classList.add('modal-open');

  if (state.ytApiLoaded) {
    createOrReplacePlayer();
  }
}

function closeVideo() {
  if (player && typeof player.destroy === 'function') {
    player.destroy();
    player = null;
  }

  const el = state.elements;
  if (el?.videoModal) el.videoModal.style.display = 'none';
  document.body.classList.remove('modal-open');
  
  try { localStorage.setItem('intro_seen', 'true'); } catch (e) {}
}

function createOrReplacePlayer() {
  const container = qs('.video-container');
  if (!container) return;

  // Create a fresh placeholder for the API to replace
  container.innerHTML = '<div id="intro-player"></div>';

  player = new YT.Player('intro-player', {
    width: '100%',
    height: '100%',
    videoId: CONFIG.videoID,
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      controls: 1,
      rel: 0,
      fs: 1,
      playsinline: 1
    },
    events: {
      onReady: (event) => {
        const iframe = event.target.getIframe();
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.setAttribute('allow', 'autoplay; fullscreen');
      },
      onStateChange: (e) => {
        if (e.data === 0) closeVideo(); // Close when finished
      }
    }
  });
}

/* --- Initialization Logic --- */
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

  // 1. Weather Fetching
  const fetchWeather = async () => {
    const data = await (async () => {
      try {
        const res = await fetch(CONFIG.weatherURL);
        return res.ok ? await res.json() : null;
      } catch (e) { return null; }
    })();

    const current = data?.properties?.periods?.[0];
    if (elements.temp) elements.temp.textContent = current ? `${current.temperature}°F` : '72°F';
    if (elements.cond) elements.cond.textContent = current ? current.shortForecast : 'Clear';
  };

  // 2. Typewriter Effect
  let pIdx = 0, charIdx = 0, isDeleting = false;
  const type = () => {
    if (!elements.typewriter) return;
    const currentPhrase = CONFIG.phrases[pIdx] || '';
    
    if (!isDeleting) {
      charIdx++;
      elements.typewriter.textContent = currentPhrase.substring(0, charIdx);
      if (charIdx === currentPhrase.length) {
        isDeleting = true;
        setTimeout(type, 2000);
      } else {
        setTimeout(type, 100);
      }
    } else {
      charIdx--;
      elements.typewriter.textContent = currentPhrase.substring(0, charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        pIdx = (pIdx + 1) % CONFIG.phrases.length;
        setTimeout(type, 500);
      } else {
        setTimeout(type, 50);
      }
    }
  };

  // 3. Social Icons
  const injectSocials = () => {
    if (!elements.socialRow) return;
    const links = [
      { id: 'youtube', icon: 'fab fa-youtube', url: 'https://youtube.com/@sirsnoopy', tip: 'YouTube' },
      { id: 'github', icon: 'fab fa-github', url: 'https://github.com/code-andrewy', tip: 'GitHub' },
      { id: 'contact', icon: 'fas fa-envelope', url: 'https://sirsnoopy.pages.dev/contact', tip: 'Contact' }
    ];

    elements.socialRow.innerHTML = links.map(link => `
      <a href="${link.url}" class="social-btn ${link.id}" target="_blank" data-tooltip="${link.tip}" aria-label="${link.tip}">
        <i class="${link.icon}" style="font-size:22px;"></i>
      </a>
    `).join('');
  };

  // 4. Clock
  const updateClock = () => {
    if (elements.time) elements.time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Event Listeners
  elements.videoClose?.addEventListener('click', closeVideo);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeVideo(); });
  
  if (elements.videoModal) {
    elements.videoModal.addEventListener('click', (e) => {
      if (e.target === elements.videoModal) closeVideo();
    });
  }

  // Tilt logic
  elements.container?.addEventListener('pointermove', (e) => {
    if (!elements.card || window.innerWidth <= 768) return;
    const rect = elements.card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    elements.glow?.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    elements.glow?.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    elements.card.style.transform = `rotateX(${(y - rect.height / 2) / 20}deg) rotateY(${(rect.width / 2 - x) / 20}deg)`;
  });

  elements.container?.addEventListener('pointerleave', () => {
    if (elements.card) elements.card.style.transform = `rotateX(0deg) rotateY(0deg)`;
  });

  // Start everything
  updateClock();
  setInterval(updateClock, 1000);
  type();
  fetchWeather();
  injectSocials();
  
  if (!localStorage.getItem('intro_seen')) tryInitIntroPlayer();
};

function tryInitIntroPlayer() {
  if (state.ytApiLoaded && state.elements) openVideoModal();
}

// Bootstrap
if (!document.querySelector('script[src*="iframe_api"]')) {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}
document.addEventListener('DOMContentLoaded', initSnoopyOS);
