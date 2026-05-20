<?php
/**
 * Daily quote — picks one quote per day from inc/data/quotes.json.
 *
 * Deterministic by date: every visitor on a given UTC day sees the
 * same quote. Edit quotes.json freely — add, remove, reorder; the
 * picker re-derives the day's index from the list length each call.
 *
 * Output shape: array( 'text' => string, 'author' => string ).
 * Returns null only if the JSON is missing or unreadable.
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) exit;

function tc_get_daily_quote() {
    $path = get_stylesheet_directory() . '/inc/data/quotes.json';
    if ( ! is_readable( $path ) ) {
        return null;
    }
    $raw = file_get_contents( $path );
    $quotes = json_decode( $raw, true );
    if ( ! is_array( $quotes ) || empty( $quotes ) ) {
        return null;
    }
    // Days since the Unix epoch — wraps cleanly across the list size.
    $day_index = (int) floor( time() / DAY_IN_SECONDS );
    $pick      = $quotes[ $day_index % count( $quotes ) ];
    if ( ! isset( $pick['text'], $pick['author'] ) ) {
        return null;
    }
    return array(
        'text'   => (string) $pick['text'],
        'author' => (string) $pick['author'],
    );
}
