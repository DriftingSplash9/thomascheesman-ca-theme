<?php
/**
 * Page Template: Projects
 *
 * Auto-applied to the WP page with slug `projects`. Page setup:
 *   - Title: "Projects"
 *   - Slug: projects  (no parent → URL is /projects/)
 *
 * Two long-form project entries — the Economic Report Influence Graph
 * and Rocket Lander — plus a short closing note. Structure follows
 * page-case-studies.php: .page-hero, then .about-body > .about-section
 * blocks so the prose inherits the site's essay chrome. What is new
 * here is the per-entry furniture (meta line, spec table, figures,
 * the descent diagram), which lives in assets/css/projects.css and is
 * enqueued only on this page.
 *
 * Two decisions worth recording:
 *
 * 1. Per-entry accent. Each .project-entry sets --project-accent and
 *    everything accented inside it reads that one variable. The graph
 *    entry uses the site cyan; the rocket entry uses amber, so the two
 *    read as different objects while scrolling. A third project is one
 *    modifier rule.
 *
 * 2. The graph link points at /reports-graph, the unlisted static
 *    bundle served by the parse_request handler in functions.php. That
 *    page keeps its noindex meta and X-Robots-Tag, and the link below
 *    carries rel="nofollow", so linking it here makes it reachable
 *    without putting it in the search index. If it should stay
 *    hand-shared only, delete the .project-entry__cta block.
 *
 * Screenshots live in assets/img/projects/ rather than the media
 * library: they are part of the page's design, and they version and
 * deploy with the theme.
 */

get_header(); ?>

