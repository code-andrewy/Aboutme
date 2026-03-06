/**
Stop looking at my code :(
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
  // attempt to init (this will open the intro modal if conditions met)
  tryInitIntroPlayer();
};

/* --- Create / ensure #intro-player exists inside .video-container --- */
function ensureIntroPlayerElement(containerEl) {
  if (!containerEl) return null;
  let playerEl = containerEl.querySelector('#intro-player');
  if (!playerEl) {
    playerEl = document.createElement('div');
    playerEl.id = 'intro-player';
    // make sure the created div doesn't inherit layout constraints
    playerEl.style.width = '100%';
    playerEl.style.height = '100%';
    playerEl.style.display = 'block';
    // if you want the play button center placeholder, you could add it here.
    containerEl.appendChild(playerEl);
  }
  return playerEl;
}

/* --- Open / Close Video Modal helpers --- */
function openVideoModal() {
  const el = state.elements;
  if (!el || !el.videoModal) return;
  // ensure DOM structure
  const vc = qs('.video-container') || el.videoModal.querySelector('.video-container');
  if (vc) ensureIntroPlayerElement(vc);

  // show modal
  el.videoModal.style.display = 'flex';
  // prevent background scroll
  document.body.classList.add('modal-open');

  // init player only when API ready
  if (state.ytApiLoaded) {
    createOrReplacePlayer();
  } else {
    // If API hasn't loaded yet, it will call onYouTubeIframeAPIReady later which calls tryInitIntroPlayer().
  }
}

function closeVideo() {
  try {
    if (player && typeof player.destroy === 'function') {
      player.destroy();
    }
  } catch (err) {
    // ignore destroy errors
  }
  player = null;

  const el = state.elements;
  if (el?.videoModal) {
    el.videoModal.style.display = 'none';
  }
  document.body.classList.remove('modal-open');
  // mark seen so it won't auto-open again (keeps previous behavior)
  try { localStorage.setItem('intro_seen', 'true'); } catch (e) { /* ignore */ }
}

/* --- Resize helper to keep iframe full-viewport --- */
function applyIframeFullViewportStyles(iframe) {
  if (!iframe) return;
  // positioning fixed so it always covers the screen even if .video-container shifts
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.maxWidth = '100vw';
  iframe.style.maxHeight = '100vh';
  iframe.style.border = '0';
  iframe.style.margin = '0';
  iframe.style.padding = '0';
  iframe.setAttribute('allowfullscreen', ''); // ensure fullscreen allowed
  // Some players behave better with these allow attributes:
  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
}

/* --- Create or re-create the YT.Player sized to viewport --- */
function createOrReplacePlayer() {
  const el = state.elements;
  if (!el) return;

  // ensure container & player element exist
  const container = qs('.video-container') || el.videoModal.querySelector('.video-container');
  if (!container) return;
  const playerHolder = ensureIntroPlayerElement(container);
  if (!playerHolder) return;

  // destroy old instance
  try { if (player && typeof player.destroy === 'function') player.destroy(); } catch (e) { /* ignore */ }
  player = null;

  // create new player
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
        try {
          const iframe = event.target.getIframe();
          applyIframeFullViewportStyles(iframe);

          // Defensive: ensure iframe is appended to body so it's definitely full-bleed.
          // We keep the #intro-player element inside .video-container to preserve semantics,
          // but move the iframe node to body to avoid any parent stacking context clipping.
          // This also keeps the close button easily above the iframe.
          const curIframe = iframe;
          if (curIframe && curIframe.parentElement && curIframe.parentElement !== document.body) {
            // create a portal wrapper to hold iframe in the body while keeping the placeholder in the container
            // We'll move the iframe to body and keep a reference on the placeholder so destroy works correctly.
            try {
              // Keep a lightweight portal wrapper so styles remain consistent.
              curIframe.style.zIndex = 20000;
              document.body.appendChild(curIframe);
            } catch (e) {
              // fallback: if moving fails, we already applied full viewport styles so the iframe should fill anyway.
            }
          }
        } catch (e) {
          // ignore styling failures
        }
      },
      onStateChange: (e) => {
        // 0 = ended — close video
        if (e.data === 0) {
          closeVideo();
        }
      }
    }
  });
}

/* --- Try to initialize intro player (called from YT callback or init) --- */
function tryInitIntroPlayer() {
  const el = state.elements;
  if (!el) return;
  // If user already saw it, don't auto-open
  try {
    if (localStorage.getItem('intro_seen')) return;
  } catch (e) {
    // localStorage may be blocked — ignore and attempt to open
  }

  // prefer to show the modal and create the player if API ready
  if (!state.ytApiLoaded) return; // will be called again via onYouTubeIframeAPIReady

  // show modal and create player sized to viewport
  openVideoModal();
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
      { id: 'youtube', icon: 'fab fa-youtube', url: 'https://youtube.com/@sirsnoopy', tip: 'My YouTube channel', active: true },
      { id: 'github', icon: 'fab fa-github', url: 'https://github.com/code-andrewy', tip: 'View my GitHub', active: true },
      { id: 'contact', icon: 'fas fa-envelope', url: 'https://sirsnoopy.pages.dev/contact', tip: 'Contact Me', active: true }
    ];

    links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.className = `social-btn ${link.id} ${!link.active ? 'disabled' : ''}`;
      if (link.active) a.target = '_blank';
      a.setAttribute('data-tooltip', link.tip);
      a.setAttribute('aria-label', link.tip);

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
      const current = data?.properties?.periods?.[0] ?? null;
      if (current) {
        if (elements.temp) elements.temp.textContent = `${current.temperature}°F`;
        if (elements.cond) elements.cond.textContent = current.shortForecast;
      } else {
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

  /* --- C. INTRO MODAL (w/ close handling) --- */
  // Close logic (attached safely)
  const closeVideoSafe = (ev) => {
    ev?.preventDefault?.();
    closeVideo();
  };

  // click handler for close button
  elements.videoClose?.addEventListener('click', closeVideoSafe);

  // click outside the actual content closes the modal (only if clicking the modal backdrop)
  if (elements.videoModal) {
    elements.videoModal.addEventListener('click', (ev) => {
      // if click target is the backdrop itself (videoModal), close
      if (ev.target === elements.videoModal) {
        closeVideo();
      }
    }, { passive: true });
  }

  // ESC key closes
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      // only close if modal is visible
      if (elements.videoModal && elements.videoModal.style.display !== 'none') {
        ev.preventDefault();
        closeVideo();
      }
    }
  });

  /* --- D. TILT & CLOCK --- */
  const handlePointer = (e) => {
    if (!elements.card || window.innerWidth <= 768) return;
    const rect = elements.card.getBoundingClientRect();
    const clientX = (e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX));
    const clientY = (e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY));
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

  // Make sure resize keeps the iframe full viewport if present
  window.addEventListener('resize', () => {
    // find any YT iframe and reapply styles
    try {
      const iframe = document.querySelector('iframe[src*="youtube.com/embed"]');
      if (iframe) applyIframeFullViewportStyles(iframe);
    } catch (e) { /* ignore */ }
  });
};

/* --- Bootstrap: insert YouTube API tag then init on DOMContentLoaded --- */
(function bootstrap() {
  // Insert YouTube API script (if not already present)
  if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  document.addEventListener('DOMContentLoaded', initSnoopyOS, { once: true });
})();
