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
 * Finds the NEWEST attachment for the line. WordPress derives an attachment's
 * slug from the uploaded filename, and when a file of the same name is
 * re-uploaded it appends -1, -2… (keepsake-thomas.pdf -> keepsake-thomas-1.pdf).
 * Matching the bare slug would keep serving the FIRST (oldest) upload, so we
 * match "keepsake-<slug>" OR "keepsake-<slug>-N", newest first — a fresh
 * re-upload then wins automatically with no need to delete the old file.
 *
 * The result is cached in a transient so it isn't a query on every page load;
 * only a *found* URL is cached, so the button appears on the next load after a
 * file is uploaded rather than waiting for the cache to expire. The cache is
 * also flushed when a matching attachment is added/edited/removed (see below).
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

	// Key namespaced (_v2_) so it never reads a value cached by the earlier
	// exact-match resolver (which could have stored an older -0 upload).
	$key    = 'tc_keepsake_url_v2_' . $slug;
	$cached = get_transient( $key );
	if ( is_string( $cached ) && '' !== $cached ) {
		return $cached;
	}

	global $wpdb;
	$id = $wpdb->get_var(
		$wpdb->prepare(
			"SELECT ID FROM {$wpdb->posts}
			  WHERE post_type = 'attachment'
			    AND post_status = 'inherit'
			    AND ( post_name = %s OR post_name LIKE %s )
			  ORDER BY post_date DESC, ID DESC
			  LIMIT 1",
			'keepsake-' . $slug,
			$wpdb->esc_like( 'keepsake-' . $slug . '-' ) . '%'
		)
	);

	$url = $id ? (string) wp_get_attachment_url( (int) $id ) : '';
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
		<a class="tc-pdf-download__link tc-btn" href="<?php echo esc_url( $url ); ?>" download>
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
	if ( ! $post || 0 !== strpos( (string) $post->post_name, 'keepsake-' ) ) {
		return;
	}
	// Strip the 'keepsake-' prefix and any WordPress -N dedupe suffix to get the
	// base slug, so (re)uploading keepsake-thomas-1 still flushes the 'thomas' key.
	$base = substr( $post->post_name, strlen( 'keepsake-' ) );
	$base = preg_replace( '/-\d+$/', '', $base );
	delete_transient( 'tc_keepsake_url_v2_' . $base );
}
add_action( 'add_attachment', 'tc_keepsake_flush_url_cache' );
add_action( 'edit_attachment', 'tc_keepsake_flush_url_cache' );
add_action( 'delete_attachment', 'tc_keepsake_flush_url_cache' );
