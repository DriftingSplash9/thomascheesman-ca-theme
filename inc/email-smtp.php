<?php
/**
 * SMTP routing for wp_mail() — the site's outbound-email foundation.
 *
 * Hostinger's default transport (PHP mail()) is unreliable and
 * spam-prone. When SMTP credentials are present as constants in
 * wp-config.php, this routes EVERY wp_mail() call through them —
 * the puzzle-completion alert, comment notifications, the contact
 * form, password resets, all of it.
 *
 * If the constants are absent this file is INERT: wp_mail falls back
 * to the host default. So it is safe to ship before the credentials
 * exist — nothing breaks, sending just stays on the old transport
 * until Thomas completes the one-time setup below.
 *
 * --- One-time setup: Gmail App Password (free, permanent) ------------
 *
 *   1. Google Account -> Security. 2-Step Verification must be ON.
 *   2. Security -> App passwords -> create one; name it
 *      "thomascheesman.ca". Google shows a 16-character password ONCE.
 *   3. Edit wp-config.php (via Hostinger's File Manager) and add these
 *      ABOVE the "/* That's all, stop editing! *​/" line:
 *
 *        define( 'TC_SMTP_HOST',      'smtp.gmail.com' );
 *        define( 'TC_SMTP_PORT',      587 );
 *        define( 'TC_SMTP_USER',      'thomasmcheesman@gmail.com' );
 *        define( 'TC_SMTP_PASS',      'xxxxxxxxxxxxxxxx' ); // the app password
 *        define( 'TC_SMTP_FROM',      'thomasmcheesman@gmail.com' );
 *        define( 'TC_SMTP_FROM_NAME', 'thomascheesman.ca' );
 *
 *   wp-config.php lives outside the theme repo, so the password never
 *   touches git. To rotate it: revoke the app password in Google and
 *   generate a new one; update the constant.
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Point PHPMailer at the SMTP server when credentials are configured.
 */
add_action( 'phpmailer_init', function ( $mailer ) {
    if ( ! defined( 'TC_SMTP_HOST' ) || ! defined( 'TC_SMTP_USER' ) || ! defined( 'TC_SMTP_PASS' ) ) {
        return; // no credentials → leave the host default transport alone
    }
    $mailer->isSMTP();
    $mailer->Host       = TC_SMTP_HOST;
    $mailer->Port       = defined( 'TC_SMTP_PORT' ) ? (int) TC_SMTP_PORT : 587;
    $mailer->SMTPAuth   = true;
    $mailer->Username   = TC_SMTP_USER;
    $mailer->Password   = TC_SMTP_PASS;
    // Port 465 wants implicit SSL; 587 wants STARTTLS.
    $mailer->SMTPSecure = ( 465 === (int) $mailer->Port ) ? 'ssl' : 'tls';
} );

/**
 * Align the From address with the authenticated SMTP account.
 * Gmail (and most providers) reject or silently rewrite a mismatched
 * From header — a classic cause of "the email just never arrives".
 */
add_filter( 'wp_mail_from', function ( $from ) {
    return defined( 'TC_SMTP_FROM' ) ? TC_SMTP_FROM : $from;
} );
add_filter( 'wp_mail_from_name', function ( $name ) {
    return defined( 'TC_SMTP_FROM_NAME' ) ? TC_SMTP_FROM_NAME : $name;
} );
