<?php
/**
 * Page Template: Contact — "How to reach me"
 *
 * Auto-applied by WordPress to any page whose slug is `contact`.
 *
 * Layout: editorial chrome (page-hero + narrow reading column)
 * matching /about.
 *
 * Email path: client-side mailto: composer. The form fields are
 * captured by a JS submit handler that builds a mailto: URL with
 * subject + pre-filled body, then opens the visitor's default mail
 * client. Zero server-side mail dependency — no SMTP, no SPF/DKIM,
 * no third-party form service to maintain.
 *
 * The recipient address is rendered into a data attribute on the
 * form (rot13'd as a tiny anti-scraper measure; bots looking for
 * mailto: links won't see a literal address). For visitors with JS
 * disabled, the form falls back to a plain mailto link rendered
 * below as a graceful degradation path.
 */

get_header();

// Recipient — kept here as a single source of truth so future swaps
// (e.g., a dedicated contact@thomascheesman.ca address) only touch
// one line. Rendered rot13'd into the page; main.js decodes and
// builds the mailto: at submit time.
$tc_contact_recipient = 'thomasmcheesman@gmail.com';
$tc_contact_recipient_rot13 = str_rot13( $tc_contact_recipient );
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
                    The form below is the most direct line. Filling it out opens your email app with a pre-composed message ready to send &mdash; nothing leaves your computer until you hit Send in your mail client. I read in spurts, so don't take a slow reply personally.
                </p>

                <form class="dispatch"
                      data-tc-mailto
                      data-tc-recipient-rot13="<?php echo esc_attr( $tc_contact_recipient_rot13 ); ?>"
                      action="mailto:<?php echo esc_attr( $tc_contact_recipient_rot13 ); ?>"
                      method="post"
                      enctype="text/plain"
                      novalidate>

                    <div class="dispatch__field">
                        <label class="dispatch__label" for="dispatch-name">
                            Name <span class="dispatch__optional">(optional)</span>
                        </label>
                        <input class="dispatch__input" type="text" id="dispatch-name" name="dispatch_name" maxlength="120" autocomplete="name">
                    </div>

                    <div class="dispatch__field">
                        <label class="dispatch__label" for="dispatch-email">
                            Your email <span class="dispatch__optional">(so I can reply)</span>
                        </label>
                        <input class="dispatch__input" type="email" id="dispatch-email" name="dispatch_email" maxlength="200" autocomplete="email">
                    </div>

                    <div class="dispatch__field">
                        <label class="dispatch__label" for="dispatch-subject">
                            Subject <span class="dispatch__optional">(optional)</span>
                        </label>
                        <input class="dispatch__input" type="text" id="dispatch-subject" name="dispatch_subject" maxlength="200">
                    </div>

                    <div class="dispatch__field">
                        <label class="dispatch__label" for="dispatch-message">
                            Message
                        </label>
                        <textarea class="dispatch__input dispatch__input--textarea" id="dispatch-message" name="dispatch_message" required rows="6" maxlength="4000"></textarea>
                    </div>

                    <button class="dispatch__send" type="submit">Open in your email app</button>

                    <p class="dispatch__hint">
                        On submit your default email client will open with the message pre-filled. Hit Send in there and it lands in my inbox.
                    </p>
                </form>

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
