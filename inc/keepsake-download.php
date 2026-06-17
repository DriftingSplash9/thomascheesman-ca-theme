<?php
/**
 * Keepsake-PDF download button.
 *
 * Each heritage long-read and each person page has a book-quality PDF,
 * generated off-repo by build-keepsake-pdfs.py and uploaded to the WP Media
 * Library as keepsake-<slug>.pdf (cheesmans … haistes, patience … thomas).
 *
 * These helpers resolve a page's PDF in the Media Library *by its filename
 * slug* and render a download button. Nothing is hard-coded: if a PDF hasn't
 * been uploaded yet the button simply doesn't render, so each button appears
 * automatically the moment its file lands in Media — no per-page URL wiring,
 * the same "render only if it exists" pattern tc_render_family_links() uses for
 * Melanie's card.
 *
 * Styled in style.css under .tc-pdf-download; hidden in print (print.css §6) so
 * the button never appears inside the PDF it links to.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }


/**
 * Resolve a keepsake PDF's URL from the Media Library by its slug.
 *
 * Looks up the attachment whose slug is "keepsake-<slug>" — WordPress derives
 * that slug from the uploaded filename keepsake-<slug>.pdf. The result is
 * cached in a transient so it isn't a query on every page load; only a *found*
 * URL is cached, so the button appears on the next load after the file is
 * uploaded rather than waiting for a cache to expire. The cache is also flushed
 * when a matching attachment is added/edited/removed (see below).
 *
 * @param string $slug Keepsake slug, e.g. 'cheesmans' or 'patience'.
 * @return string      The PDF URL, or '' if it isn't in the Media Library yet.
 */
function tc_keepsake_pdf_url( $slug ) {
	$slug = sanitize_title( $slug );
	if ( '' === $slug ) {
		return '';
	}

	// Optional hard override (e.g. a CDN URL), checked before the lookup.
	$override = (string) apply_filters( 'tc_keepsake_pdf_url_override', '', $slug );
	if ( '' !== $override ) {
		return $override;
	}

	$key    = 'tc_keepsake_url_' . $slug;
	$cached = get_transient( $key );
	if ( is_string( $cached ) && '' !== $cached ) {
		return $cached;
	}

	$ids = get_posts( array(
		'post_type'        => 'attachment',
		'post_status'      => 'inherit',
		'name'             => 'keepsake-' . $slug,
		'posts_per_page'   => 1,
		'fields'           => 'ids',
		'no_found_rows'    => true,
		'suppress_filters' => false,
	) );

	$url = $ids ? (string) wp_get_attachment_url( $ids[0] ) : '';
	if ( '' !== $url ) {
		set_transient( $key, $url, WEEK_IN_SECONDS );
	}
	return $url;
}


/**
 * Render the "Download as a keepsake PDF" button for a page.
 *
 * Outputs nothing if the page's PDF isn't in the Media Library yet, so it's
 * safe to call unconditionally from a template.
 *
 * @param string $slug  Keepsake slug (matches the page: cheesmans … thomas).
 * @param string $label Optional visible button text. Defaults to a generic
 *                      "Download this story as a keepsake PDF".
 */
function tc_render_keepsake_download( $slug, $label = '' ) {
	$url = tc_keepsake_pdf_url( $slug );
	if ( '' === $url ) {
		return;
	}

	if ( '' === $label ) {
		$label = __( 'Download this story as a keepsake PDF', 'tc-ventures-child' );
	}
	?>
	<p class="tc-pdf-download">
		<a class="tc-pdf-download__link" href="<?php echo esc_url( $url ); ?>" download>
			<span class="tc-pdf-download__icon" aria-hidden="true">&#x2913;</span>
			<span class="tc-pdf-download__text"><?php echo esc_html( $label ); ?></span>
			<span class="tc-pdf-download__hint" aria-hidden="true">PDF</span>
		</a>
	</p>
	<?php
}


/**
 * Drop a cached keepsake URL when its attachment is added, edited, or deleted,
 * so a (re)upload is reflected immediately instead of waiting out the transient.
 *
 * @param int $post_id Attachment ID.
 */
function tc_keepsake_flush_url_cache( $post_id ) {
	$post = get_post( $post_id );
	if ( $post && 0 === strpos( (string) $post->post_name, 'keepsake-' ) ) {
		delete_transient( 'tc_keepsake_url_' . substr( $post->post_name, strlen( 'keepsake-' ) ) );
	}
}
add_action( 'add_attachment', 'tc_keepsake_flush_url_cache' );
add_action( 'edit_attachment', 'tc_keepsake_flush_url_cache' );
add_action( 'delete_attachment', 'tc_keepsake_flush_url_cache' );
