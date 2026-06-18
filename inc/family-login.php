<?php
/**
 * Family login + private-content gate.
 *
 * A small, security-first access layer so ~10 family members can sign in and
 * see content kept private from the public web — first the kids' photo albums,
 * later the private comments on the kids' pages.
 *
 * Design choices (the "private and unhackable as we can" brief):
 *   - Uses WordPress's own user/auth system (battle-tested), NOT a home-rolled
 *     login. Family members get a dedicated least-privilege role `tc_family`
 *     whose ONLY capability beyond `read` is the custom `view_family_private`.
 *     They can sign in and view gated content; they have no wp-admin power.
 *   - Private content is gated SERVER-SIDE via tc_user_is_family(): the markup
 *     is never sent to a browser that isn't signed-in family (not CSS-hidden).
 *   - Hardening: brute-force lockout per IP, generic login errors (no
 *     username/password disclosure), XML-RPC disabled, self-registration
 *     forced off, family bounced out of wp-admin + the admin bar.
 *
 * The capability is also granted to administrators so Thomas can preview.
 *
 * Pairs with: page-family-login.php (the branded sign-in page, slug
 * `family-login`) and assets/css/family.css.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

const TC_FAMILY_ROLE_SLUG    = 'tc_family';
const TC_FAMILY_ROLE_LABEL   = 'Family';
const TC_FAMILY_CAP          = 'view_family_private';
const TC_FAMILY_ROLE_VERSION = 1;


/* ============================================================
   ROLE + CAPABILITY
   ============================================================ */

/**
 * Register the least-privilege `tc_family` role and grant the private-view
 * capability to it and to administrators. Version-stamped (mirrors
 * inc/agent-role.php) so a cap change actually re-registers.
 */
function tc_register_family_role() {
	if ( (int) get_option( 'tc_family_role_version', 0 ) === TC_FAMILY_ROLE_VERSION ) {
		return;
	}

	remove_role( TC_FAMILY_ROLE_SLUG );
	add_role(
		TC_FAMILY_ROLE_SLUG,
		TC_FAMILY_ROLE_LABEL,
		array(
			'read'             => true,  // required to be a logged-in user
			TC_FAMILY_CAP      => true,  // the only thing that unlocks private content
			// No edit/upload/publish/delete/manage caps whatsoever.
		)
	);

	// Admins can see everything family can, for previewing.
	$admin = get_role( 'administrator' );
	if ( $admin && ! $admin->has_cap( TC_FAMILY_CAP ) ) {
		$admin->add_cap( TC_FAMILY_CAP );
	}

	update_option( 'tc_family_role_version', TC_FAMILY_ROLE_VERSION );
}
add_action( 'init', 'tc_register_family_role' );


/**
 * Is the current viewer a signed-in family member (or an admin)?
 * The single gate every private-content check should call.
 *
 * @return bool
 */
function tc_user_is_family() {
	return is_user_logged_in() && current_user_can( TC_FAMILY_CAP );
}


/* ============================================================
   HARDENING
   ============================================================ */

// The site doesn't use XML-RPC; it's a classic brute-force / pingback vector.
add_filter( 'xmlrpc_enabled', '__return_false' );

// Belt-and-suspenders: never allow public self-registration regardless of the
// Settings → General checkbox. Family accounts are created by the admin.
add_filter( 'option_users_can_register', '__return_zero' );
add_filter( 'pre_option_users_can_register', '__return_zero' );

/**
 * Client IP for throttling. Uses REMOTE_ADDR only — X-Forwarded-* is
 * client-spoofable, and a spoofable key would let an attacker dodge the
 * lockout (or lock out everyone). Good enough as a brute-force speed bump.
 *
 * @return string
 */
function tc_client_ip() {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) $_SERVER['REMOTE_ADDR'] : '';
	return filter_var( $ip, FILTER_VALIDATE_IP ) ? $ip : '0.0.0.0';
}

/**
 * Reject login attempts from an IP that's currently locked out. Runs before
 * WordPress checks credentials (priority 5), so a locked IP can't even probe
 * passwords. Only fires on real credential attempts, not cookie auth.
 *
 * @param WP_User|WP_Error|null $user
 * @param string                $username
 * @param string                $password
 * @return WP_User|WP_Error|null
 */
function tc_throttle_login( $user, $username, $password ) {
	if ( '' === (string) $username && '' === (string) $password ) {
		return $user; // not a credential attempt (e.g. cookie check)
	}
	if ( get_transient( 'tc_login_block_' . md5( tc_client_ip() ) ) ) {
		return new WP_Error(
			'tc_locked',
			__( '<strong>Too many attempts.</strong> Please wait about 15 minutes and try again.', 'tc-ventures-child' )
		);
	}
	return $user;
}
add_filter( 'authenticate', 'tc_throttle_login', 5, 3 );

/**
 * Count a failed login per IP; after 5 within 15 minutes, lock that IP out for
 * 15 minutes.
 */
function tc_register_failed_login() {
	$ip   = tc_client_ip();
	$key  = 'tc_login_fails_' . md5( $ip );
	$fails = (int) get_transient( $key ) + 1;
	set_transient( $key, $fails, 15 * MINUTE_IN_SECONDS );
	if ( $fails >= 5 ) {
		set_transient( 'tc_login_block_' . md5( $ip ), 1, 15 * MINUTE_IN_SECONDS );
	}
}
add_action( 'wp_login_failed', 'tc_register_failed_login' );

/** Clear the counters for an IP on a successful sign-in. */
function tc_clear_login_fails() {
	$ip = tc_client_ip();
	delete_transient( 'tc_login_fails_' . md5( $ip ) );
	delete_transient( 'tc_login_block_' . md5( $ip ) );
}
add_action( 'wp_login', 'tc_clear_login_fails' );

