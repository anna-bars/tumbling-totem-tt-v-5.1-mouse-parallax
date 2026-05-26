const track = document.getElementById("worksTrack");

const slides = Array.from(track.children);

const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);

track.appendChild(firstClone);
track.prepend(lastClone);

const allSlides = Array.from(track.children);

let currentIndex = 1;

const GAP = 20;

function slideWidth() {
    return allSlides[0].offsetWidth + GAP;
}

/* CENTER ACTIVE SLIDE */

function updatePosition(animated = false) {

    const activeSlide = allSlides[currentIndex];

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

/* ACTIVE CLASSES */

function updateClasses() {

    allSlides.forEach(slide => {
        slide.classList.remove(
            "is-active",
            "is-prev",
            "is-next"
        );
    });

    allSlides[currentIndex].classList.add("is-active");

    if (allSlides[currentIndex - 1]) {
        allSlides[currentIndex - 1].classList.add("is-prev");
    }

    if (allSlides[currentIndex + 1]) {
        allSlides[currentIndex + 1].classList.add("is-next");
    }
}

/* NEXT */

function nextSlide() {

    if (track.classList.contains("animating")) return;

    track.classList.add("animating");

    currentIndex++;

    updatePosition(true);
}

/* PREV */

function prevSlide() {

    if (track.classList.contains("animating")) return;

    track.classList.add("animating");

    currentIndex--;

    updatePosition(true);
}

/* TRANSITION END */

track.addEventListener("transitionend", () => {

    if (currentIndex === allSlides.length - 1) {

        currentIndex = 1;

        updatePosition(false);
    }

    if (currentIndex === 0) {

        currentIndex = allSlides.length - 2;

        updatePosition(false);
    }

    track.classList.remove("animating");
});

/* DRAG */

let startX = 0;
let isDragging = false;

track.addEventListener("mousedown", e => {

    startX = e.clientX;
    isDragging = true;
});

window.addEventListener("mouseup", e => {

    if (!isDragging) return;

    isDragging = false;

    const diff = e.clientX - startX;

    if (diff < -50) {
        nextSlide();
    }

    else if (diff > 50) {
        prevSlide();
    }
});

/* TOUCH */

track.addEventListener("touchstart", e => {

    startX = e.touches[0].clientX;
});

window.addEventListener("touchend", e => {

    const diff =
        e.changedTouches[0].clientX - startX;

    if (diff < -50) {
        nextSlide();
    }

    else if (diff > 50) {
        prevSlide();
    }
});

/* RESIZE */

window.addEventListener("resize", () => {
    updatePosition(false);
});

/* INIT */

updatePosition(false);