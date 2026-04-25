/**
 * TC 'ventures Main JavaScript
 *
 * Two responsibilities right now:
 *   1. Animate the hero on load — split the H1 into characters and stagger
 *      them in, then fade up the subtitle.
 *   2. Reveal sections marked .scroll-animate as they enter the viewport.
 *
 * GSAP and ScrollTrigger are loaded as separate <script> tags via
 * functions.php (wp_enqueue_script). They're guaranteed to be available
 * because main.js declares them as dependencies — see the third arg of
 * wp_enqueue_script('tc-ventures-main', ...).
 */

document.addEventListener('DOMContentLoaded', function () {
    initWebGLBackground();
    initKineticHero();
    initPillarReveal();
    initBlogReveal();
    initScrollReveals();
    initInkTrail();
});

/**
 * Animate the hero title (per-character) and subtitle on page load.
 *
 * Implementation notes:
 * - We split into chars at runtime rather than in PHP, so the source HTML
 *   stays clean and copy-paste-able. Splitting in JS also means we can
 *   gracefully no-op if JS fails to load — text is still readable.
 * - aria-label on the H1 (set in PHP) means screen readers read the full
 *   phrase normally; aria-hidden on each char span keeps them from being
 *   announced one letter at a time.
 * - The animation TARGETS opacity:1 / y:0. The "from" state is set in CSS
 *   (.kinetic-text .char { opacity: 0; transform: translateY(60px); }).
 *   This avoids a flash of un-styled content if JS is slow or blocked.
 */
function initKineticHero() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const heroTitle = document.querySelector('.hero-title.kinetic-text');
    const heroSubtitle = document.querySelector('.hero-subtitle.kinetic-fade');

    if (!heroTitle) return;

    if (reduceMotion) {
        // CSS @media block already revealed the content. Nothing to do.
        return;
    }

    const chars = splitIntoCharSpans(heroTitle);

    const tl = gsap.timeline({ delay: 0.2 });

    tl.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.035,
        ease: 'power3.out',
    });

    if (heroSubtitle) {
        tl.to(heroSubtitle, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
        }, '-=0.5'); // start 0.5s before the title finishes
    }
}

/**
 * Replace an element's text content with <span class="word"> > <span class="char">
 * structures, one inner span per character. Whitespace is preserved as
 * plain text nodes so words wrap cleanly on small screens.
 *
 * Returns the flat list of char spans for the caller to animate.
 */
function splitIntoCharSpans(element) {
    const text = element.textContent.trim();
    element.textContent = '';
    const chars = [];

    // Split on runs of whitespace, keeping the whitespace tokens so we can
    // re-emit them as text nodes between word containers.
    const tokens = text.split(/(\s+)/);

    for (const token of tokens) {
        if (token === '') continue;

        if (/^\s+$/.test(token)) {
            element.appendChild(document.createTextNode(token));
            continue;
        }

        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';

        for (const char of token) {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.textContent = char;
            charSpan.setAttribute('aria-hidden', 'true');
            wordSpan.appendChild(charSpan);
            chars.push(charSpan);
        }

        element.appendChild(wordSpan);
    }

    return chars;
}

/**
 * Choreographed reveal for the pillars section.
 *
 * Three overlapping waves trigger when the section enters the viewport:
 *   1. The H2 splits per-character and cascades in (same helper as the
 *      hero, but driven by ScrollTrigger instead of on load).
 *   2. The three pillar cards slide up + scale in, each tilted at a
 *      slightly different angle (-6° / 0° / +6°) so they read as
 *      choreographed instead of synchronous. Stagger of 150ms.
 *   3. The circular gradient icons pop last with a back-out overshoot
 *      from scale(0) + rotate(-120°). Stagger of 120ms.
 *
 * Timeline overlap is set with negative position offsets ('-=0.3', '-=0.5')
 * so each wave starts before the previous finishes. Total reveal ~1.6s.
 *
 * Pre-set initial states are applied via gsap.set() outside the timeline
 * so they're in place at script execution. The ScrollTrigger then plays
 * the timeline once when the section's top crosses 75% of viewport height.
 */
function initPillarReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const section = document.querySelector('.pillars-section');
    if (!section) return;

    const heading = section.querySelector('.kinetic-text-scroll');
    const cards = section.querySelectorAll('.pillar-card');
    const icons = section.querySelectorAll('.pillar-icon');

    if (cards.length === 0) return;

    // Pre-split the heading so chars exist before the trigger fires.
    let headingChars = [];
    if (heading) {
        headingChars = splitIntoCharSpans(heading);
    }

    // Per-card initial rotation. Asymmetric so they don't arrive in formation.
    const cardRotations = [-9, 3, 12];

    cards.forEach((card, i) => {
        gsap.set(card, {
            opacity: 0,
            y: 80,
            scale: 0.9,
            rotation: cardRotations[i] !== undefined ? cardRotations[i] : 0,
        });
    });

    gsap.set(icons, { scale: 0, rotation: -120 });

    // Build the timeline as paused so we can decide WHEN to play it
    // (immediate if section is already in view on load, or via scroll trigger).
    //
    // onComplete clears the inline transform GSAP leaves on each card/icon
    // after animating. Without this, CSS :hover { transform: translateY(-12px) }
    // can't override the inline `transform: translate(0,0) scale(1) rotate(0)`
    // and the lift-on-hover effect doesn't fire.
    const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
            gsap.set(cards, { clearProps: 'transform' });
            gsap.set(icons, { clearProps: 'transform' });
        },
    });

    if (headingChars.length) {
        tl.to(headingChars, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.025,
            ease: 'power3.out',
        });
    }

    tl.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.95,
        stagger: 0.25,
        ease: 'back.out(1.4)',
    }, '-=0.3');

    // Icon "wobble" — three back-easing phases overlapped into one continuous
    // motion. Phase 1 springs in past target, phase 2 pulls back slightly,
    // phase 3 settles. Position '+=0.15' on the first phase makes icons wait
    // a clear beat AFTER the last card finishes settling, so the two
    // movements read as sequential rather than concurrent.
    tl.to(icons, {
        scale: 1,
        rotation: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: 'back.out(2.25)',
    }, '+=0.15');

    tl.to(icons, {
        scale: 0.94,
        rotation: 8,
        duration: 0.22,
        stagger: 0.12,
        ease: 'back.in(1.75)',
    }, '-=0.15');

    tl.to(icons, {
        scale: 1,
        rotation: 0,
        duration: 0.28,
        stagger: 0.12,
        ease: 'back.out(1.25)',
    }, '-=0.08');

    // Trigger logic.
    //   - On page load: if the section's top is already within 75% of viewport
    //     (visible enough to be worth animating right away), fire now.
    //   - Otherwise: wait for the user to scroll until the section's top
    //     passes 40% of viewport. The previous 60% threshold fired before
    //     the user had time to look at the section.
    const rect = section.getBoundingClientRect();
    const visibleOnLoad = rect.top < window.innerHeight * 0.75;

    if (visibleOnLoad) {
        tl.play();
    } else {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 40%',
            once: true,
            onEnter: () => tl.play(),
        });
    }
}

/**
 * Decelerated tumble reveal for the blog section's post cards.
 *
 * Each card rises 100px from below + rotates back to 0° from a random
 * starting angle in [-18°, +18°]. Per-card random angles mean no two
 * tumbles look identical — every load has a different shape.
 *
 * Sequence is also randomized per load (Fisher-Yates shuffle) so the
 * reveal order surprises on every visit.
 *
 * Easing: power3.out — fast at first, gentle settle. Less dramatic than
 * power4.out so the tumble has more time to read.
 *
 * Same trigger logic as the pillar reveal (immediate on load if visible,
 * otherwise scroll-triggered). onComplete clears inline transforms so
 * the CSS hover lift on .post-card works after the reveal finishes.
 */
function initBlogReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const section = document.querySelector('.blog-section');
    if (!section) return;

    const cards = section.querySelectorAll('.post-card');
    if (cards.length === 0) return;

    // Each card gets its own random starting angle in [-18°, +18°].
    cards.forEach((card) => {
        const rotation = (Math.random() - 0.5) * 36;
        gsap.set(card, {
            opacity: 0,
            y: 100,
            rotation,
        });
    });

    // Fisher-Yates shuffle for a uniformly random reveal order. Sort with
    // a random comparator works visually for small N but is biased; this
    // is the same number of lines and unbiased.
    const ordered = Array.from(cards);
    for (let i = ordered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    }

    const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
            gsap.set(cards, { clearProps: 'transform' });
        },
    });

    tl.to(ordered, {
        opacity: 1,
        y: 0,
        rotation: 0,
        duration: 0.95,
        stagger: 0.25,
        ease: 'power3.out',
    });

    const rect = section.getBoundingClientRect();
    const visibleOnLoad = rect.top < window.innerHeight * 0.75;

    if (visibleOnLoad) {
        tl.play();
    } else {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 60%',
            once: true,
            onEnter: () => tl.play(),
        });
    }
}

/**
 * Reveal .scroll-animate sections as they enter the viewport.
 *
 * Why gsap.to() and not gsap.from(): the .scroll-animate CSS sets the
 * initial state (opacity: 0; translateY(30px)). gsap.from() would record
 * those CSS values as the target and animate from-hidden to-hidden — a
 * latent bug in the previous version of this file. Using gsap.to() with
 * explicit final values fixes that.
 *
 * toggleActions: 'play none none none' means "play once on enter; do
 * nothing on leave, re-enter, or leave-back." So the animation runs once
 * per session per element and stays in its final state.
 */
function initScrollReveals() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const sections = document.querySelectorAll('.scroll-animate');

    sections.forEach((section) => {
        gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power2.out',
        });
    });
}

/**
 * WebGL background — drifting noise gradient + cursor-reactive ambient glow.
 *
 * Architecture: one Three.js scene with an orthographic camera and a
 * fullscreen PlaneGeometry (2x2 in NDC space — covers the entire camera
 * view). The plane uses a custom ShaderMaterial:
 *
 *   - Vertex shader: pass-through; just outputs the geometry's NDC coords.
 *   - Fragment shader: per-pixel work. Reads UV coords + uTime + uMouse +
 *     uResolution uniforms. Combines:
 *       * Multi-octave 2D simplex noise that morphs over time → organic
 *         drifting blobs in indigo / cyan against a deep navy base.
 *       * Cursor-reactive radial glow: exponential falloff from uMouse
 *         in cyan, additively blended on top.
 *       * Subtle vignette: edges darken slightly for cinematic depth.
 *
 * Mouse handling uses lerp smoothing (each frame, the rendered uMouse is
 * pulled toward the target mouse position by 6%). Without this, the glow
 * teleports every mouse event; with it, the glow has a slight lag that
 * reads as "physical."
 *
 * The canvas is fixed-position at z-index: -1 so it sits behind every
 * section. Sections that have their own gradient (hero, CTA) cover it
 * locally; sections that are transparent (pillars, blog) let it show
 * through.
 *
 * Sit-out conditions:
 *   - prefers-reduced-motion → skip; static body background remains.
 *   - THREE undefined → skip silently (script load failure).
 *   - WebGL context creation fails → skip silently (very old GPU).
 */
