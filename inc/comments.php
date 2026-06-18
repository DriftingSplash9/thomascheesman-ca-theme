<?php
/**
 * Comments — the two-tier guestbook engine.
 *
 * Thomas's site is "pages only", so WordPress closes comments everywhere by
 * default. This file opens them on a hand-picked set of pages, in two tiers,
 * and hardens the whole thing without adding a plugin (we stay at 5):
 *
 *   TIER 1 — OPEN (anyone may comment; held for approval)
 *     · HCS ............ slug `hcs`
 *     · About .......... slug `about`
 *     · Thomasito ...... slug `thomas`     (/family/thomas)
 *     · The family hub . slug `family`     (/family)
 *     · Heritage LONG-READS — the 8 book-length stories. The five hub lines
 *       all render under slug `story`; the three orphan lines render under
 *       `mcivers` / `verbooms` / `steinkes`. (NOT the 5-card hub, NOT the
 *       short spokes — Thomas's explicit choice, 2026-06-18.)
 *
 *   TIER 2 — FAMILY (only signed-in family may see OR post; held for approval)
 *     · Patience / Daniel / Faith — slugs `patience` / `daniel` / `faith`.
 *       These pages are already wholly gated behind tc_user_is_family()
 *       (OD-1). comments_template() is called INSIDE that gate, so a
 *       logged-out visitor never reaches the form. We belt-and-brace it
 *       here too (REST + feed exclusion, comments_open gated on the cap).
 *
 * House rules baked in (V0.32 design, Thomas's decisions):
 *   · EVERY comment is held for manual approval (nothing public until Thomas
 *     approves it from the wp-admin Comments queue; he's also emailed if the
 *     SMTP shim in inc/email-smtp.php is configured). Moderators bypass.
 *   · Native WP threaded replies, 5 deep.
 *   · Name + email required; email is NEVER displayed.
 *   · NO external Gravatars — a coloured monogram is drawn locally, so the
 *     no-tracking promise holds.
 *   · Honeypot anti-spam (no JS, cache-safe); guests allowed on the open tier.
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/* ---------------------------------------------------------------------------
 * Which pages take comments, and in which tier.
 * ------------------------------------------------------------------------- */

/** Slugs that get OPEN (public, moderated) comments. */
function tc_comment_open_slugs() {
	return array( 'hcs', 'about', 'thomas', 'family', 'story', 'mcivers', 'verbooms', 'steinkes' );
}

/** Slugs that get FAMILY-only (gated, moderated) comments. */
function tc_comment_family_slugs() {
	return array( 'patience', 'daniel', 'faith' );
}

/**
 * The comment tier for a given post id: 'open', 'family', or '' (none).
 * Keyed on the page slug (post_name) so it survives id changes. The five
 * heritage long-reads share the slug `story`, which this matches for all of
 * them — exactly what we want.
 */
function tc_comment_tier_for_post( $post_id ) {
	$post_id = (int) $post_id;
	if ( $post_id <= 0 || 'page' !== get_post_type( $post_id ) ) {
		return '';
	}
	$slug = get_post_field( 'post_name', $post_id );
	if ( in_array( $slug, tc_comment_family_slugs(), true ) ) {
		return 'family';
	}
	if ( in_array( $slug, tc_comment_open_slugs(), true ) ) {
		return 'open';
	}
	return '';
}

/** The comment tier for the page being viewed right now. */
function tc_comment_tier() {
	if ( ! is_page() ) {
		return '';
	}
	return tc_comment_tier_for_post( get_queried_object_id() );
}

/**
 * Page ids of the three family-gated kid pages, resolved once.
 * Used to keep their comments out of REST + feeds for non-family.
 */
function tc_comment_family_page_ids() {
	static $ids = null;
	if ( null !== $ids ) {
		return $ids;
	}
	$ids = array();
	foreach ( tc_comment_family_slugs() as $slug ) {
		// The kid pages live under /family/<slug>.
		$page = get_page_by_path( 'family/' . $slug );
		if ( $page ) {
			$ids[] = (int) $page->ID;
		}
	}
	return $ids;
}

/* ---------------------------------------------------------------------------
 * Force comments open on the target pages only (pages are closed by default).
 * ------------------------------------------------------------------------- */

