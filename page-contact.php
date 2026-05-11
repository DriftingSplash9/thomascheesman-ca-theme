<?php
/**
 * Page Template: Contact — "How to reach me"
 *
 * Auto-applied by WordPress to any page whose slug is `contact`.
 *
 * Layout: editorial chrome (page-hero + narrow reading column)
 * matching /about.
 *
 * No form. The page just publishes the email address (rot13'd in
 * source as a tiny anti-scraper measure; main.js decodes on load
 * for visible plaintext) plus a click-to-copy button and the
 * social links. Server-side mail was abandoned 2026-05-11 after
 * persistent delivery flakiness — see the comment block above
 * the (now-removed) tc_dispatch_handler() in functions.php.
 *
 * Why no form: a personal site doesn't need a screening UI. The
 * address is the contact channel. Visitors paste it into whatever
 * mail tool they already use (Gmail tab, phone, Outlook, etc.).
 */

get_header();

// Single source of truth for the email address. Rot13'd into the
// markup; main.js decodes on DOMContentLoaded so real-browser
// visitors see the actual address while scrapers see gibberish.
$tc_contact_recipient        = 'thomasmcheesman@gmail.com';
$tc_contact_recipient_rot13  = str_rot13( $tc_contact_recipient );
?>

<main id="primary" class="site-main contact-page">

    <!-- ==============================================================
         PAGE HERO
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <span class="page-hero__eyebrow">Contact</span>
            <h1 class="page-hero__title kinetic-text">How to reach me</h1>
            <p class="page-hero__subtitle kinetic-fade">
                Drop a line below.
            </p>
        </div>
    </section>

    <article class="about-body">
        <div class="container container--narrow">

            <section class="about-section scroll-animate">

                <p class="about-lead">
                    The most direct line is email. I read in spurts, so don't take a slow reply personally.
                </p>

                <div class="tc-contact-card">
                    <p class="tc-contact-card__label">Email</p>
                    <button class="tc-contact-card__address"
                            type="button"
                            data-tc-email-rot13="<?php echo esc_attr( $tc_contact_recipient_rot13 ); ?>"
                            aria-label="<?php esc_attr_e( 'Copy email address to clipboard', 'tc-ventures-child' ); ?>">
                        <span class="tc-contact-card__address-text"><?php echo esc_html( $tc_contact_recipient_rot13 ); ?></span>
                        <span class="tc-contact-card__action" aria-hidden="true">Click to copy</span>
                    </button>
                </div>

                <p class="contact-list__intro">Or find me on:</p>
                <ul class="contact-list">
                    <li>
                        <span class="contact-list__label">X</span>
                        <a href="https://x.com/TCheesy_" target="_blank" rel="noopener noreferrer">@TCheesy_</a>
                    </li>
                    <li>
                        <span class="contact-list__label">Facebook</span>
                        <a href="https://www.facebook.com/thomas.cheesman.9/" target="_blank" rel="noopener noreferrer">facebook.com/thomas.cheesman.9</a>
                    </li>
                </ul>

            </section>

        </div>
    </article>

</main>

<?php get_footer(); ?>
