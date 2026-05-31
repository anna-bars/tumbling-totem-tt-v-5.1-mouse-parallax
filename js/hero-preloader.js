(function () {

    // ── All hero images to preload ──────────────────────────────────────
    const HERO_IMAGES = [
        './img/hero/background.png',
        './img/hero/darkness.png',
        './img/hero/layer-1-sky.png',
        './img/hero/layer-2-mountains.png',
        './img/hero/layer-3-hills-back.png',
        './img/hero/layer-4-temple.png',
        './img/hero/layer-5-jungle-mid.png',
        './img/hero/layer-6-jungle-front.png',
        './img/hero/layer-7-foreground.png',
        './img/hero/tumbling-totem-logo.png',
        './img/hero/bottom-line.png',
        './img/hero/leaves-vines-left.png',
        './img/hero/leaves-vines-right.png',
        './img/hero/fog/fog_olips_left.png',
        './img/hero/fog/fog_olips_right.png',
        './img/hero/fog/fog-triangle-left.png',
        './img/hero/fog/fog-triangle-right.png',
        './img/hero/fog/fog-triangle-top.png',
    ];

    // ── Inject styles ───────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        #tt-loader {
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: #0d1a1f;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 28px;
            transition: opacity 0.9s ease;
        }

        #tt-loader.fade-out {
            opacity: 0;
            pointer-events: none;
        }

        .tt-loader-logo {
            width: 220px;
            opacity: 0.85;
        }

        .tt-loader-bar-wrap {
            width: 180px;
            height: 1px;
            background: rgba(210, 180, 110, 0.15);
            border-radius: 2px;
            overflow: hidden;
        }

        .tt-loader-bar {
            height: 100%;
            width: 0%;
            background: rgba(230, 200, 130, 0.7);
            box-shadow: 0 0 8px rgba(255, 190, 80, 0.4);
            transition: width 0.2s ease;
            border-radius: 2px;
        }

        .tt-loader-label {
            font-family: 'Urbanist', sans-serif;
            font-size: 10px;
            letter-spacing: 0.35em;
            color: rgba(210, 180, 110, 0.35);
            text-transform: uppercase;
        }

        body.tt-loading {
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);

    // ── Build loader DOM ────────────────────────────────────────────────
    const loader = document.createElement('div');
    loader.id = 'tt-loader';
    loader.innerHTML = `
        <img class="tt-loader-logo" src="./img/hero/tumbling-totem-logo.png" alt="Tumbling Totem">
        <div class="tt-loader-bar-wrap">
            <div class="tt-loader-bar" id="ttBar"></div>
        </div>
        <span class="tt-loader-label">Loading</span>
    `;
    document.body.prepend(loader);
    document.body.classList.add('tt-loading');

    const bar = document.getElementById('ttBar');

    // ── Preload images ──────────────────────────────────────────────────
    let loaded = 0;
    const total = HERO_IMAGES.length;

    function onLoad() {
        loaded++;
        const pct = Math.round((loaded / total) * 100);
        bar.style.width = pct + '%';

        if (loaded >= total) reveal();
    }

    HERO_IMAGES.forEach(src => {
        const img = new Image();
        img.onload  = onLoad;
        img.onerror = onLoad; // don't hang on missing assets
        img.src = src;
    });

    // ── Reveal ──────────────────────────────────────────────────────────
    function reveal() {
        // small pause so bar visually hits 100% before fade
        setTimeout(() => {
            loader.classList.add('fade-out');
            document.body.classList.remove('tt-loading');

            loader.addEventListener('transitionend', () => {
                loader.remove();
            }, { once: true });
        }, 350);
    }

    // ── Safety fallback — never hang longer than 6s ─────────────────────
    setTimeout(reveal, 6000);

})();