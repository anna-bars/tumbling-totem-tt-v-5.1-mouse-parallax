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
        this.isHoveringActive = false;
        this._hoverTimer  = null;

        // ── Inject overlays into ALL slides ─────────────────────
        this.slides.forEach(slide => {
            const title = slide.dataset.overlayTitle || '';
            const desc  = slide.dataset.overlayDesc  || '';
            if (!title && !desc) return;
            const ov = document.createElement('div');
            ov.className = 'work-item-click-overlay';
            ov.innerHTML = `<p class="overlay-title">${title}</p><p class="overlay-desc">${desc}</p>`;
            ov.style.pointerEvents = 'none';
            slide.appendChild(ov);
        });

        // ── Cursor ───────────────────────────────────────────────
        this.cursor = document.createElement("div");
        this.cursor.className = "works-cursor";
        this.cursor.innerHTML = `<span class="works-cursor-label">HOLD &<br>DRAG</span>`;
        document.body.appendChild(this.cursor);

        this.cursorLabel = this.cursor.querySelector('.works-cursor-label');

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

    // ── Cursor label ─────────────────────────────────────────────
    _setLabel(text) {
        this.cursorLabel.style.opacity = '0';
        setTimeout(() => {
            this.cursorLabel.innerHTML = text;
            this.cursorLabel.style.opacity = '1';
        }, 200);
    }

    _onEnterActive() {
        // Մտնելիս — HOLD & DRAG, 2 վայրկյան հետո CLICK
        this._setLabel('HOLD &<br>DRAG');
        clearTimeout(this._hoverTimer);
        this._hoverTimer = setTimeout(() => {
            if (this.isHoveringActive && !this.isDragging) {
                this._setLabel('CLICK');
            }
        }, 2000);
    }

    _onLeaveActive() {
        clearTimeout(this._hoverTimer);
        this._setLabel('HOLD &<br>DRAG');
    }

    // ── Slide logic ─────────────────────────────────────────────
    updateClasses() {
        this.slides.forEach(s =>
            s.classList.remove("is-active", "is-prev", "is-next", "is-revealed"));
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
        // Slide-ը փոխվեց — reset
        this.isHoveringActive = false;
        clearTimeout(this._hoverTimer);
        this._setLabel('HOLD &<br>DRAG');
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

    // ── Click toggle ─────────────────────────────────────────────
    _toggleOverlay(clickedSlide) {
        const isRevealed = clickedSlide.classList.contains('is-revealed');
        this.slides.forEach(s => s.classList.remove('is-revealed'));
        if (!isRevealed) {
            clickedSlide.classList.add('is-revealed');
        }
    }

    // ── Events ───────────────────────────────────────────────────
    _bindEvents() {
        const zone = this.cursorZone;

        zone.addEventListener("mouseenter", () => {
            this.cursor.classList.add("is-visible");
        });
        zone.addEventListener("mouseleave", () => {
            this.cursor.classList.remove("is-visible", "is-dragging");
            this.isDragging = false;
            if (this.isHoveringActive) {
                this.isHoveringActive = false;
                this._onLeaveActive();
            }
        });

        window.addEventListener("mousemove", e => {
            this.cursorX = e.clientX;
            this.cursorY = e.clientY;

            if (this.isDragging) {
                const move = e.clientX - this.startX;
                this.cursor.style.setProperty("--drag-offset", `${move * 0.18}px`);
                return;
            }

            const active = this.slides[this.currentIndex];
            if (active) {
                const rect = active.getBoundingClientRect();
                const over =
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top  &&
                    e.clientY <= rect.bottom;

                if (over && !this.isHoveringActive) {
                    this.isHoveringActive = true;
                    this._onEnterActive();
                } else if (!over && this.isHoveringActive) {
                    this.isHoveringActive = false;
                    this._onLeaveActive();
                }
            }
        });

        zone.addEventListener("mousedown", e => {
            this.isDragging = true;
            this.startX = e.clientX;
            this.cursor.classList.add("is-dragging");
            clearTimeout(this._hoverTimer);
            this.cursorLabel.style.opacity = '1';
            this.cursorLabel.innerHTML = 'HOLD &<br>DRAG';
            this._clickTarget = this.slides.find(s => s.contains(e.target)) || null;
        });

        window.addEventListener("mouseup", e => {
            if (!this.isDragging) return;
            const diff = e.clientX - this.startX;
            this.cursor.classList.remove("is-dragging");
            this.cursor.style.setProperty("--drag-offset", "0px");

            if (Math.abs(diff) < 10) {
                if (this._clickTarget) {
                    this._toggleOverlay(this._clickTarget);
                }
            } else if (diff < -80) {
                this.nextSlide();
            } else if (diff > 80) {
                this.prevSlide();
            }

            this.isDragging = false;
            this._clickTarget = null;

            // Re-check hover after mouseup
            const active = this.slides[this.currentIndex];
            if (active && this.isHoveringActive) {
                this._onEnterActive();
            }
        });

        zone.addEventListener("touchstart", e => {
            this.isDragging = true;
            this.startX = e.touches[0].clientX;
            this._clickTarget = this.slides.find(s => s.contains(e.target)) || null;
        });
        window.addEventListener("touchend", e => {
            if (!this.isDragging) return;
            const diff = e.changedTouches[0].clientX - this.startX;

            if (Math.abs(diff) < 10) {
                if (this._clickTarget) {
                    this._toggleOverlay(this._clickTarget);
                }
            } else if (diff < -80) {
                this.nextSlide();
            } else if (diff > 80) {
                this.prevSlide();
            }

            this.isDragging = false;
            this._clickTarget = null;
        });

        window.addEventListener("resize", () => this.centerSlide(false));
    }
}

/* =========================================================
   INIT — մեկ slider ամեն .featured-works section-ի համար
========================================================= */
document.querySelectorAll(".featured-works").forEach(section => {
    new WorksSlider(section);
});