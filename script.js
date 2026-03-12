const $ = s => document.querySelector(s)

const CONFIG = {
  weatherURL: "https://api.weather.gov/gridpoints/GYX/47,32/forecast/hourly",
  phrases: ["Modern UI", "Web Apps", "Cybersecurity", "JavaScript", "Snoopy Enthusiast"]
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
  const updateClock = () => {
    if (el.time) {
      el.time.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit" // Added seconds for better visual feedback
      })
    }
  }

  // --- Weather ---
  async function fetchWeather() {
    try {
      const response = await fetch(CONFIG.weatherURL)
      const data = await response.json()
      const cur = data?.properties?.periods?.[0]
      
      if (el.temp) el.temp.textContent = cur ? `${cur.temperature}°F` : "72°F"
      if (el.cond) el.cond.textContent = cur ? cur.shortForecast : "Clear Sky"
    } catch (err) {
      console.error("Weather Error:", err)
      if (el.temp) el.temp.textContent = "72°F"
      if (el.cond) el.cond.textContent = "Clear Sky"
    }
  }

  // --- Typewriter ---
  let pIndex = 0, charIndex = 0, isDeleting = false
  function handleType() {
    const phrase = CONFIG.phrases[pIndex]
    
    if (!isDeleting) {
      charIndex++
      el.typewriter.textContent = phrase.slice(0, charIndex)
      if (charIndex === phrase.length) {
        isDeleting = true
        setTimeout(handleType, 2000)
        return
      }
      setTimeout(handleType, 100)
    } else {
      charIndex--
      el.typewriter.textContent = phrase.slice(0, charIndex)
      if (charIndex === 0) {
        isDeleting = false
        pIndex = (pIndex + 1) % CONFIG.phrases.length
        setTimeout(handleType, 500)
        return
      }
      setTimeout(handleType, 50)
    }
  }

  // --- 3D Tilt & Glow ---
  el.container?.addEventListener("pointermove", e => {
    if (!el.card || window.innerWidth <= 850) return

    const rect = el.card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Update Glow Position
    el.card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`)
    el.card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`)

    // Tilt Calculation
    const rotateX = (y - rect.height / 2) / 25
    const rotateY = (rect.width / 2 - x) / 25

    el.card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  })

  el.container?.addEventListener("pointerleave", () => {
    if (el.card) el.card.style.transform = "rotateX(0deg) rotateY(0deg)"
  })

  // --- Context Menu ---
  window.addEventListener("contextmenu", e => {
    e.preventDefault()
    if (!el.ctxMenu) return
    el.ctxMenu.style.display = "block"
    el.ctxMenu.style.left = `${e.pageX}px`
    el.ctxMenu.style.top = `${e.pageY}px`
  })

  window.addEventListener("click", () => {
    if (el.ctxMenu) el.ctxMenu.style.display = "none"
  })

  $("#ctx-refresh")?.addEventListener("click", () => location.reload())

  // --- Init ---
  updateClock()
  setInterval(updateClock, 1000)
  handleType()
  fetchWeather()
}

document.addEventListener("DOMContentLoaded", start)
