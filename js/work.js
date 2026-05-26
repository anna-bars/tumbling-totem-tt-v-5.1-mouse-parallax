const track = document.getElementById("worksTrack");

let slides = Array.from(track.children);

let currentIndex = 1;

/* UPDATE CLASSES */

function updateClasses() {

    slides.forEach(slide => {
        slide.classList.remove(
            "is-active",
            "is-prev",
            "is-next"
        );
    });

    slides[currentIndex]?.classList.add("is-active");

    slides[currentIndex - 1]?.classList.add("is-prev");

    slides[currentIndex + 1]?.classList.add("is-next");
}

/* CENTER ACTIVE */

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

/* NEXT */

function nextSlide() {

    if (track.classList.contains("animating")) return;

    track.classList.add("animating");

    currentIndex++;

    centerSlide(true);

    track.addEventListener("transitionend", handleNext, { once: true });
}

function handleNext() {

    if (currentIndex >= slides.length - 1) {

        const first = slides.shift();

        track.appendChild(first);

        slides.push(first);

        currentIndex--;

        centerSlide(false);
    }

    track.classList.remove("animating");
}

/* PREV */

function prevSlide() {

    if (track.classList.contains("animating")) return;

    track.classList.add("animating");

    if (currentIndex <= 0) {

        const last = slides.pop();

        track.prepend(last);

        slides.unshift(last);

        currentIndex++;

        centerSlide(false);
    }

    requestAnimationFrame(() => {

        currentIndex--;

        centerSlide(true);

        track.addEventListener("transitionend", () => {

            track.classList.remove("animating");

        }, { once: true });

    });
}

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

    centerSlide(false);
});

/* INIT */

centerSlide(false);