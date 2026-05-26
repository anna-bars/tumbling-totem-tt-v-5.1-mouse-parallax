/* =========================================================
   WorksSlider — reusable class, supports multiple instances
   Usage: new WorksSlider(sectionEl)
========================================================= */

class WorksSlider {

    constructor(section) {
        this.section    = section;
        this.cursorZone = section.querySelector(".featured-works-cont");
        this.track      = section.querySelector(".featured-works-track");
        const hint      = section.querySelector(".drag-hint");
        if (hint) hint.style.display = "none";

        this.slides       = Array.from(this.track.children);
        this.currentIndex = 1;
        this.isDragging   = false;
        this.startX       = 0;

        // ── Cursor ───────────────────────────────────────────────
        this.cursor = document.createElement("div");
        this.cursor.className = "works-cursor";
        this.cursor.innerHTML = `<span class="works-cursor-label">HOLD &<br>DRAG</span>`;
        document.body.appendChild(this.cursor);

        this.cursorX = 0; this.cursorY = 0;
        this.smoothX = 0; this.smoothY = 0;

        this._bindEvents();
        this._animateCursor();
        this.centerSlide(false);
    }

    // ── Helpers ─────────────────────────────────────────────────
    lerp(a, b, t) { return a + (b - a) * t; }

    // ── Cursor RAF ──────────────────────────────────────────────
    _animateCursor() {
        this.smoothX = this.lerp(this.smoothX, this.cursorX, 0.12);
        this.smoothY = this.lerp(this.smoothY, this.cursorY, 0.12);
        this.cursor.style.transform =
            `translate(${this.smoothX}px, ${this.smoothY}px) translate(-50%, -50%)`;
        requestAnimationFrame(() => this._animateCursor());
    }

    // ── Slide logic ─────────────────────────────────────────────
    updateClasses() {
        this.slides.forEach(s =>
            s.classList.remove("is-active", "is-prev", "is-next"));
        this.slides[this.currentIndex]?.classList.add("is-active");
        this.slides[this.currentIndex - 1]?.classList.add("is-prev");
        this.slides[this.currentIndex + 1]?.classList.add("is-next");
    }

    centerSlide(animated = true) {
        const active = this.slides[this.currentIndex];
        const offset =
            active.offsetLeft -
            (window.innerWidth / 2) +
            (active.offsetWidth / 2);

        this.track.style.transition = animated
            ? "transform .8s cubic-bezier(.77,0,.18,1)"
            : "none";
        this.track.style.transform = `translateX(${-offset}px)`;
        this.updateClasses();
    }

    nextSlide() {
        if (this.track.dataset.animating === "true") return;
        this.track.dataset.animating = "true";
        this.currentIndex++;
        this.centerSlide(true);
        this.track.addEventListener("transitionend", () => {
            if (this.currentIndex >= this.slides.length - 1) {
                const first = this.slides.shift();
                this.track.appendChild(first);
                this.slides.push(first);
                this.currentIndex--;
                this.centerSlide(false);
            }
            this.track.dataset.animating = "false";
        }, { once: true });
    }

    prevSlide() {
        if (this.track.dataset.animating === "true") return;
        this.track.dataset.animating = "true";
        this.currentIndex--;
        this.centerSlide(true);
        this.track.addEventListener("transitionend", () => {
            if (this.currentIndex <= 0) {
                const last = this.slides.pop();
                this.track.prepend(last);
                this.slides.unshift(last);
                this.currentIndex++;
                this.centerSlide(false);
            }
            this.track.dataset.animating = "false";
        }, { once: true });
    }

    // ── Events ───────────────────────────────────────────────────
    _bindEvents() {
        const zone = this.cursorZone;

        // Cursor show/hide
        zone.addEventListener("mouseenter", () => {
            this.cursor.classList.add("is-visible");
        });
        zone.addEventListener("mouseleave", () => {
            this.cursor.classList.remove("is-visible", "is-dragging");
            this.isDragging = false;
        });

        // Mouse position (global — needs to work even outside zone while dragging)
        window.addEventListener("mousemove", e => {
            this.cursorX = e.clientX;
            this.cursorY = e.clientY;
            if (this.isDragging) {
                const move = e.clientX - this.startX;
                this.cursor.style.setProperty("--drag-offset", `${move * 0.18}px`);
            }
        });

        // Drag start
        zone.addEventListener("mousedown", e => {
            this.isDragging = true;
            this.startX = e.clientX;
            this.cursor.classList.add("is-dragging");
        });

        // Drag end
        window.addEventListener("mouseup", e => {
            if (!this.isDragging) return;
            const diff = e.clientX - this.startX;
            this.cursor.classList.remove("is-dragging");
            this.cursor.style.setProperty("--drag-offset", "0px");
            if (diff < -80)     this.nextSlide();
            else if (diff > 80) this.prevSlide();
            this.isDragging = false;
        });

        // Touch
        zone.addEventListener("touchstart", e => {
            this.isDragging = true;
            this.startX = e.touches[0].clientX;
        });
        window.addEventListener("touchend", e => {
            if (!this.isDragging) return;
            const diff = e.changedTouches[0].clientX - this.startX;
            if (diff < -80)     this.nextSlide();
            else if (diff > 80) this.prevSlide();
            this.isDragging = false;
        });

        // Resize
        window.addEventListener("resize", () => this.centerSlide(false));
    }
}

/* =========================================================
   INIT — մեկ slider ամեն .featured-works section-ի համար
========================================================= */
document.querySelectorAll(".featured-works").forEach(section => {
    new WorksSlider(section);
});