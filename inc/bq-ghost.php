<?php
/**
 * Back Quarter — the FARM RECORD ghost lap ("path 1" async multiplayer).
 *
 * One shared record: the fastest section-road lap any visitor has ever
 * driven, stored WITH its 20 Hz position stream and served back to every
 * player as a fourth ghost buggy (spectral cyan) — you race the actual
 * runs of real people. No realtime server needed (Hostinger shared
 * hosting can't hold WebSockets; this is the leaderboard pattern with a
 * replay attached).
 *
 * Exposes:
 *   GET  /wp-json/tc-games/v1/bq-ghost → { ghost: { name, t, s, ts } | null }
 *   POST /wp-json/tc-games/v1/bq-ghost → { name, t, s } — kept only if faster
 *
 * Storage: single option `tc_bq_ghost_record`, autoload off (the stream
 * runs ~10–40 KB).
 *
 * Auth: public read/write like the arcade boards (inc/games-leaderboard
 * .php), with the same defences — referer check, per-IP cooldown, daily
 * cap — plus stream sanity: length/shape limits, world-bounds clamp, and
 * the 50 ms sample count must roughly agree with the claimed lap time.
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) exit;

const TC_BQ_GHOST_OPTION  = 'tc_bq_ghost_record';
const TC_BQ_GHOST_MIN_MS  = 8000;    // the ring can't be lapped faster
const TC_BQ_GHOST_MAX_MS  = 480000;  // 8 min — beyond that it's a picnic, not a lap
const TC_BQ_GHOST_MAX_LEN = 10800;   // 3 min × 20 Hz × 3 values — the client's own cap

add_action( 'rest_api_init', function () {
    register_rest_route( 'tc-games/v1', '/bq-ghost', array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'tc_bq_ghost_get',
            'permission_callback' => '__return_true',
        ),
        array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'tc_bq_ghost_post',
            'permission_callback' => '__return_true',
        ),
    ) );
} );

/**
 * GET handler — the current farm record, stream included.
 *
 * @return array{ghost: array|null}
 */
function tc_bq_ghost_get() {
    $rec = get_option( TC_BQ_GHOST_OPTION, null );
    if ( ! is_array( $rec ) || ! isset( $rec['t'], $rec['s'] ) ) {
        return array( 'ghost' => null );
    }
    return array( 'ghost' => $rec );
}

/**
 * POST handler — a challenger lap. Validates hard, keeps it only if it
 * beats the standing record.
 *
 * @param WP_REST_Request $req
 * @return array|WP_Error
 */
function tc_bq_ghost_post( $req ) {
    // same origin gate as the arcade boards
    $ref = isset( $_SERVER['HTTP_REFERER'] ) ? wp_unslash( $_SERVER['HTTP_REFERER'] ) : '';
    if ( $ref ) {
        $ref_host  = wp_parse_url( $ref, PHP_URL_HOST );
        $site_host = wp_parse_url( home_url(), PHP_URL_HOST );
        if ( $ref_host && $site_host && strcasecmp( $ref_host, $site_host ) !== 0 ) {
            return new WP_Error(
                'tc_bq_ghost_bad_origin',
                __( 'Ghost laps must come from the farm.', 'tc-ventures-child' ),
                array( 'status' => 403 )
            );
        }
    }
    $ip     = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
    $cd_key = 'tc_bq_ghost_cd_' . md5( $ip );
    if ( get_transient( $cd_key ) ) {
        return new WP_Error(
            'tc_bq_ghost_cooldown',
            __( 'Catch your breath — one claim at a time.', 'tc-ventures-child' ),
            array( 'status' => 429 )
        );
    }
    $today = (int) get_transient( 'tc_bq_ghost_posts_today' );
    if ( $today >= 200 ) {
        return new WP_Error(
            'tc_bq_ghost_daily_cap',
            __( 'The road is resting for today.', 'tc-ventures-child' ),
            array( 'status' => 429 )
        );
    }

    $t = (int) $req->get_param( 't' );
    $s = $req->get_param( 's' );
    if ( $t < TC_BQ_GHOST_MIN_MS || $t > TC_BQ_GHOST_MAX_MS ) {
        return new WP_Error(
            'tc_bq_ghost_bad_time',
            __( 'Lap time out of range.', 'tc-ventures-child' ),
            array( 'status' => 400 )
        );
    }
    if ( ! is_array( $s ) || count( $s ) < 60 || count( $s ) > TC_BQ_GHOST_MAX_LEN || count( $s ) % 3 !== 0 ) {
        return new WP_Error(
            'tc_bq_ghost_bad_stream',
            __( 'Ghost stream malformed.', 'tc-ventures-child' ),
            array( 'status' => 400 )
        );
    }
    // samples land every 50 ms — the stream length must agree with the
    // claimed time (generous tolerance), or the POST is junk
    $dur = ( count( $s ) / 3 ) * 50;
    if ( $dur < $t * 0.75 || $dur > $t * 1.25 + 4000 ) {
        return new WP_Error(
            'tc_bq_ghost_bad_stream',
            __( 'Stream and time disagree.', 'tc-ventures-child' ),
            array( 'status' => 400 )
        );
    }
    $clean = array();
    foreach ( $s as $i => $v ) {
        if ( ! is_numeric( $v ) ) {
            return new WP_Error(
                'tc_bq_ghost_bad_stream',
                __( 'Ghost stream malformed.', 'tc-ventures-child' ),
                array( 'status' => 400 )
            );
        }
        $v = (float) $v;
        // [x, z, angle] triplets: positions clamp to the ring's world,
        // angles keep 2 decimals
        $clean[] = ( $i % 3 === 2 ) ? round( $v, 2 ) : (int) round( max( -1200, min( 6000, $v ) ) );
    }

    // throttle every serious attempt, then see if it actually beats
    set_transient( $cd_key, 1, 20 );
    set_transient( 'tc_bq_ghost_posts_today', $today + 1, DAY_IN_SECONDS );

    $cur = get_option( TC_BQ_GHOST_OPTION, null );
    if ( is_array( $cur ) && isset( $cur['t'] ) && (int) $cur['t'] <= $t ) {
        return array(
            'success' => true,
            'beaten'  => false,
            'ghost'   => array( 'name' => (string) $cur['name'], 't' => (int) $cur['t'] ),
        );
    }

    $name = trim( wp_strip_all_tags( (string) $req->get_param( 'name' ) ) );
    if ( $name === '' ) {
        $name = 'Anonymous';
    }
    $name = function_exists( 'mb_substr' )
        ? mb_substr( $name, 0, TC_GAMES_MAX_NAME_LEN )
        : substr( $name, 0, TC_GAMES_MAX_NAME_LEN );
    if ( function_exists( 'tc_games_name_is_blocked' ) && tc_games_name_is_blocked( $name ) ) {
        $name = 'Anonymous';
    }

    $rec = array( 'name' => $name, 't' => $t, 's' => $clean, 'ts' => time() );
    update_option( TC_BQ_GHOST_OPTION, $rec, false );

    return array(
        'success' => true,
        'beaten'  => true,
        'ghost'   => array( 'name' => $name, 't' => $t ),
    );
}
