(function () {

    /* ── 1. Split h1 words only — p and span stay intact ───────────────── */
    function splitWords(el) {
        const nodes = Array.from(el.childNodes);
        el.innerHTML = '';

        nodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const words = node.textContent.split(/(\s+)/);
                words.forEach(part => {
                    if (part.trim() === '') {
                        el.appendChild(document.createTextNode(part));
                    } else {
                        const span = document.createElement('span');
                        span.className = 'word';
                        span.textContent = part;
                        el.appendChild(span);
                    }
                });
            } else if (node.nodeName === 'BR') {
                el.appendChild(node.cloneNode());
            } else {
                el.appendChild(node);
            }
        });
    }

    const h1 = document.querySelector('.about-text h1');
    if (h1) splitWords(h1);

    // p and span — treat each as one whole animated unit, no splitting
    const p          = document.querySelector('.about-text .about-second-cont p');
    const exploreBtn = document.querySelector('.about-text .about-second-cont span');

    /* ── 2. All animated units in order ─────────────────────────────────── */
    const allUnits = [
        ...Array.from(document.querySelectorAll('.about-text h1 .word')),
        ...(p          ? [p]          : []),
        ...(exploreBtn ? [exploreBtn] : []),
    ];

    const UNIT_COUNT = allUnits.length;

    // Set initial state on all units
    allUnits.forEach(el => {
        el.style.opacity   = '0.08';
        el.style.transform = 'translateY(12px)';
        el.style.display   = el.style.display || '';   // don't override existing display
    });

    /* ── 3. Scroll direction tracking ───────────────────────────────────── */
    let lastScrollY  = window.scrollY;
    // highWaterMark = furthest scroll position reached while scrolling DOWN
    // Units only reveal up to this point; scrolling back up never re-hides them
    let highWaterMark = window.scrollY;

    /* ── 4. Scroll range calculation ────────────────────────────────────── */
    const aboutSection = document.querySelector('.about');

    function getScrollRange() {
        if (!aboutSection) return { start: 0, end: 1000 };
        const rect  = aboutSection.getBoundingClientRect();
        const scrollY = window.scrollY;
        const start = scrollY + rect.top - window.innerHeight * 0.65;
        const end   = start + window.innerHeight * 0.35;
        return { start, end };
    }

    function lerp(a, b, t) {
        return a + (b - a) * Math.max(0, Math.min(1, t));
    }

    /* ── 5. Main update ─────────────────────────────────────────────────── */
    function update() {
        const scrollY = window.scrollY;
        const scrollingDown = scrollY >= lastScrollY;
        lastScrollY = scrollY;

        // Only advance the high-water mark when scrolling down
        if (scrollingDown && scrollY > highWaterMark) {
            highWaterMark = scrollY;
        }

        // Drive animation from highWaterMark, not current scrollY
        // This means scrolling back up never un-reveals words
        const { start, end } = getScrollRange();
        const progress = (highWaterMark - start) / (end - start);

        allUnits.forEach((unit, i) => {
            const unitProgress = (progress * UNIT_COUNT) - i;
            const t = Math.max(0, Math.min(1, unitProgress));

            unit.style.opacity   = lerp(0.08, 1, t);
            unit.style.transform = `translateY(${lerp(12, 0, t)}px)`;
        });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();

})();