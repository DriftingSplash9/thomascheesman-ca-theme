/**
 * The Lanterns of Record — P1 static light-table (family-map.js).
 *
 * One dataset (inc/data/family-map.json), rendered as:
 *   - a dark D3-geo world (Natural Earth) with a faint graticule,
 *   - carried-light trails (great-circle LineStrings per person),
 *   - lanterns: confidence tier -> brightness (verified crisp, probable
 *     soft, inherited a flicker, living warm), family -> colour,
 *   - the record-density timeline (events per decade, stacked by family),
 *   - hover dossiers + click-through into the long-reads.
 *
 * P2 adds the time cursor; this file deliberately renders the FINAL
 * fully-lit state (which is also the prefers-reduced-motion contract
 * for later phases). Loaded only on /map (see functions.php).
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
        // Hub order first, the two promoted strands beside McIver.
        var FAMILY_ORDER = ['Cheesman', 'Docherty', 'McIver', 'Campbell', 'Cameron',
                            'Lakeman', 'Verboom', 'Rycroft', 'Steinke', 'Haiste'];
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function storyUrl(link) {
            if (!link) return null;
            // Orphan lines live AT their nested path; hub lines under /story/.
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

            // The after-hours archive: sphere, graticule, barely-there land.
            svg.append('path').datum({ type: 'Sphere' })
                .attr('d', path).attr('class', 'tc-map__sphere');
            svg.append('path').datum(d3.geoGraticule10())
                .attr('d', path).attr('class', 'tc-map__graticule');
            svg.append('path').datum(land)
                .attr('d', path).attr('class', 'tc-map__land');

            // One soft radial gradient per family for the lantern halos.
            var defs = svg.append('defs');
            FAMILY_ORDER.forEach(function (f) {
                var g = defs.append('radialGradient').attr('id', 'tc-glow-' + f);
                g.append('stop').attr('offset', '0%').attr('stop-color', data.families[f]).attr('stop-opacity', 0.95);
                g.append('stop').attr('offset', '55%').attr('stop-color', data.families[f]).attr('stop-opacity', 0.38);
                g.append('stop').attr('offset', '100%').attr('stop-color', data.families[f]).attr('stop-opacity', 0);
            });

            // Carried light, as faint static trails (P2 animates them).
            var trails = svg.append('g').attr('class', 'tc-map__trails');
            (data.paths || []).forEach(function (p) {
                trails.append('path')
                    .datum({ type: 'LineString', coordinates: p.points.map(function (pt) { return [pt[0], pt[1]]; }) })
                    .attr('d', path)
                    .attr('class', 'tc-map__trail')
                    .attr('stroke', data.families[p.family]);
            });

            // De-stack lanterns sharing a place: a tiny golden-angle spiral
            // around the projected point, deterministic by arrival order.
            var located = data.events.filter(function (e) { return e.lat != null && e.lng != null; });
            var stacks = {};
            located.forEach(function (e) {
                var key = e.lat.toFixed(1) + ',' + e.lng.toFixed(1);
                var i = (stacks[key] = (stacks[key] || 0) + 1) - 1;
                var xy = projection([e.lng, e.lat]);
                var r = i === 0 ? 0 : 3.4 * Math.sqrt(i);
                var a = i * 2.39996; // golden angle
                e._x = xy[0] + r * Math.cos(a);
                e._y = xy[1] + r * Math.sin(a);
            });

            var lanterns = svg.append('g').attr('class', 'tc-map__lanterns');
            var tooltip = d3.select(mount).append('div').attr('class', 'tc-map-tooltip').attr('hidden', true);

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
                    .attr('r', t.core).attr('fill', e.family ? data.families[e.family] : '#fff');
                // A generous invisible hit-target carries the interaction.
                var url = storyUrl(e.link);
                var hit = g.append('circle').attr('class', 'tc-map__hit').attr('r', Math.max(t.halo, 11))
                    .on('mouseenter', function (ev) { showTip(e, ev); })
                    .on('mousemove', function (ev) { moveTip(ev); })
                    .on('mouseleave', hideTip);
                if (url) {
                    hit.style('cursor', 'pointer')
                       .on('click', function () { window.location.href = url; });
                }
            });

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

            drawLegend(data);
            drawTimeline(data);

            var waiting = data.events.length - located.length;
            var foot = document.getElementById('tc-map-foot');
            if (foot) {
                foot.textContent = located.length + ' lanterns lit from ' + data.events.length +
                    ' documented events' + (waiting ? ' — ' + waiting +
                    ' more wait on a place, a year, or an answer, and will kindle as the record fills in.' : '.');
            }
        }

        function drawLegend(data) {
            var el = document.getElementById('tc-map-legend');
            if (!el) return;
            var html = FAMILY_ORDER.map(function (f) {
                return '<span class="tc-map-legend__chip"><i style="background:' +
                       data.families[f] + '"></i>' + f + '</span>';
            }).join('');
            html += '<span class="tc-map-legend__tiers">' +
                '<em class="t-verified">verified</em><em class="t-living">living memory</em>' +
                '<em class="t-probable">probable</em><em class="t-inherited">inherited</em></span>';
            el.innerHTML = html;
        }

        function drawTimeline(data) {
            var elm = document.getElementById('tc-map-timeline');
            if (!elm || !data.timeline) return;
            var tl = data.timeline, W = 1240, H = 120, pad = 26;
            var n = tl.decades.length;
            var totals = tl.decades.map(function (_, i) {
                return FAMILY_ORDER.reduce(function (s, f) { return s + (tl.series[f] ? tl.series[f][i] : 0); }, 0);
            });
            var max = d3.max(totals) || 1;
            var bw = (W - pad * 2) / n;
            var svg = d3.select(elm).append('svg')
                .attr('viewBox', '0 0 ' + W + ' ' + H)
                .attr('preserveAspectRatio', 'xMidYMid meet');
            tl.decades.forEach(function (dec, i) {
                var y = H - 28;
                FAMILY_ORDER.forEach(function (f) {
                    var v = tl.series[f] ? tl.series[f][i] : 0;
                    if (!v) return;
                    var h = (v / max) * (H - 46);
                    svg.append('rect')
                        .attr('x', pad + i * bw + 0.5).attr('y', y - h)
                        .attr('width', Math.max(bw - 1.4, 1)).attr('height', h)
                        .attr('fill', data.families[f]).attr('opacity', 0.85)
                        .append('title').text(dec + 's · ' + f + ' · ' + v +
                            (v === 1 ? ' event' : ' events'));
                    y -= h;
                });
                if (dec % 50 === 0) {
                    svg.append('text').attr('class', 'tc-map-timeline__label')
                        .attr('x', pad + i * bw + bw / 2).attr('y', H - 10)
                        .attr('text-anchor', 'middle').text(dec);
                }
            });
            svg.append('text').attr('class', 'tc-map-timeline__title')
                .attr('x', pad).attr('y', 14)
                .text('the record-density curve — how this family became visible, decade by decade');
        }
    });
})();
