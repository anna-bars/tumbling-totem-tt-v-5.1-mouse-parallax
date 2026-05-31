(function () {

    const contact = document.querySelector('.contact');
    if (!contact) return;

    const inscription = document.querySelector('.contact-inscription');

    // ── Create single arrow hint ────────────────────────────────────────
    const hint = document.createElement('div');
    hint.className = 'contact-cursor-hint';
    hint.innerHTML = `<span class="hint-arr">↓</span>`;
    document.body.appendChild(hint);

    // ── CSS ─────────────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        .contact-cursor-hint {
            position: fixed;
            pointer-events: none;
            z-index: 99999;
            opacity: 0;
            transform: translate(-50%, -50%) rotate(0deg);
            transition: opacity 0.3s ease;
            mix-blend-mode: screen;
        }
        .contact-cursor-hint.visible {
            opacity: 1;
        }
        .hint-arr {
            display: block;
            font-size: 20px;
            color: rgba(230, 205, 155, 0.85);
            text-shadow: 0 0 14px rgba(255, 200, 100, 0.5);
            font-family: 'Urbanist', sans-serif;
            line-height: 1;
        }
    `;
    document.head.appendChild(style);

    // ── State ───────────────────────────────────────────────────────────
    let inside = false;
    let raf = null;
    let currentAngle = 0;
    let targetAngle  = 0;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
        currentAngle = lerp(currentAngle, targetAngle, 0.08);
        hint.style.transform = `translate(-50%, -50%) rotate(${currentAngle}deg)`;
        raf = requestAnimationFrame(tick);
    }

    // ── Mouse move ──────────────────────────────────────────────────────
    document.addEventListener('mousemove', (e) => {
        hint.style.left = e.clientX + 'px';
        hint.style.top  = e.clientY + 'px';

        if (!inside || !inscription) return;

        const ir = inscription.getBoundingClientRect();
        const tx = ir.left + ir.width  / 2;
        const ty = ir.top  + ir.height / 2;

        const dx = tx - e.clientX;
        const dy = ty - e.clientY;

        // angle from cursor toward inscription; ↓ arrow base = 0 deg
        const angle = Math.atan2(-dx, dy) * (180 / Math.PI);
        targetAngle = angle;
    }, { passive: true });

    // ── Enter / leave ────────────────────────────────────────────────────
    contact.addEventListener('mouseenter', () => {
        inside = true;
        hint.classList.add('visible');
        if (!raf) raf = requestAnimationFrame(tick);
    });

    contact.addEventListener('mouseleave', () => {
        inside = false;
        hint.classList.remove('visible');
        if (raf) { cancelAnimationFrame(raf); raf = null; }
    });

})();