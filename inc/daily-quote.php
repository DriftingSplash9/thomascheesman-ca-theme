<?php
/**
 * Daily quote/riddle — picks one entry per day from inc/data/quotes.json.
 *
 * The file holds a mix of two entry types:
 *   { "type": "quote",  "text": "...",     "author": "..." }
 *   { "type": "riddle", "question": "...", "answer": "..." }
 *
 * Deterministic by date: every visitor on a given UTC day sees the
 * same entry. Edit quotes.json freely — add, remove, reorder; the
 * picker re-derives the day's index from the list length each call.
 *
 * Output shape mirrors the source entry, with 'type' guaranteed
 * to be either 'quote' or 'riddle'. Returns null if the file is
 * unreadable or empty.
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) exit;

function tc_get_daily_quote() {
    $path = get_stylesheet_directory() . '/inc/data/quotes.json';
    if ( ! is_readable( $path ) ) {
        return null;
    }
    $raw     = file_get_contents( $path );
    $entries = json_decode( $raw, true );
    if ( ! is_array( $entries ) || empty( $entries ) ) {
        return null;
    }
    // Days since the Unix epoch — wraps cleanly across the list size.
    $day_index = (int) floor( time() / DAY_IN_SECONDS );
    $pick      = $entries[ $day_index % count( $entries ) ];

    $type = isset( $pick['type'] ) ? (string) $pick['type'] : 'quote';
    if ( $type === 'riddle' && isset( $pick['question'], $pick['answer'] ) ) {
        return array(
            'type'     => 'riddle',
            'question' => (string) $pick['question'],
            'answer'   => (string) $pick['answer'],
        );
    }
    if ( isset( $pick['text'], $pick['author'] ) ) {
        return array(
            'type'   => 'quote',
            'text'   => (string) $pick['text'],
            'author' => (string) $pick['author'],
        );
    }
    return null;
}
