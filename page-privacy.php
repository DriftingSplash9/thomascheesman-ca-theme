<?php
/**
 * Page Template: Privacy — "What I do (and don't do) with your data"
 *
 * Auto-applied by WordPress to the page whose slug is `privacy`.
 * Prose is hardcoded here, matching the editorial chrome of /about
 * and /contact (page-hero + narrow reading column).
 *
 * Accurate as of the 2026-06 "drop Google Analytics" decision: the
 * site runs no analytics, no advertising, and no tracking cookies.
 * If that ever changes, change this copy in the SAME commit — a
 * privacy page that lies is worse than none.
 */

get_header();
?>

<main id="primary" class="site-main privacy-page">

    <!-- ==============================================================
         PAGE HERO
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <span class="page-hero__eyebrow">Privacy</span>
            <h1 class="page-hero__title kinetic-text">What I do with your data</h1>
            <p class="page-hero__subtitle kinetic-fade">
                The short version: almost nothing. I don't track you.
            </p>
        </div>
    </section>

    <article class="about-body">
        <div class="container container--narrow">

            <section class="about-section scroll-animate">

                <p class="about-lead">
                    This site is a personal one &mdash; a letter to my kids and a home for some family history, not a business funnel. There's no analytics, no advertising, no tracking cookies, and nothing sold or handed to anyone. I don't know who you are, and I'm not trying to find out.
                </p>

                <h2>What the site does collect</h2>
                <p>Only what a feature can't work without:</p>
                <ul>
                    <li><strong>Arcade &amp; Capybara high scores.</strong> If you finish a game and save a score, the <em>name you type in</em> and that score are stored on the server and shown on the public leaderboard. Please don't put anything private in the name box. Want a name taken down? Email me and it's gone.</li>
                    <li><strong>If you email me.</strong> The contact address is click-to-copy; if you write, I receive whatever you choose to send. I won't add you to a mailing list &mdash; there isn't one.</li>
                    <li><strong>Basic server logs.</strong> My host (Hostinger) keeps standard access logs &mdash; things like an IP address and browser type &mdash; to keep the site up and safe. I don't use them to profile you, and they aren't shared or sold.</li>
                </ul>

                <h2>What it doesn't do</h2>
                <ul>
                    <li>No Google Analytics &mdash; or any analytics.</li>
                    <li>No advertising and no ad networks.</li>
                    <li>No tracking or marketing cookies, and no social-media tracking pixels.</li>
                    <li>No selling, renting, or trading of anyone's information.</li>
                </ul>

                <h2>Cookies</h2>
                <p>
                    Effectively none for tracking. A couple of small preferences are stored <em>in your own browser</em> and never sent anywhere &mdash; for example, which menu you prefer (the desk or the plain list) and your cursor-trail pick. They live on your device; clearing your browser data clears them.
                </p>

                <h2>Questions</h2>
                <p>
                    Ask me anything &mdash; <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">the contact page</a> has the address. If any of this ever changes, I'll change it here first.
                </p>

                <p class="privacy-updated"><em>Last updated: June 2026.</em></p>

            </section>

        </div>
    </article>

</main>

<?php get_footer(); ?>
