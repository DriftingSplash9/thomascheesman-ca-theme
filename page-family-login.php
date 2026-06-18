<?php
/**
 * Page Template: Family Sign-In.
 *
 * Auto-applied to the WP page with slug `family-login`. A branded wrapper around
 * WordPress's own login form (tc_render_family_login_form() in
 * inc/family-login.php) so family members sign in on a styled page rather than
 * the bare wp-login.php screen. Private; kept out of search indexes.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

// Never index the sign-in page.
add_action( 'wp_head', function () {
	echo '<meta name="robots" content="noindex,nofollow" />' . "\n";
} );

get_header(); ?>

<main id="primary" class="site-main heritage-page family-login-page">

	<section class="page-hero">
		<div class="container">
			<a class="heritage-page__back" href="<?php echo esc_url( home_url( '/family' ) ); ?>">&larr; Family</a>
			<span class="page-hero__eyebrow"><?php esc_html_e( 'Private', 'tc-ventures-child' ); ?></span>
			<h1 class="page-hero__title kinetic-text"><?php esc_html_e( 'Family Sign-In', 'tc-ventures-child' ); ?></h1>
			<p class="page-hero__subtitle kinetic-fade">
				<?php esc_html_e( "For family members — the kids' photo albums and private notes live behind here.", 'tc-ventures-child' ); ?>
			</p>
		</div>
	</section>

	<article class="heritage-lines">
		<div class="container container--narrow">
			<div class="family-login">
				<?php tc_render_family_login_form(); ?>
				<p class="family-login__help"><?php esc_html_e( 'Trouble signing in? Ask Thomas.', 'tc-ventures-child' ); ?></p>
			</div>
		</div>
	</article>

</main>

<?php get_footer(); ?>
