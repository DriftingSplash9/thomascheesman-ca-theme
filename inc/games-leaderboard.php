<?php
/**
 * Games leaderboard — REST API for the toad arcade's persistent
 * high-score table.
 *
 * Exposes:
 *   GET  /wp-json/tc-games/v1/scores            → all games, top 10 each
 *   GET  /wp-json/tc-games/v1/scores?game=snake → just one game
 *   POST /wp-json/tc-games/v1/scores            → { game, name, score }
 *
 * Storage: one WP option per game (`tc_games_scores_<game>`), each
 * holding a JSON array of `{ name, score, ts }` sorted descending,
 * capped at 10 entries.
 *
 * Auth: public read AND public write. The trade-off is well-understood:
 * anyone with browser tools can POST a fake score. For a personal
 * portfolio's hidden arcade this is acceptable — if abuse appears we
 * can layer in a nonce or simple proof-of-work later.
 *
 * Hardening already in place:
 *   - Game key is whitelisted (TC_GAMES_VALID list)
 *   - Name is stripped of HTML and capped at 16 chars
 *   - Score is cast to int and capped to a sane range
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) exit;

const TC_GAMES_VALID = array(
    'snake',
    'pong',
    'pacman',
    'asteroids',
    'brickles',
    'solitaire',
    'pinball',
    // Faith's CopyCatCapybara Clicker — one board per challenge length.
    'capybara-5',
    'capybara-15',
    'capybara-30',
    'capybara-60',
);
const TC_GAMES_MAX_PER_BOARD = 10;
const TC_GAMES_MAX_NAME_LEN  = 16;
const TC_GAMES_MAX_SCORE     = 9999999;

/**
 * Leaderboard name hygiene (2026-06 review, Q18). The boards are
 * public-write with no auth by design; this is the modest filter that
 * keeps them family-friendly. Substring matching is deliberate (kids
 * type creatively); the cost is a rare false positive that becomes
 * "Anonymous", which is acceptable on an arcade high-score table.
 */
function tc_games_name_is_blocked( $name ) {
    $needle = strtolower( $name );
    $blocked = array(
        'fuck', 'shit', 'cunt', 'nigg', 'faggot', 'bitch', 'whore',
        'slut', 'penis', 'vagina', 'rape', 'hitler', 'nazi',
    );
    foreach ( $blocked as $word ) {
        if ( strpos( $needle, $word ) !== false ) {
            return true;
        }
    }
    return false;
}

/**
 * One-time sweep (2026-06 review, Q18): remove the keyboard-mash
 * "erftghfh" entry that held the Pac-Man top score. Runs once, flagged
 * in an option; safe to leave in place afterwards.
 */
add_action( 'init', function () {
    if ( get_option( 'tc_games_junk_swept_2026_06' ) ) {
        return;
    }
    foreach ( TC_GAMES_VALID as $game ) {
        $key   = 'tc_games_scores_' . $game;
        $board = get_option( $key );
        if ( ! is_array( $board ) || ! $board ) {
            continue;
        }
        $clean = array_values( array_filter( $board, function ( $row ) {
            return ! isset( $row['name'] ) || strtolower( trim( $row['name'] ) ) !== 'erftghfh';
        } ) );
        if ( count( $clean ) !== count( $board ) ) {
            update_option( $key, $clean, false );
        }
    }
    update_option( 'tc_games_junk_swept_2026_06', 1, false );
} );

add_action( 'rest_api_init', function () {
    register_rest_route(
        'tc-games/v1',
        '/scores',
        array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => 'tc_games_get_scores',
                'permission_callback' => '__return_true',
                'args'                => array(
                    'game' => array(
                        'required' => false,
                        'type'     => 'string',
                    ),
                ),
            ),
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => 'tc_games_post_score',
                'permission_callback' => '__return_true',
                'args'                => array(
                    'game'  => array( 'required' => true, 'type' => 'string'  ),
                    'name'  => array( 'required' => true, 'type' => 'string'  ),
                    'score' => array( 'required' => true, 'type' => 'integer' ),
                ),
            ),
        )
    );
} );

/**
 * GET handler. With ?game=<key> returns one board; without, returns all.
 *
 * @param WP_REST_Request $req
 * @return array|WP_Error
 */
function tc_games_get_scores( $req ) {
    $game = $req->get_param( 'game' );

    if ( $game ) {
        if ( ! in_array( $game, TC_GAMES_VALID, true ) ) {
            return new WP_Error(
                'tc_games_invalid_game',
                __( 'Unknown game', 'tc-ventures-child' ),
                array( 'status' => 400 )
            );
        }
        return array( $game => tc_games_read_board( $game ) );
    }

    $out = array();
    foreach ( TC_GAMES_VALID as $g ) {
        $out[ $g ] = tc_games_read_board( $g );
    }
    return $out;
}

