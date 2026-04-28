<?php
/**
 * Page Template: Contact — "How to reach me"
 *
 * Auto-applied by WordPress to any page whose slug is `contact`.
 *
 * Layout: editorial chrome (page-hero + narrow reading column)
 * matching /about. Primary channel is the dispatch form, which
 * posts to admin-post.php and is handled by tc_dispatch_handler()
 * in functions.php. The recipient inbox is hidden from markup —
 * it's hardcoded server-side and never appears in HTML.
 *
 * Submission feedback comes back via ?dispatch= query string:
 *   sent    — success banner
 *   invalid — required fields missing or email malformed
 *   error   — generic failure (nonce, time-trap, mail send fail)
 */

get_header();

// Read submission feedback flag once, sanitized.
$dispatch_status = isset( $_GET['dispatch'] ) ? sanitize_key( $_GET['dispatch'] ) : '';
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
                    The form below is the most direct line &mdash; it lands in my inbox. I read in spurts, so don't take a slow reply personally.
                </p>

                <?php if ( 'sent' === $dispatch_status ) : ?>
                    <div class="dispatch__banner dispatch__banner--ok" role="status">
                        Message sent. I'll get back to you when I'm next at a screen.
                    </div>
                <?php elseif ( 'invalid' === $dispatch_status ) : ?>
                    <div class="dispatch__banner dispatch__banner--err" role="alert">
                        That didn't go through &mdash; please check your email address and that the message field isn't empty.
                    </div>
                <?php elseif ( 'error' === $dispatch_status ) : ?>
                    <div class="dispatch__banner dispatch__banner--err" role="alert">
                        Something went sideways on my end. Try again in a moment, or reach me on the socials below.
                    </div>
                <?php endif; ?>

                <?php
                // Admin-only diagnostic — surfaces SMTP route status,
                // wp_mail return value, and wp_mail_failed errors so
                // deliverability issues are visible without checking PHP
                // error logs. Gated to manage_options so visitors never
                // see this; only Thomas (logged in) does.
                if ( $dispatch_status && current_user_can( 'manage_options' ) ) :
                    $tc_smtp_route   = get_transient( 'tc_dispatch_smtp_route' );
                    $tc_last_attempt = get_transient( 'tc_dispatch_last_attempt' );
                    $tc_last_error   = get_transient( 'tc_dispatch_last_error' );
                    if ( $tc_smtp_route || $tc_last_attempt || $tc_last_error ) : ?>
                        <div style="margin: 0 0 24px; padding: 14px 18px; background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.18); border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.82rem; line-height: 1.7; color: var(--text-light);">
                            <strong style="display: block; margin-bottom: 6px; color: var(--text-dark); font-family: inherit;">Admin diagnostic (only you see this)</strong>
                            <?php if ( $tc_smtp_route ) : ?>
                                SMTP route: <?php echo esc_html( $tc_smtp_route ); ?><br>
                            <?php endif; ?>
                            <?php if ( $tc_last_attempt ) : ?>
                                Last attempt: <?php echo esc_html( $tc_last_attempt['time'] ); ?><br>
                                To (after +alias rewrite): <?php echo esc_html( $tc_last_attempt['to'] ); ?><br>
                                Subject: <?php echo esc_html( $tc_last_attempt['subject'] ); ?><br>
                                wp_mail returned: <?php echo $tc_last_attempt['sent'] ? 'true (PHPMailer accepted)' : 'false (PHPMailer threw)'; ?><br>
                            <?php endif; ?>
                            <?php if ( $tc_last_error ) : ?>
                                wp_mail error: <?php echo esc_html( $tc_last_error ); ?>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                <?php endif; ?>

                <form class="dispatch" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" novalidate>
                    <input type="hidden" name="action" value="tc_dispatch_send">
                    <?php wp_nonce_field( 'tc_dispatch', 'tc_dispatch_nonce' ); ?>
                    <input type="hidden" name="dispatch_t0" value="<?php echo esc_attr( time() ); ?>">

                    <!-- Honeypot — visually hidden, real humans never see it.
                         Bots that fill every field will fill this one too;
                         server-side, a non-empty value silently drops the
                         submission while pretending success. -->
                    <div class="dispatch__honeypot" aria-hidden="true">
                        <label>Website
                            <input type="text" name="dispatch_website" tabindex="-1" autocomplete="off">
                        </label>
                    </div>

                    <div class="dispatch__field">
                        <label class="dispatch__label" for="dispatch-name">
                            Name <span class="dispatch__optional">(optional)</span>
                        </label>
                        <input class="dispatch__input" type="text" id="dispatch-name" name="dispatch_name" maxlength="120" autocomplete="name">
                    </div>

                    <div class="dispatch__field">
                        <label class="dispatch__label" for="dispatch-email">
                            Email
                        </label>
                        <input class="dispatch__input" type="email" id="dispatch-email" name="dispatch_email" required maxlength="200" autocomplete="email">
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

                    <button class="dispatch__send" type="submit">Send</button>
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
