const track = document.getElementById("worksTrack");

let slides = Array.from(track.children);
let currentIndex = 1;

/* ---------------------------
   CLASS UPDATE
---------------------------- */
function updateClasses() {

    slides.forEach(slide => {
        slide.classList.remove("is-active", "is-prev", "is-next");
    });

    slides[currentIndex]?.classList.add("is-active");
    slides[currentIndex - 1]?.classList.add("is-prev");
    slides[currentIndex + 1]?.classList.add("is-next");
}

/* ---------------------------
   CENTER (WITH ANIMATION)
---------------------------- */
function centerSlide(animated = true) {

    const activeSlide = slides[currentIndex];

    const offset =
        activeSlide.offsetLeft -
        (window.innerWidth / 2) +
        (activeSlide.offsetWidth / 2);

    track.style.transition = animated
        ? "transform .7s cubic-bezier(.77,0,.18,1)"
        : "none";

    track.style.transform = `translateX(${-offset}px)`;

    updateClasses();
}

/* ---------------------------
   NEXT (SMOOTH + LOOP)
---------------------------- */
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

/* ---------------------------
   PREV (SMOOTH + LOOP)
---------------------------- */
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

/* ---------------------------
   DRAG
---------------------------- */
let startX = 0;

track.addEventListener("mousedown", e => {
    startX = e.clientX;
});

window.addEventListener("mouseup", e => {

    const diff = e.clientX - startX;

    if (diff < -50) nextSlide();
    else if (diff > 50) prevSlide();
});

/* TOUCH */
track.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
});

window.addEventListener("touchend", e => {

    const diff = e.changedTouches[0].clientX - startX;

    if (diff < -50) nextSlide();
    else if (diff > 50) prevSlide();
});

/* RESIZE */
window.addEventListener("resize", () => {
    centerSlide(false);
});

/* INIT */
centerSlide(false);