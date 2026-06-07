<?php
/**
 * Page Template: CopyCatCapybara Clicker — Faith's game.
 *
 * Template Name: Capybara Clicker
 *
 * A full-screen click-speed game for Faith and her friends. Tap anywhere
 * in the big frosted "button" arena as fast as you can before the timer
 * runs out. Four challenge lengths (5 / 15 / 30 / 60 s), each with its own
 * server-saved top-ten leaderboard via the tc-games REST API.
 *
 * Page setup (WP admin):
 *   - Title:  CopyCatCapybara Clicker  (or whatever Faith likes)
 *   - Slug:   capybara
 *   - Template: "Capybara Clicker"
 *
 * Assets (assets/css/capybara.css + assets/js/capybara.js) are enqueued
 * only for this template — see tc_ventures_enqueue_scripts() in functions.php.
 */

get_header(); ?>

<main id="primary" class="site-main capy">

    <div class="capy-arena" id="capy-arena" role="application" aria-label="Capybara clicker — tap as fast as you can">
        <canvas class="capy-canvas" id="capy-canvas" aria-hidden="true"></canvas>

        <!-- HUD: live stats, always visible over the arena. -->
        <div class="capy-hud" aria-live="polite">
            <div class="capy-stat"><span class="capy-stat__label">Taps</span><span class="capy-stat__val" id="capy-clicks">0</span></div>
            <div class="capy-stat capy-stat--time"><span class="capy-stat__label">Time</span><span class="capy-stat__val" id="capy-time">5</span></div>
            <div class="capy-stat"><span class="capy-stat__label">Speed</span><span class="capy-stat__val" id="capy-cps">0.0</span></div>
        </div>

        <div class="capy-rank" id="capy-rank" aria-hidden="true"></div>

        <!-- Center stack — content swaps by game state via JS. -->
        <div class="capy-center" id="capy-center">

            <!-- IDLE -->
            <div class="capy-screen capy-screen--idle" id="capy-idle">
                <h1 class="capy-title">CopyCat<span>Capybara</span>Clicker</h1>
                <p class="capy-sub">Pick a time, then tap the capybara as FAST as you can! 🐾</p>
                <div class="capy-durpick" id="capy-durpick" role="group" aria-label="Choose challenge length">
                    <button type="button" class="capy-dur" data-s="5">5s</button>
                    <button type="button" class="capy-dur is-active" data-s="15">15s</button>
                    <button type="button" class="capy-dur" data-s="30">30s</button>
                    <button type="button" class="capy-dur" data-s="60">60s</button>
                </div>
                <button type="button" class="capy-start" id="capy-start" aria-label="Start tapping">
                    <span class="capy-start__face">🐹</span>
                    <span class="capy-start__label">TAP TO START!</span>
                </button>
            </div>

            <!-- DONE -->
            <div class="capy-screen capy-screen--done" id="capy-done" hidden>
                <div class="capy-done__face" id="capy-done-face">🎉</div>
                <h2 class="capy-done__score"><span id="capy-final">0</span> taps!</h2>
                <p class="capy-done__sub" id="capy-done-sub"></p>
                <div class="capy-name" id="capy-name" hidden>
                    <p id="capy-name-prompt">New high score! What's your name?</p>
                    <input id="capy-name-input" type="text" maxlength="16" placeholder="Your name" autocomplete="off" />
                    <button type="button" class="capy-save" id="capy-save">Save my score ⭐</button>
                </div>
                <button type="button" class="capy-again" id="capy-again">Play again 🔁</button>
            </div>

        </div>

        <!-- Timer bar pinned to the bottom of the arena. -->
        <div class="capy-timerbar" id="capy-timerbar" aria-hidden="true"><i></i></div>
    </div>

    <!-- Leaderboard — tabbed by challenge length, fed by the REST API. -->
    <section class="capy-board" aria-label="Top scores">
        <h2 class="capy-board__title">🏆 Top Cappy Champions</h2>
        <div class="capy-board__tabs" id="capy-board-tabs" role="tablist">
            <button type="button" class="capy-board__tab" data-s="5" role="tab">5s</button>
            <button type="button" class="capy-board__tab is-active" data-s="15" role="tab">15s</button>
            <button type="button" class="capy-board__tab" data-s="30" role="tab">30s</button>
            <button type="button" class="capy-board__tab" data-s="60" role="tab">60s</button>
        </div>
        <ol class="capy-board__list" id="capy-board-list"></ol>
    </section>

    <a class="capy-home" href="<?php echo esc_url( home_url( '/family/faith' ) ); ?>">&larr; back to Faith's page</a>

</main>

<?php get_footer(); ?>
