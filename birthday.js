/**
 * birthday.js — Anasooya's Birthday Surprise 🎂
 *
 * ┌─────────────────────────────────────────────────┐
 *   CHANGE THIS BEFORE SENDING TO ANASOOYA:
 *   Set MODE to 'anasooya' when handing off the app.
 * └─────────────────────────────────────────────────┘
 *
 * TO REMOVE AFTER BIRTHDAY:
 *   1. Delete this file (birthday.js)
 *   2. Remove the <script src="birthday.js"> line from index.html
 *   Done — zero trace left behind.
 */

(function () {

    // ─────────────────────────────────────────────
    //  CONFIG — edit this section only
    // ─────────────────────────────────────────────
    const CONFIG = {
        // 'me'       → developer mode: shows every single page load, no limits
        // 'anasooya' → gift mode: shows MAX_SHOWS times then never again
        mode: 'anasooya',

        // How many times Anasooya sees it (only applies when mode = 'anasooya')
        maxShows: 2,

        // How long the overlay stays on screen (milliseconds)
        duration: 10000,
    };
    // ─────────────────────────────────────────────

    const STORAGE_KEY = 'anasooya_bday_seen';

    // --- Visit logic ---
    if (CONFIG.mode === 'anasooya') {
        // Gift mode: count visits and stop after maxShows
        const seen = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
        if (seen >= CONFIG.maxShows) return;
        localStorage.setItem(STORAGE_KEY, String(seen + 1));
        const isFirstVisit = seen === 0;
        window.addEventListener('load', () => {
            setTimeout(() => launch(isFirstVisit, CONFIG.duration), 600);
        });
    } else {
        // Developer mode: always show full effect, never save to localStorage
        console.log('%c🎂 Birthday — developer mode (shows every load). Change CONFIG.mode to \'anasooya\' before gifting!', 'color: #c084fc; font-size: 13px; font-weight: bold;');
        window.addEventListener('load', () => {
            setTimeout(() => launch(true, CONFIG.duration), 600);
        });
    }

    // ─────────────────────────────────────────────
    //  MAIN LAUNCHER
    // ─────────────────────────────────────────────
    function launch(full, duration) {
        injectStyles();

        const overlay = createOverlay(full);
        document.body.appendChild(overlay);

        // Scale particle counts to screen size
        const w = window.innerWidth;
        const isMobile  = w <= 480;
        const isTablet  = w > 480 && w <= 900;

        const counts = full ? {
            balloons:  isMobile ? 8  : isTablet ? 12 : 18,
            petals:    isMobile ? 14 : isTablet ? 20 : 30,
            sparkles:  isMobile ? 18 : isTablet ? 28 : 40,
            confetti:  isMobile ? 50 : isTablet ? 80 : 120,
        } : {
            balloons:  isMobile ? 4  : isTablet ? 5  : 7,
            petals:    isMobile ? 6  : isTablet ? 10 : 14,
            sparkles:  isMobile ? 8  : isTablet ? 14 : 20,
            confetti:  isMobile ? 20 : isTablet ? 35 : 50,
        };

        spawnBalloons(overlay, counts.balloons);
        spawnPetals(overlay, counts.petals);
        spawnSparkles(overlay, counts.sparkles);
        startConfetti(overlay, counts.confetti, duration);

        // Auto-dismiss after duration
        setTimeout(() => dismiss(overlay), duration);
    }

    // ─────────────────────────────────────────────
    //  OVERLAY + MESSAGE
    // ─────────────────────────────────────────────
    function createOverlay(full) {
        const overlay = document.createElement('div');
        overlay.className = 'bday-overlay';

        // Message card
        const card = document.createElement('div');
        card.className = 'bday-card' + (full ? '' : ' bday-card--small');

        const emoji = document.createElement('div');
        emoji.className = 'bday-emoji';
        emoji.textContent = '🎂';

        const line1 = document.createElement('div');
        line1.className = 'bday-line1';
        line1.textContent = full ? 'Hey Anasooya,' : '🎀 Once more for you,';

        const line2 = document.createElement('div');
        line2.className = 'bday-line2';
        line2.textContent = 'Happy Birthday!';

        const line3 = document.createElement('div');
        line3.className = 'bday-line3';
        line3.textContent = full
            ? 'This app is made just for you 🎨'
            : 'Hope your day was magical ✨';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'bday-close';
        closeBtn.textContent = '✕';
        closeBtn.setAttribute('aria-label', 'Close birthday message');
        closeBtn.addEventListener('click', () => dismiss(overlay));

        card.appendChild(emoji);
        card.appendChild(line1);
        card.appendChild(line2);
        card.appendChild(line3);
        card.appendChild(closeBtn);
        overlay.appendChild(card);

        return overlay;
    }

    function dismiss(overlay) {
        overlay.classList.add('bday-overlay--out');
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }

    // ─────────────────────────────────────────────
    //  BALLOONS 🎈
    // ─────────────────────────────────────────────
    const BALLOON_COLORS = [
        '#ff6eb4', '#ff9de2', '#c084fc', '#a78bfa',
        '#f472b6', '#fb7185', '#e879f9', '#60a5fa'
    ];

    function spawnBalloons(parent, count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const b = document.createElement('div');
                b.className = 'bday-balloon';
                const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
                const size  = rand(38, 62);
                const left  = rand(2, 96);
                const dur   = rand(6000, 11000);
                const delay = rand(0, 3000);
                const sway  = rand(20, 50) * (Math.random() > 0.5 ? 1 : -1);

                b.style.cssText = `
                    left: ${left}%;
                    width: ${size}px;
                    height: ${size * 1.2}px;
                    background: ${color};
                    animation-duration: ${dur}ms;
                    animation-delay: ${delay}ms;
                    --sway: ${sway}px;
                `;

                // String
                const str = document.createElement('div');
                str.className = 'bday-balloon-string';
                str.style.borderColor = color;
                b.appendChild(str);

                parent.appendChild(b);
                setTimeout(() => b.remove(), dur + delay + 500);
            }, i * 180);
        }
    }

    // ─────────────────────────────────────────────
    //  PETALS 🌸
    // ─────────────────────────────────────────────
    const PETAL_EMOJIS = ['🌸', '🌺', '🌷', '💮', '🏵️'];

    function spawnPetals(parent, count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const p = document.createElement('div');
                p.className = 'bday-petal';
                p.textContent = PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)];
                const left  = rand(0, 98);
                const size  = rand(14, 28);
                const dur   = rand(4000, 8000);
                const delay = rand(0, 4000);
                const spin  = rand(180, 720) * (Math.random() > 0.5 ? 1 : -1);

                p.style.cssText = `
                    left: ${left}%;
                    font-size: ${size}px;
                    animation-duration: ${dur}ms;
                    animation-delay: ${delay}ms;
                    --spin: ${spin}deg;
                `;

                parent.appendChild(p);
                setTimeout(() => p.remove(), dur + delay + 500);
            }, i * 100);
        }
    }

    // ─────────────────────────────────────────────
    //  SPARKLES ✨
    // ─────────────────────────────────────────────
    function spawnSparkles(parent, count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const s = document.createElement('div');
                s.className = 'bday-sparkle';
                s.textContent = Math.random() > 0.5 ? '✨' : '⭐';
                const left = rand(2, 96);
                const top  = rand(5, 85);
                const size = rand(12, 26);
                const dur  = rand(800, 1800);

                s.style.cssText = `
                    left: ${left}%;
                    top: ${top}%;
                    font-size: ${size}px;
                    animation-duration: ${dur}ms;
                `;

                parent.appendChild(s);
                setTimeout(() => s.remove(), dur + 200);
            }, i * 200);
        }
    }

    // ─────────────────────────────────────────────
    //  CONFETTI 🎉
    // ─────────────────────────────────────────────
    const CONFETTI_COLORS = [
        '#ff6eb4', '#ffd700', '#c084fc', '#60a5fa',
        '#34d399', '#fb923c', '#f472b6', '#a78bfa'
    ];

    function startConfetti(parent, count, duration) {
        const canvas = document.createElement('canvas');
        canvas.className = 'bday-confetti-canvas';
        parent.appendChild(canvas);

        const ctx    = canvas.getContext('2d');
        let pieces   = [];
        let rafId;

        function resize() {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Spawn pieces in waves
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                pieces.push({
                    x:      Math.random() * canvas.width,
                    y:      -10,
                    w:      rand(6, 14),
                    h:      rand(4, 9),
                    color:  CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                    vx:     rand(-2, 2),
                    vy:     rand(2, 5),
                    angle:  Math.random() * Math.PI * 2,
                    spin:   (Math.random() - 0.5) * 0.18,
                    alpha:  1,
                    shape:  Math.random() > 0.5 ? 'rect' : 'circle'
                });
            }, i * 60);
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces = pieces.filter(p => p.alpha > 0.05);

            for (const p of pieces) {
                p.x     += p.vx;
                p.y     += p.vy;
                p.angle += p.spin;
                p.vy    += 0.04; // gravity

                // Fade out near bottom
                if (p.y > canvas.height * 0.75) p.alpha -= 0.015;

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;

                if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                }
                ctx.restore();
            }

            if (pieces.length > 0) {
                rafId = requestAnimationFrame(draw);
            } else {
                cancelAnimationFrame(rafId);
            }
        }

        draw();

        // Stop spawning after duration, clean up canvas
        setTimeout(() => {
            cancelAnimationFrame(rafId);
            canvas.remove();
        }, duration + 1000);
    }

    // ─────────────────────────────────────────────
    //  STYLES
    // ─────────────────────────────────────────────
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lato:wght@300;400&display=swap');

            .bday-overlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                pointer-events: none;
                overflow: hidden;
                opacity: 1;
                transition: opacity 0.8s ease;
            }

            .bday-overlay--out {
                opacity: 0;
            }

            /* Card */
            .bday-card {
                pointer-events: all;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.6);
                background: linear-gradient(135deg,
                    rgba(255,182,230,0.92) 0%,
                    rgba(220,180,255,0.92) 50%,
                    rgba(180,210,255,0.92) 100%);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 2px solid rgba(255,255,255,0.6);
                border-radius: 32px;
                padding: 44px 52px 36px;
                text-align: center;
                box-shadow:
                    0 24px 64px rgba(200, 100, 180, 0.35),
                    0 0 0 1px rgba(255,255,255,0.3) inset;
                animation: bdayCardIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                max-width: 480px;
                width: 90vw;
            }

            .bday-card--small {
                padding: 28px 36px 24px;
                max-width: 360px;
            }

            @keyframes bdayCardIn {
                from { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
                to   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
            }

            .bday-emoji {
                font-size: 56px;
                line-height: 1;
                margin-bottom: 12px;
                animation: bdayBounce 1.2s ease infinite alternate;
                display: inline-block;
            }

            .bday-card--small .bday-emoji { font-size: 38px; }

            @keyframes bdayBounce {
                from { transform: translateY(0) rotate(-5deg); }
                to   { transform: translateY(-10px) rotate(5deg); }
            }

            .bday-line1 {
                font-family: 'Lato', sans-serif;
                font-weight: 300;
                font-size: 1rem;
                color: rgba(100, 50, 120, 0.85);
                letter-spacing: 0.08em;
                margin-bottom: 4px;
            }

            .bday-line2 {
                font-family: 'Great Vibes', cursive;
                font-size: 3.6rem;
                color: #7c1fa0;
                line-height: 1.1;
                text-shadow:
                    0 2px 8px rgba(180, 80, 200, 0.25),
                    0 0 40px rgba(220, 150, 255, 0.4);
                margin-bottom: 8px;
                animation: bdayGlow 2s ease-in-out infinite alternate;
            }

            .bday-card--small .bday-line2 { font-size: 2.6rem; }

            @keyframes bdayGlow {
                from { text-shadow: 0 2px 8px rgba(180,80,200,0.2), 0 0 20px rgba(220,150,255,0.3); }
                to   { text-shadow: 0 2px 16px rgba(180,80,200,0.5), 0 0 60px rgba(220,150,255,0.6); }
            }

            .bday-line3 {
                font-family: 'Great Vibes', cursive;
                font-size: 1.5rem;
                color: rgba(120, 60, 160, 0.9);
                margin-bottom: 20px;
            }

            .bday-card--small .bday-line3 { font-size: 1.2rem; }

            .bday-close {
                position: absolute;
                top: 14px;
                right: 16px;
                background: rgba(255,255,255,0.4);
                border: 1px solid rgba(255,255,255,0.6);
                border-radius: 50%;
                width: 30px;
                height: 30px;
                font-size: 0.75rem;
                cursor: pointer;
                color: #7c1fa0;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }

            .bday-close:hover { background: rgba(255,255,255,0.7); }

            /* Balloons */
            .bday-balloon {
                position: absolute;
                bottom: -80px;
                border-radius: 50% 50% 50% 50% / 55% 55% 45% 45%;
                animation: bdayFloat linear forwards;
                pointer-events: none;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
            }

            .bday-balloon::after {
                content: '';
                position: absolute;
                top: 12%;
                left: 20%;
                width: 25%;
                height: 18%;
                background: rgba(255,255,255,0.35);
                border-radius: 50%;
                transform: rotate(-30deg);
            }

            .bday-balloon-string {
                position: absolute;
                bottom: -18px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 18px;
                border-left: 1.5px dashed;
                opacity: 0.6;
            }

            @keyframes bdayFloat {
                0%   { transform: translateX(0) translateY(0); opacity: 0; }
                5%   { opacity: 1; }
                50%  { transform: translateX(var(--sway)) translateY(-55vh); }
                95%  { opacity: 1; }
                100% { transform: translateX(0) translateY(-115vh); opacity: 0; }
            }

            /* Petals */
            .bday-petal {
                position: absolute;
                top: -40px;
                animation: bdayPetalFall linear forwards;
                pointer-events: none;
                user-select: none;
            }

            @keyframes bdayPetalFall {
                0%   { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
                5%   { opacity: 1; }
                50%  { transform: translateY(50vh) rotate(calc(var(--spin) * 0.5)) translateX(30px); }
                95%  { opacity: 0.8; }
                100% { transform: translateY(110vh) rotate(var(--spin)) translateX(-20px); opacity: 0; }
            }

            /* Sparkles */
            .bday-sparkle {
                position: absolute;
                animation: bdaySparkle ease-in-out infinite alternate;
                pointer-events: none;
                user-select: none;
            }

            @keyframes bdaySparkle {
                0%   { transform: scale(0.4) rotate(-20deg); opacity: 0; }
                40%  { opacity: 1; }
                100% { transform: scale(1.2) rotate(20deg); opacity: 0.2; }
            }

            /* Confetti canvas */
            .bday-confetti-canvas {
                position: absolute;
                inset: 0;
                pointer-events: none;
            }

            /* ── Tablet: 481px – 900px ── */
            @media (min-width: 481px) and (max-width: 900px) {
                .bday-card {
                    padding: 36px 40px 30px;
                    max-width: 420px;
                    border-radius: 26px;
                }

                .bday-emoji {
                    font-size: 46px;
                    margin-bottom: 10px;
                }

                .bday-line1 {
                    font-size: 0.9rem;
                }

                .bday-line2 {
                    font-size: 3rem;
                }

                .bday-line3 {
                    font-size: 1.3rem;
                    margin-bottom: 16px;
                }

                .bday-close {
                    width: 34px;
                    height: 34px;
                    font-size: 0.8rem;
                }
            }

            /* ── Mobile: up to 480px ── */
            @media (max-width: 480px) {
                .bday-card {
                    padding: 28px 22px 24px;
                    max-width: 92vw;
                    border-radius: 20px;
                }

                .bday-emoji {
                    font-size: 38px;
                    margin-bottom: 8px;
                }

                .bday-line1 {
                    font-size: 0.78rem;
                    letter-spacing: 0.05em;
                }

                .bday-line2 {
                    font-size: 2.4rem;
                }

                .bday-line3 {
                    font-size: 1.1rem;
                    margin-bottom: 14px;
                }

                .bday-close {
                    top: 10px;
                    right: 12px;
                    width: 28px;
                    height: 28px;
                    font-size: 0.7rem;
                }

                /* Smaller card variant on mobile */
                .bday-card--small {
                    padding: 20px 18px 18px;
                }

                .bday-card--small .bday-line2 {
                    font-size: 2rem;
                }
            }

            /* ── Landscape phone: short viewport ── */
            @media (max-width: 900px) and (orientation: landscape) and (max-height: 500px) {
                .bday-card {
                    padding: 16px 32px 14px;
                    max-width: 500px;
                    border-radius: 16px;
                    /* Shift card up slightly so it clears the keyboard / nav bar */
                    top: 48%;
                }

                .bday-emoji {
                    font-size: 28px;
                    margin-bottom: 4px;
                }

                .bday-line1 {
                    font-size: 0.72rem;
                }

                .bday-line2 {
                    font-size: 2rem;
                    margin-bottom: 2px;
                }

                .bday-line3 {
                    font-size: 1rem;
                    margin-bottom: 10px;
                }

                .bday-close {
                    top: 8px;
                    right: 10px;
                    width: 26px;
                    height: 26px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ─────────────────────────────────────────────
    //  UTILITY
    // ─────────────────────────────────────────────
    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

})();