<main id="primary" class="site-main projects-page">

    <!-- ==============================================================
         PAGE HERO
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <span class="page-hero__eyebrow">Things I build</span>
            <h1 class="page-hero__title kinetic-text">Projects</h1>
            <p class="page-hero__subtitle kinetic-fade">
                A map of where official numbers come from, and a rocket that will not land
            </p>
        </div>
    </section>

    <article class="about-body">
        <div class="container">

            <!-- ======================================================
                 INTRO
                 ====================================================== -->
            <section class="about-section about-section--lead scroll-animate">
                <p class="about-lead projects-intro">
                    Two projects big enough to talk about. One draws the hidden structure behind
                    public statistics; the other drops a rocket through weather onto a moving barge.
                    Both are built the same way &mdash; I own the design calls, the rules and the
                    physics, and I direct AI to write the code against them.
                </p>
            </section>

            <!-- ======================================================
                 THE INFLUENCE GRAPH
                 ====================================================== -->
            <section class="about-section scroll-animate project-entry project-entry--graph">

                <p class="project-entry__meta">
                    <span class="project-entry__status">In active development</span>
                    <span>TypeScript &middot; React &middot; Three.js</span>
                    <span>Solo build, 2025&ndash;</span>
                </p>

                <h2 class="about-section__heading project-entry__title">The Economic Report Influence Graph</h2>

                <div class="project-entry__lead">
                    <p>
                        Every important number in public life &mdash; inflation, a disability payment,
                        how much your city gets for road repair &mdash; is calculated from some other
                        number, which was calculated from another, back to a handful of foundational
                        statistical releases. Almost nobody can see that structure, including the
                        people who depend on it.
                    </p>
                    <p>
                        This draws it. Each sphere is a real published report, each line a documented
                        dependency between two of them, and a report&rsquo;s size is how much everything
                        else rests on it. It runs in a browser, in 3D, with no backend:
                        <strong>3,632 reports and 3,272 dependencies</strong> across more than a hundred
                        countries, from Statistics Canada down to individual municipal budgets.
                    </p>
                </div>

                <div class="project-entry__shots">
                    <figure class="project-entry__figure">
                        <img
                            src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/img/projects/graph-everything.webp' ); ?>"
                            width="1280" height="800" loading="lazy" decoding="async"
                            alt="A dense three-dimensional cloud of thousands of coloured spheres joined by fine lines, with a control bar reading 3,352 of 3,352 reports shown.">
                        <figcaption class="project-entry__caption">
                            Everything at once. Colour is which system publishes &mdash; reds Canada,
                            blues the United States, greens the European Union, violets Africa and the
                            international bodies.
                        </figcaption>
                    </figure>

                    <figure class="project-entry__figure">
                        <img
                            src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/img/projects/graph-nations.webp' ); ?>"
                            width="1280" height="800" loading="lazy" decoding="async"
                            alt="A sparser view of the same graph showing about 173 spheres of widely varying size joined by long lines.">
                        <figcaption class="project-entry__caption">
                            The same corpus filtered to national-tier reports. Sphere size is weighted
                            authority &mdash; how much of everything else traces back through that one release.
                        </figcaption>
                    </figure>
                </div>

                <p class="project-entry__cta">
                    <a class="project-entry__button" href="<?php echo esc_url( home_url( '/reports-graph' ) ); ?>" rel="nofollow">
                        Open the graph <span aria-hidden="true">&rarr;</span>
                    </a>
                    <span class="project-entry__cta-note">Runs in the browser. Give it a moment on a phone.</span>
                </p>

                <div class="project-entry__body">
                    <h3 class="project-entry__rubric">The one rule the whole project runs on</h3>
                    <p>
                        <em>No document, no edge.</em> A line only gets drawn if a published document
                        says, in words I can quote, that one report uses the other as an input. Leads I
                        cannot source go to a dropped list with a reason attached, not into the graph.
                        Every existing line has since been graded on how well its cited document actually
                        supports it &mdash; <strong>1,256 A, 1,404 B, 612 C</strong> &mdash; and the grade
                        is visible in the app, because a map that hides its own weak spots is worse than
                        no map.
                    </p>

                    <h3 class="project-entry__rubric">What is actually hard about it</h3>
                    <p>
                        Not the 3D. The hard part is holding one standard across eighty-odd research
                        sessions without drift, which is why the repository carries a fixed extraction
                        protocol, two lane playbooks and exactly one handoff file rather than a pile of
                        notes &mdash; and why a validator runs on every data change and refuses to pass on
                        a dangling reference.
                    </p>
                    <p>
                        The other hard part is drawing 3,600 nodes without lying. Cluster spacing, node
                        size scaling and camera framing all change what a viewer believes about the data,
                        so each one gets measured rather than eyeballed &mdash; including a repulsion force
                        I shipped, retested against a clean rig, and had to rebuild when the first
                        calibration turned out to be measuring its own bug.
                    </p>
                </div>

                <dl class="project-entry__spec">
                    <div>
                        <dt>Corpus</dt>
                        <dd>3,632 reports &middot; 3,272 documented dependencies</dd>
                    </div>
                    <div>
                        <dt>Evidence grades</dt>
                        <dd>1,256 A &middot; 1,404 B &middot; 612 C &mdash; 38.4% A-share</dd>
                    </div>
                    <div>
                        <dt>Coverage</dt>
                        <dd>130+ countries; national, state, municipal and institutional tiers</dd>
                    </div>
                    <div>
                        <dt>Code</dt>
                        <dd>~24,700 lines of TypeScript across 50 source files</dd>
                    </div>
                    <div>
                        <dt>Stack</dt>
                        <dd>Vite &middot; React &middot; three-forcegraph &middot; d3-force-3d &middot; no backend</dd>
                    </div>
                </dl>

                <p class="project-entry__repo">
                    Source:
                    <a href="https://github.com/DriftingSplash9/Reports-Clustering" target="_blank" rel="noopener noreferrer">
                        github.com/DriftingSplash9/Reports-Clustering <span aria-hidden="true">&#x2197;</span>
                    </a>
                </p>

            </section>

            <!-- ======================================================
                 ROCKET LANDER

                 The descent diagram is inline SVG rather than an image:
                 it is a handful of lines and labels, it stays crisp at
                 any zoom, and its colours come from the same custom
                 properties as the rest of the entry, so it cannot drift
                 out of sync with the theme.
                 ====================================================== -->
            <section class="about-section scroll-animate project-entry project-entry--rocket">

                <p class="project-entry__meta">
                    <span class="project-entry__status">Flying, not yet landable</span>
                    <span>Godot 4.7 &middot; GDScript</span>
                    <span>Started July 2026</span>
                </p>

                <h2 class="about-section__heading project-entry__title">Rocket Lander</h2>

                <div class="project-entry__lead">
                    <p>
                        Land a rocket, gently, with the fuel you were given. It falls belly-down through
                        layered, gusting wind, flips, burns, and has to sit down on a droneship that is
                        bobbing on swell and drifting away from you. A run lasts twenty to sixty seconds.
                        Failure is instant and obviously your own fault.
                    </p>
                    <p>
                        The teaching idea came first: I want the tuning knobs to <em>be</em> the interface,
                        so a nine-to-twelve-year-old learns the physics by flying against it rather than
                        reading about it. There are <strong>38 knobs</strong> behind one key &mdash; gravity,
                        thrust, gimbal authority, drag, wind, fuel, pad tolerances &mdash; and the panel
                        builds itself from a spec table, so adding a knob is one variable and one row.
                    </p>
                </div>

                <figure class="project-entry__figure project-entry__figure--wide">
                    <div class="project-entry__scroller">
                        <svg class="rl-diagram" viewBox="0 0 900 470" role="img"
                             aria-label="Descent profile: the rocket falls belly-down from one kilometre, glides sideways by tilting off broadside, commits to the flip at three hundred metres, then burns down to the barge.">

                            <line class="rl-axis" x1="92" y1="42" x2="92" y2="412"/>
                            <line class="rl-grid" x1="92" y1="52" x2="868" y2="52"/>
                            <line class="rl-grid" x1="92" y1="232" x2="868" y2="232"/>
                            <line class="rl-commit" x1="92" y1="304" x2="868" y2="304"/>
                            <line class="rl-sea" x1="92" y1="412" x2="868" y2="412"/>

                            <text class="rl-tick" x="82" y="56" text-anchor="end">1 000 m</text>
                            <text class="rl-tick" x="82" y="236" text-anchor="end">500 m</text>
                            <text class="rl-tick" x="82" y="308" text-anchor="end">300 m</text>
                            <text class="rl-tick" x="82" y="416" text-anchor="end">sea level</text>

                            <path class="rl-path" d="M 168 60 C 268 156 342 236 470 272 S 640 302 700 304"/>
                            <path class="rl-burn" d="M 700 304 L 700 396"/>

                            <rect class="rl-ship" x="150" y="53" width="34" height="11" rx="2"/>
                            <rect class="rl-ship" x="694" y="288" width="11" height="30" rx="2"/>

                            <rect class="rl-barge" x="640" y="396" width="150" height="16"/>
                            <line class="rl-sea rl-sea--deck" x1="660" y1="404" x2="770" y2="404"/>

                            <text class="rl-label rl-label--key" x="196" y="44">Entry &mdash; belly-down</text>
                            <text class="rl-label" x="196" y="88">Terminal 61 m/s flat &middot; 190+ m/s nose-first</text>
                            <text class="rl-label rl-label--key" x="150" y="200">Tilt ~25&deg; off broadside</text>
                            <text class="rl-label" x="150" y="220">&rarr; glide ratio 0.26 &mdash; the only way</text>
                            <text class="rl-label" x="150" y="240">to reach a barge not directly below</text>
                            <text class="rl-label rl-label--hot" x="866" y="296" text-anchor="end">Flip commit &mdash; 300 m</text>
                            <text class="rl-label" x="866" y="322" text-anchor="end">at 250 m it craters</text>
                            <text class="rl-label rl-label--key" x="676" y="356" text-anchor="end">Landing burn</text>
                            <text class="rl-label" x="676" y="376" text-anchor="end">&asymp; half the tank</text>
                            <text class="rl-label" x="866" y="440" text-anchor="end">Droneship &mdash; bobs on swell, drifts downwind</text>
                        </svg>
                    </div>
                    <figcaption class="project-entry__caption">
                        The descent profile, taken from the flight model rather than drawn to look right.
                        These are the numbers the ship actually produces at its current settings.
                    </figcaption>
                </figure>

                <div class="project-entry__body">
                    <h3 class="project-entry__rubric">Three things the build taught me</h3>
                    <p>
                        <strong>Thrust from the tail does nothing on its own.</strong> I asked for the
                        engine to push from the back, expecting it to matter. A nozzle pointing down the
                        body axis pushes straight through the centre of mass and produces no torque
                        &mdash; which is exactly why a real rocket&rsquo;s engine being at the bottom does
                        not tip it over. Gimballing the nozzle is what makes it steer.
                    </p>
                    <p>
                        <strong>Drag had to be split in two.</strong> Along-hull and across-hull flow are
                        dragged separately, and across is about twelve times along. That split is the
                        entire reason the belly-flop is worth doing: because the two components do not sum
                        to a force pointing straight back along the airflow, tilting off broadside produces
                        lift, and that glide is the only way to reach a barge that is not directly beneath you.
                    </p>
                    <p>
                        <strong>A restoring force without a damper is a pendulum.</strong> The weathervane
                        moment that settles the ship belly-down is a spring; with no aerodynamic rotational
                        damper against it, the ship swings forever. Easy to forget, extremely obvious the
                        moment it is missing.
                    </p>

                    <h3 class="project-entry__rubric">Where it is</h3>
                    <p>
                        It flies. Landing it is brutally hard &mdash; which is the direction, not the bug:
                        I am after real physics and real logic, difficult but winnable, the way the actual
                        thing is difficult but winnable. What is left is tuning and time. It is parked
                        until the influence graph is more or less finished and keeping itself up to date.
                    </p>
                </div>

                <dl class="project-entry__spec">
                    <div>
                        <dt>Engine</dt>
                        <dd>Godot 4.7.1 &middot; GDScript &middot; Jolt physics</dd>
                    </div>
                    <div>
                        <dt>Flight model</dt>
                        <dd>Gimballed thrust, weak RCS, four hinged flaps, finite fuel</dd>
                    </div>
                    <div>
                        <dt>Weather</dt>
                        <dd>Density falling with altitude; wandering wind layers, three out-of-phase gusts</dd>
                    </div>
                    <div>
                        <dt>Tuning</dt>
                        <dd>38 live knobs, spec-driven panel, presets saved to disk</dd>
                    </div>
                    <div>
                        <dt>Target player</dt>
                        <dd>Ages 9&ndash;12 &mdash; one new variable introduced per level</dd>
                    </div>
                    <div>
                        <dt>Status</dt>
                        <dd>Flight model and weather built &middot; tuning by feel is next</dd>
                    </div>
                </dl>

            </section>

            <!-- ======================================================
                 CLOSING NOTE
                 ====================================================== -->
            <section class="about-section scroll-animate project-coda">
                <h2 class="about-section__heading">How these get made</h2>
                <p>
                    I am not a trained programmer. I spent seventeen years running kitchens, and what
                    transferred was the useful half: deciding what &ldquo;good&rdquo; means, writing the
                    standard down, and holding every plate that leaves to it. The code is written with
                    AI; the specification, the evidence rules, the physics and the judgement about what
                    ships are mine &mdash; and so are the parts that are wrong.
                </p>
            </section>

        </div>
    </article>

</main>

<?php get_footer(); ?>