/**
 * POST handler. Validates, inserts, sorts, trims, persists.
 *
 * @param WP_REST_Request $req
 * @return array|WP_Error
 */
function tc_games_post_score( $req ) {
    $game  = sanitize_key( $req->get_param( 'game' ) );
    $name  = trim( wp_strip_all_tags( (string) $req->get_param( 'name' ) ) );
    $score = (int) $req->get_param( 'score' );

    if ( ! in_array( $game, TC_GAMES_VALID, true ) ) {
        return new WP_Error(
            'tc_games_invalid_game',
            __( 'Unknown game', 'tc-ventures-child' ),
            array( 'status' => 400 )
        );
    }
    if ( $score < 0 || $score > TC_GAMES_MAX_SCORE ) {
        return new WP_Error(
            'tc_games_invalid_score',
            __( 'Score out of range', 'tc-ventures-child' ),
            array( 'status' => 400 )
        );
    }
    if ( $name === '' ) {
        $name = 'Anonymous';
    }
    if ( function_exists( 'mb_substr' ) ) {
        $name = mb_substr( $name, 0, TC_GAMES_MAX_NAME_LEN );
    } else {
        $name = substr( $name, 0, TC_GAMES_MAX_NAME_LEN );
    }
    if ( tc_games_name_is_blocked( $name ) ) {
        $name = 'Anonymous';
    }

    // Review-2 hardening. The endpoint is public by design, but a bare
    // public write with no throttle meant ten junk POSTs could wipe a
    // board permanently (the top-10 trim discards real rows). Mirror
    // the secret-drawer endpoint's defences: reject clearly-foreign
    // referers, then a short per-IP cooldown + a generous global daily
    // cap. The JS client treats any non-2xx as "submission didn't
    // take" and keeps the old board — no UI change needed.
    $ref = isset( $_SERVER['HTTP_REFERER'] ) ? wp_unslash( $_SERVER['HTTP_REFERER'] ) : '';
    if ( $ref ) {
        $ref_host  = wp_parse_url( $ref, PHP_URL_HOST );
        $site_host = wp_parse_url( home_url(), PHP_URL_HOST );
        if ( $ref_host && $site_host && strcasecmp( $ref_host, $site_host ) !== 0 ) {
            return new WP_Error(
                'tc_games_bad_origin',
                __( 'Score submissions must come from the site.', 'tc-ventures-child' ),
                array( 'status' => 403 )
            );
        }
    }
    $ip     = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
    $cd_key = 'tc_games_cd_' . md5( $ip );
    if ( get_transient( $cd_key ) ) {
        return new WP_Error(
            'tc_games_cooldown',
            __( 'Too fast — finish a game first.', 'tc-ventures-child' ),
            array( 'status' => 429 )
        );
    }
    $today = (int) get_transient( 'tc_games_posts_today' );
    if ( $today >= 400 ) {
        return new WP_Error(
            'tc_games_daily_cap',
            __( 'The boards are resting for today.', 'tc-ventures-child' ),
            array( 'status' => 429 )
        );
    }
    // 20s: even the shortest real game run takes longer than that.
    set_transient( $cd_key, 1, 20 );
    set_transient( 'tc_games_posts_today', $today + 1, DAY_IN_SECONDS );

    $board   = tc_games_read_board( $game );
    $board[] = array(
        'name'  => $name,
        'score' => $score,
        'ts'    => time(),
    );
    usort( $board, function ( $a, $b ) {
        // Higher score first; ties → earlier ts wins.
        if ( $b['score'] !== $a['score'] ) {
            return $b['score'] - $a['score'];
        }
        return $a['ts'] - $b['ts'];
    } );
    $board = array_slice( $board, 0, TC_GAMES_MAX_PER_BOARD );

    update_option( 'tc_games_scores_' . $game, $board, false );

    return array(
        'success' => true,
        'game'    => $game,
        'scores'  => $board,
    );
}

/**
 * Read a single board, defensively coercing legacy / bad data into an
 * array of valid rows.
 *
 * @param string $game
 * @return array<int, array{name:string, score:int, ts:int}>
 */
function tc_games_read_board( $game ) {
    $raw = get_option( 'tc_games_scores_' . $game, array() );
    if ( ! is_array( $raw ) ) return array();

    $out = array();
    foreach ( $raw as $row ) {
        if ( ! is_array( $row ) || ! isset( $row['name'], $row['score'] ) ) continue;
        $out[] = array(
            'name'  => (string) $row['name'],
            'score' => (int)    $row['score'],
            'ts'    => isset( $row['ts'] ) ? (int) $row['ts'] : 0,
        );
    }
    return $out;
}
