const $ = s => document.querySelector(s);

const CONFIG = {
  weatherURL: "https://api.weather.gov/gridpoints/GYX/47,32/forecast/hourly",
  phrases: ["Modern UI", "Web Apps", "Cybersecurity", "JavaScript", "Snoopy"]
};

function start() {
  const el = {
    card: $("#tilt-card"),
    container: $("#tilt-container"),
    typewriter: $("#typewriter"),
    time: $("#time"),
    temp: $("#temp"),
    cond: $("#cond"),
    glow: $("#glow"),
    ctxMenu: $("#context-menu")
  };

  // Clock Logic
  const clock = () => {
    if (el.time) {
      el.time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  };

  // Weather Logic
  async function weather() {
    try {
      const r = await fetch(CONFIG.weatherURL);
      const data = await r.json();
      const cur = data?.properties?.periods?.[0];
      if (el.temp) el.temp.textContent = cur ? `${cur.temperature}°F` : "72°F";
      if (el.cond) el.cond.textContent = cur ? cur.shortForecast : "Clear";
    } catch (e) {
      if (el.temp) el.temp.textContent = "72°F";
      if (el.cond) el.cond.textContent = "Clear";
    }
  }

  // Typewriter Logic
  let p = 0, c = 0, del = false;
  function type() {
    if (!el.typewriter) return;
    const phrase = CONFIG.phrases[p] || "";
    if (!del) {
      c++;
      el.typewriter.textContent = phrase.slice(0, c);
      if (c === phrase.length) { del = true; setTimeout(type, 2000); return; }
      setTimeout(type, 100);
    } else {
      c--;
      el.typewriter.textContent = phrase.slice(0, c);
      if (c === 0) { del = false; p = (p + 1) % CONFIG.phrases.length; setTimeout(type, 500); return; }
      setTimeout(type, 50);
    }
  }

  // Tilt & Glow
  el.container?.addEventListener("pointermove", e => {
    if (!el.card || window.innerWidth <= 900) return;
    const r = el.card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.card.style.setProperty("--mouse-x", `${(x / r.width) * 100}%`);
    el.card.style.setProperty("--mouse-y", `${(y / r.height) * 100}%`);
    const rotateX = (y - r.height / 2) / 25;
    const rotateY = (r.width / 2 - x) / 25;
    el.card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  el.container?.addEventListener("pointerleave", () => {
    if (el.card) el.card.style.transform = "rotateX(0deg) rotateY(0deg)";
  });

  // Context Menu
  window.addEventListener("contextmenu", e => {
    e.preventDefault();
    if (!el.ctxMenu) return;
    el.ctxMenu.style.display = "block";
    el.ctxMenu.style.left = `${e.pageX}px`;
    el.ctxMenu.style.top = `${e.pageY}px`;
  });

  window.addEventListener("click", () => el.ctxMenu.style.display = "none");
  $("#ctx-refresh")?.addEventListener("click", () => location.reload());

  clock();
  setInterval(clock, 1000);
  type();
  weather();
}

document.addEventListener("DOMContentLoaded", start);
