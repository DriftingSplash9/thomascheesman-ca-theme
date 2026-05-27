<?php
/**
 * Secret-drawer event alerts.
 *
 * Registers a small public REST endpoint the drawer engine calls when
 * a visitor reaches a milestone — most importantly the Top Prize and
 * the rare "Golden Egg" lazy-finish. Each valid call emails Thomas.
 *
 *   POST /wp-json/tc-drawer/v1/event   body: { "event": "golden-egg" }
 *
 * The endpoint is unauthenticated (the puzzle-solver is just a
 * visitor, not logged in), so it is defended by:
 *   - an event whitelist (unknown names are ignored)
 *   - a 60-second cooldown between any two emails
 *   - a hard daily cap (TC_DRAWER_EVENT_DAILY_CAP)
 *   - a soft same-origin referer check
 * Worst case under abuse: a dozen junk emails in a day, then silence.
 *
 * The engine fires each milestone from a `once` interaction with
 * localStorage persistence, so in normal use this sends at most one
 * email per visitor per milestone.
 *
 * Recipient: TC_ALERT_EMAIL if defined, else the WP admin email.
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! defined( 'TC_DRAWER_EVENT_DAILY_CAP' ) ) {
    define( 'TC_DRAWER_EVENT_DAILY_CAP', 12 );
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'tc-drawer/v1', '/event', array(
        'methods'             => 'POST',
        'callback'            => 'tc_drawer_event_handler',
        'permission_callback' => '__return_true',
        'args'                => array(
            'event' => array(
                'type'              => 'string',
                'required'          => true,
                'sanitize_callback' => 'sanitize_key',
            ),
        ),
    ) );
} );

/**
 * Human-readable label for each whitelisted event.
 */
function tc_drawer_event_labels() {
    return array(
        'test'          => 'a test ping',
        'golden-egg'    => 'the GOLDEN EGG (the rare lazy-finish — they left the dust and ATE the banana!)',
        'top-prize'     => 'the Top Prize (the Ledger Wallet)',
        'bigger-reward' => 'the BIGGER REWARD (they sold the banana for $6.4M — Faberge Egg commissioned!)',
    );
}

/**
 * Handle a drawer-event POST: validate, throttle, email.
 * Always returns HTTP 200 so the fire-and-forget client never retries.
 */
function tc_drawer_event_handler( WP_REST_Request $request ) {
    $event  = sanitize_key( (string) $request->get_param( 'event' ) );
    $labels = tc_drawer_event_labels();

    if ( ! isset( $labels[ $event ] ) ) {
        return new WP_REST_Response( array( 'ok' => false, 'reason' => 'unknown-event' ), 200 );
    }

    // Soft same-origin check — only reject a referer that is clearly
    // foreign; many browsers omit it entirely, which we allow.
    $ref = isset( $_SERVER['HTTP_REFERER'] ) ? wp_unslash( $_SERVER['HTTP_REFERER'] ) : '';
    if ( $ref ) {
        $ref_host  = wp_parse_url( $ref, PHP_URL_HOST );
        $site_host = wp_parse_url( home_url(), PHP_URL_HOST );
        if ( $ref_host && $site_host && strcasecmp( $ref_host, $site_host ) !== 0 ) {
            return new WP_REST_Response( array( 'ok' => false, 'reason' => 'bad-origin' ), 200 );
        }
    }

    // Throttle: 60s cooldown + a hard daily cap.
    if ( get_transient( 'tc_drawer_event_cooldown' ) ) {
        return new WP_REST_Response( array( 'ok' => true, 'sent' => false, 'reason' => 'cooldown' ), 200 );
    }
    $count = (int) get_transient( 'tc_drawer_events_today' );
    if ( $count >= (int) TC_DRAWER_EVENT_DAILY_CAP ) {
        return new WP_REST_Response( array( 'ok' => true, 'sent' => false, 'reason' => 'daily-cap' ), 200 );
    }

    // Compose + send.
    $to      = defined( 'TC_ALERT_EMAIL' ) ? TC_ALERT_EMAIL : get_option( 'admin_email' );
    // Format in Grande Prairie's timezone explicitly, so the alert
    // always reads in Thomas's local time regardless of the site setting.
    $when    = wp_date( 'l, F j, Y \a\t g:i a T', null, new DateTimeZone( 'America/Edmonton' ) );
    $subject = sprintf( '[thomascheesman.ca] secret-drawer event: %s', $event );

    $body  = "Someone just reached " . $labels[ $event ] . " in the secret drawer.\n\n";
    $body .= "Event : {$event}\n";
    $body .= "When  : {$when}\n";
    $ua = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';
    if ( $ua ) {
        $body .= "Browser: {$ua}\n";
    }
    $body .= "\n— the drawer";

    $sent = wp_mail( $to, $subject, $body );

    set_transient( 'tc_drawer_event_cooldown', 1, MINUTE_IN_SECONDS );
    set_transient( 'tc_drawer_events_today', $count + 1, DAY_IN_SECONDS );

    return new WP_REST_Response( array( 'ok' => true, 'sent' => (bool) $sent ), 200 );
}
