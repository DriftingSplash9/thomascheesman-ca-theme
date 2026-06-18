<?php
/**
 * The comments area, loaded by comments_template().
 *
 * Wired in (and only rendered on) the pages chosen in inc/comments.php:
 *   · open tier   — HCS, About, Thomasito, the family hub, the 8 long-reads
 *   · family tier — Patience / Daniel / Faith (called INSIDE the family gate)
 *
 * Renders nothing on any page that isn't a comment target, so it's harmless
 * if WordPress ever loads it elsewhere.
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

// Don't leak the form behind a password wall, and bail on non-target pages.
if ( post_password_required() ) {
	return;
}
$tc_tier = function_exists( 'tc_comment_tier' ) ? tc_comment_tier() : '';
if ( '' === $tc_tier ) {
	return;
}

$tc_count = get_comments_number();
?>

<section id="comments" class="tc-comments tc-comments--<?php echo esc_attr( $tc_tier ); ?>">

	<h2 class="tc-comments__title">
		<?php
		if ( $tc_count > 0 ) {
			printf(
				/* translators: %s: comment count */
				esc_html( _n( '%s note', '%s notes', $tc_count, 'tc-ventures-child' ) ),
				esc_html( number_format_i18n( $tc_count ) )
			);
		} else {
			esc_html_e( 'Leave a note', 'tc-ventures-child' );
		}
		?>
	</h2>

	<?php if ( 'family' === $tc_tier ) : ?>
		<p class="tc-comments__scope tc-comments__scope--family">
			<?php esc_html_e( 'A private space — visible only to signed-in family.', 'tc-ventures-child' ); ?>
		</p>
	<?php endif; ?>

	<?php if ( have_comments() ) : ?>
		<ol class="tc-comments__list">
			<?php
			wp_list_comments(
				array(
					'callback'    => 'tc_comment_callback',
					'style'       => 'ol',
					'avatar_size' => 0, // we draw our own monogram; never call Gravatar
				)
			);
			?>
		</ol>

		<?php if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) : ?>
			<nav class="tc-comments__nav" aria-label="<?php esc_attr_e( 'Comments navigation', 'tc-ventures-child' ); ?>">
				<?php paginate_comments_links(); ?>
			</nav>
		<?php endif; ?>
	<?php endif; ?>

	<?php
	if ( comments_open() ) {

		comment_form(
			array(
				'class_container'     => 'tc-comments__form',
				'title_reply'         => $tc_count > 0
					? esc_html__( 'Add your note', 'tc-ventures-child' )
					: esc_html__( 'Leave a note', 'tc-ventures-child' ),
				'comment_notes_before' => '<p class="tc-comments__note">'
					. esc_html__( 'Notes are read and approved by Thomas before they appear. Your email is required but never shown.', 'tc-ventures-child' )
					. '</p>',
				'comment_notes_after' => '',
				'label_submit'        => esc_html__( 'Send note', 'tc-ventures-child' ),
			)
		);

	} elseif ( 'family' === $tc_tier ) {
		// Reached only if a family-capable check failed mid-render; keep it graceful.
		?>
		<p class="tc-comments__closed"><?php esc_html_e( 'Sign in with your family account to leave a note.', 'tc-ventures-child' ); ?></p>
		<?php
	}
	?>

</section>
