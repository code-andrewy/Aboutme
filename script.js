const $ = s => document.querySelector(s)

const CONFIG = {
  weatherURL: "https://api.weather.gov/gridpoints/GYX/47,32/forecast/hourly",
  phrases: ["Modern UI", "Web Apps", "Cybersecurity", "JavaScript", "Snoopy"]
}

const state = { el: null }

function start() {
  const el = {
    card: $("#tilt-card"),
    container: $("#tilt-container"),
    typewriter: $("#typewriter"),
    socialRow: $(".social-row"),
    time: $("#time"),
    temp: $("#temp"),
    cond: $("#cond"),
    glow: $("#glow"),
    ctxMenu: $("#context-menu")
  }

  state.el = el

  // --- Clock ---
  function clock() {
    if (el.time) {
      el.time.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    }
  }

  // --- Weather ---
  async function weather() {
    try {
      const r = await fetch(CONFIG.weatherURL)
      if (!r.ok) throw new Error()
      const data = await r.json()
      const cur = data?.properties?.periods?.[0]
      
      if (el.temp) el.temp.textContent = cur ? `${cur.temperature}°F` : "72°F"
      if (el.cond) el.cond.textContent = cur ? cur.shortForecast : "Clear"
    } catch (err) {
      if (el.temp) el.temp.textContent = "72°F"
      if (el.cond) el.cond.textContent = "Clear"
    }
  }

  // --- Typewriter ---
  let p = 0, c = 0, del = false
  function type() {
    if (!el.typewriter) return
    const phrase = CONFIG.phrases[p] || ""

    if (!del) {
      c++
      el.typewriter.textContent = phrase.slice(0, c)
      if (c === phrase.length) {
        del = true
        setTimeout(type, 2000)
        return
      }
      setTimeout(type, 90)
    } else {
      c--
      el.typewriter.textContent = phrase.slice(0, c)
      if (c === 0) {
        del = false
        p = (p + 1) % CONFIG.phrases.length
        setTimeout(type, 400)
        return
      }
      setTimeout(type, 45)
    }
  }

  // --- Social Links (Optional if already in HTML, but leaving to prevent breaking your code) ---
  function socials() {
    if (!el.socialRow) return
    const links = [
      { icon: "fa-brands fa-github", url: "https://github.com/SirSnoopsiee", tip: "GitHub" },
      { icon: "fa-brands fa-youtube", url: "https://www.youtube.com/@SirSnoopsiee", tip: "YouTube" },
      { icon: "fa-brands fa-discord", url: "https://discord.com/users/1478125540828385350", tip: "Discord" }
    ]

    // Only render if empty to avoid double-rendering if you put them in HTML directly
    if(el.socialRow.children.length === 0) {
      el.socialRow.innerHTML = links.map(l =>
        `<a href="${l.url}" target="_blank" rel="noopener" class="social-btn" aria-label="${l.tip}" title="${l.tip}">
          <i class="${l.icon}" style="font-size:20px"></i>
        </a>`
      ).join("")
    }
  }

  // --- 3D Tilt & Glow Effect ---
  el.container?.addEventListener("pointermove", e => {
    if (!el.card || window.innerWidth <= 850) return

    const r = el.card.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top

    // Update glow position
    if(el.glow) {
      el.glow.style.setProperty("--mouse-x", `${(x / r.width) * 100}%`)
      el.glow.style.setProperty("--mouse-y", `${(y / r.height) * 100}%`)
    }

    // Calculate rotation
    const xRotation = (y - r.height / 2) / 25
    const yRotation = (r.width / 2 - x) / 25

    el.card.style.transform = `rotateX(${xRotation}deg) rotateY(${yRotation}deg)`
  })

  el.container?.addEventListener("pointerleave", () => {
    if (el.card) el.card.style.transform = "rotateX(0deg) rotateY(0deg)"
  })

  // --- Context Menu ---
  window.addEventListener("contextmenu", e => {
    e.preventDefault()
    if (!el.ctxMenu) return
    el.ctxMenu.style.display = "block"
    
    // Keep menu on screen
    const menuWidth = el.ctxMenu.offsetWidth || 160;
    const xPos = (e.pageX + menuWidth > window.innerWidth) ? window.innerWidth - menuWidth - 10 : e.pageX;
    
    el.ctxMenu.style.left = `${xPos}px`
    el.ctxMenu.style.top = `${e.pageY}px`
  })

  window.addEventListener("click", () => {
    if (el.ctxMenu) el.ctxMenu.style.display = "none"
  })

  $("#ctx-refresh")?.addEventListener("click", () => location.reload())
  $("#ctx-close")?.addEventListener("click", () => {
    if (el.ctxMenu) el.ctxMenu.style.display = "none"
  })

  // --- Initialize ---
  clock()
  setInterval(clock, 1000)
  type()
  weather()
  socials()
}

document.addEventListener("DOMContentLoaded", start)
