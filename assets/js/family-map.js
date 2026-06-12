/**
 * The Lanterns of Record — P2: the time machine (family-map.js).
 *
 * P1 drew the final fully-lit state; P2 adds the master time cursor
 * all renderers subscribe to (spec s3):
 *   - scrub + Play (1610 -> today): lanterns IGNITE at their year with
 *     a kindle pop, death-lanterns gutter to a low ember (s5.3),
 *   - the carried light: each migration trail grows along its
 *     great-circle as its years pass, a bright head running ahead of
 *     a fading wake (s5.4),
 *   - the clarity-wave: when the cursor crosses a region's civil-
 *     registration milestone, a soft ring sweeps it and the world's
 *     graticule sharpens a step (s6),
 *   - the density timeline doubles as the scrubber (click / drag /
 *     keyboard via a synced range input), with a year readout.
 *
 * Defaults: the page LOADS in the explore state (fully lit — exactly
 * P1) and Play is an invitation, not an ambush. prefers-reduced-motion
 * keeps the static contract: no Play, no animations, scrubbing still
 * works instantly (s13). The ghost tree + convergence sequence are P3.
 * Loaded only on /map (see functions.php).
 */
(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var mount = document.getElementById('tc-map');
        if (!mount || typeof d3 === 'undefined' || typeof topojson === 'undefined' ||
            typeof tcFamilyMap === 'undefined') return;

        Promise.all([
            fetch(tcFamilyMap.dataUrl).then(function (r) { return r.json(); }),
            fetch(tcFamilyMap.worldUrl).then(function (r) { return r.json(); })
        ]).then(function (loaded) {
            draw(loaded[0], loaded[1]);
        }).catch(function (err) {
            console.warn('[TC] lantern map failed to load:', err);
            mount.innerHTML = '<p class="tc-map__noscript">The lantern map could not load its data. ' +
                'The stories themselves live in <a href="' + tcFamilyMap.heritageBase + '">the eight family long-reads</a>.</p>';
        });

        // Confidence tier -> light. The load-bearing rule (spec s5.1).
        var TIER = {
            verified:  { halo: 10, core: 2.6, glow: 0.85, label: 'verified — a primary record' },
            living:    { halo: 11, core: 2.6, glow: 0.80, label: 'living memory' },
            probable:  { halo: 8,  core: 2.1, glow: 0.45, label: 'probable — consistent, no primary record yet' },
            inherited: { halo: 7,  core: 1.7, glow: 0.26, label: 'inherited — family tradition only' }
        };
        var FAMILY_ORDER = ['Cheesman', 'Docherty', 'McIver', 'Campbell', 'Cameron',
                            'Lakeman', 'Verboom', 'Rycroft', 'Steinke', 'Haiste'];
        // The world-history spine (spec s6) — each line becomes visible
        // to history at a different moment.
        var MILESTONES = [
            { year: 1811, lng: 5.2,   lat: 52.2, text: '1811 — Napoleon’s état civil reaches the Netherlands. The Dutch lines turn crisp.' },
            { year: 1837, lng: -1.5,  lat: 53.0, text: '1837 — civil registration begins in England & Wales. The Yorkshire lines steady.' },
            { year: 1855, lng: -4.2,  lat: 56.5, text: '1855 — Scotland’s statutory registers open. The Hebrides and Lanarkshire sharpen.' },
            { year: 1864, lng: -7.5,  lat: 54.5, text: '1864 — civil registration covers all of Ireland.' },
            { year: 1876, lng: 10.0,  lat: 51.0, text: '1876 — the German Empire registers its people. The Steinke world comes into focus.' },
            { year: 1897, lng: -105,  lat: 52.0, text: 'late 1800s — the Canadian provinces begin keeping vital statistics. The prairie generation is born documented.' },
            { year: 2016, lng: -114.07, lat: 51.05, text: '2016 — seven lines reach one household. Calgary, the second of July.' },
            { year: 2017, lng: -118.79, lat: 55.17, text: 'and three new lanterns kindle in Grande Prairie.' }
        ];
        var Y0 = 1610, Y1 = 2030;
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function storyUrl(link) {
            if (!link) return null;
            return tcFamilyMap.heritageBase + link + (link.indexOf('/') === -1 ? '/story/' : '/');
        }

        function draw(data, world) {
            var W = 1240, H = 640;
            var svg = d3.select(mount).append('svg')
                .attr('viewBox', '0 0 ' + W + ' ' + H)
                .attr('preserveAspectRatio', 'xMidYMid meet');

            var land = topojson.feature(world, world.objects.land || world.objects.countries);
            var projection = d3.geoNaturalEarth1().fitSize([W, H], { type: 'Sphere' });
            var path = d3.geoPath(projection);

            svg.append('path').datum({ type: 'Sphere' })
                .attr('d', path).attr('class', 'tc-map__sphere');
            // Everything geographic lives in one sphere-clipped group so
            // the departures zoom (P3) can lean the whole world toward the
            // place being left without spilling past the map's edge.
            svg.append('clipPath').attr('id', 'tc-sphere-clip')
                .append('path').datum({ type: 'Sphere' }).attr('d', path);
            var world = svg.append('g').attr('class', 'tc-map__world')
                .attr('clip-path', 'url(#tc-sphere-clip)');
            var graticule = world.append('path').datum(d3.geoGraticule10())
                .attr('d', path).attr('class', 'tc-map__graticule');
            world.append('path').datum(land)
                .attr('d', path).attr('class', 'tc-map__land');

            var defs = svg.append('defs');
            FAMILY_ORDER.forEach(function (f) {
                var g = defs.append('radialGradient').attr('id', 'tc-glow-' + f);
                g.append('stop').attr('offset', '0%').attr('stop-color', data.families[f]).attr('stop-opacity', 0.95);
                g.append('stop').attr('offset', '55%').attr('stop-color', data.families[f]).attr('stop-opacity', 0.38);
                g.append('stop').attr('offset', '100%').attr('stop-color', data.families[f]).attr('stop-opacity', 0);
            });

            // --- Carried light: trails + their moving heads -----------
            var trailsG = world.append('g').attr('class', 'tc-map__trails');
            var trails = (data.paths || []).map(function (p) {
                var node = trailsG.append('path')
                    .datum({ type: 'LineString', coordinates: p.points.map(function (pt) { return [pt[0], pt[1]]; }) })
                    .attr('d', path)
                    .attr('class', 'tc-map__trail')
                    .attr('stroke', data.families[p.family])
                    .node();
                var total = node.getTotalLength();
                // Cumulative length fraction at each waypoint, so a year
                // maps to a distance along the great-circle chain.
                var fracs = [0];
                for (var i = 1; i < p.points.length; i++) {
                    var sub = { type: 'LineString', coordinates: p.points.slice(0, i + 1).map(function (pt) { return [pt[0], pt[1]]; }) };
                    var tmp = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
                        .attr('d', path(sub)).node();
                    fracs.push(tmp.getTotalLength() / total);
                }
                var head = trailsG.append('circle')
                    .attr('class', 'tc-map__trailhead')
                    .attr('r', 2.4).attr('fill', data.families[p.family])
                    .style('display', 'none');
                return { node: node, head: head, total: total, fracs: fracs,
                         years: p.points.map(function (pt) { return pt[2]; }) };
            });

            // --- Lanterns ---------------------------------------------
            var located = data.events.filter(function (e) { return e.lat != null && e.lng != null; });
            var stacks = {};
            located.forEach(function (e) {
                var key = e.lat.toFixed(1) + ',' + e.lng.toFixed(1);
                var i = (stacks[key] = (stacks[key] || 0) + 1) - 1;
                var xy = projection([e.lng, e.lat]);
                var r = i === 0 ? 0 : 3.4 * Math.sqrt(i);
                var a = i * 2.39996;
                e._x = xy[0] + r * Math.cos(a);
                e._y = xy[1] + r * Math.sin(a);
            });

            var lanterns = world.append('g').attr('class', 'tc-map__lanterns');
            var waveG = world.append('g').attr('class', 'tc-map__waves');
            var tooltip = d3.select(mount).append('div').attr('class', 'tc-map-tooltip').attr('hidden', true);
            var lit = [];

            located.forEach(function (e) {
                var t = TIER[e.tier] || TIER.probable;
                var g = lanterns.append('g')
                    .attr('class', 'tc-map__lantern tc-map__lantern--' + e.tier +
                          (reduceMotion ? ' tc-map__lantern--still' : ''))
                    .attr('transform', 'translate(' + e._x + ',' + e._y + ')');
                g.append('circle').attr('class', 'tc-map__halo')
                    .attr('r', t.halo).attr('fill', 'url(#tc-glow-' + e.family + ')')
                    .attr('opacity', t.glow);
                g.append('circle').attr('class', 'tc-map__core')
                    .attr('r', t.core).attr('fill', data.families[e.family]);
                var url = storyUrl(e.link);
                var hit = g.append('circle').attr('class', 'tc-map__hit').attr('r', Math.max(t.halo, 11))
                    .on('mouseenter', function (ev) { showTip(e, ev); })
                    .on('mousemove', function (ev) { moveTip(ev); })
                    .on('mouseleave', hideTip);
                if (url) {
                    hit.style('cursor', 'pointer')
                       .on('click', function () { window.location.href = url; });
                }
                lit.push({ el: g, year: e.year, isDeath: e.type === 'death', wasOn: true, lastS: 1,
                           isNG: e.type === 'death' && /villers/i.test(e.place || '') });
            });

            // ================= THE GHOST TREE (P3, s3) =================
            // The same history projected genealogically: ten branches in
            // their family colours flowing down into shared warm-white
            // channels, resolving to three small roots — the children at
            // the base of the tree it was growing toward (s8.4). Node
            // years without a printed label are LAYOUT timing only
            // (undocumented joins are never shown as dates). Decorative;
            // hidden on small screens (s13).
            var hud = mount.closest('.tc-map-hud');
            var treeMount = document.getElementById('tc-map-tree');
            var tree = null;
            if (treeMount) tree = buildTree();

            function buildTree() {
                var TW = 1240, TH = 340;
                var tsvgT = d3.select(treeMount).append('svg')
                    .attr('viewBox', '0 0 ' + TW + ' ' + TH)
                    .attr('preserveAspectRatio', 'xMidYMid meet');
                var TOPS = { Cameron: 90, Campbell: 190, McIver: 290, Docherty: 390,
                             Verboom: 520, Lakeman: 620, Cheesman: 730,
                             Steinke: 880, Rycroft: 980, Haiste: 1080 };
                var N = {
                    n1: { x: 140,  y: 100, year: 1866 },
                    n2: { x: 215,  y: 158, year: 1888, label: '1888' },
                    n3: { x: 300,  y: 216, year: 1941, label: '1941' },
                    n4: { x: 570,  y: 130, year: 1948 },
                    nT: { x: 430,  y: 258, year: 1980 },
                    nG: { x: 530,  y: 272, year: 1991, label: '1991' },
                    n7: { x: 930,  y: 150, year: 1959, label: '1959' },
                    n8: { x: 1005, y: 215, year: 1983 },
                    nF: { x: 720,  y: 292, year: 2016, label: '2016' }
                };
                var ROOTS = [ { x: 660, y: 324, year: 2013 },
                              { x: 720, y: 328, year: 2015 },
                              { x: 780, y: 324, year: 2017 } ];
                var BRANCH_TO = { Cameron: 'n1', Campbell: 'n1', McIver: 'n2', Docherty: 'n3',
                                  Verboom: 'n4', Lakeman: 'n4', Cheesman: 'nG',
                                  Steinke: 'n7', Rycroft: 'n7', Haiste: 'n8' };
                var SEGS = [ ['n1','n2'], ['n2','n3'], ['n3','nT'], ['n4','nT'],
                             ['nT','nG'], ['nG','nF'], ['n7','n8'], ['n8','nF'] ];
                function bez(x0, y0, x1, y1) {
                    var my = (y0 + y1) / 2;
                    return 'M' + x0 + ',' + y0 + ' C' + x0 + ',' + my + ' ' + x1 + ',' + my + ' ' + x1 + ',' + y1;
                }
                var firstYear = {};
                data.events.forEach(function (e) {
                    if (e.year && (!firstYear[e.family] || e.year < firstYear[e.family])) firstYear[e.family] = e.year;
                });
                var branches = FAMILY_ORDER.map(function (f) {
                    var n = N[BRANCH_TO[f]];
                    var p = tsvgT.append('path')
                        .attr('d', bez(TOPS[f], 40, n.x, n.y))
                        .attr('class', 'tc-map-tree__branch' + (f === 'Cheesman' ? ' tc-map-tree__branch--graft' : ''))
                        .attr('stroke', data.families[f]).node();
                    var L = p.getTotalLength();
                    p.setAttribute('stroke-dasharray', '0 ' + (L + 2));
                    var label = tsvgT.append('text').attr('class', 'tc-map-tree__name')
                        .attr('x', TOPS[f]).attr('y', 28).attr('text-anchor', 'middle')
                        .attr('fill', data.families[f]).text(f);
                    return { el: p, len: L, y0: firstYear[f] || 1850, y1: n.year, label: label };
                });
                var segs = SEGS.map(function (s) {
                    var a = N[s[0]], b = N[s[1]];
                    var p = tsvgT.append('path')
                        .attr('d', bez(a.x, a.y, b.x, b.y))
                        .attr('class', 'tc-map-tree__channel').node();
                    var L = p.getTotalLength();
                    p.setAttribute('stroke-dasharray', '0 ' + (L + 2));
                    return { el: p, len: L, y0: a.year, y1: b.year };
                });
                var nodes = Object.keys(N).map(function (k) {
                    var n = N[k];
                    var dot = tsvgT.append('circle').attr('class', 'tc-map-tree__node')
                        .attr('cx', n.x).attr('cy', n.y).attr('r', 3.4);
                    var lab = n.label ? tsvgT.append('text').attr('class', 'tc-map-tree__year')
                        .attr('x', n.x + 9).attr('y', n.y + 4).text(n.label) : null;
                    return { dot: dot, lab: lab, year: n.year };
                });
                var roots = ROOTS.map(function (r) {
                    var stem = tsvgT.append('path')
                        .attr('d', bez(N.nF.x, N.nF.y, r.x, r.y))
                        .attr('class', 'tc-map-tree__channel').node();
                    var L = stem.getTotalLength();
                    stem.setAttribute('stroke-dasharray', '0 ' + (L + 2));
                    var dot = tsvgT.append('circle').attr('class', 'tc-map-tree__root')
                        .attr('cx', r.x).attr('cy', r.y).attr('r', 4.2);
                    return { stem: stem, len: L, dot: dot, year: r.year };
                });
                tsvgT.append('text').attr('class', 'tc-map-tree__year')
                    .attr('x', N.nF.x).attr('y', TH - 1).attr('text-anchor', 'middle')
                    .text('2013 · 2015 · 2017');
                return { branches: branches, segs: segs, nodes: nodes, roots: roots };
            }

            function frac(y, a, b) { return Math.max(0, Math.min(1, (y - a) / Math.max(b - a, 1))); }

            function updateTree(y) {
                if (!tree) return;
                tree.branches.forEach(function (b) {
                    var f = frac(y, b.y0, b.y1);
                    b.el.setAttribute('stroke-dasharray', (f * b.len) + ' ' + (b.len - f * b.len + 2));
                    b.label.attr('opacity', 0.25 + 0.75 * f);
                });
                tree.segs.forEach(function (s) {
                    var f = frac(y, s.y0, s.y1);
                    s.el.setAttribute('stroke-dasharray', (f * s.len) + ' ' + (s.len - f * s.len + 2));
                });
                tree.nodes.forEach(function (n) {
                    var on = y >= n.year;
                    n.dot.attr('opacity', on ? 1 : 0);
                    if (n.lab) n.lab.attr('opacity', on ? 0.8 : 0);
                });
                tree.roots.forEach(function (r) {
                    var f = frac(y, 2016, 2017.5);
                    r.stem.setAttribute('stroke-dasharray', (f * r.len) + ' ' + (r.len - f * r.len + 2));
                    r.dot.attr('opacity', y >= r.year ? 1 : 0);
                });
            }

            // ================= SOUND (P3, s10 — off by default) ========
            // Tiny synthesized cues, no audio assets: a soft two-note
            // swell when a great crossing begins, the single low tone
            // when Norman George's lantern goes out, a warm triad when
            // the lines reach one household. Off until the visitor asks.
            var audio = { on: false, ctx: null };
            function sndTone(f, dur, gain, delay) {
                if (!audio.on || !audio.ctx) return;
                var t0 = audio.ctx.currentTime + (delay || 0);
                var o = audio.ctx.createOscillator();
                var g = audio.ctx.createGain();
                o.type = 'sine'; o.frequency.value = f;
                g.gain.setValueAtTime(0.0001, t0);
                g.gain.exponentialRampToValueAtTime(gain, t0 + 0.12);
                g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
                o.connect(g); g.connect(audio.ctx.destination);
                o.start(t0); o.stop(t0 + dur + 0.05);
            }
            function sndDeparture() { sndTone(330, 1.5, 0.040); sndTone(440, 1.7, 0.030, 0.28); }
            function sndGutter()    { sndTone(98,  2.6, 0.055); }
            function sndHome()      { sndTone(261.6, 2.2, 0.035); sndTone(329.6, 2.2, 0.035, 0.30); sndTone(392, 2.6, 0.035, 0.60); }

            // ================= DEPARTURES ZOOM (P3, s15.6) =============
            // Play-mode only: when a carried light begins a long crossing,
            // the world leans briefly toward the place being left. Gated
            // hard — one zoom at a time, a long cooldown, never on scrub,
            // never under reduced motion, never on small screens.
            var smallScreen = window.matchMedia('(max-width: 720px)');
            var zoomBusy = false, lastZoomEnd = 0;
            function departureZoom(pt) {
                var now = performance.now();
                if (zoomBusy || now - lastZoomEnd < 7000) return;
                zoomBusy = true;
                if (audio.on) sndDeparture();
                var k = 1.35, cx = 620, cy = 320;
                world.node().style.transform =
                    'translate(' + (cx - k * pt.x) + 'px,' + (cy - k * pt.y) + 'px) scale(' + k + ')';
                setTimeout(function () { world.node().style.transform = ''; }, 1700);
                setTimeout(function () { zoomBusy = false; lastZoomEnd = performance.now(); }, 3300);
            }

            // ================= THE TIME ENGINE ========================
            var YEAR = Y1;          // explore state: fully lit on load
            var playing = false, rafId = null, lastTs = 0;
            var SPEED = 6;          // years per second in Play mode

            function lanternState(L, y) {
                if (L.year == null || L.year <= 0) return 1;       // undated: always lit
                if (y < L.year) return 0;                          // not yet
                if (L.isDeath && y > L.year + 6) return 0.24;      // guttered to an ember
                return 1;
            }

            function setYear(y, kindle) {
                YEAR = Math.max(Y0, Math.min(Y1, y));
                // Lanterns.
                lit.forEach(function (L) {
                    var s = lanternState(L, YEAR);
                    var on = s > 0;
                    if (kindle && on && !L.wasOn && !reduceMotion) {
                        L.el.classed('tc-map__lantern--kindle', true);
                        (function (el) {
                            setTimeout(function () { el.classed('tc-map__lantern--kindle', false); }, 1300);
                        })(L.el);
                    }
                    // The single low tone of the piece: Norman George's
                    // lantern guttering out in France (s5.3 / s10).
                    if (kindle && L.isNG && L.lastS === 1 && s > 0 && s < 1) sndGutter();
                    L.el.attr('opacity', s);
                    L.wasOn = on;
                    L.lastS = s;
                });
                // Trails: reveal up to the year; the head runs while crossing.
                trails.forEach(function (T) {
                    var yA = T.years[0], yZ = T.years[T.years.length - 1];
                    var f, i = 0;
                    if (YEAR <= yA) f = 0;
                    else if (YEAR >= yZ) { f = 1; i = T.years.length - 1; }
                    else {
                        i = 1;
                        while (i < T.years.length && T.years[i] < YEAR) i++;
                        var span = Math.max(T.years[i] - T.years[i - 1], 0.0001);
                        f = T.fracs[i - 1] + (T.fracs[i] - T.fracs[i - 1]) * ((YEAR - T.years[i - 1]) / span);
                    }
                    // A long crossing just began during Play -> lean toward
                    // the place being left (the departures flourish).
                    if (kindle && !reduceMotion && !smallScreen.matches &&
                        T.lastSeg != null && i > T.lastSeg && f > 0 && f < 1) {
                        var pixLen = (T.fracs[i] - T.fracs[i - 1]) * T.total;
                        if (pixLen > 150) departureZoom(T.node.getPointAtLength(T.fracs[i - 1] * T.total));
                    }
                    T.lastSeg = i;
                    var Lpx = T.total * f;
                    T.node.setAttribute('stroke-dasharray', Lpx + ' ' + (T.total - Lpx + 2));
                    if (f > 0 && f < 1 && !reduceMotion) {
                        var pt = T.node.getPointAtLength(Lpx);
                        T.head.attr('cx', pt.x).attr('cy', pt.y).style('display', null);
                    } else {
                        T.head.style('display', 'none');
                    }
                });
                // The clarity spine: graticule sharpens per milestone passed;
                // the caption tells the most recent one.
                var passed = MILESTONES.filter(function (m) { return m.year <= YEAR; });
                graticule.style('stroke-opacity', 0.04 + passed.length * 0.008);
                caption.textContent = passed.length ? passed[passed.length - 1].text : 'before the registers — a world that wrote its poor down rarely';
                yearOut.textContent = Math.round(YEAR);
                range.value = Math.round(YEAR);
                cursor.attr('x1', tlX(YEAR)).attr('x2', tlX(YEAR));
                shade.attr('x', tlX(YEAR)).attr('width', Math.max(TLW - PAD - tlX(YEAR), 0));
                updateTree(YEAR);
                // The convergence settle (s8): once the third lantern has
                // kindled, the whole table warms and holds — a hearth,
                // not fireworks. Scrubbing back lifts it again.
                if (hud) hud.classList.toggle('tc-map--home', YEAR >= 2017.5);
            }

            function clarityWave(m) {
                if (reduceMotion) return;
                var xy = projection([m.lng, m.lat]);
                var ring = waveG.append('circle')
                    .attr('class', 'tc-map__wave')
                    .attr('cx', xy[0]).attr('cy', xy[1]).attr('r', 6);
                ring.transition().duration(2600).ease(d3.easeCubicOut)
                    .attr('r', 95).style('opacity', 0)
                    .remove();
            }

            function tick(ts) {
                if (!playing) return;
                // Clamp the frame delta: rAF pauses in hidden tabs, and an
                // unclamped dt would teleport decades on return.
                var dt = Math.min(lastTs ? (ts - lastTs) / 1000 : 0, 0.1);
                lastTs = ts;
                var before = YEAR;
                setYear(YEAR + dt * SPEED, true);
                MILESTONES.forEach(function (m) {
                    if (m.year > before && m.year <= YEAR) {
                        clarityWave(m);
                        if (m.year === 2016) sndHome();
                    }
                });
                if (YEAR >= Y1) { stop(); return; }   // explore is the default after Play (s9)
                rafId = requestAnimationFrame(tick);
            }
            function play() {
                if (reduceMotion || playing) return;
                if (YEAR >= Y1 - 1) setYear(Y0, false);
                playing = true; lastTs = 0;
                playBtn.textContent = '❚❚ pause';
                rafId = requestAnimationFrame(tick);
            }
            function stop() {
                playing = false;
                if (rafId) cancelAnimationFrame(rafId);
                playBtn.textContent = '▶ play the 400 years';
            }

            // ================= CONTROLS ===============================
            var controls = document.createElement('div');
            controls.className = 'tc-map-controls';
            var playBtn = document.createElement('button');
            playBtn.type = 'button';
            playBtn.className = 'tc-map-controls__play';
            playBtn.textContent = '▶ play the 400 years';
            var yearOut = document.createElement('span');
            yearOut.className = 'tc-map-controls__year';
            var range = document.createElement('input');
            range.type = 'range'; range.min = Y0; range.max = Y1; range.step = 1; range.value = Y1;
            range.className = 'tc-map-controls__range';
            range.setAttribute('aria-label', 'Scrub the map through time, ' + Y0 + ' to today');
            var endBtn = document.createElement('button');
            endBtn.type = 'button';
            endBtn.className = 'tc-map-controls__end';
            endBtn.textContent = 'skip to today';
            var caption = document.createElement('p');
            caption.className = 'tc-map-controls__caption';
            var sndBtn = document.createElement('button');
            sndBtn.type = 'button';
            sndBtn.className = 'tc-map-controls__end tc-map-controls__sound';
            sndBtn.textContent = '♪ sound: off';
            sndBtn.setAttribute('aria-pressed', 'false');
            controls.appendChild(playBtn);
            controls.appendChild(yearOut);
            controls.appendChild(range);
            controls.appendChild(endBtn);
            controls.appendChild(sndBtn);
            mount.parentNode.insertBefore(controls, mount);
            mount.parentNode.insertBefore(caption, mount.nextSibling);

            if (reduceMotion) playBtn.style.display = 'none';
            playBtn.addEventListener('click', function () { playing ? stop() : play(); });
            endBtn.addEventListener('click', function () { stop(); setYear(Y1, false); });
            sndBtn.addEventListener('click', function () {
                audio.on = !audio.on;
                if (audio.on && !audio.ctx && (window.AudioContext || window.webkitAudioContext)) {
                    audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (audio.on && audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
                sndBtn.textContent = audio.on ? '♪ sound: on' : '♪ sound: off';
                sndBtn.setAttribute('aria-pressed', audio.on ? 'true' : 'false');
            });
            range.addEventListener('input', function () { stop(); setYear(+range.value, false); });

            // ================= TIMELINE (now a scrubber) ==============
            var TLW = 1240, TLH = 120, PAD = 26;
            var tl = data.timeline, n = tl.decades.length;
            var bw = (TLW - PAD * 2) / n;
            function tlX(y) {
                return PAD + ((y - tl.start) / (tl.end - tl.start)) * (TLW - PAD * 2);
            }
            var tsvg = d3.select(document.getElementById('tc-map-timeline')).append('svg')
                .attr('viewBox', '0 0 ' + TLW + ' ' + TLH)
                .attr('preserveAspectRatio', 'xMidYMid meet');
            var totals = tl.decades.map(function (_, i) {
                return FAMILY_ORDER.reduce(function (s, f) { return s + (tl.series[f] ? tl.series[f][i] : 0); }, 0);
            });
            var max = d3.max(totals) || 1;
            tl.decades.forEach(function (dec, i) {
                var y = TLH - 28;
                FAMILY_ORDER.forEach(function (f) {
                    var v = tl.series[f] ? tl.series[f][i] : 0;
                    if (!v) return;
                    var h = (v / max) * (TLH - 46);
                    tsvg.append('rect')
                        .attr('x', PAD + i * bw + 0.5).attr('y', y - h)
                        .attr('width', Math.max(bw - 1.4, 1)).attr('height', h)
                        .attr('fill', data.families[f]).attr('opacity', 0.85)
                        .append('title').text(dec + 's · ' + f + ' · ' + v + (v === 1 ? ' event' : ' events'));
                    y -= h;
                });
                if (dec % 50 === 0) {
                    tsvg.append('text').attr('class', 'tc-map-timeline__label')
                        .attr('x', PAD + i * bw + bw / 2).attr('y', TLH - 10)
                        .attr('text-anchor', 'middle').text(dec);
                }
            });
            tsvg.append('text').attr('class', 'tc-map-timeline__title')
                .attr('x', PAD).attr('y', 14)
                .text('the record-density curve — drag anywhere on it to move through time');
            // The not-yet shade + the cursor line.
            var shade = tsvg.append('rect').attr('class', 'tc-map-timeline__shade')
                .attr('y', 18).attr('height', TLH - 46 + 10)
                .attr('x', tlX(Y1)).attr('width', 0);
            var cursor = tsvg.append('line').attr('class', 'tc-map-timeline__cursor')
                .attr('y1', 14).attr('y2', TLH - 24)
                .attr('x1', tlX(Y1)).attr('x2', tlX(Y1));
            // Click / drag to scrub.
            var dragging = false;
            function scrubFromEvent(ev) {
                var box = tsvg.node().getBoundingClientRect();
                var px = (ev.clientX - box.left) / box.width * TLW;
                var y = tl.start + ((px - PAD) / (TLW - PAD * 2)) * (tl.end - tl.start);
                stop(); setYear(y, false);
            }
            tsvg.on('pointerdown', function (ev) { dragging = true; scrubFromEvent(ev); })
                .on('pointermove', function (ev) { if (dragging) scrubFromEvent(ev); })
                .on('pointerup', function () { dragging = false; })
                .on('pointerleave', function () { dragging = false; });

            // ================= TOOLTIP + LEGEND + FOOT ================
            function showTip(e, ev) {
                var years = e.year ? (e.yearEnd ? e.year + '–' + e.yearEnd : e.year) : 'year TBC';
                var t = TIER[e.tier] || TIER.probable;
                tooltip.attr('hidden', null).html(
                    '<strong style="color:' + data.families[e.family] + '">' + esc(e.person) + '</strong>' +
                    '<span class="tc-map-tooltip__meta">' + esc(e.type) + ' · ' + years + '</span>' +
                    '<span class="tc-map-tooltip__place">' + esc(e.place) + '</span>' +
                    (e.source ? '<span class="tc-map-tooltip__source">' + esc(e.source) + '</span>' : '') +
                    '<span class="tc-map-tooltip__tier tc-map-tooltip__tier--' + e.tier + '">' + t.label + '</span>' +
                    (storyUrl(e.link) ? '<span class="tc-map-tooltip__cta">click → read the chapter</span>' : '')
                );
                moveTip(ev);
            }
            function moveTip(ev) {
                var box = mount.getBoundingClientRect();
                var x = ev.clientX - box.left, y = ev.clientY - box.top;
                tooltip.style('left', Math.min(x + 18, box.width - 290) + 'px')
                       .style('top', Math.max(y - 14, 8) + 'px');
            }
            function hideTip() { tooltip.attr('hidden', true); }
            function esc(s) {
                return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
                    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
                });
            }

            var legend = document.getElementById('tc-map-legend');
            if (legend) {
                var html = FAMILY_ORDER.map(function (f) {
                    return '<span class="tc-map-legend__chip"><i style="background:' +
                           data.families[f] + '"></i>' + f + '</span>';
                }).join('');
                html += '<span class="tc-map-legend__tiers">' +
                    '<em class="t-verified">verified</em><em class="t-living">living memory</em>' +
                    '<em class="t-probable">probable</em><em class="t-inherited">inherited</em></span>';
                legend.innerHTML = html;
            }

            var waiting = data.events.length - located.length;
            var foot = document.getElementById('tc-map-foot');
            if (foot) {
                foot.textContent = located.length + ' lanterns lit from ' + data.events.length +
                    ' documented events' + (waiting ? ' — ' + waiting +
                    ' more wait on a place, a year, or an answer, and will kindle as the record fills in.' : '.');
            }

            // Land at the explore state.
            setYear(Y1, false);
        }
    });
})();
