/* =====================================================================
   CopyCatCapybara Clicker — Faith's game
   ---------------------------------------------------------------------
   Tap anywhere in the arena as fast as you can before the timer ends.
   Four challenge lengths (5/15/30/60s), each with a server-saved top-ten
   via the tc-games REST API (boards capybara-5/15/30/60). Score = taps.
   ===================================================================== */
(function () {
    'use strict';
    var root = document.querySelector('.capy');
    if (!root) return;

    var CFG = window.tcCapybara || {};
    var SCORES_URL = CFG.scoresUrl || '';
    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- elements ----
    var arena   = document.getElementById('capy-arena');
    var canvas  = document.getElementById('capy-canvas');
    var ctx     = canvas.getContext('2d');
    var elClicks = document.getElementById('capy-clicks');
    var elTime   = document.getElementById('capy-time');
    var elCps    = document.getElementById('capy-cps');
    var elRank   = document.getElementById('capy-rank');
    var idleScreen = document.getElementById('capy-idle');
    var doneScreen = document.getElementById('capy-done');
    var durPick  = document.getElementById('capy-durpick');
    var startBtn = document.getElementById('capy-start');
    var timerBar = document.getElementById('capy-timerbar');
    var timerFill = timerBar.querySelector('i');
    var elFinal  = document.getElementById('capy-final');
    var elDoneFace = document.getElementById('capy-done-face');
    var elDoneSub = document.getElementById('capy-done-sub');
    var nameBox  = document.getElementById('capy-name');
    var namePrompt = document.getElementById('capy-name-prompt');
    var nameInput = document.getElementById('capy-name-input');
    var saveBtn  = document.getElementById('capy-save');
    var againBtn = document.getElementById('capy-again');
    var boardTabs = document.getElementById('capy-board-tabs');
    var boardList = document.getElementById('capy-board-list');

    // ---- state ----
    var state = 'idle';   // idle | running | done
    var dur = 15, clicks = 0, startTime = 0, timerId = 0, raf = 0;
    var pending = null, boardDur = 15;

    var CRITTERS = ['🐹','🦫','🐤','🐰','🐸','🦄','🐱','🐶','🐼','🐧','🦋','🐠','🌈','⭐','🍭','🎈','🍓','🧁','💖','✨','🍉','🌸','🐥','🐢'];
    var BOOMS = ['💥','✨','🌟','💫','🎉','💖','⭐'];
    var TIERS = [
        { min: 0,  label: 'warming up 🐾', color: '#9B6BFF' },
        { min: 3,  label: 'good job! 🌟',  color: '#46C9FF' },
        { min: 5,  label: 'zoomies! ⚡',   color: '#43E0B0' },
        { min: 7,  label: 'super fast! 🚀',color: '#FFC83D' },
        { min: 9,  label: 'WILD! 🔥',      color: '#FF7A3D' },
        { min: 11, label: 'CAPYBARA GOD 👑',color: '#FF5FA2' }
    ];
    var MAX_CPS = 12;

    // ---- audio (cute synth, no asset files) ----
    var AC = null;
    function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return AC; }
    function tone(freq, dur, type, vol, slideTo) {
        var a = ac(); if (!a) return;
        var o = a.createOscillator(), g = a.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, a.currentTime);
        if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + dur);
        g.gain.setValueAtTime(vol || 0.25, a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
        o.connect(g); g.connect(a.destination);
        o.start(); o.stop(a.currentTime + dur + 0.02);
    }
    function pop()    { tone(420 + Math.random() * 380, 0.09, 'triangle', 0.22); }
    function boing()  { tone(240, 0.18, 'sine', 0.25, 620); }
    function squeak() { tone(900 + Math.random() * 300, 0.07, 'square', 0.12); }
    function moo()    { tone(150, 0.28, 'sawtooth', 0.22, 90); }
    function tada() {
        [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { tone(f, 0.22, 'triangle', 0.22); }, i * 90); });
    }
    function tapSound(n) {
        if (n % 18 === 0) { moo(); return; }
        var r = n % 3;
        if (r === 0) pop(); else if (r === 1) boing(); else squeak();
    }

    // ---- canvas confetti ----
    var bits = [];
    var CONF_COLORS = ['#FF5FA2','#9B6BFF','#46C9FF','#43E0B0','#FFC83D','#FF7A3D','#ffffff'];
    function fit() { canvas.width = arena.clientWidth; canvas.height = arena.clientHeight; }
    function burstConfetti(x, y, power) {
        var n = 10 + Math.floor(power * 26);
        for (var i = 0; i < n; i++) {
            var ang = Math.random() * Math.PI * 2, sp = (2 + Math.random() * 7) * (1 + power);
            bits.push({
                x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 3,
                g: 0.18 + Math.random() * 0.12, life: 0, max: 36 + Math.random() * 30,
                size: 4 + Math.random() * 6 + power * 4, col: CONF_COLORS[(Math.random() * CONF_COLORS.length) | 0],
                rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4
            });
        }
    }
    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bits = bits.filter(function (b) { return b.life < b.max; });
        for (var i = 0; i < bits.length; i++) {
            var b = bits[i];
            b.x += b.vx; b.y += b.vy; b.vy += b.g; b.life++; b.rot += b.vr;
            ctx.save();
            ctx.globalAlpha = 1 - b.life / b.max;
            ctx.translate(b.x, b.y); ctx.rotate(b.rot);
            ctx.fillStyle = b.col;
            ctx.fillRect(-b.size / 2, -b.size / 2, b.size, b.size * 0.6);
            ctx.restore();
        }
        if (state === 'running' || bits.length) raf = requestAnimationFrame(loop);
    }

    // ---- big flying emoji creatures (DOM) ----
    function spawnCritter(x, y, power) {
        var el = document.createElement('div');
        el.className = 'capy-critter';
        var isBoom = Math.random() < 0.35;
        el.textContent = (isBoom ? BOOMS : CRITTERS)[((isBoom ? BOOMS.length : CRITTERS.length) * Math.random()) | 0];
        var size = 44 + Math.random() * 46 + power * 50;   // BIG, bigger with speed
        el.style.fontSize = size + 'px';
        el.style.left = (x - size / 2) + 'px';
        el.style.top = (y - size / 2) + 'px';
        arena.appendChild(el);
        var ang = Math.random() * Math.PI * 2;
        var dist = 120 + Math.random() * 320 * (1 + power);
        var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 80;
        var spin = (Math.random() - 0.5) * 720;
        if (el.animate && !REDUCED) {
            el.animate([
                { transform: 'translate(0,0) scale(0.4) rotate(0deg)', opacity: 1 },
                { transform: 'translate(' + dx * 0.5 + 'px,' + dy * 0.5 + 'px) scale(1.2) rotate(' + spin * 0.5 + 'deg)', opacity: 1, offset: 0.4 },
                { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(0.9) rotate(' + spin + 'deg)', opacity: 0 }
            ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' });
        }
        setTimeout(function () { el.remove(); }, 1500);
    }

    // ---- meter / tier ----
    var lastTier = -1;
    function tierFor(cps) { var t = 0; for (var i = 0; i < TIERS.length; i++) if (cps >= TIERS[i].min) t = i; return t; }
    function updateHeat(cps) {
        var p = Math.min(cps / MAX_CPS, 1);
        arena.setAttribute('data-heat', p > 0.75 ? '3' : p > 0.5 ? '2' : p > 0.25 ? '1' : '0');
        var ti = tierFor(cps);
        elRank.textContent = TIERS[ti].label;
        elRank.style.color = TIERS[ti].color;
        elRank.classList.add('show');
        if (ti !== lastTier) {
            elRank.classList.remove('pop'); void elRank.offsetWidth; elRank.classList.add('pop');
            if (ti > lastTier && lastTier >= 0) squeak();
        }
        lastTier = ti;
        return p;
    }

    // ---- core tap ----
    function arenaPoint(e) {
        var r = arena.getBoundingClientRect();
        var cx = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX);
        var cy = (e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY);
        return { x: cx - r.left, y: cy - r.top };
    }

    function registerClick(e) {
        clicks++;
        elClicks.textContent = clicks;
        var sec = (Date.now() - startTime) / 1000;
        var cps = sec > 0 ? clicks / sec : 0;
        elCps.textContent = cps.toFixed(1);
        var p = updateHeat(cps);
        var pt = arenaPoint(e);
        arena.classList.add('is-press');
        setTimeout(function () { arena.classList.remove('is-press'); }, 80);
        spawnCritter(pt.x, pt.y, p);
        if (p > 0.4) spawnCritter(pt.x, pt.y, p);
        burstConfetti(pt.x, pt.y, p);
        tapSound(clicks);
    }

    function startGame() {
        state = 'running'; clicks = 0; lastTier = -1;
        startTime = Date.now();
        idleScreen.hidden = true; doneScreen.hidden = true;
        elClicks.textContent = '0'; elCps.textContent = '0.0'; elTime.textContent = dur;
        timerBar.classList.add('show'); timerFill.style.width = '100%';
        elRank.classList.remove('show');
        fit();
        cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
        var elapsed = 0;
        timerId = setInterval(function () {
            elapsed += 100;
            var left = dur * 1000 - elapsed;
            timerFill.style.width = Math.max(0, 100 - (elapsed / (dur * 1000)) * 100) + '%';
            elTime.textContent = Math.max(0, Math.ceil(left / 1000));
            if (left <= 0) finish();
        }, 100);
    }

    function finish() {
        clearInterval(timerId);
        state = 'done';
        arena.setAttribute('data-heat', '0');
        timerBar.classList.remove('show');
        elRank.classList.remove('show');
        var cps = clicks / dur;
        elFinal.textContent = clicks;
        elDoneSub.textContent = clicks + ' taps in ' + dur + 's · ' + cps.toFixed(1) + '/sec — ' + TIERS[tierFor(cps)].label;
        elDoneFace.textContent = clicks > 0 ? '🎉' : '😴';
        doneScreen.hidden = false;
        tada();
        // celebratory storm
        for (var i = 0; i < 8; i++) (function (k) {
            setTimeout(function () {
                burstConfetti(canvas.width * (0.2 + Math.random() * 0.6), canvas.height * 0.4, 1);
                spawnCritter(canvas.width * Math.random(), canvas.height * 0.5, 1);
            }, k * 90);
        })(i);
        if (!raf) raf = requestAnimationFrame(loop);

        // qualify for this duration's top 10?
        pending = { dur: dur, score: clicks };
        nameBox.hidden = true;
        fetchBoard(dur).then(function (rows) {
            var qualifies = clicks > 0 && (rows.length < 10 || clicks > rows[rows.length - 1].score);
            setBoardTab(dur);
            renderBoard(rows);
            if (qualifies) {
                namePrompt.textContent = rows.length === 0 ? 'First score! What\'s your name?' : 'New high score! What\'s your name? 🏆';
                nameBox.hidden = false;
                nameInput.value = '';
                setTimeout(function () { nameInput.focus(); }, 150);
            }
        });
    }

    function resetToIdle() {
        state = 'idle'; clicks = 0;
        clearInterval(timerId); cancelAnimationFrame(raf); raf = 0;
        bits = []; ctx.clearRect(0, 0, canvas.width, canvas.height);
        Array.prototype.forEach.call(arena.querySelectorAll('.capy-critter'), function (n) { n.remove(); });
        arena.setAttribute('data-heat', '0');
        doneScreen.hidden = true; idleScreen.hidden = false;
        nameBox.hidden = true; timerBar.classList.remove('show');
        elClicks.textContent = '0'; elCps.textContent = '0.0'; elTime.textContent = dur;
    }

    // ---- leaderboard (REST) ----
    function boardKey(d) { return 'capybara-' + d; }
    function fetchBoard(d) {
        if (!SCORES_URL) return Promise.resolve([]);
        return fetch(SCORES_URL + '?game=' + boardKey(d))
            .then(function (r) { return r.json(); })
            .then(function (j) { return (j && j[boardKey(d)]) || []; })
            .catch(function () { return []; });
    }
    function renderBoard(rows, meIdx) {
        boardList.innerHTML = '';
        if (!rows || !rows.length) {
            var li = document.createElement('li');
            li.className = 'capy-board__empty';
            li.textContent = 'No champions yet — be the first! 🐹';
            boardList.appendChild(li);
            return;
        }
        var medals = ['🥇', '🥈', '🥉'];
        rows.forEach(function (s, i) {
            var li = document.createElement('li');
            if (i === meIdx) li.className = 'is-me';
            li.innerHTML =
                '<span class="capy-board__pos">' + (medals[i] || (i + 1)) + '</span>' +
                '<span class="capy-board__name"></span>' +
                '<span class="capy-board__score">' + (s.score | 0) + ' taps</span>';
            li.querySelector('.capy-board__name').textContent = s.name || 'Anonymous';
            boardList.appendChild(li);
        });
    }
    function setBoardTab(d) {
        boardDur = d;
        Array.prototype.forEach.call(boardTabs.querySelectorAll('.capy-board__tab'), function (t) {
            t.classList.toggle('is-active', parseInt(t.dataset.s, 10) === d);
        });
    }
    function loadBoard(d) { setBoardTab(d); fetchBoard(d).then(function (rows) { renderBoard(rows); }); }

    function saveScore() {
        if (!pending || !SCORES_URL) { nameBox.hidden = true; return; }
        var name = (nameInput.value || '').trim() || 'Anonymous';
        var body = { game: boardKey(pending.dur), name: name, score: pending.score };
        saveBtn.disabled = true;
        fetch(SCORES_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(function (r) { return r.json(); }).then(function (j) {
            var rows = (j && j.scores) || [];
            var meIdx = rows.findIndex(function (s) { return s.name === name && s.score === pending.score; });
            setBoardTab(pending.dur);
            renderBoard(rows, meIdx);
            nameBox.hidden = true; pending = null; saveBtn.disabled = false;
        }).catch(function () { nameBox.hidden = true; saveBtn.disabled = false; });
    }

    // ---- wiring ----
    arena.addEventListener('pointerdown', function (e) {
        // Ignore taps that land on real controls (buttons/inputs).
        if (e.target.closest('button, input, a')) return;
        if (state === 'running') { e.preventDefault(); registerClick(e); }
    });

    startBtn.addEventListener('click', function () { if (state !== 'running') startGame(); });

    durPick.addEventListener('click', function (e) {
        var b = e.target.closest('.capy-dur'); if (!b || state === 'running') return;
        dur = parseInt(b.dataset.s, 10);
        Array.prototype.forEach.call(durPick.children, function (c) { c.classList.toggle('is-active', c === b); });
        elTime.textContent = dur;
    });

    boardTabs.addEventListener('click', function (e) {
        var t = e.target.closest('.capy-board__tab'); if (!t) return;
        loadBoard(parseInt(t.dataset.s, 10));
    });

    saveBtn.addEventListener('click', saveScore);
    nameInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') saveScore(); });
    againBtn.addEventListener('click', resetToIdle);

    window.addEventListener('resize', function () { if (canvas) fit(); });

    // initial board
    fit();
    loadBoard(15);
})();
