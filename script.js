/**
 * GEMINI-OPTIMIZED FULL JS (FINAL VERSION)
 * Features: Background Video, Intro Modal, Weather, Typewriter, 
 * Hover Tilt, & Tooltip Injection (with Disabled Discord).
 */

const qs = (s) => document.querySelector(s);

/* --- 1. CONFIGURATION --- */
const CONFIG = {
    introVideoID: 'Rz5RM_D_XeI', // The one-time intro video
    weatherURL: 'https://api.weather.gov/gridpoints/GYX/47,32/forecast/hourly',
    phrases: ["Modern UI", "Web Apps", "Cybersecurity", "JavaScript"]
};

let introPlayer; // Instance for the Modal Player

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

    /* --- A. SOCIAL ICON INJECTION --- */
    const injectSocials = () => {
        if (!elements.socialRow) return;
        elements.socialRow.innerHTML = ''; // Prevent duplicates

        const links = [
            { 
                id: 'youtube', 
                icon: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z', 
                url: 'https://youtube.com/@sirsnoopy', 
                tip: 'Watch on YouTube', 
                active: true 
            },
            { 
                id: 'github', 
                icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22', 
                url: 'https://github.com/code-andrewy', 
                tip: 'View GitHub', 
                active: true 
            },
            { 
                id: 'discord', 
                icon: 'M7.5 21l-3-3h10.5a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H4.5A3 3 0 0 0 1.5 6v9a3 3 0 0 0 3 3v3', // Simplified icon
                url: '#', 
                tip: 'No longer active', 
                active: false 
            },
            { 
                id: 'contact-injected', 
                icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6', 
                url: 'https://sirsnoopy.pages.dev/contact', 
                tip: 'Send Email', 
                active: true 
            }
        ];

        links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.className = `social-btn ${link.id} ${!link.active ? 'disabled' : ''}`;
            a.setAttribute('data-tooltip', link.tip);
            if (link.active) a.target = '_blank';
            
            a.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${link.icon}"></path></svg>`;
            
            if (!link.active) {
                a.addEventListener('click', (e) => e.preventDefault());
            }
            
            elements.socialRow.appendChild(a);
        });
    };

    /* --- B. WEATHER ENGINE --- */
    const fetchWeather = async () => {
        try {
            const res = await fetch(CONFIG.weatherURL);
            const data = await res.json();
            const current = data.properties.periods[0];
            if (elements.temp) elements.temp.textContent = `${current.temperature}°F`;
            if (elements.cond) elements.cond.textContent = current.shortForecast;
        } catch (e) {
            console.error("Weather update failed.");
            if (elements.temp) elements.temp.textContent = '72°F';
            if (elements.cond) elements.cond.textContent = 'Clear';
        }
    };

    /* --- C. TYPEWRITER --- */
    let pIdx = 0, charIdx = 0, isDeleting = false;
    const type = () => {
        const target = elements.typewriter;
        if (!target) return;
        const currentPhrase = CONFIG.phrases[pIdx];
        target.textContent = currentPhrase.substring(0, charIdx);
        
        let speed = isDeleting ? 50 : 100;
        if (!isDeleting && charIdx === currentPhrase.length) {
            isDeleting = true;
            speed = 2000;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            pIdx = (pIdx + 1) % CONFIG.phrases.length;
            speed = 500;
        }
        charIdx += isDeleting ? -1 : 1;
        setTimeout(type, speed);
    };

    /* --- D. INTRO MODAL LOGIC --- */
    const closeVideo = () => {
        introPlayer?.destroy();
        if (elements.videoModal) elements.videoModal.style.display = 'none';
        localStorage.setItem('intro_complete', 'true');
    };

    // YouTube Iframe API Callback
    window.onYouTubeIframeAPIReady = () => {
        if (localStorage.getItem('intro_complete')) return;
        if (elements.videoModal) {
            elements.videoModal.style.display = 'flex';
            introPlayer = new YT.Player('intro-player', {
                videoId: CONFIG.introVideoID,
                playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
                events: { onStateChange: (e) => { if (e.data === 0) closeVideo(); } }
            });
        }
    };

    qs('#video-close')?.addEventListener('click', closeVideo);

    /* --- E. TILT ENGINE & CLOCK --- */
    const handlePointer = (e) => {
        if (!elements.card || window.innerWidth <= 768) return;
        const rect = elements.card.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
        
        elements.glow?.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        elements.glow?.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        
        const rX = (y - rect.height / 2) / 20;
        const rY = (rect.width / 2 - x) / 20;
        elements.card.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`;
    };

    if (elements.container) {
        elements.container.addEventListener('pointermove', handlePointer);
        elements.container.addEventListener('pointerleave', () => {
            elements.card.style.transform = `rotateX(0deg) rotateY(0deg)`;
        });
    }

    setInterval(() => {
        if(elements.time) {
            elements.time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }, 1000);

    /* --- INITIALIZE --- */
    type();
    fetchWeather();
    injectSocials();
};

/* --- BOOTSTRAP --- */
// Load YouTube API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

// Fire on Load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSnoopyOS);
} else {
    initSnoopyOS();
}
