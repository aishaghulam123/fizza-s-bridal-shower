// Fiza Bridal Shower — standalone script

const eventDate = new Date("2026-10-14T19:00:00").getTime();

const itinerary = [
  ["8:00", "Canvas workshop", " Paint your own masterpiece to take home"],
  ["9:00", "Games", "A little friendly competition"],
  ["10:00", "Dinner", "A delicious meal to enjoy together"],
];

const bowMarkup = (extraClass = "") =>
  `<span class="bridal-bow ${extraClass}" aria-hidden="true">
    <span class="bridal-bow__loop bridal-bow__loop--left"></span>
    <span class="bridal-bow__loop bridal-bow__loop--right"></span>
    <span class="bridal-bow__knot"></span>
    <span class="bridal-bow__tail bridal-bow__tail--left"></span>
    <span class="bridal-bow__tail bridal-bow__tail--right"></span>
  </span>`;

// Timeline
const timeline = document.getElementById("timeline");
if (timeline) {
  timeline.innerHTML = itinerary
    .map(
      ([time, title, note]) =>
        `<div class="timeline-item" data-reveal><time>${time}</time>${bowMarkup(
          "bridal-bow--small"
        )}<div><h3>${title}</h3><p>${note}</p></div></div>`
    )
    .join("");
}

// Scroll reveals
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));

// Envelope opening
const cover = document.getElementById("cover");
const openBtn = document.getElementById("openBtn");
openBtn?.addEventListener("click", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    cover.classList.add("is-hidden");
    return;
  }
  cover.classList.add("is-opening");
  window.setTimeout(() => cover.classList.add("is-hidden"), 2600);
});

// Smooth scroll buttons
document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.scroll)?.scrollIntoView({ behavior: "smooth" });
  });
});

// Countdown
// Target date: 14 October 2026 (Raat 12:00 AM)


function tick() {
  const distance = Math.max(0, eventDate - Date.now());
  const values = {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
  
  Object.entries(values).forEach(([unit, value]) => {
    const node = document.querySelector(`[data-unit="${unit}"]`);
    if (node) node.textContent = String(value).padStart(2, "0");
  });
}

tick();
window.setInterval(tick, 1000);

// Secret bow
const secretBow = document.getElementById("secretBow");
secretBow?.addEventListener("click", () => {
  secretBow.classList.add("is-untied");
  document.getElementById("secretMessage")?.classList.add("is-visible");
  const heading = document.getElementById("secretHeading");
  if (heading) heading.textContent = "Just for Fizza";
});



// Memory book — click/tap turns the top page over; turned pages settle in a
// visible pile on the left instead of disappearing, like a real photo album
const flipbook = document.getElementById("flipbook");
if (flipbook) {
  const pages = Array.from(flipbook.querySelectorAll(".flip-page"));
  const dots = Array.from(flipbook.querySelectorAll(".flipbook-dots span"));
  const hint = document.getElementById("flipbookHint");
  let waitingOrder = pages.map((_, i) => i); // front of array = current top of the "to read" stack
  let settledOrder = []; // pages already turned, oldest first
  let isAnimating = false;

  function applyStacking() {
    waitingOrder.forEach((pageIndex, stackPos) => {
      pages[pageIndex].style.zIndex = String(200 + (waitingOrder.length - stackPos));
    });
    settledOrder.forEach((pageIndex, settledPos) => {
      pages[pageIndex].style.zIndex = String(10 + settledPos);
    });
  }
  function updateDots() {
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i < settledOrder.length));
  }
  function updateHint() {
    if (!hint) return;
    hint.textContent = waitingOrder.length === 0 ? "tap to start the book over ♡" : "tap to turn the page ♡";
  }
  applyStacking();
  updateDots();
  updateHint();

  function turnPage() {
    if (isAnimating) return;

    if (waitingOrder.length === 0) {
      resetBook();
      return;
    }

    isAnimating = true;
    const topIndex = waitingOrder.shift();
    const topPage = pages[topIndex];
    applyStacking();
    topPage.style.zIndex = "300"; // stay above everything while it turns
    topPage.classList.add("is-turning");

    window.setTimeout(() => {
      settledOrder.push(topIndex);
      topPage.style.setProperty("--settle-index", String(settledOrder.length - 1));
      topPage.classList.remove("is-turning");
      topPage.classList.add("is-settled");
      applyStacking();
      topPage.style.zIndex = String(10 + settledOrder.length - 1);
      updateDots();
      updateHint();
      isAnimating = false;
    }, 1000);
  }

  function resetBook() {
    isAnimating = true;
    flipbook.classList.add("is-resetting");
    window.setTimeout(() => {
      pages.forEach((page) => {
        page.classList.add("no-transition");
        page.classList.remove("is-turning", "is-settled");
        page.style.removeProperty("--settle-index");
        void page.offsetWidth; // force reflow before re-enabling transitions
        page.classList.remove("no-transition");
      });
      waitingOrder = pages.map((_, i) => i);
      settledOrder = [];
      applyStacking();
      updateDots();
      updateHint();
      flipbook.classList.remove("is-resetting");
      isAnimating = false;
    }, 380);
  }

  flipbook.addEventListener("click", turnPage);
  flipbook.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      turnPage();
    }
  });
}


// Custom cursor (desktop only)
if (window.matchMedia("(pointer: fine)").matches) {
  const cursor = document.querySelector(".custom-cursor");
  window.addEventListener("mousemove", (event) => {
    if (cursor) cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  });
  document.addEventListener("mouseover", (event) => {
    const target = event.target.closest("[data-cursor]");
    cursor?.classList.toggle("is-active", Boolean(target));
    if (cursor) cursor.dataset.label = target?.dataset.cursor ?? "";
  });
}