add_filter( 'comments_open', 'tc_comment_force_open', 20, 2 );
function tc_comment_force_open( $open, $post_id ) {
	$tier = tc_comment_tier_for_post( $post_id );
	if ( 'open' === $tier ) {
		return true;
	}
	if ( 'family' === $tier ) {
		// Only signed-in family may post on the kids' pages.
		return function_exists( 'tc_user_is_family' ) && tc_user_is_family();
	}
	return $open;
}

/* ---------------------------------------------------------------------------
 * Site-wide comment options, forced (the only comments anywhere are ours).
 * pre_option_* short-circuits get_option(), so these win without a DB write.
 * ------------------------------------------------------------------------- */

add_filter( 'pre_option_thread_comments',       'tc_comment_opt_one' );   // threading on
add_filter( 'pre_option_thread_comments_depth', 'tc_comment_opt_depth' ); // 5 deep
add_filter( 'pre_option_require_name_email',    'tc_comment_opt_one' );   // name + email required
add_filter( 'pre_option_comment_registration',  'tc_comment_opt_zero' );  // guests may comment (open tier)
add_filter( 'pre_option_page_comments',         'tc_comment_opt_zero' );  // low volume — no pagination
add_filter( 'pre_option_close_comments_for_old_posts', 'tc_comment_opt_zero' );
add_filter( 'pre_option_comment_moderation',    'tc_comment_opt_one' );   // hold all in the queue
add_filter( 'pre_option_show_comments_cookies_opt_in', 'tc_comment_opt_zero' );

function tc_comment_opt_one()   { return 1; }
function tc_comment_opt_zero()  { return 0; }
function tc_comment_opt_depth() { return 5; }

/* ---------------------------------------------------------------------------
 * Moderation: hold EVERY comment from the public; moderators post directly.
 * ------------------------------------------------------------------------- */

add_filter( 'pre_comment_approved', 'tc_comment_hold_all', 99, 2 );
function tc_comment_hold_all( $approved, $commentdata ) {
	if ( current_user_can( 'moderate_comments' ) ) {
		return $approved; // Thomas's own comments don't need holding
	}
	return 0; // everyone else: into the moderation queue
}

/* ---------------------------------------------------------------------------
 * Honeypot anti-spam — a hidden field bots fill and humans never see.
 * No JS, so it survives full-page caching (unlike a JS time-trap). Echoed
 * inside every comment form; rejected at preprocess time.
 * ------------------------------------------------------------------------- */

add_action( 'comment_form', 'tc_comment_honeypot_field' );
function tc_comment_honeypot_field() {
	echo '<p class="tc-comments__hp" aria-hidden="true">'
		. '<label>' . esc_html__( 'Leave this field empty', 'tc-ventures-child' )
		. '<input type="text" name="tc_hp" value="" tabindex="-1" autocomplete="off"></label></p>';
}

add_filter( 'preprocess_comment', 'tc_comment_honeypot_check' );
function tc_comment_honeypot_check( $commentdata ) {
	if ( ! empty( $_POST['tc_hp'] ) ) {
		wp_die(
			esc_html__( 'Your comment could not be posted.', 'tc-ventures-child' ),
			esc_html__( 'Comment blocked', 'tc-ventures-child' ),
			array( 'response' => 403, 'back_link' => true )
		);
	}
	return $commentdata;
}

// Drop the Website field (a spam magnet we never display) and the cookie
// opt-in checkbox (we don't set comment cookies).
add_filter( 'comment_form_default_fields', 'tc_comment_trim_fields' );
function tc_comment_trim_fields( $fields ) {
	unset( $fields['url'], $fields['cookies'] );
	return $fields;
}

/* ---------------------------------------------------------------------------
 * Privacy: keep the family-gated kids' comments out of REST + feeds, since
 * the kid PAGES are technically public posts (the gate is in the template).
 * Once Thomas approves a family comment it would otherwise be readable at
 * /wp-json/wp/v2/comments?post=<id>; this closes that.
 * ------------------------------------------------------------------------- */

add_filter( 'rest_comment_query', 'tc_comment_rest_hide_family', 10, 2 );
function tc_comment_rest_hide_family( $args, $request ) {
	if ( current_user_can( 'moderate_comments' )
		|| ( function_exists( 'tc_user_is_family' ) && tc_user_is_family() ) ) {
		return $args; // family + Thomas may read them
	}
	$kids = tc_comment_family_page_ids();
	if ( $kids ) {
		$existing            = isset( $args['post__not_in'] ) ? (array) $args['post__not_in'] : array();
		$args['post__not_in'] = array_merge( $existing, $kids );
	}
	return $args;
}

