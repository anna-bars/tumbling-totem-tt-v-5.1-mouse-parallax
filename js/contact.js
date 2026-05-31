(function () {

    const contact = document.querySelector('.contact');
    if (!contact) return;

    const inscription = document.querySelector('.contact-inscription');

    const style = document.createElement('style');
    style.textContent = `
        .ct-dot {
            position: fixed;
            pointer-events: none;
            z-index: 99999;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            mix-blend-mode: screen;
            transition: opacity 0.4s ease;
        }
    `;
    document.head.appendChild(style);

    const DOT_COUNT = 8;
    const dots = [];

    for (let i = 0; i < DOT_COUNT; i++) {
        const d = document.createElement('div');
        d.className = 'ct-dot';
        // i=0 closest to cursor (large), i=DOT_COUNT-1 closest to email (small)
        const t = i / (DOT_COUNT - 1);
        const size = 5 - t * 3.2;
        const alpha = 0.75 - t * 0.5;
        d.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: rgba(230, 200, 130, ${alpha});
            box-shadow: 0 0 ${4 + t * 6}px rgba(255, 190, 80, ${0.4 - t * 0.2});
            opacity: 0;
        `;
        document.body.appendChild(d);
        dots.push(d);
    }

    let mx = 0, my = 0;
    let raf = null;

    function getEmailCenter() {
        if (!inscription) return { x: window.innerWidth / 2, y: window.innerHeight * 0.85 };
        const r = inscription.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function placeDots() {
        const email = getEmailCenter();

        dots.forEach((d, i) => {
            // t=0 → cursor, t=1 → email
            const t = i / (DOT_COUNT - 1);
            const et = t * t;
            const x = mx + (email.x - mx) * et;
            const y = my + (email.y - my) * et;
            d.style.left = x + 'px';
            d.style.top  = y + 'px';
        });

        raf = requestAnimationFrame(placeDots);
    }

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    }, { passive: true });

    contact.addEventListener('mouseenter', () => {
        dots.forEach(d => d.style.opacity = '1');
        if (!raf) raf = requestAnimationFrame(placeDots);
    });

    contact.addEventListener('mouseleave', () => {
        dots.forEach(d => d.style.opacity = '0');
        if (raf) { cancelAnimationFrame(raf); raf = null; }
    });

})();