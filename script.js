const $ = s => document.querySelector(s)

const CONFIG = {
  weatherURL: "https://api.weather.gov/gridpoints/GYX/47,32/forecast/hourly",
  phrases: ["Modern UI","Web Apps","Cybersecurity","JavaScript"]
}

const state = { el:null }

function start() {

  const el = {
    card: $("#tilt-card"),
    container: $("#tilt-container"),
    typewriter: $("#typewriter"),
    socialRow: $(".social-row"),
    time: $("#time"),
    temp: $("#temp"),
    cond: $("#cond"),
    glow: $("#glow")
  }

  state.el = el

  function weather() {
    fetch(CONFIG.weatherURL)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const cur = data?.properties?.periods?.[0]
        if(el.temp) el.temp.textContent = cur ? `${cur.temperature}°F` : "72°F"
        if(el.cond) el.cond.textContent = cur ? cur.shortForecast : "Clear"
      })
      .catch(() => {
        if(el.temp) el.temp.textContent = "72°F"
        if(el.cond) el.cond.textContent = "Clear"
      })
  }

  let p=0,c=0,del=false

  function type() {
    if(!el.typewriter) return
    const phrase = CONFIG.phrases[p] || ""

    if(!del){
      c++
      el.typewriter.textContent = phrase.slice(0,c)
      if(c === phrase.length){
        del = true
        setTimeout(type,2000)
        return
      }
      setTimeout(type,90)
    }else{
      c--
      el.typewriter.textContent = phrase.slice(0,c)
      if(c === 0){
        del = false
        p = (p+1) % CONFIG.phrases.length
        setTimeout(type,400)
        return
      }
      setTimeout(type,45)
    }
  }

  function socials() {
    if(!el.socialRow) return

    const links = [
      {icon:"fab fa-youtube",url:"https://www.youtube.com/@SirSnoopsiee",tip:"YouTube"},
      {icon:"fab fa-github",url:"https://github.com/SirSnoopsiee",tip:"GitHub"},
      {icon:"fas fa-envelope",url:"https://sirsnoopy.pages.dev/contact",tip:"Contact"}
    ]

    el.socialRow.innerHTML = links.map(l =>
      `<a href="${l.url}" target="_blank" class="social-btn" data-tooltip="${l.tip}" aria-label="${l.tip}">
        <i class="${l.icon}" style="font-size:22px"></i>
      </a>`
    ).join("")
  }

  function clock(){
    if(el.time){
      el.time.textContent = new Date().toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
      })
    }
  }

  el.container?.addEventListener("pointermove",e=>{
    if(!el.card || window.innerWidth <= 768) return

    const r = el.card.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top

    el.glow?.style.setProperty("--mouse-x",`${(x/r.width)*100}%`)
    el.glow?.style.setProperty("--mouse-y",`${(y/r.height)*100}%`)

    el.card.style.transform =
      `rotateX(${(y-r.height/2)/20}deg) rotateY(${(r.width/2-x)/20}deg)`
  })

  el.container?.addEventListener("pointerleave",()=>{
    if(el.card) el.card.style.transform = "rotateX(0deg) rotateY(0deg)"
  })

  clock()
  setInterval(clock,1000)
  type()
  weather()
  socials()
}

document.addEventListener("DOMContentLoaded",start)
