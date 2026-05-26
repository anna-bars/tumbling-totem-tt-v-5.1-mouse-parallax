const track = document.getElementById("worksTrack");
const dragHint = document.getElementById("dragHint");

let slides = Array.from(track.children);

let currentIndex = 1;

/* =========================================
   UPDATE CLASSES
========================================= */
console.log(dragHint);
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

    track.style.transform =
        `translateX(${-offset}px)`;

    updateClasses();
}

/* =========================================
   NEXT
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

/* =========================================
   PREV
========================================= */

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
   DRAG SYSTEM
========================================= */

let isDragging = false;

let startX = 0;

dragHint.addEventListener("mousedown", e => {

    isDragging = true;

    startX = e.clientX;

    dragHint.classList.add("dragging");
});

window.addEventListener("mousemove", e => {

    if (!isDragging) return;

    const move = e.clientX - startX;

    dragHint.style.transform =
        `translateY(-50%) translateX(${move * .35}px) scale(1.08)`;
});

window.addEventListener("mouseup", e => {

    if (!isDragging) return;

    const diff = e.clientX - startX;

    dragHint.classList.remove("dragging");

    dragHint.style.transform =
        `translateY(-50%)`;

    if (diff < -80) {

        nextSlide();

    } else if (diff > 80) {

        prevSlide();
    }

    isDragging = false;
});

/* =========================================
   TOUCH
========================================= */

dragHint.addEventListener("touchstart", e => {

    isDragging = true;

    startX = e.touches[0].clientX;

    dragHint.classList.add("dragging");
});

window.addEventListener("touchmove", e => {

    if (!isDragging) return;

    const move =
        e.touches[0].clientX - startX;

    dragHint.style.transform =
        `translateY(-50%) translateX(${move * .35}px) scale(1.08)`;
});

window.addEventListener("touchend", e => {

    if (!isDragging) return;

    const diff =
        e.changedTouches[0].clientX - startX;

    dragHint.classList.remove("dragging");

    dragHint.style.transform =
        `translateY(-50%)`;

    if (diff < -80) {

        nextSlide();

    } else if (diff > 80) {

        prevSlide();
    }

    isDragging = false;
});

/* =========================================
   RESIZE
========================================= */

window.addEventListener("resize", () => {

    centerSlide(false);

});

/* =========================================
   INIT
========================================= */

centerSlide(false);