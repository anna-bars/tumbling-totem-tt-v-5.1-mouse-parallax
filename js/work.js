const track        = document.getElementById("worksTrack");
const dragHint     = document.getElementById("dragHint");
const section      = document.querySelector(".featured-works");
const cursorZone   = document.querySelector(".featured-works-cont");

// ── Hide the old drag-hint ─────────────────────────────────────────────────
if (dragHint) dragHint.style.display = "none";

// ── Create custom cursor element ───────────────────────────────────────────
const cursor = document.createElement("div");
cursor.className = "works-cursor";
cursor.innerHTML = `<span class="works-cursor-label">HOLD AND <br>DRAG</span>`;
document.body.appendChild(cursor);

// ── Cursor state ───────────────────────────────────────────────────────────
let cursorVisible = false;
let cursorX = 0, cursorY = 0;
let smoothX = 0, smoothY = 0;
let rafId = null;

function lerp(a, b, t) { return a + (b - a) * t; }

function animateCursor() {
    smoothX = lerp(smoothX, cursorX, 0.12);
    smoothY = lerp(smoothY, cursorY, 0.12);
    cursor.style.transform = `translate(${smoothX}px, ${smoothY}px) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(animateCursor);
}

animateCursor();

// ── Show / hide cursor only inside .featured-works-cont ───────────────────
cursorZone.addEventListener("mouseenter", () => {
    cursor.classList.add("is-visible");
    cursorVisible = true;
});

cursorZone.addEventListener("mouseleave", () => {
    cursor.classList.remove("is-visible");
    cursor.classList.remove("is-dragging");
    cursorVisible = false;
    isDragging = false;
});

// ── Track mouse position ───────────────────────────────────────────────────
window.addEventListener("mousemove", e => {
    cursorX = e.clientX;
    cursorY = e.clientY;

    if (isDragging) {
        const move = e.clientX - startX;
        cursor.style.setProperty("--drag-offset", `${move * 0.2}px`);
    }
});

// ── Slide state ────────────────────────────────────────────────────────────
let slides       = Array.from(track.children);
let currentIndex = 1;

/* =========================================
   UPDATE CLASSES
========================================= */
function updateClasses() {
    slides.forEach(slide => {
        slide.classList.remove("is-active", "is-prev", "is-next");
    });
    slides[currentIndex]?.classList.add("is-active");
    slides[currentIndex - 1]?.classList.add("is-prev");
    slides[currentIndex + 1]?.classList.add("is-next");
}

/* =========================================
   CENTER SLIDE
========================================= */
function centerSlide(animated = true) {
    const activeSlide = slides[currentIndex];
    const offset =
        activeSlide.offsetLeft -
        (window.innerWidth / 2) +
        (activeSlide.offsetWidth / 2);

    track.style.transition = animated
        ? "transform .8s cubic-bezier(.77,0,.18,1)"
        : "none";

    track.style.transform = `translateX(${-offset}px)`;
    updateClasses();
}

/* =========================================
   NEXT / PREV
========================================= */
function nextSlide() {
    if (track.dataset.animating === "true") return;
    track.dataset.animating = "true";
    currentIndex++;
    centerSlide(true);
    track.addEventListener("transitionend", () => {
        if (currentIndex >= slides.length - 1) {
            const first = slides.shift();
            track.appendChild(first);
            slides.push(first);
            currentIndex--;
            centerSlide(false);
        }
        track.dataset.animating = "false";
    }, { once: true });
}

function prevSlide() {
    if (track.dataset.animating === "true") return;
    track.dataset.animating = "true";
    currentIndex--;
    centerSlide(true);
    track.addEventListener("transitionend", () => {
        if (currentIndex <= 0) {
            const last = slides.pop();
            track.prepend(last);
            slides.unshift(last);
            currentIndex++;
            centerSlide(false);
        }
        track.dataset.animating = "false";
    }, { once: true });
}

/* =========================================
   DRAG — MOUSE (on .featured-works-cont only)
========================================= */
let isDragging = false;
let startX     = 0;

cursorZone.addEventListener("mousedown", e => {
    isDragging = true;
    startX     = e.clientX;
    cursor.classList.add("is-dragging");
    cursor.querySelector(".works-cursor-label").innerHTML = "HOLD <br> & DRAG";
});

window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const move = e.clientX - startX;
    cursor.style.setProperty("--drag-offset", `${move * 0.18}px`);
});

window.addEventListener("mouseup", e => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    cursor.classList.remove("is-dragging");
    cursor.style.setProperty("--drag-offset", "0px");

    if (diff < -80)      nextSlide();
    else if (diff > 80)  prevSlide();

    isDragging = false;
});

/* =========================================
   DRAG — TOUCH
========================================= */
cursorZone.addEventListener("touchstart", e => {
    isDragging = true;
    startX     = e.touches[0].clientX;
});

window.addEventListener("touchmove", e => {
    if (!isDragging) return;
});

window.addEventListener("touchend", e => {
    if (!isDragging) return;
    const diff = e.changedTouches[0].clientX - startX;
    if (diff < -80)      nextSlide();
    else if (diff > 80)  prevSlide();
    isDragging = false;
});

/* =========================================
   RESIZE + INIT
========================================= */
window.addEventListener("resize", () => centerSlide(false));
centerSlide(false);