function initWebGLBackground() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof THREE === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.className = 'webgl-bg-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '-1',
        pointerEvents: 'none',
    });
    document.body.appendChild(canvas);

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: false,
            alpha: false,
            powerPreference: 'low-power',
        });
    } catch (err) {
        // No WebGL context available; bail silently. The body's solid
        // bg-base color remains the fallback.
        canvas.remove();
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    };

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

    // Stefan Gustavson 2D simplex noise — well-tested public-domain
    // implementation. Returns a value approximately in [-1, 1].
    const fragmentShader = `
        precision highp float;

        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        varying vec2 vUv;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                                -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0, x0),
                                    dot(x12.xy, x12.xy),
                                    dot(x12.zw, x12.zw)), 0.0);
            m = m * m;
            m = m * m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
            vec3 g;
            g.x = a0.x * x0.x + h.x * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            vec2 uv = vUv;
            float aspect = uResolution.x / max(uResolution.y, 1.0);
            // Aspect-corrected coords so the noise blobs aren't stretched.
            vec2 p = vec2(uv.x * aspect, uv.y);

            float t = uTime * 0.04;

            // Two octaves of noise. Low frequency = big organic blobs;
            // mid frequency = subtle texture on top.
            float n1 = snoise(p * 1.5 + vec2(t, t * 0.7));
            float n2 = snoise(p * 3.0 + vec2(-t * 0.5, t * 0.4)) * 0.5;
            float n  = (n1 + n2) * 0.5;

            // Base near-black navy (matches --bg-base #040619).
            vec3 color = vec3(0.0156, 0.0235, 0.098);

            // Indigo wash where noise is positive — drifts organically.
            vec3 indigo = vec3(0.07, 0.024, 0.337);   // #120656
            color = mix(color, indigo, smoothstep(-0.2, 0.4, n) * 0.55);

            // Cyan accent in the brighter noise regions.
            vec3 cyan = vec3(0.133, 0.827, 0.933);    // #22D3EE
            color = mix(color, cyan, smoothstep(0.15, 0.5, n) * 0.18);

            // Cursor-reactive ambient glow. uMouse is in [0,1] in screen
            // space; convert to aspect-corrected p-space before computing
            // distance so the glow is a circle, not an ellipse.
            vec2 mp = vec2(uMouse.x * aspect, uMouse.y);
            float d = distance(p, mp);
            float glow = exp(-d * 4.5);
            color += cyan * glow * 0.35;

            // Subtle vignette — edges fall off ~15%.
            vec2 vc = uv - 0.5;
            float vignette = 1.0 - smoothstep(0.5, 1.0, length(vc));
            color *= mix(0.85, 1.0, vignette);

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        uniforms.uResolution.value.set(w * dpr, h * dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    const targetMouse = new THREE.Vector2(0.5, 0.5);
    document.addEventListener('mousemove', function (e) {
        targetMouse.set(
            e.clientX / window.innerWidth,
            1 - (e.clientY / window.innerHeight)
        );
    });

    function render() {
        // Lerp the rendered mouse toward the target — gives the glow a
        // slight smoothed lag that reads as physical.
        uniforms.uMouse.value.lerp(targetMouse, 0.06);
        uniforms.uTime.value = performance.now() * 0.001;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

/**
 * Pressure-sensitive ink-trail cursor with flint-style sparks.
 *
 * What you see:
 *   - A soft white trail follows the cursor; slow movements draw thicker
 *     (like pressing harder with a pen), fast flicks draw thin and wispy.
 *     Each stroke fades to transparent over MAX_AGE (~850ms).
 *   - Above a velocity threshold, warm amber sparks spit off the cursor in
 *     random directions, fall slightly under gravity, and burn out within
 *     ~250–450ms. Subtle — meant to evoke flint on stone, not fireworks.
 *
 * How the trail works:
 *   1. We append a transparent <canvas> to <body> sized to the viewport.
 *      It's pointer-events:none so it doesn't intercept clicks.
 *   2. mousemove samples the cursor position with a timestamp and
 *      computed velocity (pixels per millisecond from the previous sample).
 *   3. A requestAnimationFrame loop drops expired samples, then for each
 *      remaining segment draws four stacked strokes (outer wide+faint to
 *      inner thin+bright) — the soft-edged ink look. Width per segment
 *      scales inversely with velocity (slow = thick), and alpha scales
 *      with how fresh the segment is.
 *
 * How the sparks work:
 *   - On every mousemove, if speed > SPARK_THRESHOLD, we roll a probability
 *     that scales with speed. Pass = emit 1–2 spark particles seeded with a
 *     velocity opposite-ish to cursor motion (so they trail behind) plus a
 *     random angular spread. Each particle has its own lifespan and gravity
 *     accumulates on its vertical velocity each frame.
 *
 * Color choice:
 *   - Trail is plain white (we removed mix-blend-mode). Reads great on the
 *     dark hero; will read weak on the current white pillar/posts sections
 *     until those sections get dark-mode treatment.
 *   - Sparks are warm amber (#ffb060) — high contrast against the cool
 *     trail and against any dark background.
 *
 * Sit-out conditions:
 *   - prefers-reduced-motion → skip entirely (the loop never starts).
 *   - touch-only device (no fine pointer) → skip; trail would never trigger.
 */
function initInkTrail() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'ink-trail-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '9999',
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Resize handler. We use device-pixel-ratio scaling so strokes stay
    // crisp on retina displays. setTransform resets any prior scale rather
    // than compounding, so this is safe to call repeatedly.
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // ----- Trail state -----
    const points = []; // { x, y, t (ms), v (px/ms) }
    const MAX_AGE = 850; // ms before a sample expires

    // Stacked stroke layers, outer-to-inner. Width is the BASE that gets
    // multiplied by velocity-factor and age-factor per segment. Alpha is
    // multiplied by the per-segment age factor.
    const LAYERS = [
        { width: 14, alpha: 0.06 },
        { width: 8,  alpha: 0.18 },
        { width: 3,  alpha: 0.50 },
        { width: 1,  alpha: 0.95 },
    ];

    // ----- Spark state -----
    const sparks = []; // { x, y, vx, vy, t, lifespan }
    const SPARK_THRESHOLD = 0.12;     // px/ms; below this, no sparks
    const SPARK_MAX_PROB  = 0.45;     // ceiling on emit chance per mousemove
    const SPARK_GRAVITY   = 0.00035;  // px/ms² added to vy each frame
    let lastFrameTime = performance.now();

    document.addEventListener('mousemove', function (e) {
        const now = performance.now();
        const last = points[points.length - 1];

        let velocity = 0;
        let dx = 0, dy = 0;
        if (last) {
            const dt = Math.max(1, now - last.t);
            dx = e.clientX - last.x;
            dy = e.clientY - last.y;
            velocity = Math.hypot(dx, dy) / dt; // px/ms
        }
        points.push({ x: e.clientX, y: e.clientY, t: now, v: velocity });

        // Spark emission. Probability ramps from 0 at threshold to
        // SPARK_MAX_PROB by ~speed=0.9. Subtle by design.
        if (velocity > SPARK_THRESHOLD) {
            const emitProb = Math.min(SPARK_MAX_PROB, (velocity - SPARK_THRESHOLD) / 1.6);
            if (Math.random() < emitProb) {
                const cursorAngle = Math.atan2(dy, dx);
                // Single particle per emission — feels gentler than bursts.
                // Fly opposite cursor direction + spread of ±~70°.
                const spread = (Math.random() - 0.5) * (Math.PI * 0.78);
                const sparkAngle = cursorAngle + Math.PI + spread;
                const sparkSpeed = 0.06 + Math.random() * 0.18; // px/ms
                sparks.push({
                    x: e.clientX,
                    y: e.clientY,
                    vx: Math.cos(sparkAngle) * sparkSpeed,
                    vy: Math.sin(sparkAngle) * sparkSpeed,
                    t: now,
                    lifespan: 250 + Math.random() * 200, // ms
                });
            }
        }
    });

    function render() {
        const now = performance.now();
        const dt = Math.max(1, now - lastFrameTime); // ms since last frame
        lastFrameTime = now;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ---- Trail pass ----
        // Drop expired samples from the head of the queue.
        while (points.length && now - points[0].t > MAX_AGE) {
            points.shift();
        }

        if (points.length >= 2) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#ffffff';

            for (const layer of LAYERS) {
                for (let i = 1; i < points.length; i++) {
                    const a = points[i - 1];
                    const b = points[i];

                    const age = now - b.t;
                    const ageFactor = 1 - (age / MAX_AGE); // 1 fresh → 0 expired
                    if (ageFactor <= 0) continue;

                    // Slow movement → thick (more "pressure"). Cap at 0.25 so
                    // even very fast flicks leave a visible thread.
                    const velocityFactor = Math.max(0.25, 1 - Math.min(1, b.v / 1.25));

                    ctx.lineWidth = Math.max(0.1, layer.width * velocityFactor * ageFactor);
                    ctx.globalAlpha = layer.alpha * ageFactor;

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            ctx.globalAlpha = 1;
        }

        // ---- Sparks pass ----
        // Iterate backwards so we can splice expired particles in place.
        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];
            const age = now - s.t;

            if (age > s.lifespan) {
                sparks.splice(i, 1);
                continue;
            }

            // Integrate position. dt is in ms, vx/vy are px/ms.
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.vy += SPARK_GRAVITY * dt;

            const lifeRatio = age / s.lifespan;
            const alpha = 1 - lifeRatio;
            // Slight shrink as the spark cools.
            const radius = 1.6 * (1 - lifeRatio * 0.6);

            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffb060';
            ctx.beginPath();
            ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
