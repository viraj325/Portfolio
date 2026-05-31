// ===== Live ticker strip =====
const tickers = [
  { sym: "BTC", price: "67,842.21", chg: "+2.35%", up: true },
  { sym: "ETH", price: "3,512.48", chg: "+1.68%", up: true },
  { sym: "SOL", price: "152.73", chg: "+3.21%", up: true },
  { sym: "SPY", price: "548.12", chg: "+0.78%", up: true },
  { sym: "QQQ", price: "472.90", chg: "+1.12%", up: true },
  { sym: "AAPL", price: "229.04", chg: "+1.35%", up: true },
  { sym: "TSLA", price: "248.50", chg: "-0.42%", up: false },
  { sym: "NVDA", price: "131.26", chg: "+2.19%", up: true },
]

function buildTicker() {
  const track = document.getElementById("tickerTrack")
  if (!track) return
  const items = [...tickers, ...tickers] // duplicate for seamless loop
  track.innerHTML = items
    .map(
      (t) => `
      <span class="tk">
        <span class="tk__sym">${t.sym}</span>
        <span class="tk__price">${t.price}</span>
        <span class="${t.up ? "tk__up" : "tk__down"}">${t.up ? "▲" : "▼"} ${t.chg}</span>
      </span>`
    )
    .join("")
}
buildTicker()

// ===== Typing terminal animation =====
const lines = [
  { html: '<span class="term-user">ghost@finance</span>:<span class="term-prompt">~$</span> ghost watch markets' },
  { html: '<span class="term-info">&gt; fetching real-time data...</span>', delay: 350 },
  { html: '<span class="term-user">ghost@finance</span>:<span class="term-prompt">~$</span> ghost analyze trend --asset BTC' },
  { html: '<span class="term-ok">✓ uptrend confirmed.</span>', delay: 350 },
  { html: '<span class="term-user">ghost@finance</span>:<span class="term-prompt">~$</span> ghost orb report --summary' },
  { html: '<span class="term-info">&gt; generating insights...</span>', delay: 350 },
  { html: '<span class="term-ok">✓ Watchlist summary ready.</span>', delay: 350 },
]

function typeTerminal() {
  const body = document.getElementById("termBody")
  if (!body) return
  let li = 0

  function nextLine() {
    if (li >= lines.length) {
      // restart loop after a pause
      setTimeout(() => {
        body.innerHTML = ""
        li = 0
        nextLine()
      }, 3500)
      return
    }
    const line = lines[li]
    const div = document.createElement("div")
    body.appendChild(div)

    // typewriter that strips tags then re-applies wrapper
    const temp = document.createElement("div")
    temp.innerHTML = line.html
    const fullText = temp.textContent
    let ci = 0

    function typeChar() {
      ci++
      // rebuild partial: render the html but truncated by visible chars
      div.innerHTML = renderPartial(line.html, ci) + '<span class="cursor">█</span>'
      if (ci < fullText.length) {
        setTimeout(typeChar, 22)
      } else {
        div.innerHTML = line.html
        li++
        setTimeout(nextLine, line.delay || 500)
      }
    }
    typeChar()
  }

  nextLine()
}

// renders the html string but only showing the first `n` visible text characters
function renderPartial(html, n) {
  let out = ""
  let count = 0
  let i = 0
  while (i < html.length && count < n) {
    if (html[i] === "<") {
      const close = html.indexOf(">", i)
      out += html.slice(i, close + 1)
      i = close + 1
    } else {
      out += html[i]
      count++
      i++
    }
  }
  return out
}

typeTerminal()

// ===== Install tabs =====
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.remove("tab--active")
      t.setAttribute("aria-selected", "false")
    })
    tab.classList.add("tab--active")
    tab.setAttribute("aria-selected", "true")
    const target = tab.dataset.tab
    document.querySelectorAll(".codeblock").forEach((cb) => {
      cb.hidden = cb.dataset.panel !== target
    })
  })
})

// ===== Copy buttons =====
const toast = document.getElementById("toast")
function showToast(msg) {
  if (!toast) return
  toast.textContent = msg
  toast.classList.add("toast--show")
  clearTimeout(showToast._t)
  showToast._t = setTimeout(() => toast.classList.remove("toast--show"), 1800)
}

document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy || ""
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = text
        textarea.setAttribute("readonly", "")
        textarea.style.position = "fixed"
        textarea.style.left = "-9999px"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        textarea.remove()
      }
      showToast("Copied to clipboard")
    } catch {
      showToast("Copy failed — select manually")
    }
  })
})

// ===== Mobile menu =====
const menuBtn = document.getElementById("menuBtn")
const mobileMenu = document.getElementById("mobileMenu")
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    const open = mobileMenu.hidden
    mobileMenu.hidden = !open
    menuBtn.setAttribute("aria-expanded", String(open))
  })
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mobileMenu.hidden = true
      menuBtn.setAttribute("aria-expanded", "false")
    })
  )
  window.addEventListener("resize", () => {
    if (window.innerWidth > 920 && !mobileMenu.hidden) {
      mobileMenu.hidden = true
      menuBtn.setAttribute("aria-expanded", "false")
    }
  })
}

// ===== Scroll reveal =====
const revealTargets = document.querySelectorAll(
  ".pillar, .cmd-card, .orb__card, .install__panel, .cta-banner__inner, .section-head, .feature-detail__copy, .feature-detail__visual, .security__card"
)
revealTargets.forEach((el) => el.classList.add("reveal"))

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal--in")
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 }
  )
  revealTargets.forEach((el) => io.observe(el))
} else {
  revealTargets.forEach((el) => el.classList.add("reveal--in"))
}

// ===== Dynamic copyright year =====
const footerCopy = document.getElementById("footerCopy")
if (footerCopy) {
  footerCopy.textContent = `© ${new Date().getFullYear()} Ghost Finance Terminal. All rights reserved.`
}