// Generic login error — don't disclose whether the username or the password
// was wrong (default WP messages do).
add_filter( 'login_errors', function () {
	return __( 'Sign-in failed. Please check your details and try again.', 'tc-ventures-child' );
} );

/**
 * Keep family members out of wp-admin entirely (they have no business there),
 * while leaving admin-ajax and the admin for real admins.
 */
add_action( 'admin_init', function () {
	if ( wp_doing_ajax() ) {
		return;
	}
	if ( current_user_can( TC_FAMILY_CAP ) && ! current_user_can( 'manage_options' ) ) {
		wp_safe_redirect( home_url( '/' ) );
		exit;
	}
} );

// And hide the admin bar for them on the front end.
add_action( 'after_setup_theme', function () {
	if ( is_user_logged_in() && current_user_can( TC_FAMILY_CAP ) && ! current_user_can( 'manage_options' ) ) {
		show_admin_bar( false );
	}
} );


/* ============================================================
   FRONT-END HELPERS
   ============================================================ */

/**
 * URL of the branded sign-in page, carrying a same-host redirect back to where
 * the visitor was. Falls back to wp-login.php if the page doesn't exist yet.
 *
 * @param string $redirect Absolute URL to return to after sign-in.
 * @return string
 */
function tc_family_login_url( $redirect = '' ) {
	if ( '' === $redirect ) {
		$redirect = is_singular() ? get_permalink() : home_url( '/family' );
	}
	$page = get_page_by_path( 'family-login' );
	$base = $page ? get_permalink( $page ) : wp_login_url();
	return add_query_arg( 'redirect_to', rawurlencode( $redirect ), $base );
}

/**
 * The "this is kept for family" prompt shown to non-family in place of gated
 * content. Two registers: an 'album' context (the kids' photo albums) and a
 * 'page' context (a whole kid page gated behind the login — OD-1/PRIV-1).
 *
 * @param string $name    Optional first name, for a warmer line.
 * @param string $context 'album' (default) or 'page'.
 */
function tc_render_family_gate_notice( $name = '', $context = 'album' ) {
	if ( 'page' === $context ) {
		$heading = __( 'Kept for family', 'tc-ventures-child' );
		$msg     = $name
			? sprintf( __( "%s's page is kept for family.", 'tc-ventures-child' ), $name )
			: __( 'This page is kept for family.', 'tc-ventures-child' );
		$sub     = __( 'Signed-in family can read the full page here.', 'tc-ventures-child' );
	} else {
		$heading = __( 'Family photo album', 'tc-ventures-child' );
		$msg     = $name
			? sprintf( __( "%s's photo album is kept for family.", 'tc-ventures-child' ), $name )
			: __( 'These photos are kept for family.', 'tc-ventures-child' );
		$sub     = __( 'Signed-in family can see the full album here.', 'tc-ventures-child' );
	}
	?>
	<aside class="family-gate scroll-animate" aria-labelledby="family-gate-heading">
		<span class="family-gate__icon" aria-hidden="true">&#128274;</span>
		<h2 id="family-gate-heading" class="family-gate__heading"><?php echo esc_html( $heading ); ?></h2>
		<p class="family-gate__prose">
			<?php echo esc_html( $msg ); ?>
			<?php echo esc_html( $sub ); ?>
		</p>
		<a class="family-gate__cta" href="<?php echo esc_url( tc_family_login_url() ); ?>">
			<?php esc_html_e( 'Family sign-in', 'tc-ventures-child' ); ?>
			<span aria-hidden="true">&nbsp;&rarr;</span>
		</a>
	</aside>
	<?php
}

/**
 * Render the branded sign-in form (used by page-family-login.php). Posts
 * through WordPress's own wp-login.php (secure cookies, canonical handling);
 * a failed attempt falls back to the wp-login.php screen with a generic error.
 */
function tc_render_family_login_form() {
	if ( tc_user_is_family() ) {
		$user = wp_get_current_user();
		?>
		<p class="family-login__status">
			<?php
			printf(
				/* translators: %s: the signed-in user's display name. */
				esc_html__( "You're signed in as %s.", 'tc-ventures-child' ),
				esc_html( $user->display_name )
			);
			?>
		</p>
		<p class="family-login__actions">
			<a class="family-gate__cta" href="<?php echo esc_url( home_url( '/family' ) ); ?>">
				<?php esc_html_e( 'Go to the family pages', 'tc-ventures-child' ); ?> <span aria-hidden="true">&rarr;</span>
			</a>
			<a class="family-login__signout" href="<?php echo esc_url( wp_logout_url( home_url( '/' ) ) ); ?>">
				<?php esc_html_e( 'Sign out', 'tc-ventures-child' ); ?>
			</a>
		</p>
		<?php
		return;
	}

	// Same-host redirect only (no open-redirect via ?redirect_to=).
	$requested = isset( $_GET['redirect_to'] ) ? esc_url_raw( wp_unslash( $_GET['redirect_to'] ) ) : home_url( '/family' );
	$redirect  = wp_validate_redirect( $requested, home_url( '/family' ) );

	wp_login_form( array(
		'redirect'       => $redirect,
		'label_username' => __( 'Username or email', 'tc-ventures-child' ),
		'label_password' => __( 'Password', 'tc-ventures-child' ),
		'label_remember' => __( 'Keep me signed in', 'tc-ventures-child' ),
		'label_log_in'   => __( 'Sign in', 'tc-ventures-child' ),
		'remember'       => true,
	) );
}