// Comment feeds carry no auth context, so simply 404 them site-wide — nobody
// reads comment RSS here, and it's the cleanest way to never leak a kid-page
// comment through /comments/feed/ or a per-page comment feed.
add_action( 'template_redirect', 'tc_comment_block_feeds' );
function tc_comment_block_feeds() {
	if ( is_comment_feed() ) {
		wp_die(
			esc_html__( 'Comment feeds are disabled on this site.', 'tc-ventures-child' ),
			'',
			array( 'response' => 404 )
		);
	}
}
// Drop the auto-discovery <link> for the comment feed too.
add_filter( 'feed_links_show_comments_feed', '__return_false' );

/* ---------------------------------------------------------------------------
 * Stylesheet — only on pages that actually carry comments.
 * ------------------------------------------------------------------------- */

add_action( 'wp_enqueue_scripts', 'tc_comment_enqueue', 20 );
function tc_comment_enqueue() {
	if ( '' === tc_comment_tier() ) {
		return;
	}
	wp_enqueue_style(
		'tc-comments',
		get_stylesheet_directory_uri() . '/assets/css/comments.css',
		array( 'astra-child-style' ),
		wp_get_theme()->get( 'Version' )
	);
	// WP's threaded-reply script (move-the-form-under-the-comment).
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}

/* ---------------------------------------------------------------------------
 * A single comment, rendered with a local coloured monogram (no Gravatar).
 * Used as the wp_list_comments() callback in comments.php.
 * ------------------------------------------------------------------------- */

function tc_comment_callback( $comment, $args, $depth ) {
	$tag    = ( 'div' === $args['style'] ) ? 'div' : 'li';
	$author = get_comment_author( $comment );
	$mono   = tc_comment_monogram( $author );
	?>
	<<?php echo $tag; // phpcs:ignore ?> <?php comment_class( 'tc-comment', $comment ); ?> id="comment-<?php comment_ID(); ?>">
		<article class="tc-comment__body">
			<header class="tc-comment__head">
				<span class="tc-comment__avatar" aria-hidden="true" style="--mono-h:<?php echo (int) $mono['hue']; ?>"><?php echo esc_html( $mono['initials'] ); ?></span>
				<span class="tc-comment__meta">
					<span class="tc-comment__author"><?php echo esc_html( $author ); ?></span>
					<a class="tc-comment__date" href="<?php echo esc_url( get_comment_link( $comment ) ); ?>">
						<time datetime="<?php echo esc_attr( get_comment_time( 'c' ) ); ?>"><?php echo esc_html( get_comment_date( '', $comment ) ); ?></time>
					</a>
				</span>
			</header>

			<?php if ( '0' === $comment->comment_approved ) : ?>
				<p class="tc-comment__pending"><em><?php esc_html_e( 'Your comment is awaiting approval.', 'tc-ventures-child' ); ?></em></p>
			<?php endif; ?>

			<div class="tc-comment__text"><?php comment_text(); ?></div>

			<footer class="tc-comment__foot">
				<?php
				comment_reply_link(
					array_merge(
						$args,
						array(
							'depth'     => $depth,
							'max_depth' => $args['max_depth'],
							'before'    => '<span class="tc-comment__reply">',
							'after'     => '</span>',
						)
					)
				);
				?>
			</footer>
		</article>
	<?php
	// NB: WP closes the <li>/<div> for us (end-callback not needed).
}

/**
 * Initials + a stable hue from a name, for the local monogram avatar.
 */
function tc_comment_monogram( $name ) {
	$name  = trim( wp_strip_all_tags( (string) $name ) );
	$parts = preg_split( '/\s+/', $name, -1, PREG_SPLIT_NO_EMPTY );
	$ini   = '';
	if ( $parts ) {
		$ini .= function_exists( 'mb_substr' ) ? mb_substr( $parts[0], 0, 1 ) : substr( $parts[0], 0, 1 );
		if ( count( $parts ) > 1 ) {
			$last = $parts[ count( $parts ) - 1 ];
			$ini .= function_exists( 'mb_substr' ) ? mb_substr( $last, 0, 1 ) : substr( $last, 0, 1 );
		}
	}
	if ( '' === $ini ) {
		$ini = '?';
	}
	return array(
		'initials' => function_exists( 'mb_strtoupper' ) ? mb_strtoupper( $ini ) : strtoupper( $ini ),
		'hue'      => crc32( $name ) % 360,
	);
}
