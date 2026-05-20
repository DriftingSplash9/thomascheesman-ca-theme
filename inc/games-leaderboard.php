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
);
const TC_GAMES_MAX_PER_BOARD = 10;
const TC_GAMES_MAX_NAME_LEN  = 16;
const TC_GAMES_MAX_SCORE     = 9999999;

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
